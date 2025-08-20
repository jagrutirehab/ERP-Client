import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import { Row, Badge, Tooltip } from "reactstrap";
import { getNotesByPatientId } from "../../../store/features/nurse/nurseSlice";
import { useParams } from "react-router-dom";
import moment from "moment";
import Placeholder from "../../Patient/Views/Components/Placeholder";

const Notes = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { notesData, notesLoading } = useSelector((state) => state.Nurse);

  const [expandedNotes, setExpandedNotes] = useState({});
  const [tooltipOpen, setTooltipOpen] = useState(null);

  const MAX_NOTE_LENGTH = 250;

  useEffect(() => {
    if (!id || id === "*") return;
    dispatch(getNotesByPatientId(id));
  }, [dispatch, id]);

  const toggleNoteExpansion = (noteId) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const toggleTooltip = (noteId) => {
    setTooltipOpen(tooltipOpen === noteId ? null : noteId);
  };

  const getBadgeColor = (flag) => {
    switch (flag?.toLowerCase()) {
      case "urgent":
        return "danger";
      case "attention":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="notes-container">
      <Row className="timeline-right" style={{ rowGap: "2rem" }}>
        <GeneralCard data="Notes">
          <div className="notes-content" style={{ padding: "1rem" }}>
            {notesLoading ? (
              <Placeholder />
            ) : notesData?.length > 0 ? (
              <div className="notes-list">
                {notesData.map((note) => {
                  const isExpanded = expandedNotes[note._id];
                  const shouldTruncate = note?.note?.length > MAX_NOTE_LENGTH;
                  const displayText =
                    isExpanded || !shouldTruncate
                      ? note?.note
                      : `${note?.note.substring(0, MAX_NOTE_LENGTH)}...`;

                  const authorRole = note?.author?.role;

                  return (
                    <div
                      key={note._id}
                      className="note-item"
                      style={{
                        marginBottom: "0.75rem",
                        padding: "1rem",
                        backgroundColor: "#fff",
                        border: "1px solid #e9ecef",
                        borderRadius: "6px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="note-header d-flex justify-content-between align-items-start mb-2">
                        <div className="author-info">
                          <div className="d-flex align-items-center">
                            <h6 className="mb-0 text-dark fw-semibold">
                              {note.author.name[0].toUpperCase() +
                                note.author.name.slice(1).toLowerCase()}
                            </h6>
                            {note?.author?.role && (
                              <>
                                <Badge
                                  id={`role-${note._id}`}
                                  color="light"
                                  className="ms-2 border text-primary"
                                  style={{
                                    fontSize: "0.65rem",
                                    fontWeight: "600",
                                    padding: "0.25rem 0.5rem",
                                  }}
                                >
                                  {note?.author?.role}
                                </Badge>
                              </>
                            )}
                          </div>
                          <div className="text-muted small mt-1">
                            <i style={{ fontSize: "13px" }}>
                              {moment(note?.createdAt).format(
                                "MMM D, YYYY • h:mm A"
                              )}
                            </i>
                          </div>
                        </div>
                        {note?.flag && (
                          <Badge
                            color={getBadgeColor(note.flag)}
                            className="text-uppercase"
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "600",
                              letterSpacing: "0.5px",
                              padding: "0.35rem 0.75rem",
                            }}
                          >
                            {note.flag}
                          </Badge>
                        )}
                      </div>

                      <div className="note-content">
                        <p className="mb-0 d-inline">
                          <span
                            className="text-dark"
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {displayText}
                          </span>
                          {shouldTruncate && (
                            <button
                              className="btn btn-link p-0 text-primary small ms-1"
                              onClick={() => toggleNoteExpansion(note._id)}
                            >
                              {isExpanded ? "Show Less" : "Show More"}
                            </button>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted fst-italic">No notes available</p>
            )}
          </div>
        </GeneralCard>
      </Row>
    </div>
  );
};

export default Notes;
