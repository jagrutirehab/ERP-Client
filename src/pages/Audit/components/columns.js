import { Badge } from "reactstrap";
import { Eye } from "lucide-react";
import { formatAuditDate } from "../../../utils/auditDate";

// Columns for the reviewed-history tabs (Verified / Rejected). Pending
// locations are rendered as cards instead — see PendingReviewCard.js — because
// they need room for the rating comments.

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const statusColorMap = {
  uploaded: "warning",
  verified: "success",
  rejected: "danger",
};

const formatDateTime = (date) => {
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

// The full location path: "Floor 1 / Room 1 / Bathroom 1", innermost emphasised.
const LocationBreadcrumb = ({ row }) => {
  const segments =
    row?.locationSegments?.length > 0
      ? row.locationSegments
      : [row?.locationLabel].filter(Boolean);

  if (segments.length === 0) return <Center>-</Center>;

  return (
    <div className="w-100 text-center" title={segments.join(" / ")}>
      <span style={{ fontSize: 12, lineHeight: 1.4 }}>
        {segments.map((segment, idx) => {
          const isLast = idx === segments.length - 1;
          return (
            <span key={idx}>
              {idx > 0 && <span className="text-muted mx-1">/</span>}
              <span className={isLast ? "fw-semibold" : "text-muted"}>
                {segment}
              </span>
            </span>
          );
        })}
      </span>
    </div>
  );
};

export const CenterFloorPhotosColumn = ({ statusTab, onPreview }) => [
  {
    name: <Center>Audit Date</Center>,
    cell: (row) => <Center>{formatAuditDate(row?.auditDate)}</Center>,
    width: "130px",
  },
  {
    name: <Center>Center</Center>,
    cell: (row) => (
      <div
        className="text-truncate mx-auto"
        style={{ maxWidth: 170 }}
        title={row?.centerName}
      >
        {row?.centerName || "-"}
      </div>
    ),
    width: "180px",
  },
  {
    name: <Center>Location</Center>,
    cell: (row) => <LocationBreadcrumb row={row} />,
    minWidth: "230px",
    wrap: true,
  },
  {
    name: <Center>Photos</Center>,
    cell: (row) => {
      const files = row?.files || [];

      if (files.length === 0) {
        return <div className="text-muted small py-2">No photos</div>;
      }

      return (
        <div className="d-flex flex-wrap gap-1 py-2 justify-content-center w-100">
          {files.map((file, idx) => (
            <button
              key={file._id}
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 px-2 py-0"
              title={file.fileName}
              style={{ fontSize: 11 }}
              onClick={() =>
                onPreview(
                  file,
                  files.length > 1
                    ? `${row.locationLabel} (${idx + 1})`
                    : row.locationLabel,
                )
              }
            >
              <Eye size={12} />
              {idx + 1}
            </button>
          ))}
        </div>
      );
    },
    minWidth: "150px",
    wrap: true,
  },
  ...(statusTab === "verified"
    ? [
        {
          name: <Center>Assessment</Center>,
          cell: (row) => {
            const assessment = row?.assessment || {};
            if (
              !assessment.cleanliness?.rating &&
              !assessment.safety?.rating
            ) {
              return <Center>-</Center>;
            }
            return (
              <div className="py-2 w-100">
                <RatedDimension
                  label="Cleanliness"
                  entry={assessment.cleanliness}
                />
                <RatedDimension label="Safety" entry={assessment.safety} />
              </div>
            );
          },
          minWidth: "240px",
          wrap: true,
        },
      ]
    : []),
  ...(statusTab === "rejected"
    ? [
        {
          name: <Center>Reason</Center>,
          cell: (row) => (
            <div
              className="text-danger small py-2 w-100 text-center"
              title={row?.remarks}
            >
              {row?.remarks || "-"}
            </div>
          ),
          minWidth: "220px",
          wrap: true,
        },
      ]
    : []),
  {
    name: <Center>Uploaded By</Center>,
    cell: (row) => {
      const names = [
        ...new Set(
          (row?.files || []).map((f) => f.uploadedBy?.name).filter(Boolean),
        ),
      ];
      return (
        <div
          className="text-truncate mx-auto small"
          style={{ maxWidth: 150 }}
          title={names.join(", ")}
        >
          {names.length ? names.join(", ") : "-"}
        </div>
      );
    },
    width: "160px",
  },
  {
    name: <Center>Reviewed By</Center>,
    cell: (row) => (
      <div className="text-center small" title={row?.verifiedBy?.email}>
        {row?.verifiedBy?.name || "-"}
      </div>
    ),
    width: "160px",
  },
  {
    name: <Center>Action At</Center>,
    cell: (row) => (
      <Center>
        <span className="small text-muted">
          {formatDateTime(row?.actionedAt)}
        </span>
      </Center>
    ),
    width: "180px",
  },
  {
    name: <Center>Status</Center>,
    cell: (row) => (
      <Badge
        pill
        color={statusColorMap[row?.status] || "secondary"}
        className="text-capitalize"
        style={{ fontSize: 11 }}
      >
        {row?.status}
      </Badge>
    ),
    width: "110px",
  },
];
