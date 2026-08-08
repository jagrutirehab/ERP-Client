import React from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Input,
  Label,
  Button,
  Badge,
  Spinner,
} from "reactstrap";
import { Eye, Check, X } from "lucide-react";
import StarRating from "./StarRating";
import { formatAuditDate } from "../../../utils/auditDate";

const DIMENSIONS = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "safety", label: "Safety" },
];

const Breadcrumb = ({ segments }) => {
  if (!segments?.length) return <span className="text-muted">-</span>;
  return (
    <span>
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
  );
};

/**
 * One pending location, laid out as a card rather than a table row so the
 * cleanliness and safety comments get usable width and height.
 */
const PendingReviewCard = ({
  row,
  draft,
  setDraft,
  canReview,
  savingRowId,
  onPreview,
  onApprove,
  onReject,
}) => {
  const files = row?.files || [];
  const segments =
    row?.locationSegments?.length > 0
      ? row.locationSegments
      : [row?.locationLabel].filter(Boolean);

  const approving = savingRowId === `verified-${row._id}`;
  const rejecting = savingRowId === `rejected-${row._id}`;
  const busy = !!savingRowId;

  const ready = !!draft?.cleanliness?.rating && !!draft?.safety?.rating;

  const update = (dimension, field, value) =>
    setDraft(row._id, {
      ...draft,
      [dimension]: { ...(draft?.[dimension] || {}), [field]: value },
    });

  return (
    // h-100 so two cards sharing a row line up.
    <Card
      className="h-100 shadow-sm"
      style={{
        opacity: busy && (approving || rejecting) ? 0.6 : 1,
        borderLeft: "3px solid #f59f00",
      }}
    >
      <CardBody className="p-3 d-flex flex-column">
        {/* ── Identity ─────────────────────────────────────────────────── */}
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-3">
          <div>
            <div style={{ fontSize: 14 }}>
              <Breadcrumb segments={segments} />
            </div>
            <div className="text-muted mt-1" style={{ fontSize: 11 }}>
              <i className="ri-hospital-line me-1" />
              {row?.centerName || "-"}
              <span className="mx-2">·</span>
              <i className="ri-calendar-line me-1" />
              {formatAuditDate(row?.auditDate)}
            </div>
          </div>

          <div className="d-flex align-items-center gap-1 flex-wrap">
            {files.length === 0 ? (
              <Badge color="light" className="text-dark border fw-normal">
                No photos
              </Badge>
            ) : (
              files.map((file, idx) => (
                <button
                  key={file._id}
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 px-2 py-0"
                  style={{ fontSize: 11 }}
                  title={file.fileName}
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
                  Photo {idx + 1}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Ratings ──────────────────────────────────────────────────── */}
        {/* The card is half-width from lg, so the two panels stack to keep each
            comment box readable, and only sit side by side once there is real
            room at xxl. */}
        <Row className="g-3">
          {DIMENSIONS.map((dimension) => {
            const value = draft?.[dimension.key] || { rating: 0, comment: "" };
            return (
              <Col md={6} lg={6} key={dimension.key}>
                <div className="border rounded p-2 h-100 bg-light bg-opacity-50">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <Label className="mb-0 fw-semibold" style={{ fontSize: 12 }}>
                      {dimension.label}
                      <span className="text-danger ms-1">*</span>
                    </Label>
                    <StarRating
                      size={18}
                      value={value.rating}
                      disabled={!canReview || busy}
                      onChange={(rating) =>
                        update(dimension.key, "rating", rating)
                      }
                    />
                  </div>
                  <Input
                    type="textarea"
                    rows={3}
                    bsSize="sm"
                    placeholder={`${dimension.label} notes (optional)`}
                    value={value.comment || ""}
                    disabled={!canReview || busy}
                    onChange={(e) =>
                      update(dimension.key, "comment", e.target.value)
                    }
                    style={{ fontSize: 12, resize: "vertical" }}
                  />
                </div>
              </Col>
            );
          })}
        </Row>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        {canReview ? (
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mt-3 pt-1 mt-auto">
            {!ready && (
              <span className="text-muted me-auto" style={{ fontSize: 11 }}>
                <i className="ri-information-line me-1" />
                Rate both cleanliness and safety to approve
              </span>
            )}
            <Button
              color="danger"
              outline
              size="sm"
              className="d-inline-flex align-items-center gap-1"
              disabled={busy}
              onClick={() => onReject(row)}
            >
              {rejecting ? (
                <Spinner size="sm" style={{ width: 12, height: 12 }} />
              ) : (
                <X size={14} />
              )}
              Reject
            </Button>
            <Button
              color="success"
              size="sm"
              className="d-inline-flex align-items-center gap-1"
              disabled={!ready || busy}
              onClick={() => onApprove(row)}
            >
              {approving ? (
                <Spinner size="sm" style={{ width: 12, height: 12 }} />
              ) : (
                <Check size={14} />
              )}
              Approve
            </Button>
          </div>
        ) : (
          <div className="text-end mt-3 mt-auto">
            <Badge color="warning" pill style={{ fontSize: 10 }}>
              Pending verification
            </Badge>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PendingReviewCard;
