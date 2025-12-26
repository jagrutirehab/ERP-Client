import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Row } from "reactstrap";
import Divider from "../../../../Components/Common/Divider";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
// import ConsentFiles from "./ConsentFiles";
import convertToFormData from "../../../../utils/convertToFormData";
// import DetailAdmissionForm from "./DetailAdmissionForm";
import DetailHistoryForm from "./DetailHistoryForm";
import MentalExamination from "./MentalExamination";
import PhysicalExamination from "./PhysicalExamination";
import DoctorSignature from "./DoctorSignature";
import { connect, useDispatch } from "react-redux";
import {
  addDetailAdmission,
  addGeneralDetailAdmission,
  removeDetailAdissionFile,
  updateDetailAdmission,
} from "../../../../store/actions";
import FileCard from "../../../../Components/Common/FileCard";
import PreviewFile from "../../../../Components/Common/PreviewFile";
import DeleteModal from "../../../../Components/Common/DeleteModal";
import ChiefComplaintsForm from "./ChiefComplaintsForm";
import MentalExaminationV2 from "./MentalExaminationV2";
// import ProvisionalDiagnosisForm from "./ProvisionalDiagnosisForm";

// const CONSET_FILES = "CONSENT_FILES";
const DETAIL_ADMISSION = "DETAIL_ADMISSION";
const DETAIL_HISTORY = "DETAIL_HISTORY";
const CHIEF_COMPLAINTS = "CHIEF_COMPLAINTS";
// const PROVISIONAL_DIAGNOSIS = "PROVISIONAL_DIAGNOSIS";
const MENTAL_EXAMINATION = "MENTAL_EXAMINATION";
const PHYSICAL_EXAMINATION = "PHYSICAL_EXAMINATION";
const DOCTOR_SIGNATURE = "DOCTOR_SIGNATURE";

const UploadedFiles = ({ id, chartId, files }) => {
  const dispatch = useDispatch();

  //get file
  const [file, setFile] = useState({
    img: null,
    isOpen: false,
  });

  //delete file
  const [deleteFile, setDeleteFile] = useState({
    img: null,
    isOpen: false,
  });

  //delete file modal functions
  const deleteFilePermanently = () => {
    dispatch(
      removeDetailAdissionFile({
        id,
        chartId,
        fileId: deleteFile.img._id,
      })
    );
    setDeleteFile({ img: null, isOpen: false });
  };
  const onClose = () => {
    setDeleteFile({ img: null, isOpen: false });
  };

  //file card functions
  const getDeleteFile = (img) => {
    setDeleteFile({
      img: img,
      isOpen: true,
    });
  };
  const onPreview = (img) => {
    setFile({
      img,
      isOpen: true,
    });
  };

  return (
    <Row className="row-gap-3 mb-3">
      <Col xs={12}>
        <div className="d-flex align-items-center gap-3">
          <h6 className="display-6 fs-5 text-nowrap">Uploaded Files</h6>
          <Divider />
        </div>
      </Col>
      {(files || []).map((file, id) => (
        <Col key={id} xs={12} md={4}>
          <FileCard
            file={file}
            showDeleteButton
            onDelete={getDeleteFile}
            onPreview={onPreview}
          />
        </Col>
      ))}
      <PreviewFile
        file={file.img}
        isOpen={file.isOpen}
        toggle={() => setFile({ img: null, isOpen: false })}
      />
      <DeleteModal
        onDeleteClick={deleteFilePermanently}
        onCloseClick={onClose}
        show={deleteFile.isOpen}
      />
    </Row>
  );
};

const DetailAdmission = ({
  author,
  patient,
  patientData,
  center,
  chartDate,
  editChartData,
  type,
}) => {
  const dispatch = useDispatch();
  const [consentFiles, setConsentFiles] = useState();
  const [formStep, setFormStep] = useState(CHIEF_COMPLAINTS);

  const detailAdmissionForm = editChartData?.detailAdmission;
  const isOldMentalExamination = Boolean(detailAdmissionForm?.mentalExamination);
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
      provisionalDiagnosis: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.provisionalDiagnosis
        : "",
      revisedDiagnosis: detailAdmissionForm
        ? detailAdmissionForm.detailAdmission?.revisedDiagnosis
        : "",
      //detail history
      informant: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.informant
        : "",
      counsellor: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.counsellor
        : patientData?.psychologistData?.name,
      // referredby: detailAdmissionForm
      //   ? detailAdmissionForm.detailHistory?.referredby
      //   : "",
      reliable: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.reliable
        : "Reliable",
      adequate: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.adequate
        : "Adequate",
      history: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.history
        : "",
      negativeHistory: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.negativeHistory
        : "",
      pastHistory: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.pastHistory
        : "",
      developmentHistory: detailAdmissionForm
        ? detailAdmissionForm.detailHistory?.developmentHistory
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
      ...(isOldMentalExamination ? {
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
      } : {}),

      ...(!isOldMentalExamination ? {
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
        grooming: detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior?.grooming || "",
        generalAppearance: detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior?.generalAppearance || "",
        surroundingTouch: detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior?.surroundingTouch || "",
        eyeContact: detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior?.eyeContact || "",
        psychomotorActivity: detailAdmissionForm?.mentalExaminationV2?.appearanceAndBehavior?.psychomotorActivity || "",

        rate: detailAdmissionForm?.mentalExaminationV2?.speech?.rate || "",
        tone: detailAdmissionForm?.mentalExaminationV2?.speech?.tone || "",
        volume: detailAdmissionForm?.mentalExaminationV2?.speech?.volume || "",
        reactionTime: detailAdmissionForm?.mentalExaminationV2?.speech?.reactionTime || "",
        productivity: detailAdmissionForm?.mentalExaminationV2?.speech?.productivity || "",
        speed: detailAdmissionForm?.mentalExaminationV2?.speech?.speed || "",
        relevance: detailAdmissionForm?.mentalExaminationV2?.speech?.relevance || "",
        coherence: detailAdmissionForm?.mentalExaminationV2?.speech?.coherence || "",
        goalDirection: detailAdmissionForm?.mentalExaminationV2?.speech?.goalDirection || "",

        affect: detailAdmissionForm?.mentalExaminationV2?.mood?.affect || "",
        affectNotes: detailAdmissionForm?.mentalExaminationV2?.mood?.affectNotes || "",
        subjective: detailAdmissionForm?.mentalExaminationV2?.mood?.subjective || "",
        objective: detailAdmissionForm?.mentalExaminationV2?.mood?.objective || "",
        lability: detailAdmissionForm?.mentalExaminationV2?.mood?.lability || "",
        appropriateness1: detailAdmissionForm?.mentalExaminationV2?.mood?.appropriateness || "",

        quality: detailAdmissionForm?.mentalExaminationV2?.affectV2?.quality || "",
        intensity: detailAdmissionForm?.mentalExaminationV2?.affectV2?.intensity || "",
        mobility: detailAdmissionForm?.mentalExaminationV2?.affectV2?.mobility || "",
        range: detailAdmissionForm?.mentalExaminationV2?.affectV2?.range || "",
        reactivity: detailAdmissionForm?.mentalExaminationV2?.affectV2?.reactivity || "",
        communicability: detailAdmissionForm?.mentalExaminationV2?.affectV2?.communicability || "",
        diurnalVariation: detailAdmissionForm?.mentalExaminationV2?.affectV2?.diurnalVariation || "",
        appropriateness2: detailAdmissionForm?.mentalExaminationV2?.affectV2?.appropriateness || "",

        delusions: detailAdmissionForm?.mentalExaminationV2?.thought?.delusions || "",
        delusionNotes: detailAdmissionForm?.mentalExaminationV2?.thought?.delusionNotes || "",
        content: detailAdmissionForm?.mentalExaminationV2?.thought?.content || "",
        process: detailAdmissionForm?.mentalExaminationV2?.thought?.process || "",

        perception: detailAdmissionForm?.mentalExaminationV2?.perception || "",
        perceptionNotes: detailAdmissionForm?.mentalExaminationV2?.perceptionNotes || "",

        orientation: detailAdmissionForm?.mentalExaminationV2?.cognition?.orientation || "",
        attention: detailAdmissionForm?.mentalExaminationV2?.cognition?.attention || "",
        concentration: detailAdmissionForm?.mentalExaminationV2?.cognition?.concentration || "",
        memory: detailAdmissionForm?.mentalExaminationV2?.cognition?.memory || "",

        grade: detailAdmissionForm?.mentalExaminationV2?.insight?.grade || "",

        judgment: detailAdmissionForm?.mentalExaminationV2?.judgment || "",

        remarks: detailAdmissionForm?.mentalExaminationV2?.remarks || "",

      } : {}),
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
      provisionaldiagnosis: detailAdmissionForm
        ? detailAdmissionForm.doctorSignature?.provisionaldiagnosis
        : "",
      diagnosis: detailAdmissionForm
        ? detailAdmissionForm.doctorSignature?.diagnosis
        : "",
      managmentPlan: detailAdmissionForm
        ? detailAdmissionForm.doctorSignature?.managmentPlan
        : "",
      investigation: detailAdmissionForm
        ? detailAdmissionForm.doctorSignature?.investigation
        : [],
      specialTest: detailAdmissionForm
        ? detailAdmissionForm.doctorSignature?.specialTest
        : "",
      treatment: detailAdmissionForm
        ? detailAdmissionForm.doctorSignature?.treatment
        : "",
      chart: DETAIL_ADMISSION,
      date: chartDate,
      type,
    },
    validationSchema: Yup.object({
      patient: Yup.string().required("Patient is required"),
      center: Yup.string().required("Center is required"),
      chart: Yup.string().required("Chart is required"),
    }),
    onSubmit: (values) => {
      /* appending */
      if (values.delusions === "none") {
        values.delusionNotes = "";
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
      } else {
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        dispatch(addDetailAdmission(formData));
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

  const consentUploadedFiles = useMemo(() => {
    return (
      detailAdmissionForm?.consentFiles?.length > 0 && (
        <UploadedFiles
          id={editChartData._id}
          chartId={detailAdmissionForm._id}
          files={detailAdmissionForm?.consentFiles}
        />
      )
    );
  }, [editChartData, detailAdmissionForm]);

  return (
    <React.Fragment>
      {" "}
      <div>
        <Row className="mt-3">
          <div className="arrow-buttons d-flex gap-4">
            {/* <Button
              className=""
              outline={formStep !== CONSET_FILES}
              onClick={() => setFormStep(CONSET_FILES)}
            >
              Consent Files
            </Button>{" "} */}
            <Button
              outline={formStep !== CHIEF_COMPLAINTS}
              onClick={() => setFormStep(CHIEF_COMPLAINTS)}
            >
              Chief Complaints
            </Button>
            {/* <Button
              outline={formStep !== PROVISIONAL_DIAGNOSIS}
              onClick={() => setFormStep(PROVISIONAL_DIAGNOSIS)}
            >
              Provisional Diagnosis
            </Button> */}
            {/* <Button
              outline={formStep !== DETAIL_ADMISSION}
              onClick={() => setFormStep(DETAIL_ADMISSION)}
            >
              Detail Admission
            </Button> */}
            <Button
              outline={formStep !== DETAIL_HISTORY}
              onClick={() => setFormStep(DETAIL_HISTORY)}
            >
              Detail History
            </Button>
            <Button
              outline={formStep !== MENTAL_EXAMINATION}
              onClick={() => setFormStep(MENTAL_EXAMINATION)}
            >
              Mental Status Examination
            </Button>
            <Button
              outline={formStep !== PHYSICAL_EXAMINATION}
              onClick={() => setFormStep(PHYSICAL_EXAMINATION)}
            >
              Physical Status Examination
            </Button>
            <Button
              outline={formStep !== DOCTOR_SIGNATURE}
              onClick={() => setFormStep(DOCTOR_SIGNATURE)}
            >
              Diagnosis & Plan
            </Button>
          </div>
          <div className="mt-4">
            <Form
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

              {formStep === CHIEF_COMPLAINTS && (
                <ChiefComplaintsForm
                  validation={validation}
                  setFormStep={setFormStep}
                  step={DETAIL_HISTORY}
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

              {formStep === DETAIL_HISTORY && (
                <DetailHistoryForm
                  validation={validation}
                  setFormStep={setFormStep}
                  step={MENTAL_EXAMINATION}
                />
              )}

              {formStep === MENTAL_EXAMINATION && (
                isOldMentalExamination ? (
                  <MentalExamination
                    validation={validation}
                    setFormStep={setFormStep}
                    step={PHYSICAL_EXAMINATION}
                    mode="old"
                  />
                ) : (
                  <MentalExaminationV2
                    validation={validation}
                    setFormStep={setFormStep}
                    step={PHYSICAL_EXAMINATION}
                    mode="new"
                  />
                )
              )}

              {formStep === PHYSICAL_EXAMINATION && (
                <PhysicalExamination
                  validation={validation}
                  setFormStep={setFormStep}
                  step={DOCTOR_SIGNATURE}
                />
              )}

              {formStep === DOCTOR_SIGNATURE && (
                <DoctorSignature
                  validation={validation}
                  setFormStep={setFormStep}
                />
              )}
            </Form>
          </div>
        </Row>
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
});

export default connect(mapStateToProps)(DetailAdmission);
