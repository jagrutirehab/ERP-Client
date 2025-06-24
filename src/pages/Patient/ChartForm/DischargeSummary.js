import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Row, Col, Label } from "reactstrap";
import PropTypes from "prop-types";
import _ from "lodash";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import {
  DISCHARGE_SUMMARY,
  dischargeSummaryFields,
} from "../../../Components/constants/patient";
import SummaryFields from "./Components/SummaryFields";
import Medicine from "../Dropdowns/Medicine";
import MedicineForm from "../Tables/MedicineForm";
import { format } from "date-fns";

//redux
import { connect, useDispatch } from "react-redux";
import {
  addDischargeSummary,
  createEditChart,
  updateDischargeSummary,
} from "../../../store/actions";

const DischargeSummary = ({
  author,
  patient,
  chartDate,
  editChartData,
  drugs,
  type,
}) => {
  const dispatch = useDispatch();

  // const [treatment, setTreatment] = useState([]);
  const [dischargeAdvise, setDischargeAdvise] = useState([]);

  const editSummary = editChartData?.dischargeSummary;

  useEffect(() => {
    if (editSummary) {
      setDischargeAdvise(_.cloneDeep(editSummary.medicine));
      // setTreatment(_.cloneDeep(editSummary.treatment));
    }
  }, [editSummary]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      centerAddress: patient.center.title,
      addmission: patient.addmission._id,
      chart: DISCHARGE_SUMMARY,
      diagnosis: editSummary ? editSummary.diagnosis : "",
      presentingSymptoms: editSummary ? editSummary.presentingSymptoms : "",
      /* START MSE AT ADDMISSION */
      mseAddmission: {
        appearance: editSummary ? editSummary.mseAddmission?.appearance : "",
        ecc: editSummary ? editSummary.mseAddmission?.ecc : "",
        speech: editSummary ? editSummary.mseAddmission?.speech : "",
        mood: editSummary ? editSummary.mseAddmission?.mood : "",
        affect: editSummary ? editSummary.mseAddmission?.affect : "",
        thoughts: editSummary ? editSummary.mseAddmission?.thoughts : "",
        perception: editSummary ? editSummary.mseAddmission?.perception : "",
        memory: editSummary ? editSummary.mseAddmission?.memory : "",
        abstractThinking: editSummary
          ? editSummary.mseAddmission?.abstractThinking
          : "",
        socialJudgment: editSummary
          ? editSummary.mseAddmission?.socialJudgment
          : "",
        insight: editSummary ? editSummary.mseAddmission?.insight : "",
      },
      /* END MSE AT ADDMISSION */
      pastHistory: editSummary ? editSummary.pastHistory : "",
      medicalHistory: editSummary ? editSummary.medicalHistory : "",
      familyHistory: editSummary ? editSummary.familyHistory : "",
      personalHistory: {
        smoking: editSummary ? editSummary.personalHistory.smoking : "",
        chewingTobacco: editSummary
          ? editSummary.personalHistory.chewingTobacco
          : "",
        alcohol: editSummary ? editSummary.personalHistory.alcohol : "",
      },
      physicalExamination: {
        temprature: editSummary
          ? editSummary.physicalExamination.temprature
          : "",
        pulse: editSummary ? editSummary.physicalExamination.pulse : "",
        bp: editSummary ? editSummary.physicalExamination.bp : "",
        cvs: editSummary ? editSummary.physicalExamination.cvs : "",
        rs: editSummary ? editSummary.physicalExamination.rs : "",
        abdomen: editSummary ? editSummary.physicalExamination.abdomen : "",
        cns: editSummary ? editSummary.physicalExamination.cns : "",
        others: editSummary ? editSummary.physicalExamination.others : "",
      },
      investigation: editSummary ? editSummary.investigation : "",
      discussion: editSummary ? editSummary.discussion : "",
      refernces: editSummary ? editSummary.refernces : "",
      modifiedTreatment: editSummary ? editSummary.modifiedTreatment : "",
      deportAdministered: editSummary ? editSummary.deportAdministered : "",
      patientStatus: editSummary ? editSummary.patientStatus : "",
      treatment: editSummary ? editSummary.treatment : "",
      /* START MSE AT DISCHARGE */
      mseDischarge: {
        appearance: editSummary ? editSummary.mseDischarge?.appearance : "",
        ecc: editSummary ? editSummary.mseDischarge?.ecc : "",
        speech: editSummary ? editSummary.mseDischarge?.speech : "",
        mood: editSummary ? editSummary.mseDischarge?.mood : "",
        affect: editSummary ? editSummary.mseDischarge?.affect : "",
        thoughts: editSummary ? editSummary.mseDischarge?.thoughts : "",
        perception: editSummary ? editSummary.mseDischarge?.perception : "",
        memory: editSummary ? editSummary.mseDischarge?.memory : "",
        abstractThinking: editSummary
          ? editSummary.mseDischarge?.abstractThinking
          : "",
        socialJudgment: editSummary
          ? editSummary.mseDischarge?.socialJudgment
          : "",
        insight: editSummary ? editSummary.mseDischarge?.insight : "",
      },
      /* END MSE AT DISCHARGE */
      followUp: editSummary ? editSummary.followUp : "",
      note: editSummary ? editSummary.note : "",
      consultantName: editSummary ? editSummary.consultantName : "",
      consultantSignature: editSummary ? editSummary.consultantSignature : "",
      consultantPsychologist: editSummary
        ? editSummary.consultantPsychologist
        : "",
      summaryPreparedBy: editSummary ? editSummary.summaryPreparedBy : "",
      dischargeType: editSummary ? editSummary.dischargeType : "",
      dischargeRoutine: editSummary ? editSummary.dischargeRoutine : "",
      dischargeDate:
        editSummary?.dischargeDate && new Date(editSummary.dischargeDate)
          ? format(new Date(editSummary.dischargeDate), "yyyy-MM-dd")
          : "",
      type,
      date: chartDate,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      if (editSummary) {
        dispatch(
          updateDischargeSummary({
            id: editChartData._id,
            chartId: editSummary._id,
            // treatment,
            medicine: dischargeAdvise,
            ...values,
          })
        );
      } else {
        dispatch(
          addDischargeSummary({
            ...values,
            // treatment,
            medicine: dischargeAdvise,
          })
        );
      }
      // closeForm();
    },
  });

  useEffect(() => {
    if (!editSummary) {
      validation.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editSummary]);

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    validation.resetForm();
  };

  // const addTreatment = (med, data) => {
  //   if (!med) return;

  //   const checkMedicine = data.find(
  //     (medicine) => medicine.medicine?._id === med._id
  //   );

  //   if (!checkMedicine) {
  //     const medicine = {
  //       medicine: {
  //         _id: med?._id || "",
  //         name: med?.name || med,
  //       },
  //       dosageAndFrequency: {
  //         morning: "1",
  //         evening: "0",
  //         night: "1",
  //       },
  //       instruction: "",
  //       intake: "After food",
  //       duration: "30",
  //       unit: "Day (s)",
  //     };

  //     setTreatment((prevMeds) => [medicine, ...prevMeds]);
  //   }
  // };

  const addDischargeAdvise = (med, data) => {
    if (!med) return;

    const checkMedicine = data.find(
      (medicine) => medicine.medicine?.name === med.name
    );

    if (!checkMedicine) {
      const medicine = {
        medicine: {
          _id: med?._id || "",
          name: med?.name || med,
          type: med?.type || "TAB",
          strength: med?.strength || "",
          unit: med?.unit || "MG",
        },
        dosageAndFrequency: {
          morning: "1",
          evening: "0",
          night: "1",
        },
        instructions: "",
        intake: "After food",
        duration: "10",
        unit: "Day (s)",
      };

      setDischargeAdvise((prevMeds) => [medicine, ...prevMeds]);
    }
  };

  // const renderTreatment = useMemo(() => {
  //   return (
  //     <Medicine
  //       dataList={drugs}
  //       data={treatment}
  //       setMedicines={setTreatment}
  //       addItem={addTreatment}
  //       fieldName={"name"}
  //       medicines={treatment}
  //     />
  //   );
  // }, [drugs, treatment]);

  // const treatmentForm = useMemo(() => {
  //   return (
  //     treatment?.length > 0 && (
  //       <MedicineForm medicines={treatment} setMedicines={setTreatment} />
  //     )
  //   );
  // }, [treatment]);

  const adviseOnDischarge = useMemo(() => {
    return (
      <Medicine
        dataList={drugs}
        data={dischargeAdvise}
        setMedicines={setDischargeAdvise}
        addItem={addDischargeAdvise}
        fieldName={"name"}
        medicines={dischargeAdvise}
      />
    );
  }, [drugs, dischargeAdvise]);

  const adviseForm = useMemo(() => {
    return (
      dischargeAdvise?.length > 0 && (
        <MedicineForm
          medicines={dischargeAdvise}
          setMedicines={setDischargeAdvise}
        />
      )
    );
  }, [dischargeAdvise]);

  return (
    <React.Fragment>
      <div>
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
          <Row className="mt-3">
            {(dischargeSummaryFields.slice(0, 10) || []).map((item, idx) => {
              return (
                <SummaryFields
                  validation={validation}
                  item={item}
                  key={item.name + idx}
                />
              );
            })}
            <Col xs={12} className="my-3">
              <div className="mb-3">
                <Label>Treatment Given</Label>
                <textarea
                  rows="4"
                  bsSize="sm"
                  name={"treatment"}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.treatment || ""}
                  className="form-control"
                />
              </div>
            </Col>
            {/* <Col xs={12} className="my-3">
              <Label>Treatment given</Label>
              {renderTreatment}
            </Col>
            <Col xs={12}>{treatmentForm}</Col> */}
            {(dischargeSummaryFields.slice(10, 15) || []).map((item, idx) => {
              return (
                <SummaryFields
                  validation={validation}
                  item={item}
                  key={item.name + idx}
                />
              );
            })}
            <Col xs={12} className="my-3">
              <Label>Advise on discharge</Label>
              {adviseOnDischarge}
            </Col>
            <Col xs={12}>{adviseForm}</Col>
            {(dischargeSummaryFields.slice(15, 24) || []).map((item, idx) => {
              return (
                <SummaryFields
                  validation={validation}
                  item={item}
                  key={item.name + idx}
                />
              );
            })}
          </Row>
          <div className="mt-3">
            <div className="d-flex gap-3 justify-content-end">
              <Button
                onClick={closeForm}
                size="sm"
                color="danger"
                type="button"
              >
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save
                {/* {chart ? "Update" : "Save"} */}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </React.Fragment>
  );
};

DischargeSummary.propTypes = {
  drugs: PropTypes.array.isRequired,
  patient: PropTypes.object,
  author: PropTypes.object,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  drugs: state.Medicine.data,
  patient: state.Patient.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
});

export default connect(mapStateToProps)(DischargeSummary);
