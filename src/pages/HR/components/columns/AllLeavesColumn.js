import { Badge, Spinner } from "reactstrap";

export const normalizeDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
};

const getStatusBadge = (status) => {
    const normalized = status?.toLowerCase();

    switch (normalized) {
        case "approved":
            return <Badge color="success">Approved</Badge>;

        case "pending":
            return <Badge color="warning">Pending</Badge>;

        case "rejected":
            return <Badge color="danger">Rejected</Badge>;

        case "retrieved":
            return <Badge color="info">Retrieved</Badge>;

        case "cancelled":
            return <Badge color="secondary">Cancelled</Badge>;

        default:
            return <Badge color="dark">{status || "-"}</Badge>;
    }
};

export const allLeavesColumn = (activeTab, handleAction, approveLoaderId, handleCancel,
    openCancelModal, hasWrite,
    hasDelete,) => [
        {
            name: <div>E Code</div>,
            selector: row => row?.eCode || "-",
            wrap: true,
            minWidth: "150px",
        },
        {
            name: <div>Employee Name</div>,
            selector: row => row?.employee?.name || "-",
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Manager</div>,
            selector: row => row?.approvalAuthority || "-",
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Center</div>,
            selector: row => row?.center?.title || "-",
            wrap: true,
            minWidth: "150px",
        },
        {
            name: <div>Type</div>,
            selector: row => row?.leaveType || "-",
            wrap: true,
            minWidth: "150px",
        },
        {
            name: <div>From</div>,
            selector: row => normalizeDate(row?.fromDate),
            wrap: true,
            minWidth: "150px",
        },
        {
            name: <div>To</div>,
            selector: row => normalizeDate(row?.toDate),
            wrap: true,
            minWidth: "150px",
        },
        {
            name: <div>Leave Status</div>,
            cell: (row) => getStatusBadge(row?.status),
            wrap: true,
            minWidth: "200px",
        },
        {
            name: <div>Leave Reason</div>,
            selector: row => row?.leaveReason || "-",
            wrap: true,
            minWidth: "200px",
        },
        ...(activeTab !== "pending"  && activeTab !== "retrieved" ? [
            {
                name: <div>Leave Action</div>,
                selector: row => row?.leaveActionBy || row?.approvalAuthority || "-",
                wrap: true,
                minWidth: "200px",
            },
        ] : []),
        ...(activeTab === "cancelled" ? [
            {
                name: <div>Cancellation Reason</div>,
                selector: row => row?.cancellationReason || "-",
                wrap: true,
                minWidth: "200px",
            },
            {
                name: <div>Cancellation Action</div>,
                selector: row => row?.cancellationAction || "-",
                wrap: true,
                minWidth: "200px",
            },
        ] : []),
        {
            name: <div>Action On</div>,
            selector: row => normalizeDate(row?.actionOn),
            wrap: true,
            minWidth: "150px",
        },
        ...(activeTab === "pending" && (hasWrite || hasDelete)
            ? [
                {
                    name: <div>Action</div>,
                    cell: (row) => (
                        // !hasWrite && !hasDelete ? (
                        //     "-"
                        // ) :
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleAction(row, "approved")}
                            >
                                {approveLoaderId === row?._id ? <Spinner size="sm" /> : "Approve"}
                            </button>

                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleAction(row, "rejected")}
                            >

                                {approveLoaderId === row?._id ? <Spinner size="sm" /> : "Reject"}
                            </button>
                        </div>
                    ),
                    minWidth: "180px",
                },
            ]
            : []),

        ...(activeTab === "approved" && (hasWrite || hasDelete)
            ? [
                {
                    name: <div>Action</div>,
                    cell: (row) => (
                        // !hasWrite && !hasDelete ? (
                        //     "-"
                        // ) :
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => openCancelModal(row)}
                            >
                                Cancel
                            </button>
                        </div>
                    ),
                    minWidth: "220px",
                },
            ]
            : [])
    ]