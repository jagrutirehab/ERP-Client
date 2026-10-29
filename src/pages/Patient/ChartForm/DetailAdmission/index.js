import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Form,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { api } from "../../../../config";
import {
  generateDetailAdmissionAudio,
  abortDetailAdmissionAudio,
} from "../../../../helpers/backend_helper";
import { DetailHistoryClearContext } from "./DetailHistoryClearContext";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
// import ConsentFiles from "./ConsentFiles";
import convertToFormData from "../../../../utils/convertToFormData";
// import DetailAdmissionForm from "./DetailAdmissionForm";
import DetailHistoryForm from "./DetailHistoryForm";
import SpecialRequirementsForm from "./SpecialRequirementsForm";
import MentalExamination from "./MentalExamination";
import DoctorSignature from "./DoctorSignature";
import { connect, useDispatch } from "react-redux";
import {
  addDetailAdmission,
  addGeneralDetailAdmission,
  updateDetailAdmission,
} from "../../../../store/actions";
import ChiefComplaintsForm from "./ChiefComplaintsForm";
import MentalExaminationV2 from "./MentalExaminationV2";
// import PatientTypeFields from "./PatientTypeFields";
import PatientTypeFields, {
  validatePatientTypeFields,
} from "./PatientTypeFields";
import ElderlyChecklistForm from "./ElderlyChecklistForm";
import { validateElderlyChecklist } from "../../../../utils/elderlyChecklistValidation";
import RecordingTab from "./RecordingTab";
// import ProvisionalDiagnosisForm from "./ProvisionalDiagnosisForm";

const RECORDING = "RECORDING";
// const CONSET_FILES = "CONSENT_FILES";
const DETAIL_ADMISSION = "DETAIL_ADMISSION";
const DETAIL_HISTORY = "DETAIL_HISTORY";
const SPECIAL_REQUIREMENTS = "SPECIAL_REQUIREMENTS";
const CHIEF_COMPLAINTS = "CHIEF_COMPLAINTS";
// const PROVISIONAL_DIAGNOSIS = "PROVISIONAL_DIAGNOSIS";
const ELDERLY_CHECKLIST = "ELDERLY_CHECKLIST";
const MENTAL_EXAMINATION = "MENTAL_EXAMINATION";
// const PHYSICAL_EXAMINATION = "PHYSICAL_EXAMINATION";
const DOCTOR_SIGNATURE = "DOCTOR_SIGNATURE";
const PATIENT_TYPE_FIELDS = "PATIENT_TYPE_FIELDS";


const DetailAdmission = ({
  author,
  patient,
  patientData,
  center,
  chartDate,
  editChartData,
  type,
  closeForm,
  // data,
}) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(editChartData?._id);
  const [consentFiles, setConsentFiles] = useState();
  const [formStep, setFormStep] = useState(
    !isEdit && type === "IPD" ? RECORDING : CHIEF_COMPLAINTS,
  );
  const [patientTypeSubmitAttempted, setPatientTypeSubmitAttempted] =
    useState(false);
  const [elderlyChecklistSubmitAttempted, setElderlyChecklistSubmitAttempted] =
    useState(false);

  // When switching into edit mode, ensure formStep is not stuck on RECORDING
  useEffect(() => {
    if (isEdit && formStep === RECORDING) {
      setFormStep(CHIEF_COMPLAINTS);
    }
  }, [isEdit, formStep]);

  // AI-Powered Audio Recording state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [draftCleared, setDraftCleared] = useState(false);
  const isClearingRef = useRef(false);

  const sessionIdRef = useRef(null);
  const isGeneratingRef = useRef(false);
  isGeneratingRef.current = isGenerating;
  const uploadedAudioRef = useRef(null);
  uploadedAudioRef.current = uploadedAudio;
  const socketRef = useRef(null);
  const validationValuesRef = useRef(null);

  const detailAdmissionForm = editChartData?.detailAdmission;
  const isOldMentalExamination = Boolean(
    detailAdmissionForm?.mentalExamination,
  );

  // bridge stored Boolean (true/false/undefined) <-> Yes/No radio value
  const triToYesNo = (v) => (v === true ? "yes" : v === false ? "no" : "");

  const draftKey = `detailAdmissionDraft_${patient?._id || "new"}`;

  const savedDraft = useMemo(() => {
    if (isEdit || draftCleared) return null;
    try {
      const d = localStorage.getItem(draftKey);
      return d ? JSON.parse(d) : null;
    } catch {
      return null;
    }
  }, [draftKey, isEdit, draftCleared]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author?._id,
      patient: patient?._id,
      center: center
        ? center
        : patient?.center?._id
          ? patient.center._id
          : patient?.center,
      addmission: patient?.addmission?._id,
      //detail addmission form
      age: detailAdmissionForm ? detailAdmissionForm.detailAdmission?.age : "",
      doctorConsultant: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.doctorConsultant
        : "",
      religion: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.religion
        : "",
      maritalStatus: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.maritalStatus
        : "",
      bloodGroup: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.bloodGroup
        : "",
      occupation: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.occupation
        : "",
      education: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.education
        : "",
      address: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.address
        : "",
      referral: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.referral
        : "",
      provisionaldiagnosis: Array.isArray(
        detailAdmissionForm?.doctorSignature?.provisionaldiagnosis,
      )
        ? detailAdmissionForm.doctorSignature.provisionaldiagnosis.map(
            (d) => d.code_id,
          )
        : [],

      diagnosis: Array.isArray(detailAdmissionForm?.doctorSignature?.diagnosis)
        ? detailAdmissionForm.doctorSignature.diagnosis.map((d) => d.code_id)
        : [],

      //detail history
      informant: detailAdmissionForm
        ? detailAdmissionForm.ChiefComplaints?.informant
        : "",
      informantName: detailAdmissionForm
        ? detailAdmissionForm.ChiefComplaints?.informantName
        : "",
      counsellor: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.counsellor
        : patientData?.psychologistData?.name,
      // referredby: detailAdmissionForm
      //   ? detailAdmissionForm.detailHistory?.referredby
      //   : "",
      reliable: detailAdmissionForm
        ? detailAdmissionForm.ChiefComplaints?.reliable
        : "Reliable",
      adequate: detailAdmissionForm
        ? detailAdmissionForm.ChiefComplaints?.adequate
        : "Adequate",
      negativeHistory: detailAdmissionForm
        ? (() => {
            const val = detailAdmissionForm.detailHistory?.negativeHistory;
            if (!val) return [];
            if (Array.isArray(val)) {
              return val
                .flatMap((item) =>
                  typeof item === "string"
                    ? item.split(",").map((s) => s.trim())
                    : item,
                )
                .filter(Boolean);
            }
            return [];
          })()
        : [],
      negativeHistoryOther: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.negativeHistoryOther
        : "",
      developmentDelay: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.developmentDelay
        : "",
      developmentDelayDetails: detailAdmissionForm
        ? Array.isArray(
            detailAdmissionForm.detailHistory?.developmentDelayDetails,
          )
          ? detailAdmissionForm.detailHistory?.developmentDelayDetails
          : []
        : [],
      developmentDelaySittingDetails: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.developmentDelaySittingDetails ||
          ""
        : "",
      developmentDelayStandingDetails: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.developmentDelayStandingDetails ||
          ""
        : "",
      developmentDelaySpeechDetails: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.developmentDelaySpeechDetails || ""
        : "",
      developmentDelayToiletTrainingDetails: detailAdmissionForm
        ? detailAdmissionForm.detailHistory
            ?.developmentDelayToiletTrainingDetails || ""
        : "",
      pastHistory: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.pastHistory
        : "",
      occupationHistory: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.occupationHistory
        : "",
      familyHistory: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.familyHistory
        : "",
      personalHistory: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.personalHistory
        : "",
      personality: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.personality
        : "",
      socialSupport: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.socialSupport
        : "",

      // special requirements (Yes/No radios -> stored as Boolean; "" = not answered)
      physiotherapy: triToYesNo(
        detailAdmissionForm?.specialRequirements?.physiotherapy,
      ),
      walking: triToYesNo(detailAdmissionForm?.specialRequirements?.walking),
      homeMedicines: triToYesNo(
        detailAdmissionForm?.specialRequirements?.homeMedicines,
      ),
      exercise: triToYesNo(detailAdmissionForm?.specialRequirements?.exercise),
      foodRequirement: triToYesNo(
        detailAdmissionForm?.specialRequirements?.foodRequirement,
      ),
      externalDoctorVisits: triToYesNo(
        detailAdmissionForm?.specialRequirements?.externalDoctorVisits,
      ),
      extraCareTaker: triToYesNo(
        detailAdmissionForm?.specialRequirements?.extraCareTaker,
      ),
      specialRequirementsDetails: detailAdmissionForm
        ? detailAdmissionForm.specialRequirements?.specialRequirementsDetails ||
          ""
        : "",

      // ChiefComplaints

      line1: detailAdmissionForm
        ? detailAdmissionForm.ChiefComplaints?.line1
        : "",
      line2: detailAdmissionForm
        ? detailAdmissionForm.ChiefComplaints?.line2
        : "",
      line3: detailAdmissionForm
        ? detailAdmissionForm.ChiefComplaints?.line3
        : "",
      line4: detailAdmissionForm
        ? detailAdmissionForm.ChiefComplaints?.line4
        : "",

      //Provisional Diagnosis
      // diagnosis1: detailAdmissionForm
      //   ? detailAdmissionForm.ProvisionalDiagnosis?.diagnosis1
      //   : "",

      //mental status examination
      ...(isOldMentalExamination
        ? {
            appearance: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.appearance
              : "",
            ecc: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.ecc
              : "",
            speech: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.speech
              : "",
            mood: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.mood
              : "",
            effect: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.effect
              : "",
            thinking: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.thinking
              : "",
            perception: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.perception
              : "",
            memory: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.memory
              : "",
            abstractThinking: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.abstractThinking
              : "",
            socialJudgment: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.socialJudgment
              : "",
            insight: detailAdmissionForm
              ? detailAdmissionForm.mentalExamination?.insight
              : "",
          }
        : {}),

      ...(!isOldMentalExamination
        ? {
            // grooming:
            //   detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
            //     ?.grooming || "",
            // eyeContact:
            //   detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
            //     ?.eyeContact || "",
            // psychomotorActivity:
            //   detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
            //     ?.psychomotorActivity || "",

            // rate:
            //   detailAdmissionForm?.mentalExaminationV2?.speech?.rate || "",
            // volume:
            //   detailAdmissionForm?.mentalExaminationV2?.speech?.volume || "",

            // affect:
            //   detailAdmissionForm?.mentalExaminationV2?.mood?.affect || "",
            // affectNotes:
            //   detailAdmissionForm?.mentalExaminationV2?.mood?.affectNotes || "",
            // subjective:
            //   detailAdmissionForm?.mentalExaminationV2?.mood?.subjective || "",

            // delusions:
            //   detailAdmissionForm?.mentalExaminationV2?.thought?.delusions || "",
            // delusionNotes:
            //   detailAdmissionForm?.mentalExaminationV2?.thought?.delusionNotes || "",
            // content:
            //   detailAdmissionForm?.mentalExaminationV2?.thought?.content || "",

            // perception:
            //   detailAdmissionForm?.mentalExaminationV2?.perception || "",
            // orientation:
            //   detailAdmissionForm?.mentalExaminationV2?.cognition?.orientation || "",
            // memory:
            //   detailAdmissionForm?.mentalExaminationV2?.cognition?.memory || "",

            // grade:
            //   detailAdmissionForm?.mentalExaminationV2?.insight?.grade || "",
            // judgment:
            //   detailAdmissionForm?.mentalExaminationV2?.judgment || "",
            // remarks:
            //   detailAdmissionForm?.mentalExaminationV2?.remarks || "",
            grooming:
              detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
                ?.grooming || "",
            generalAppearance:
              detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
                ?.generalAppearance || "",
            surroundingTouch:
              detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
                ?.surroundingTouch || "",
            eyeContact:
              detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
                ?.eyeContact || "",
            psychomotorActivity:
              detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
                ?.psychomotorActivity || "",

            rate: detailAdmissionForm?.mentalExaminationV2?.speech?.rate || "",
            tone: detailAdmissionForm?.mentalExaminationV2?.speech?.tone || "",
            volume:
              detailAdmissionForm?.mentalExaminationV2?.speech?.volume || "",
            reactionTime:
              detailAdmissionForm?.mentalExaminationV2?.speech?.reactionTime ||
              "",
            productivity:
              detailAdmissionForm?.mentalExaminationV2?.speech?.productivity ||
              "",
            speed:
              detailAdmissionForm?.mentalExaminationV2?.speech?.speed || "",
            relevance:
              detailAdmissionForm?.mentalExaminationV2?.speech?.relevance || "",
            coherence:
              detailAdmissionForm?.mentalExaminationV2?.speech?.coherence || "",
            goalDirection:
              detailAdmissionForm?.mentalExaminationV2?.speech?.goalDirection ||
              "",

            affect:
              detailAdmissionForm?.mentalExaminationV2?.mood?.affect || "",
            affectNotes:
              detailAdmissionForm?.mentalExaminationV2?.mood?.affectNotes || "",
            subjective:
              detailAdmissionForm?.mentalExaminationV2?.mood?.subjective || "",
            objective:
              detailAdmissionForm?.mentalExaminationV2?.mood?.objective || "",
            lability:
              detailAdmissionForm?.mentalExaminationV2?.mood?.lability || "",
            appropriateness1:
              detailAdmissionForm?.mentalExaminationV2?.mood?.appropriateness ||
              "",

            quality:
              detailAdmissionForm?.mentalExaminationV2?.affectV2?.quality || "",
            intensity:
              detailAdmissionForm?.mentalExaminationV2?.affectV2?.intensity ||
              "",
            mobility:
              detailAdmissionForm?.mentalExaminationV2?.affectV2?.mobility ||
              "",
            range:
              detailAdmissionForm?.mentalExaminationV2?.affectV2?.range || "",
            reactivity:
              detailAdmissionForm?.mentalExaminationV2?.affectV2?.reactivity ||
              "",
            communicability:
              detailAdmissionForm?.mentalExaminationV2?.affectV2
                ?.communicability || "",
            diurnalVariation:
              detailAdmissionForm?.mentalExaminationV2?.affectV2
                ?.diurnalVariation || "",
            appropriateness2:
              detailAdmissionForm?.mentalExaminationV2?.affectV2
                ?.appropriateness || "",

            delusions:
              detailAdmissionForm?.mentalExaminationV2?.thought?.delusions ||
              "",
            delusionNotes:
              detailAdmissionForm?.mentalExaminationV2?.thought
                ?.delusionNotes || "",
            content:
              detailAdmissionForm?.mentalExaminationV2?.thought?.content || "",
            process:
              detailAdmissionForm?.mentalExaminationV2?.thought?.process || "",

            perception:
              detailAdmissionForm?.mentalExaminationV2?.perception || "",
            perceptionNotes:
              detailAdmissionForm?.mentalExaminationV2?.perceptionNotes || "",

            orientationTime:
              detailAdmissionForm?.mentalExaminationV2?.cognition
                ?.orientationTime || "",
            orientationPlace:
              detailAdmissionForm?.mentalExaminationV2?.cognition
                ?.orientationPlace || "",
            orientationPerson:
              detailAdmissionForm?.mentalExaminationV2?.cognition
                ?.orientationPerson || "",
            immediateMemory:
              detailAdmissionForm?.mentalExaminationV2?.cognition
                ?.immediateMemory || "",
            recentMemory:
              detailAdmissionForm?.mentalExaminationV2?.cognition
                ?.recentMemory || "",
            remoteMemory:
              detailAdmissionForm?.mentalExaminationV2?.cognition
                ?.remoteMemory || "",
            attention:
              detailAdmissionForm?.mentalExaminationV2?.cognition?.attention ||
              "",
            concentration:
              detailAdmissionForm?.mentalExaminationV2?.cognition
                ?.concentration || "",

            grade:
              detailAdmissionForm?.mentalExaminationV2?.insight?.grade || "",

            judgment: detailAdmissionForm?.mentalExaminationV2?.judgment || "",

            remarks: detailAdmissionForm?.mentalExaminationV2?.remarks || "",
          }
        : {}),
      //physical status examination
      // generalExamination: detailAdmissionForm
      //   ? detailAdmissionForm.physicalExamination?.generalExamination
      //   : "",
      cns: detailAdmissionForm
        ? detailAdmissionForm.physicalExamination?.cns
        : "",
      cvs: detailAdmissionForm
        ? detailAdmissionForm.physicalExamination?.cvs
        : "",
      pulse: detailAdmissionForm
        ? detailAdmissionForm.physicalExamination?.pulse
        : "",
      bp: detailAdmissionForm
        ? detailAdmissionForm.physicalExamination?.bp
        : "",
      rs: detailAdmissionForm
        ? detailAdmissionForm.physicalExamination?.rs
        : "",
      pa: detailAdmissionForm
        ? detailAdmissionForm.physicalExamination?.pa
        : "",
      formulation: detailAdmissionForm
        ? detailAdmissionForm.physicalExamination?.formulation
        : "",
      //diagnosis & doctor signature


      managmentPlan: (() => {
        const val = detailAdmissionForm?.doctorSignature?.managmentPlan;
        if (!val) return "";
        if (val === "INDOOR" || val.toLowerCase().includes("indoor"))
          return "INDOOR";
        if (val === "Out Patient" || val.toLowerCase().includes("out"))
          return "Out Patient";
        return val;
      })(),
      // investigation: detailAdmissionForm
      //   ? detailAdmissionForm.doctorSignature?.investigation
      //   : [],
      investigation: detailAdmissionForm
        ? (() => {
            const data = detailAdmissionForm.doctorSignature?.investigation;

            if (!data) return [];

            let result = [];

            if (Array.isArray(data)) {
              data.forEach((item) => {
                if (typeof item === "string") {
                  // handle "RFT,HIV"
                  if (item.includes(",")) {
                    result.push(...item.split(","));
                  } else {
                    result.push(item);
                  }
                }
              });
            }

            return result.map((i) => i.trim());
          })()
        : [],
      specialTest: detailAdmissionForm
        ? detailAdmissionForm.doctorSignature?.specialTest
        : "",
      treatment: detailAdmissionForm
        ? detailAdmissionForm.doctorSignature?.treatment
        : "",
      patientType: detailAdmissionForm?.patientType || "",
      addictionFields: JSON.stringify(
        detailAdmissionForm?.addictionFields || {},
      ),
      psychiatricFields: JSON.stringify(
        detailAdmissionForm?.psychiatricFields || {},
      ),
      geriatricFields: JSON.stringify(
        detailAdmissionForm?.geriatricFields || {},
      ),
      elderlyChecklistFields: JSON.stringify({
        ...(detailAdmissionForm?.elderlyChecklistFields || {}),
        skinConcerns: Array.isArray(
          detailAdmissionForm?.elderlyChecklistFields?.skinConcerns,
        )
          ? detailAdmissionForm.elderlyChecklistFields.skinConcerns
          : [],
      }),
      rapport:
        detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior
          ?.rapport || "",
      congruence:
        detailAdmissionForm?.mentalExaminationV2?.affectV2?.congruence || "",
      formOfThought:
        detailAdmissionForm?.mentalExaminationV2?.thought?.formOfThought || "",
      chart: DETAIL_ADMISSION,
      date: chartDate,
      type,
      aiGenerated: detailAdmissionForm?.aiGenerated || false,
      aiReviewed: false,
      audioDetails: detailAdmissionForm?.audioDetails
        ? (typeof detailAdmissionForm.audioDetails === "string"
            ? detailAdmissionForm.audioDetails
            : JSON.stringify(detailAdmissionForm.audioDetails))
        : "",
      ...(!isEdit && savedDraft ? savedDraft : {}),
      // A NEW chart starts from the Patient Type already on the admission card
      // (unless the draft has one). Editing keeps the chart's own value.
      ...(!isEdit &&
        !savedDraft?.patientType &&
        patient?.addmission?.patientAdmissionType && {
          patientType: patient.addmission.patientAdmissionType,
        }),
    },

    validationSchema: Yup.object({
      patient: Yup.string().required("Patient is required"),
      center: Yup.string().required("Center is required"),
      chart: Yup.string().required("Chart is required"),

      provisionaldiagnosis: Yup.array()
        .of(Yup.string())
        .nullable()
        .test(
          "required-if-edit-provisional",
          "Please Re-Enter Provisional Diagnosis",
          function (value) {
            const isEdit = Boolean(editChartData?._id);

            const existing =
              detailAdmissionForm?.doctorSignature?.provisionaldiagnosis;

            const hasValidCodeObject =
              isEdit &&
              Array.isArray(existing) &&
              existing.some(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  item.code?.trim() &&
                  item.code_id?.trim(),
              );

            if (hasValidCodeObject) return true;

            const hasExisting =
              isEdit &&
              Array.isArray(existing) &&
              existing.filter(Boolean).length > 0;

            if (!hasExisting) return true;

            return Array.isArray(value) && value.filter(Boolean).length > 0;
          },
        ),

      diagnosis: Yup.array()
        .of(Yup.string())
        .nullable()
        .test(
          "required-if-edit",
          "Please Re-Enter Final Diagnosis",
          function (value) {
            const isEdit = Boolean(editChartData?._id);

            const existingDiagnosis =
              detailAdmissionForm?.doctorSignature?.diagnosis;

            const hasValidCodeObject =
              isEdit &&
              Array.isArray(existingDiagnosis) &&
              existingDiagnosis.some(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  item.code?.trim() &&
                  item.code_id?.trim(),
              );

            if (hasValidCodeObject) return true;

            const hasExisting =
              isEdit &&
              Array.isArray(existingDiagnosis) &&
              existingDiagnosis.filter(Boolean).length > 0;

            if (!hasExisting) return true;

            return Array.isArray(value) && value.filter(Boolean).length > 0;
          },
        ),

      // .test(
      //   "no-overlap",
      //   "Final Diagnosis cannot be the same as Provisional Diagnosis",
      //   function (value) {

      //     const provisional = this.parent.provisionaldiagnosis;

      //     const finalArr = Array.isArray(value)
      //       ? value.filter(Boolean)
      //       : [];

      //     const provisionalArr = Array.isArray(provisional)
      //       ? provisional.filter(Boolean)
      //       : [];

      //     if (finalArr.length === 0 || provisionalArr.length === 0) {
      //       return true;
      //     }

      //     const hasOverlap = finalArr.some(v =>
      //       provisionalArr.includes(v)
      //     );

      //     return !hasOverlap;
      //   }
      // ),
    }),
    onSubmit: (values) => {
      /* AI Validation Checkguard - only enforce for brand new records */
      const isEditRecord =
        isEdit ||
        Boolean(values._id || values.id || values.chartId || editChartData?._id);
      if (!isEditRecord && values.aiGenerated && !values.aiReviewed) {
        toast.error(
          "Please confirm that you have reviewed and validated the AI-generated data on the Special Requirements tab before saving."
        );
        setFormStep(SPECIAL_REQUIREMENTS);
        return;
      }

      /* appending */
      const { isValid } = validatePatientTypeFields(values);
      if (!isValid) {
        setPatientTypeSubmitAttempted(true);
        setFormStep(PATIENT_TYPE_FIELDS);
        return;
      }
      const informantNameRequired =
        values.informant && values.informant !== "Self";

      const chiefComplaintsMissing =
        !values.informant ||
        !values.reliable ||
        !values.adequate ||
        !values.line1 ||
        !values.line2 ||
        (informantNameRequired && !values.informantName);

      if (chiefComplaintsMissing) {
        setFormStep(CHIEF_COMPLAINTS);
        return;
      }
      const detailHistoryMissing =
        !Array.isArray(values.negativeHistory) ||
        values.negativeHistory.length === 0 ||
        !values.developmentDelay ||
        !values.personality;

      if (detailHistoryMissing) {
        setFormStep(DETAIL_HISTORY);
        return;
      }
      if (values.patientType?.toLowerCase() === "geriatric") {
        const { isValid: checklistValid } = validateElderlyChecklist(
          values.elderlyChecklistFields,
        );
        if (!checklistValid) {
          setElderlyChecklistSubmitAttempted(true);
          setFormStep(ELDERLY_CHECKLIST);
          return;
        }
      }
      if (!isOldMentalExamination) {
        const mseFields = [
          "generalAppearance",
          "psychomotorActivity",
          "eyeContact",
          "rapport",
          "rate",
          "volume",
          "relevance",
          "coherence",
          "quality",
          "reactivity",
          "mobility",
          "congruence",
          "delusions",
          "formOfThought",
          "perception",
          "orientationTime",
          "orientationPlace",
          "orientationPerson",
          "immediateMemory",
          "recentMemory",
          "remoteMemory",
          "grade",
          "judgment",
        ];
        const mseMissing = mseFields.some((f) => !values[f]);
        if (mseMissing) {
          setFormStep(MENTAL_EXAMINATION);
          return;
        }
      }
      //
      const diagnosisMissing =
        !Array.isArray(values.provisionaldiagnosis) ||
        values.provisionaldiagnosis.length === 0 ||
        !values.managmentPlan;

      if (diagnosisMissing) {
        setFormStep(DOCTOR_SIGNATURE);
        return;
      }

      if (values.delusions === "none") {
        values.delusionNotes = "";
      }

      // Ensure audioDetails is serialized for multipart formData
      let audioMeta = values.audioDetails;
      if (!audioMeta && uploadedAudioRef.current?.url) {
        audioMeta = {
          url: uploadedAudioRef.current.url,
          originalName: uploadedAudioRef.current.originalName || uploadedAudioRef.current.name,
          size: uploadedAudioRef.current.size,
          mimetype: uploadedAudioRef.current.mimetype || uploadedAudioRef.current.type,
          duration: uploadedAudioRef.current.duration || 0,
          sourceType:
            uploadedAudioRef.current.sourceType === "recorded"
              ? "recorded"
              : "uploaded",
          uploadedAt: uploadedAudioRef.current.uploadedAt || new Date(),
        };
      }
      if (audioMeta && typeof audioMeta === "object") {
        if (!audioMeta.sourceType && uploadedAudioRef.current?.sourceType) {
          audioMeta.sourceType = uploadedAudioRef.current.sourceType;
        }
        values.audioDetails = JSON.stringify(audioMeta);
      } else if (typeof audioMeta === "string" && audioMeta.trim() !== "") {
        values.audioDetails = audioMeta;
      }

      const formData = convertToFormData(values);
      consentFiles?.forEach((file) => formData.append("file", file.file));
      /* appending */

      if (detailAdmissionForm) {
        formData.append("id", editChartData._id);
        formData.append("chartId", detailAdmissionForm._id);
        dispatch(updateDetailAdmission(formData));
      } else if (type === "GENERAL") {
        dispatch(addGeneralDetailAdmission(formData));
        localStorage.removeItem(draftKey);
      } else {
        dispatch(addDetailAdmission(formData));
        localStorage.removeItem(draftKey);
      }
    },
  });

  useEffect(() => {
    if (!detailAdmissionForm) {
      validation.resetForm();
      setConsentFiles([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, detailAdmissionForm]);

  // AUTOFILL
  // useEffect(() => {
  //   if (!detailAdmissionForm) {
  //     const psychiatricData = {
  //       historyOfPresentIllness: {
  //         onsetAge: "25",
  //         modeOfOnset: "Acute (< 2 weeks)",
  //         precipitatingFactors: ["Psychosocial stressor"],
  //         onsetDurationProgress: "Test onset description",
  //       },
  //       symptomDomains: {
  //         affective: ["Depressed mood"],
  //         psychotic: ["None"],
  //         cognitive: ["None"],
  //         behavioural: ["None"],
  //         somaticNeurovegetative: ["None"],
  //         suicidalitySelfHarm: ["None"],
  //       },
  //       functionalImpact: {
  //         workOccupationalFunctioning: "Intact",
  //         socialInterpersonalFunctioning: "Intact",
  //         gafScore: 70,
  //         gafSeverity: "Mild (61-100)",
  //       },
  //       pastIllness: {
  //         hasPastPsychiatricEpisode: "No",
  //         totalHospitalisations: "0",
  //         previousDiagnoses: ["None"],
  //         substanceUseHistory: "No",
  //       },
  //       pastTreatment: {
  //         ect: "Never",
  //         psychotherapyType: ["Never"],
  //       },
  //       suicidalSelfHarmHistory: {
  //         homicidalIdeationViolence: "None",
  //       },
  //       psychosocialSupport: {
  //         familySupport: "Supportive / cohesive",
  //       },
  //     };

  //     validation.setValues({
  //       ...validation.values,
  //       // Chief Complaints
  //       informant: "Self",
  //       reliable: "Reliable",
  //       adequate: "Adequate",
  //       line1: "Test Complaint 1",
  //       line2: "Test Complaint 2",
  //       // Patient Type
  //       patientType: "psychiatric",
  //       psychiatricFields: JSON.stringify(psychiatricData),
  //       addictionFields: JSON.stringify({}),
  //       geriatricFields: JSON.stringify({}),
  //       // Other History
  //       negativeHistory: ["Head Injury"],
  //       developmentDelay: "No",
  //       personality: "Test pre-morbid personality",
  //       // MSE
  //       generalAppearance: "kempt",
  //       eyeContact: "normal",
  //       psychomotorActivity: "normal",
  //       rapport: "established_with_ease",
  //       rate: "normal",
  //       tone: "normal",
  //       volume: "normal/audible",
  //       relevance: "relevant",
  //       coherence: "coherent",
  //       goalDirection: "goal_directed",
  //       subjective: "Normal mood",
  //       quality: "euthymic",
  //       reactivity: "present",
  //       mobility: "intact",
  //       congruence: "congruent_to_mood",
  //       delusions: "none",
  //       formOfThought: "normal",
  //       perception: "normal",
  //       orientationTime: "Intact",
  //       orientationPlace: "Intact",
  //       orientationPerson: "Intact",
  //       immediateMemory: "Intact",
  //       recentMemory: "Intact",
  //       remoteMemory: "Intact",
  //       grade: "grade_1-_complete_denial_of_illness",
  //       judgment: "intact",
  //       // Diagnosis
  //       managmentPlan: "INDOOR",
  //     });
  //   }
  // }, []);
  // AUTOFILL


  // Smart Merge Strategy: Preserve existing user inputs, populate empty fields
  const smartMergeAiData = (currentValues, aiData) => {
    if (!aiData || typeof aiData !== "object") return currentValues;

    const merged = { ...currentValues };

    const isEmptyVal = (val) => {
      if (val === undefined || val === null) return true;
      if (typeof val === "string") return val.trim() === "";
      if (Array.isArray(val)) return val.length === 0;
      if (typeof val === "object") return Object.keys(val).length === 0;
      return false;
    };

    const isCellEmpty = (c) => c === undefined || c === null || String(c).trim() === "";

    const mergeRowArrays = (targetArr, sourceArr) => {
      if (!Array.isArray(sourceArr) || sourceArr.length === 0) return targetArr || [];
      if (!Array.isArray(targetArr) || targetArr.length === 0) {
        return sourceArr.map((row) => {
          if (!row || typeof row !== "object") return row;
          const r = { ...row };
          if (r.quantity && !r.quantityDose) r.quantityDose = r.quantity;
          if (r.quantityDose && !r.quantity) r.quantity = r.quantityDose;
          return r;
        });
      }

      // Check if target is a grid table (has substance, activity, parameter, or label)
      const isGridArray =
        targetArr.some((r) => r && (r.substance !== undefined || r.activity !== undefined || r.parameter !== undefined)) ||
        sourceArr.some((r) => r && (r.substance !== undefined || r.activity !== undefined || r.parameter !== undefined));

      if (!isGridArray) {
        return targetArr.length > 0 ? targetArr : sourceArr;
      }

      return targetArr.map((targetRow) => {
        if (!targetRow || typeof targetRow !== "object") return targetRow;
        const targetLabel = targetRow.substance || targetRow.activity || targetRow.parameter || targetRow.label;

        const matchedSource = sourceArr.find((s) => {
          if (!s || typeof s !== "object") return false;
          const sourceLabel = s.substance || s.activity || s.parameter || s.label;
          if (!sourceLabel || !targetLabel) return false;
          const sLower = String(sourceLabel).toLowerCase().trim();
          const tLower = String(targetLabel).toLowerCase().trim();
          return (
            sLower === tLower ||
            tLower.includes(sLower) ||
            sLower.includes(tLower) ||
            (sLower.startsWith("cannabis") && tLower.startsWith("cannabis")) ||
            (sLower.startsWith("tobacco") && tLower.startsWith("tobacco")) ||
            (sLower.startsWith("opioid") && tLower.startsWith("opioid"))
          );
        });

        if (!matchedSource) return targetRow;

        const mergedRow = { ...targetRow };
        for (const [k, v] of Object.entries(matchedSource)) {
          if (isCellEmpty(mergedRow[k]) && !isCellEmpty(v)) {
            mergedRow[k] = v;
          }
        }
        if (isCellEmpty(mergedRow.quantityDose) && !isCellEmpty(mergedRow.quantity)) {
          mergedRow.quantityDose = mergedRow.quantity;
        }
        if (isCellEmpty(mergedRow.quantity) && !isCellEmpty(mergedRow.quantityDose)) {
          mergedRow.quantity = mergedRow.quantityDose;
        }
        return mergedRow;
      });
    };

    const parseObj = (raw) => {
      if (!raw) return {};
      if (typeof raw === "object") return { ...raw };
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    };

    // Normalize incoming aiData substance profile into addictionFields and psychiatricFields
    const effectiveAiData = { ...aiData };
    const rawSubstanceProfile =
      effectiveAiData.substanceProfile ||
      parseObj(effectiveAiData.addictionFields)?.substanceProfile ||
      parseObj(effectiveAiData.psychiatricFields)?.pastIllness?.substanceUseTable;

    if (Array.isArray(rawSubstanceProfile) && rawSubstanceProfile.length > 0) {
      const parsedAddiction = parseObj(effectiveAiData.addictionFields);
      if (!parsedAddiction.substanceProfile || parsedAddiction.substanceProfile.length === 0) {
        parsedAddiction.substanceProfile = rawSubstanceProfile;
      }
      const hasSubstanceUse = rawSubstanceProfile.some(
        (r) => r.ageOfFirstUse || r.currentUse || r.frequency || r.quantityDose || r.quantity || r.lastUse
      );
      if (parsedAddiction.noSubstanceUseReported === undefined) {
        parsedAddiction.noSubstanceUseReported = !hasSubstanceUse;
      }
      effectiveAiData.addictionFields = parsedAddiction;

      const parsedPsych = parseObj(effectiveAiData.psychiatricFields);
      parsedPsych.pastIllness = parsedPsych.pastIllness || {};
      if (!parsedPsych.pastIllness.substanceUseTable || parsedPsych.pastIllness.substanceUseTable.length === 0) {
        parsedPsych.pastIllness.substanceUseTable = rawSubstanceProfile;
      }
      if (!parsedPsych.pastIllness.substanceUseHistory) {
        parsedPsych.pastIllness.substanceUseHistory = hasSubstanceUse ? "Yes" : "No";
      }
      effectiveAiData.psychiatricFields = parsedPsych;

      // Auto-set patientType to addiction if primary concern is substance use and not already chosen
      if (hasSubstanceUse && (!merged.patientType || merged.patientType === "general")) {
        merged.patientType = "addiction";
      }
    }

    const mergeNested = (currentRaw, aiRaw) => {
      const curr = parseObj(currentRaw);
      const ai = parseObj(aiRaw);

      const deepMerge = (target, source) => {
        const result = { ...target };
        for (const [key, val] of Object.entries(source || {})) {
          if (Array.isArray(val)) {
            if (Array.isArray(target[key]) && target[key].length > 0 && typeof target[key][0] === "object") {
              result[key] = mergeRowArrays(target[key], val);
            } else if (isEmptyVal(target[key]) && !isEmptyVal(val)) {
              result[key] = val;
            }
          } else if (val && typeof val === "object") {
            result[key] = deepMerge(target[key] || {}, val);
          } else {
            if (isEmptyVal(target[key]) && !isEmptyVal(val)) {
              result[key] = val;
            }
          }
        }
        return result;
      };

      return JSON.stringify(deepMerge(curr, ai));
    };

    Object.keys(effectiveAiData).forEach((key) => {
      if (
        key === "psychiatricFields" ||
        key === "addictionFields" ||
        key === "geriatricFields" ||
        key === "elderlyChecklistFields"
      ) {
        merged[key] = mergeNested(currentValues[key], effectiveAiData[key]);
      } else {
        if (isEmptyVal(currentValues[key]) && !isEmptyVal(effectiveAiData[key])) {
          merged[key] = effectiveAiData[key];
        }
      }
    });

    if (effectiveAiData.audioDetails) {
      merged.audioDetails =
        typeof effectiveAiData.audioDetails === "string"
          ? effectiveAiData.audioDetails
          : JSON.stringify(effectiveAiData.audioDetails);
    }

    merged.aiGenerated = true;
    merged.aiReviewed = Boolean(currentValues.aiReviewed);

    return merged;
  };

  validationValuesRef.current = validation.values;

  // Socket.io Integration mirroring Counseling Notes
  useEffect(() => {
    const SOCKET_BASE_URL = api.API_URL.replace("/api/v1", "");
    const socket = io(SOCKET_BASE_URL, {
      path: "/socket/search",
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("detailHistoryAiProgress", (data) => {
      if (data?.sessionId === sessionIdRef.current) {
        setGenerationProgress({
          status: data.status,
          message: data.message,
          percent: data.percent,
        });
      }
    });

    socket.on("detailHistoryAiDone", (data) => {
      console.log("detailHistoryAiDone received", {
        incomingSessionId: data?.sessionId,
        currentSessionIdRef: sessionIdRef.current,
        match: data?.sessionId === sessionIdRef.current,
      });
      if (data?.sessionId !== sessionIdRef.current) return;
      try {
        if (data.data) {
          const currentVals = validationValuesRef.current || validation.values;
          const merged = smartMergeAiData(currentVals, data.data);
          validation.setValues(merged);
        }
        toast.success(
          "Detail History successfully auto-filled! Please review across tabs before saving."
        );
      } catch (err) {
        console.error("detailHistoryAiDone handler failed:", err);
        toast.error(
          "AI auto-fill completed but applying the results failed. Please check the browser console and try again."
        );
      } finally {
        setIsGenerating(false);
        setHasGenerated(true);
      }
    });

    socket.on("detailHistoryAiError", (data) => {
      if (data?.sessionId === sessionIdRef.current) {
        setIsGenerating(false);
        toast.error(data.error || "Failed to process audio recording");
      }
    });

    return () => {
      if (isGeneratingRef.current && sessionIdRef.current) {
        abortDetailAdmissionAudio({
          sessionId: sessionIdRef.current,
          audioPath: uploadedAudioRef.current?.path,
        }).catch(() => {});
      }
      socket.off("detailHistoryAiProgress");
      socket.off("detailHistoryAiDone");
      socket.off("detailHistoryAiError");
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartGeneration = async () => {
    if (!uploadedAudio?.url) {
      toast.error("Please upload an audio file first");
      return;
    }

    const sessionId = `dh-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionIdRef.current = sessionId;
    setIsGenerating(true);
    setGenerationProgress({
      status: "starting",
      message: "Initiating background AI analysis...",
      percent: 5,
    });

    try {
      await generateDetailAdmissionAudio({
        audioUrl: uploadedAudio.url,
        audioPath: uploadedAudio.path,
        sessionId,
        patientId: patient?._id,
        centerId: center,
        audioDetails: uploadedAudio,
      });
    } catch (err) {
      setIsGenerating(false);
      toast.error(err.message || "Failed to start AI generation");
    }
  };

  const handleAbortGeneration = async (shouldToast = true) => {
    if (sessionIdRef.current) {
      try {
        await abortDetailAdmissionAudio({
          sessionId: sessionIdRef.current,
          audioPath: uploadedAudio?.path,
        });
        if (shouldToast) toast.info("AI generation aborted and audio cleaned up.");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Abort error:", err);
      }
    }
    setIsGenerating(false);
    sessionIdRef.current = null;
  };

  const handleModalClose = async () => {
    if (isGeneratingRef.current && sessionIdRef.current) {
      await handleAbortGeneration(false);
    }
    closeForm();
  };

  const handleOpenClearModal = () => {
    setIsClearModalOpen(true);
  };

  const clearFormHandler = isEdit ? undefined : handleOpenClearModal;

  const handleConfirmClearForm = () => {
    isClearingRef.current = true;
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    setDraftCleared(true);
    setUploadedAudio(null);
    setHasGenerated(false);
    validation.resetForm();
    validation.setFieldValue("aiGenerated", false);
    validation.setFieldValue("aiReviewed", false);
    setIsClearModalOpen(false);
    setFormStep(isEdit ? CHIEF_COMPLAINTS : RECORDING);
    toast.success("All form fields and draft cleared.");
  };

  const isGeriatric =
    validation.values.patientType?.toLowerCase() === "geriatric";

  useEffect(() => {
    if (formStep === ELDERLY_CHECKLIST && !isGeriatric) {
      setFormStep(DETAIL_HISTORY);
    }
  }, [formStep, isGeriatric]);

  useEffect(() => {
    if (isEdit) return; // don't overwrite real data with a draft
    if (isClearingRef.current) {
      isClearingRef.current = false;
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
      return;
    }
    localStorage.setItem(draftKey, JSON.stringify(validation.values));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.values]);

  return (
    <React.Fragment>
      {" "}
      <div>
        <Row className="mt-3">
          <div className="arrow-buttons d-flex gap-3">
            {!isEdit && type === "IPD" && (
              <Button
                outline={formStep !== RECORDING}
                onClick={() => setFormStep(RECORDING)}
                disabled={isGenerating}
              >
                Recording
              </Button>
            )}
            <Button
              outline={formStep !== CHIEF_COMPLAINTS}
              onClick={() => setFormStep(CHIEF_COMPLAINTS)}
              disabled={isGenerating}
            >
              Chief Complaints
            </Button>
            <Button
              outline={formStep !== PATIENT_TYPE_FIELDS}
              onClick={() => setFormStep(PATIENT_TYPE_FIELDS)}
              disabled={isGenerating}
            >
              Patient Type Assessment
            </Button>
            <Button
              outline={formStep !== DETAIL_HISTORY}
              onClick={() => setFormStep(DETAIL_HISTORY)}
              disabled={isGenerating}
            >
              Other History
            </Button>
            {isGeriatric && (
              <Button
                outline={formStep !== ELDERLY_CHECKLIST}
                onClick={() => setFormStep(ELDERLY_CHECKLIST)}
                disabled={isGenerating}
              >
                Elderly Functional and Daily Living Checklist
              </Button>
            )}
            <Button
              outline={formStep !== MENTAL_EXAMINATION}
              onClick={() => setFormStep(MENTAL_EXAMINATION)}
              disabled={isGenerating}
            >
              Mental Status Examination
            </Button>
            <Button
              outline={formStep !== DOCTOR_SIGNATURE}
              onClick={() => setFormStep(DOCTOR_SIGNATURE)}
              disabled={isGenerating}
            >
              Diagnosis & Plan
            </Button>
            <Button
              outline={formStep !== SPECIAL_REQUIREMENTS}
              onClick={() => setFormStep(SPECIAL_REQUIREMENTS)}
              disabled={isGenerating}
            >
              Special Requirements
            </Button>
          </div>
          <div className="mt-4">
            <DetailHistoryClearContext.Provider
              value={{ onClearForm: clearFormHandler, isGenerating }}
            >
              <Form
                // key={detailAdmissionForm?._id || "new"}
                key="detail-admission-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  // toggle();
                  return false;
                }}
                className="needs-validation"
                action="#"
              >
                {/* {formStep === CONSET_FILES && (
                  <>
                    {consentUploadedFiles}
                    <ConsentFiles
                      consentFiles={consentFiles}
                      setConsentFiles={setConsentFiles}
                      setFormStep={setFormStep}
                      step={CHIEF_COMPLAINTS}
                    />
                  </>
                )} */}

                {!isEdit && type === "IPD" && formStep === RECORDING && (
                  <RecordingTab
                    patient={patient}
                    center={center}
                    isGenerating={isGenerating}
                    generationProgress={generationProgress}
                    onStartGeneration={handleStartGeneration}
                    onAbortGeneration={handleAbortGeneration}
                    setFormStep={setFormStep}
                    nextStep={CHIEF_COMPLAINTS}
                    uploadedAudio={uploadedAudio}
                    setUploadedAudio={setUploadedAudio}
                    hasGenerated={hasGenerated}
                    onClearForm={clearFormHandler}
                  />
                )}

                {formStep === CHIEF_COMPLAINTS && (
                  <ChiefComplaintsForm
                    validation={validation}
                    setFormStep={setFormStep}
                    step={PATIENT_TYPE_FIELDS}
                  />
                )}

                {/* {formStep === PROVISIONAL_DIAGNOSIS && (
                  <ProvisionalDiagnosisForm
                    validation={validation}
                    setFormStep={setFormStep}
                    step={DETAIL_HISTORY}
                  />
                )} */}

                {/* {formStep === DETAIL_ADMISSION && (
                  <DetailAdmissionForm
                    validation={validation}
                    setFormStep={setFormStep}
                    step={DETAIL_HISTORY}
                  />
                )} */}

                {formStep === PATIENT_TYPE_FIELDS && (
                  <PatientTypeFields
                    validation={validation}
                    setFormStep={setFormStep}
                    step={DETAIL_HISTORY}
                    forceShowErrors={patientTypeSubmitAttempted}
                    onClearForm={clearFormHandler}
                  />
                )}

                {formStep === DETAIL_HISTORY && (
                  <DetailHistoryForm
                    validation={validation}
                    setFormStep={setFormStep}
                    step={isGeriatric ? ELDERLY_CHECKLIST : MENTAL_EXAMINATION}
                  />
                )}

                {formStep === ELDERLY_CHECKLIST && (
                  <ElderlyChecklistForm
                    validation={validation}
                    setFormStep={setFormStep}
                    step={MENTAL_EXAMINATION}
                    forceShowErrors={elderlyChecklistSubmitAttempted}
                    patient={patient}
                  />
                )}

                {formStep === MENTAL_EXAMINATION &&
                  (isOldMentalExamination ? (
                    <MentalExamination
                      validation={validation}
                      setFormStep={setFormStep}
                      step={DOCTOR_SIGNATURE}
                      mode="old"
                    />
                  ) : (
                    <MentalExaminationV2
                      validation={validation}
                      setFormStep={setFormStep}
                      step={DOCTOR_SIGNATURE}
                      mode="new"
                    />
                  ))}

                {/* {formStep === PHYSICAL_EXAMINATION && (
                  <PhysicalExamination
                    validation={validation}
                    setFormStep={setFormStep}
                    step={DOCTOR_SIGNATURE}
                  />
                )} */}

                {formStep === DOCTOR_SIGNATURE && (
                  <DoctorSignature
                    validation={validation}
                    setFormStep={setFormStep}
                    step={SPECIAL_REQUIREMENTS}
                  />
                )}

                {formStep === SPECIAL_REQUIREMENTS && (
                  <SpecialRequirementsForm
                    validation={validation}
                    closeForm={handleModalClose}
                    editChartData={editChartData}
                    author={author}
                    onClearForm={clearFormHandler}
                    isEdit={isEdit}
                  />
                )}
              </Form>
            </DetailHistoryClearContext.Provider>
          </div>
        </Row>

        {/* Clear Form Confirmation Modal */}
        <Modal
          isOpen={isClearModalOpen}
          toggle={() => setIsClearModalOpen(false)}
          centered
        >
          <ModalHeader toggle={() => setIsClearModalOpen(false)}>
            <i className="ri-alert-line text-warning me-2"></i> Confirm Clear Form
          </ModalHeader>
          <ModalBody>
            <p className="mb-0 fs-6">
              Are you sure you want to clear all form fields and local storage draft?
            </p>
            <small className="text-muted d-block mt-2">
              This will reset all entered data across every tab, remove the saved draft, and reset the AI validation status. This action cannot be undone.
            </small>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setIsClearModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={handleConfirmClearForm}>
              <i className="ri-delete-bin-line me-1"></i> Yes, Clear Form
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  author: state.User.user,
  patient: state.Chart.chartForm?.patient,
  patientData: state.Patient?.patient,
  center: state.Chart.chartForm?.center,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
  // data: state.Chart.data,
});

export default connect(mapStateToProps)(DetailAdmission);
