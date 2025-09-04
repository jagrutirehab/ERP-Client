import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Badge,
  CardFooter,
  Button,
} from "reactstrap";
import PreviewFile from "../../../Components/Common/PreviewFile";
import userDummayImage from "../../../assets/images/users/user-dummy-img.jpg";
import { Link } from "react-router-dom";

const statusColors = {
  suicidal: { color: "danger", border: "#ffcdd2" },
  runaway: { color: "warning", border: "#ffe0b2" },
  serious: { color: "primary", border: "#fff9c4" },
  aggresive: { color: "secondary", border: "#bbdefb" },
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
              : patient.patientType
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
