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
  CardHeader,
} from "reactstrap";
import PropTypes from "prop-types";
import _ from "lodash";
import Select from "react-select";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//constant
import {
  CLINICAL_NOTE,
  COUNSELLING_NOTE,
  DETAIL_ADMISSION,
  DISCHARGE_SUMMARY,
  IPD,
  LAB_REPORT,
  OPD,
  PRESCRIPTION,
  prescriptionFormFields,
  RELATIVE_VISIT,
  VITAL_SIGN,
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
  toggleAppointmentForm,
  updatePrescription,
} from "../../../store/actions";
import { fetchLatestCharts } from "../../../store/features/chart/chartSlice";
import Wrapper from "../Components/Wrapper";
import RelativeVisit from "../Charts/RelativeVisit";
import DischargeSummary from "../Charts/DischargeSummary";
import VitalSign from "../Charts/VitalSign";
import ClinicalNote from "../Charts/ClinicalNote";
import CounsellingNote from "../Charts/CounsellingNote";
import LabReport from "../Charts/LabReport";
import DetailAdmission from "../Charts/DetailAdmission";
import PrescriptionChart from "../Charts/Prescription";
import { Link } from "react-router-dom";
import axios from "axios";
import { getICDCodes } from "../../../helpers/backend_helper.js";

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
  charts,
  patientLatestOPDPrescription,
  populatePreviousAppointment = false,
  shouldPrintAfterSave = false,
}) => {
  const dispatch = useDispatch();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allICDCodes, setAllICDCodes] = useState([]);
  const [icdOptions, setIcdOptions] = useState([]);

  const editPrescription = editChartData?.prescription;
  const ptLatestOPDPrescription = patientLatestOPDPrescription?.prescription;

  // console.log(patient.referredBy, "this is patient")

  console.log("------------------");
  console.log({ patient, type });
  console.log("------------------");

  // console.log("type", type)
  useEffect(() => {
    if (populatePreviousAppointment)
      dispatch(
        fetchOPDPrescription({ id: appointment?.patient?._id || patient?._id }),
      );
  }, [dispatch, appointment, populatePreviousAppointment, patient]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author?._id,
      patient: patient?._id,
      center: center ? center : patient?.center?._id,
      addmission: patient?.addmission?._id || patient?.addmission || "",
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
      referredby: patient.referredBy?.doctorName || patient.referredBy || "",
      // editPrescription
      //   ? editPrescription.referredby
      //   : ptLatestOPDPrescription
      //   ? patientLatestOPDPrescription?.referredby
      //   :
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
      icdCode: null,
    },
    validationSchema: Yup.object({
      patient: Yup.string().required("Patient is required"),
      center: Yup.string().required("Center is required"),
      chart: Yup.string().required("Chart is required"),
    }),
    onSubmit: (values) => {
      console.log("values", values);
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
            icdCode: values.icdCode?.value || null,
          }),
        );
      } else if (type === "GENERAL") {
        dispatch(
          addGeneralPrescription({
            ...values,
            medicines,
            icdCode: values.icdCode?.value || null,
          }),
        );
      } else {
        console.log({ values });

        dispatch(
          addPrescription({
            ...values,
            appointment: appointment?._id,
            medicines,
            shouldPrintAfterSave,
            icdCode: values.icdCode?.value || null,
          }),
        );
      }
      // closeForm();
      dispatch(setPtLatestOPDPrescription(null));
    },
  });

  console.log({ editPrescription, patientLatestOPDPrescription, patient });

  useEffect(() => {
    if (type !== "OPD" && !appointment) return;
    dispatch(fetchLatestCharts({ patient: patient?._id }));
  }, [patient, dispatch]);

  // useEffect(() => {
  //   if (editPrescription) {
  //     setMedicines(_.cloneDeep(editPrescription.medicines));
  //   } else if (ptLatestOPDPrescription) {
  //     setMedicines(_.cloneDeep(ptLatestOPDPrescription.medicines));
  //     validation.setFieldValue("drNotes", ptLatestOPDPrescription.drNotes);
  //     validation.setFieldValue("diagnosis", ptLatestOPDPrescription.diagnosis);
  //     validation.setFieldValue("notes", ptLatestOPDPrescription.notes);
  //     validation.setFieldValue(
  //       "investigationPlan",
  //       ptLatestOPDPrescription.investigationPlan
  //     );
  //     validation.setFieldValue(
  //       "complaints",
  //       ptLatestOPDPrescription.complaints
  //     );
  //     validation.setFieldValue(
  //       "observation",
  //       ptLatestOPDPrescription.observation
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [editPrescription, ptLatestOPDPrescription]);

  useEffect(() => {
    const source =
      editPrescription?.medicines || ptLatestOPDPrescription?.medicines;

    if (!source) return;

    const meds = _.cloneDeep(source);

    const fixed = meds.map((med) => {
      const m = med.medicine;

      // if  _id ,then skip
      if (m?._id) return med;

      // try to get _id using name + strength + unit
      const match = drugs.find(
        (d) =>
          d.name?.toLowerCase().trim() === m.name?.toLowerCase().trim() &&
          String(d.strength).trim() === String(m.strength).trim() &&
          String(d.unit).trim().toLowerCase() ===
            String(m.unit).trim().toLowerCase(),
      );

      if (match) {
        return {
          ...med,
          medicine: {
            ...m,
            _id: match._id,
            name: match.name,
            strength: match.strength,
            unit: match.unit,
            isNew: false,
          },
        };
      }

      return med;
    });

    setMedicines(fixed);

    if (ptLatestOPDPrescription && !editPrescription) {
      validation.setFieldValue("drNotes", ptLatestOPDPrescription.drNotes);
      validation.setFieldValue("diagnosis", ptLatestOPDPrescription.diagnosis);
      validation.setFieldValue("notes", ptLatestOPDPrescription.notes);
      validation.setFieldValue(
        "investigationPlan",
        ptLatestOPDPrescription.investigationPlan,
      );
      validation.setFieldValue(
        "complaints",
        ptLatestOPDPrescription.complaints,
      );
      validation.setFieldValue(
        "observation",
        ptLatestOPDPrescription.observation,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPrescription, ptLatestOPDPrescription, drugs]);

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

    const checkMedicine = data.find(
      (val) => val.medicine?.name === med?.name || val.medicine?.name === med,
    );

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
      console.log(medicine);

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

  useEffect(() => {
    const fetchICD = async () => {
      const res = await getICDCodes();

      console.log("res", res);

      const options = res?.map((item) => ({
        label: `${item?.code} - ${item.text}`,
        value: item?._id,
        text: item?.text,
      }));

      // options.push({
      //   label: "OTHERS",
      //   value: "OTHERS",
      //   text: "Others",
      // });

      setAllICDCodes(options);
      setIcdOptions(options);
    };

    fetchICD();
  }, []);

  const handleICDSearch = (input) => {
    if (!input) {
      setIcdOptions(allICDCodes);
      return;
    }

    const filtered = allICDCodes.filter((item) =>
      item.label.toLowerCase().includes(input.toLowerCase()),
    );

    setIcdOptions(filtered);
  };

  useEffect(() => {
    if (
      editPrescription?.icdCode &&
      allICDCodes.length > 0
    ) {
      const selectedICD = allICDCodes.find(
        (item) => item.value === editPrescription.icdCode,
      );

      if (selectedICD) {
        validation.setFieldValue("icdCode", selectedICD);
      }
    }
  }, [editPrescription, allICDCodes]);

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
            {/* {(prescriptionFormFields || []).map((item, idx) => (
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
            ))} */}

            {(prescriptionFormFields || []).map((item, idx) => (
              <Col xs={12} md={6} key={idx}>
                <div className="pb-4">
                  <Label>{item.label}</Label>

                  {item.type === "async-select" ? (
                    <Select
                      placeholder="Search ICD Code..."
                      options={icdOptions}
                      value={validation.values.icdCode || null}
                      onInputChange={(value, actionMeta) => {
                        if (actionMeta.action === "input-change") {
                          handleICDSearch(value);
                        }
                      }}
                      onChange={(selected) =>
                        validation.setFieldValue("icdCode", selected)
                      }
                      filterOption={() => true}
                    />
                  ) : (
                    <Input
                      type="textarea"
                      name={item.name}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values[item.name] || ""}
                      className="form-control presc-border rounded"
                      rows="3"
                    />
                  )}
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
            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label className="">Referred by</Label>
                <Input
                  type="text"
                  name="referredby"
                  disabled
                  onChange={validation.handleChange}
                  value={validation.values.referredby || ""}
                  className="form-control presc-border rounded"
                  aria-label="With textarea"
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
        {(type === OPD || type === IPD) && appointment && (
          <Card className="mt-3">
            <CardHeader
              tag="h5"
              className="mb-0 d-flex justify-content-between align-items-center"
            >
              <span className="fs-6 fs-md-5">Latest Charts</span>
              <Button color="primary" size="sm" className="btn-sm">
                <Link
                  to={`/patient/${patient?._id}`}
                  onClick={() =>
                    dispatch(createEditChart({ chart: null, isOpen: false }))
                  }
                  className="text-white text-decoration-none"
                >
                  <span className="">Go to Patient</span>
                </Link>
              </Button>
            </CardHeader>
            <CardBody>
              {(charts || []).slice(0, 5).map((chart, idx) => (
                <div className="mb-4" key={chart._id}>
                  <Wrapper
                    hideDropDown
                    item={chart}
                    itemId={`${chart?.id?.prefix}${chart?.id?.patientId}-${chart?.id?.value}`}
                  >
                    {chart.chart === PRESCRIPTION && (
                      <PrescriptionChart data={chart?.prescription} />
                    )}
                    {chart.chart === RELATIVE_VISIT && (
                      <div className="mt-4">
                        <RelativeVisit data={chart?.relativeVisit} />
                      </div>
                    )}
                    {chart.chart === DISCHARGE_SUMMARY && (
                      <div className="mt-4">
                        <DischargeSummary data={chart?.dischargeSummary} />
                      </div>
                    )}
                    {chart.chart === VITAL_SIGN && (
                      <div className="mt-4 mx-3">
                        <VitalSign data={chart.vitalSign} />
                      </div>
                    )}
                    {chart.chart === CLINICAL_NOTE && (
                      <div className="mt-4">
                        <ClinicalNote data={chart.clinicalNote} />
                      </div>
                    )}
                    {chart.chart === COUNSELLING_NOTE && (
                      <diV className="mt-4">
                        <CounsellingNote data={chart.counsellingNote} />
                      </diV>
                    )}
                    {chart.chart === LAB_REPORT && (
                      <LabReport
                        data={chart.labReport?.reports}
                        date={chart.labReport?.updatedAt}
                      />
                    )}
                    {chart.chart === DETAIL_ADMISSION && (
                      <div className="mt-4">
                        <DetailAdmission data={chart.detailAdmission} />
                      </div>
                    )}
                  </Wrapper>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
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
  charts: PropTypes.array,
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
  type: state.Chart.chartForm.type,
  charts: state.Chart.charts,
  patientLatestOPDPrescription: state.Chart.patientLatestOPDPrescription,
});

export default connect(mapStateToProps)(Prescription);
