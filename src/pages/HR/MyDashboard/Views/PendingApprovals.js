import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Button } from 'reactstrap';
import Select from 'react-select';
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { usePermissions } from '../../../../Components/Hooks/useRoles';
import { fetchApprovalInbox } from '../../../../store/features/HR/hrSlice';
import RefreshButton from '../../../../Components/Common/RefreshButton';
import { renderStatusBadge } from '../../../../Components/Common/renderStatusBadge';
import { capitalizeWords } from '../../../../utils/toCapitalize';
import DataTableComponent from '../../../../Components/Common/DataTable';
import { CheckCheck, X } from 'lucide-react';
import { myDashboardTypeOptions } from '../../../../Components/constants/HR';
import PropTypes from 'prop-types';
import ApproveModal from '../../components/ApproveModal';
import {
    advanceSalaryAction,
    incentivesAction,
    hiringAction,
    updateNewJoiningStatus,
    TPMAction,
    exitEmployeeExitAction,
    exitEmployeeFNFAction,
    employeeTransferCurrentLocationAction,
    actionOnLeaves,
    updateRegularizationStatus,
    employeeTransferTransferLocationAction,
} from '../../../../helpers/backend_helper';
import CheckPermission from '../../../../Components/HOC/CheckPermission';

// Maps inbox type → ApproveModal mode
const TYPE_TO_MODE = {
    ADVANCE_SALARY: "SALARY_ADVANCE",
    INCENTIVE: "INCENTIVES",
    HIRING_REQUEST: "HIRING",
    NEW_JOINING: "NEW_JOINING",
    TPM: "TPM",
    EXIT_REQUEST: "EXIT_EMPLOYEES_EXIT_PENDING",
    FNF_CLOSURE: "EXIT_EMPLOYEES_FNF_PENDING",
    TRANSFER_OUTGOING: "TRANSFER_EMPLOYEE",
    TRANSFER_INCOMING: "TRANSFER_EMPLOYEE",
    LEAVE: "LEAVE",
    REGULARIZATION: "REGULARIZATION",
};

const PendingApprovals = ({ activeTab }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HR);
    const handleAuthError = useAuthError();
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [type, setType] = useState("");
    const [limit, setLimit] = useState(10);

    // Modal state
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [note, setNote] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const [paymentType, setPaymentType] = useState("");
    const [eCode, setECode] = useState("");
    const [modalMode, setModalMode] = useState("");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, roles } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "MY_PENDING_APPROVALS", "READ");

    const centerOptions = [
        ...(centerAccess?.length > 1
            ? [{
                value: "ALL",
                label: "All Centers",
                isDisabled: false,
            }]
            : []
        ),
        ...(
            centerAccess?.map(id => {
                const center = userCenters?.find(c => c._id === id);
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

    const selectedTypeOption = myDashboardTypeOptions.find(
        opt => opt.value === type
    ) || myDashboardTypeOptions[0];

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, centerAccess]);

    const fetchPendingApprovals = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? centerAccess
                    : !centerAccess.length ? [] : [selectedCenter];

            await dispatch(fetchApprovalInbox({
                page,
                limit,
                centers,
                status: "PENDING",
                ...(type !== "" && { type })
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch data");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "PENDING" && hasUserPermission) {
            fetchPendingApprovals();
        }
    }, [page, limit, selectedCenter, type, centerAccess, activeTab]);

    const handleOpenModal = (row, action) => {
        setSelectedRecord(row);
        setActionType(action);
        setModalMode(TYPE_TO_MODE[row.type] || "");
        setApproveModalOpen(true);
    };

    const handleCloseModal = () => {
        setApproveModalOpen(false);
        setNote("");
        setActionType(null);
        setSelectedRecord(null);
        setPaymentType("");
        setECode("");
        setModalMode("");
    };

    const handleAction = async (payload) => {
        if (!selectedRecord) return;
        setModalLoading(true);

        try {
            const rowType = selectedRecord.type;
            const id = selectedRecord.relatedId;
            let response;

            switch (rowType) {
                case "ADVANCE_SALARY":
                    response = await advanceSalaryAction(id, {
                        action: actionType,
                        note,
                        ...(actionType === "APPROVE" ? { paymentType } : {}),
                    });
                    break;

                case "INCENTIVE":
                    response = await incentivesAction(id, {
                        action: actionType,
                        note,
                    });
                    break;

                case "HIRING_REQUEST":
                    response = await hiringAction(id, {
                        action: actionType,
                        note,
                        hr: payload?.hr,
                    });
                    break;

                case "NEW_JOINING":
                    response = await updateNewJoiningStatus(id, {
                        action: actionType,
                        reason: note,
                        ...(actionType === "APPROVE" && { eCode }),
                    });
                    break;

                case "TPM":
                    response = await TPMAction(id, {
                        action: actionType,
                        note,
                        ...(actionType === "APPROVE" && { eCode }),
                    });
                    break;

                case "EXIT_REQUEST":
                    response = await exitEmployeeExitAction(id, {
                        action: actionType?.value || actionType,
                        note,
                    });
                    break;

                case "FNF_CLOSURE":
                    response = await exitEmployeeFNFAction(id, {
                        action: actionType?.value || actionType,
                        note,
                    });
                    break;

                case "TRANSFER_OUTGOING":
                    response = await employeeTransferCurrentLocationAction(id, {
                        action: actionType,
                        note,
                    });
                    break;

                case "TRANSFER_INCOMING":
                    response = await employeeTransferTransferLocationAction(id, {
                        action: actionType,
                        note,
                    });
                    break;

                case "LEAVE":
                    response = await actionOnLeaves(id, {
                        leaveId: selectedRecord.metadata.leaveId,
                        status: actionType === "APPROVE" ? "approved" : "rejected",
                        note,
                    });
                    break;

                case "REGULARIZATION":
                    response = await updateRegularizationStatus(
                        id,
                        actionType === "APPROVE" ? "regularized" : "rejected"
                    );
                    break;

                default:
                    toast.warn("Unknown approval type");
                    setModalLoading(false);
                    return;
            }

            toast.success(response?.message || "Action completed successfully");
            setPage(1);
            fetchPendingApprovals();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Action failed");
            }
        } finally {
            setModalLoading(false);
            handleCloseModal();
        }
    };

    const columns = [
        {
            name: <div>Center</div>,
            selector: row => capitalizeWords(row?.center?.title) || "-",
            wrap: true,
            minWidth: "140px",
        },
        {
            name: <div>Type</div>,
            selector: row => renderStatusBadge(row?.type),
            sortable: false,
        },
        {
            name: <div>Summary</div>,
            selector: row => row?.summary || "-",
            wrap: true,
            minWidth: "300px",
        },
        {
            name: <div>Last Updated</div>,
            selector: row => {
                if (!row?.updatedAt) return "-";
                const date = new Date(row.updatedAt);
                if (isNaN(date)) return "-";
                return format(date, "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "180px",
        },
        {
            name: <div>Action</div>,
            cell: row => (
                <div className="d-flex gap-2">
                    {row?.detailPagePath ? (
                        <Button
                            color='primary'
                            size='sm'
                            className="text-white"
                            onClick={() => navigate(row.detailPagePath)}
                        >
                            View
                        </Button>
                    ) : "-"}
                    <CheckPermission
                        accessRolePermission={roles?.permissions}
                        subAccess="MY_PENDING_APPROVALS"
                        permission={"edit"}>
                        <Button
                            color="success"
                            className="text-white"
                            size="sm"
                            onClick={() => handleOpenModal(row, "APPROVE")}
                        >
                            <CheckCheck size={18} />
                        </Button>

                        <Button
                            color="danger"
                            className="text-white"
                            size="sm"
                            onClick={() => handleOpenModal(row, "REJECT")}
                        >
                            <X size={16} />
                        </Button>
                    </CheckPermission>
                </div>

            ),
            minWidth: "200px",
            center: true,
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

                        <div style={{ width: "200px" }}>
                            <Select
                                value={selectedTypeOption}
                                onChange={(option) => {
                                    setType(option?.value);
                                    setPage(1);
                                }}
                                options={myDashboardTypeOptions}
                                placeholder="All Types"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>

                    <RefreshButton loading={loading} onRefresh={fetchPendingApprovals} />
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
                        <Select
                            value={selectedTypeOption}
                            onChange={(option) => {
                                setType(option?.value);
                                setPage(1);
                            }}
                            options={myDashboardTypeOptions}
                            placeholder="All Types"
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <RefreshButton loading={loading} onRefresh={fetchPendingApprovals} />
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

            <ApproveModal
                isOpen={approveModalOpen}
                toggle={handleCloseModal}
                onSubmit={handleAction}
                mode={modalMode}
                loading={modalLoading}
                actionType={actionType}
                setActionType={setActionType}
                note={note}
                setNote={setNote}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                eCode={eCode}
                setECode={setECode}
            />
        </>
    )
}

PendingApprovals.propTypes = {
    activeTab: PropTypes.string
}

export default PendingApprovals