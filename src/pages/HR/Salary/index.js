import { useEffect, useState } from 'react'
import { Button, CardBody, Input, Spinner, UncontrolledTooltip, Row, Col, Alert, Progress } from 'reactstrap';
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery';
import { useAuthError } from '../../../Components/Hooks/useAuthError';
import Select from "react-select";
import { useDispatch, useSelector } from 'react-redux';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Calendar, RotateCcw, RotateCw, X } from 'lucide-react';
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import { toast } from 'react-toastify';
import { editPayrollRemarks, fetchPayrolls } from '../../../store/features/HR/hrSlice';
import DataTableComponent from '../../../Components/Common/DataTable';
import { usePermissions } from '../../../Components/Hooks/useRoles';
import { salaryColumns } from '../../HRMS/components/Table/Columns/salary';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { exportPayrollsXLSX, generatePayroll, getPayrollGenerationStatus } from '../../../helpers/backend_helper';
import { legends } from '../../../Components/constants/HR';
import ApproveModal from '../components/ApproveModal';

const PayrollLegend = () => {
    return (
        <Row className="g-3 align-items-center">
            {legends.map((item) => (
                <Col key={item.label} xs="auto" className="d-flex align-items-center gap-1">
                    <span
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: item.color,
                            display: "inline-block",
                        }}
                    />
                    <span className="small fw-medium">{item.label}</span>
                </Col>
            ))}
        </Row>
    );
};


const PayrollJobStatus = ({ job }) => {
    if (!job?.status) return null;

    const isRunning = job.status === "active" || job.status === "waiting";

    // auto-hide after completion / failure
    if (!isRunning) return null;

    const progress = Math.min(Math.max(job.progress ?? 0, 0), 100);

    return (
        <div className="mb-2">
            <Progress
                value={progress}
                striped
                animated
                color="primary"
                style={{ height: "6px", borderRadius: "4px" }}
            />
            <div className="d-flex justify-content-between mt-1">
                <span className="small text-muted">Generating payroll…</span>
                <span className="small fw-semibold text-muted">
                    {progress}%
                </span>
            </div>
        </div>
    );
};

const Salary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const handleAuthError = useAuthError();
    const dispatch = useDispatch();
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [copyId, setCopyId] = useState(null);
    const [regenerateLoading, setRegenerateLoading] = useState(false);
    const [regenerationMeta, setRegenerationMeta] = useState({
        status: null,
        progress: 0,
        error: null,
    });
    const [modalLoading, setModalLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [selectedPayrollId, setSelectedPayrollId] = useState("");
    const [isExcelGenerating, setIsExcelGenerating] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const jobId = searchParams.get("jobId");

    const isMobile = useMediaQuery("(max-width: 1000px)");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader } =
        usePermissions(token);

    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HR);

    const hasUserPermission = hasPermission(
        "HR",
        "SALARY",
        "READ"
    );

    const hasEditPermission = hasPermission("HR", "SALARY", "WRITE") || hasPermission("HR", "SALARY", "DELETE");

    const centerOptions = [
        ...(centerAccess?.length > 1
            ? [
                {
                    value: "ALL",
                    label: "All Centers",
                    isDisabled: false,
                },
            ]
            : []),
        ...(centerAccess?.map((id) => {
            const center = userCenters?.find((c) => c._id === id);
            return {
                value: id,
                label: center?.title || "Unknown Center",
            };
        }) || []),
    ];

    const selectedCenterOption =
        centerOptions.find((opt) => opt.value === selectedCenter) ||
        centerOptions[0];


    const centers =
        selectedCenter === "ALL"
            ? centerAccess
            : [selectedCenter];

    const fetchEmployeePayrolls = async () => {
        try {
            await dispatch(fetchPayrolls({
                page,
                limit,
                search,
                centers,
                startDate: startOfMonth(selectedMonth),
                endDate: endOfMonth(selectedMonth),
                ...debouncedSearch.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(
                    error.message || "Failed to fetch payrolls"
                );
            }
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        if (!hasUserPermission) return;
        fetchEmployeePayrolls();
    }, [
        page,
        limit,
        selectedCenter,
        selectedMonth,
        debouncedSearch,
        centerAccess,
    ]);

    useEffect(() => {
        setPage(1);
    }, [
        selectedCenter,
        selectedMonth,
        limit,
        debouncedSearch,
    ]);

    const handleRegeneratePayroll = async () => {
        setRegenerateLoading(true);
        try {
            const response = await generatePayroll({
                regenerate: true,
                centers,
                startDate: startOfMonth(selectedMonth),
                endDate: endOfMonth(selectedMonth),
            });

            const jobId = response?.jobId;

            const params = new URLSearchParams(location.search);
            params.set("jobId", jobId);

            navigate(`${location.pathname}?${params.toString()}`, {
                replace: true,
            });
            toast.success("Regeneration triggerd successfully, please wait for sometime to populate the data");
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error("Failed to regenrate payrolls")
            }
        } finally {
            setRegenerateLoading(false);
        }
    }

    const handleUpdate = async () => {
        setModalLoading(true);
        try {
            await dispatch(
                editPayrollRemarks({ id: selectedPayrollId, remarks })
            ).unwrap();
            toast.success("Remarks updated successfully");
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Failed to update the remarks");
            }
        } finally {
            setModalOpen(false);
            setModalLoading(false);
        }
    }

    const handleExportXLSX = async () => {
        setIsExcelGenerating(true);
        try {
            const response = await exportPayrollsXLSX({
                search,
                centers,
                startDate: startOfMonth(selectedMonth),
                endDate: endOfMonth(selectedMonth),
                ...debouncedSearch.trim() !== "" && { search: debouncedSearch }
            });

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `Salary-Master-Sheet-${format(selectedMonth, "MMMM-yyyy")}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Something went wrong while generating xlsx file");
            }
        } finally {
            setIsExcelGenerating(false);
        }
    }

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyId(id);

            setTimeout(() => setCopyId(null), 1500);
        } catch (err) {
            console.error("Copy failed", err);
        }
    };

    useEffect(() => {
        if (!jobId) return;

        const interval = setInterval(async () => {
            setRegenerateLoading(true);
            try {
                const response = await getPayrollGenerationStatus(jobId);
                const { status, progress, failedReason } = response;

                setRegenerationMeta({
                    status,
                    progress: progress ?? 0,
                    error: failedReason ?? null,
                });

                if (status === "completed" || status === "failed") {
                    clearInterval(interval);
                    const params = new URLSearchParams(searchParams);
                    params.delete("jobId");
                    setSearchParams(params, { replace: true });
                    if (status === "completed") {
                        toast.success("Payroll data regenerated successfully");
                    } else {
                        toast.error("payroll data regeneration failed");
                    }
                    setRegenerateLoading(false);
                }

            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error.message || "Something went wrong");
                }
                setRegenerateLoading(false)
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [jobId]);


    const columns = salaryColumns({
        searchText: debouncedSearch,
        onCopy: handleCopy,
        copyId,
        onOpen: (payroll) => {
            setSelectedPayrollId(payroll._id);
            setRemarks(payroll.remarks);
            setModalOpen(true);
        },
        hasEditPermission
    });


    if (!permissionLoader && !hasUserPermission) {
        navigate("/unauthorized");
    }

    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">SALARY</h1>
                </div>

                <div className="mb-3">
                    <div className="mb-3 d-none d-md-block">
                        {/* Desktop */}
                        <div className="d-flex gap-3 align-items-center mb-2">
                            <div style={{ width: "200px" }}>
                                <Select
                                    value={selectedCenterOption}
                                    onChange={(opt) => setSelectedCenter(opt.value)}
                                    options={centerOptions}
                                    classNamePrefix="react-select"
                                />
                            </div>


                            <div style={{ minWidth: "220px" }}>
                                <Input
                                    type="text"
                                    placeholder="Search by name, ECode..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div style={{ minWidth: "150px" }}>
                                <div className="position-relative month-picker">
                                    <Calendar
                                        size={14}
                                        className="position-absolute calendar-icon"
                                    />

                                    <Flatpickr
                                        value={selectedMonth}
                                        // disabled={loading}
                                        options={{
                                            plugins: [
                                                monthSelectPlugin({
                                                    shorthand: false,
                                                    dateFormat: "Y-m",
                                                    altFormat: "F Y",
                                                }),
                                            ],
                                            altInput: true,
                                            disableMobile: true
                                        }}
                                        onChange={([date]) => setSelectedMonth(date)}
                                        className="form-control form-control-sm"
                                    />
                                </div>
                            </div>
                            <div style={{ minWidth: "220px" }}>
                                <PayrollJobStatus key={jobId || "idle"} job={regenerationMeta} />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <PayrollLegend />
                            <Button
                                id="refresh-data-btn"
                                color="light"
                                size="sm"
                                disabled={loading}
                                onClick={fetchEmployeePayrolls}
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: 34, height: 34 }}
                            >
                                <RotateCw
                                    size={14}
                                    style={{
                                        animation: loading ? "spin 1s linear infinite" : "none",
                                    }}
                                />
                            </Button>

                            <UncontrolledTooltip target="refresh-data-btn">
                                Refresh
                            </UncontrolledTooltip>
                            <Button
                                color="primary"
                                className="d-flex align-items-center gap-1 text-white"
                                onClick={handleRegeneratePayroll}
                                disabled={regenerateLoading}
                            >
                                {regenerateLoading ? <Spinner size="sm" /> : <RotateCcw size={16} />}
                                Regenerate
                            </Button>
                            <Button
                                color="primary"
                                className="d-flex align-items-center gap-1 text-white"
                                onClick={handleExportXLSX}
                                disabled={regenerateLoading}
                            >
                                {isExcelGenerating ? <Spinner size="sm" /> : <i className="ri-file-excel-2-line" />}
                                Export Excel
                            </Button>
                        </div>
                    </div>

                    {/* Mobile */}
                    <div className="mb-3 d-flex d-md-none flex-column gap-3">
                        <PayrollJobStatus key={jobId || "idle"} job={regenerationMeta} />
                        <Select
                            value={selectedCenterOption}
                            onChange={(opt) => setSelectedCenter(opt.value)}
                            options={centerOptions}
                            classNamePrefix="react-select"
                        />

                        <Input
                            type="text"
                            placeholder="Search by name, biometric ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="position-relative month-picker">
                            <Calendar
                                size={14}
                                className="position-absolute calendar-icon"
                            />

                            <Flatpickr
                                value={selectedMonth}
                                // disabled={loading}
                                options={{
                                    plugins: [
                                        monthSelectPlugin({
                                            shorthand: false,
                                            dateFormat: "Y-m",
                                            altFormat: "F Y",
                                        }),
                                    ],
                                    altInput: true,
                                    disableMobile: true
                                }}
                                onChange={([date]) => setSelectedMonth(date)}
                                className="form-control form-control-sm"
                            />
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                id="refresh-data-btn"
                                color="light"
                                size="sm"
                                disabled={loading}
                                onClick={fetchEmployeePayrolls}
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: 34, height: 34 }}
                            >
                                <RotateCw
                                    size={14}
                                    style={{
                                        animation: loading ? "spin 1s linear infinite" : "none",
                                    }}
                                />
                            </Button>

                            <UncontrolledTooltip target="refresh-data-btn">
                                Refresh
                            </UncontrolledTooltip>
                            <Button
                                color="primary"
                                className="d-flex align-items-center gap-1 text-white"
                                onClick={handleRegeneratePayroll}
                            >
                                {regenerateLoading ? <Spinner size="sm" /> : <RotateCcw size={16} />}
                                Regenerate
                            </Button>
                            <Button
                                color="primary"
                                className="d-flex align-items-center gap-1 text-white"
                                onClick={() => { }}
                            >
                                {isExcelGenerating ? <Spinner size="sm" /> : <i className="ri-file-excel-2-line" />}
                                Export Excel
                            </Button>
                        </div>
                        <PayrollLegend />
                    </div>
                    <DataTableComponent columns={columns}
                        data={data}
                        page={page}
                        setPage={setPage}
                        limit={limit}
                        setLimit={setLimit}
                        loading={loading || permissionLoader}
                        pagination={pagination} />
                </div>
                <ApproveModal
                    isOpen={modalOpen}
                    toggle={() => setModalOpen(!modalOpen)
                    }
                    onSubmit={handleUpdate}
                    loading={modalLoading}
                    remarks={remarks}
                    setRemarks={setRemarks}
                    mode="SALARY"
                />
            </CardBody>
            <style>
                {`
        .month-picker .calendar-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
            pointer-events: none;
            z-index: 2;
        }

        .month-picker input,
        .month-picker .flatpickr-input {
            padding-left: 38px !important;
            height: 32px;
            line-height: 32px;
        }
        `}
            </style>
        </>
    )
}

export default Salary;
