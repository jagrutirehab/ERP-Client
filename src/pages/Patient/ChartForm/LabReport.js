import React, { useEffect, useState } from "react";
import { Form, Row, Col, Label, Input, Button, FormFeedback, Spinner } from "reactstrap";
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
import { toast } from "react-toastify";
import { generateLabReport } from "../../../helpers/backend_helper";

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

const LabReport = ({ author, patient, chartDate, editChartData, type }) => {
  const dispatch = useDispatch();
  const [reports, setReports] = useState([]);
  const [existingDescriptions, setExistingDescriptions] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const editLabReport = editChartData?.labReport;
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission?._id,
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
          if (editLabReport) return true;
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
        formData.append("description", report.description || "");
        formData.append("aiResponse", JSON.stringify(report.aiResponse || {}));
      });

      if (editLabReport) {
        formData.append("id", editChartData._id);
        formData.append("chartId", editLabReport._id);
        existingDescriptions.forEach((desc, idx) => {
          formData.append("fileId", editLabReport.reports[idx]._id);
          formData.append("description", desc);
        });
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
    setSummaries({});
    setLoadingMap({});
  };


  useEffect(() => {
    if (editLabReport?.reports?.length > 0) {
      setExistingDescriptions(
        editLabReport.reports.map((r) => r.description || "")
      );
    }
  }, [editChartData]);

  console.log("patient", patient);


  const handleGenerateSummary = async (file, idx, name) => {
    try {
      setLoadingMap((prev) => ({
        ...prev,
        [idx]: true,
      }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient", patient?._id || "");
      formData.append("addmission", patient?.addmission?._id || "");

      const response = await generateLabReport(formData);
      const data = response?.data;

      setSummaries((prev) => ({
        ...prev,
        [idx]: data,
      }));

      setReports((prev) => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          aiResponse: data,
        };
        return updated;
      });

    } catch (error) {
      console.log("Summary Error", error);
      toast.error(error?.message || "Error generating summary");

      // if (inputEl) inputEl.value = null;

    } finally {
      setLoadingMap((prev) => ({
        ...prev,
        [idx]: false,
      }));
    }
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
                <>
                  <UploadedFiles
                    id={editChartData._id}
                    chartId={editLabReport._id}
                    files={editLabReport.reports}
                  />
                  {editLabReport.reports.map((report, idx) => (
                    <Col xs={12} key={report._id} className="mt-2">
                      <Label>{report.name} — Description</Label>
                      <Input
                        type="textarea"
                        bsSize="sm"
                        className="form-control presc-border rounded"
                        value={existingDescriptions[idx] || ""}
                        onChange={(e) => {
                          const updated = [...existingDescriptions];
                          updated[idx] = e.target.value;
                          setExistingDescriptions(updated);
                        }}
                      />
                    </Col>
                  ))}
                </>
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
                      const file = e.target.files[0];
                      rps[idx]["file"] = e.target.files[0];
                      setReports(rps);
                      if (file) {
                        handleGenerateSummary(file, idx, report?.name, e.target);
                      }

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
                <Col xs={12}>
                  <Label>Description</Label>
                  <Input
                    type="textarea"
                    bsSize="sm"
                    name="description"
                    onChange={(e) => {
                      const rps = [...reports];
                      rps[idx]["description"] = e.target.value;
                      setReports(rps);
                    }}
                    value={report.description || ""}
                    className="form-control presc-border rounded"
                  />
                </Col>
                <Col xs={12}>
                  <Label>Summary Response</Label>

                  {loadingMap[idx] ? (
                    <div className="d-flex justify-content-center p-3">
                      <Spinner color="primary" />
                    </div>
                  ) : summaries[idx] ? (
                    <div className="p-2 border rounded">
                      <p><strong>Test:</strong> {summaries[idx]?.testName}</p>

                      <p><strong>Flagged:</strong></p>
                      <ul style={{ paddingLeft: "0px" }}>
                        {summaries[idx]?.flaggedItems?.map((item, i) => {

                          const getColor = (severity) => {
                            switch (severity) {
                              case "Very High":
                              case "High":
                                return "#dc3545";
                              case "Medium":
                                return "#ffc107";
                              case "Low":
                              case "Very Low":
                                return "#dc3545";
                              default:
                                return "#28a745";
                            }
                          };

                          return (
                            <li
                              key={i}
                              style={{
                                listStyle: "none",
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              {/* 🔴 circle */}
                              <span
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  backgroundColor: getColor(item.severity),
                                  marginRight: "10px",
                                }}
                              />

                              {/* text */}
                              <span>
                                {item.name}: {item.value}{" "}
                                <strong>({item.severity})</strong>
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      <p><strong>Summary:</strong> {summaries[idx]?.summary}</p>
                    </div>
                  ) : (
                    <p>No summary available</p>
                  )}
                </Col>
                {/* {loadingIndex !== idx && report.file && (
                  <Button
                    size="sm"
                    color="warning"
                    onClick={() =>
                      handleGenerateSummary(report.file, idx, report?.name)
                    }
                  >
                    Retry
                  </Button>
                )} */}
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
