import { Badge, Button } from "reactstrap";
import { normalizeDates } from "../Helpers/normalizeDates";
import { getStatusColor } from "../Helpers/getStatusColor";
import { getNextStatus, returnButtonText } from "../Helpers/getNextStatus";

export const FinanceIssuesCol = (
    handleViewDescription,
    handleViewImages,
    activeTab,
    handleAction,
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
            name: <div className="text-center">Issue Type</div>,
            selector: (row) => row?.issueType || "-",
            width: "180px",
        },
        {
            name: <div className="text-center">Request Type</div>,
            selector: (row) => row?.financeIssue?.financeIssueType || "-",
            width: "180px",
        },


        {
            name: <div className="text-center">Description</div>,
            width: "300px",
            cell: (row) => (
                <div
                    style={{
                        maxHeight: "80px",
                        overflowY: "auto",
                        paddingRight: "6px",
                        lineHeight: "1.4",
                        wordBreak: "break-word",
                    }}
                >
                    {row?.financeIssue?.description || "-"}
                </div>
            ),
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

        {
            name: <div className="text-center">Status</div>,
            width: "180px",
            cell: (row) => {
                const status = row?.status;

                return (
                    <Badge color={getStatusColor(status)} pill>
                        {status?.replaceAll("_", " ") || "-"}
                    </Badge>
                );
            },
        },

        {
            name: <div className="text-center">Raised on</div>,
            selector: (row) => normalizeDates(row?.createdAt) || "-",
            width: "180px",
        },



        // ...((activeTab === undefined || activeTab === "" || activeTab === null || activeTab === "resolved")
        //     ? [
        //         ...((activeTab === undefined || activeTab === "" || activeTab === null || activeTab === "resolved")
        //             ? [
        //                 {
        //                     name: <div className="text-center">Approval</div>,
        //                     width: "120px",
        //                     cell: (row) => {
        //                         if (!row?.approval) return "-";

        //                         return row.approval.isApproved ? (
        //                             <Badge color="success">Yes</Badge>
        //                         ) : (
        //                             <Badge color="danger">No</Badge>
        //                         );
        //                     },
        //                 },
        //                 {
        //                     name: <div className="text-center">Approved By</div>,
        //                     selector: (row) =>
        //                         row?.approval?.approvedBy
        //                             ? row.approval.approvedBy.charAt(0).toUpperCase() +
        //                             row.approval.approvedBy.slice(1).toLowerCase()
        //                             : "-",
        //                     width: "160px",
        //                 },

        //             ]
        //             : [])
        //     ]
        //     : []
        // ),



        ...(canChangeStatus && (activeTab !== "resolved" || activeTab === "")
            ? [
                {
                    name: <div className="text-center">Action</div>,
                    width: "200px",
                    cell: (row) => {

                        // prevent button only for resolved rows
                        if (row?.status === "resolved") return "-";

                        return (
                            <Button
                                size="sm"
                                color="primary"
                                onClick={() =>
                                    handleAction({
                                        issue: row,
                                        nextStatus: row?.status
                                    })
                                }
                            >
                                Change Status
                            </Button>
                        );
                    },
                },
            ]
            : [])
    ]

}