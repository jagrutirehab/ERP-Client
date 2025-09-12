import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "react-redux";
import GeneralCard from "../../../Patient/Views/Components/GeneralCard";
import { useForm } from "react-hook-form";
import InternUndertakingForm from "./InternUndertakingForm";
import InternUndertakingFormPage2 from "./InternUndertakingForm2";
import InternUndertakingFormPage3 from "./InternUndertakingForm3";
import AdmissionformModal from "./AdmissionformModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import axios from "axios";
import { fetchInternById } from "../../../../store/actions";
import CheckPermission from "../../../../Components/HOC/CheckPermission";
import { usePermissions } from "../../../../Components/Hooks/useRoles";

const InternAddmissionForms = (intern) => {
  const dispatch = useDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerating2, setIsGenerating2] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const togglePreview = () => setPreviewModal(!previewModal);
  const [dateModal, setDateModal] = useState(false);
  const toggleModal = () => setDateModal(!dateModal);
  const { register, handleSubmit } = useForm();
  const [openform, setOpenform] = useState(false);
  const [details, setDetails] = useState({
    from: "",
    to: "",
    position: "",
  });

  const fileInputRef = useRef(null);
  const internundertakingform = useRef(null);
  const internundertakingform2 = useRef(null);
  const internundertakingform3 = useRef(null);
  const [open, setOpen] = useState("0");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { roles } = usePermissions(token);

  const toggleAccordian = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  useEffect(() => {
    setOpenform(false);
    setDetails({
      from: "",
      to: "",
      position: "",
    });
  }, [intern?.intern?._id]);

  // const captureSection = async (ref, pdf, isFirstPage = false) => {
  //   if (!ref?.current) return pdf;

  //   const originalStyle = ref.current.getAttribute("style") || "";

  //   ref.current.setAttribute(
  //     "style",
  //     `
  //       ${originalStyle};
  //       font-size: 50px !important;
  //       line-height: 5 !important;
  //     `
  //   );

  //   await new Promise((resolve) => setTimeout(resolve, 50));
  //   const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
  //   const imgData = canvas.toDataURL("image/jpeg", 0.95);

  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //   if (!isFirstPage) pdf.addPage();
  //   pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

  //   return pdf;
  // };
  const captureSection = async (ref, pdf, isFirstPage = false) => {
    if (!ref?.current) return pdf;

    const originalStyle = ref.current.getAttribute("style") || "";

    // Apply global section styles
    ref.current.setAttribute(
      "style",
      `
      ${originalStyle};
      font-size: 25px !important;
      line-height: 2 !important;
    `
    );

    // 🔑 Fix for inputs: replace them with styled spans temporarily
    const inputs = ref.current.querySelectorAll("input");
    const replacedNodes = [];

    inputs.forEach((input) => {
      const span = document.createElement("span");

      let value = "";
      if (input.type === "date" && input.value) {
        value = new Date(input.value).toLocaleDateString("en-GB"); // DD/MM/YYYY
      } else {
        value = input.value?.toUpperCase() || "";
      }

      // If empty → use non-breaking space
      span.innerText = value || "\u00A0";

      // Apply consistent styles
      span.style.fontWeight = "bold";
      span.style.textTransform = "uppercase";
      span.style.borderBottom = "1px solid #000";
      span.style.marginLeft = "5px";

      // Preserve width of the original input
      span.style.display = "inline-block";
      span.style.minWidth = input.clientWidth + "px";

      // Save for restoring later
      replacedNodes.push({ input, span });
      input.parentNode.replaceChild(span, input);
    });

    // Wait for DOM update
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Capture screenshot
    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (!isFirstPage) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    // 🔄 Restore original inputs back after capture
    replacedNodes.forEach(({ input, span }) => {
      span.parentNode.replaceChild(input, span);
    });

    return pdf;
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");

      // capture each component
      await captureSection(internundertakingform, pdf, true);
      await captureSection(internundertakingform2, pdf);
      await captureSection(internundertakingform3, pdf);

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
    link.download = `${intern?.intern?.id?.value}-${intern?.intern?.name}-admission-form.pdf`;
    link.click();
  };

  const onSubmit = async (data) => {
    setIsGenerating2(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      await captureSection(internundertakingform, pdf, true);
      await captureSection(internundertakingform2, pdf);
      await captureSection(internundertakingform3, pdf);
      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append(
        "addmissionfromRaw",
        pdfBlob,
        `${intern?.intern?.id?.value}-${intern?.intern?.name}-admission-form.pdf`
      );

      await axios.patch(
        `/intern/admission-submit/${intern?.intern?._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Undertaking form submitted successfully!");
      setOpenform(false);
      setDetails({
        from: "",
        to: "",
        position: "",
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
      formData.append("id", intern?.intern?._id);
      await axios.patch("/intern/admission-submit-file", formData, {
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
    dispatch(fetchInternById(intern?.intern?._id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isGenerating2, isGenerating]);

  return (
    <>
      <div style={{ marginTop: "4rem" }}>
        <Row className="timeline-right row-gap-5">
          {[1].map((test, idx) => (
            <GeneralCard key={idx} data="Intern Undertaking Form">
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
                  {!intern?.intern?.addmissionform && (
                    <Button
                      onClick={() => {
                        toggleModal();
                      }}
                      size="sm"
                      color="primary"
                      className="mr-10"
                    >
                      Create new Intern Undertaking
                    </Button>
                  )}

                  {intern?.intern?.addmissionform && (
                    <>
                    <CheckPermission accessRolePermission={roles?.permission} subAccess={"INTERNFORMS"} permission={"create"}>
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
                      <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </CheckPermission>

                      <div style={{ width: "100%", textAlign: "center" }}>
                        <div className="mt-2">
                          <a
                            href={intern?.intern?.addmissionfromRaw?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            Download Draft Intern Undertaking Form{" "}
                            {intern?.intern?.addmissionfromRaw
                              ? `(${new Date(
                                  intern?.intern?.addmissionfromRaw?.uploadedAt
                                ).toLocaleDateString()})`
                              : ""}
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                  {intern?.intern?.addmissionformURL?.length > 0 && (
                    <div style={{ width: "100%", textAlign: "center" }}>
                      {intern?.intern?.addmissionformURL.map((file, index) => (
                        <div key={index} className="mt-2">
                          <a
                            href={file?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            Download Signed Intern Undertaking Form {index + 1}{" "}
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
                    <div>
                      <div className="timeline-2">
                        <div className="timeline-continue">
                          <Row className="timeline-right"></Row>
                        </div>
                      </div>
                    </div>
                  </AccordionBody>
                </AccordionItem>
              </Accordion>
            </GeneralCard>
          ))}
        </Row>
      </div>
      <Modal
        isOpen={openform}
        toggle={() => {
          setOpenform(false);
        }}
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <ModalHeader
          toggle={() => {
            setOpenform(false);
          }}
        >
          Intern Undertaking Form
        </ModalHeader>
        <ModalBody style={{ height: "80vh", overflow: "auto" }}>
          {openform && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div ref={internundertakingform}>
                <InternUndertakingForm
                  register={register}
                  intern={intern?.intern}
                  details={details}
                />
              </div>
              <div ref={internundertakingform2}>
                <InternUndertakingFormPage2
                  register={register}
                  intern={intern?.intern}
                />
              </div>
              <div ref={internundertakingform3}>
                <InternUndertakingFormPage3
                  register={register}
                  intern={intern?.intern}
                  details={details}
                />
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
          )}
        </ModalBody>
      </Modal>
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
      <AdmissionformModal
        isOpen={dateModal}
        toggle={toggleModal}
        intern={intern}
        details={details}
        setDetails={setDetails}
        setOpenform={setOpenform}
        openform={openform}
        onSubmit={onSubmit}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  intern: state.Intern.intern,
});

export default connect(mapStateToProps)(InternAddmissionForms);
