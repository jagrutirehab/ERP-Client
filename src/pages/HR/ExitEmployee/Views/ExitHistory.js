import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import { fetchExitEmployees } from '../../../../store/features/HR/hrSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { capitalizeWords } from '../../../../utils/toCapitalize';
import { ExpandableText } from '../../../../Components/Common/ExpandableText';
import { Badge, Input, Spinner } from 'reactstrap';
import Select from "react-select";
import DataTable from 'react-data-table-component';

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
                status: "HISTORY",
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
            selector: row => `${row?.eCode?.prefix || ""}${row?.eCode?.value || "-"}`,
            sortable: true,
        },
        {
            name: <div>Name</div>,
            selector: row => row?.name.toUpperCase() || "-",
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
            name: <div>Reason of Leaving</div>,
            selector: row => capitalizeWords(row?.exitWorkflow?.reason || "-"),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Other Reason(If Any)</div>,
            selector: row => <ExpandableText text={capitalizeWords(row?.exitWorkflow?.otherReason || "-")} />,
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Last Working Day</div>,
            selector: row => row?.exitWorkflow?.lastWorkingDay || "-",
            wrap: true,
        },
        {
            name: <div>Filled By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.exitWorkflow?.filledBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.exitWorkflow?.filledBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "150px"
        },
        {
            name: <div>Filled At</div>,
            selector: row => {
                const filledAt = row?.exitWorkflow?.filledAt;
                if (!filledAt) return "-";
                const date = new Date(filledAt);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth:"150px"
        },
        {
            name: <div>Action Taken By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.exitWorkflow?.actedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.exitWorkflow?.actedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "150px"
        },
        {
            name: <div>Action Taken At</div>,
            selector: row => {
                const actedAt = row?.exitWorkflow?.actedAt;
                if (!actedAt) return "-";
                const date = new Date(actedAt);
                if (isNaN(date)) return "-";

                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth:"150px"
        },
        {
            name: <div>Action Note</div>,
            selector: row => <ExpandableText text={capitalizeWords(row?.exitWorkflow?.actionNote || "-")} />,
            wrap: true,
        },
        {
            name: <div>Status</div>,
            selector: row => {
                const status = row?.exitWorkflow?.status;
                if (status === "APPROVED") {
                    return <Badge color="success">Approved</Badge>;
                }

                if (status === "REJECTED") {
                    return <Badge color="danger">Rejected</Badge>;
                }

                return "-";
            },
            wrap: true,
        }
    ]

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

export default ExitHistory