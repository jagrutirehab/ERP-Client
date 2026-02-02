import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useEffect, useState } from "react";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { getMasterEmployees } from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { deleteEmployee, getEmployeeFinanceById, updateNewJoiningStatus } from "../../../../../helpers/backend_helper";
import { format } from "date-fns";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { downloadFile } from "../../../../../Components/Common/downloadFile";
import CheckPermission from "../../../../../Components/HOC/CheckPermission";
import { Button, Input, Spinner } from "reactstrap";
import { CheckCheck, Pencil, Trash2, X } from "lucide-react";
import DataTable from "react-data-table-component";
import AddEmployeeModal from "../../../components/EmployeeModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import ApproveModal from "../../../components/ApproveModal";
import Select from "react-select";


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


const PendingApprovals = ({ activeTab, hasUserPermission, hasPermission, roles }) => {

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
    const [reason, setReason] = useState("");
    const [eCode, setECode] = useState("");

    const hasCreatePermission = hasPermission("HR", "NEW_JOINING_ADD_REQUEST", "WRITE") || hasPermission("HR", "NEW_JOINING_ADD_REQUEST", "DELETE");

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

    const fetchMasterEmployeeList = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : !user?.centerAccess.length ? [] : [selectedCenter];

            await dispatch(getMasterEmployees({
                page,
                limit,
                centers,
                view: "NEW_JOINING_PENDING",
                ...search.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch master employee list");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "PENDING" && hasUserPermission) {
            fetchMasterEmployeeList();
        }
    }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, activeTab, roles]);

    const handleDelete = async () => {
        setModalLoading(true);
        try {
            await deleteEmployee(selectedEmployee._id);
            toast.success("Employee deleted successfully");
            setPage(1);
            fetchMasterEmployeeList();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to delete employee")
            }
        } finally {
            setDeleteModalOpen(false);
            setModalLoading(false);
        }
    }

    const handleEditEmployee = async (row) => {
        setSelectedEmployee(row);
        setModalLoading(true);
        try {
            const res = await getEmployeeFinanceById(row._id);

            setSelectedEmployee({
                ...row,
                financeDetails: res?.data?.financeDetails,
            });

            setModalOpen(true);
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch employee finance details");
            }
        } finally {
            setModalLoading(false);
        }
    };

    const handleNewJoiningAction = async () => {
        setModalLoading(true);
        try {
            const response = await updateNewJoiningStatus(
                selectedEmployee._id,
                {
                    action: actionType,
                    reason,
                    ...actionType === "APPROVE" && { eCode }
                }
            );

            toast.success(response.message);
            setPage(1)
            fetchMasterEmployeeList();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to update the status");
            }
        } finally {
            setModalLoading(false);
            setApproveModalOpen(false);
            setReason("");
            setActionType(null);
        }
    };

    const columns = [
        {
            name: <div>Date</div>,
            selector: row =>
                row?.createdAt
                    ? format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")
                    : "-",
            sortable: true,
            wrap: true,
            minWidth: "180px"
        },
        {
            name: <div>Name</div>,
            selector: row => row?.name?.toUpperCase() || "-",
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
            minWidth: "130px"
        },
        {
            name: <div>Designation</div>,
            selector: row => capitalizeWords(row.designation?.name
                ?.toLowerCase()
                .replace(/_/g, " ") || "-"),
            wrap: true,
            minWidth: "130px"
        },
        {
            name: <div>Employment</div>,
            selector: row => capitalizeWords(row?.employmentType || "-"),
            wrap: true,
            minWidth: "100px"
        },

        {
            name: <div>First Location</div>,
            selector: row => capitalizeWords(row?.firstLocation?.title || "-"),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Current Location</div>,
            selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
            wrap: true,
            minWidth: "120px"
        },

        {
            name: <div>State</div>,
            selector: row => capitalizeWords(row?.state || "-"),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Payroll</div>,
            selector: row =>
                row?.payrollType === "ON_ROLL" ? "On Roll" : "Off Roll",
            wrap: true
        },
        {
            name: <div>Joining Date</div>,
            selector: row => row?.joinningDate || "-",
            wrap: true
        },
        {
            name: <div>Gender</div>,
            selector: row => capitalizeWords(row?.gender || "-"),
            wrap: true
        },
        {
            name: <div>Date of Birth</div>,
            selector: row => row?.dateOfBirth || "-",
            wrap: true
        },
        {
            name: <div>Bank Name</div>,
            selector: row =>
                capitalizeWords(row?.bankDetails?.bankName || "-"),
            wrap: true,
            minWidth: "160px"
        },
        {
            name: <div>Bank Account No</div>,
            selector: row => row?.bankDetails?.accountNo || "-",
            wrap: true,
            minWidth: "180px"
        },
        {
            name: <div>IFSC Code</div>,
            selector: row => row?.bankDetails?.IFSCCode || "-",
            wrap: true,
            minWidth: "150px"
        },
        {
            name: <div>PF Applicable</div>,
            selector: row =>
                row?.pfApplicable === true
                    ? "Yes"
                    : row?.pfApplicable === false
                        ? "No"
                        : "-",
            wrap: true
        },
        {
            name: <div>UAN No</div>,
            selector: row => row?.uanNo || "-",
            wrap: true,
            minWidth: "160px"
        },
        {
            name: <div>PF No</div>,
            selector: row => row?.pfNo || "-",
            wrap: true,
            minWidth: "160px"
        },
        {
            name: <div>ESIC IP Code</div>,
            selector: row => row?.esicIpCode || "-",
            wrap: true,
            minWidth: "160px"
        },

        {
            name: <div>Aadhaar No</div>,
            selector: row => row?.adhar?.number || "-",
            wrap: true,
            minWidth: "180px"
        },
        {
            name: <div>Aadhaar File</div>,
            cell: row =>
                typeof row?.adhar?.url === "string" ? (
                    <span
                        style={{
                            color: "#007bff",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                        onClick={() => downloadFile({ url: row.adhar.url })}
                    >
                        Download
                    </span>
                ) : (
                    "-"
                ),
            wrap: true,
        },
        {
            name: <div>PAN</div>,
            selector: row => row?.pan?.number || "-",
            wrap: true,
            minWidth: "140px"
        },
        {
            name: <div>PAN File</div>,
            cell: row =>
                typeof row?.pan?.url === "string" ? (
                    <span
                        style={{
                            color: "#007bff",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                        onClick={() => downloadFile({ url: row.pan.url })}
                    >
                        Download
                    </span>
                ) : (
                    "-"
                )
        },
        {
            name: <div>Father's Name</div>,
            selector: row => capitalizeWords(row?.father || "-"),
            wrap: true,
            minWidth: "180px"
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
            minWidth: "200px"
        },
        {
            name: <div>Email ID</div>,
            selector: row => row?.email || "-",
            wrap: true,
            minWidth: "200px"
        },

        {
            name: <div>Monthly CTC</div>,
            selector: row =>
                typeof row?.monthlyCTC === "number"
                    ? `₹${row.monthlyCTC.toLocaleString()}`
                    : "-",
            sortable: true,
            wrap: true,
            minWidth: "100px"
        },
        {
            name: <div>Offer Letter</div>,
            cell: row =>
                typeof row?.offerLetter === "string" ? (
                    <span
                        style={{
                            color: "#007bff",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                        onClick={() => downloadFile({ url: row.offerLetter })}
                    >
                        Download
                    </span>
                ) : (
                    "-"
                )
        },
        {
            name: <div>Filled By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.newJoiningWorkflow?.filledBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.newJoiningWorkflow?.filledBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px"
        },
        {
            name: <div>Filled At</div>,
            selector: row => {
                const filledAt = row?.newJoiningWorkflow?.filledAt;

                if (!filledAt || isNaN(new Date(filledAt))) {
                    return "-";
                }

                return format(new Date(filledAt), "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px",
        },
        ...(hasPermission("HR", "NEW_JOINING_APPROVAL", "WRITE")
            ? [
                {
                    name: <div>Actions</div>,
                    cell: row => (
                        <div className="d-flex gap-2">
                            <CheckPermission
                                accessRolePermission={roles?.permissions}
                                subAccess="NEW_JOINING_APPROVAL"
                                permission="edit"
                            >
                                <Button
                                    color="success"
                                    className="text-white"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedEmployee(row);
                                        setActionType("APPROVE");
                                        setApproveModalOpen(true);
                                    }}
                                >
                                    <CheckCheck size={18} />
                                </Button>

                                <Button
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
                                </Button>

                                <button
                                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                    onClick={() => {
                                        handleEditEmployee(row);
                                    }}
                                >
                                    {(modalLoading && selectedEmployee?._id === row?._id) ? <Spinner size="sm" /> : <Pencil size={16} />}
                                </button>
                            </CheckPermission>

                            <CheckPermission
                                accessRolePermission={roles?.permissions}
                                subAccess="NEW_JOINING_APPROVAL"
                                permission="delete"
                            >
                                <button
                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                    onClick={() => {
                                        setSelectedEmployee(row);
                                        setDeleteModalOpen(true);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
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

    const isVendor =
        selectedEmployee?.employmentType
            ?.trim()
            .toLowerCase() !== "vendor";

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
                customStyles={customStyles}
                progressComponent={
                    <div className="py-4 text-center">
                        <Spinner className="text-primary" />
                    </div>
                }
                onChangePage={(newPage) => setPage(newPage)}
                onChangeRowsPerPage={(newLimit) => setLimit(newLimit)}
            />

            <AddEmployeeModal
                isOpen={modalOpen}
                toggle={() => {
                    setModalOpen(!modalOpen);
                    setSelectedEmployee(null);
                }}
                initialData={selectedEmployee}
                onUpdate={() => {
                    setPage(1);
                    fetchMasterEmployeeList();
                }}
                loading={modalLoading}
                setLoading={setModalLoading}
                mode={"NEW_JOINING"}
                isVendor={isVendor}
                hasCreatePermission={hasCreatePermission}
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
                    setReason("");
                    setActionType(null);
                }}
                onSubmit={handleNewJoiningAction}
                mode="NEW_JOINING"
                loading={modalLoading}
                actionType={actionType}
                note={reason}
                setNote={setReason}
                eCode={eCode}
                setECode={setECode}
            />

        </>
    );
};

export default PendingApprovals;
