import React, { useEffect, useState } from 'react'
import { getHRRequests } from '../Helpers/FetchIssues'
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../Components/Common/DataTable';
import { HRIssuesReqColumn } from '../Columns/HRissuesReq';
import { toast } from 'react-toastify';
import Select from "react-select";
import { useSelector } from 'react-redux';
import { normalizeStatus } from '../Components/normalizeStatus';
import classnames from "classnames";
import { getEmployeesBySearch, updateHRIssueRequest } from '../../../helpers/backend_helper';
import ManagerApproveRejectModal from '../Components/ManagerApproveRejectModal';
import { usePermissions } from '../../../Components/Hooks/useRoles';


const HRissuesRequests = () => {
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [loading, setLoading] = useState(false);
    const [loadingId, setLoadingId] = useState([]);
    const [requests, setRequests] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [activeTab, setActiveTab] = useState("pending");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const user = useSelector((state) => state.User);
    const [pagination, setPagination] = useState(null);
    const [hr, setHr] = useState();
    const [selectedHRs, setSelectedHRs] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [selectedRowId, setSelectedRowId] = useState(null);

    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const { hasPermission } = usePermissions(token);
    const hasUserPermission = hasPermission("ISSUES", "HR_ISSUES_REQUESTS", "READ");
    const hasWritePermission = hasPermission("ISSUES", "HR_ISSUES_REQUESTS", "WRITE");
    const hasDeletePermission = hasPermission("ISSUES", "HR_ISSUES_REQUESTS", "DELETE");

    const canChangeStatus = hasWritePermission || hasDeletePermission;


    const loadRequests = async () => {
        setLoading(true);
        try {

            let centers = [];

            if (selectedCenter === "") {
                centers = [];
            }
            else if (selectedCenter === "ALL") {
                centers = user?.centerAccess || [];
            }
            else {
                centers = [selectedCenter];
            }
            const params = {
                page,
                limit,
                centers,
                status: activeTab
            };


            const response = await getHRRequests(params);
            setRequests(response?.data)
            setPagination({
                ...response?.pagination,
                totalDocs: response?.pagination?.totalRecords,
            });
        } catch (error) {
            toast.error("Error loading requests");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadRequests() }, [
        activeTab,
        page,
        limit,
        selectedCenter,
        user?.centerAccess
    ])

    const loadHR = async () => {
        const params = {
            type: "hr",
        };
        try {
            const response = await getEmployeesBySearch(params);
            console.log("response", response);
            setHr(response?.data);
        } catch (error) {
            toast.error("Error fetching HR");
        }
    }

    useEffect(() => {
        loadHR();
    }, [])


    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [
                {
                    value: "ALL",
                    label: "All Centers",
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


    const statuses = [
        "pending",
        "approved",
        "rejected",
    ];

    const handleUpdate = async (status, ids, hr, note) => {
        setLoadingId(ids[0])
        try {
            const data = {
                status,
                issues: ids,
                hr,
                note
            }

            const response = await updateHRIssueRequest(data);
            console.log("Response", response);
            toast.success(response?.message || "Updated");
            loadRequests();

        } catch (error) {
            toast.error("Error updating data");
        } finally {
            setLoadingId([])
        }
    }

    const handleModalConfirm = (note) => {
        if (!selectedRowId) return;

        handleUpdate(
            actionType,
            [selectedRowId],
            actionType === "approved" ? selectedHRs[selectedRowId]?.value : undefined,
            note
        );

        setShowModal(false);
    };


    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">HR TICKET REQUESTS</h1>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">

                    {/* LEFT SIDE - Filters */}
                    <div className="d-flex gap-3 flex-wrap">
                        <Select
                            options={centerOptions || []}
                            value={centerOptions?.find((c) => c.value === selectedCenter) || null}
                            onChange={(selected) => setSelectedCenter(selected?.value || "")}
                            isDisabled={!centerOptions?.length}
                            placeholder={centerOptions?.length ? "Select Center" : "No Center Selected"}
                            styles={{ container: (base) => ({ ...base, width: 200 }) }}
                        />
                    </div>

                    {/* RIGHT SIDE - Total Records */}
                    <div className="fw-semibold align-self-end">
                        Total Records: {pagination?.totalRecords || 0}
                    </div>

                </div>
                <Nav tabs className="mb-3">
                    {statuses?.map((tab) => (
                        <NavItem key={tab}>
                            <NavLink
                                className={classnames({ active: activeTab === tab })}
                                onClick={() => setActiveTab(tab)}
                                style={{ cursor: "pointer", fontWeight: 500 }}
                            >
                                {normalizeStatus(tab)}
                            </NavLink>
                        </NavItem>
                    ))}
                </Nav>



                <DataTableComponent
                    columns={HRIssuesReqColumn(
                        handleUpdate,
                        activeTab,
                        loadingId,
                        hr,
                        selectedHRs,
                        setSelectedHRs,
                        showModal,
                        setShowModal,
                        setActionType,
                        actionType,
                        setSelectedRowId,
                        selectedRowId,
                        canChangeStatus
                    )}
                    data={requests}
                    loading={loading}
                    pagination={pagination}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                />


            </CardBody>
            <ManagerApproveRejectModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleModalConfirm}
                actionType={actionType}
                loading={loadingId === selectedRowId}
            />
        </>

    )
}

export default HRissuesRequests