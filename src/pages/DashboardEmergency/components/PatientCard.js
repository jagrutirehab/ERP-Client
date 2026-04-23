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
  yes: { bg: "#9AD872", label: "Yes" },
  no: { bg: "#FF8383", label: "No" },
  partial: { bg: "#ffd043", label: "Draft Only" },
  na: { bg: "#6c757d", label: "N/A" },
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
      <div
        id={tooltipId}
        className="d-flex flex-column align-items-start"
        style={{ minWidth: 100, cursor: "default" }}
      >
        <div className="d-flex align-items-center gap-1">
          <span
            className="rounded-circle d-inline-block"
            style={{
              width: 8,
              height: 8,
              backgroundColor: config.bg,
              flexShrink: 0,
            }}
          ></span>
          <span className="fw-medium text-dark" style={{ fontSize: "0.75rem" }}>
            {label}
          </span>
        </div>
        <span
          className="text-muted"
          style={{ fontSize: "0.7rem", paddingLeft: 14 }}
        >
          {formattedDate || "Not yet"}
        </span>
      </div>
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
      className="position-relative shadow-sm border-1 w-100 h-"
      style={{
        borderTop: `4px solid ${border}`,
        minHeight: "180px",
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

      <CardBody className="d-flex flex-column flex-grow-0 mt-2">
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

        {patient.sopCompliance && (
          <div className="rounded mb-2 bg-whit">
            <div className="d-flex flex-wrap gap-1">
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
          </div>
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
