import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  FormFeedback,
  Label,
} from "reactstrap";
import PropTypes from "prop-types";
import _ from "lodash";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//constant
import {
  IPD,
  OPD,
  PRESCRIPTION,
  prescriptionFormFields,
} from "../../../Components/constants/patient";
import MedicineDropdown from "../Dropdowns/Medicine";
import MedicineTable from "../Tables/MedicineForm";
import { connect, useDispatch } from "react-redux";
import {
  addGeneralPrescription,
  addPrescription,
  createEditChart,
  fetchOPDPrescription,
  setPtLatestOPDPrescription,
  updatePrescription,
} from "../../../store/actions";

const Prescription = ({
  drugs,
  author,
  patient,
  doctor,
  center,
  chartDate,
  editChartData,
  type,
  appointment,
  patientLatestOPDPrescription,
  populatePreviousAppointment = false,
  shouldPrintAfterSave = false,
}) => {
  const dispatch = useDispatch();
  const [medicines, setMedicines] = useState([]);

  const editPrescription = editChartData?.prescription;
  const ptLatestOPDPrescription = patientLatestOPDPrescription?.prescription;

  useEffect(() => {
    if (populatePreviousAppointment)
      dispatch(
        fetchOPDPrescription({ id: appointment?.patient?._id || patient?._id })
      );
  }, [dispatch, appointment, populatePreviousAppointment, patient]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author?._id,
      patient: patient?._id,
      center: center ? center : patient?.center?._id,
      addmission: patient?.addmission?._id,
      chart: PRESCRIPTION,
      age: patient ? patient.age : "",
      dateOfBirth: patient ? patient.dateOfBirth : "",
      drNotes: editPrescription
        ? editPrescription.drNotes
        : ptLatestOPDPrescription
        ? patientLatestOPDPrescription?.drNotes
        : "",
      diagnosis: editPrescription
        ? editPrescription.diagnosis
        : ptLatestOPDPrescription
        ? patientLatestOPDPrescription?.diagnosis
        : "",
      notes: editPrescription
        ? editPrescription.notes
        : ptLatestOPDPrescription
        ? patientLatestOPDPrescription?.notes
        : "",
      followUp: editPrescription
        ? editPrescription.followUp
        : ptLatestOPDPrescription
        ? patientLatestOPDPrescription?.followUp
        : "",
      investigationPlan: editPrescription
        ? editPrescription.investigationPlan
        : ptLatestOPDPrescription
        ? patientLatestOPDPrescription?.investigationPlan
        : "",
      complaints: editPrescription
        ? editPrescription.complaints
        : ptLatestOPDPrescription
        ? patientLatestOPDPrescription?.complaints
        : "",
      observation: editPrescription
        ? editPrescription.observation
        : ptLatestOPDPrescription
        ? patientLatestOPDPrescription?.observation
        : "",
      type,
      date: chartDate,
    },
    validationSchema: Yup.object({
      patient: Yup.string().required("Patient is required"),
      center: Yup.string().required("Center is required"),
      chart: Yup.string().required("Chart is required"),
    }),
    onSubmit: (values) => {
      if (editPrescription) {
        dispatch(
          updatePrescription({
            id: editChartData._id,
            chartId: editPrescription._id,
            doctor,
            medicines,
            appointment: appointment?._id,
            ...values,
            shouldPrintAfterSave,
          })
        );
      } else if (type === "GENERAL") {
        dispatch(addGeneralPrescription({...values, medicines}));
      } else {
        dispatch(
          addPrescription({
            ...values,
            appointment: appointment?._id,
            medicines,
            shouldPrintAfterSave,
          })
        );
      }
      // closeForm();
      dispatch(setPtLatestOPDPrescription(null));
    },
  });

  useEffect(() => {
    if (editPrescription) {
      setMedicines(_.cloneDeep(editPrescription.medicines));
    } else if (ptLatestOPDPrescription) {
      setMedicines(_.cloneDeep(ptLatestOPDPrescription.medicines));
      validation.setFieldValue("drNotes", ptLatestOPDPrescription.drNotes);
      validation.setFieldValue("diagnosis", ptLatestOPDPrescription.diagnosis);
      validation.setFieldValue("notes", ptLatestOPDPrescription.notes);
      validation.setFieldValue(
        "investigationPlan",
        ptLatestOPDPrescription.investigationPlan
      );
      validation.setFieldValue(
        "complaints",
        ptLatestOPDPrescription.complaints
      );
      validation.setFieldValue(
        "observation",
        ptLatestOPDPrescription.observation
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPrescription, ptLatestOPDPrescription]);

  useEffect(() => {
    if (!editPrescription) {
      dispatch(setPtLatestOPDPrescription(null));
      setMedicines([]);
      validation.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editPrescription]);

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    dispatch(setPtLatestOPDPrescription(null));
    setMedicines([]);
    validation.resetForm();
  };

  const addMdicine = (med, data) => {
    if (!med) return;

    const checkMedicine = data.find((val) => val.medicine?.name === med?.name);

    if (!checkMedicine) {
      const medicine = {
        medicine: {
          _id: med?._id || "",
          name: med?.name || med,
          isNew: med.name ? false : true,
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
        duration: "30",
        unit: "Day (s)",
      };

      setMedicines((prevMeds) => [medicine, ...prevMeds]);
    }
  };

  const medicineDropdown = useMemo(() => {
    return (
      <Col xl={12} className="mb-4">
        <MedicineDropdown
          dataList={drugs}
          data={medicines}
          setMedicines={setMedicines}
          addItem={addMdicine}
          fieldName={"name"}
        />
      </Col>
    );
  }, [drugs, medicines]);

  const medicineTable = useMemo(() => {
    return (
      medicines?.length > 0 && (
        <Col xs={12}>
          <MedicineTable medicines={medicines} setMedicines={setMedicines} />
        </Col>
      )
    );
  }, [medicines]);

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
            {type === OPD && (
              <>
                <Col xs={12} md={2}>
                  <div className="pb-4">
                    <Label className="">Age</Label>
                    <Input
                      type="text"
                      name={"age"}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.age || ""}
                      className="form-control presc-border rounded"
                      bsSize="sm"
                    />
                  </div>
                </Col>
                {/* <Col xs={12} md={6}>
                  <div className="pb-4">
                    <Label className="">Date of birth</Label>
                    <Flatpicker
                      name="dateOfBirth"
                      value={validation.values.dateOfBirth || ""}
                      onChange={([e]) => {
                        validation.setFieldValue("dateOfBirth", e);
                      }}
                      options={{
                        // enableTime: true,
                        // noCalendar: true,
                        dateFormat: "d M, Y",
                        // time_24hr: false,
                        // defaultDate: moment().format('LT'),
                      }}
                      className="form-control form-control-sm shadow-none bg-light"
                      id="dateOfBirth"
                    />
                  </div>
                </Col> */}
              </>
            )}
            {medicineDropdown}
            {medicineTable}
            {(prescriptionFormFields || []).map((item, idx) => (
              <Col xs={12} md={6}>
                <div className="pb-4">
                  <Label className="">{item.label}</Label>
                  <Input
                    type="textarea"
                    name={item.name}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values[item.name] || ""}
                    className="form-control presc-border rounded"
                    aria-label="With textarea"
                    rows="3"
                  />
                </div>
              </Col>
            ))}

            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label className="">Follow Up</Label>
                <Flatpicker
                  name="dateOfAdmission"
                  value={validation.values.followUp || ""}
                  onChange={([e]) => {
                    validation.setFieldValue("followUp", e);
                  }}
                  options={{
                    dateFormat: "d M, Y",
                    // enable: [
                    //   function (date) {
                    //     return date.getDate() === new Date().getDate();
                    //   },
                    // ],
                  }}
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
              </div>
            </Col>
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

Prescription.propTypes = {
  drugs: PropTypes.array.isRequired,
  author: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  chartDate: PropTypes.any.isRequired,
  editChartData: PropTypes.object,
  dataList: PropTypes.array,
  type: PropTypes.string.isRequired,
  appointment: PropTypes.object,
  patientLatestOPDPrescription: PropTypes.object,
};

const mapStateToProps = (state) => ({
  drugs: state.Medicine.data,
  author: state.User.user,
  patient: state.Chart.chartForm?.patient,
  doctor: state.Chart.chartForm?.doctor,
  center: state.Chart.chartForm?.center,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
  populatePreviousAppointment:
    state.Chart.chartForm.populatePreviousAppointment,
  shouldPrintAfterSave: state.Chart.chartForm.shouldPrintAfterSave,
  appointment: state.Chart.chartForm.appointment,
  patientLatestOPDPrescription: state.Chart.patientLatestOPDPrescription,
});

export default connect(mapStateToProps)(Prescription);
