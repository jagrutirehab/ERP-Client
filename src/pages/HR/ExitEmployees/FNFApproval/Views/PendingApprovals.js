
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useEffect, useState } from "react";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { fetchExitEmployees } from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { deleteExitEmployee, exitEmployeeFNFAction } from "../../../../../helpers/backend_helper";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import { format } from "date-fns";
import CheckPermission from "../../../../../Components/HOC/CheckPermission";
import { Button, Input, Spinner } from "reactstrap";
import { CheckCheck } from "lucide-react";
import DataTable from "react-data-table-component";
import AddExitEmployeeModal from "../../../components/EditExitEmployeeModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import ApproveModal from "../../../components/ApproveModal";


const PendingApprovals = ({ activeTab }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HR);
    const handleAuthError = useAuthError();
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // APPROVE | REJECT
    const [note, setNote] = useState("");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, roles } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "EXIT_EMPLOYEE_FNF", "READ");

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

    const fetchFNFExitEmployeeList = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : !user?.centerAccess.length ? [] : [selectedCenter];

            await dispatch(fetchExitEmployees({
                page,
                limit,
                centers,
                stage: "FNF_PENDING",
                ...search.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch Exit employee records");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "PENDING" && hasUserPermission) {
            fetchFNFExitEmployeeList();
        }
    }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, activeTab]);

    const handleDelete = async () => {
        setModalLoading(true);
        try {
            await deleteExitEmployee(selectedEmployee._id);
            toast.success("Employee deleted successfully");
            setPage(1);
            fetchFNFExitEmployeeList();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to delete employee")
            }
        } finally {
            setDeleteModalOpen(false);
            setModalLoading(false);
        }
    }

    const handleAction = async () => {
        setModalLoading(true);
        try {
            const response = await exitEmployeeFNFAction(selectedEmployee._id, {
                action: actionType.value,
                note,
            });
            toast.success(response.message);
            setPage(1);
            fetchFNFExitEmployeeList();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Action failed");
            }
        } finally {
            setModalLoading(false);
            setApproveModalOpen(false);
        }
    }

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
            name: <div>Current Location</div>,
            selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Reason of Leaving</div>,
            selector: row => row?.reason || "-",
            wrap: true,
            minWidth: "130px"
        },
        {
            name: <div>Other Reason (If Any)</div>,
            selector: row => (
                <ExpandableText text={capitalizeWords(row?.otherReason || "-")} />
            ),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Last Working Day</div>,
            selector: row => row?.lastWorkingDay || "-",
            wrap: true,
        },
        {
            name: <div>Employee Status</div>,
            selector: row => row?.employeeStatus || "-",
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
            minWidth: "200px"
        },
        {
            name: <div>Filled Time</div>,
            selector: row => {
                if (!row?.filledAt) return "-";
                const date = new Date(row.filledAt);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px"
        },
        {
            name: <div>Exit Approved By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.exitApprovedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.exitApprovedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px"
        },
        {
            name: <div>Exit Approval Time</div>,
            selector: row => {
                if (!row?.exitApprovedAt) return "-";
                const date = new Date(row.exitApprovedAt);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px"
        },

        {
            name: <div>Exit Approval Note</div>,
            selector: row => <ExpandableText text={capitalizeWords(row?.exitApprovalNote || "-")} />,
            wrap: true,
            minWidth: "180px",
        },

        ...(hasPermission("HR", "EXIT_EMPLOYEE_FNF", "WRITE")
            ? [
                {
                    name: <div>Actions</div>,
                    cell: row => (
                        <div className="d-flex gap-2">
                            {/* APPROVE EXIT */}
                            <CheckPermission
                                accessRolePermission={roles?.permissions}
                                subAccess="EXIT_EMPLOYEE_FNF"
                                permission="edit"
                            >
                                <Button
                                    color="success"
                                    className="text-white"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedEmployee(row);
                                        setApproveModalOpen(true);
                                    }}
                                >
                                    <CheckCheck size={18} />
                                </Button>

                                {/* REJECT EXIT */}
                                {/* <Button
                                    color="danger"
                                    className="text-white"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedEmployee(row);
                                        setActionType("REJECT");
                                        setApproveModalOpen(true);
                                    }}
                                >
                                    <X size={16} />
                                </Button> */}
                            </CheckPermission>
                        </div>
                    ),
                    ignoreRowClick: true,
                    allowOverflow: true,
                    button: true,
                    minWidth: "180px"
                }
            ]
            : [])
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

            <AddExitEmployeeModal
                isOpen={modalOpen}
                toggle={() => {
                    setModalOpen(!modalOpen);
                    setSelectedEmployee(null);
                }}
                initialData={selectedEmployee}
                onUpdate={() => {
                    setSelectedEmployee(null);
                    setPage(1);
                    fetchFNFExitEmployeeList();
                }}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                toggle={() => {
                    setDeleteModalOpen(!deleteModalOpen);
                    setSelectedEmployee(null);
                }}
                onConfirm={handleDelete}
                loading={modalLoading}
            />
            <ApproveModal
                isOpen={approveModalOpen}
                toggle={() => {
                    setApproveModalOpen(false);
                    setNote("");
                    setActionType(null);
                    setSelectedEmployee(null)
                }}
                onSubmit={handleAction}
                mode="EXIT_EMPLOYEES_EXIT_PENDING"
                loading={modalLoading}
                actionType={actionType}
                setActionType={setActionType}
                note={note}
                setNote={setNote}

            />
        </>
    )
}

export default PendingApprovals;