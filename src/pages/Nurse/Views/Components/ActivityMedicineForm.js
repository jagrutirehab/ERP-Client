import { useState } from "react";
import {
  Row,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "reactstrap";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { markTomorrowActivityMedicines } from "../../../../store/features/nurse/nurseSlice";
import { connect } from "react-redux";
import Placeholder from "../../../Patient/Views/Components/Placeholder";
import moment from "moment";
import { toast } from "react-toastify";

const medicineSchema = Yup.object().shape({
  medicines: Yup.array().of(
    Yup.object().shape({
      medicineIndex: Yup.number().required(),
      slot: Yup.string().oneOf(["morning", "evening", "night"]).required(),
      status: Yup.string().oneOf(["completed", "missed"]).required(),
    })
  ),
});

const ActivityMedicineForm = ({
  medicineBoxFillingActivities,
  medicineLoading,
}) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [submissionValues, setSubmissionValues] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleModal = () => setModalOpen(!modalOpen);

  const tomorrowDate = moment().add(1, "days").format("MMMM D, YYYY");

  if (!medicineLoading && !medicineBoxFillingActivities?.medicines) {
    return (
      <div className="pt-4 ps-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Activity - Medicine Box Filing</h5>
        </div>
        <div>
          <p
            style={{
              color: "#888",
              fontStyle: "italic",
              margin: "1rem 0",
              fontSize: "0.85rem",
            }}
          >
            No medicines found
          </p>
        </div>
      </div>
    );
  }

  const initialValues = { medicines: [] };

  if (!medicineLoading && medicineBoxFillingActivities?.medicines) {
    Object.entries(medicineBoxFillingActivities.medicines).forEach(
      ([slot, meds]) => {
        meds.forEach((med) => {
          initialValues.medicines.push({
            medicineIndex: med.medicineIndex,
            slot,
            status: "missed",
          });
        });
      }
    );
  }

  const submitMedicines = async (values, fromModal = false) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        markTomorrowActivityMedicines({
          medicines: values.medicines,
          patientId: id,
        })
      ).unwrap();
      setSubmissionSuccess(true);
      toast.success("Medicines marked successfully!");
      
      // Close modal if submission was from modal
      if (fromModal) {
        toggleModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark medicines. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (values) => {
    const missed = values.medicines.filter((m) => m.status === "missed");

    if (missed.length > 0) {
      setMissedCount(missed.length);
      setSubmissionValues(values);
      setModalOpen(true);
    } else {
      submitMedicines(values, false);
    }
  };

  const handleModalConfirm = () => {
    if (submissionValues) {
      submitMedicines(submissionValues, true);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={medicineSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, handleSubmit }) => (
        <Form>
          <div className="pt-4 ps-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Activity - Medicine Box Filing</h5>
              <span className="text-muted">
                Scheduled for:{" "}
                <span className="fw-bold text-primary">{tomorrowDate}</span>
              </span>
            </div>
            {medicineLoading ? (
              <Placeholder />
            ) : (
              <>
                <Row className="gap-3">
                  {Object.entries(medicineBoxFillingActivities.medicines).map(
                    ([timeSlot, meds]) => (
                      <div
                        key={timeSlot}
                        style={{ flex: "1 1 30%", minWidth: "250px" }}
                      >
                        <h6 className="text-capitalize mb-3">{timeSlot}</h6>
                        <div className="d-flex flex-column gap-3">
                          {Array.isArray(meds) && meds.length > 0 ? (
                            meds.map((med, idx) => {
                              const medicineIndex = values.medicines.findIndex(
                                (m) =>
                                  m.medicineIndex === med.medicineIndex &&
                                  m.slot === timeSlot
                              );

                              return (
                                <div
                                  key={`${timeSlot}-${med.medicineIndex}`}
                                  className="border rounded-lg p-3 bg-white shadow-sm d-flex justify-content-between align-items-center"
                                >
                                  <div>
                                    <h6 className="fw-bold text-dark mb-1">
                                      {med.medicineName}
                                    </h6>
                                    <small className="text-muted d-flex flex-wrap align-items-center gap-2">
                                      <span>
                                        <strong>Dosage:</strong> x{med.dosage}
                                      </span>
                                      <span>
                                        <strong>Intake:</strong> {med.intake}
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
                                          {timeSlot.toUpperCase()}
                                        </Badge>
                                      </span>
                                    </small>
                                  </div>
                                  <div>
                                    {submissionSuccess ? (
                                      <div className="text-success">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div
                                        className="tick-input"
                                        onClick={() => {
                                          const currentStatus =
                                            values.medicines[medicineIndex]
                                              ?.status;
                                          setFieldValue(
                                            `medicines[${medicineIndex}].status`,
                                            currentStatus === "completed"
                                              ? "missed"
                                              : "completed"
                                          );
                                        }}
                                        style={{
                                          width: "28px",
                                          height: "28px",
                                          borderRadius: "50%",
                                          border: "2px solid #dee2e6",
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor:
                                            values.medicines[medicineIndex]
                                              ?.status === "completed"
                                              ? "#198754"
                                              : "white",
                                          transition: "all 0.2s ease",
                                        }}
                                      >
                                        {values.medicines[medicineIndex]
                                          ?.status === "completed" && (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M20 6L9 17l-5-5" />
                                          </svg>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-muted">
                              No medicines for {timeSlot}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </Row>

                {!Object.values(medicineBoxFillingActivities?.medicines).every(
                  (slotMeds) => slotMeds.length === 0
                ) && (
                  <Button
                    color="primary"
                    type="button"
                    className="mt-3"
                    onClick={handleSubmit}
                    disabled={submissionSuccess || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Submitting...
                      </>
                    ) : submissionSuccess ? (
                      "Submitted"
                    ) : (
                      "Submit"
                    )}
                  </Button>
                )}

                <Modal isOpen={modalOpen} toggle={toggleModal}>
                  <ModalHeader toggle={toggleModal}>
                    Confirm Submission
                  </ModalHeader>
                  <ModalBody>
                    You have {missedCount} medicine{missedCount > 1 ? "s" : ""}{" "}
                    not marked as completed. Are you sure you want to submit and
                    mark them as missed?
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      onClick={handleModalConfirm}
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
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

const mapStateToProps = (state) => ({
  medicineBoxFillingActivities: state.Nurse.medicines.nextDay,
  medicineLoading: state.Nurse.medicineLoading,
});

export default connect(mapStateToProps)(ActivityMedicineForm);