

import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { getEmployeesBySearch, getPayslipsIssuesRequests, updateFinanceIssueRequest } from '../../../helpers/backend_helper';
import ManagerApproveRejectModal from '../Components/ManagerApproveRejectModal';
import { usePermissions } from '../../../Components/Hooks/useRoles';
import { FinanceIssuesReqColumn } from '../Columns/FinanceRequestCol';
import ImagesModal from '../Components/ImagesModal';


const PayslipsRequests = () => {
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
    const [employees, setEmployees] = useState();
    const [selectedHRs, setSelectedHRs] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [imageModal, setImageModal] = useState(false);
    const [files, setFiles] = useState([]);

    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const { hasPermission } = usePermissions(token);
    const hasUserPermission = hasPermission("ISSUES", "FINANCE_ISSUES_APPROVAL", "READ");
    const hasWritePermission = hasPermission("ISSUES", "FINANCE_ISSUES_APPROVAL", "WRITE");
    const hasDeletePermission = hasPermission("ISSUES", "FINANCE_ISSUES_APPROVAL", "DELETE");

    const canChangeStatus = hasWritePermission || hasDeletePermission;

    const debounceTimer = useRef(null);


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


            const response = await getPayslipsIssuesRequests(params);
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

    // const loadHR = async () => {
    //     const params = {
    //         type: "employee",
    //     };
    //     try {
    //         const response = await getEmployeesBySearch(params);
    //         console.log("response", response);
    //         setEmployees(response?.data);
    //     } catch (error) {
    //         toast.error("Error fetching HR");
    //     }
    // }

    const isECodeLike = (value) => {
        return /^[A-Za-z]+[A-Za-z0-9]*\d+[A-Za-z0-9]*$/.test(value);
    };

    const loadHR = useCallback((searchText) => {
        clearTimeout(debounceTimer.current);

        if (!searchText || searchText.length < 2) {
            setEmployees([]);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                const params = { type: "employee" };

                if (/^\d+$/.test(searchText) || isECodeLike(searchText)) {
                    params.eCode = searchText;
                } else {
                    params.name = searchText;
                }

                const response = await getEmployeesBySearch(params);
                const options = response?.data?.map((emp) => ({
                    value: emp._id,
                    label: `${emp.name} (${emp.eCode})`,
                })) || [];

                setEmployees(options);
            } catch (error) {
                console.log("Error loading employees", error);
            }
        }, 500); // ⏱ waits 500ms after user stops typing
    }, []);


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
            const response = await updateFinanceIssueRequest(data);
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

    const handleViewImages = (filesData) => {
        setFiles(filesData || []);
        setImageModal(true);
    };




    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">FINANCE TICKET REQUESTS</h1>
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
                    columns={FinanceIssuesReqColumn(
                        handleUpdate,
                        activeTab,
                        loadingId,
                        employees,
                        selectedHRs,
                        loadHR,
                        setSelectedHRs,
                        showModal,
                        setShowModal,
                        setActionType,
                        actionType,
                        setSelectedRowId,
                        selectedRowId,
                        canChangeStatus,
                        handleViewImages
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
            <ImagesModal
                isOpen={imageModal}
                toggle={() => setImageModal(false)}
                files={files}
            />
        </>

    )
}

export default PayslipsRequests