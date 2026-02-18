import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import { usePermissions } from '../../../../Components/Hooks/useRoles';
import { Button, CardBody, Input, Spinner, } from 'reactstrap';
import { Pencil, Trash2, } from "lucide-react";
import AddTransferEmployeeModal from '../../components/EditTransferEmployeeModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeTransfers } from '../../../../store/features/HR/hrSlice';
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { toast } from 'react-toastify';
import { deleteEmployeeTransfer } from '../../../../helpers/backend_helper';
import { capitalizeWords } from '../../../../utils/toCapitalize';
import { renderStatusBadge } from '../../../../Components/Common/renderStatusBadge';
import { format } from 'date-fns';
import CheckPermission from '../../../../Components/HOC/CheckPermission';
import Select from "react-select";
import { ExpandableText } from '../../../../Components/Common/ExpandableText';
import DataTableComponent from '../../../../Components/Common/DataTable';

const TransferApprovals = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const user = useSelector((state) => state.User);
    const handleAuthError = useAuthError();
    const { data, pagination, loading } = useSelector((state) => state.HR);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);


    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader, roles } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "TRANSFER_EMPLOYEE_APPROVAL", "READ");


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

    const fetchPendingEmployeeTransferApprovals = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : !user?.centerAccess.length ? [] : [selectedCenter];

            await dispatch(fetchEmployeeTransfers({
                page,
                limit,
                centers,
                view: "ALL",
                ...search.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch advance salary records");
            }
        }
    };

    useEffect(() => {
        if (hasUserPermission) {
            fetchPendingEmployeeTransferApprovals();
        }
    }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess]);

    const handleDelete = async () => {
        setModalLoading(true);
        try {
            await deleteEmployeeTransfer(selectedRecord._id);
            toast.success("Request deleted successfully");
            setPage(1);
            fetchPendingEmployeeTransferApprovals();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to delete the request")
            }
        } finally {
            setDeleteModalOpen(false);
            setModalLoading(false);
        }
    }

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
            name: <div>Current Location Approval</div>,
            selector: row => renderStatusBadge(row?.currentLocationApproval?.status)
        },
        {
            name: <div>Transfer Location Approval</div>,
            selector: row => renderStatusBadge(row?.transferLocationApproval?.status)
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
            name: <div>Transfer Location Action By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.transferLocationApproval?.actedBy?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.transferLocationApproval?.actedBy?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Transfer Location Note</div>,
            selector: row => <ExpandableText text={row?.transferLocationApproval?.note || "-"} />,
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Transfer location Action At</div>,
            selector: row => {
                if (!row?.transferLocationApproval?.actedAt) return "-";
                const date = new Date(row?.transferLocationApproval?.actedAt);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px",
        },
        {
            name: <div>Is Current Location Updated</div>,
            selector: row => row?.isTransferApplied ? "Yes" : "No",
            wrap: true
        },
        ...(hasPermission("HR", "TRANSFER_EMPLOYEE_APPROVAL", "WRITE")
            ? [
                {
                    name: <div>Actions</div>,
                    cell: row => {

                        const canPerformAction =
                            row?.currentLocationApproval?.status === "PENDING" &&
                            row?.transferLocationApproval?.status === "PENDING";


                        if (!canPerformAction) {
                            return (
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#6c757d",
                                        fontStyle: "italic",
                                    }}
                                >
                                    Action not available
                                </span>
                            );
                        }

                        return (
                            <div className="d-flex gap-2">
                                <CheckPermission
                                    accessRolePermission={roles?.permissions}
                                    subAccess="TRANSFER_EMPLOYEE_APPROVAL"
                                    permission="edit"
                                >
                                    <Button
                                        color="primary"
                                        outline
                                        size="sm"
                                        onClick={() => {
                                            setSelectedRecord(row);
                                            setModalOpen(true);
                                        }}
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                </CheckPermission>
                                <CheckPermission
                                    accessRolePermission={roles?.permissions}
                                    subAccess="TRANSFER_EMPLOYEE_APPROVAL"
                                    permission="delete"
                                >
                                    <Button
                                        color="danger"
                                        size="sm"
                                        className="text-white"
                                        onClick={() => {
                                            setSelectedRecord(row);
                                            setDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </CheckPermission>
                            </div>
                        )
                    },
                    ignoreRowClick: true,
                    allowOverflow: true,
                    button: true,
                    minWidth: "180px"
                }
            ]
            : [])
    ];

    if (!permissionLoader && !hasUserPermission) {
        navigate("/unauthorized");
    }

    if (loading || permissionLoader) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner color="primary" />
            </div>
        )
    }


    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="content-wrapper">
                    <div className="text-center text-md-left">
                        <h1 className="display-6 fw-bold text-primary">TRANSFER EMPLOYEE APPROVAL</h1>
                    </div>
                    <div className="my-3">
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

                </div>
            </CardBody>
            <AddTransferEmployeeModal
                isOpen={modalOpen}
                toggle={() => {
                    setModalOpen(!modalOpen);
                    setSelectedRecord(null);
                }}
                initialData={selectedRecord}
                onUpdate={() => {
                    setSelectedRecord(null);
                    setPage(1);
                    fetchPendingEmployeeTransferApprovals();
                }}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                toggle={() => {
                    setDeleteModalOpen(!deleteModalOpen);
                    setSelectedRecord(null);
                }}
                onConfirm={handleDelete}
                loading={modalLoading}
            />
        </>
    )
}

export default TransferApprovals