import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Input,
  Label,
  Table,
  FormGroup,
  Spinner,
} from "reactstrap";
import { submitAssessment } from "../../../helpers/backend_helper";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchCharts, fetchPatientById } from "../../../store/actions";
import { addCapacityAssessment } from "../../../store/features/chart/chartSlice";

const CapacityAssessmentModal = ({ isOpen, toggle, patient, addmissionId }) => {
  const [formData, setFormData] = useState({
    patientName: patient?.name || "",
    uhidIpdNo: patient?.id?.prefix + patient?.id?.value || "",
    ageSex: "",
    wardUnit: "",
    assessmentDateTime: "",
    assessedBy: "",
    languageUsed: "",
    interpreterUsed: "",
    newAdmission: false,
    highRiskTreatment: false,
    refusalOfTreatment: false,
    amaRequest: false,
    useOfRestraint: false,
    ectConsent: false,
    primaryDiagnosis: "",
    mentalStatusSummary: "",
    factorsAffectingCapacity: "",
    understandInformation: "",
    appreciateSituation: "",
    reasonWeighOptions: "",
    communicateChoice: "",
    overallCapacityDetermination: "",
    nominatedRepresentativeInformed: "",
    representativeName: "",
    relationship: "",
    supportedAdmissionInitiated: "",
    nextReviewDate: "",
    suicideRisk: false,
    violenceRisk: false,
    withdrawalRisk: false,
    abscondingRisk: false,
    vulnerableAdult: false,
    managementPlan: "",
    signatures: [],
  });
  const capacityFormRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const loggedIn = JSON.parse(localStorage.getItem("authUser"));
  const loggedInUserName = loggedIn?.data.name;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const pdf = new jsPDF("p", "pt", "a4");

      await captureSection(capacityFormRef, pdf, true);

      const pdfBlob = pdf.output("blob");

      const formDataToSend = new FormData();

      formDataToSend.append(
        "capacityAssessmentFormRaw",
        pdfBlob,
        `capacity-assessment-${formData.patientName}.pdf`,
      );

      Object.keys(formData).forEach((key) => {
        let value = formData[key];

        if (value === undefined || value === null) {
          value = "";
        }

        if (typeof value === "boolean") {
          value = value ? "true" : "false";
        }

        if (Array.isArray(value)) {
          value = JSON.stringify(value);
        }

        formDataToSend.append(key, value);
      });

      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }
      await dispatch(
        addCapacityAssessment({
          addmissionId: patient?.addmission?._id,
          formData: formDataToSend,
        }),
      ).unwrap();

      await dispatch(fetchPatientById(patient?._id));

      toggle();
    } catch (error) {
      toast.error(error.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  const paperStyle = {
    fontFamily: "'Arial', sans-serif",
    color: "#000",
  };

  const tableHeaderStyle = {
    backgroundColor: "#f2f2f2",
    border: "1px solid #000",
    fontWeight: "bold",
  };

  const captureSection = async (ref, pdf, isFirstPage = false) => {
    if (!ref?.current) return pdf;

    const clone = ref.current.cloneNode(true);

    const inputs = clone.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      const span = document.createElement("span");
      let value = "";

      if (input.type === "checkbox" || input.type === "radio") {
        value = input.checked ? "YES" : "";
      } else if (input.type === "date" && input.value) {
        value = new Date(input.value).toLocaleDateString("en-GB");
      } else {
        value = input.value || "";
      }

      span.innerText = value || "\u00A0";
      // span.style.fontWeight = "bold";
      // span.style.textTransform = "uppercase";
      span.style.borderBottom = "1px solid #000";
      span.style.display = "inline-block";
      span.style.minWidth = "100px";
      span.style.margin = "0 4px";

      if (input.tagName === "TEXTAREA" || input.name === "managementPlan") {
        span.style.display = "block";
        span.style.width = "100%";
        span.style.whiteSpace = "pre-wrap";
        span.style.minHeight = "80px";
      }

      input.parentNode.replaceChild(span, input);
    });

    clone.style.position = "fixed";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.width = "900px"; 
    clone.style.background = "#fff";
    clone.style.padding = "40px";
    clone.style.zIndex = "-1";
    document.body.appendChild(clone);

    await new Promise((r) => setTimeout(r, 200));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });

    document.body.removeChild(clone);

    // 3. Multi-page Slicing Logic
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 40; // Horizontal margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 20; // Start margin from top

    // Add the first page content
    if (!isFirstPage) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 20, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;

    // 4. While content remains, add new pages and shift the image up
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 20, position + 20, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    return pdf;
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");

      await captureSection(capacityFormRef, pdf, true);

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setPreviewModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  console.log("Patient", patient);
  useEffect(() => {
    if (patient?.name) {
      setFormData((prev) => ({
        ...prev,
        patientName: patient.name,
        assessedBy : loggedInUserName || ""
      }));
    }
  }, [patient, loggedInUserName]);

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="xl" scrollable>
        <ModalBody className="px-5 pb-5">
          <div ref={capacityFormRef} style={paperStyle}>
            <div
              className="border-bottom-0 pb-0 d-flex flex-column align-items-center text-center position-relative w-100 mt-2"
              style={{ fontFamily: "'Arial', sans-serif", color: "#333" }}
            >
              <h3
                className="fw-bold mb-1"
                style={{ fontSize: "24px", letterSpacing: "1px" }}
              >
                JAGRUTII REHAB CENTRE PVT LTD
              </h3>

              <h5 className="fw-bold mb-3" style={{ fontSize: "18px" }}>
                Full Capacity Assessment Form (MHCA 2017 Compliant)
              </h5>

              <div
                className="d-flex justify-content-center align-items-center gap-4 py-2 flex-wrap"
                style={{ fontSize: "14px" }}
              >
                <div>
                  SOP Ref: <span className="fw-bold">CG-01</span>
                </div>
                <div>
                  Department: <span className="fw-bold">Psychiatry</span>
                </div>
                <div>
                  Applies to:{" "}
                  <span className="fw-bold">
                    All admissions & major treatment decisions
                  </span>
                </div>
              </div>
            </div>
            <h6 className="fw-bold font-italic mb-2">
              1. Patient Identification
            </h6>
            <Table bordered size="sm" className="border-dark">
              <tbody>
                <tr>
                  <td style={{ width: "30%" }} className="fw-bold">
                    Patient Name
                  </td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="patientName"
                      value={formData?.patientName}
                      onChange={handleChange}
                      className="p-0 ps-2 text-capitalize"
                      disabled
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">UHID / IPD No.</td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="uhidIpdNo"
                      value={formData?.uhidIpdNo}
                      onChange={handleChange}
                      className="p-0 ps-2"
                      disabled
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Age / Sex</td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="ageSex"
                      onChange={handleChange}
                      className="p-0 ps-2"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Ward / Unit</td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="wardUnit"
                      onChange={handleChange}
                      className="p-0 ps-2"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Date & Time of Assessment</td>
                  <td>
                    <Input
                      type="datetime-local"
                      name="assessmentDateTime"
                      onChange={handleChange}
                      className="border-0 p-0"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Assessed By (Name & Designation)</td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="assessedBy"
                      value={formData?.assessedBy}
                      onChange={handleChange}
                      className="p-0 ps-2 text-capitalize"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Language Used</td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="languageUsed"
                      onChange={handleChange}
                      className="p-0 ps-2"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Interpreter Used (if any)</td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="interpreterUsed"
                      onChange={handleChange}
                      className="p-0 ps-2"
                    />
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* 2. Trigger */}
            <h6 className="fw-bold font-italic mt-4 mb-2">
              2. Trigger for Capacity Assessment
            </h6>
            <div className="d-flex flex-wrap gap-3 border p-2 border-dark rounded mb-4">
              {[
                { id: "newAdmission", label: "New admission" },
                {
                  id: "highRiskTreatment",
                  label: "High-risk treatment decision",
                },
                { id: "refusalOfTreatment", label: "Refusal of treatment" },
                { id: "amaRequest", label: "AMA request" },
                { id: "useOfRestraint", label: "Use of restraint" },
                { id: "ectConsent", label: "ECT consent" },
              ].map((item) => (
                <FormGroup check key={item.id} className="mb-0">
                  <Input
                    type="checkbox"
                    name={item.id}
                    onChange={handleChange}
                    style={{ border: "1px solid #000" }}
                  />
                  <Label check className="ms-1 small fw-bold">
                    {item.label}
                  </Label>
                </FormGroup>
              ))}
            </div>

            {/* 3. Clinical Context */}
            <h6 className="fw-bold font-italic mb-2">3. Clinical Context</h6>
            <Table bordered size="sm" className="border-dark">
              <tbody>
                <tr>
                  <td style={{ width: "30%" }} className="fw-bold">
                    Primary Diagnosis
                  </td>
                  <td>
                    <Input
                      type="textarea"
                      rows="2"
                      name="primaryDiagnosis"
                      onChange={handleChange}
                      className="border-0"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Brief Mental Status Summary</td>
                  <td>
                    <Input
                      type="textarea"
                      rows="2"
                      name="mentalStatusSummary"
                      onChange={handleChange}
                      className="border-0"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">
                    Factors Affecting Capacity (psychosis, intoxication,
                    delirium etc.)
                  </td>
                  <td>
                    <Input
                      type="textarea"
                      rows="2"
                      name="factorsAffectingCapacity"
                      onChange={handleChange}
                      className="border-0"
                    />
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* 4. Capacity Evaluation Sections */}
            {[
              {
                id: "understandInformation",
                label: "4A. Ability to Understand Information",
              },
              {
                id: "appreciateSituation",
                label: "4B. Ability to Appreciate Situation & Consequences",
              },
              {
                id: "reasonWeighOptions",
                label: "4C. Ability to Reason / Weigh Options",
              },
              {
                id: "communicateChoice",
                label: "4D. Ability to Communicate Choice",
              },
            ].map((section) => (
              <div key={section.id} className="mt-4">
                <h6 className="fw-bold font-italic mb-1">{section.label}</h6>
                <p className="small mb-1 text-muted">Notes:</p>
                <Input
                  type="textarea"
                  rows="3"
                  name={section.id}
                  onChange={handleChange}
                  style={{
                    border: "none",
                    borderBottom: "1px solid #ccc",
                    borderRadius: 0,
                    paddingLeft: 0,
                  }}
                  placeholder="Type assessment notes here..."
                />
              </div>
            ))}

            {/* 5. Overall Capacity Determination */}
            <h6 className="fw-bold font-italic mt-5 mb-2">
              5. Overall Capacity Determination
            </h6>
            <div className="d-flex gap-4 p-2 border border-dark rounded">
              <FormGroup check>
                <Input
                  type="radio"
                  name="overallCapacityDetermination"
                  value="HAS"
                  onChange={handleChange}
                />
                <Label check className="fw-bold small ms-1">
                  Patient HAS capacity for this decision
                </Label>
              </FormGroup>
              <FormGroup check>
                <Input
                  type="radio"
                  name="overallCapacityDetermination"
                  value="LACKS"
                  onChange={handleChange}
                />
                <Label check className="fw-bold small ms-1">
                  Patient LACKS capacity for this decision
                </Label>
              </FormGroup>
              <FormGroup check>
                <Input
                  type="radio"
                  name="overallCapacityDetermination"
                  value="FLUCTUATING"
                  onChange={handleChange}
                />
                <Label check className="fw-bold small ms-1">
                  Fluctuating capacity — reassessment required
                </Label>
              </FormGroup>
            </div>

            {/* 6. If Capacity Lacking */}
            <h6 className="fw-bold font-italic mt-4 mb-2">
              6. If Capacity Lacking
            </h6>
            <Table bordered size="sm" className="border-dark">
              <tbody>
                <tr>
                  <td style={{ width: "40%" }} className="fw-bold small">
                    Nominated Representative (NR) informed (Yes/No)
                  </td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="nominatedRepresentativeInformed"
                      onChange={handleChange}
                      className="p-0 ps-2"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold small">Name of NR</td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="representativeName"
                      onChange={handleChange}
                      className="p-0 ps-2"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold small">Relationship</td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="relationship"
                      onChange={handleChange}
                      className="p-0 ps-2"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold small">
                    Supported admission initiated (if applicable)
                  </td>
                  <td>
                    <Input
                      type="text"
                      plainText
                      name="supportedAdmissionInitiated"
                      onChange={handleChange}
                      className="p-0 ps-2"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold small">Next review date</td>
                  <td>
                    <Input
                      type="date"
                      name="nextReviewDate"
                      onChange={handleChange}
                      className="border-0 p-0"
                    />
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* 7. Risk Flags */}
            <h6 className="fw-bold font-italic mt-4 mb-2">7. Risk Flags</h6>
            <div className="d-flex flex-wrap gap-4 p-2 border border-dark rounded">
              {[
                { id: "suicideRisk", label: "Suicide risk" },
                { id: "violenceRisk", label: "Violence risk" },
                { id: "withdrawalRisk", label: "Severe withdrawal risk" },
                { id: "abscondingRisk", label: "Absconding risk" },
                { id: "vulnerableAdult", label: "Vulnerable adult" },
              ].map((risk) => (
                <FormGroup check key={risk.id}>
                  <Input
                    type="checkbox"
                    name={risk.id}
                    onChange={handleChange}
                  />
                  <Label check className="fw-bold small ms-1">
                    {risk.label}
                  </Label>
                </FormGroup>
              ))}
            </div>

            {/* 8. Management Plan */}
            <h6 className="fw-bold font-italic mt-4 mb-2">
              8. Management Plan
            </h6>
            <Input
              type="textarea"
              rows="4"
              name="managementPlan"
              onChange={handleChange}
              style={{ border: "1px solid #000", borderRadius: 0 }}
            />

            {/* 9. Signatures Table */}
            <h6 className="fw-bold font-italic mt-4 mb-2">9. Signatures</h6>
            <Table bordered size="sm" className="border-dark text-center">
              <thead>
                <tr style={tableHeaderStyle}>
                  <th className="small" style={{ width: "30%" }}>
                    Role
                  </th>
                  <th className="small">Name</th>
                  <th className="small">Signature (Initial)</th>
                  <th className="small">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: "Consultant Psychiatrist", key: "psychiatrist" },
                  {
                    role: "Second Psychiatrist (if required)",
                    key: "secondPsychiatrist",
                  },
                  { role: "Witness (Nurse/Psychologist)", key: "witness" },
                ].map((row, index) => (
                  <tr key={index} style={{ height: "90px" }}>
                    <td className="text-start fw-bold small py-2 ps-2">
                      {row.role}
                    </td>
                    <td>
                      <Input
                        type="text"
                        plainText
                        className="px-2"
                        placeholder="Name"
                        // You might need to adjust your state logic to handle signature objects
                        // For now, these will act as visual placeholders
                      />
                    </td>
                    <td>
                      <Input
                        type="text"
                        plainText
                        className="px-2"
                        placeholder="Initial"
                      />
                    </td>
                    <td>
                      <Input type="date" plainText className="px-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </ModalBody>

        <ModalFooter className="border-top-0">
          <Button color="light" className="border" onClick={toggle}>
            Discard
          </Button>
          <Button color="primary" onClick={handlePrint} disabled={isGenerating}>
            {isGenerating ? <Spinner size="sm" /> : "Print PDF"}
          </Button>
          <Button color="dark" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Save Assessment"}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={previewModal}
        toggle={() => setPreviewModal(false)}
        size="xl"
        style={{ maxWidth: "90%" }}
      >
        <ModalHeader toggle={() => setPreviewModal(false)}>
          PDF Preview
        </ModalHeader>
        <ModalBody style={{ height: "80vh" }}>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          )}
        </ModalBody>
        <div className="d-flex justify-content-end p-3">
          <Button
            color="secondary"
            onClick={() => setPreviewModal(false)}
            className="me-2"
          >
            Close
          </Button>
          <Button
            color="primary"
            onClick={() => {
              const link = document.createElement("a");
              link.href = pdfUrl;
              link.download = `capacity-assessment-${formData.patientName}.pdf`;
              link.click();
            }}
          >
            Download
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CapacityAssessmentModal;
