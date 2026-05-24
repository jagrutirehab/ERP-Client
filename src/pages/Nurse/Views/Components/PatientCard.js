import { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Badge,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { medicineSchema } from "./ActivityMedicineForm";
import { Formik, Form, Field } from "formik";
import { useDispatch } from "react-redux";
import { markTomorrowActivityMedicines } from "../../../../store/features/nurse/nurseSlice";
import { toast } from "react-toastify";
import { Check, TriangleAlert } from "lucide-react";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [submissionValues, setSubmissionValues] = useState(null);

  const toggleModal = () => setModalOpen(!modalOpen);

  const { color, border } = statusColors[patient.flag] || {
    color: "secondary",
    border: "#d9d9d9",
  };

  const medicinesToTakeNow = patient?.medicinesToTakeNow || [];
  const medicinesToRemove = patient?.medicinesToRemove || [];
  const hasMedicineActions =
    medicinesToTakeNow.length > 0 || medicinesToRemove.length > 0;

  const medicineFormInitialValues = {
    medicines: [
      ...medicinesToTakeNow.flatMap((med) => {
        const slots = ["morning", "evening", "night"];
        const doses = (med.dosage || "")
          .split("-")
          .map((dose) => (dose === "1/2" ? 0.5 : parseFloat(dose)));

        return slots.flatMap((slot, i) => {
          if (doses[i] > 0) {
            return [
              {
                medicineIndex: med.medicineIndex,
                slot,
                status: "pending",
              },
            ];
          }
          return [];
        });
      }),
      ...medicinesToRemove.map((med) => ({
        historyId: med.historyId,
        medicineIndex: med.medicineIndex,
        slot: med.slot,
        status: "pending",
      })),
    ],
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
      toast.success("Medicine activities updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to mark medicines. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (values) => {
    const pendingNormalMedicines = values.medicines.filter(
      (medicine) => !medicine.historyId && medicine.status === "pending"
    );
    const hasCompletedNormalMedicine = values.medicines.some(
      (medicine) => !medicine.historyId && medicine.status === "completed"
    );
    const pendingRetrievals = values.medicines.filter(
      (medicine) => medicine.historyId && medicine.status !== "retrieved"
    );
    const selectedRetrievalActions = values.medicines.filter(
      (medicine) => medicine.historyId && medicine.status === "retrieved"
    );

    if (pendingRetrievals.length > 0) {
      toast.error(
        `Please retrieve ${pendingRetrievals.length} previously marked medicine${pendingRetrievals.length > 1 ? "s" : ""} before submitting.`
      );
      return;
    }

    if (pendingNormalMedicines.length > 0 && hasCompletedNormalMedicine) {
      setMissedCount(pendingNormalMedicines.length);
      setSubmissionValues({
        medicines: values.medicines.map((medicine) =>
          !medicine.historyId && medicine.status === "pending"
            ? { ...medicine, status: "missed" }
            : medicine
        ),
      });
      setModalOpen(true);
      return;
    }

    const medicinesToSubmit = values.medicines.filter((medicine) =>
      medicine.historyId
        ? medicine.status === "retrieved"
        : ["completed", "missed"].includes(medicine.status)
    );

    if (!medicinesToSubmit.length && !selectedRetrievalActions.length) {
      return;
    }

    handleSubmit({ medicines: medicinesToSubmit });
  };

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
            <span className="text-danger me-2">❤</span>
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
            <span className="me-2">🌡</span>
            <span>
              <strong>Temp:</strong>{" "}
              {patient?.vitals?.temprature
                ? patient.vitals.temprature.trim() !== ""
                  ? `${patient?.vitals?.temprature}`
                  : "N/A"
                : "N/A"}
            </span>
          </div>

          {hasMedicineActions ? (
            <Formik
              initialValues={medicineFormInitialValues}
              validationSchema={medicineSchema}
              onSubmit={handleFormSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue }) => {
                const getSlotIndexes = (medicineIndex) =>
                  values.medicines
                    .map((med, i) =>
                      med.medicineIndex === medicineIndex && !med.historyId
                        ? i
                        : -1
                    )
                    .filter((i) => i !== -1);

                const allTakeNowCompleted =
                  medicinesToTakeNow.length === 0 ||
                  medicinesToTakeNow.every((med) =>
                    getSlotIndexes(med.medicineIndex).every(
                      (i) => values.medicines[i].status === "completed"
                    )
                  );
                const allRemoveRetrieved =
                  medicinesToRemove.length === 0 ||
                  values.medicines
                    .filter((m) => m.historyId)
                    .every((m) => m.status === "retrieved");
                const allMedicinesCompleted =
                  (medicinesToTakeNow.length > 0 || medicinesToRemove.length > 0) &&
                  allTakeNowCompleted &&
                  allRemoveRetrieved;

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
                          {medicinesToTakeNow.length > 2 && (
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
                                : `+${medicinesToTakeNow.length - 2} more`}
                            </button>
                          )}
                        </div>
                        <div>
                          {medicinesToTakeNow.length > 0 && (
                            <>
                              {(showAllMedicines
                                ? medicinesToTakeNow
                                : medicinesToTakeNow.slice(0, 2)
                              ).map((medicine, idx) => {
                                const slotIndexes = getSlotIndexes(
                                  medicine.medicineIndex
                                );
                                const allSlotsCompleted = slotIndexes.every(
                                  (i) =>
                                    values.medicines[i].status === "completed"
                                );

                                return (
                                  <div
                                    key={`mark-${idx}`}
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
                                                : "pending"
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
                            </>
                          )}

                          {medicinesToRemove.length > 0 && (
                            <>
                              <small className="d-block text-danger fw-bold mt-2 mb-1">
                                MEDICINES TO REMOVE
                              </small>
                              {medicinesToRemove.map((medicine, idx) => {
                                const actionIndex = values.medicines.findIndex(
                                  (med) => med.historyId === medicine.historyId
                                );

                                return (
                                  <div
                                    key={`remove-${medicine.historyId || idx}`}
                                    className="d-flex align-items-center text-body-secondary mb-1"
                                  >
                                    <label
                                      onClick={(e) => e.stopPropagation()}
                                      className="d-flex align-items-center fw-semibold small text-danger"
                                    >
                                      <Field
                                        type="checkbox"
                                        checked={
                                          values.medicines[actionIndex]?.status ===
                                          "retrieved"
                                        }
                                        onChange={(e) =>
                                          setFieldValue(
                                            `medicines[${actionIndex}].status`,
                                            e.target.checked
                                              ? "retrieved"
                                              : "pending"
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
                            </>
                          )}

                          {(medicinesToRemove.length > 0 ||
                            (medicinesToTakeNow.length > 0 &&
                              (medicinesToTakeNow.length <= 2 ||
                                showAllMedicines))) && (
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
                                      const checked = e.target.checked;
                                      medicinesToTakeNow.forEach((med) =>
                                        getSlotIndexes(
                                          med.medicineIndex
                                        ).forEach((i) =>
                                          setFieldValue(
                                            `medicines[${i}].status`,
                                            checked
                                              ? "completed"
                                              : "pending"
                                          )
                                        )
                                      );
                                      values.medicines.forEach((med, i) => {
                                        if (med.historyId) {
                                          setFieldValue(
                                            `medicines[${i}].status`,
                                            checked ? "retrieved" : "pending"
                                          );
                                        }
                                      });
                                    }}
                                  />{" "}
                                  Select All
                                </label>
                              </>
                            )}

                          <div className="d-flex justify-content-end mt-3">
                            <Button
                              disabled={
                                !values.medicines.some(
                                  (med) =>
                                    med.status === "completed" ||
                                    med.status === "retrieved"
                                ) ||
                                values.medicines.some(
                                  (med) =>
                                    med.historyId && med.status !== "retrieved"
                                ) ||
                                isSubmitting
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
                  {patient.missedMedsCount > 0 ? (
                    <TriangleAlert className="me-2" />
                  ) : (
                    <Check className="me-2 text-success" />
                  )}
                  <small className="text-muted">
                    {patient.missedMedsCount > 0
                      ? `${patient.missedMedsCount} medicines got missed`
                      : "No medications due at this time"}
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
                  patient.alertCount > 0 && patient?.flag !== "stable"
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
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Confirm Submission</ModalHeader>
        <ModalBody>
          You have {missedCount} medicine{missedCount > 1 ? "s" : ""} not
          marked as completed. Are you sure you want to submit and mark them as
          missed?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (submissionValues) {
                handleSubmit(submissionValues);
                toggleModal();
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              "Yes, Submit"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default PatientCard;
