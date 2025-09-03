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
import { CheckCheck, CheckCircle, XCircle } from "lucide-react";

// const medicineSchema = Yup.object().shape({
//   medicines: Yup.array().of(
//     Yup.object().shape({
//       medicineIndex: Yup.number().required(),
//       slot: Yup.string().oneOf(["morning", "evening", "night"]).required(),
//       status: Yup.string().oneOf(["completed", "missed"]).required(),
//     })
//   ),
// });

// const ActivityMedicineForm = ({
//   medicineBoxFillingActivities,
//   medicineLoading,
// }) => {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const [submissionSuccess, setSubmissionSuccess] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const tomorrowDate = moment().add(1, "days").format("MMMM D, YYYY");

//   if (!medicineLoading && !medicineBoxFillingActivities?.medicines) {
//     return (
//       <div className="pt-4 ps-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h5>Activity - Medicine Box Filing for {tomorrowDate}</h5>
//         </div>
//         <div>
//           <p
//             style={{
//               color: "#888",
//               fontStyle: "italic",
//               margin: "1rem 0",
//               fontSize: "0.85rem",
//             }}
//           >
//             {medicineBoxFillingActivities.completed ? (
//               <span className="d-flex align-items-center ">
//                 <CheckCheck className="me-2 text-success" />
//                 Completed
//               </span>
//             ) : (
//               " No medicines found"
//             )}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // If completed is true
//   if (medicineBoxFillingActivities.completed) {
//     return (
//       <div className="pt-4 ps-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h5>Activity - Medicine Box Filing for {tomorrowDate}</h5>
//           <Badge color="success" className="d-flex align-items-center">
//             <CheckCircle size={16} className="me-1" />
//             Completed
//           </Badge>
//         </div>

//         <Row className="gap-3">
//           {Object.entries(medicineBoxFillingActivities.medicines).map(
//             ([timeSlot, meds]) => (
//               <div
//                 key={timeSlot}
//                 style={{ flex: "1 1 30%", minWidth: "250px" }}
//               >
//                 <h6 className="text-capitalize mb-3">{timeSlot}</h6>
//                 <div className="d-flex flex-column gap-3">
//                   {Array.isArray(meds) && meds.length > 0 ? (
//                     meds.map((med) => (
//                       <div
//                         key={`${timeSlot}-${med.medicineIndex}`}
//                         className="border rounded-lg p-3 bg-white shadow-sm"
//                       >
//                         <div className="d-flex justify-content-between align-items-start">
//                           <div>
//                             <h6 className="fw-bold text-dark mb-1">
//                               {med.medicineName}
//                             </h6>
//                             <small className="text-muted d-flex flex-wrap align-items-center gap-2">
//                               <span>
//                                 <strong>Dosage:</strong> x{med.dosage}
//                               </span>
//                               <span>
//                                 <strong>Intake:</strong> {med.intake}
//                               </span>
//                               <span>
//                                 <strong>Time:</strong>
//                                 <Badge
//                                   color="light"
//                                   className="ms-1 border text-primary"
//                                   style={{
//                                     fontSize: "0.6rem",
//                                     fontWeight: "600",
//                                     padding: "0.15rem 0.4rem",
//                                   }}
//                                 >
//                                   {timeSlot.toUpperCase()}
//                                 </Badge>
//                               </span>
//                             </small>
//                           </div>
//                           <div className="text-success">
//                             <CheckCircle size={20} />
//                           </div>
//                         </div>
//                         {med.isMarked && (
//                           <div className="mt-2 text-muted small">
//                             <em>Already marked for tomorrow</em>
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-muted">No medicines for {timeSlot}</p>
//                   )}
//                 </div>
//               </div>
//             )
//           )}
//         </Row>
//       </div>
//     );
//   }

//   // else form submission

//   const initialValues = { medicines: [] };

//   if (!medicineLoading && medicineBoxFillingActivities?.medicines) {
//     Object.entries(medicineBoxFillingActivities.medicines).forEach(
//       ([slot, meds]) => {
//         meds.forEach((med) => {
//           initialValues.medicines.push({
//             medicineIndex: med.medicineIndex,
//             slot,
//             status: med.isMarked ? "completed" : "missed",
//           });
//         });
//       }
//     );
//   }

//   const submitMedicines = async (values) => {
//     setIsSubmitting(true);
//     try {
//       await dispatch(
//         markTomorrowActivityMedicines({
//           medicines: values.medicines,
//           patientId: id,
//         })
//       ).unwrap();
//       setSubmissionSuccess(true);
//       toast.success("Medicines marked successfully!");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to mark medicines. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleSubmit = (values) => {
//     submitMedicines(values);
//   };

//   return (
//     <Formik
//       initialValues={initialValues}
//       validationSchema={medicineSchema}
//       onSubmit={handleSubmit}
//       enableReinitialize
//     >
//       {({ values, setFieldValue, handleSubmit, isValid }) => {
//         const allCompleted =
//           values.medicines.length > 0 &&
//           values.medicines.every((m) => m.status === "completed");

//         return (
//           <Form>
//             <div className="pt-4 ps-3">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5>Activity - Medicine Box Filing for {tomorrowDate}</h5>
//                 <i className="text-muted">Must be completed today</i>
//               </div>
//               {medicineLoading ? (
//                 <Placeholder />
//               ) : (
//                 <>
//                   <Row className="gap-3">
//                     {Object.entries(medicineBoxFillingActivities.medicines).map(
//                       ([timeSlot, meds]) => (
//                         <div
//                           key={timeSlot}
//                           style={{ flex: "1 1 30%", minWidth: "250px" }}
//                         >
//                           <h6 className="text-capitalize mb-3">{timeSlot}</h6>
//                           <div className="d-flex flex-column gap-3">
//                             {Array.isArray(meds) && meds.length > 0 ? (
//                               meds.map((med, idx) => {
//                                 const medicineIndex =
//                                   values.medicines.findIndex(
//                                     (m) =>
//                                       m.medicineIndex === med.medicineIndex &&
//                                       m.slot === timeSlot
//                                   );

//                                 return (
//                                   <div
//                                     key={`${timeSlot}-${med.medicineIndex}`}
//                                     className="border rounded-lg p-3 bg-white shadow-sm d-flex justify-content-between align-items-center"
//                                   >
//                                     <div>
//                                       <h6 className="fw-bold text-dark mb-1">
//                                         {med.medicineName}
//                                       </h6>
//                                       <small className="text-muted d-flex flex-wrap align-items-center gap-2">
//                                         <span>
//                                           <strong>Dosage:</strong> x{med.dosage}
//                                         </span>
//                                         <span>
//                                           <strong>Intake:</strong> {med.intake}
//                                         </span>
//                                         <span>
//                                           <strong>Time:</strong>
//                                           <Badge
//                                             color="light"
//                                             className="ms-1 border text-primary"
//                                             style={{
//                                               fontSize: "0.6rem",
//                                               fontWeight: "600",
//                                               padding: "0.15rem 0.4rem",
//                                             }}
//                                           >
//                                             {timeSlot.toUpperCase()}
//                                           </Badge>
//                                         </span>
//                                       </small>
//                                     </div>
//                                     <div>
//                                       {submissionSuccess ? (
//                                         <div className="text-success">
//                                           <CheckCircle size={24} />
//                                         </div>
//                                       ) : (
//                                         <div
//                                           className="tick-input"
//                                           onClick={() => {
//                                             const currentStatus =
//                                               values.medicines[medicineIndex]
//                                                 ?.status;
//                                             setFieldValue(
//                                               `medicines[${medicineIndex}].status`,
//                                               currentStatus === "completed"
//                                                 ? "missed"
//                                                 : "completed"
//                                             );
//                                           }}
//                                           style={{
//                                             width: "28px",
//                                             height: "28px",
//                                             borderRadius: "50%",
//                                             border: "2px solid #dee2e6",
//                                             cursor: "pointer",
//                                             display: "flex",
//                                             alignItems: "center",
//                                             justifyContent: "center",
//                                             backgroundColor:
//                                               values.medicines[medicineIndex]
//                                                 ?.status === "completed"
//                                                 ? "#198754"
//                                                 : "white",
//                                             transition: "all 0.2s ease",
//                                           }}
//                                         >
//                                           {values.medicines[medicineIndex]
//                                             ?.status === "completed" && (
//                                             <svg
//                                               xmlns="http://www.w3.org/2000/svg"
//                                               width="16"
//                                               height="16"
//                                               viewBox="0 0 24 24"
//                                               fill="none"
//                                               stroke="white"
//                                               strokeWidth="3"
//                                               strokeLinecap="round"
//                                               strokeLinejoin="round"
//                                             >
//                                               <path d="M20 6L9 17l-5-5" />
//                                             </svg>
//                                           )}
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <p className="text-muted">
//                                 No medicines for {timeSlot}
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       )
//                     )}
//                   </Row>

//                   {!Object.values(
//                     medicineBoxFillingActivities?.medicines
//                   ).every((slotMeds) => slotMeds.length === 0) && (
//                     <div className="d-flex justify-content-end mt-3">
//                       <Button
//                         color="primary"
//                         type="submit"
//                         className="mt-3"
//                         disabled={
//                           submissionSuccess || isSubmitting || !allCompleted
//                         }
//                       >
//                         {isSubmitting ? (
//                           <>
//                             <Spinner size="sm" className="me-2" />
//                             Submit
//                           </>
//                         ) : submissionSuccess ? (
//                           "Submit"
//                         ) : (
//                           "Submit"
//                         )}
//                       </Button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </Form>
//         );
//       }}
//     </Formik>
//   );
// };

// const mapStateToProps = (state) => ({
//   medicineBoxFillingActivities: state.Nurse.medicines.nextDay,
//   medicineLoading: state.Nurse.medicineLoading,
// });

// export default connect(mapStateToProps)(ActivityMedicineForm);

export const medicineSchema = Yup.object().shape({
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

  if (
    !medicineLoading &&
    !medicineBoxFillingActivities?.medicines &&
    !medicineBoxFillingActivities.completed
  ) {
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
            No medicines found
          </p>
        </div>
      </div>
    );
  }

  if (
    !medicineLoading &&
    medicineBoxFillingActivities?.medicines &&
    medicineBoxFillingActivities.completed
  ) {
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
                          <div
                            className={`${
                              med.marked ? "text-success" : "text-danger"
                            }`}
                          >
                            {med.marked ? (
                              <CheckCircle size={20} />
                            ) : (
                              <XCircle size={20} />
                            )}
                          </div>
                        </div>
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

  const initialValues = { medicines: [] };

  if (
    !medicineLoading &&
    !medicineBoxFillingActivities?.completed &&
    medicineBoxFillingActivities?.medicines
  ) {
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

  const handleSelectAll = (values, setFieldValue) => {
    const allCompleted = values.medicines.every(
      (m) => m.status === "completed"
    );
    values.medicines.forEach((m, idx) =>
      setFieldValue(
        `medicines[${idx}].status`,
        allCompleted ? "missed" : "completed"
      )
    );
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
                                    {med.instructions && (
                                      <div className="text-muted">
                                        <span>
                                          <strong>Instructions:</strong>{" "}
                                          {med.instructions}
                                        </span>
                                      </div>
                                    )}
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
                  <div className="d-flex justify-content-end mt-3 gap-2">
                    <Button
                      color="info"
                      size="sm"
                      onClick={() => handleSelectAll(values, setFieldValue)}
                    >
                      {values.medicines.every((m) => m.status === "completed")
                        ? "Unselect All"
                        : "Select All"}
                    </Button>

                    <Button
                      color="primary"
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        submissionSuccess ||
                        isSubmitting ||
                        !values.medicines.some((m) => m.status === "completed")
                      }
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
                  </div>
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
