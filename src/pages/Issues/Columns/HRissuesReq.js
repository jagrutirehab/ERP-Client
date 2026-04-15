import { Badge, Button, Spinner } from "reactstrap";
import { normalizeDates } from "../Helpers/normalizeDates";
import { getStatusColor } from "../Helpers/getStatusColor";
import { getNextStatus, returnButtonText } from "../Helpers/getNextStatus";
import Select from "react-select";

export const HRIssuesReqColumn = (
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
            selector: (row) => row?.hrIssue?.requestType || "-",
            width: "200px",
            wrap: true,
        },
        {
            name: <div className="text-center">Manager</div>,
            selector: (row) => row?.hrIssue?.manager?.name || "-",
            width: "210px",
        },
        {
            name: <div className="text-center">Description</div>,
            selector: (row) => row?.hrIssue?.description || "-",
            width: "160px",
            wrap: true,
        },
        {
            name: <div className="text-center">Manager's Approval</div>,
            width: "180px",
            // center: true,
            cell: (row) => {
                const status = row?.hrIssue?.status;
                console.log("row", row);


                return (
                    <Badge color={getStatusColor(status)} pill>
                        {status?.replaceAll("_", " ") || "-"}
                    </Badge>
                );
            },
        },
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

        ...(canChangeStatus ? [
            ...(activeTab === "pending" ? [
                {
                    name: <div className="text-center">Assign HR</div>,
                    cell: (row) => (
                        <Select
                            options={hr?.map((h) => ({
                                value: h._id,
                                label: h.name,
                            }))}
                            placeholder="Select HR"
                            value={selectedHRs[row._id] || null}
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
                selector: (row) => normalizeDates(row?.hrIssue?.actionOn) || "-",
                // center: true,
                width: "180px",
            },
        ] : []),
        ...(activeTab !== "pending"
            ? [
                {
                    name: <div className="text-center">Manager Note</div>,
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