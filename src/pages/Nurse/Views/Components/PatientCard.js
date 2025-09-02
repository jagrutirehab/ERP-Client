import { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Badge,
  Button,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { medicineSchema } from "./ActivityMedicineForm";
import { Formik, Form, Field } from "formik";
import { useDispatch } from "react-redux";
import { markTomorrowActivityMedicines } from "../../../../store/features/nurse/nurseSlice";
import { toast } from "react-toastify";

const statusColors = {
  urgent: { color: "danger", border: "#ff4d4f" },
  attention: { color: "warning", border: "#faad14" },
  stable: { color: "success", border: "#52c41a" },
};

const toTitleCase = (text) => {
  if (!text) return;
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const PatientCard = ({ patient, toggleAlertsModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAllMedicines, setShowAllMedicines] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { color, border } = statusColors[patient.flag] || {
    color: "secondary",
    border: "#d9d9d9",
  };

  const medicineFormInitialValues = {
    medicines: patient?.medicinesToTakeNow?.flatMap((med, idx) => {
      const slots = ["morning", "evening", "night"];
      let doses = [];

      doses = med.dosage
        .split("-")
        .map((dose) => (dose === "1/2" ? 0.5 : parseFloat(dose)));

      return slots.flatMap((slot, i) => {
        if (doses[i] > 0) {
          return [
            {
              medicineIndex: med.medicineIndex,
              slot,
              status: "missed",
            },
          ];
        }
        return [];
      });
    }),
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        markTomorrowActivityMedicines({
          medicines: values.medicines,
          patientId: patient._id,
        })
      ).unwrap();
      setIsSubmitting(false);
      toast.success("Medicines marked successfully!");
    } catch (error) {
      // console.error(error);
      toast.error("Failed to mark medicines. Please try again.");
    }
  };

  // const vitals =
  //   Array.isArray(patient.vitals) && patient.vitals.length > 0
  //     ? patient.vitals[0]
  //     : null;
  return (
    <>
      <Card
        className="position-relative shadow-sm border-1 w-100 h-100"
        style={{
          borderTop: `4px solid ${border}`,
          minHeight: "200px",
        }}
        onClick={() => navigate(`/nurse/p/${patient._id}`)}
      >
        <div className="position-absolute top-0 end-0 d-flex">
          {patient.isPrescriptionUpdated && (
            <Badge
              color="warning"
              className="rounded-0 rounded-bottom-start fw-bold me-1"
              style={{ padding: "4px 8px", fontSize: "0.7rem", zIndex: 10 }}
            >
              Prescription Updated
            </Badge>
          )}
          <Badge
            color={color}
            className="rounded-0 rounded-bottom-start fw-bold"
            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
          >
            {toTitleCase(patient.flag)}
          </Badge>
        </div>

        <CardBody className="d-flex flex-column h-100 mt-2">
          <CardTitle tag="h5" className="mb-2 fw-semibold">
            {toTitleCase(patient.name)}
          </CardTitle>
          <CardText className="text-muted mb-3">Room {30}</CardText>

          <div className="d-flex align-items-center mb-2 text-body-secondary">
            <span className="text-danger me-2">❤️</span>
            <span>
              <strong>HR:</strong>{" "}
              {patient?.vitals?.pulse?.trim() !== ""
                ? patient?.vitals?.pulse
                : "N/A"}
            </span>
            <span className="ms-3">
              <strong>BP:</strong>{" "}
              {patient?.vitals?.bloodPressure
                ? patient?.vitals.bloodPressure.systolic?.trim() &&
                  patient?.vitals.bloodPressure.diastolic?.trim()
                  ? `${patient.vitals.bloodPressure.systolic}/${patient?.vitals.bloodPressure.diastolic}`
                  : "N/A"
                : "N/A"}
            </span>
          </div>

          <div className="d-flex align-items-center mb-2 text-body-secondary">
            <span className="me-2">🌡️</span>
            <span>
              <strong>Temp:</strong>{" "}
              {patient?.vitals?.temprature
                ? patient.vitals.temprature.trim() !== ""
                  ? `${patient?.vitals?.temprature}`
                  : "N/A"
                : "N/A"}
            </span>
          </div>

          {patient.medicinesToTakeNow &&
          patient.medicinesToTakeNow.length > 0 ? (
            <Formik
              initialValues={medicineFormInitialValues}
              validationSchema={medicineSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue }) => {
                const getSlotIndexes = (medicineIndex) =>
                  values.medicines
                    .map((med, i) =>
                      med.medicineIndex === medicineIndex ? i : -1
                    )
                    .filter((i) => i !== -1);

                const allMedicinesCompleted = patient.medicinesToTakeNow.every(
                  (med) =>
                    getSlotIndexes(med.medicineIndex).every(
                      (i) => values.medicines[i].status === "completed"
                    )
                );
                return (
                  <Form>
                    <div
                      className="mt-2 mb-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-info bg-opacity-10 border border-info border-opacity-25 rounded p-2">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center">
                            <span className="me-2 fs-6">💊</span>
                            <small className="text-info fw-bold">
                              MEDICINE BOX FILLING DUE
                            </small>
                          </div>
                          {patient.medicinesToTakeNow.length > 2 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAllMedicines(!showAllMedicines);
                              }}
                              className="btn btn-link btn-sm p-0 text-info text-decoration-none"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {showAllMedicines
                                ? "Show Less"
                                : `+${
                                    patient.medicinesToTakeNow.length - 2
                                  } more`}
                            </button>
                          )}
                        </div>
                        <div>
                          {(showAllMedicines
                            ? patient.medicinesToTakeNow
                            : patient.medicinesToTakeNow.slice(0, 2)
                          ).map((medicine, idx) => {
                            const slotIndexes = getSlotIndexes(
                              medicine.medicineIndex
                            );
                            const allSlotsCompleted = slotIndexes.every(
                              (i) => values.medicines[i].status === "completed"
                            );

                            return (
                              <div
                                key={idx}
                                className="d-flex align-items-center text-body-secondary mb-1"
                              >
                                <label
                                  onClick={(e) => e.stopPropagation()}
                                  className="d-flex align-items-center fw-semibold small"
                                >
                                  <Field
                                    type="checkbox"
                                    checked={allSlotsCompleted}
                                    onChange={(e) =>
                                      slotIndexes.forEach((i) =>
                                        setFieldValue(
                                          `medicines[${i}].status`,
                                          e.target.checked
                                            ? "completed"
                                            : "missed"
                                        )
                                      )
                                    }
                                    className="me-2"
                                  />
                                  <span>
                                    {medicine.medicineName}{" "}
                                    <span className="fw-bold">
                                      {medicine.dosage}
                                    </span>
                                  </span>
                                </label>
                              </div>
                            );
                          })}
                          {(patient.medicinesToTakeNow.length <= 2 ||
                            showAllMedicines) && (
                            <>
                              <label
                                className="d-flex align-items-center fw-semibold small"
                                style={{ gap: "4px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={allMedicinesCompleted}
                                  onChange={(e) => {
                                    patient.medicinesToTakeNow.forEach((med) =>
                                      getSlotIndexes(
                                        med.medicineIndex,
                                        values
                                      ).forEach((i) =>
                                        setFieldValue(
                                          `medicines[${i}].status`,
                                          e.target.checked
                                            ? "completed"
                                            : "missed"
                                        )
                                      )
                                    );
                                  }}
                                />{" "}
                                Select All
                              </label>
                              <div className="d-flex justify-content-end mt-3">
                                <Button
                                  disabled={
                                    !values.medicines.some(
                                      (med) => med.status === "completed"
                                    ) || isSubmitting
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  type="submit"
                                  size="sm"
                                >
                                  {isSubmitting && (
                                    <Spinner size="sm" className="me-2" />
                                  )}
                                  Submit
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
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

          <div className="d-flex gap-2 mt-auto align-items-end justify-content-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleAlertsModal(e);
              }}
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
