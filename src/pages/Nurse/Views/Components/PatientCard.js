import { useMemo, useState } from "react";
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
import { buildMedicineSchema } from "./ActivityMedicineForm";
import PharmacyBatchPicker from "./PharmacyBatchPicker";
import { shouldPromptForPharmacy } from "./pharmacyPicker.helper";
import { Formik, Form, Field } from "formik";
import { useDispatch } from "react-redux";
import { markTomorrowActivityMedicines } from "../../../../store/features/nurse/nurseSlice";
import { toast } from "react-toastify";
import { Check, CheckCircle, TriangleAlert } from "lucide-react";
import { formatBatchLabel } from "./PharmacyBatchPicker";

const statusColors = {
  urgent: { color: "danger", border: "#ff4d4f" },
  attention: { color: "warning", border: "#faad14" },
  stable: { color: "success", border: "#52c41a" },
};

const toTitleCase = (text) => {
  if (!text) return;
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const PatientCard = ({ patient, toggleAlertsModal, writable = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAllMedicines, setShowAllMedicines] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [submissionValues, setSubmissionValues] = useState(null);
  // medicineIds of the rows whose inline pharmacy picker is expanded — a Set
  // so Select All can open every still-needed picker at once.
  const [openPickers, setOpenPickers] = useState(() => new Set());
  const [pickedBatchLabels, setPickedBatchLabels] = useState({});

  const toggleModal = () => setModalOpen(!modalOpen);

  const pharmacyDeductionEnabled = !!patient?.pharmacyDeductionEnabled;
  const medicineSchemaForPatient = useMemo(
    () => buildMedicineSchema(pharmacyDeductionEnabled),
    [pharmacyDeductionEnabled]
  );

  const isPickerOpen = (medicineId) => openPickers.has(String(medicineId));
  const openPickerFor = (medicineId) =>
    setOpenPickers((prev) => new Set(prev).add(String(medicineId)));
  const closePickerFor = (medicineId) =>
    setOpenPickers((prev) => {
      const next = new Set(prev);
      next.delete(String(medicineId));
      return next;
    });
  const closeAllPickers = () => setOpenPickers(new Set());

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
                prescriptionId: med.prescriptionId,
                medicineId: med.medicineId,
                medicineIndex: med.medicineIndex,
                slot,
                status: "pending",
                pharmacyId: null,
              },
            ];
          }
          return [];
        });
      }),
      ...medicinesToRemove.map((med) => ({
        historyId: med.historyId,
        prescriptionId: med.prescriptionId,
        medicineId: med.medicineId,
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
              validationSchema={medicineSchemaForPatient}
              onSubmit={handleFormSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue }) => {
                const getSlotIndexes = (target) =>
                  values.medicines
                    .map((med, i) => {
                      if (med.historyId) return -1;
                      const same = target?.medicineId
                        ? String(med.medicineId) === String(target.medicineId)
                        : med.medicineIndex === target?.medicineIndex;
                      return same ? i : -1;
                    })
                    .filter((i) => i !== -1);

                const allTakeNowCompleted =
                  medicinesToTakeNow.length === 0 ||
                  medicinesToTakeNow.every((med) =>
                    getSlotIndexes(med).every(
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
                                const slotIndexes = getSlotIndexes(medicine);
                                const allSlotsCompleted = slotIndexes.every(
                                  (i) =>
                                    values.medicines[i].status === "completed"
                                );

                                const pickerOpen = isPickerOpen(
                                  medicine.medicineId
                                );

                                return (
                                  <div key={`mark-${idx}`} className="mb-1">
                                    <div className="d-flex align-items-center text-body-secondary">
                                    <label
                                      onClick={(e) => e.stopPropagation()}
                                      className="d-flex align-items-center fw-semibold small"
                                      style={{ paddingBlock: 2 }}
                                    >
                                      <Field
                                        type="checkbox"
                                        checked={allSlotsCompleted}
                                        disabled={!writable}
                                        style={{
                                          width: 15,
                                          height: 15,
                                          flexShrink: 0,
                                        }}
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          // Completing needs a pharmacy chosen
                                          // first — expand the picker under
                                          // this row instead of ticking it.
                                          if (
                                            checked &&
                                            shouldPromptForPharmacy({
                                              nextStatus: "completed",
                                              needsRemoval: false,
                                              pharmacyDeductionEnabled,
                                            })
                                          ) {
                                            if (pickerOpen) {
                                              closePickerFor(medicine.medicineId);
                                            } else {
                                              openPickerFor(medicine.medicineId);
                                            }
                                            return;
                                          }
                                          slotIndexes.forEach((i) => {
                                            setFieldValue(
                                              `medicines[${i}].status`,
                                              checked ? "completed" : "pending"
                                            );
                                            if (!checked) {
                                              setFieldValue(
                                                `medicines[${i}].pharmacyId`,
                                                null
                                              );
                                            }
                                          });
                                          if (!checked) {
                                            closePickerFor(medicine.medicineId);
                                          }
                                        }}
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

                                    {!pickerOpen &&
                                      pharmacyDeductionEnabled &&
                                      values.medicines[slotIndexes[0]]
                                        ?.pharmacyId && (
                                        <div
                                          className="d-flex align-items-center gap-1 mt-1 px-2 rounded"
                                          style={{
                                            background: "#f0f9f2",
                                            border: "1px solid #d3ecd8",
                                            minHeight: 24,
                                          }}
                                        >
                                          <CheckCircle
                                            size={11}
                                            className="text-success flex-shrink-0"
                                          />
                                          <span
                                            className="text-success-emphasis flex-grow-1"
                                            style={{ fontSize: "0.68rem" }}
                                          >
                                            {pickedBatchLabels[
                                              medicine.medicineId
                                            ] || "Selected from inventory"}
                                          </span>
                                          <button
                                            type="button"
                                            className="btn btn-link btn-sm text-decoration-none"
                                            style={{ fontSize: "0.68rem", padding: "2px 2px" }}
                                            onClick={() =>
                                              openPickerFor(medicine.medicineId)
                                            }
                                          >
                                            Change
                                          </button>
                                        </div>
                                      )}

                                    {pickerOpen && (
                                      <PharmacyBatchPicker
                                        patientId={patient._id}
                                        medicine={{
                                          medicineId: medicine.medicineId,
                                          medicineName: medicine.medicineName,
                                        }}
                                        selectedPharmacyId={
                                          values.medicines[slotIndexes[0]]
                                            ?.pharmacyId
                                        }
                                        onSelect={(pharmacyId, batch) => {
                                          slotIndexes.forEach((i) => {
                                            setFieldValue(
                                              `medicines[${i}].pharmacyId`,
                                              pharmacyId
                                            );
                                            setFieldValue(
                                              `medicines[${i}].status`,
                                              "completed"
                                            );
                                          });
                                          if (batch) {
                                            setPickedBatchLabels((prev) => ({
                                              ...prev,
                                              [medicine.medicineId]:
                                                formatBatchLabel(batch),
                                            }));
                                          }
                                          closePickerFor(medicine.medicineId);
                                        }}
                                        onCancel={() =>
                                          closePickerFor(medicine.medicineId)
                                        }
                                      />
                                    )}
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
                                      style={{ paddingBlock: 2 }}
                                    >
                                      <Field
                                        type="checkbox"
                                        checked={
                                          values.medicines[actionIndex]?.status ===
                                          "retrieved"
                                        }
                                        disabled={!writable}
                                        style={{
                                          width: 15,
                                          height: 15,
                                          flexShrink: 0,
                                        }}
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

                          {writable && (medicinesToRemove.length > 0 ||
                            (medicinesToTakeNow.length > 0 &&
                              (medicinesToTakeNow.length <= 2 ||
                                showAllMedicines))) && (
                              <>
                                <label
                                  className="d-flex align-items-center fw-semibold small"
                                  style={{ gap: "4px", paddingBlock: 2 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={allMedicinesCompleted}
                                    style={{ width: 15, height: 15, flexShrink: 0 }}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const needsPharmacyIds = [];

                                      medicinesToTakeNow.forEach((med) => {
                                        const slotIndexes = getSlotIndexes(med);

                                        // Under the pharmacy gate, "Select All"
                                        // must not complete a drug nobody has
                                        // chosen a pharmacy for — open its
                                        // picker instead of silently skipping.
                                        if (
                                          checked &&
                                          pharmacyDeductionEnabled &&
                                          !slotIndexes.every(
                                            (i) => values.medicines[i]?.pharmacyId
                                          )
                                        ) {
                                          needsPharmacyIds.push(med.medicineId);
                                          return;
                                        }

                                        slotIndexes.forEach((i) => {
                                          setFieldValue(
                                            `medicines[${i}].status`,
                                            checked ? "completed" : "pending"
                                          );
                                          if (!checked) {
                                            setFieldValue(
                                              `medicines[${i}].pharmacyId`,
                                              null
                                            );
                                          }
                                        });
                                      });

                                      if (!checked) {
                                        closeAllPickers();
                                      } else if (needsPharmacyIds.length > 0) {
                                        // Open every still-needed picker at
                                        // once instead of making the nurse
                                        // tap each medicine individually.
                                        setOpenPickers(
                                          new Set(
                                            needsPharmacyIds.map(String)
                                          )
                                        );
                                        toast.info(
                                          `${needsPharmacyIds.length} medicine${needsPharmacyIds.length > 1 ? "s" : ""} need to be selected from inventory — pick a batch for each below.`
                                        );
                                      }

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

                          {writable && (
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
