import { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import { addIssueNote } from "../../../helpers/backend_helper";
import { normalizeDates } from "../Helpers/normalizeDates";
import { getStatusColor } from "../Helpers/getStatusColor";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { normalizeUnderscores } from "../../../utils/normalizeUnderscore";

const NotesTimelineModal = ({ isOpen, toggle, issue, onSaved, canEdit }) => {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const notes = [...(issue?.notes || [])].sort(
    (a, b) => new Date(b?.changedOn) - new Date(a?.changedOn)
  );

  const handleSave = async () => {
    if (!note.trim()) {
      toast.error("Please enter a note");
      return;
    }
    try {
      setSaving(true);
      const response = await addIssueNote({
        issueId: issue?._id,
        note: note.trim(),
      });
      toast.success(response?.message || "Note added");
      setNote("");
      onSaved?.();
      toggle();
    } catch (error) {
      toast.error(error?.message || "Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>
        Notes {issue?.issueNumber ? `— #${issue.issueNumber}` : ""}
      </ModalHeader>

      <ModalBody>
        <div
          style={{
            maxHeight: "320px",
            overflowY: "auto",
            paddingRight: "8px",
            marginBottom: "1rem",
          }}
        >
          {notes.length === 0 ? (
            <div className="text-muted text-center py-3">No notes yet</div>
          ) : (
            <ul className="list-unstyled mb-0" style={{ position: "relative" }}>
              {notes.map((note, idx) => (
                <li
                  key={idx}
                  style={{
                    borderLeft: "2px solid #dee2e6",
                    paddingLeft: "14px",
                    paddingBottom: "14px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "-7px",
                      top: "4px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#0d6efd",
                    }}
                  />
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Badge color={getStatusColor(note?.status)} pill>
                      {capitalizeWords(normalizeUnderscores(note?.status)) || "-"}
                    </Badge>
                    <i className="text-muted">
                      {normalizeDates(note?.changedOn) || "-"}
                    </i>
                  </div>
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      lineHeight: 1.4,
                    }}
                  >
                    {capitalizeWords(note?.note) || <span className="text-muted">(No Note)</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {canEdit && (
          <div className="mb-3">
            <label className="form-label fw-semibold">Add Note</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Write an update..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <small className="text-muted">
              Will be saved against current status:{" "}
              <strong>{capitalizeWords(normalizeUnderscores(issue?.status)) || "-"}</strong>
            </small>
          </div>
        )}

        <div className="d-flex justify-content-end gap-2">
          <Button color="secondary" onClick={toggle} disabled={saving}>
            Close
          </Button>
          {canEdit && (
            <Button color="primary" className="text-white" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Note"}
            </Button>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default NotesTimelineModal;
