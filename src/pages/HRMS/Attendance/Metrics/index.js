import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CardBody, Input } from 'reactstrap';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import Header from '../../../Report/Components/Header';
import Select from "react-select";
import { usePermissions } from '../../../../Components/Hooks/useRoles';
import { endOfDay, startOfDay } from 'date-fns';
import DataTableComponent from '../../components/Table/DataTable';
import { fetchAttendanceMetrics } from '../../../../store/features/HRMS/hrmsSlice';
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { toast } from 'react-toastify';
import { attendanceMetricsColumns } from '../../components/Table/Columns/attendanceMetrics';

const sortByOptions = [
    { value: "avgDuration", label: "Sort By Average Duration" },
    { value: "totalDaysPresent", label: "Sort By Days Present" },
    { value: "totalDaysAbsent", label: "Sort By Days Absent" },
];

const AttendanceMetrics = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [sortBy, setSortBy] = useState("avgDuration");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [reportDate, setReportDate] = useState({
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
    });

    const isMobile = useMediaQuery("(max-width: 1000px)");

    const handleAuthError = useAuthError();
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader, roles } =
        usePermissions(token);
    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HRMS);

    const hasUserPermission = hasPermission(
        "HRMS",
        "ATTENDANCE_METRICS",
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

    const selectedCenterOption =
        centerOptions.find((opt) => opt.value === selectedCenter) ||
        centerOptions[0];

    const fetchEmployeeAttendanceMetrics = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? centerAccess
                    : [selectedCenter];

            await dispatch(
                fetchAttendanceMetrics({
                    page,
                    limit,
                    search,
                    centers,
                    startDate: reportDate.start,
                    endDate: reportDate.end,
                    sortBy,
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
        fetchEmployeeAttendanceMetrics();
    }, [
        page,
        limit,
        selectedCenter,
        reportDate.start,
        reportDate.end,
        hasUserPermission,
        debouncedSearch,
        centerAccess,
        sortBy
    ]);

    useEffect(() => {
        setPage(1);
    }, [
        selectedCenter,
        reportDate.start,
        reportDate.end,
        limit,
        debouncedSearch,
        sortBy
    ]);

    if (!permissionLoader && !hasUserPermission) {
        navigate("/unauthorized");
    }

    return (
        <CardBody className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="text-center text-md-left mb-4">
                <h1 className="display-6 fw-bold text-primary">
                    ATTENDANCE METRICS
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

                    <div style={{ width: "220px" }}>
                        <Select
                            value={sortByOptions.find(opt => opt.value === sortBy)}
                            onChange={(opt) => setSortBy(opt.value)}
                            options={sortByOptions}
                            classNamePrefix="react-select"
                            isSearchable={false}
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
                    placeholder="Search by name, biometric ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Header
                    reportDate={reportDate}
                    setReportDate={setReportDate}
                />

            </div>
            <DataTableComponent
                columns={attendanceMetricsColumns}
                data={data}
                page={page}
                setPage={setPage}
                limit={limit}
                setLimit={setLimit}
                loading={loading}
                pagination={pagination}
            />
        </CardBody>
    )
}

export default AttendanceMetrics;