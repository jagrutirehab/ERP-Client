import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useEffect, useState } from "react";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { fetchEmployeeTransfers } from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { format } from "date-fns";
import { Input } from "reactstrap";
import Select from "react-select";
import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import DataTableComponent from "../../../../../Components/Common/DataTable";
import { useSearchParams } from "react-router-dom";



const PendingApprovals = ({ activeTab }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HR);
    const handleAuthError = useAuthError();
     const [searchParams, setSearchParams] = useSearchParams();
    const querySearch = searchParams.get("q") || "";
    const queryCenter = searchParams.get("center") || "ALL";
    const [search, setSearch] = useState(querySearch);
    const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
    const [selectedCenter, setSelectedCenter] = useState(queryCenter);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "TRANSFER_EMPLOYEE_CURRENT_LOCATION_APPROVAL", "READ");

    const isMobile = useMediaQuery("(max-width: 1000px)");

    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [{
                value: "ALL",
                label: "All Centers",
                isDisabled: false,
            }]
            : []
        ),
        ...(
            user?.centerAccess?.map(id => {
                const center = user?.userCenters?.find(c => c._id === id);
                return {
                    value: id,
                    label: center?.title || "Unknown Center"
                };
            }) || []
        )
    ];

    const selectedCenterOption = centerOptions.find(
        opt => opt.value === selectedCenter
    ) || centerOptions[0];

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

    useEffect(() => {
        const q = searchParams.get("q") || "";
        const c = searchParams.get("center") || "ALL";
        setSearch(q);
        setDebouncedSearch(q);
        setSelectedCenter(c);
        setPage(1);
    }, [activeTab]);

    const fetchEmployeeTransferHistory = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : !user?.centerAccess.length ? [] : [selectedCenter];

            await dispatch(fetchEmployeeTransfers({
                page,
                limit,
                centers,
                view: "TRANSFER_LOCATION_HISTORY",
                ...search.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch advance salary records");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "HISTORY" && hasUserPermission) {
            fetchEmployeeTransferHistory();
        }
    }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, activeTab]);

    const columns = [
        {
            name: <div>ECode</div>,
            selector: row => row?.employee?.eCode || "-",
            sortable: true,
        },
        {
            name: <div>Name</div>,
            selector: row => row?.employee?.name?.toUpperCase() || "-",
            wrap: true,
            minWidth: "160px"
        },
        {
            name: <div>Current Location</div>,
            selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Mobile Number</div>,
            selector: row => row?.employee?.mobile,
            wrap: true,
            minWidth: "140px"
        },
        {
            name: <div>Date Of Transfer</div>,
            selector: row => {
                if (!row?.transferDate) return "-";

                const date = new Date(row.transferDate);
                if (isNaN(date.getTime())) return "-";

                return format(date, "dd MMM yyyy");
            },
            wrap: true,
        },
        {
            name: <div>Transfer Location</div>,
            selector: row => capitalizeWords(row?.transferLocation?.title || "-"),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Filled By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.filledBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.filledBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Filled At</div>,
            selector: row => {
                if (!row?.filledAt) return "-";
                const date = new Date(row.filledAt);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px",
        },
        {
            name: <div>Current Location Action By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.currentLocationApproval?.actedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.currentLocationApproval?.actedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Current Location Note</div>,
            selector: row => <ExpandableText text={row?.currentLocationApproval?.note || "-"} />,
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Current location Action At</div>,
            selector: row => {
                if (!row?.currentLocationApproval?.actedAt) return "-";
                const date = new Date(row?.currentLocationApproval?.actedAt);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px",
        },
        {
            name: <div>Action By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.transferLocationApproval?.actedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.currentLocationApproval?.actedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Note</div>,
            selector: row => <ExpandableText text={row?.transferLocationApproval?.note || "-"} />,
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Action At</div>,
            selector: row => {
                if (!row?.currentLocationApproval?.actedAt) return "-";
                const date = new Date(row?.transferLocationApproval?.actedAt);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px",
        },
    ];

    return (
        <>
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

                    </div>

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
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="Search by name or Ecode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <DataTableComponent
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                page={page}
                setPage={setPage}
                limit={limit}
                setLimit={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
            />
        </>
    )
}

export default PendingApprovals;