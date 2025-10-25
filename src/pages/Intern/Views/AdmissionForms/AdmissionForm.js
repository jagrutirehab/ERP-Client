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

const InternAddmissionForms = (intern) => {
  const dispatch = useDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerating2, setIsGenerating2] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const togglePreview = () => setPreviewModal(!previewModal);
  const [dateModal, setDateModal] = useState(false);
  const toggleModal = () => setDateModal(!dateModal);
  const { register, handleSubmit, setValue } = useForm();
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

  //   // Apply global section styles
  //   ref.current.setAttribute(
  //     "style",
  //     `
  //     ${originalStyle};
  //     font-size: 25px !important;
  //     line-height: 2 !important;
  //   `
  //   );

  //   // 🔑 Fix for inputs: replace them with styled spans temporarily
  //   const inputs = ref.current.querySelectorAll("input");
  //   const replacedNodes = [];

  //   inputs.forEach((input) => {
  //     const span = document.createElement("span");

  //     let value = "";
  //     if (input.type === "date" && input.value) {
  //       value = new Date(input.value).toLocaleDateString("en-GB"); // DD/MM/YYYY
  //     } else {
  //       value = input.value?.toUpperCase() || "";
  //     }

  //     // If empty → use non-breaking space
  //     span.innerText = value || "\u00A0";

  //     // Apply consistent styles
  //     span.style.fontWeight = "bold";
  //     span.style.textTransform = "uppercase";
  //     span.style.borderBottom = "1px solid #000";
  //     span.style.marginLeft = "5px";

  //     // Preserve width of the original input
  //     span.style.display = "inline-block";
  //     span.style.minWidth = input.clientWidth + "px";

  //     // Save for restoring later
  //     replacedNodes.push({ input, span });
  //     input.parentNode.replaceChild(span, input);
  //   });

  //   // Wait for DOM update
  //   await new Promise((resolve) => setTimeout(resolve, 50));

  //   // Capture screenshot
  //   const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
  //   const imgData = canvas.toDataURL("image/jpeg");

  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //   if (!isFirstPage) pdf.addPage();
  //   pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

  //   // 🔄 Restore original inputs back after capture
  //   replacedNodes.forEach(({ input, span }) => {
  //     span.parentNode.replaceChild(input, span);
  //   });

  //   return pdf;
  // };

  const captureSection = async (ref, pdf, isFirstPage = false) => {
    if (!ref?.current) return pdf;
    const el = ref.current;

    // wait for fonts
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {}
    }

    // === CLONE + replace inputs with spans ===
    const clone = el.cloneNode(true);
    const inputsInClone = clone.querySelectorAll("input, textarea, select");
    inputsInClone.forEach((input) => {
      const span = document.createElement("span");
      let value = "";
      if (input.tagName.toLowerCase() === "select") value = input.value || "";
      else if (input.type === "date" && input.value)
        value = new Date(input.value).toLocaleDateString("en-GB");
      else value = input.value || input.innerText || "";

      span.innerText = value ? String(value).toUpperCase() : "\u00A0";
      span.style.fontWeight = "bold";
      span.style.textTransform = "uppercase";
      span.style.borderBottom = "1px solid #000";
      span.style.display = "inline-block";
      span.style.minWidth = "100px";
      span.style.maxWidth = "100%";
      span.style.wordBreak = "break-word";
      span.style.margin = "0 4px";
      input.parentNode.replaceChild(span, input);
    });

    // === Fix known styled elements ===
    const defaults = {
      orgName: { fontSize: "26px" },
      address: { fontSize: "18px" },
      phone: { fontSize: "18px" },
      website: { fontSize: "18px" },
    };
    Object.keys(defaults).forEach((cls) => {
      const elems = clone.querySelectorAll(`.${cls}`);
      elems.forEach((elx) => {
        Object.assign(elx.style, defaults[cls]);
      });
    });

    // wrapper
    const wrapper = document.createElement("div");
    while (clone.firstChild) wrapper.appendChild(clone.firstChild);
    clone.appendChild(wrapper);

    // Map PDF width → CSS px
    const pdfW_pts = pdf.internal.pageSize.getWidth();
    const pdfH_pts = pdf.internal.pageSize.getHeight();
    const PT_TO_PX = 96 / 72;
    const marginPts = 10;
    const marginPx = Math.round(marginPts * PT_TO_PX);
    const pdfWidthPx = Math.floor(pdfW_pts * PT_TO_PX);

    clone.style.position = "absolute";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.zIndex = "2147483647";
    clone.style.boxSizing = "border-box";
    clone.style.background = "#fff";
    clone.style.margin = "0";
    clone.style.overflow = "visible";
    clone.style.width = pdfWidthPx - marginPx * 2 + "px";

    wrapper.style.display = "block";
    wrapper.style.width = "100%";
    wrapper.style.boxSizing = "border-box";

    // improve borders & font scaling
    const BORDER_MULT = 1.3;
    const TEXT_MULT = 1.05;
    const allElems = clone.querySelectorAll("*");
    allElems.forEach((elx) => {
      const cs = window.getComputedStyle(elx);
      if (cs.fontSize) {
        const fs = parseFloat(cs.fontSize);
        if (!Number.isNaN(fs) && fs > 0) {
          elx.style.fontSize = `${Math.round(fs * TEXT_MULT)}px`;
        }
      }
      ["Top", "Right", "Bottom", "Left"].forEach((s) => {
        const val = cs[`border${s}Width`];
        if (val && val !== "0px") {
          const num = parseFloat(val) || 0;
          if (num > 0)
            elx.style[`border${s}Width`] = `${Math.max(
              1,
              num * BORDER_MULT
            )}px`;
        }
      });

      if (cs.display === "flex") {
        elx.style.flexWrap = "wrap";
        elx.style.justifyContent = "flex-start";
      }
    });

    document.body.appendChild(clone);
    await new Promise((r) => setTimeout(r, 100));

    const cloneFullHeight = Math.ceil(wrapper.scrollHeight);
    const DPR = window.devicePixelRatio || 1;
    const PREFERRED_SCALE = 2;
    let captureScale = Math.min(Math.max(1.5, DPR), PREFERRED_SCALE);

    // === Always fit whole content into one single PDF page ===
    const addCanvasAsSinglePage = (canvas, firstPageFlag) => {
      const usableWpts = pdfW_pts - marginPts * 2;
      const usableHpts = pdfH_pts - marginPts * 2;

      const cW_px = canvas.width;
      const cH_px = canvas.height;

      const fitScale = Math.min(usableWpts / cW_px, usableHpts / cH_px);

      const targetW_pts = cW_px * fitScale;
      const targetH_pts = cH_px * fitScale;

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      if (!firstPageFlag) pdf.addPage();
      pdf.addImage(
        imgData,
        "JPEG",
        marginPts,
        marginPts,
        targetW_pts,
        targetH_pts,
        undefined,
        "FAST"
      );
    };

    try {
      wrapper.style.transform = "translateY(0px)";
      clone.style.height = cloneFullHeight + "px";
      const c = await html2canvas(clone, {
        scale: captureScale,
        useCORS: true,
        backgroundColor: "#fff",
        imageTimeout: 20000,
        allowTaint: false,
        windowWidth: document.documentElement.scrollWidth,
      });
      addCanvasAsSinglePage(c, isFirstPage);
    } catch (err) {
      console.error("captureSection error:", err);
    } finally {
      try {
        document.body.removeChild(clone);
      } catch (e) {}
    }

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

  useEffect(() => {
    if (previewModal && pdfUrl && /Mobi|Android/i.test(navigator.userAgent)) {
      // On mobile → auto open system PDF viewer
      window.open(pdfUrl, "_blank");
    }
  }, [previewModal, pdfUrl]);

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
                  {/* {!intern?.intern?.addmissionform && ( */}
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
                  {/* )} */}

                  {intern?.intern?.addmissionform && (
                    <>
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
                  setValue={setValue}
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
            /Mobi|Android/i.test(navigator.userAgent) ? (
              // On mobile → show fallback message instead of iframe
              <div className="d-flex justify-content-center align-items-center h-100">
                <p className="text-muted">PDF opened in a new tab</p>
              </div>
            ) : (
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            )
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
