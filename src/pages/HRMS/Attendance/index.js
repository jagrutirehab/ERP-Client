import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { Button, CardBody, Input } from "reactstrap";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import Select from "react-select";
import Header from "../../Report/Components/Header";
import { startOfDay, endOfDay } from "date-fns";
import { CloudUpload, History } from "lucide-react";
import DataTableComponent from "../components/Table/DataTable";
import { attendanceColumns } from "../components/Table/Columns/attendance";
import { fetchAttendance } from "../../../store/actions";
import { toast } from "react-toastify";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import AttendanceHistoryModal from "../components/AttendanceHistoryModal";
import AttendanceUploadModal from "../components/AttendanceUploadModal";

const Attendance = () => {
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

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader, roles } =
        usePermissions(token);

    const hasUserPermission = hasPermission(
        "HRMS",
        "HRMS_ATTENDANCE",
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

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, user?.centerAccess]);

    if (!permissionLoader && !hasUserPermission) {
        navigate("/unauthorized");
    }

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

    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">
                        ATTENDANCE MANAGEMENT
                    </h1>
                </div>

                <div className="mb-3">
                    <div className="d-none d-md-flex justify-content-between align-items-center">
                        <div className="d-flex gap-3 align-items-center">
                            <div style={{ width: "200px" }}>
                                <Select
                                    value={selectedCenterOption}
                                    onChange={(opt) =>
                                        setSelectedCenter(opt.value)
                                    }
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

                        <div className="d-flex gap-2">
                            <CheckPermission
                                accessRolePermission={roles?.permissions}
                                subAccess="HRMS_ATTENDANCE"
                                permission="read"
                            >
                                <Button
                                    color="primary"
                                    className="d-flex align-items-center gap-2 text-white"
                                    onClick={() => setIsHistoryModalOpen(true)}
                                >
                                    <History size={20} />
                                    History
                                </Button>
                            </CheckPermission>

                            <CheckPermission
                                accessRolePermission={roles?.permissions}
                                subAccess="HRMS_ATTENDANCE"
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

                    <div className="mb-3 d-flex d-md-none flex-column gap-3">

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

                        <Header
                            reportDate={reportDate}
                            setReportDate={setReportDate}
                        />

                        <Button
                            color="primary"
                            className="d-flex align-items-center justify-content-center gap-2 text-white w-100"
                            onClick={() => setIsHistoryModalOpen(true)}
                        >
                            <History size={20} />
                            History
                        </Button>

                        <CheckPermission
                            accessRolePermission={roles?.permissions}
                            subAccess="HRMS_ATTENDANCE"
                            permission="create"
                        >
                            <Button
                                color="primary"
                                className="d-flex align-items-center justify-content-center gap-2 text-white w-100"
                                onClick={() => setIsUploadModalOpen(true)}
                            >
                                <CloudUpload size={20} />
                                Upload
                            </Button>
                        </CheckPermission>

                    </div>

                </div>



                <DataTableComponent
                    columns={attendanceColumns}
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

export default Attendance;
