import { useMemo, useState } from "react";
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
import {
  getNextDayMedicineBoxFillingActivities,
  markTomorrowActivityMedicines,
} from "../../../../store/features/nurse/nurseSlice";
import { connect } from "react-redux";
import Placeholder from "../../../Patient/Views/Components/Placeholder";
import moment from "moment";
import { toast } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import PharmacyBatchPicker, { formatBatchLabel } from "./PharmacyBatchPicker";
import { shouldPromptForPharmacy } from "./pharmacyPicker.helper";

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
//                         key={`${timeSlot}-${med.medicineId || med.medicineIndex}`}
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
//                                     key={`${timeSlot}-${med.medicineId || med.medicineIndex}`}
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

export const buildMedicineSchema = (pharmacyDeductionEnabled = false) =>
  Yup.object().shape({
    medicines: Yup.array().of(
      Yup.object().shape({
        medicineIndex: Yup.number().nullable(),
        medicineId: Yup.string().nullable(),
        prescriptionId: Yup.string().nullable(),
        slot: Yup.string().oneOf(["morning", "evening", "night"]).required(),
        status: Yup.string()
          .oneOf(["completed", "missed", "retrieved", "pending"])
          .required(),
        pharmacyId: Yup.string()
          .nullable()
          .test(
            "pharmacy-required",
            "Please select from inventory",
            function (value) {
              const { status, needsRemoval } = this.parent;
              if (!pharmacyDeductionEnabled) return true;
              if (needsRemoval) return true;
              if (status !== "completed") return true;
              return !!value;
            }
          ),
      })
    ),
  });

// Kept for anything not yet threading the gate through — behaves exactly as
// before (pharmacyId never required).
export const medicineSchema = buildMedicineSchema(false);

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
  // Which medicine rows currently have the inline pharmacy picker expanded —
  // a Set so Select All can open every still-needed picker at once, not just
  // one at a time.
  const [openPickers, setOpenPickers] = useState(() => new Set());
  const [pickedBatchLabels, setPickedBatchLabels] = useState({});

  const pharmacyDeductionEnabled = !!medicineBoxFillingActivities?.pharmacyDeductionEnabled;
  const medicineSchemaForPatient = useMemo(
    () => buildMedicineSchema(pharmacyDeductionEnabled),
    [pharmacyDeductionEnabled]
  );

  const isPickerOpen = (idx) => openPickers.has(idx);
  const openPickerFor = (idx) =>
    setOpenPickers((prev) => new Set(prev).add(idx));
  const closePickerFor = (idx) =>
    setOpenPickers((prev) => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
  const closeAllPickers = () => setOpenPickers(new Set());

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const writable = hasPermission("NURSE", "MEDICINE_BOX_FILLING_FOR_TOMORROW", "WRITE");

  const toggleModal = () => setModalOpen(!modalOpen);

  const tomorrowDate = moment().add(1, "days").format("MMMM D, YYYY");

  if (
    !medicineLoading &&
    !medicineBoxFillingActivities?.medicines &&
    !medicineBoxFillingActivities?.retrievals &&
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

  if (!medicineLoading && medicineBoxFillingActivities.completed) {
    return (
      <div className="pt-4 ps-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Activity - Medicine Box Filing for {tomorrowDate}</h5>
          <Badge color="success" className="d-flex align-items-center">
            <CheckCircle size={16} className="me-1" />
            Completed
          </Badge>
        </div>

        {medicineBoxFillingActivities?.medicines ? (
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
                        key={`${timeSlot}-${med.medicineId || med.medicineIndex}`}
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
                            className={`${med.marked ? "text-success" : "text-danger"
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
        ) : (
          <p className="text-muted mb-0">All required medicine activities are complete.</p>
        )}
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
        meds.filter((med) => !med.marked).forEach((med) => {
          initialValues.medicines.push({
            prescriptionId: med.prescriptionId,
            medicineId: med.medicineId,
            medicineIndex: med.medicineIndex,
            slot,
            status: med.missed ? "missed" : "pending",
            pharmacyId: null,
          });
        });
      }
    );
  }

  if (
    !medicineLoading &&
    !medicineBoxFillingActivities?.completed &&
    medicineBoxFillingActivities?.retrievals
  ) {
    Object.entries(medicineBoxFillingActivities.retrievals).forEach(
      ([slot, meds]) => {
        meds.forEach((med) => {
          initialValues.medicines.push({
            historyId: med.historyId,
            prescriptionId: med.prescriptionId,
            medicineId: med.medicineId,
            medicineIndex: med.medicineIndex,
            slot,
            status: "pending",
            needsRemoval: true,
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
      await dispatch(getNextDayMedicineBoxFillingActivities(id)).unwrap();
      setSubmissionSuccess(false);
      toast.success("Medicine activities updated successfully!");

      if (fromModal) {
        toggleModal();
      }
    } catch (error) {
      toast.error(error.message || "Failed to mark medicines. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (values) => {
    const pendingNormalMedicines = values.medicines.filter(
      (m) => !m.historyId && m.status === "pending"
    );
    const hasCompletedNormalMedicine = values.medicines.some(
      (m) => !m.historyId && m.status === "completed"
    );
    const pendingRetrievals = values.medicines.filter(
      (m) => m.historyId && m.status !== "retrieved"
    );
    const selectedActions = values.medicines.filter((m) =>
      m.historyId ? m.status === "retrieved" : m.status === "completed"
    );

    // Block until every previously-marked medicine has been retrieved.
    if (pendingRetrievals.length > 0) {
      toast.error(
        `Please retrieve ${pendingRetrievals.length} previously marked medicine${pendingRetrievals.length > 1 ? "s" : ""} before marking tomorrow's activities.`
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
    } else {
      submitMedicines({ medicines: selectedActions }, false);
    }
  };

  const handleSelectAll = (values, setFieldValue) => {
    const normalMedicines = values.medicines.filter(
      (m) => !m.historyId && m.status !== "missed"
    );
    const retrievalMedicines = values.medicines.filter((m) => m.historyId);

    const allNormalDone =
      normalMedicines.length === 0 ||
      normalMedicines.every((m) => m.status === "completed");
    const allRetrievalsDone =
      retrievalMedicines.length === 0 ||
      retrievalMedicines.every((m) => m.status === "retrieved");
    const allSelected = allNormalDone && allRetrievalsDone;

    const needsPharmacyIndexes = [];

    values.medicines.forEach((m, idx) => {
      if (m.status === "missed") return;
      if (m.historyId) {
        setFieldValue(
          `medicines[${idx}].status`,
          allSelected ? "pending" : "retrieved"
        );
        return;
      }

      // Completing needs a pharmacy chosen first. Without this, Select All
      // marks everything completed with no pharmacyId, validation silently
      // blocks Submit, and the nurse gets a dead button with no explanation.
      if (!allSelected && pharmacyDeductionEnabled && !m.pharmacyId) {
        needsPharmacyIndexes.push(idx);
        return;
      }

      setFieldValue(
        `medicines[${idx}].status`,
        allSelected ? "pending" : "completed"
      );
      if (allSelected) {
        setFieldValue(`medicines[${idx}].pharmacyId`, null);
      }
    });

    if (allSelected) {
      closeAllPickers();
    } else if (needsPharmacyIndexes.length > 0) {
      // Open every still-needed picker at once instead of making the nurse
      // tap each medicine individually just to reveal it.
      setOpenPickers(new Set(needsPharmacyIndexes));
      toast.info(
        `${needsPharmacyIndexes.length} medicine${needsPharmacyIndexes.length > 1 ? "s" : ""} need to be selected from inventory — pick a batch for each below.`
      );
    }
  };

  const hasActionToSubmit = (values) =>
    values.medicines.some((m) =>
      m.historyId ? m.status === "retrieved" : m.status === "completed"
    );

  const handleModalConfirm = () => {
    if (submissionValues) {
      submitMedicines(submissionValues, true);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={medicineSchemaForPatient}
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
                {medicineBoxFillingActivities?.medicines && (
                  <>
                    <h6 className="mb-3 text-primary">Medicines To Mark</h6>
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
                                  (med.medicineId
                                    ? String(m.medicineId) ===
                                      String(med.medicineId)
                                    : m.medicineIndex === med.medicineIndex) &&
                                  m.slot === timeSlot
                              );

                              return (
                                <div
                                  key={`${timeSlot}-${med.medicineId || med.medicineIndex}`}
                                  className="border rounded-lg p-3 bg-white shadow-sm"
                                >
                                  <div className="d-flex justify-content-between align-items-center">
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
                                    ) : med.marked ? (
                                      <div
                                        title="Already completed"
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          borderRadius: "50%",
                                          border: "2px solid #198754",
                                          cursor: "not-allowed",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: "#198754",
                                        }}
                                      >
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
                                      </div>
                                    ) : med.missed ? (
                                      <div
                                        title="Already recorded as missed for today"
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          borderRadius: "50%",
                                          border: "2px solid #dc3545",
                                          cursor: "not-allowed",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: "#dc3545",
                                        }}
                                      >
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
                                          <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div
                                        className="tick-input"
                                        onClick={() => {
                                          if (!writable) return;
                                          const currentStatus =
                                            values.medicines[medicineIndex]
                                              ?.status;
                                          const nextStatus =
                                            currentStatus === "completed"
                                              ? "pending"
                                              : "completed";

                                          // Completing needs a pharmacy chosen
                                          // first — expand the picker under
                                          // this medicine instead of marking it.
                                          if (
                                            shouldPromptForPharmacy({
                                              nextStatus,
                                              needsRemoval: false,
                                              pharmacyDeductionEnabled,
                                            })
                                          ) {
                                            if (isPickerOpen(medicineIndex)) {
                                              closePickerFor(medicineIndex);
                                            } else {
                                              openPickerFor(medicineIndex);
                                            }
                                            return;
                                          }

                                          setFieldValue(
                                            `medicines[${medicineIndex}].status`,
                                            nextStatus
                                          );
                                          if (nextStatus === "pending") {
                                            setFieldValue(
                                              `medicines[${medicineIndex}].pharmacyId`,
                                              null
                                            );
                                            closePickerFor(medicineIndex);
                                          }
                                        }}
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          borderRadius: "50%",
                                          border: "2px solid #dee2e6",
                                          cursor: writable ? "pointer" : "not-allowed",
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

                                  {pharmacyDeductionEnabled &&
                                    values.medicines[medicineIndex]
                                      ?.pharmacyId &&
                                    !isPickerOpen(medicineIndex) && (
                                      <div
                                        className="d-flex align-items-center gap-2 mt-2 px-2 rounded"
                                        style={{
                                          background: "#f0f9f2",
                                          border: "1px solid #d3ecd8",
                                          minHeight: 30,
                                        }}
                                      >
                                        <CheckCircle
                                          size={13}
                                          className="text-success flex-shrink-0"
                                        />
                                        <span
                                          className="text-success-emphasis flex-grow-1"
                                          style={{ fontSize: "0.75rem" }}
                                        >
                                          {pickedBatchLabels[medicineIndex] ||
                                            "Selected from inventory"}
                                        </span>
                                        <button
                                          type="button"
                                          className="btn btn-link btn-sm text-decoration-none"
                                          style={{ fontSize: "0.75rem", padding: "4px 4px" }}
                                          onClick={() =>
                                            openPickerFor(medicineIndex)
                                          }
                                        >
                                          Change
                                        </button>
                                      </div>
                                    )}

                                  {isPickerOpen(medicineIndex) && (
                                    <PharmacyBatchPicker
                                      patientId={id}
                                      medicine={{
                                        medicineId: med.medicineId,
                                        medicineName: med.medicineName,
                                      }}
                                      selectedPharmacyId={
                                        values.medicines[medicineIndex]
                                          ?.pharmacyId
                                      }
                                      onSelect={(pharmacyId, batch) => {
                                        const label = batch
                                          ? formatBatchLabel(batch)
                                          : null;

                                        // Same drug, other slots that day
                                        // (still pending) get the same batch
                                        // automatically — one pick covers the
                                        // whole day. Each slot's "Change"
                                        // link still lets it be given from a
                                        // different batch afterward.
                                        const siblingIndexes = values.medicines
                                          .map((m, i) => ({ m, i }))
                                          .filter(
                                            ({ m, i }) =>
                                              !m.historyId &&
                                              String(m.medicineId) ===
                                                String(med.medicineId) &&
                                              (i === medicineIndex ||
                                                m.status === "pending")
                                          )
                                          .map(({ i }) => i);

                                        siblingIndexes.forEach((i) => {
                                          setFieldValue(
                                            `medicines[${i}].pharmacyId`,
                                            pharmacyId
                                          );
                                          setFieldValue(
                                            `medicines[${i}].status`,
                                            "completed"
                                          );
                                        });

                                        if (label) {
                                          setPickedBatchLabels((prev) => {
                                            const next = { ...prev };
                                            siblingIndexes.forEach((i) => {
                                              next[i] = label;
                                            });
                                            return next;
                                          });
                                        }
                                        // Siblings just got auto-completed —
                                        // close their pickers too if Select
                                        // All had opened several at once.
                                        setOpenPickers((prev) => {
                                          const next = new Set(prev);
                                          siblingIndexes.forEach((i) => next.delete(i));
                                          return next;
                                        });
                                      }}
                                      onCancel={() => closePickerFor(medicineIndex)}
                                    />
                                  )}
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
                  </>
                )}

                {medicineBoxFillingActivities?.retrievals &&
                  Object.values(medicineBoxFillingActivities.retrievals).some(
                    (slotMeds) => slotMeds.length > 0
                  ) && (
                    <div className="mt-4">
                      <h6 className="mb-3 text-danger">
                        Medicines To Remove (Mark this after removing it from the box)
                      </h6>
                      <Row className="gap-3">
                        {Object.entries(
                          medicineBoxFillingActivities.retrievals
                        ).map(([timeSlot, meds]) => (
                          <div
                            key={`remove-${timeSlot}`}
                            style={{ flex: "1 1 30%", minWidth: "250px" }}
                          >
                            <h6 className="text-capitalize mb-3">{timeSlot}</h6>
                            <div className="d-flex flex-column gap-3">
                              {Array.isArray(meds) && meds.length > 0 ? (
                                meds.map((med) => {
                                  const medicineIndex = values.medicines.findIndex(
                                    (m) =>
                                      m.historyId === med.historyId &&
                                      m.slot === timeSlot
                                  );

                                  return (
                                    <div
                                      key={`${timeSlot}-${med.historyId}`}
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
                                              className="ms-1 border text-danger"
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
                                        className="tick-input"
                                        onClick={() => {
                                          if (!writable) return;
                                          const currentStatus =
                                            values.medicines[medicineIndex]?.status;
                                          setFieldValue(
                                            `medicines[${medicineIndex}].status`,
                                            currentStatus === "retrieved"
                                              ? "pending"
                                              : "retrieved"
                                          );
                                        }}
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          borderRadius: "50%",
                                          border: "2px solid #dee2e6",
                                          cursor: writable ? "pointer" : "not-allowed",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor:
                                            values.medicines[medicineIndex]
                                              ?.status === "retrieved"
                                              ? "#dc3545"
                                              : "white",
                                          transition: "all 0.2s ease",
                                        }}
                                      >
                                        {values.medicines[medicineIndex]?.status ===
                                          "retrieved" && (
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
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-muted">
                                  No medicines to remove for {timeSlot}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </Row>
                    </div>
                  )}

                {writable &&
                  ((medicineBoxFillingActivities?.medicines &&
                  !Object.values(medicineBoxFillingActivities.medicines).every(
                    (slotMeds) => slotMeds.length === 0
                  )) ||
                  (medicineBoxFillingActivities?.retrievals &&
                    !Object.values(medicineBoxFillingActivities.retrievals).every(
                      (slotMeds) => slotMeds.length === 0
                    ))) && (
                    <div className="d-flex justify-content-end mt-3 gap-2">
                      <Button
                        color="info"
                        size="sm"
                        onClick={() => handleSelectAll(values, setFieldValue)}
                        disabled={
                          !values.medicines.some((m) => !m.historyId)
                        }
                      >
                        {values.medicines
                          .filter((m) => !m.historyId && m.status !== "missed")
                          .every((m) => m.status === "completed")
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
                          !hasActionToSubmit(values)
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
