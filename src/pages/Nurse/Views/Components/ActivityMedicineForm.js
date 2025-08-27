import { useState } from "react";
import { Row, Badge, Button, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { markTomorrowActivityMedicines } from "../../../../store/features/nurse/nurseSlice";
import { connect } from "react-redux";
import Placeholder from "../../../Patient/Views/Components/Placeholder";
import moment from "moment";
import { toast } from "react-toastify";
import { CheckCheck, CheckCircle } from "lucide-react";

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
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tomorrowDate = moment().add(1, "days").format("MMMM D, YYYY");

  if (!medicineLoading && !medicineBoxFillingActivities?.medicines) {
    return (
      <div className="pt-4 ps-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Activity - Medicine Box Filing for {tomorrowDate}</h5>
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
            {medicineBoxFillingActivities.completed ? (
              <span className="d-flex align-items-center ">
                <CheckCheck className="me-2 text-success" />
                Completed
              </span>
            ) : (
              " No medicines found"
            )}
          </p>
        </div>
      </div>
    );
  }

  // If completed is true
  if (medicineBoxFillingActivities.completed) {
    return (
      <div className="pt-4 ps-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Activity - Medicine Box Filing for {tomorrowDate}</h5>
          <Badge color="success" className="d-flex align-items-center">
            <CheckCircle size={16} className="me-1" />
            Completed
          </Badge>
        </div>

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
                    meds.map((med) => (
                      <div
                        key={`${timeSlot}-${med.medicineIndex}`}
                        className="border rounded-lg p-3 bg-white shadow-sm"
                      >
                        <div className="d-flex justify-content-between align-items-start">
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
                          <div className="text-success">
                            <CheckCircle size={20} />
                          </div>
                        </div>
                        {med.isMarked && (
                          <div className="mt-2 text-muted small">
                            <em>Already marked for tomorrow</em>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No medicines for {timeSlot}</p>
                  )}
                </div>
              </div>
            )
          )}
        </Row>
      </div>
    );
  }

  // else form submission

  const initialValues = { medicines: [] };

  if (!medicineLoading && medicineBoxFillingActivities?.medicines) {
    Object.entries(medicineBoxFillingActivities.medicines).forEach(
      ([slot, meds]) => {
        meds.forEach((med) => {
          initialValues.medicines.push({
            medicineIndex: med.medicineIndex,
            slot,
            status: med.isMarked ? "completed" : "missed",
          });
        });
      }
    );
  }

  const submitMedicines = async (values) => {
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark medicines. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (values) => {
    submitMedicines(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={medicineSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, handleSubmit, isValid }) => {
        const allCompleted =
          values.medicines.length > 0 &&
          values.medicines.every((m) => m.status === "completed");

        return (
          <Form>
            <div className="pt-4 ps-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Activity - Medicine Box Filing for {tomorrowDate}</h5>
                <i className="text-muted">Must be completed today</i>
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
                                const medicineIndex =
                                  values.medicines.findIndex(
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
                                          <CheckCircle size={24} />
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

                  {!Object.values(
                    medicineBoxFillingActivities?.medicines
                  ).every((slotMeds) => slotMeds.length === 0) && (
                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        color="primary"
                        type="submit"
                        className="mt-3"
                        disabled={
                          submissionSuccess || isSubmitting || !allCompleted
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Submit
                          </>
                        ) : submissionSuccess ? (
                          "Submit"
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

const mapStateToProps = (state) => ({
  medicineBoxFillingActivities: state.Nurse.medicines.nextDay,
  medicineLoading: state.Nurse.medicineLoading,
});

export default connect(mapStateToProps)(ActivityMedicineForm);
