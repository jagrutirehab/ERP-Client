import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Badge,
  CardFooter,
  Button,
  UncontrolledTooltip,
} from "reactstrap";
import PreviewFile from "../../../Components/Common/PreviewFile";
import userDummayImage from "../../../assets/images/users/user-dummy-img.jpg";
import { Link } from "react-router-dom";
import { format, isValid } from "date-fns";

const statusColors = {
  suicidal: { color: "danger", border: "#ffcdd2" },
  runaway: { color: "warning", border: "#ffe0b2" },
  serious: { color: "primary", border: "#fff9c4" },
  aggresive: { color: "secondary", border: "#bbdefb" },
};

const sopStatusConfig = {
  yes: { bg: "#9AD872", text: "#fff", label: "Yes" },
  no: { bg: "#FF8383", text: "#fff", label: "No" },
  partial: { bg: "#ffd043ff", text: "#000", label: "Draft Only" },
  na: { bg: "#6c757d", text: "#fff", label: "N/A" },
};

const sopItems = {
  labTest: { label: "Lab Test", tooltip: "Within 1st 24 hours of admission" },
  prescription: {
    label: "Prescription",
    tooltip: "Within 1st 2 hours of admission",
  },
  vitalSign: { label: "Vital", tooltip: "Submitted every day" },
  detailAdmission: {
    label: "Admission Form",
    tooltip: "Within 1st 24 hours of admission",
  },
  consentForm: {
    label: "Consent",
    tooltip: "Signed copies within 1st 24 hours of admission",
  },
  counsellingNote: {
    label: "Counselling Note",
    tooltip: "Submitted every day",
  },
  familyUpdate: { label: "Family Update", tooltip: "Submitted every day" },
  clinicalNote: { label: "Clinical Note", tooltip: "Submitted every 24 hours" },
};

const formatSopDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isValid(d)) return null;
  return format(d, "d MMM h:mma").toLowerCase();
};

const SopIndicator = ({ id, label, tooltip, status, date }) => {
  const config = sopStatusConfig[status] || sopStatusConfig.na;
  const tooltipId = `sop-${id}`;
  const formattedDate = formatSopDate(date);
  return (
    <>
      <span
        id={tooltipId}
        className="badge rounded-pill d-inline-flex flex-column align-items-center"
        style={{
          backgroundColor: config.bg,
          color: config.text,
          fontSize: "0.65rem",
          padding: "3px 7px",
          cursor: "default",
          lineHeight: 1.3,
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: "0.55rem", opacity: 0.9 }}>
          {formattedDate || "N/A"}
        </span>
      </span>
      <UncontrolledTooltip target={tooltipId} placement="top">
        {tooltip}: {config.label}
        {formattedDate ? ` (${formattedDate})` : ""}
      </UncontrolledTooltip>
    </>
  );
};

const toTitleCase = (text) =>
  text ? text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "";

const PatientCard = ({ patient }) => {
  const [viewPicture, setViewPicture] = useState();
  const { color, border } = statusColors[patient.patientType] || {
    color: "secondary",
    border: "#d9d9d9",
  };

  return (
    <Card
      className="position-relative shadow-sm border-1 w-100 h-100"
      style={{
        borderTop: `4px solid ${border}`,
        minHeight: "200px",
      }}
    >
      <div className="position-absolute top-0 end-0 d-flex">
        <Badge
          color={color}
          className="rounded-0 rounded-bottom-start fw-bold"
          style={{
            padding: "4px 10px",
            fontSize: "0.8rem",
          }}
        >
          {toTitleCase(
            patient.patientType === "serious"
              ? "Medically Serious"
              : patient.patientType,
          )}
        </Badge>
      </div>

      <CardBody className="d-flex flex-column h-100 mt-2">
        <CardTitle
          tag="h5"
          className="mb-2 fw-semibold d-flex align-items-center gap-2"
        >
          <div className="flex-shrink-0 chat-user-img online user-own-img">
            <PreviewFile
              title="Patient Profile Picture"
              file={viewPicture}
              isOpen={Boolean(viewPicture)}
              toggle={() => setViewPicture(null)}
            />
            <img
              onClick={() => setViewPicture(patient.profilePicture || null)}
              src={
                patient.profilePicture?.url
                  ? patient.profilePicture?.url
                  : userDummayImage
              }
              className="rounded-circle avatar-xs"
              alt="Patient"
            />
          </div>

          <span>
            {toTitleCase(patient.name)}
            <span className="ms-2 text-muted">({patient.uid})</span>
          </span>
        </CardTitle>

        {patient.sopCompliance && (
          <div className="d-flex flex-wrap gap-1 mb-2">
            {Object.entries(sopItems).map(([key, { label, tooltip }]) => (
              <SopIndicator
                key={key}
                id={`${patient.patientId}-${key}`}
                label={label}
                tooltip={tooltip}
                status={patient.sopCompliance[key]?.status}
                date={patient.sopCompliance[key]?.date}
              />
            ))}
          </div>
        )}

        {patient?.vitals ? (
          <>
            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="text-danger me-2">❤️</span>
              <span>
                <strong>HR:</strong>{" "}
                {patient.vitals.pulse?.trim() ? patient.vitals.pulse : "N/A"}
              </span>
              <span className="ms-3">
                <strong>BP:</strong>{" "}
                {patient.vitals.bloodPressure &&
                patient.vitals.bloodPressure.systolic?.trim() &&
                patient.vitals.bloodPressure.diastolic?.trim()
                  ? `${patient.vitals.bloodPressure.systolic}/${patient.vitals.bloodPressure.diastolic}`
                  : "N/A"}
              </span>
            </div>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="me-2">🌡️</span>
              <span>
                <strong>Temp:</strong>{" "}
                {patient.vitals.temprature?.trim()
                  ? patient.vitals.temprature
                  : "N/A"}
              </span>
            </div>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="me-2">⚖️</span>
              <span>
                <strong>Weight:</strong>{" "}
                {patient.vitals.weight?.trim()
                  ? `${patient.vitals.weight} kg`
                  : "N/A"}
              </span>
            </div>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="me-2">🫁</span>
              <span>
                <strong>RR:</strong>{" "}
                {patient.vitals.respirationRate?.trim()
                  ? patient.vitals.respirationRate
                  : "N/A"}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="text-danger me-2">❤️</span>
              <span>
                <strong>HR:</strong> N/A
              </span>
              <span className="ms-3">
                <strong>BP:</strong> N/A
              </span>
            </div>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="me-2">🌡️</span>
              <span>
                <strong>Temp:</strong> N/A
              </span>
            </div>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="me-2">⚖️</span>
              <span>
                <strong>Weight:</strong> N/A
              </span>
            </div>

            <div className="d-flex align-items-center mb-2 text-body-secondary">
              <span className="me-2">🫁</span>
              <span>
                <strong>RR:</strong> N/A
              </span>
            </div>
          </>
        )}
      </CardBody>

      <CardFooter className="bg-light text-end">
        <Link to={`/patient/${patient.patientId}`}>
          <button className="btn btn-outline-primary btn-sm">
            Go to Patient
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
