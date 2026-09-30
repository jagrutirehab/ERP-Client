import { Badge, Spinner } from "reactstrap";

const Center = ({ children }) => (
    <div className="text-center w-100">{children}</div>
);

const getDaysCount = (fromDate, toDate) => {
    if (!fromDate || !toDate) return "-";

    const start = new Date(fromDate);
    const end = new Date(toDate);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
};

const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
};

export const CompOffRequestsColumn = (
    activeTab,
    handleAction,
    loadingId,
    hasWrite,
    hasDelete,
) => [
        {
            name: <Center>ECode</Center>,
            cell: (row) => <Center>{row?.eCode || "-"}</Center>,
            width: "120px",
        },

        {
            name: <Center>Employee Name</Center>,
            cell: (row) => <Center>{row?.employee?.name || "-"}</Center>,
            width: "220px",
        },
    
        {
            name: <Center>Center</Center>,
            cell: (row) => <Center>{row?.center?.title || "-"}</Center>,
            width: "220px",
        },
        {
            name: <Center>From Date</Center>,
            cell: (row) => <Center>{formatDate(row?.from)}</Center>,
            width: "140px",
        },

        {
            name: <Center>To Date</Center>,
            cell: (row) => <Center>{formatDate(row?.to)}</Center>,
            width: "140px",
        },
        {
            name: <Center>Status</Center>,
            cell: (row) => {
                const status = row?.status?.toLowerCase();

                if (status === "pending")
                    return (
                        <Center>
                            <Badge pill color="warning">Pending</Badge>
                        </Center>
                    );

                if (status === "approved")
                    return (
                        <Center>
                            <Badge pill color="success">Approved</Badge>
                        </Center>
                    );

                if (status === "rejected")
                    return (
                        <Center>
                            <Badge pill color="danger">Rejected</Badge>
                        </Center>
                    );

                return (
                    <Center>
                        <Badge pill color="secondary">Unknown</Badge>
                    </Center>
                );
            },
            width: "140px",
        },
        {
            name: <Center>Days</Center>,
            cell: (row) => (
                <Center>{getDaysCount(row?.from, row?.to)}</Center>
            ),
            width: "120px",
        },
        {
            name: <Center>Reason</Center>,
            cell: (row) => <Center>{row?.reason || "-"}</Center>,
            wrap: true,
            minWidth: "220px",
        },
        ...(activeTab === "pending" ? [
            {
                name: "Action",
                cell: (row) =>
                    (!hasWrite && !hasDelete) ? (
                        <span className="text-muted">—</span>
                    ) : row?.status?.toLowerCase() === "pending" ? (
                        <div className="d-flex gap-2 justify-content-center">

                            <button
                                className="btn btn-sm btn-success"
                                disabled={loadingId === row._id}
                                onClick={() => handleAction(row, "approved")}
                            >
                                {loadingId === row._id ? <Spinner size="sm" /> : "Approve"}

                            </button>

                            <button
                                className="btn btn-sm btn-danger"
                                disabled={loadingId === row._id}
                                onClick={() => handleAction(row, "rejected")}
                            >
                                {loadingId === row._id ? <Spinner size="sm" /> : "Reject"}

                            </button>

                        </div>
                    ) : (
                        <span className="text-muted">—</span>
                    ),
                width: "200px",
            },
        ] : []),
        ...(activeTab !== "pending" ? [
            {
                name: <Center>Action On</Center>,
                cell: (row) => <Center>{formatDate(row?.actionOn)}</Center>,
                width: "140px",
            },
            {
                name: <Center>Action By</Center>,
                cell: (row) => <Center>{row?.approveBy || "-"}</Center>,
                width: "140px",
            },
        ] : []),

    ];