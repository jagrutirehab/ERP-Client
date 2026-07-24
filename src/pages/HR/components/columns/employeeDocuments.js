import { Badge, Button, Spinner } from "reactstrap";
import { Eye, Check, X } from "lucide-react";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const Truncate = ({ children, maxWidth = 140 }) => (
  <div
    className="text-truncate mx-auto"
    style={{ maxWidth }}
    title={typeof children === "string" ? children : undefined}
  >
    {children || "-"}
  </div>
);

const statusColorMap = {
  uploaded: "warning",
  verified: "success",
  rejected: "danger",
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const EmployeeDocumentsColumn = (
  openReviewModal,
  handleFilePreview,
  hasWrite,
  statusTab,
  hasPermissionToEdit,
) => [
  {
    name: <Center>ECode</Center>,
    cell: (row) => <Center>{row?.employee?.eCode || "-"}</Center>,
    width: "110px",
  },
  {
    name: <Center>Name</Center>,
    cell: (row) => (
      <Truncate maxWidth={160}>{row?.employee?.name?.toUpperCase()}</Truncate>
    ),
    width: "170px",
  },
  {
    name: <Center>Department</Center>,
    cell: (row) => (
      <Truncate maxWidth={130}>{row?.employee?.department}</Truncate>
    ),
    width: "140px",
  },
  {
    name: <Center>Designation</Center>,
    cell: (row) => (
      <Truncate maxWidth={200}>{row?.employee?.designation}</Truncate>
    ),
    width: "200px",
  },
  {
    name: <Center>Position</Center>,
    cell: (row) => (
      <Truncate maxWidth={200}>{row?.employee?.positionName}</Truncate>
    ),
    width: "200px",
  },
  {
    name: <Center>Center</Center>,
    cell: (row) => (
      <Truncate maxWidth={200}>{row?.employee?.currentLocation}</Truncate>
    ),
    width: "200px",
  },
  {
    name: <Center>Document</Center>,
    cell: (row) => (
      <div className="d-flex flex-column align-items-center text-center w-100">
        <Truncate maxWidth={200}>{row?.docName}</Truncate>
        {row?.legacy && (
          <div
            className="text-muted mt-1"
            style={{ fontSize: 11, lineHeight: 1.3 }}
          >
            <i className="ri-information-line me-1" />
            Retained from a previous position assignment.
          </div>
        )}
      </div>
    ),
    width: "220px",
  },
  {
    name: <Center>Files</Center>,
    cell: (row) => {
      const files = row?.files || [];

      if (files.length === 0) {
        return <div className="text-muted small py-2">No files uploaded</div>;
      }

      return (
        <div className="d-flex flex-column gap-2 py-2 w-100">
          {files.map((file, idx) => (
            <div
              key={file._id}
              className="d-flex align-items-center justify-content-center gap-2 border rounded px-2 py-1"
              style={{ minHeight: 32 }}
            >
              <button
                type="button"
                className="btn btn-link p-0 d-flex align-items-center gap-1 text-decoration-none flex-shrink-0"
                title={file.fileName}
                onClick={() =>
                  handleFilePreview(
                    file,
                    files.length > 1
                      ? `${row.docName} (${idx + 1})`
                      : row.docName,
                  )
                }
              >
                <Eye size={14} />
                <span className="small">File {idx + 1}</span>
              </button>

              <Badge
                pill
                color={statusColorMap[file.status] || "secondary"}
                className="text-capitalize"
                style={{ fontSize: 11 }}
              >
                {file.status}
              </Badge>

              {hasPermissionToEdit && file.status === "uploaded" && (
                <div className="d-flex gap-1 flex-shrink-0">
                  {!row.legacy && (
                    <Button
                      size="sm"
                      color="success"
                      className="d-flex align-items-center justify-content-center p-1"
                      style={{ width: 28, height: 28 }}
                      title="Approve"
                      onClick={() =>
                        openReviewModal(
                          file._id,
                          row._id,
                          file.fileName,
                          "verified",
                        )
                      }
                    >
                      <Check size={14} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    color="danger"
                    className="d-flex align-items-center justify-content-center p-1"
                    style={{ width: 28, height: 28 }}
                    title="Reject"
                    onClick={() =>
                      openReviewModal(
                        file._id,
                        row._id,
                        file.fileName,
                        "rejected",
                      )
                    }
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    },
    minWidth: "220px",
    wrap: true,
  },
  {
    name: <Center>Uploaded At</Center>,
    cell: (row) => {
      const files = row?.files || [];
      if (files.length === 0) return <Center>-</Center>;

      return (
        <div className="d-flex flex-column gap-2 py-2 w-100">
          {files.map((file) => (
            <div
              key={file._id}
              className="text-center small text-muted"
              style={{ minHeight: 32 }}
            >
              {formatDate(file.uploadedAt)}
            </div>
          ))}
        </div>
      );
    },
    width: "200px",
  },
  ...(statusTab !== "uploaded"
    ? [
        {
          name: <Center>Reviewed By</Center>,
          cell: (row) => {
            const files = row?.files || [];
            if (files.length === 0) return <Center>-</Center>;

            return (
              <div className="d-flex flex-column gap-2 py-2 w-100">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className="text-center small"
                    style={{ minHeight: 32 }}
                    title={file.verifiedBy?.email}
                  >
                    {file.status !== "uploaded" && file.verifiedBy?.name
                      ? file.verifiedBy.name
                      : "-"}
                  </div>
                ))}
              </div>
            );
          },
          width: "200px",
        },
        {
          name: <Center>Action At</Center>,
          cell: (row) => {
            const files = row?.files || [];
            if (files.length === 0) return <Center>-</Center>;

            return (
              <div className="d-flex flex-column gap-2 py-2 w-100">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className="text-center small text-muted"
                    style={{ minHeight: 32 }}
                  >
                    {file.status !== "uploaded"
                      ? formatDate(file.actionedAt || row.updatedAt)
                      : "-"}
                  </div>
                ))}
              </div>
            );
          },
          width: "200px",
        },
      ]
    : []),
];
