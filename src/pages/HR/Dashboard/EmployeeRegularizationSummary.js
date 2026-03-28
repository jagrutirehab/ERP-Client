import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CardBody, Input } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { fetchAllEmployeeRegularizations } from "../../../store/features/HR/hrSlice";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import { getMonthRange } from "../../../utils/time";
import { Calendar } from "lucide-react";
import { regularizationSummaryColumns } from "../components/columns/RegularizationSummaryColumns";

const EmployeeRegularizationSummaryDashboard = () => {
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HR);
    const handleAuthError = useAuthError();

    const isMobile = useMediaQuery("(max-width: 1000px)");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const {
        hasPermission,
        loading: permissionLoader,
    } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "REGULARIZATION_DASHBOARD", "READ");
    const columns = regularizationSummaryColumns({
        searchText: debouncedSearch,
        navigate,
        selectedMonth
    });

    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [
                {
                    value: "ALL",
                    label: "All Centers",
                    isDisabled: false,
                },
            ]
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

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, user?.centerAccess]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    const loadAllEmployeeRegularizations = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : !user?.centerAccess.length
                        ? []
                        : [selectedCenter];
            const { startDate, endDate } = getMonthRange(selectedMonth);
            await dispatch(
                fetchAllEmployeeRegularizations({
                    page,
                    limit,
                    centers,
                    startDate,
                    endDate,
                    ...(search.trim() !== "" && { search: debouncedSearch }),
                    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
            ).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch employee leave balance dashboard");
            }
        }
    };

    useEffect(() => {
        if (hasUserPermission) {
            loadAllEmployeeRegularizations();
        }
    }, [page, limit, selectedCenter, debouncedSearch, selectedMonth, user?.centerAccess]);


    if (!permissionLoader && !hasUserPermission) {
        navigate("/unathorized");
    }

    return (
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="text-center text-md-left mb-3">
                <h4 className="fw-bold text-primary">REGULARIZATION DASHBOARD</h4>
            </div>

            <div className="mb-3">
                {/*  DESKTOP VIEW */}
                <div className="d-none d-md-flex justify-content-between align-items-center">

                    <div className="d-flex gap-3 align-items-center">
                        <div style={{ width: "200px" }}>
                            <Select
                                value={selectedCenterOption}
                                onChange={(option) => {
                                    setSelectedCenter(option?.value);
                                    setPage(1);
                                }}
                                options={centerOptions}
                                placeholder="All Centers"
                                classNamePrefix="react-select"
                            />
                        </div>

                        <div style={{ width: "220px" }}>
                            <Input
                                type="text"
                                className="form-control"
                                placeholder="Search by name or Ecode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

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

                    <RefreshButton loading={loading} onRefresh={loadAllEmployeeRegularizations} />
                </div>

                {/*  MOBILE VIEW */}
                <div className="d-flex d-md-none flex-column gap-3">
                    <div style={{ width: "100%" }}>
                        <Select
                            value={selectedCenterOption}
                            onChange={(option) => {
                                setSelectedCenter(option?.value);
                                setPage(1);
                            }}
                            options={centerOptions}
                            placeholder="All Centers"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div style={{ width: "100%" }}>
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

                    <div style={{ width: "100%" }}>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="Search by name or Ecode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <RefreshButton loading={loading} onRefresh={loadAllEmployeeRegularizations} />
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <DataTableComponent columns={columns}
                    data={data}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    loading={loading}
                    pagination={pagination}
                />
            </div>
        </CardBody>
    )
}

export default EmployeeRegularizationSummaryDashboard;