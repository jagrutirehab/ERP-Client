import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Badge,
  Alert,
} from "reactstrap";
import classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import {
  createIncident,
  updateIncidentAction,
  investigateIncidentAction,
  approveIncidentAction,
  closeIncidentAction,
  updateIncidentStatusAction,
} from "../../../store/features/incident/incidentSlice";
import SearchPatient from "../../Booking/Components/SearchPatient";
// Flatpickr removed as date input is currently commented out
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import RenderWhen from "../../../Components/Common/RenderWhen";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

const IncidentForm = ({ incident, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User?.user);
  const centers = useSelector((state) => state.Center?.data || []);
  const [currentIncident, setCurrentIncident] = useState(
    incident || { status: "Raised" }
  );
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission } = usePermissions(token);
  const hasIncidentInvestigatePermission = hasPermission(
    "INCIDENT_REPORTING",
    "INVESTIGATE_INCIDENT",
    "WRITE"
  );
  // const hasIncidentApprovePermission = hasPermission(
  //   "INCIDENT_REPORTING",
  //   "APPROVE_INCIDENT",
  //   "READ"
  // );
  // const hasIncidentClosePermission = hasPermission(
  //   "INCIDENT_REPORTING",
  //   "CLOSE_INCIDENT",
  //   "READ"
  // );

  console.log({ currentIncident });

  useEffect(() => {
    setCurrentIncident(incident || { status: "Raised" });
  }, [incident]);

  const [activeStage, setActiveStage] = useState("raise");
  const [files, setFiles] = useState([]);
  const [investigationFiles, setInvestigationFiles] = useState([]);
  const [closureFiles, setClosureFiles] = useState([]);

  console.log({ incident, currentIncident, activeStage });

  useEffect(() => {
    if (currentIncident) {
      // Set active stage based on incident status
      const statusMap = {
        Raised: "raise",
        "Under Investigation": "investigation",
        "Pending Approval": "approval",
        Approved: "closure",
        Rejected: "approval",
        Closed: "closure",
      };
      setActiveStage(statusMap[currentIncident.status] || "raise");

      // Load existing files
      // if (currentIncident.attachments) {
      //   setFiles(
      //     currentIncident.attachments.map((att) => ({
      //       source: att.url,
      //       options: { type: "local" },
      //     }))
      //   );
      // }
      // if (currentIncident.investigation?.attachments) {
      //   setInvestigationFiles(
      //     currentIncident.investigation.attachments.map((att) => ({
      //       source: att.url,
      //       options: { type: "local" },
      //     }))
      //   );
      // }
      // if (currentIncident.closure?.attachments) {
      //   setClosureFiles(
      //     currentIncident.closure.attachments.map((att) => ({
      //       source: att.url,
      //       options: { type: "local" },
      //     }))
      //   );
      // }
    }
  }, [currentIncident]);

  // Raise Stage Form
  const buildRaiseInitialValues = () => ({
    incidentType: currentIncident?.incidentType || "",
    patientIncidentType: currentIncident?.patientIncidentType || "",
    patientIncidentOther: currentIncident?.patientIncidentOther || "",
    patient:
      (typeof currentIncident?.patient === "object"
        ? currentIncident?.patient?._id
        : currentIncident?.patient) || "",
    patientName:
      (typeof currentIncident?.patient === "object"
        ? currentIncident?.patient?.name || ""
        : "") || "",
    uid:
      (typeof currentIncident?.patient === "object"
        ? currentIncident?.patient?.uid || ""
        : "") || "",
    title: currentIncident?.title || "",
    description: currentIncident?.description || "",
    occurrenceDate: currentIncident?.occurrenceDate
      ? new Date(currentIncident.occurrenceDate)
      : new Date(),
    location: currentIncident?.location || "",
    immediateAction: currentIncident?.immediateAction || "",
    center: currentIncident?.center?._id || currentIncident?.center || "",
  });

  const raiseForm = useFormik({
    enableReinitialize: false,
    initialValues: buildRaiseInitialValues(),
    validationSchema: Yup.object({
      incidentType: Yup.string().required("Incident type is required"),
      patientIncidentType: Yup.string().when("incidentType", {
        is: "Patient",
        then: (schema) => schema.required("Patient incident type is required"),
      }),
      patient: Yup.string().when("incidentType", {
        is: "Patient",
        then: (schema) => schema.required("Patient is required"),
      }),
      title: Yup.string().required("Title is required"),
      occurrenceDate: Yup.date().required("Occurrence date is required"),
      center: Yup.string().required("Center is required"),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("incidentType", values.incidentType);
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("occurrenceDate", values.occurrenceDate);
      formData.append("location", values.location || "");
      formData.append("immediateAction", values.immediateAction || "");
      formData.append("center", values.center);
      if (values.incidentType === "Patient") {
        formData.append(
          "patientIncidentType",
          values.patientIncidentType || ""
        );
        if (values.patientIncidentType === "Other") {
          formData.append(
            "patientIncidentOther",
            values.patientIncidentOther || ""
          );
        }
      }

      if (values.incidentType === "Patient" && values.patient) {
        formData.append("patient", values.patient);
      }

      files.forEach((fileItem) => {
        if (fileItem.file) {
          formData.append("files", fileItem.file);
        }
      });

      if (currentIncident && currentIncident._id) {
        dispatch(
          updateIncidentAction({
            id: currentIncident._id,
            data: formData,
          })
        );
      } else {
        dispatch(createIncident(formData));
      }
      if (onClose) onClose();
    },
  });

  // sync form values when incident prop identity changes (without full reinit)
  useEffect(() => {
    raiseForm.setValues(buildRaiseInitialValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIncident, centers]);

  // Investigation Stage Form
  const investigationForm = useFormik({
    enableReinitialize: false,
    initialValues: {
      findings: currentIncident?.investigation?.findings || "",
      rootCause: currentIncident?.investigation?.rootCause || "",
      preventiveActions:
        currentIncident?.investigation?.preventiveActions || "",
    },
    validationSchema: Yup.object({
      findings: Yup.string().required("Investigation findings are required"),
      rootCause: Yup.string().required("Root cause is required"),
      preventiveActions: Yup.string().required(
        "Preventive actions are required"
      ),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("findings", values.findings);
      formData.append("rootCause", values.rootCause);
      formData.append("preventiveActions", values.preventiveActions);

      investigationFiles.forEach((fileItem) => {
        if (fileItem.file) {
          formData.append("files", fileItem.file);
        }
      });

      dispatch(
        investigateIncidentAction({
          id: currentIncident._id,
          data: formData,
        })
      );
      // keep local form state; external fetch not required for local editing flow
    },
  });

  useEffect(() => {
    investigationForm.setValues({
      findings: currentIncident?.investigation?.findings || "",
      rootCause: currentIncident?.investigation?.rootCause || "",
      preventiveActions:
        currentIncident?.investigation?.preventiveActions || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIncident?._id]);

  // Approval Stage Form
  const approvalForm = useFormik({
    enableReinitialize: false,
    initialValues: {
      decision: currentIncident?.approval?.decision || "",
      remarks: currentIncident?.approval?.remarks || "",
    },
    validationSchema: Yup.object({
      decision: Yup.string()
        .oneOf(["Approved", "Rejected"], "Please select a decision")
        .required("Decision is required"),
      remarks: Yup.string().required("Remarks are required"),
    }),
    onSubmit: async (values) => {
      dispatch(
        approveIncidentAction({
          id: currentIncident._id,
          data: {
            decision: values.decision,
            remarks: values.remarks,
          },
        })
      );
      // no refetch; keep local edit experience
    },
  });

  useEffect(() => {
    approvalForm.setValues({
      decision: currentIncident?.approval?.decision || "",
      remarks: currentIncident?.approval?.remarks || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIncident?._id]);

  // Closure Stage Form
  const closureForm = useFormik({
    enableReinitialize: false,
    initialValues: {
      comments: currentIncident?.closure?.comments || "",
    },
    validationSchema: Yup.object({
      comments: Yup.string().required("Closure comments are required"),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("comments", values.comments);

      closureFiles.forEach((fileItem) => {
        if (fileItem.file) {
          formData.append("files", fileItem.file);
        }
      });

      dispatch(
        closeIncidentAction({
          id: currentIncident._id,
          data: formData,
        })
      );
      // no refetch; form remains controlled locally
    },
  });

  useEffect(() => {
    closureForm.setValues({
      comments: currentIncident?.closure?.comments || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIncident?._id]);

  const getStatusBadge = (status) => {
    const colorMap = {
      Raised: "warning",
      "Under Investigation": "info",
      "Pending Approval": "primary",
      Approved: "success",
      Rejected: "danger",
      Closed: "secondary",
    };
    return <Badge color={colorMap[status] || "secondary"}>{status}</Badge>;
  };

  const canAccessStage = (stage) => {
    if (!currentIncident) return stage === "raise";
    const status = currentIncident.status;
    const stageMap = {
      raise: ["Raised"],
      investigation: ["Raised", "Under Investigation"],
      approval: ["Pending Approval", "Approved", "Rejected"],
      closure: ["Approved"],
    };
    return stageMap[stage]?.includes(status) || status === "Closed";
  };

  // console.log(raiseForm.values);
  console.log({ currentIncident });

  return (
    <Card>
      <CardBody>
        {currentIncident.title && (
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              {currentIncident ? (
                <>
                  <h5 className="mb-0">{currentIncident.title}</h5>
                  <small className="text-muted">
                    Created:{" "}
                    {new Date(currentIncident.createdAt).toLocaleDateString()}
                  </small>
                </>
              ) : (
                <></>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              {currentIncident.status && currentIncident.title
                ? getStatusBadge(currentIncident.status)
                : ""}
              <RenderWhen isTrue={hasIncidentInvestigatePermission}>
                {currentIncident._id && currentIncident.status === "Raised" && (
                  <Button
                    color="warning"
                    size="sm"
                    onClick={async () => {
                      dispatch(
                        updateIncidentStatusAction({
                          id: currentIncident._id,
                          status: "Under Investigation",
                        })
                      );
                      setCurrentIncident({
                        ...currentIncident,
                        status: "Under Investigation",
                      });
                      setActiveStage("investigation");
                    }}
                  >
                    Start Investigation
                  </Button>
                )}
              </RenderWhen>
            </div>
          </div>
        )}

        <Nav tabs className="nav-tabs-custom nav-justified mb-3">
          <NavItem className="d-flex justify-content-center">
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames(
                { active: activeStage === "raise" },
                "d-flex align-items-center flex-grow-1"
              )}
              onClick={() => canAccessStage("raise") && setActiveStage("raise")}
              disabled={!canAccessStage("raise")}
            >
              <i className="ri-alert-line me-1"></i>
              1. Raise
            </NavLink>
          </NavItem>
          <NavItem className="d-flex justify-content-center">
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames(
                {
                  active: activeStage === "investigation",
                },
                "d-flex align-items-center flex-grow-1"
              )}
              onClick={() =>
                canAccessStage("investigation") &&
                setActiveStage("investigation")
              }
              disabled={!canAccessStage("investigation")}
            >
              <i className="ri-search-line me-1"></i>
              2. Investigation
            </NavLink>
          </NavItem>
          <NavItem className="d-flex justify-content-center">
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames(
                { active: activeStage === "approval" },
                "d-flex align-items-center flex-grow-1"
              )}
              onClick={() =>
                canAccessStage("approval") && setActiveStage("approval")
              }
              disabled={!canAccessStage("approval")}
            >
              <i className="ri-checkbox-circle-line me-1"></i>
              3. Approval
            </NavLink>
          </NavItem>
          <NavItem className="d-flex justify-content-center">
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames(
                { active: activeStage === "closure" },
                "d-flex align-items-center flex-grow-1"
              )}
              onClick={() =>
                canAccessStage("closure") && setActiveStage("closure")
              }
              disabled={!canAccessStage("closure")}
            >
              <i className="ri-close-circle-line me-1"></i>
              4. Closure
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeStage}>
          {/* Raise Stage */}
          <TabPane tabId="raise">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                raiseForm.handleSubmit();
                return false;
              }}
            >
              <Row>
                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <Label>Incident Type *</Label>
                    <Input
                      type="select"
                      name="incidentType"
                      value={raiseForm.values.incidentType}
                      onChange={raiseForm.handleChange}
                      onBlur={raiseForm.handleBlur}
                      disabled={currentIncident?.status !== "Raised"}
                    >
                      <option value="">Select Type</option>
                      <option value="Patient">Patient-related</option>
                      <option value="Non-Patient">Non-patient</option>
                    </Input>
                    {raiseForm.touched.incidentType &&
                      raiseForm.errors.incidentType && (
                        <FormFeedback type="invalid" className="d-block">
                          {raiseForm.errors.incidentType}
                        </FormFeedback>
                      )}
                  </div>
                </Col>

                {raiseForm.values.incidentType === "Patient" && (
                  <>
                    <Col xs={12} md={6}>
                      <div className="mb-3">
                        <Label>Patient Incident Type *</Label>
                        <Input
                          type="select"
                          name="patientIncidentType"
                          value={raiseForm.values.patientIncidentType}
                          onChange={raiseForm.handleChange}
                          onBlur={raiseForm.handleBlur}
                          disabled={currentIncident?.status !== "Raised"}
                        >
                          <option value="">Select subtype</option>
                          <option value="Suicide Attempt">
                            Suicide attempt
                          </option>
                          <option value="Suicide Completion">
                            Suicide completion
                          </option>
                          <option value="Near-Miss">
                            Near-Miss (e.g expressed intent, intercepted act)
                          </option>
                          <option value="Absconding">Absconding</option>
                          <option value="Accident">Accident</option>
                          <option value="Other">Other - specify</option>
                        </Input>
                        {raiseForm.touched.patientIncidentType &&
                          !raiseForm.values.patientIncidentType && (
                            <FormFeedback type="invalid" className="d-block">
                              Please select a patient incident type
                            </FormFeedback>
                          )}
                      </div>
                    </Col>
                    {raiseForm.values.patientIncidentType === "Other" && (
                      <Col xs={12} md={6}>
                        <div className="mb-3">
                          <Label>Specify Other</Label>
                          <Input
                            type="text"
                            name="patientIncidentOther"
                            value={raiseForm.values.patientIncidentOther}
                            onChange={raiseForm.handleChange}
                            onBlur={raiseForm.handleBlur}
                            disabled={currentIncident?.status !== "Raised"}
                          />
                        </div>
                      </Col>
                    )}
                    <Col xs={12} md={6}>
                      <div className="mb-3">
                        <Label>Patient *</Label>
                        <SearchPatient
                          validation={raiseForm}
                          disabled={currentIncident?.status !== "Raised"}
                          editEvent={!!currentIncident}
                          showNewTag={false}
                        />
                        {raiseForm.touched.patient &&
                          raiseForm.errors.patient && (
                            <FormFeedback type="invalid" className="d-block">
                              {raiseForm.errors.patient}
                            </FormFeedback>
                          )}
                      </div>
                    </Col>
                  </>
                )}

                <Col xs={12}>
                  <div className="mb-3">
                    <Label>Reporter Info</Label>
                    <Input
                      type="text"
                      value={`${user?.name || ""} - ${user?.email || ""} (${
                        user?.role || ""
                      })`}
                      disabled
                    />
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="mb-3">
                    <Label>Title *</Label>
                    <Input
                      type="text"
                      name="title"
                      value={raiseForm.values.title ?? ""}
                      onChange={raiseForm.handleChange}
                      onBlur={raiseForm.handleBlur}
                      disabled={currentIncident?.status !== "Raised"}
                    />
                    {raiseForm.touched.title && raiseForm.errors.title && (
                      <FormFeedback type="invalid" className="d-block">
                        {raiseForm.errors.title}
                      </FormFeedback>
                    )}
                  </div>
                </Col>

                {/*   <Col xs={12} md={6}>
                  <div className="mb-3">
                    <Label>Date & Time of Occurrence *</Label>
                    <Flatpicker
                      className="form-control"
                      value={raiseForm.values.occurrenceDate}
                      onChange={([date]) => {
                        raiseForm.setFieldValue("occurrenceDate", date);
                      }}
                      options={{
                        enableTime: true,
                        dateFormat: "Y-m-d H:i",
                      }}
                      disabled={currentIncident?.status !== "Raised"}
                    />
                    {raiseForm.touched.occurrenceDate &&
                      raiseForm.errors.occurrenceDate && (
                        <FormFeedback type="invalid" className="d-block">
                          {raiseForm.errors.occurrenceDate}
                        </FormFeedback>
                      )}
                  </div>
                </Col>*/}
                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <Label>Center *</Label>
                    <Input
                      type="select"
                      name="center"
                      value={raiseForm.values.center}
                      onChange={raiseForm.handleChange}
                      onBlur={raiseForm.handleBlur}
                      disabled={currentIncident?.status !== "Raised"}
                    >
                      <option value="">Select Center</option>
                      {centers?.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title || c.name || c._id}
                        </option>
                      ))}
                    </Input>
                    {raiseForm.touched.center && raiseForm.errors.center && (
                      <FormFeedback type="invalid" className="d-block">
                        {raiseForm.errors.center}
                      </FormFeedback>
                    )}
                  </div>
                </Col>

                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <Label>Location</Label>
                    <Input
                      type="text"
                      name="location"
                      value={raiseForm.values.location}
                      onChange={raiseForm.handleChange}
                      disabled={currentIncident?.status !== "Raised"}
                    />
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="mb-3">
                    <Label>Description / Summary</Label>
                    <Input
                      type="textarea"
                      rows={4}
                      name="description"
                      value={raiseForm.values.description}
                      onChange={raiseForm.handleChange}
                      disabled={currentIncident?.status !== "Raised"}
                    />
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="mb-3">
                    <Label>Immediate Action Taken</Label>
                    <Input
                      type="textarea"
                      rows={3}
                      name="immediateAction"
                      value={raiseForm.values.immediateAction}
                      onChange={raiseForm.handleChange}
                      disabled={currentIncident?.status !== "Raised"}
                    />
                  </div>
                </Col>

                {currentIncident?.status === "Raised" && (
                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Attachments (Optional)</Label>
                      <FilePond
                        files={files}
                        onupdatefiles={setFiles}
                        allowMultiple={true}
                        maxFiles={10}
                        name="files"
                        acceptedFileTypes={[
                          "image/*",
                          "application/pdf",
                          "application/msword",
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        ]}
                        labelFileTypeNotAllowed="File type not allowed"
                      />
                    </div>
                  </Col>
                )}

                {currentIncident?.status === "Raised" && (
                  <Col xs={12}>
                    <div className="d-flex gap-2">
                      <Button type="submit" color="primary">
                        {incident ? "Update" : "Submit Incident"}
                      </Button>
                      <Button type="button" color="secondary" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </Col>
                )}
              </Row>
            </Form>
          </TabPane>

          {/* Investigation Stage */}
          <TabPane tabId="investigation">
            {currentIncident?.status === "Raised" ? (
              <Alert color="info">
                Please submit the incident first before starting investigation.
              </Alert>
            ) : (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  investigationForm.handleSubmit();
                  return false;
                }}
              >
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Investigated By</Label>
                      <Input
                        type="text"
                        value={`${user?.name || ""} - ${user?.email || ""}`}
                        disabled
                      />
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Investigation Findings *</Label>
                      <Input
                        type="textarea"
                        rows={5}
                        name="findings"
                        value={investigationForm.values.findings}
                        onChange={investigationForm.handleChange}
                        onBlur={investigationForm.handleBlur}
                        disabled={
                          currentIncident?.status !== "Under Investigation"
                        }
                      />
                      {investigationForm.touched.findings &&
                        investigationForm.errors.findings && (
                          <FormFeedback type="invalid" className="d-block">
                            {investigationForm.errors.findings}
                          </FormFeedback>
                        )}
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Root Cause *</Label>
                      <Input
                        type="textarea"
                        rows={5}
                        name="rootCause"
                        value={investigationForm.values.rootCause}
                        onChange={investigationForm.handleChange}
                        onBlur={investigationForm.handleBlur}
                        disabled={
                          currentIncident?.status !== "Under Investigation"
                        }
                      />
                      {investigationForm.touched.rootCause &&
                        investigationForm.errors.rootCause && (
                          <FormFeedback type="invalid" className="d-block">
                            {investigationForm.errors.rootCause}
                          </FormFeedback>
                        )}
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Preventive Actions *</Label>
                      <Input
                        type="textarea"
                        rows={5}
                        name="preventiveActions"
                        value={investigationForm.values.preventiveActions}
                        onChange={investigationForm.handleChange}
                        onBlur={investigationForm.handleBlur}
                        disabled={
                          currentIncident?.status !== "Under Investigation"
                        }
                      />
                      {investigationForm.touched.preventiveActions &&
                        investigationForm.errors.preventiveActions && (
                          <FormFeedback type="invalid" className="d-block">
                            {investigationForm.errors.preventiveActions}
                          </FormFeedback>
                        )}
                    </div>
                  </Col>

                  {currentIncident?.status === "Under Investigation" && (
                    <>
                      <Col xs={12}>
                        <div className="mb-3">
                          <Label>Investigation Report (Optional)</Label>
                          <FilePond
                            files={investigationFiles}
                            onupdatefiles={setInvestigationFiles}
                            allowMultiple={true}
                            maxFiles={10}
                            name="files"
                            acceptedFileTypes={[
                              "image/*",
                              "application/pdf",
                              "application/msword",
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            ]}
                          />
                        </div>
                      </Col>

                      <Col xs={12}>
                        <Button type="submit" color="primary">
                          Submit Investigation
                        </Button>
                      </Col>
                    </>
                  )}
                </Row>
              </Form>
            )}
          </TabPane>

          {/* Approval Stage */}
          <TabPane tabId="approval">
            {currentIncident?.status === "Pending Approval" ? (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  approvalForm.handleSubmit();
                  return false;
                }}
              >
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Approved By</Label>
                      <Input
                        type="text"
                        value={`${user?.name || ""} - ${user?.email || ""}`}
                        disabled
                      />
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Decision *</Label>
                      <Input
                        type="select"
                        name="decision"
                        value={approvalForm.values.decision}
                        onChange={approvalForm.handleChange}
                        onBlur={approvalForm.handleBlur}
                      >
                        <option value="">Select Decision</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </Input>
                      {approvalForm.touched.decision &&
                        approvalForm.errors.decision && (
                          <FormFeedback type="invalid" className="d-block">
                            {approvalForm.errors.decision}
                          </FormFeedback>
                        )}
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Approval Remarks *</Label>
                      <Input
                        type="textarea"
                        rows={5}
                        name="remarks"
                        value={approvalForm.values.remarks}
                        onChange={approvalForm.handleChange}
                        onBlur={approvalForm.handleBlur}
                      />
                      {approvalForm.touched.remarks &&
                        approvalForm.errors.remarks && (
                          <FormFeedback type="invalid" className="d-block">
                            {approvalForm.errors.remarks}
                          </FormFeedback>
                        )}
                    </div>
                  </Col>

                  <Col xs={12}>
                    <Button type="submit" color="primary">
                      Submit Approval
                    </Button>
                  </Col>
                </Row>
              </Form>
            ) : currentIncident?.approval ? (
              <div>
                <h6>Approval Details</h6>
                <p>
                  <strong>Decision:</strong>{" "}
                  <Badge
                    color={
                      currentIncident.approval.decision === "Approved"
                        ? "success"
                        : "danger"
                    }
                  >
                    {currentIncident.approval.decision}
                  </Badge>
                </p>
                <p>
                  <strong>Approved By:</strong>{" "}
                  {currentIncident.approval.by?.name || "N/A"}
                </p>
                <p>
                  <strong>Remarks:</strong> {currentIncident.approval.remarks}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(currentIncident.approval.date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <Alert color="warning">
                Incident is not yet ready for approval. Please complete the
                investigation first.
              </Alert>
            )}
          </TabPane>

          {/* Closure Stage */}
          <TabPane tabId="closure">
            {currentIncident?.status === "Approved" ? (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  closureForm.handleSubmit();
                  return false;
                }}
              >
                <Row>
                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Closed By</Label>
                      <Input
                        type="text"
                        value={`${user?.name || ""} - ${user?.email || ""}`}
                        disabled
                      />
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Closure Comments *</Label>
                      <Input
                        type="textarea"
                        rows={5}
                        name="comments"
                        value={closureForm.values.comments}
                        onChange={closureForm.handleChange}
                        onBlur={closureForm.handleBlur}
                      />
                      {closureForm.touched.comments &&
                        closureForm.errors.comments && (
                          <FormFeedback type="invalid" className="d-block">
                            {closureForm.errors.comments}
                          </FormFeedback>
                        )}
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-3">
                      <Label>Closure Documents (Optional)</Label>
                      <FilePond
                        files={closureFiles}
                        onupdatefiles={setClosureFiles}
                        allowMultiple={true}
                        maxFiles={10}
                        name="files"
                        acceptedFileTypes={[
                          "image/*",
                          "application/pdf",
                          "application/msword",
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        ]}
                      />
                    </div>
                  </Col>

                  <Col xs={12}>
                    <Button type="submit" color="success">
                      Close Incident
                    </Button>
                  </Col>
                </Row>
              </Form>
            ) : currentIncident?.status === "Closed" ? (
              <div>
                <h6>Closure Details</h6>
                <p>
                  <strong>Closed By:</strong>{" "}
                  {currentIncident.closure?.by?.name || "N/A"}
                </p>
                <p>
                  <strong>Comments:</strong>{" "}
                  {currentIncident.closure?.comments || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(currentIncident.closure?.date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <Alert color="warning">
                Incident must be approved before it can be closed.
              </Alert>
            )}
          </TabPane>
        </TabContent>
      </CardBody>
    </Card>
  );
};

IncidentForm.propTypes = {
  incident: PropTypes.object,
  onClose: PropTypes.func,
};

export default IncidentForm;
