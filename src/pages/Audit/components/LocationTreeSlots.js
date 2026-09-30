import React from "react";
import { Row, Button, Badge } from "reactstrap";
import DocPreview from "../../Authentication/Components/DocPreview";
import { summariseBranch } from "../../../utils/locationTree";

const statusColorMap = {
  uploaded: "warning",
  verified: "success",
  rejected: "danger",
};

const statusLabelMap = {
  uploaded: "Verification Pending",
  verified: "Verified",
  rejected: "Rejected",
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

// One photo-collecting location. Status, score and remarks are shown once here
// rather than on every thumbnail, because they describe the location.
const SlotBlock = ({ node, editable, hasWrite, hasDelete, onUpload, onDelete }) => {
  const slot = node.slot;
  const files = slot.files || [];
  const assessment = slot.assessment || {};

  return (
    <div className="mb-4">
      <div className="d-flex align-items-start justify-content-between mb-2 gap-2">
        <div>
          <p className="fw-semibold mb-1">
            {node.name}
            {slot.markMandatory && <span className="text-danger ms-1">*</span>}
            {slot.status && (
              <Badge
                color={statusColorMap[slot.status] || "secondary"}
                className="ms-2 fw-normal"
                style={{ fontSize: 10 }}
              >
                {statusLabelMap[slot.status] || slot.status}
              </Badge>
            )}
          </p>

          {slot.status === "verified" && (
            <p className="text-muted small mb-0">
              <i className="ri-star-fill text-warning me-1" />
              Cleanliness {assessment.cleanliness?.rating ?? "-"}/5 · Safety{" "}
              {assessment.safety?.rating ?? "-"}/5
              {slot.actionedAt && ` · ${formatDateTime(slot.actionedAt)}`}
            </p>
          )}

          {slot.status === "rejected" && slot.remarks && (
            <p className="text-danger small mb-0">
              <i className="ri-chat-1-line me-1" />
              {slot.remarks}
            </p>
          )}
        </div>

        {editable && hasWrite && slot.status !== "verified" && (
          <Button
            color="primary"
            size="sm"
            className="flex-shrink-0"
            onClick={() => onUpload(slot)}
          >
            <i className="ri-upload-2-line me-1" />
            {files.length > 0 ? "Upload More" : "Upload"}
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="border rounded p-3 text-center text-muted bg-light small">
          No photos uploaded
        </div>
      ) : (
        <Row>
          {files.map((file, index) => (
            <DocPreview
              key={file._id || index}
              label={node.name}
              url={file.fileUrl}
              detail={file.fileName}
              uploadedAt={file.uploadedAt}
              onDelete={
                editable && hasDelete && slot.status !== "verified"
                  ? () => onDelete(slot.recordId, file)
                  : undefined
              }
            />
          ))}
        </Row>
      )}
    </div>
  );
};

// A node with children is a grouping header; only leaves collect photos.
const LocationNode = ({ node, editable, hasWrite, hasDelete, onUpload, onDelete }) => {
  const isLeaf = node.children.length === 0 && node.slot;

  if (isLeaf) {
    return (
      <SlotBlock
        node={node}
        editable={editable}
        hasWrite={hasWrite}
        hasDelete={hasDelete}
        onUpload={onUpload}
        onDelete={onDelete}
      />
    );
  }

  const counts = summariseBranch(node);

  return (
    <div className={node.level === 0 ? "mb-4 pb-2 border-bottom" : "mb-3"}>
      <div className="d-flex align-items-center gap-2 mb-2">
        <i
          className={
            node.level === 0 ? "ri-building-4-line" : "ri-door-open-line"
          }
          style={{ color: "#6c757d" }}
        />
        {node.level === 0 ? (
          <h6 className="fw-semibold mb-0">{node.name}</h6>
        ) : (
          <span className="fw-semibold small">{node.name}</span>
        )}
        <Badge
          color="light"
          className="text-dark border fw-normal"
          style={{ fontSize: 10 }}
        >
          {counts.filled} of {counts.total} done
        </Badge>
      </div>

      <div className="ps-3 border-start">
        {node.children.map((child) => (
          <LocationNode
            key={child.key}
            node={child}
            editable={editable}
            hasWrite={hasWrite}
            hasDelete={hasDelete}
            onUpload={onUpload}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

const LocationTreeSlots = ({
  tree = [],
  editable,
  hasWrite,
  hasDelete,
  onUpload,
  onDelete,
}) => (
  <>
    {tree.map((node) => (
      <LocationNode
        key={node.key}
        node={node}
        editable={editable}
        hasWrite={hasWrite}
        hasDelete={hasDelete}
        onUpload={onUpload}
        onDelete={onDelete}
      />
    ))}
  </>
);

export default LocationTreeSlots;
