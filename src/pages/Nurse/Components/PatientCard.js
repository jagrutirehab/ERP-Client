import { useState } from "react";
import { Card, CardBody, CardTitle, CardText, Badge } from "reactstrap";
import InfoModal from "./InfoModal";
import { Link } from "react-router-dom";

const statusColors = {
  Urgent: { color: "danger", border: "#ff4d4f" },
  Attention: { color: "warning", border: "#faad14" },
  Stable: { color: "success", border: "#52c41a" },
};

const PatientCard = ({ patient }) => {
  const [alertModal, setAlertModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const { color, border } = statusColors[patient.status] || {
    color: "secondary",
    border: "#d9d9d9",
  };

  const toggleAlertsModal = () => {
    setAlertModal((prev) => !prev);
  };

  const toggleNotesModal = () => {
    setNotesModal((prev) => !prev);
  };

  const closeAlertModal = () => {
    toggleAlertsModal();
  };

  const closeNotesModal = () => {
    toggleNotesModal();
  };

  return (
    <>
      <Card
        className="position-relative shadow-sm border-1"
        style={{ width: "20rem", borderTop: `4px solid ${border}` }}
      >
        <Badge
          color={color}
          className="position-absolute top-0 end-0 rounded-0 rounded-bottom-start fw-bold"
          style={{ padding: "4px 10px" }}
        >
          {patient.status}
        </Badge>

        <CardBody>
          <Link
            to={`/nurse/p/${patient.id}`}
            className="text-decoration-none text-body-secondary"
          >
            <CardTitle tag="h5" className="mb-1 fw-semibold">
              {patient.name}
            </CardTitle>
            <CardText className="text-muted mb-3">
              Room {patient.room}
              {/* / Bed {patient.bed} */}
            </CardText>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="text-danger me-1">❤️</span>
              <strong>HR: </strong> {patient.vitals.hr}
              <span className="ms-3">
                <strong>BP: </strong> {patient.vitals.bp}
              </span>
            </div>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="me-1">🌡️</span>
              <strong>Temp: </strong> {patient.vitals.temp}
            </div>

            <div className="d-flex align-items-center text-body-secondary">
              <span className="me-1">📅</span>
              <strong>{patient.nextAction}</strong>
            </div>
          </Link>

          <div className="d-flex gap-2 mt-3 align-items-end justify-content-end">
            <button
              type="button"
              onClick={(e) => toggleAlertsModal(e)}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <Badge
                pill
                className={`fw-bold ${
                  patient.alerts.length > 0
                    ? `bg-${color} bg-opacity-25 text-${color}`
                    : "bg-secondary bg-opacity-25 text-secondary"
                }`}
              >
                {patient.alerts.length} Alerts
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => toggleNotesModal(patient.notes)}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <Badge
                pill
                className={`fw-bold ${
                  patient.notes.length > 0
                    ? "bg-primary bg-opacity-25 text-primary"
                    : "bg-secondary bg-opacity-25 text-secondary"
                }`}
              >
                {patient.notes.length} Notes
              </Badge>
            </button>
          </div>
        </CardBody>
      </Card>
      <InfoModal
        show={alertModal}
        title={"Alerts"}
        onCloseClick={closeAlertModal}
        content={patient.alerts}
      />
      <InfoModal
        show={notesModal}
        title={"Notes"}
        onCloseClick={closeNotesModal}
        content={patient.notes}
      />
    </>
  );
};

export default PatientCard;
