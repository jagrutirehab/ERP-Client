import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Calendar,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { Badge, Collapse } from "reactstrap";

const ActivityCard = ({ medicines, status }) => {
    console.log(status)
  const [expandedDates, setExpandedDates] = useState({});

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return medicines?.activities?.length > 0 ? (
    <div className="space-y-4">
      {medicines.activities.map((dateGroup) => (
        <div key={dateGroup.date} className="border rounded-lg overflow-hidden">
          <div
            className="d-flex justify-content-between align-items-center p-3 bg-light cursor-pointer"
            onClick={() => toggleDate(dateGroup.date)}
          >
            <div className="d-flex align-items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <h6 className="mb-0 fw-bold">{formatDate(dateGroup.date)}</h6>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge color="primary" pill>
                {dateGroup.medicines.length} medication(s)
              </Badge>
              {expandedDates[dateGroup.date] ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </div>
          </div>

          <Collapse isOpen={expandedDates[dateGroup.date]}>
            <div className="p-3 space-y-3">
              {dateGroup.medicines.map((med) => (
                <div
                  key={med._id}
                  className="border rounded-lg p-3 bg-white shadow-sm"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {
                          (status === "completed" ? (
                            <CheckCheck size={16} className="text-success" />
                          ) : (
                            <XCircle size={16} className="text-danger" />
                          ))
                        }
                        <h6 className="fw-bold text-dark mb-0">
                          {med?.medicineName}
                        </h6>
                      </div>

                      <small className="text-muted d-flex flex-wrap align-items-center gap-2">
                        <span>
                          <strong>Dosage:</strong> x{med?.dosage}
                        </span>
                        <span>
                          <strong>Intake:</strong> {med?.intake}
                        </span>
                        <span>
                          <strong>Time:</strong>
                          <Badge
                            color="light"
                            className="ms-1 border text-primary"
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: "600",
                              padding: "0.15rem 0.4rem",
                            }}
                          >
                            {med?.slot?.toUpperCase() || ""}
                          </Badge>
                        </span>
                        {status === "completed" && 
                         ( <span>
                            <strong>Marked at:</strong>{" "}
                            {moment(med?.takenAt).format(
                              "MMMM Do YYYY, h:mm:ss a"
                            )}
                          </span>)
                         } 
                      </small>
                    </div>

                    {status === "completed" && (
                      <Badge
                        color="success"
                        pill
                        className="ms-3 d-flex align-items-center gap-1"
                        style={{
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        <CheckCircle size={14} />
                        Marked
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Collapse>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-4">
      {status === "completed" ? (
        <Clock size={48} className="text-muted mb-2 opacity-75" />
      ) : (
        <CheckCircle size={48} className="text-success mb-2 opacity-75" />
      )}

      <h6 className="text-muted">
        No {status === "completed" ? "Completed" : "Missed"} medications
      </h6>
      <p className="text-muted small">
        {status === "completed"
          ? "Medications will appear here once they are marked"
          : "All medications have been administered"}
      </p>
    </div>
  );
};

export default ActivityCard;
