import { format } from "date-fns";
import { Badge, Button } from "reactstrap";
import { downloadFile } from "../../../../../Components/Common/downloadFile";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { Trash } from "lucide-react";

export const attendanceImportHistoryColumns = ({
    hasDeletePermission,
    onDelete,
}) => [
        {
            name: <div>Upload Date</div>,
            selector: row => {
                const createdAt = row?.createdAt;
                if (!createdAt || isNaN(new Date(createdAt))) {
                    return "-"
                }
                return format(new Date(createdAt), "dd MMM yyyy, hh:mm a");
            },
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Generation Date</div>,
            selector: row => row?.generatedOn || "-",
            wrap: true,
            minWidth: "120px"
        },
        {
            name: <div>Center</div>,
            selector: row => capitalizeWords(row?.center?.title || "-"),
            wrap: true
        },
        {
            name: <div>Total Count</div>,
            selector: row => row?.totalRows,
            wrap: true
        },
        {
            name: <div>Success Count</div>,
            selector: row => row?.successRows,
            wrap: true
        },
        {
            name: <div>Skipped Count</div>,
            selector: row => row?.skippedRows,
            wrap: true
        },
        {
            name: <div>Failed Count</div>,
            selector: row => row?.failed?.count,
            wrap: true
        },
        {
            name: <div>Failed File</div>,
            selector: row => row?.failed?.url,
            cell: (row) =>
                row.failed.url ? (
                    <p onClick={() => downloadFile({ url: row.failed.url })}
                        className="text-primary text-decoration-underline cursor-pointer"
                    >
                        Download
                    </p>
                ) : (
                    "-"
                )
        },
        {
            name: <div>Uploaded By</div>,
            selector: row => (
                <div>
                    <div>{capitalizeWords(row?.author?.name || "-")}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        {row?.author?.email || "-"}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: "180px"
        },
        {
            name: <div>Status</div>,
            cell: (row) => {
                const status = row?.status;

                const statusMap = {
                    PENDING: "warning",
                    PROCESSING: "info",
                    COMPLETED: "success",
                    FAILED: "danger",
                };

                return (
                    <Badge color={statusMap[status] || "secondary"}>
                        {status || "-"}
                    </Badge>
                );
            },
            center: true,
        },
        ...(hasDeletePermission
            ? [
                {
                    name: <div>Action</div>,
                    cell: (row) => (
                        <Button
                            color="danger"
                            size="sm"
                            className="text-white"
                            onClick={() => onDelete(row?._id)}
                        >
                            <Trash size={"20"} />
                        </Button>
                    ),
                    center: true,
                    minWidth: "120px",
                },
            ]
            : []),
    ];