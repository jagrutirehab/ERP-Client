import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { Button, CardBody, Input, Spinner, UncontrolledTooltip } from "reactstrap";
import CheckPermission from "../../../../Components/HOC/CheckPermission";
import Select from "react-select";
import Header from "../../../Report/Components/Header";
import { startOfDay, endOfDay } from "date-fns";
import { CloudUpload, FileSpreadsheet, History, RotateCw } from "lucide-react";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { attendanceColumns } from "../../components/Table/Columns/attendance";
import { fetchAttendance } from "../../../../store/actions";
import { toast } from "react-toastify";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import AttendanceHistoryModal from "../../components/AttendanceHistoryModal";
import AttendanceUploadModal from "../../components/AttendanceUploadModal";
import { downloadAttendanceTemplate } from "../../../../helpers/backend_helper";

const AttendanceLogs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data, pagination, loading } = useSelector((state) => state.HRMS);
    const user = useSelector((state) => state.User);

    const handleAuthError = useAuthError();
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [reportDate, setReportDate] = useState({
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
    });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isTemplateGenerating, setIsTemplateGenerating] = useState(false);

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader, roles } =
        usePermissions(token);

    const hasUserPermission = hasPermission(
        "HR",
        "ATTENDANCE_LOG",
        "READ"
    );

    const fetchEmployeeAttendance = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : [selectedCenter];

            await dispatch(
                fetchAttendance({
                    page,
                    limit,
                    search,
                    centers,
                    startDate: reportDate.start,
                    endDate: reportDate.end,
                    ...debouncedSearch.trim() !== "" && { search: debouncedSearch }
                })
            ).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(
                    error.message || "Failed to fetch attendance"
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
        fetchEmployeeAttendance();
    }, [
        page,
        limit,
        selectedCenter,
        reportDate.start,
        reportDate.end,
        hasUserPermission,
        debouncedSearch,
        user?.centerAccess
    ]);


    useEffect(() => {
        setPage(1);
    }, [
        selectedCenter,
        reportDate.start,
        reportDate.end,
        limit,
        debouncedSearch
    ]);

    const handleDownloadXlsxTemplate = async () => {
        setIsTemplateGenerating(true);
        try {
            const res = await downloadAttendanceTemplate();

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "HRMS-attendance-template.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error("Something went wrong while generating template");
            }
        } finally {
            setIsTemplateGenerating(false);
        }
    }

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, user?.centerAccess]);

    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [{ value: "ALL", label: "All Centers" }]
            : []),
        ...(user?.centerAccess?.map((id) => {
            const center = user?.userCenters?.find((c) => c._id === id);
            return {
                value: id,
                label: center?.title || "Unknown Center",
            };
        }) || []),
    ];

    const selectedCenterOption =
        centerOptions.find((opt) => opt.value === selectedCenter) ||
        centerOptions[0];

    const columns = attendanceColumns({
        searchText: debouncedSearch
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
                    <h1 className="display-6 fw-bold text-primary">
                        ATTENDANCE LOG
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
                            <Header
                                reportDate={reportDate}
                                setReportDate={setReportDate}
                            />
                        </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                        <Button
                            id="refresh-data-btn"
                            color="light"
                            size="sm"
                            disabled={loading}
                            onClick={fetchEmployeeAttendance}
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
                            className="d-flex align-items-center gap-2 text-white"
                            onClick={() => setIsHistoryModalOpen(true)}
                        >
                            <History size={20} />
                            History
                        </Button>

                        <Button
                            color="primary"
                            className="d-flex align-items-center gap-2 text-white"
                            disabled={isTemplateGenerating}
                            onClick={handleDownloadXlsxTemplate}
                        >
                            {isTemplateGenerating ? <Spinner size={"sm"} /> : <FileSpreadsheet size={20} />}
                            Download Template
                        </Button>

                        <CheckPermission
                            accessRolePermission={roles?.permissions}
                            subAccess="ATTENDANCE_LOG"
                            permission="create"
                        >
                            <Button
                                color="primary"
                                className="d-flex align-items-center gap-2 text-white"
                                onClick={() => setIsUploadModalOpen(true)}
                            >
                                <CloudUpload size={20} />
                                Import
                            </Button>
                        </CheckPermission>
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
                        placeholder="Search by name, eCode, biometric ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <Header
                        reportDate={reportDate}
                        setReportDate={setReportDate}
                    />

                    <div className="d-flex gap-2">
                        <Button
                            color="primary"
                            className="d-flex align-items-center justify-content-center gap-2 text-white w-50"
                            onClick={() => setIsHistoryModalOpen(true)}
                        >
                            History
                        </Button>

                        <Button
                            color="primary"
                            className="d-flex align-items-center gap-2 text-white"
                            disabled={isTemplateGenerating}
                            onClick={handleDownloadXlsxTemplate}
                        >
                            {isTemplateGenerating && <Spinner size={"sm"} />}
                            Download Template
                        </Button>

                        <CheckPermission
                            accessRolePermission={roles?.permissions}
                            subAccess="ATTENDANCE_LOG"
                            permission="create"
                        >
                            <Button
                                color="primary"
                                className="d-flex align-items-center justify-content-center gap-2 text-white w-50"
                                onClick={() => setIsUploadModalOpen(true)}
                            >
                                Upload
                            </Button>
                        </CheckPermission>
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
            </CardBody>

            <AttendanceHistoryModal
                isOpen={isHistoryModalOpen}
                toggle={() => setIsHistoryModalOpen(!isHistoryModalOpen)}
                importType="LOGS"
            />

            <AttendanceUploadModal
                isOpen={isUploadModalOpen}
                toggle={() => setIsUploadModalOpen(!isUploadModalOpen)}
                onRefresh={() => {
                    setPage(1);
                    fetchEmployeeAttendance();
                }}
            />
        </>
    );
};

export default AttendanceLogs;
