import React, { useEffect, useState } from "react";
import { Form, Row, Col, Label, Input, Button, FormFeedback } from "reactstrap";
import PropTypes from "prop-types";
// import { Button } from "@mui/material";/

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";
// Import FilePond styles
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { connect, useDispatch } from "react-redux";
import {
  addGeneralLabReport,
  addLabReport,
  createEditChart,
  updateLabReport,
} from "../../../store/actions";
import { IPD, LAB_REPORT } from "../../../Components/constants/patient";
import UploadedFiles from "./Components/UploadedFiles";

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

const LabReport = ({ author, patient, chartDate, editChartData, type }) => {
  const dispatch = useDispatch();
  const [reports, setReports] = useState([]);

  const editLabReport = editChartData?.labReport;
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission._id,
      reports,
      chart: LAB_REPORT,
      type,
      date: chartDate,
    },
    validationSchema: Yup.object({
      reports: Yup.array().test(
        "notEmpty",
        "Atleast one report is required",
        (value) => {
          if (!value || value.length === 0) {
            return false;
          }
          return true;
        }
      ),
    }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("author", values.author);
      formData.append("patient", values.patient);
      formData.append("center", values.center);
      formData.append("addmission", values.addmission);
      formData.append("chart", values.chart);
      formData.append("type", values.type);
      formData.append("date", values.date);
      (reports || []).forEach((report) => {
        formData.append("file", report.file);
        formData.append("name", report.name);
      });

      if (editLabReport) {
        formData.append("id", editChartData._id);
        formData.append("chartId", editLabReport._id);
        dispatch(updateLabReport(formData));
      } else if (type === "GENERAL") {
        dispatch(addGeneralLabReport(formData));
      } else {
        dispatch(addLabReport(formData));
      }
      // closeForm();
    },
  });

  const addReport = () => {
    const newReport = { name: "", file: null };
    setReports([...reports, newReport]);
  };

  useEffect(() => {
    if (!editChartData) {
      validation.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editChartData]);

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    setReports([]);
  };

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
          {validation.touched.reports && validation.errors.reports ? (
            <FormFeedback type="invalid" className="d-block">
              {validation.errors.reports}
            </FormFeedback>
          ) : null}
          <Row className="align-items-end row-gap-3">
            <Col xs={12} className="mt-3 mb-4">
              {editLabReport?.reports?.length > 0 && (
                <UploadedFiles
                  id={editChartData._id}
                  chartId={editLabReport._id}
                  files={editLabReport.reports}
                />
              )}
            </Col>
            {(reports || []).map((report, idx) => (
              <React.Fragment key={idx}>
                <Col xs={12} md={6}>
                  <Label>Name*</Label>
                  <Input
                    type="text"
                    bsSize="sm"
                    name="name"
                    required
                    onChange={(e) => {
                      const rps = [...reports];
                      rps[idx]["name"] = e.target.value;
                      setReports(rps);
                    }}
                    value={report.name || ""}
                    className="form-control presc-border pt-5 rounded"
                    aria-label="With textarea"
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Input
                    type="file"
                    bsSize="sm"
                    name="file"
                    accept="image/*, application/pdf"
                    required
                    onChange={(e) => {
                      const rps = [...reports];
                      rps[idx]["file"] = e.target.files[0];
                      setReports(rps);
                    }}
                    // value={""}
                    className="form-control presc-border pt-5 rounded"
                    aria-label="With textarea"
                  />
                  {/* <FilePond
                    files={report.file ? [report.file] : []}
                    onremovefile={() => {
                      const rps = [...reports];
                      rps[idx]["file"] = null;
                      setReports(rps);
                    }}
                    onupdatefiles={(e) => {
                      const rps = [...reports];
                      rps[idx]["file"] = e[0].file;
                      setReports(rps);
                    }}
                    allowMultiple={false}
                    required
                    maxFiles={1}
                    name="files"
                    acceptedFileTypes={["image/*", "application/json"]}
                    className="filepond filepond-input-multiple"
                  /> */}
                </Col>
              </React.Fragment>
            ))}
            <Col xs={12}>
              <Button onClick={addReport} type="button" color="secondary">
                Add
              </Button>
            </Col>
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
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

LabReport.propTypes = {
  author: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  chartDate: PropTypes.any.isRequired,
  editChartData: PropTypes.object,
  type: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  author: state.User.user,
  patient: state.Patient.patient,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
});

export default connect(mapStateToProps)(LabReport);
