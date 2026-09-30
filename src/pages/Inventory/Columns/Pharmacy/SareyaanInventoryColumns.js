import { Button } from "reactstrap";
import { capitalizeWords } from "../../../../utils/toCapitalize";

export const sareyaanInventoryColumns = ({
    handleDownloadErrors,
    setPreviewFile,
    setPreviewOpen,
}) => [
        {
            name: "#",
            selector: (row, index) => index + 1,
            cell: (row, index) => (
                <div className="text-muted fw-semibold">{index + 1}</div>
            ),
            width: "60px",
            center: true,
        },
        {
            name: "Uploaded By",
            selector: (row) => row.author?.name || "-",
            cell: (row) => <div className="text-truncate">{capitalizeWords(row.author?.name || "-") }</div>,
            wrap: true,
            minWidth: "140px",
        },
        {
            name: "Center",
            selector: (row) => row.center?.title || "-",
            cell: (row) => <div className="text-truncate">{capitalizeWords(row.center?.title || "-")}</div>,
            wrap: true,
            minWidth: "140px",
        },
        {
            name: "Date",
            selector: (row) => row.createdAt || "-",
            cell: (row) => {
                const date = row.createdAt;
                return date
                    ? new Date(date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "-";
            },
            minWidth: "150px",
        },
        {
            name: "Success",
            selector: (row) => row.successCount || 0,
            cell: (row) => (
                <div className="text-center font-weight-bold">
                    {row.successCount || 0}
                </div>
            ),
            minWidth: "90px",
            center: true,
        },
        {
            name: "Failed",
            selector: (row) => row.failedCount || 0,
            cell: (row) => (
                <div className="text-center font-weight-bold">
                    {row.failedCount || 0}
                </div>
            ),
            minWidth: "90px",
            center: true,
        },
        {
            name: "Error Report",
            cell: (row) => {
                const count = row.errorCount || 0;
                if (count === 0) {
                    return <span className="text-muted">-</span>;
                }
                return (
                    <Button
                        size="sm"
                        color="primary"
                        className="text-white"
                        onClick={() => handleDownloadErrors(row._id)}
                    >
                        Download ({row.errorCount || 0})
                    </Button>
                );
            },
            minWidth: "140px",
            center: true,
        },
        {
            name: "File",
            selector: (row) => row.fileUrl || "-",
            cell: (row) => {
                if (!row.fileUrl) return <span className="text-muted">-</span>;
                const fileName = `sareyaan-import-${row._id}`;
                return (
                    <Button
                        size="sm"
                        color="primary"
                        className="text-white"
                        onClick={() => {
                            setPreviewFile({
                                url: row.fileUrl,
                                name: fileName,
                                originalName: fileName,
                            });
                            setPreviewOpen(true);
                        }}
                    >
                        Preview
                    </Button>
                );
            },
            wrap: true,
            minWidth: "120px",
        },
    ];
