

import React, { useEffect, useState } from 'react'
import { actionOnCompOffRequests, getCompOffRequests, getMyCompOff } from '../../../../helpers/backend_helper';
import { CardBody, Nav, NavItem, NavLink } from 'reactstrap';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../../Components/Common/DataTable';
import { toast } from 'react-toastify';
import classnames from "classnames";
import { usePermissions } from '../../../../Components/Hooks/useRoles';
import { useSelector } from 'react-redux';
import Select from "react-select";
import { RaisedCompCol } from './Columns/RaisedCompCol';

const RaisedCompOffsRequest = () => {
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [loadingId, setLoadingId] = useState(null)
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({});
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // const user = useSelector((state) => state.User);
    // const microUser = localStorage.getItem("micrologin");
    // const token = microUser ? JSON.parse(microUser).token : null;
    // const { hasPermission, loading: isLoading } = usePermissions(token);
    // const hasUserPermission = hasPermission("HR", "COMP_OFF_REQUESTS", "READ");
    // const hasRead = hasPermission("HR", "COMP_OFF_REQUESTS", "READ");
    // const hasWrite = hasPermission("HR", "COMP_OFF_REQUESTS", "WRITE");
    // const hasDelete = hasPermission("HR", "COMP_OFF_REQUESTS", "DELETE");

    const loadRequests = async () => {
        setLoader(true)

        try {
            const response = await getMyCompOff({
                status: activeTab,
                month: selectedMonth?.value ?? "all",
                year: selectedYear?.value ?? "all",
                page,
                limit,
            });
            console.log("Response", response);
            setData(response?.data)
            setPagination({
                ...response?.pagination,
                totalDocs: response?.pagination?.totalRecords,
            });
        } catch (error) {
            toast.error("Error fetching data")
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        loadRequests();
    }, [activeTab, selectedMonth, selectedYear, page, limit])






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



    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">RAISED COMP-OFF REQUESTS</h1>
                </div>

                <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">


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

                <DataTableComponent
                    columns={RaisedCompCol(
                        activeTab,

                    )}
                    data={data}
                    loading={loader}
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

export default RaisedCompOffsRequest