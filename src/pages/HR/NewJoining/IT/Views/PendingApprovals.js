import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useEffect, useState } from "react";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { fetchITApprovals } from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import CheckPermission from "../../../../../Components/HOC/CheckPermission";
import { Button, Input, Spinner } from "reactstrap";
import { CheckCheck, X } from "lucide-react";
import DataTable from "react-data-table-component";
import ApproveModal from "../../../components/ApproveModal";
import Select from "react-select";
import { updateNewJoiningITStatus } from "../../../../../helpers/backend_helper";
import UserForm from "../../../../User/Form";
import EmailSelectModal from "../../../components/EmailSelectModal";


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
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [userFormOpen, setUserFormOpen] = useState(false);
    const [emailSelectModal, setEmailSelectModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState("");
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // APPROVE | REJECT
    const [reason, setReason] = useState("");


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

    const fetchPendingITApprovals = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : !user?.centerAccess.length ? [] : [selectedCenter];

            await dispatch(fetchITApprovals({
                page,
                limit,
                centers,
                view: "NEW_JOINING_PENDING",
                ...search.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch IT approvals");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "PENDING" && hasUserPermission) {
            fetchPendingITApprovals();
        }
    }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, activeTab, roles]);


    const handleApproveStart = (row) => {
        setSelectedEmployee({
            ...row,
            name: row.employeeName,
            centerAccess: [{ _id: row?.currentLocation }],
            phoneNumber: row?.mobile,
            isNewUserFromIT: true

        });
        setActionType("APPROVE");

        const emails = [];
        if (row.email) emails.push(row.email);
        if (row.officialEmail) emails.push(row.officialEmail);

        if (emails.length === 0) {
            toast.error("Employee has no email. Please add an email first in master employee list.");
            return;
        }

        if (emails.length === 1) {
            setSelectedEmail(emails[0]);
            setUserFormOpen(true);
            return;
        }

        setEmailSelectModal(true);
    };

    const handleEmailSelect = (email) => {
        setSelectedEmail(email);
        setEmailSelectModal(false);
        setUserFormOpen(true);
    };


    const handleUserFormComplete = async (userId) => {
        try {
            setUserFormOpen(false);
            setModalLoading(true);
            const response = await updateNewJoiningITStatus(selectedEmployee._id, {
                action: "APPROVE",
                userId,
            });

            toast.success(response.message || "Approved successfully");
            setUserFormOpen(false);
            setSelectedEmail("");
            setSelectedEmployee(null);
            fetchPendingITApprovals();
        } catch (err) {
            toast.error(err.message || "Failed to finalize approval");
        } finally {
            setModalLoading(false);
        }
    };


    const handleReject = async () => {
        setModalLoading(true);
        try {
            const response = await updateNewJoiningITStatus(
                selectedEmployee._id,
                {
                    action: "REJECT",
                    note: reason,
                }
            );

            toast.success(response.message);
            setPage(1)
            fetchPendingITApprovals();
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
            name: <div>Department</div>,
            selector: row => capitalizeWords(row?.department || "-"),
            wrap: true,
            minWidth: "100px"
        },
        {
            name: <div>Designation</div>,
            selector: row => capitalizeWords(row?.designation || "-"),
            wrap: true,
            minWidth: "100px"
        },
        {
            name: <div>Current Location</div>,
            selector: row => capitalizeWords(row?.currentLocationTitle || "-"),
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
            name: <div>Created At</div>,
            selector: row =>
                row?.createdAt
                    ? format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")
                    : "-",
            sortable: true,
            wrap: true,
            minWidth: "180px"
        },
        ...(hasPermission("HR", "NEW_JOINING_IT", "WRITE")
            ? [
                {
                    name: <div>Actions</div>,
                    cell: row => (
                        <div className="d-flex gap-2">
                            <CheckPermission
                                accessRolePermission={roles?.permissions}
                                subAccess="NEW_JOINING_IT"
                                permission="edit"
                            >
                                <Button
                                    color="success"
                                    className="text-white"
                                    size="sm"
                                    onClick={() => handleApproveStart(row)}
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
                                        setRejectModalOpen(true);
                                    }}
                                >
                                    <X size={16} />
                                </Button>
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
                customStyles={customStyles}
                progressComponent={
                    <div className="py-4 text-center">
                        <Spinner className="text-primary" />
                    </div>
                }
                onChangePage={(newPage) => setPage(newPage)}
                onChangeRowsPerPage={(newLimit) => setLimit(newLimit)}
            />
            <ApproveModal
                isOpen={rejectModalOpen}
                toggle={() => {
                    setRejectModalOpen(false);
                    setReason("");
                    setActionType(null);
                }}
                onSubmit={handleReject}
                mode="NEW_JOINING"
                actionType={actionType}
                note={reason}
                setNote={setReason}
            />
            <EmailSelectModal
                isOpen={emailSelectModal}
                toggle={() => setEmailSelectModal(false)}
                emails={[
                    selectedEmployee?.email,
                    selectedEmployee?.officialEmail,
                ].filter(Boolean)}
                onSelect={handleEmailSelect}
            />
            <UserForm
                isOpen={userFormOpen}
                toggleForm={() => setUserFormOpen(!userFormOpen)}
                userData={{ ...selectedEmployee, email: selectedEmail }}
                setUserData={setSelectedEmployee}
                hasUserPermission={hasUserPermission}
                onComplete={handleUserFormComplete}
                isFromIT={true}
            />


        </>
    );
};

export default PendingApprovals;
