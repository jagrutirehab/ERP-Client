import React, { useState } from 'react'
import { CardBody, Nav, NavItem, NavLink, Toast } from 'reactstrap'
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../../Components/Common/DataTable';
import { CancellationsRequestsColumn } from './Columns/Requests';
import { toast } from "react-toastify";
import { actionOnCancellationRequest, getCancellationsRequests } from '../../../../helpers/backend_helper';
import { useEffect } from 'react';
import classnames from "classnames";
import Select from "react-select";
import { useSelector } from 'react-redux';
import { usePermissions } from '../../../../Components/Hooks/useRoles';

const CancellationRequestsPage = () => {
    const [req, setReq] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [loadingId, setLoadingId] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({});
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const user = useSelector((state) => state.User);

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission, loading: isLoading } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "CANCELATIONS_REQUESTS", "READ");
    const hasRead = hasPermission("HR", "CANCELATIONS_REQUESTS", "READ");
    const hasWrite = hasPermission("HR", "CANCELATIONS_REQUESTS", "WRITE");
    const hasDelete = hasPermission("HR", "CANCELATIONS_REQUESTS", "DELETE");

    const fetchRequests = async () => {
        setLoading(true)
        try {

            let centers = [];
            if (selectedCenter === "") {
                centers = [];
            } else if (selectedCenter === "ALL") {
                centers = user?.centerAccess || [];
            } else {
                centers = [selectedCenter];
            }
            const response = await getCancellationsRequests({
                status: activeTab,
                month: selectedMonth?.value ?? "all",
                year: selectedYear?.value ?? "all",
                centers,
                page,
                limit,
                search: debouncedSearch
            });
            console.log("Res", response);
            setReq(response?.data || []);
            setPagination({
                ...response?.pagination,
                totalDocs: response?.pagination?.totalRecords,
            });

        } catch (error) {
            toast.error(error.message || "Failed to load data");
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests();
    }, [activeTab, selectedMonth, selectedYear, selectedCenter, user?.centerAccess, page, limit, debouncedSearch])

    const monthOptions = [
        { label: "January", value: 0 },
        { label: "February", value: 1 },
        { label: "March", value: 2 },
        { label: "April", value: 3 },
        { label: "May", value: 4 },
        { label: "June", value: 5 },
        { label: "July", value: 6 },
        { label: "August", value: 7 },
        { label: "September", value: 8 },
        { label: "October", value: 9 },
        { label: "November", value: 10 },
        { label: "December", value: 11 },
    ];

    const currentYear = new Date().getFullYear();

    const yearOptions = Array.from({ length: 5 }, (_, i) => ({
        label: String(currentYear - i),
        value: currentYear - i,
    }));

    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [
                {
                    value: "ALL",
                    label: "All Centers",
                    isDisabled: false,
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


    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
        }
    }, [selectedCenter, user?.centerAccess]);


    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);


    const handleAction = async (row, status) => {
        setLoadingId(row._id)
        try {
            const query = {
                cancellationId: row?._id,
                status
            }
            console.log("Payload", query);
            const response = await actionOnCancellationRequest(query);
            console.log("ActionResponse", response);
            toast.success(response?.message || "Action Success")
            fetchRequests();
        } catch (error) {
            toast.error(error?.message || "Failed to Approve Cancellation Request");
        } finally {
            setLoadingId(null)
        }
    }


    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">CANCELLATIONS REQUESTS</h1>
                </div>

                <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Name or ECode"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // reset pagination
                        }}
                        style={{ maxWidth: "250px" }}
                    />

                    {/* Center Select */}
                    <div style={{ minWidth: 120 }}>
                        {/* <label className="form-label mb-1">Center</label> */}
                        <Select
                            options={centerOptions}
                            value={centerOptions.find(c => c.value === selectedCenter) || null}
                            onChange={(selected) => setSelectedCenter(selected ? selected.value : "")}
                            placeholder="Select Center"
                            isDisabled={!centerOptions.length}
                        />
                    </div>

                    {/* Month Select */}
                    <div style={{ minWidth: 120 }}>
                        {/* <label className="form-label mb-1">Month</label> */}
                        <Select
                            options={monthOptions}
                            value={selectedMonth}
                            onChange={(selected) => setSelectedMonth(selected)}
                            placeholder="Select Month"
                            isClearable
                        />
                    </div>

                    {/* Year Select */}
                    <div style={{ minWidth: 120 }}>
                        {/* <label className="form-label mb-1">Year</label> */}
                        <Select
                            options={yearOptions}
                            value={selectedYear}
                            onChange={(selected) => setSelectedYear(selected)}
                            placeholder="Select Year"
                            isClearable
                        />
                    </div>

                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Nav tabs className="mb-3">
                        {["pending", "approved", "rejected"].map((tab) => (
                            <NavItem key={tab}>
                                <NavLink
                                    className={classnames({ active: activeTab === tab })}
                                    onClick={() => setActiveTab(tab)}
                                    style={{ cursor: "pointer", fontWeight: 500 }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </NavLink>
                            </NavItem>
                        ))}
                    </Nav>
                    <span className="fw-semibold">
                        Total Records - {pagination?.totalRecords}
                    </span>
                </div>

                <DataTableComponent
                    columns={CancellationsRequestsColumn(
                        handleAction,
                        loadingId,
                        activeTab,
                        hasWrite,
                        hasDelete,
                    )}
                    data={req}
                    loading={loading}
                    pagination={pagination}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                />
            </CardBody>
        </>
    )
}

export default CancellationRequestsPage