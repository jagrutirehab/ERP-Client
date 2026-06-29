import React, { useEffect, useState } from "react";
import {
  Form,
  Row,
  Col,
  Label,
  Input,
  Button,
  FormFeedback,
  Spinner,
} from "reactstrap";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik } from "formik";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { connect, useDispatch } from "react-redux";
import {
  addGeneralPsychoDiagnosticForm,
  addPsychoDiagnosticForm,
  createEditChart,
  updatePsychoDiagnosticForm,
} from "../../../store/actions";
import { PSYCHO_DIAGNOSTIC_FORM } from "../../../Components/constants/patient";
import { toast } from "react-toastify";
import { generatePsychoDiagnosticForm } from "../../../helpers/backend_helper";
import PsychoDiagnosisUploadedFiles from "./Components/PsychoDiagnosisUploadedFiles";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
);

const PsychoDiagnosticForm = ({
  author,
  patient,
  chartDate,
  editChartData,
  type,
}) => {
  const dispatch = useDispatch();
  const [reports, setReports] = useState([]);
  const [existingDescriptions, setExistingDescriptions] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const editPsychoForm = editChartData?.psychoDiagnosticForm;

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission?._id,
      reports,
      chart: PSYCHO_DIAGNOSTIC_FORM,
      type,
      date: chartDate,
    },
    validationSchema: Yup.object({
      reports: Yup.array().test(
        "notEmpty",
        "Atleast one report is required",
        (value) => {
          if (editPsychoForm) return true;
          if (!value || value.length === 0) return false;
          return true;
        },
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

      if (editPsychoForm) {
        formData.append("id", editChartData._id);
        formData.append("chartId", editPsychoForm._id);
        existingDescriptions.forEach((desc, idx) => {
          formData.append("fileId", editPsychoForm.reports[idx]._id);
          formData.append("description", desc);
        });
        dispatch(updatePsychoDiagnosticForm(formData));
      } else if (type === "GENERAL") {
        dispatch(addGeneralPsychoDiagnosticForm(formData));
      } else {
        dispatch(addPsychoDiagnosticForm(formData));
      }
    },
  });

  const addReport = () => {
    setReports([...reports, { name: "", file: null }]);
  };

  useEffect(() => {
    if (!editChartData) {
      validation.resetForm();
    }
  }, [dispatch, editChartData]);

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    setReports([]);
    setSummaries({});
    setLoadingMap({});
  };

  useEffect(() => {
    if (editPsychoForm?.reports?.length > 0) {
      setExistingDescriptions(
        editPsychoForm.reports.map((r) => r.description || ""),
      );
    }
  }, [editChartData]);

  const handleGenerateSummary = async (file, idx, name) => {
    try {
      setLoadingMap((prev) => ({ ...prev, [idx]: true }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient", patient?._id || "");
      formData.append("addmission", patient?.addmission?._id || "");

      const response = await generatePsychoDiagnosticForm(formData);
      const data = response?.data;

      setSummaries((prev) => ({ ...prev, [idx]: data }));
      setReports((prev) => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], aiResponse: data };
        return updated;
      });
    } catch (error) {
      console.log("Summary Error", error);
      toast.error(error?.message || "Error generating summary");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [idx]: false }));
    }
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
          {validation.touched.reports && validation.errors.reports ? (
            <FormFeedback type="invalid" className="d-block">
              {validation.errors.reports}
            </FormFeedback>
          ) : null}
          <Row className="align-items-end row-gap-3">
            <Col xs={12} className="mt-3 mb-4">
              {editPsychoForm?.reports?.length > 0 && (
                <>
                  <PsychoDiagnosisUploadedFiles
                    id={editChartData._id}
                    chartId={editPsychoForm._id}
                    files={editPsychoForm.reports}
                  />
                  {editPsychoForm.reports.map((report, idx) => (
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
                      rps[idx]["file"] = file;
                      setReports(rps);
                      if (file) {
                        handleGenerateSummary(file, idx, report?.name);
                      }
                    }}
                    className="form-control presc-border pt-5 rounded"
                  />
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
                  <Label>AI Analysis</Label>
                  {loadingMap[idx] ? (
                    <div className="d-flex justify-content-center p-3">
                      <Spinner color="primary" />
                    </div>
                  ) : summaries[idx] ? (
                    <div className="p-2 border rounded">
                      <p>
                        <strong>Test:</strong> {summaries[idx]?.testName}
                      </p>
                      <p>
                        <strong>Flagged:</strong>
                      </p>
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
                                return "#17a2b8";
                              default:
                                return "#28a745";
                            }
                          };
                          const isMissing = item.value === "Nill";
                          const dotColor = isMissing
                            ? "#dc3545"
                            : getColor(item.severity);
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
                              <span
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  backgroundColor: dotColor,
                                  marginRight: "10px",
                                }}
                              />
                              <span>
                                {item.name}: {item.value}{" "}
                                <strong>
                                  ({isMissing ? "Not available" : item.severity}
                                  )
                                </strong>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <p>
                        <strong>Summary:</strong> {summaries[idx]?.summary}
                      </p>
                    </div>
                  ) : (
                    <p>No analysis available</p>
                  )}
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
                </Button>
              </div>
            </div>
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

PsychoDiagnosticForm.propTypes = {
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

export default connect(mapStateToProps)(PsychoDiagnosticForm);
