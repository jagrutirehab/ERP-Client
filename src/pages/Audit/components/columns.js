import { Badge, Button } from "reactstrap";
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

const Stars = ({ rating }) => (
  <span style={{ whiteSpace: "nowrap" }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <i
        key={star}
        className={star <= rating ? "ri-star-fill" : "ri-star-line"}
        style={{ fontSize: 12, color: star <= rating ? "#f59f00" : "#ced4da" }}
      />
    ))}
  </span>
);

const RatedDimension = ({ label, entry }) => {
  if (!entry?.rating) return null;
  return (
    <div className="d-flex flex-column align-items-center">
      <span className="small">
        {label} <Stars rating={entry.rating} />{" "}
        <span className="text-muted">{entry.rating}/5</span>
      </span>
      {entry.comment && (
        <span
          className="text-muted"
          style={{ fontSize: 11, lineHeight: 1.3 }}
          title={entry.comment}
        >
          {entry.comment}
        </span>
      )}
    </div>
  );
};

export const CenterFloorPhotosColumn = (
  openReviewModal,
  handleFilePreview,
  statusTab,
  hasPermissionToEdit,
) => [
  {
    name: <Center>Center</Center>,
    cell: (row) => <Truncate maxWidth={200}>{row?.centerName}</Truncate>,
    width: "220px",
  },
  {
    name: <Center>Floor</Center>,
    cell: (row) => (
      <div className="d-flex flex-column align-items-center text-center w-100">
        <Truncate maxWidth={180}>{row?.floorName}</Truncate>
        {row?.legacy && (
          <div
            className="text-muted mt-1"
            style={{ fontSize: 11, lineHeight: 1.3 }}
          >
            <i className="ri-information-line me-1" />
            No longer configured for this center.
          </div>
        )}
      </div>
    ),
    width: "200px",
  },
  {
    name: <Center>Room / Area</Center>,
    cell: (row) => (
      <Truncate maxWidth={160}>{row?.areaName || "—"}</Truncate>
    ),
    width: "180px",
  },
  {
    name: <Center>Photos</Center>,
    cell: (row) => {
      const files = row?.files || [];

      if (files.length === 0) {
        return <div className="text-muted small py-2">No photos uploaded</div>;
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
                onClick={() => {
                  const slotLabel = row.areaName
                    ? `${row.floorName} — ${row.areaName}`
                    : row.floorName;
                  handleFilePreview(
                    file,
                    files.length > 1 ? `${slotLabel} (${idx + 1})` : slotLabel,
                  );
                }}
              >
                <Eye size={14} />
                <span className="small">Photo {idx + 1}</span>
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
    minWidth: "240px",
    wrap: true,
  },
  {
    name: <Center>Uploaded By</Center>,
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
              title={file.uploadedBy?.email}
            >
              {file.uploadedBy?.name || "-"}
            </div>
          ))}
        </div>
      );
    },
    width: "180px",
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
  ...(statusTab === "verified"
    ? [
        {
          name: <Center>Assessment</Center>,
          cell: (row) => {
            const files = row?.files || [];
            if (files.length === 0) return <Center>-</Center>;

            return (
              <div className="d-flex flex-column gap-2 py-2 w-100">
                {files.map((file) => {
                  const assessment = file.assessment || {};
                  const hasAny =
                    assessment.cleanliness?.rating || assessment.safety?.rating;

                  return (
                    <div
                      key={file._id}
                      className="text-center"
                      style={{ minHeight: 32 }}
                    >
                      {hasAny ? (
                        <>
                          <RatedDimension
                            label="Cleanliness"
                            entry={assessment.cleanliness}
                          />
                          <RatedDimension
                            label="Safety"
                            entry={assessment.safety}
                          />
                        </>
                      ) : (
                        <span className="small text-muted">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          },
          minWidth: "260px",
          wrap: true,
        },
      ]
    : []),
  ...(statusTab === "rejected"
    ? [
        {
          name: <Center>Remarks</Center>,
          cell: (row) => {
            const files = row?.files || [];
            if (files.length === 0) return <Center>-</Center>;

            return (
              <div className="d-flex flex-column gap-2 py-2 w-100">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className="text-center small text-danger"
                    style={{ minHeight: 32 }}
                    title={file.remarks}
                  >
                    {file.remarks || "-"}
                  </div>
                ))}
              </div>
            );
          },
          minWidth: "220px",
          wrap: true,
        },
      ]
    : []),
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
          width: "180px",
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
