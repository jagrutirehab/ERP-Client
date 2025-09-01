import { useForm } from "react-hook-form";
import Page1 from "./page1";
import Page2 from "./page2";
import SeriousnessConsent from "./SeriousnessConsent";
import MediactionConcent from "./MediactionConcent";
import Admissionpage1 from "./Admissionpage1";
import Admissionpage2 from "./Admissionpage2";
import IndependentAdmAdult from "./IndependentAdmAdult";
import IndependentAdmMinor from "./IndependentAdmMinor";
import AdmWithHighSupport from "./AdmWithHighSupport";
// import DischargeIndependentAdult from "./DischargeIndependentAdult";
// import DischargeIndependentMinor from "./DischargeIndependentMinor";
import IndipendentOpinion1 from "./IndipendentOpinion1";
import IndipendentOpinion2 from "./IndipendentOpinion2";
import IndipendentOpinion3 from "./IndipendentOpinion3";
import ECTConsentForm from "./ECTConsentForm";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Placeholder,
  Row,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import { useState, useRef, useEffect } from "react";
import AdmissionformModal from "../../Modals/Admissionform.modal";
import { connect, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchPatientById } from "../../../../store/actions";
import AddmissionCard from "../Components/AddmissionCard";
import IPD from "../IPD";
import AdmissionChartModal from "../../Modals/AdmissionChart.modal";

const AddmissionForms = ({ patient, admissions, addmissionsCharts }) => {
  const dispatch = useDispatch();
  const [dateModal, setDateModal] = useState(false);
  const [dateModal2, setDateModal2] = useState(false);
  const [chartType, setChartType] = useState("");
  const [loading, setLoading] = useState(false);
  const toggleModal = () => setDateModal(!dateModal);
  const toggleModal2 = () => setDateModal2(!dateModal2);
  const [addmissionId, setAddmissionId] = useState();
  const [admissiontype, setAdmissiontype] = useState("");
  const [adultationype, setAdultationtype] = useState("");
  const [supporttype, setSupporttype] = useState("");
  const [details, setDetails] = useState({
    IPDnum: "",
    bed: "",
    ward: "",
    toPay: "",
    semiprivate: "",
    advDeposit: "",
  });

  const fileInputRef = useRef(null);
  const [openform, setOpenform] = useState(false);
  const page1Ref = useRef(null);
  const page2Ref = useRef(null);
  const seriousnessRef = useRef(null);
  const medicationRef = useRef(null);
  const ectRef = useRef(null);
  const admission1Ref = useRef(null);
  const admission2Ref = useRef(null);
  const adultRef = useRef(null);
  const minorRef = useRef(null);
  const supportRef = useRef(null);
  const indipendentref1 = useRef(null);
  const indipendentref2 = useRef(null);
  const indipendentref3 = useRef(null);

  const [open, setOpen] = useState(addmissionsCharts?.length > 0 ? "0" : null);
  const toggleAccordian = (id) => {
    // setToggleGeneral("0");
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  useEffect(() => {
    if (
      addmissionsCharts.length &&
      !addmissionsCharts.find((ch) => ch._id === addmissionId)
    ) {
      setOpen("0");
      setAddmissionId(addmissionsCharts[0]?._id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, addmissionsCharts]);

  const { register, handleSubmit } = useForm();

  const captureSection = async (ref, pdf, isFirstPage = false) => {
    if (!ref?.current) return pdf;

    const originalStyle = ref.current.getAttribute("style") || "";

    ref.current.setAttribute(
      "style",
      `
      ${originalStyle};
      font-size: 25px !important;
      line-height: 2 !important;
    `
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    const canvas = await html2canvas(ref.current, { scale: 1, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.6);

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (!isFirstPage) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    return pdf;
  };

  // ===== PDF Preview States =====
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerating2, setIsGenerating2] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);

  const togglePreview = () => setPreviewModal(!previewModal);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl); // cleanup on unmount
    };
  }, [pdfUrl]);

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");

      // capture each component
      await captureSection(page1Ref, pdf, true);
      await captureSection(page2Ref, pdf);
      await captureSection(seriousnessRef, pdf);
      await captureSection(medicationRef, pdf);
      await captureSection(ectRef, pdf);
      await captureSection(admission1Ref, pdf);
      await captureSection(admission2Ref, pdf);

      // conditional pages
      if (adultRef.current) await captureSection(adultRef, pdf);
      if (minorRef.current) await captureSection(minorRef, pdf);
      if (supportRef.current) await captureSection(supportRef, pdf);

      await captureSection(indipendentref1, pdf);
      await captureSection(indipendentref2, pdf);
      await captureSection(indipendentref3, pdf);

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      if (pdfUrl) URL.revokeObjectURL(pdfUrl); // cleanup old url
      setPdfUrl(url);
      setPreviewModal(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${patient?.id?.value}-${patient?.name}-admission-form.pdf`;
    link.click();
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl); // cleanup on unmount
    };
  }, [pdfUrl]);

  // 👇 Add this here
  useEffect(() => {
    setOpenform(false);
    setAdmissiontype("");
    setAdultationtype("");
    setSupporttype("");
    setDetails({
      IPDnum: "",
      bed: "",
      ward: "",
      toPay: "",
      semiprivate: "",
      advDeposit: "",
    });
  }, [patient?._id]);

  const onSubmit = async (data) => {
    setIsGenerating2(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      await captureSection(page1Ref, pdf, true);
      await captureSection(page2Ref, pdf);
      await captureSection(seriousnessRef, pdf);
      await captureSection(medicationRef, pdf);
      await captureSection(ectRef, pdf);
      await captureSection(admission1Ref, pdf);
      await captureSection(admission2Ref, pdf);

      if (adultRef.current) await captureSection(adultRef, pdf);
      if (minorRef.current) await captureSection(minorRef, pdf);
      if (supportRef.current) await captureSection(supportRef, pdf);

      await captureSection(indipendentref1, pdf);
      await captureSection(indipendentref2, pdf);
      await captureSection(indipendentref3, pdf);
      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append(
        "addmissionfromRaw",
        pdfBlob,
        `${patient?.id?.value}-${patient?.name}-admission-form.pdf`
      );

      await axios.patch(
        `/patient/admission-submit/${admissions[0]?._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Admission form submitted successfully!");

      // Reset state
      setOpenform(false);
      setAdmissiontype("");
      setAdultationtype("");
      setSupporttype("");
      setDetails({
        IPDnum: "",
        bed: "",
        ward: "",
        toPay: "",
        semiprivate: "",
        advDeposit: "",
      });
    } catch (error) {
      toast.error("Failed to submit admission form");
    } finally {
      setIsGenerating2(false);
    }
  };
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setIsGenerating2(true);
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.warning("Please upload a PDF file.");
      setIsGenerating2(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("addmissionformURL", file);
      formData.append("id", admissions[0]?._id);
      await axios.patch("/patient/admission-submit-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Signed PDF uploaded successfully!");
      setIsGenerating2(false);
    } catch (err) {
      toast.error("Upload failed");
      setIsGenerating2(false);
    }
  };

  useEffect(() => {
    dispatch(fetchPatientById(patient?._id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isGenerating2, isGenerating]);

  return (
    <>
      <div style={{ marginTop: "4rem" }}>
        <Row className="timeline-right row-gap-5">
          {(addmissionsCharts || []).map((test, idx) => (
            <AddmissionCard
              key={idx}
              id={idx}
              data={test}
              toggleModal={toggleModal}
            >
              {test?.addmissionform === false && (
                <Button
                  onClick={() => {
                    toggleModal2();
                    setChartType(IPD);
                  }}
                  size="sm"
                >
                  Create new Chart
                </Button>
              )}
              <div className="d-flex align-items-center">
                <UncontrolledTooltip
                  placement="bottom"
                  target={`expand-test-${idx}`}
                >
                  Expand/Collapse
                </UncontrolledTooltip>
                <Button
                  id={`expand-test-${idx}`}
                  onClick={() => {
                    toggleAccordian(idx.toString());
                    setAddmissionId(test?._id);
                  }}
                  size="sm"
                  outline
                >
                  <i
                    className={`${
                      open === idx.toString()
                        ? "ri-arrow-up-s-line"
                        : "ri-arrow-down-s-line"
                    } fs-6`}
                  ></i>
                </Button>
              </div>
              {/* ACCORDION */}
              <Accordion
                className="timeline-date w-100"
                open={open}
                toggle={toggleAccordian}
              >
                <AccordionItem className="patient-accordion-item">
                  <AccordionBody
                    className="patient-accordion border-0"
                    accordionId={idx.toString()}
                  >
                    {loading ? (
                      <Placeholder />
                    ) : (
                      <div>
                        {/* <div className="timeline-2"> */}
                        {/* <div className="timeline-continue"> */}
                        <div
                          style={{ width: "100%" }}
                          className="d-flex align-items-center justify-content-between"
                        >
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "1rem",
                            }}
                          >
                            {/* ✅ Create new admission */}
                            {test?.addmissionform === false && (
                              <Button
                                onClick={() => {
                                  toggleModal();
                                }}
                                size="sm"
                                color="primary"
                                className="mr-10"
                              >
                                Create new Admission
                              </Button>
                            )}

                            <Button
                              onClick={handleUploadClick}
                              size="sm"
                              color="primary"
                              className="mr-10"
                              disabled={isGenerating2}
                            >
                              {isGenerating2 ? (
                                <Spinner size="sm" />
                              ) : (
                                "Upload Signed Copy"
                              )}
                            </Button>

                            {patient.isAdmit === true &&
                              test?.addmissionform && (
                                <div
                                  style={{
                                    width: "100%",
                                    textAlign: "center",
                                  }}
                                >
                                  <div className="mt-2">
                                    <a
                                      href={test?.addmissionfromRaw?.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-primary btn-sm"
                                    >
                                      Download Draft Admission Form{" "}
                                      {test?.addmissionfromRaw
                                        ? `(${new Date(
                                            test?.addmissionfromRaw?.uploadedAt
                                          ).toLocaleDateString()})`
                                        : ""}
                                    </a>
                                  </div>
                                </div>
                              )}

                            {/* hidden input */}
                            <input
                              type="file"
                              accept="application/pdf"
                              ref={fileInputRef}
                              style={{ display: "none" }}
                              onChange={handleFileChange}
                            />
                            {test?.addmissionformURL?.length > 0 && (
                              <div
                                style={{
                                  width: "100%",
                                  textAlign: "center",
                                }}
                              >
                                {test.addmissionformURL.map((file, index) => (
                                  <div key={index} className="mt-2">
                                    <a
                                      href={file?.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-primary btn-sm"
                                    >
                                      Download Signed Admission Form {index + 1}{" "}
                                      {file?.uploadedAt
                                        ? `(${new Date(
                                            file.uploadedAt
                                          ).toLocaleDateString()})`
                                        : ""}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* </div> */}
                      </div>
                      // </div>
                    )}
                  </AccordionBody>
                </AccordionItem>
              </Accordion>
            </AddmissionCard>
          ))}
        </Row>
      </div>

      {openform === true ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* common start */}
          <div ref={page1Ref}>
            <Page1
              register={register}
              admissions={admissions}
              patient={patient}
            />
          </div>
          <div ref={page2Ref}>
            <Page2 register={register} patient={patient} />
          </div>
          <div ref={seriousnessRef}>
            <SeriousnessConsent register={register} patient={patient} />
          </div>
          <div ref={medicationRef}>
            <MediactionConcent register={register} patient={patient} />
          </div>
          <div ref={ectRef}>
            <ECTConsentForm
              register={register}
              patient={patient}
              admissions={admissions}
            />
          </div>
          <div ref={admission1Ref}>
            <Admissionpage1
              register={register}
              admissions={admissions}
              patient={patient}
              details={details}
            />
          </div>
          <div ref={admission2Ref}>
            <Admissionpage2
              register={register}
              patient={patient}
              details={details}
            />
          </div>
          {/* common end */}
          {/* for adult */}
          {admissiontype === "INDEPENDENT_ADMISSION" &&
            adultationype === "ADULT" && (
              <div ref={adultRef}>
                <IndependentAdmAdult
                  register={register}
                  patient={patient}
                  details={details}
                />
              </div>
            )}
          {/* for minor */}
          {admissiontype === "INDEPENDENT_ADMISSION" &&
            adultationype === "MINOR" && (
              <div ref={minorRef}>
                <IndependentAdmMinor
                  register={register}
                  patient={patient}
                  details={details}
                />
              </div>
            )}
          {/* support form */}
          {admissiontype === "SUPPORTIVE_ADMISSION" &&
            (supporttype === "UPTO30DAYS" ||
              supporttype === "BEYOND30DAYS") && (
              <div ref={supportRef}>
                <AdmWithHighSupport
                  register={register}
                  patient={patient}
                  details={details}
                />
              </div>
            )}
          {/* {admissiontype === "INDEPENDENT_ADMISSION" && adultationype === "ADULT" && ( <DischargeIndependentAdult register={register} /> )} */}{" "}
          {/* for minor */}{" "}
          {/* {admissiontype === "INDEPENDENT_ADMISSION" && adultationype === "MINOR" && ( <DischargeIndependentMinor register={register} /> )} */}
          {/* hidden opinions */}
          <div
            style={{
              position: "absolute",
              top: "-9999px",
              left: "0",
              visibility: "visible",
              pointerEvents: "none",
            }}
          >
            <div ref={indipendentref1}>
              <IndipendentOpinion1
                register={register}
                patient={patient}
                details={details}
              />
            </div>
            <div ref={indipendentref2}>
              <IndipendentOpinion2
                register={register}
                patient={patient}
                details={details}
              />
            </div>
            <div ref={indipendentref3}>
              <IndipendentOpinion3
                register={register}
                patient={patient}
                details={details}
              />
            </div>
          </div>
          <div style={{ textAlign: "center", margin: "20px" }}>
            <Button
              color="secondary"
              type="submit"
              className="me-2"
              disabled={isGenerating2}
            >
              {isGenerating2 ? <Spinner size="sm" /> : "Submit"}
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={handlePrint}
              disabled={isGenerating}
            >
              {isGenerating ? <Spinner size="sm" /> : "Print PDF"}
            </Button>
          </div>
        </form>
      ) : (
        ""
      )}

      {/* ===== PDF Preview Modal ===== */}
      <Modal
        isOpen={previewModal}
        toggle={togglePreview}
        size="xl"
        style={{ maxWidth: "90%" }}
      >
        <ModalHeader toggle={togglePreview}>PDF Preview</ModalHeader>
        <ModalBody style={{ height: "80vh" }}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner />
            </div>
          )}
        </ModalBody>
        <div className="d-flex justify-content-end p-3">
          <Button color="secondary" onClick={togglePreview} className="me-2">
            Close
          </Button>
          <Button color="primary" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </Modal>
      <AdmissionChartModal
        type={chartType}
        isOpen={dateModal2}
        toggle={toggleModal2}
        patient={patient}
      />
      <AdmissionformModal
        isOpen={dateModal}
        toggle={toggleModal}
        admissiontype={admissiontype}
        setAdmissiontype={setAdmissiontype}
        adultationype={adultationype}
        setAdultationtype={setAdultationtype}
        supporttype={supporttype}
        setSupporttype={setSupporttype}
        details={details}
        setDetails={setDetails}
        setOpenform={setOpenform}
        openform={openform}
        onSubmit={onSubmit}
      />
    </>
  );
};

AddmissionForms.propTypes = {
  patient: PropTypes.object,
  addmissionsCharts: PropTypes.array,
};

const mapStateToProps = (state) => ({
  chartDate: state.Chart.chartDate,
  patient: state.Patient.patient,
  addmissionsCharts: state.Chart.data,
  doctors: state.User?.doctor,
  psychologists: state.User?.counsellors,
  admissions: state.Chart.data,
});

export default connect(mapStateToProps)(AddmissionForms);
