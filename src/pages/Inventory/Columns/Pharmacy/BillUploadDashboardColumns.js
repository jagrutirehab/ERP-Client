import { Button } from "reactstrap";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";

export const billUploadDashboardColumns = ({
    navigate,
    hasWritePermission,
    handleDownloadConsolidatedReport,
    setPreviewFile,
    setPreviewOpen,
    showBillDetails
}) => [
        {
            name: "Bill #",
            selector: (row) => row.extractedData?.billMetadata?.billNumber|| "-",
            cell: (row) => <div className="text-truncate">{row.extractedData?.billMetadata?.billNumber|| "-"}</div>,
            wrap: true,
            minWidth: "120px",
        },
        {
            name: "Supplier",
            selector: (row) =>row.extractedData?.billMetadata?.supplier || "-",
            cell: (row) => <div>{row.extractedData?.billMetadata?.supplier || "-"}</div>,
            wrap: true,
            minWidth: "120px",
        },
        {
            name: "Amount",
            selector: (row) => row.extractedData?.billMetadata?.totalAmount || "-",
            cell: (row) => {
                if (!row.extractedData?.billMetadata?.totalAmount) return "-";
                return <div className="text-end">₹{Number(row.extractedData?.billMetadata?.totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>;
            },
            minWidth: "110px",
            right: true,
        },
        {
            name: "Center",
            selector: (row) => row.center?.title || "-",
            cell: (row) => <div className="text-truncate">{row.center?.title || "-"}</div>,
            wrap: true,
            minWidth: "140px",
        },
        {
            name: "Uploaded By",
            selector: (row) => row.uploadedBy?.name || "-",
            cell: (row) => <div className="text-truncate">{row.uploadedBy?.name || "-"}</div>,
            wrap: true,
            minWidth: "120px",
        },
        {
            name: "Date",
            selector: (row) => new Date(row.createdAt).toLocaleDateString("en-IN") || "-",
            cell: (row) => {
                const date = row.createdAt;
                return date
                    ? new Date(date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })
                    : "-";
            },
            minWidth: "110px",
        },
        {
            name: "Status",
            selector: (row) => row.status || "-",
            cell: (row) => renderStatusBadge(row.status),
            wrap: true,
            minWidth: "140px",
        },
        {
            name: "Found",
            selector: (row) => {
                const total = row.extractedData?.medicines?.length || 0;
                const missing = row.errors?.length || 0;
                return total - missing;
            },
            cell: (row) => {
                const total = row.extractedData?.medicines?.length || 0;
                const missing = row.errors?.length || 0;
                return <div className="text-center">{total - missing}</div>;
            },
            minWidth: "80px",
            center: true,
        },
        {
            name: "Missing",
            selector: (row) => row.errors?.length || 0,
            cell: (row) => <div className="text-center">{row.errors?.length || 0}</div>,
            minWidth: "80px",
            center: true,
        },
        {
            name: "Processed",
            selector: (row) => row.processedItems?.length || 0,
            cell: (row) => <div className="text-center">{row.processedItems?.length || 0}</div>,
            minWidth: "90px",
            center: true,
        },
        {
            name: "Details",
            cell: (row) => (
                <Button
                    size="sm"
                    color="info"
                    className="text-white"
                    onClick={() => showBillDetails(row)}
                >
                    View
                </Button>
            ),
            minWidth: "80px",
            center: true,
        },
        ...(hasWritePermission ? [
            {
                name: "Actions",
                cell: (row) => (
                    <div className="d-flex gap-1 flex-wrap">
                        {(row.errors?.length > 0) && (
                            <Button
                                size="sm"
                                color="primary"
                                className="text-white"
                                onClick={() => navigate("/pharmacy/ocr-bill-import", { state: { retryBillId: row._id } })}
                            >
                                Retry({row.errors?.length})
                            </Button>
                        )}
                    </div>
                ),
                minWidth: "100px",
                center: true,
            },
        ] : []),
        {
            name: "Logs",
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button
                        size="sm"
                        color="primary"
                        onClick={() => handleDownloadConsolidatedReport(row._id, row.billNumber)}
                        className="text-white"
                    >
                        Download
                    </Button>
                </div>
            ),
            minWidth: "120px",
            center: true,
        },
        {
            name: "File",
            selector: (row) => row.fileUrl || "-",
            cell: (row) => {
                if (!row.fileUrl) return <span className="text-muted">-</span>;
                const fileName = row.billFileName || "bill";
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