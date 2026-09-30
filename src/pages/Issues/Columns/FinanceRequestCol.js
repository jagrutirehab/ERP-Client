import { Badge, Button, Spinner } from "reactstrap";
import { normalizeDates } from "../Helpers/normalizeDates";
import { getStatusColor } from "../Helpers/getStatusColor";
import { getNextStatus, returnButtonText } from "../Helpers/getNextStatus";
import Select from "react-select";

export const FinanceIssuesReqColumn = (
    handleUpdate,
    activeTab,
    loadingId,
    hr,
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
) => {
    return [
        {
            name: <div className="text-center">Issue-Id</div>,
            selector: (row) => row?.issueNumber || "-",
            // center: true,
            width: "160px",
        },
        {
            name: <div className="text-center">Author</div>,
            selector: (row) => row?.author?.name || "-",
            width: "160px",
        },
        {
            name: <div className="text-center">Contact</div>,
            selector: (row) => row?.contact || "-",
            width: "160px",
        },
        {
            name: <div className="text-center">Requested For</div>,
            selector: (row) => row?.requestedFrom?.name || "-",
            width: "210px",
        },
        {
            name: <div className="text-center">Center</div>,
            selector: (row) => row?.center?.title || "-",
            width: "160px",
        },
        {
            name: <div className="text-center">Request Type</div>,
            selector: (row) => row?.financeIssue?.financeIssueType || "-",
            width: "200px",
            wrap: true,
        },
        // {
        //     name: <div className="text-center">Manager</div>,
        //     selector: (row) => row?.hrIssue?.manager?.name || "-",
        //     width: "210px",
        // },
        {
            name: <div className="text-center">Description</div>,
            selector: (row) => row?.financeIssue?.description || "-",
            width: "160px",
            wrap: true,
        },
        {
            name: <div className="text-center">Images</div>,
            width: "140px",
            cell: (row) => (
                <span
                    style={{ color: "#0d6efd", cursor: "pointer", fontWeight: "500" }}
                    onClick={() => handleViewImages(row?.financeIssue?.files)}
                >
                    View Images
                </span>
            ),
        },
        // {
        //     name: <div className="text-center">Manager's Approval</div>,
        //     width: "180px",
        //     // center: true,
        //     cell: (row) => {
        //         const status = row?.hrIssue?.status;
        //         console.log("row", row);


        //         return (
        //             <Badge color={getStatusColor(status)} pill>
        //                 {status?.replaceAll("_", " ") || "-"}
        //             </Badge>
        //         );
        //     },
        // },
        {
            name: <div className="text-center">Issue's Status</div>,
            width: "180px",
            // center: true,
            cell: (row) => {
                const status = row?.status;


                return (
                    <Badge color={getStatusColor(status)} pill>
                        {status?.replaceAll("_", " ") || "-"}
                    </Badge>
                );
            },
        },
        ...(activeTab === "approved" ? [
            {
                name: <div className="text-center">Assigned to</div>,
                selector: (row) => row?.assignedTo?.name || "-",
                width: "210px",
            },
        ] : []),

        ...(canChangeStatus ? [
            ...(activeTab === "pending" ? [
                {
                    name: <div className="text-center">Assign Employee</div>,
                    cell: (row) => (
                        <Select
                            options={hr || []}
                            placeholder="Select HR"
                            value={selectedHRs[row._id] || null}
                            onInputChange={(value) => { loadHR(value); }}
                            filterOption={() => true}
                            styles={{
                                container: (base) => ({ ...base, width: 180 }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                            onChange={(selected) =>
                                setSelectedHRs((prev) => ({
                                    ...prev,
                                    [row._id]: selected,
                                }))
                            }
                        />
                    ),
                    width: "220px",
                },
            ] : []),
            ...(activeTab === "pending"
                ? [
                    {
                        name: "Actions",
                        cell: (row) => (
                            <div className="d-flex gap-2">
                                {/* APPROVE */}
                                {/* APPROVE */}
                                <button
                                    className={`btn btn-sm ${!selectedHRs[row._id] ? "btn-light text-muted" : "btn-success"
                                        }`}
                                    style={{
                                        cursor: !selectedHRs[row._id] ? "not-allowed" : "pointer",
                                        opacity: !selectedHRs[row._id] ? 0.6 : 1,
                                    }}
                                    onClick={() => {
                                        if (!selectedHRs[row._id]) return;
                                        setSelectedRowId(row._id);
                                        setActionType("approved");
                                        setShowModal(true);
                                    }}
                                    disabled={loadingId === row._id}
                                >
                                    {loadingId === row._id ? <Spinner size="sm" /> : "Approve"}
                                </button>

                                {/* REJECT */}
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => {
                                        setSelectedRowId(row._id);
                                        setActionType("rejected");
                                        setShowModal(true);
                                    }}
                                    disabled={loadingId === row._id}
                                >
                                    {loadingId === row._id ? <Spinner size="sm" /> : "Reject"}
                                </button>
                            </div>
                        ),
                        width: "180px",
                    },
                ]
                : []),
        ] : []),

        ...(activeTab !== "pending" ? [
            {
                name: <div className="text-center">{activeTab === "approved" ? "Approved" : "Rejected"} on</div>,
                selector: (row) => normalizeDates(row?.financeIssue?.actionOn) || "-",
                // center: true,
                width: "180px",
            },
        ] : []),
        ...(activeTab !== "pending"
            ? [
                {
                    name: <div className="text-center">Notes</div>,
                    width: "160px",
                    cell: (row) => {
                        console.log("row", row);

                        const note =
                            row?.notes?.filter((d) => ["assigned", "rejected"].includes(d.status))?.[0]?.note || "-";

                        return (
                            <div
                                style={{
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                    lineHeight: "1.4",
                                }}
                            >
                                {note}
                            </div>
                        );
                    },
                },
            ]
            : []),
    ]
}