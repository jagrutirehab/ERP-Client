import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useAuthError } from '../../../../../Components/Hooks/useAuthError';
import { useMediaQuery } from '../../../../../Components/Hooks/useMediaQuery';
import { fetchExitEmployees } from '../../../../../store/features/HR/hrSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { capitalizeWords } from '../../../../../utils/toCapitalize';
import { ExpandableText } from '../../../../../Components/Common/ExpandableText';
import { Input, Spinner } from 'reactstrap';
import Select from "react-select";
import DataTable from 'react-data-table-component';
import { renderStatusBadge } from '../../../components/renderStatusBadge';

const ExitHistory = ({ activeTab, hasUserPermission, roles }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HR);
    const handleAuthError = useAuthError();
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [limit, setLimit] = useState(10);

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


    const fetchExitEmployeeListHistory = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : !user?.centerAccess.length ? [] : [selectedCenter];

            await dispatch(fetchExitEmployees({
                page,
                limit,
                centers,
                stage: "HISTORY",
                ...search.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch Exit employee records");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "HISTORY" && hasUserPermission) {
            fetchExitEmployeeListHistory();
        }
    }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, activeTab, roles]);

    const columns = [
        {
            name: <div>ECode</div>,
            selector: row => row?.eCode || "-",
            sortable: true,
        },
        {
            name: <div>Name</div>,
            selector: row => row?.employeeName?.toUpperCase() || "-",
            wrap: true,
            minWidth: "160px",
        },
        {
            name: <div>Current Location</div>,
            selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Reason of Leaving</div>,
            selector: row => capitalizeWords(row?.reason || "-"),
            wrap: true,
            minWidth: "140px",
        },
        {
            name: <div>Other Reason (If Any)</div>,
            selector: row => (
                <ExpandableText text={capitalizeWords(row?.otherReason || "-")} />
            ),
            wrap: true,
            minWidth: "160px",
        },
        {
            name: <div>Last Working Day</div>,
            selector: row => row?.lastWorkingDay || "-",
            wrap: true,
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
            name: <div>Exit By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.exitApprovedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.exitApprovedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Exit Time</div>,
            selector: row => {
                const t = row?.exitApprovedAt;
                if (!t) return "-";
                const date = new Date(t);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px",
        },

        {
            name: <div>FNF By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.fnfApprovedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.fnfApprovedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>FNF Time</div>,
            selector: row => {
                const t = row?.fnfApprovedAt;
                if (!t) return "-";
                const date = new Date(t);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px",
        },

        {
            name: <div>Exit Note</div>,
            selector: row => <ExpandableText text={capitalizeWords(row?.exitApprovalNote || "-")} />,
            wrap: true,
            minWidth: "180px",
        },

        {
            name: <div>FNF Note</div>,
            selector: row => <ExpandableText text={capitalizeWords(row?.fnfApprovalNote || "-")} />,
            wrap: true,
            minWidth: "180px",
        },

        {
            name: <div>Status</div>,
            selector: row => renderStatusBadge(row?.stage) || "-",
            wrap: true,
            minWidth: "140px"
        }

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
                            placeholder="Search by name name or Ecode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={data}
                highlightOnHover
                pagination
                paginationServer
                paginationTotalRows={pagination?.totalDocs}
                paginationPerPage={limit}
                paginationDefaultPage={page}
                progressPending={loading}
                striped
                fixedHeader
                fixedHeaderScrollHeight="500px"
                dense={isMobile}
                responsive
                customStyles={{
                    table: {
                        style: {
                            minHeight: "450px",
                        },
                    },
                    headCells: {
                        style: {
                            backgroundColor: "#f8f9fa",
                            fontWeight: "600",
                            borderBottom: "2px solid #e9ecef",
                        },
                    },
                    rows: {
                        style: {
                            minHeight: "60px",
                            borderBottom: "1px solid #f1f1f1",
                        },
                    },
                }}
                progressComponent={
                    <div className="py-4 text-center">
                        <Spinner className="text-primary" />
                    </div>
                }
                onChangePage={(newPage) => setPage(newPage)}
                onChangeRowsPerPage={(newLimit) => setLimit(newLimit)}
            />
        </>
    )
}

export default ExitHistory;