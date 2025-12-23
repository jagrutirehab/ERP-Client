import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useEffect, useState } from "react";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { fetchITApprovals } from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { Input, Spinner } from "reactstrap";
import { format } from "date-fns";
import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { renderStatusBadge } from "../../../components/renderStatusBadge";


const customStyles = {
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
};

const ApprovalHistory = ({ activeTab, hasUserPermission, roles }) => {
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

    const fetchITApprovalHistory = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : !user?.centerAccess.length ? [] : [selectedCenter];

            await dispatch(fetchITApprovals({
                page,
                limit,
                centers,
                view: "TRANSFER_EMPLOYEE_HISTORY",
                ...search.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            console.log(error)
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch master employee list");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "HISTORY" && hasUserPermission) {
            fetchITApprovalHistory();
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
            minWidth: "160px"
        },
        {
            name: <div>Biometric ID</div>,
            selector: row => row?.biometricId || "-",
        },
        {
            name: <div>Department</div>,
            selector: row => capitalizeWords(row?.department || "-"),
            wrap: true,
            minWidth: "100px"
        },
        {
            name: <div>Designation</div>,
            selector: row => capitalizeWords(row?.designation?.title || "-"),
            wrap: true,
            minWidth: "100px"
        },
        {
            name: <div>Current Location</div>,
            selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Gender</div>,
            selector: row => capitalizeWords(row?.gender || "-"),
            wrap: true
        },
        {
            name: <div>Mobile No</div>,
            selector: row => row?.mobile || "-",
            wrap: true,
            minWidth: "140px"
        },
        {
            name: <div>Official Email ID</div>,
            selector: row => row?.officialEmail || "-",
            wrap: true,
            minWidth: "250px"
        },
        {
            name: <div>Email ID</div>,
            selector: row => row?.email || "-",
            wrap: true,
            minWidth: "250px"
        },
        {
            name: <div>Approval Status</div>,
            selector: (row) => renderStatusBadge(row?.action) || "",
        },
        {
            name: <div>Created At</div>,
            selector: row =>
                row?.createdAt
                    ? format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")
                    : "-",
            sortable: true,
            wrap: true,
            minWidth: "180px"
        },
        {
            name: <div>Acted At</div>,
            selector: row => {
                const actedAt = row?.actedAt;

                if (!actedAt || isNaN(new Date(actedAt))) {
                    return "-";
                }

                return format(new Date(actedAt), "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px"
        },
        {
            name: <div>Acted By</div>,
            selector: (row) => (
                <div>
                    <div>{capitalizeWords(row?.actedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.actedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px"
        },
        {
            name: <div>Note</div>,
            selector: row => <ExpandableText text={row?.note || "-"} />,
            wrap: true,
            minWidth: "200px"
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
                customStyles={customStyles}
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

export default ApprovalHistory;