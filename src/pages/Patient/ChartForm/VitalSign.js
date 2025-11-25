import React, { useEffect } from "react";
import { Form, Row, Col, Label, Input, Button } from "reactstrap";
import PropTypes from "prop-types";

//constant
import {
  IPD,
  VITAL_SIGN,
  vitalSignFields,
} from "../../../Components/constants/patient";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { connect, useDispatch } from "react-redux";
import {
  addGeneralVitalSign,
  addVitalSign,
  createEditChart,
  updateVitalSign,
} from "../../../store/actions";

const VitalSign = ({ author, patient, chartDate, editChartData, type }) => {
  const dispatch = useDispatch();

  const editVitalSign = editChartData?.vitalSign;

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission?._id,
      weight: editVitalSign ? editVitalSign.weight : "",
      pulse: editVitalSign ? editVitalSign.pulse : "",
      bloodPressure: editVitalSign
        ? editVitalSign.bloodPressure
        : {
            systolic: "",
            diastolic: "",
          },
      temprature: editVitalSign ? editVitalSign.temprature : "",
      respirationRate: editVitalSign ? editVitalSign.respirationRate : "",
      cns: editVitalSign ? editVitalSign.cns : "",
      cvs: editVitalSign ? editVitalSign.cvs : "",
      rs: editVitalSign ? editVitalSign.rs : "",
      pa: editVitalSign ? editVitalSign.pa : "",
      chart: VITAL_SIGN,
      type,
      date: chartDate,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      const {
        weight,
        pulse,
        bloodPressure: { systolic, diastolic },
        temprature,
        respirationRate,
        cns,
        cvs,
        rs,
        pa,
      } = values;

      if (
        weight ||
        pulse ||
        temprature ||
        respirationRate ||
        cns ||
        cvs ||
        rs ||
        pa
      ) {
        if (editVitalSign) {
          dispatch(
            updateVitalSign({
              id: editChartData._id,
              chartId: editVitalSign._id,
              ...values,
            })
          );
        } else if (type === "GENERAL") {
          dispatch(addGeneralVitalSign(values));
        } else {
          dispatch(addVitalSign(values));
        }
        // closeForm();
      }
    },
  });

  useEffect(() => {
    if (!editChartData) {
      validation.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editChartData]);

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    validation.resetForm();
  };

  return (
    <React.Fragment>
      <div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          <Row>
            {(vitalSignFields || []).map((field, idx) => (
              <Col key={field.name + idx} xs={12} md={6}>
                <div className="mb-3">
                  <Label for="exampleText">{field.label}</Label>
                  {field.fields?.length ? (
                    <div className="mb-3 d-flex flex-nowrap align-items-center">
                      {(field.fields || []).map((fl, id) => (
                        <React.Fragment key={fl.name + id}>
                          <div>
                            <Input
                              type="text"
                              name={fl.name}
                              onChange={(e) => {
                                const value = e.target.value;
                                const name = e.target.name;
                                const event = {
                                  target: {
                                    name: "bloodPressure",
                                    value: {
                                      ...validation.values.bloodPressure,
                                      [name]: value,
                                    },
                                  },
                                };
                                validation.handleChange(event);
                              }}
                              onBlur={validation.handleBlur}
                              value={
                                validation.values.bloodPressure[fl.name] || ""
                              }
                              className="form-control"
                              placeholder={fl.label}
                            />
                          </div>
                          {id === 0 && <span className="ms-3 me-3">/</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <Input
                      type="text"
                      name={field.name}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values[field.name] || ""}
                      className="form-control"
                      placeholder="Enter Reading"
                    />
                  )}
                </div>
              </Col>
            ))}
            <div className="mt-3">
              <div className="d-flex gap-3 justify-content-end">
                <Button
                  onClick={closeForm}
                  size="sm"
                  color="danger"
                  type="button"
                  className="text-white"
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit">
                  Save
                  {/* {chart ? "Update" : "Save"} */}
                </Button>
              </div>
            </div>
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

VitalSign.propTypes = {
  patient: PropTypes.object,
  author: PropTypes.object,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
});

export default connect(mapStateToProps)(VitalSign);
