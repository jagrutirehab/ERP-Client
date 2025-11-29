import React, { useState } from 'react'
import HRFilter from '../../components/HRFilter'
import { endOfDay, startOfDay } from 'date-fns';
import { ExpandableText } from '../../../../Components/Common/ExpandableText';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import { exitEmployees, salaryAdvances } from '../../dummyData';
import DataTable from 'react-data-table-component';
import { CheckCheck, Trash2, X } from 'lucide-react';
import { Badge, Button } from 'reactstrap';
import RejectModal from '../../components/RejectModal';
import ApproveModal from '../../components/ApproveModal';
// import DeleteModal from '../../components/DeleteModal';

const ExitEmployees = ({ activeTab }) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [reportDate, setReportDate] = useState({
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
    });
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const isMobile = useMediaQuery("(max-width: 1000px)");

    const baseColumns = [
        {
            name: <div>Center</div>,
            selector: row => row.center,
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Name</div>,
            selector: row => row.name,
            wrap: true,
            minWidth: "150px"
        },
        {
            name: <div>Email</div>,
            selector: row => row.email,
            wrap: true,
            minWidth: "150px"
        },
        {
            name: <div>Ecode</div>,
            selector: row => row.eCode,
            wrap: true,
            minWidth: "150px"
        },
        {
            name: <div>Employee Name</div>,
            selector: row => row.employeeName,
            wrap: true,
            minWidth: "150px"
        },
        {
            name: <div>Date</div>,
            selector: row => row.date,
            wrap: true,
            minWidth: "150px"
        },
        {
            name: <div>Reason of Leaving</div>,
            selector: row => row.reason,
            wrap: true,
            minWidth: "200px"
        },
        {
            name: <div>Last Working Day</div>,
            selector: row => row.lastWorkingDay,
            wrap: true,
            minWidth: "200px"
        },
    ];


    const historyColumns = [
        {
            name: <div>Status</div>,
            selector: (row) => (
                <Badge
                    color={
                        row.status === "Approved"
                            ? "success"
                            : row.status === "Rejected"
                                ? "danger"
                                : "secondary"
                    }
                >
                    {row.status || "-"}
                </Badge>
            ),
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Note</div>,
            selector: row => row.note || "-",
            wrap: true,
            minWidth: "180px"
        },
    ];


    const actionsColumn = [{
        name: <div>Actions</div>,
        cell: (row) => (
            <div className="d-flex gap-2">
                <Button
                    color='success'
                    className='text-white'
                    size='sm'
                    onClick={() => setApproveOpen(true)}
                >
                    <CheckCheck size={18} />
                </Button>

                <Button
                    color="danger"
                    className='text-white'
                    size='sm'
                    onClick={() => setRejectOpen(true)}
                >
                    <X size={16} />
                </Button>

                <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => setDeleteOpen(true)}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        minWidth: "150px"
    }];



    const columns = activeTab === "HISTORY"
        ? [...baseColumns, ...historyColumns]
        : [...baseColumns, ...actionsColumn];



    return (
        <div className='px-3'>
            <HRFilter
                setPage={setPage}
                reportDate={reportDate}
                setReportDate={setReportDate}
                search={search}
                selectedCenter={selectedCenter}
                setSelectedCenter={setSelectedCenter}
                setDebouncedSearch={setDebouncedSearch}
            />
            <DataTable
                columns={columns}
                data={exitEmployees}
                pagination
                highlightOnHover
                striped
                fixedHeader
                fixedHeaderScrollHeight="400px"
                dense={isMobile}
                responsive
                customStyles={{
                    table: {
                        style: {
                            minHeight: "350px",
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
            />
            <ApproveModal isOpen={approveOpen} toggle={() => setApproveOpen(!approveOpen)} type={"EXIT_EMPLOYEES"} />
            <RejectModal isOpen={rejectOpen} toggle={() => setRejectOpen(!rejectOpen)} />
            {/* <DeleteModal isOpen={deleteOpen} toggle={() => setDeleteOpen(!deleteOpen)} /> */}
        </div>
    )
}

export default ExitEmployees;