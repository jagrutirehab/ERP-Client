import { useState } from "react";
import { Card, CardBody, CardTitle, CardText, Badge } from "reactstrap";
import { Link } from "react-router-dom";

const statusColors = {
  urgent: { color: "danger", border: "#ff4d4f" },
  attention: { color: "warning", border: "#faad14" },
  stable: { color: "success", border: "#52c41a" },
};

const toTitleCase = (text) => {
  if(!text) return;
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const PatientCard = ({ patient, toggleAlertsModal, prevPatientId, nextPatientId }) => {
  const [showAllMedicines, setShowAllMedicines] = useState(false);

  const { color, border } = statusColors[patient.flag] || {
    color: "secondary",
    border: "#d9d9d9",
  };

  const vitals =
    Array.isArray(patient.vitals) && patient.vitals.length > 0
      ? patient.vitals[0]
      : null;
  return (
    <>
      <Card
        className="position-relative shadow-sm border-1 w-100 h-100"
        style={{
          borderTop: `4px solid ${border}`,
          minHeight: "200px",
        }}
      >
        <Badge
          color={color}
          className="position-absolute top-0 end-0 rounded-0 rounded-bottom-start fw-bold"
          style={{ padding: "4px 10px", fontSize: "0.8rem" }}
        >
          {toTitleCase(patient.flag)}
        </Badge>

        <CardBody className="d-flex flex-column h-100">
          <Link
            to={`/nurse/p/${patient._id}`}
            className="text-decoration-none text-body-secondary flex-grow-1"
          >
            <CardTitle tag="h5" className="mb-2 fw-semibold">
              {toTitleCase(patient.name)}
            </CardTitle>
            <CardText className="text-muted mb-3">Room {30}</CardText>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="text-danger me-2">❤️</span>
              <span>
                <strong>HR:</strong>{" "}
                {vitals?.pulse?.trim() !== "" ? vitals?.pulse : "N/A"}
              </span>
              <span className="ms-3">
                <strong>BP:</strong>{" "}
                {vitals?.bloodPressure
                  ? vitals.bloodPressure.systolic?.trim() &&
                    vitals.bloodPressure.diastolic?.trim()
                    ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`
                    : "N/A"
                  : "N/A"}
              </span>
            </div>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="me-2">🌡️</span>
              <span>
                <strong>Temp:</strong>{" "}
                {vitals?.temprature ? vitals.temprature.trim() !== ""
                  ? `${vitals?.temprature} \u00B0F`
                  : "N/A":"N/A"}
              </span>
            </div>

            {patient.medicinesToTakeNow &&
            patient.medicinesToTakeNow.length > 0 ? (
              <div className="mt-2 mb-2">
                <div className="bg-info bg-opacity-10 border border-info border-opacity-25 rounded p-2">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center">
                      <span className="me-2 fs-6">💊</span>
                      <small className="text-info fw-bold">
                        MEDICATIONS DUE
                      </small>
                    </div>
                    {patient.medicinesToTakeNow.length > 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowAllMedicines(!showAllMedicines);
                        }}
                        className="btn btn-link btn-sm p-0 text-info text-decoration-none"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {showAllMedicines
                          ? "Show Less"
                          : `+${patient.medicinesToTakeNow.length - 2} more`}
                      </button>
                    )}
                  </div>
                  <div>
                    {(showAllMedicines
                      ? patient.medicinesToTakeNow
                      : patient.medicinesToTakeNow.slice(0, 2)
                    ).map((medicine, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center text-body-secondary mb-1"
                      >
                        <span className="me-2">•</span>
                        <span className="fw-semibold small">{medicine}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 mb-2">
                <div className="bg-light-green border border-success border-opacity-10 rounded p-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <span className="text-success me-2">✓</span>
                    <small className="text-muted">
                      No medications due at this time
                    </small>
                  </div>
                </div>
              </div>
            )}
          </Link>

          <div className="d-flex gap-2 mt-auto align-items-end justify-content-end">
            <button
              type="button"
              onClick={(e) => toggleAlertsModal(e)}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <Badge
                pill
                className={`fw-bold ${
                  patient.alertCount > 0
                    ? `bg-${color} bg-opacity-25 text-${color}`
                    : "bg-secondary bg-opacity-25 text-secondary"
                }`}
                style={{ fontSize: "0.8rem", padding: "4px 8px" }}
              >
                {patient.alertCount} Alerts
              </Badge>
            </button>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default PatientCard;
