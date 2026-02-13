import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Select from "react-select";
import { Button, CardBody, Input, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, UncontrolledTooltip } from 'reactstrap';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { usePermissions } from '../../../../Components/Hooks/useRoles';
import { format } from 'date-fns';
import { Calendar, CloudUpload, FileSpreadsheet, History, RotateCw } from 'lucide-react';
import { downloadMonthlyPayrollTemplate } from '../../../../helpers/backend_helper';
import MonthlyAttendanceUploadModal from '../../components/MonthlyAttendanceUploadModal';
import { toast } from 'react-toastify';
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import DataTableComponent from '../../../../Components/Common/DataTable';
import { attendanceMonthlyColumns } from '../../components/Table/Columns/AttendanceMonthly';
import { fetchMonthlyAttendance } from '../../../../store/features/HR/hrSlice';
import { getMonthRange } from '../../../../utils/time';
import RefreshButton from '../../../../Components/Common/RefreshButton';
import AttendanceHistoryModal from '../../components/AttendanceHistoryModal';

const AttendanceMonthly = () => {
    const dispatch = useDispatch();

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateMonth, setTemplateMonth] = useState(new Date());
    const [templateCenter, setTemplateCenter] = useState(null);
    const [isTemplateGenerating, setIsTemplateGenerating] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const isMobile = useMediaQuery("(max-width: 1000px)");

    const handleAuthError = useAuthError();
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader } =
        usePermissions(token);
    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HR);

    const hasUserPermission = hasPermission(
        "HR",
        "MONTHLY_ATTENDANCE",
        "READ"
    );

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, centerAccess]);

    const centerOptions = [
        ...(centerAccess?.length > 1
            ? [{ value: "ALL", label: "All Centers" }]
            : []),
        ...(centerAccess?.map((id) => {
            const center = userCenters?.find((c) => c._id === id);
            return {
                value: id,
                label: center?.title || "Unknown Center",
            };
        }) || []),
    ];

    const templateCenterOptions =
        (centerAccess?.map((id) => {
            const center = userCenters?.find((c) => c._id === id);
            return {
                value: id,
                label: center?.title || "Unknown Center",
            };
        }) || []);

    const selectedCenterOption =
        centerOptions.find((opt) => opt.value === selectedCenter) ||
        centerOptions[0];

    const selectedTemplateCenterOption =
        templateCenterOptions.find((opt) => opt.value === templateCenter) ||
        null;

    const centers =
        selectedCenter === "ALL"
            ? centerAccess
            : [selectedCenter];

    const fetchEmployeeAttendanceMonthly = async () => {
        try {
            const { startDate, endDate } = getMonthRange(selectedMonth);
            await dispatch(
                fetchMonthlyAttendance({
                    page,
                    limit,
                    search,
                    centers,
                    startDate,
                    endDate
                })
            ).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "something went wrong while fetching attendance summary");
            }
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        if (hasUserPermission) {
            fetchEmployeeAttendanceMonthly();
        }
    }, [
        page,
        limit,
        selectedCenter,
        selectedMonth,
        hasUserPermission,
        debouncedSearch,
        centerAccess
    ]);

    useEffect(() => {
        setPage(1);
    }, [
        selectedCenter,
        selectedMonth,
        limit,
        debouncedSearch
    ]);

    const handleDownloadXlsxTemplate = async () => {
        setIsTemplateGenerating(true);
        try {
            const res = await downloadMonthlyPayrollTemplate({
                month: format(templateMonth, "yyyy-MM"),
                centerId: templateCenter || undefined,
            });

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `payroll_monthly_template_${format(
                templateMonth,
                "MMMM_yyyy"
            ).toLowerCase()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setIsTemplateModalOpen(false);
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error("Something went wrong while generating template");
            }
        } finally {
            setIsTemplateGenerating(false);
        }
    }

    const toggleTemplateModal = () => {
        setIsTemplateModalOpen((prev) => !prev);

        if (!isTemplateModalOpen) {
            setTemplateCenter(null);
            setTemplateMonth(new Date());
        }
    };

    const toggleUploadModal = () => {
        setIsUploadModalOpen((prev) => !prev);
    };


    const columns = attendanceMonthlyColumns({
        searchText: debouncedSearch
    })
    if (!permissionLoader && !hasUserPermission) {
        return <Navigate to="/unauthorized" replace />;
    }


    return (
        <CardBody className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="text-center text-md-left mb-4">
                <h1 className="display-6 fw-bold text-primary">
                    MONTHLY ATTENANCE
                </h1>
            </div>

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
                            placeholder="Search by name, biometric ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ minWidth: "150px" }}>
                        <div className="d-flex align-items-center gap-2 ms-auto">
                            <div className="position-relative month-picker">
                                <Calendar
                                    size={14}
                                    className="position-absolute calendar-icon"
                                />

                                <Flatpickr
                                    value={selectedMonth}
                                    disabled={loading}
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
                    </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                    <RefreshButton
                        onRefresh={fetchEmployeeAttendanceMonthly}
                        loading={loading}
                    />
                    <Button
                        color="primary"
                        className="d-flex align-items-center gap-2 text-white"
                        onClick={() => setIsHistoryModalOpen(true)}
                    >
                        <History size={20} />
                        History
                    </Button>
                    <Button
                        color="primary"
                        className="d-flex align-items-center gap-1 text-white"
                        onClick={toggleUploadModal}
                    >
                        <CloudUpload size={20} />
                        Import
                    </Button>
                    <Button
                        color="primary"
                        className="d-flex align-items-center gap-1 text-white"
                        disabled={centers.length === 0}
                        onClick={toggleTemplateModal}
                    >
                        <FileSpreadsheet size={20} />
                        Download Template
                    </Button>
                </div>
            </div>

            {/* Mobile */}
            <div className="mb-3 d-flex d-md-none flex-column gap-3">
                <Select
                    value={selectedCenterOption}
                    onChange={(opt) => setSelectedCenter(opt.value)}
                    options={centerOptions}
                    classNamePrefix="react-select"
                />

                <Input
                    type="text"
                    placeholder="Search by name, ECode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="d-flex align-items-center gap-2 ms-auto">
                    <div className="position-relative month-picker">
                        <Calendar
                            size={14}
                            className="position-absolute calendar-icon"
                        />

                        <Flatpickr
                            value={selectedMonth}
                            disabled={loading}
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

                <div className="d-flex justify-content-end gap-2">
                    <RefreshButton
                        onRefresh={fetchEmployeeAttendanceMonthly}
                        loading={loading}
                    />
                    <Button
                        color="primary"
                        className="d-flex align-items-center gap-1 text-white"
                        onClick={toggleUploadModal}
                    >
                        <CloudUpload size={20} />
                        Import
                    </Button>
                    <Button
                        color="primary"
                        className="d-flex align-items-center gap-1 text-white"
                        disabled={centers.length === 0}
                        onClick={toggleTemplateModal}
                    >
                        <FileSpreadsheet size={20} />
                        Download Template
                    </Button>
                </div>

            </div>
            <DataTableComponent
                columns={columns}
                data={data}
                page={page}
                setPage={setPage}
                limit={limit}
                setLimit={setLimit}
                loading={loading}
                pagination={pagination}
            />

            <Modal
                isOpen={isTemplateModalOpen}
                toggle={toggleTemplateModal}
            >
                <ModalHeader toggle={toggleTemplateModal}>
                    Download Monthly Template
                </ModalHeader>

                <ModalBody>
                    <div className="d-flex flex-column gap-3">

                        <div>
                            <label className="form-label fw-semibold">
                                Select Center
                            </label>
                            <Select
                                value={selectedTemplateCenterOption}
                                onChange={(opt) => setTemplateCenter(opt.value)}
                                options={templateCenterOptions}
                                classNamePrefix="react-select"
                                placeholder="Select center"
                                isDisabled={templateCenterOptions.length === 0}
                            />
                        </div>

                        <div>
                            <label className="form-label fw-semibold">
                                Select Month
                            </label>
                            <Flatpickr
                                value={templateMonth}
                                options={{
                                    plugins: [
                                        monthSelectPlugin({
                                            shorthand: false,
                                            dateFormat: "Y-m",
                                            altFormat: "F Y",
                                        }),
                                    ],
                                    altInput: true,
                                    disableMobile: true,
                                }}
                                onChange={([date]) => setTemplateMonth(date)}
                                className="form-control"
                            />
                        </div>

                    </div>
                </ModalBody>


                <ModalFooter>
                    <Button
                        color="light"
                        onClick={toggleTemplateModal}
                        disabled={isTemplateGenerating}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleDownloadXlsxTemplate}
                        disabled={isTemplateGenerating || !templateCenter || !templateMonth}
                        className="text-white"
                    >
                        {isTemplateGenerating ? <Spinner size={"sm"} /> : "Download"}
                    </Button>
                </ModalFooter>
            </Modal>

            <MonthlyAttendanceUploadModal
                isOpen={isUploadModalOpen}
                toggle={toggleUploadModal}
                onRefresh={fetchEmployeeAttendanceMonthly}
            />

            <AttendanceHistoryModal
                isOpen={isHistoryModalOpen}
                toggle={() => setIsHistoryModalOpen(!isHistoryModalOpen)}
                importType="MONTHLY"
            />
        </CardBody>
    )
}

export default AttendanceMonthly;
