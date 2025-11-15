/* eslint-disable react-hooks/exhaustive-deps */
import { useForm } from "react-hook-form";
// import Page1 from "./page1";
// import Page2 from "./page2";
import Admissionpage1 from "./Admissionpage1";
import Admissionpage2 from "./Admissionpage2";
import IndependentAdmAdult from "./IndependentAdmAdult";
import IndependentAdmMinor from "./IndependentAdmMinor";
import AdmWithHighSupport from "./AdmWithHighSupport";
import SeriousnessConsent from "./SeriousnessConsent";
import MediactionConcent from "./MediactionConcent";
import ECTConsentForm from "./ECTConsentForm";
import DischargeIndependentAdult from "./DischargeIndependentAdult";
import DischargeIndependentMinor from "./DischargeIndependentMinor";
// import IndipendentOpinion1 from "./IndipendentOpinion1";
// import IndipendentOpinion2 from "./IndipendentOpinion2";
// import IndipendentOpinion3 from "./IndipendentOpinion3";
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
import { useState, useRef, useEffect } from "react";
import AdmissionformModal from "../../Modals/Admissionform.modal";
import { connect, useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { toast } from "react-toastify";
import {
  createEditChart,
  fetchCharts,
  fetchPatientById,
} from "../../../../store/actions";
import AddmissionCard from "../Components/AddmissionCard";
import IPD from "../IPD";
import AdmissionChartModal from "../../Modals/AdmissionChart.modal";
import AdmWithHighSupport2 from "./AdmWithHighSupport2";
import DishchargeformModal from "../../Modals/Dishchargeform.modal";
import ConsentformModal from "../../Modals/Consentform.modal";
import ECTConsentForm2 from "./ECTConsentForm2";
import UndertakingDischargeForm from "./UndertakingDischargeForm";
// import { Document, Page, pdfjs } from "react-pdf";
// import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js";
// pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const AddmissionForms = ({ patient, admissions, addmissionsCharts }) => {
  const dispatch = useDispatch();
  const formType = useSelector((state) => state.Chart?.chartForm?.chart);
  const [openform, setOpenform] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [dateModal2, setDateModal2] = useState(false);
  const [dateModal3, setDateModal3] = useState(false);
  const [dateModal4, setDateModal4] = useState(false);
  const [chartType, setChartType] = useState("");
  const toggleModal = () => setDateModal(!dateModal);
  const toggleModal2 = () => setDateModal2(!dateModal2);
  const toggleModal3 = () => setDateModal3(!dateModal3);
  const toggleModal4 = () => setDateModal4(!dateModal4);
  const [openform3, setOpenform3] = useState(false);
  const [openform4, setOpenform4] = useState(false);
  const [addmissionId, setAddmissionId] = useState();
  const [admissiontype, setAdmissiontype] = useState("");
  const [adultationype, setAdultationtype] = useState("");
  const [supporttype, setSupporttype] = useState("");
  const [chartData, setChartData] = useState([]);
  const [details, setDetails] = useState({
    roomtype: "",
    IPDnum: "",
    bed: "",
    ward: "",
    toPay: "",
    semiprivate: "",
    advDeposit: "",
  });

  const fileInputRef = useRef(null);
  const consentFileInputRef = useRef(null);
  const dischargeFileInputRef = useRef(null);
  const undertakingDischargeFileInputRef = useRef(null);
  // const page1Ref = useRef(null);
  // const page2Ref = useRef(null);
  const seriousnessRef = useRef(null);
  const medicationRef = useRef(null);
  const ectRef = useRef(null);
  const ectRef2 = useRef(null);
  const admission1Ref = useRef(null);
  const admission2Ref = useRef(null);
  const adultRef = useRef(null);
  const minorRef = useRef(null);
  const supportRef = useRef(null);
  // const indipendentref1 = useRef(null);
  // const indipendentref2 = useRef(null);
  // const indipendentref3 = useRef(null);
  const dischargeRefAdult = useRef(null);
  const dischargeRefMinor = useRef(null);
  const dischargeRefUndertaking = useRef(null);

  const [open, setOpen] = useState(addmissionsCharts?.length > 0 ? "0" : null);
  const toggleAccordian = (id) => {
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

  useEffect(() => {
    if (addmissionId && patient?.addmissions?.includes(addmissionId)) {
      dispatch(fetchCharts(addmissionId))
        .unwrap()
        .then((charts) => {
          // filter charts that contain detailAdmission
          const detailAdmissionCharts =
            charts.payload?.filter((c) => c.detailAdmission) || [];

          if (detailAdmissionCharts.length > 0) {
            // sort by createdAt or date to get the latest
            const latest = detailAdmissionCharts.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            setChartData(latest);
          } else {
            setChartData(null); // or []
          }
        })
        .catch((err) => {
          console.error("Error fetching charts:", err);
          setChartData(null);
        });
    }
  }, [dispatch, patient, addmissionId]);

  const { register, handleSubmit } = useForm();

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

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerating2, setIsGenerating2] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfUrl2, setPdfUrl2] = useState(null);
  const [pdfUrl3, setPdfUrl3] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewModal2, setPreviewModal2] = useState(false);
  const [previewModal3, setPreviewModal3] = useState(false);

  const togglePreview = () => setPreviewModal(!previewModal);
  const togglePreview2 = () => setPreviewModal2(!previewModal2);
  const togglePreview3 = () => setPreviewModal3(!previewModal3);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handlePrintConsent = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      await captureSection(admission1Ref, pdf, true);
      await captureSection(admission2Ref, pdf);
      await captureSection(seriousnessRef, pdf);
      await captureSection(medicationRef, pdf);
      await captureSection(ectRef, pdf);
      await captureSection(ectRef2, pdf);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      if (pdfUrl2) URL.revokeObjectURL(pdfUrl2);
      setPdfUrl2(url);
      setPreviewModal2(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadConsent = () => {
    if (!pdfUrl2) return;
    const link = document.createElement("a");
    link.href = pdfUrl2;
    link.download = `${patient?.id?.value}-${patient?.name}-consent-form.pdf`;
    link.click();
  };

  const handlePrintDischarge = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      if (dischargeRefAdult.current)
        await captureSection(dischargeRefAdult, pdf, true);
      if (dischargeRefMinor.current)
        await captureSection(dischargeRefMinor, pdf, true);
      if (dischargeRefUndertaking.current)
        await captureSection(dischargeRefUndertaking, pdf, true);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      if (pdfUrl3) URL.revokeObjectURL(pdfUrl3);
      setPdfUrl3(url);
      setPreviewModal3(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDischarge = () => {
    if (!pdfUrl3) return;
    const link = document.createElement("a");
    link.href = pdfUrl3;
    link.download = `${patient?.id?.value}-${patient?.name}-Discharge-form.pdf`;
    link.click();
  };

  const handlePrintAdmission = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      if (adultRef.current) await captureSection(adultRef, pdf, true);
      if (minorRef.current) await captureSection(minorRef, pdf, true);
      if (supportRef.current) await captureSection(supportRef, pdf, true);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      // setPdfUrl(blob);
      setPdfUrl(url);
      setPreviewModal(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAdmission = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${patient?.id?.value}-${patient?.name}-admission-form.pdf`;
    link.click();
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

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
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
  }, [dispatch, patient._id]);

  const onSubmitAdmission = async (data) => {
    setIsGenerating2(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      if (adultRef.current) await captureSection(adultRef, pdf, true);
      if (minorRef.current) await captureSection(minorRef, pdf, true);
      if (supportRef.current) await captureSection(supportRef, pdf, true);
      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append(
        "addmissionfromRaw",
        pdfBlob,
        `${patient?.id?.value}-${patient?.name}-admission-form.pdf`
      );

      await axios.patch(`/patient/admission-submit/${addmissionId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Admission form submitted successfully!");
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

  const handleConsentUploadClick = () => {
    consentFileInputRef.current.click();
  };

  const handleDischargeUploadClick = () => {
    dischargeFileInputRef.current.click();
  };

  const handleUndertakingDischargeUploadClick = () => {
    undertakingDischargeFileInputRef.current.click();
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
      formData.append("id", addmissionId);
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

  const handleFileChangeConsent = async (e) => {
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
      formData.append("consentformURL", file);
      formData.append("id", addmissionId);
      await axios.patch("/patient/consent-submit", formData, {
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

  const onSubmitConsent = async (data) => {
    setIsGenerating2(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      await captureSection(admission1Ref, pdf, true);
      await captureSection(admission2Ref, pdf);
      await captureSection(seriousnessRef, pdf);
      await captureSection(medicationRef, pdf);
      await captureSection(ectRef, pdf);
      await captureSection(ectRef2, pdf);
      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append(
        "consentfromRaw",
        pdfBlob,
        `${patient?.id?.value}-${patient?.name}-consent-form.pdf`
      );

      await axios.patch(
        `/patient/consent-submit-file/${addmissionId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Consent form submitted successfully!");
      setOpenform4(false);
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
      toast.error("Failed to submit Consent form");
    } finally {
      setIsGenerating2(false);
    }
  };

  const handleFileChangeDishcharge = async (e) => {
    console.log("correct function running");

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
      formData.append("dischargeFormURL", file);
      formData.append("id", addmissionId);
      await axios.patch("/patient/discharge-submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Signed PDF uploaded successfully!");
      setIsGenerating2(false);
    } catch (err) {
      toast.error("Upload failed");
      setIsGenerating2(false);
    }
  };

  const handleFileChangeundertakingDishcharge = async (e) => {
    console.log("incorrect is running");

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
      formData.append("undertakingdischargeFormURL", file);
      formData.append("id", addmissionId);
      await axios.patch("/patient/undertaking-submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Signed PDF uploaded successfully!");
      setIsGenerating2(false);
    } catch (err) {
      toast.error("Upload failed");
      setIsGenerating2(false);
    }
  };

  const onSubmitDischarge = async (data) => {
    setIsGenerating2(true);

    try {
      const pdf = new jsPDF("p", "pt", "a4");

      if (dischargeRefAdult.current)
        await captureSection(dischargeRefAdult, pdf, true);
      if (dischargeRefMinor.current)
        await captureSection(dischargeRefMinor, pdf, true);
      if (dischargeRefUndertaking.current)
        await captureSection(dischargeRefUndertaking, pdf, true);

      const pdfBlob = pdf.output("blob");
      const formData = new FormData();

      // ---------------------------
      // APPLY CONDITIONS HERE
      // ---------------------------
      if (admissiontype === "DISCHARGE_UNDERTAKING") {
        formData.append(
          "undertakingdischargeFormRaw",
          pdfBlob,
          `${patient?.id?.value}-${patient?.name}-undertaking-discharge-form.pdf`
        );
      } else {
        formData.append(
          "dischargeFormRaw",
          pdfBlob,
          `${patient?.id?.value}-${patient?.name}-discharge-form.pdf`
        );
      }

      // ---------------------------
      // SELECT API BASED ON CONDITION
      // ---------------------------
      const apiUrl =
        admissiontype === "DISCHARGE_UNDERTAKING"
          ? `/patient/undertaking-discharge-submit-file/${addmissionId}`
          : `/patient/discharge-submit-file/${addmissionId}`;

      await axios.patch(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Consent form submitted successfully!");
      setOpenform3(false);
      setAdmissiontype("");
      setAdultationtype("");
    } catch (error) {
      toast.error("Failed to submit Consent form");
    } finally {
      setIsGenerating2(false);
    }
  };

  useEffect(() => {
    dispatch(fetchPatientById(patient?._id));
  }, [dispatch, isGenerating2, isGenerating]);

  useEffect(() => {
    if (formType === "ADMISSION FORM") {
      if (!dateModal) toggleModal();
      setDateModal4(false);
      setDateModal3(false);
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return;
    }

    if (formType === "CONSENT FORM") {
      if (!dateModal4) toggleModal4();
      setDateModal(false);
      setDateModal3(false);
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return;
    }

    if (formType === "DISCHARGE FORM") {
      if (!dateModal3) toggleModal3();
      setDateModal4(false);
      setDateModal(false);
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formType, dispatch]);

  // useEffect(() => {
  //   if (openform4) {
  //     setDetails((prev) => ({ ...prev }));
  //   }
  // }, [openform4]);

  useEffect(() => {
    if (previewModal && pdfUrl && /Mobi|Android/i.test(navigator.userAgent)) {
      // On mobile → auto open system PDF viewer
      window.open(pdfUrl, "_blank");
    }

    if (previewModal2 && pdfUrl2 && /Mobi|Android/i.test(navigator.userAgent)) {
      // On mobile → auto open system PDF viewer
      window.open(pdfUrl2, "_blank");
    }
  }, [previewModal, pdfUrl, previewModal2, pdfUrl2]);

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
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                {/* Empty spacer for left side */}
                <div style={{ flex: 1 }}></div>

                {/* Centered button */}
                {/* {(!test?.addmissionform || !test?.consentform) && ( */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  <Button
                    onClick={() => {
                      toggleModal2();
                      setChartType(IPD);
                    }}
                    size="sm"
                  >
                    Create New Form
                  </Button>
                </div>
                {/* )} */}

                {/* Right side (expand/collapse) */}
                <div
                  className="d-flex align-items-center"
                  style={{ flex: 1, justifyContent: "flex-end" }}
                >
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
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: "30px",
                            }}
                          >
                            <div
                            // style={{
                            //   display: "flex",
                            //   flexDirection: "column",
                            //   justifyContent: "center",
                            //   alignItems: "center",
                            //   gap: "30px",
                            // }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: "30px",
                                }}
                              >
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
                                    "Upload Signed Copy Of Admission Form"
                                  )}
                                </Button>
                                {test?.addmissionfromRaw?.length > 0 && (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "center",
                                    }}
                                  >
                                    {test.addmissionfromRaw.map(
                                      (file, index) => (
                                        <div key={index} className="mt-2">
                                          <a
                                            href={file?.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                          >
                                            Download Draft Admission Form{" "}
                                            {index + 1}{" "}
                                            {file?.uploadedAt
                                              ? `(${new Date(
                                                  file.uploadedAt
                                                ).toLocaleDateString()})`
                                              : ""}
                                          </a>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
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
                                    {test.addmissionformURL.map(
                                      (file, index) => (
                                        <div key={index} className="mt-2">
                                          <a
                                            href={file?.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                          >
                                            Download Signed Admission Form{" "}
                                            {index + 1}{" "}
                                            {file?.uploadedAt
                                              ? `(${new Date(
                                                  file.uploadedAt
                                                ).toLocaleDateString()})`
                                              : ""}
                                          </a>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: "30px",
                                }}
                              >
                                <Button
                                  onClick={handleConsentUploadClick}
                                  size="sm"
                                  color="primary"
                                  className="mr-10"
                                  disabled={isGenerating2}
                                >
                                  {isGenerating2 ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    "Upload Signed Copy Of Consent Form"
                                  )}
                                </Button>
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  ref={consentFileInputRef}
                                  style={{ display: "none" }}
                                  onChange={handleFileChangeConsent}
                                />
                                {test?.consentfromRaw?.length > 0 && (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "center",
                                    }}
                                  >
                                    {test?.consentfromRaw.map((file, index) => (
                                      <div key={index} className="mt-2">
                                        <a
                                          href={file?.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-outline-primary btn-sm"
                                        >
                                          Download Draft Consent Form{" "}
                                          {index + 1}{" "}
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
                                {test?.consentformURL?.length > 0 && (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "center",
                                    }}
                                  >
                                    {test?.consentformURL.map((file, index) => (
                                      <div key={index} className="mt-2">
                                        <a
                                          href={file?.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-outline-primary btn-sm"
                                        >
                                          Download Signed Consent Form{" "}
                                          {index + 1}{" "}
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
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: "30px",
                                }}
                              >
                                <Button
                                  onClick={handleDischargeUploadClick}
                                  size="sm"
                                  color="primary"
                                  className="mr-10"
                                  disabled={isGenerating2}
                                  label="patient-discharge-form"
                                >
                                  {isGenerating2 ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    "Upload Signed Copy Of Discharge Form"
                                  )}
                                </Button>
                                <input
                                  id="patient-discharge-form"
                                  type="file"
                                  accept="application/pdf"
                                  ref={dischargeFileInputRef}
                                  className="sr-only"
                                  // style={{ display: "none" }}
                                  onChange={(e) => {
                                    console.log("Discharge Form is hitted");
                                    handleFileChangeDishcharge(e);
                                  }}
                                />
                                {test?.dischargeFormRaw?.length > 0 && (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "center",
                                    }}
                                  >
                                    {test?.dischargeFormRaw.map(
                                      (file, index) => (
                                        <div key={index} className="mt-2">
                                          <a
                                            href={file?.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                          >
                                            Download Draft Discharge Form{" "}
                                            {index + 1}{" "}
                                            {file?.uploadedAt
                                              ? `(${new Date(
                                                  file.uploadedAt
                                                ).toLocaleDateString()})`
                                              : ""}
                                          </a>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                                {test?.dischargeFormURL?.length > 0 && (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "center",
                                    }}
                                  >
                                    {test?.dischargeFormURL.map(
                                      (file, index) => (
                                        <div key={index} className="mt-2">
                                          <a
                                            href={file?.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                          >
                                            Download Signed Discharge Form{" "}
                                            {index + 1}{" "}
                                            {file?.uploadedAt
                                              ? `(${new Date(
                                                  file.uploadedAt
                                                ).toLocaleDateString()})`
                                              : ""}
                                          </a>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: "30px",
                                }}
                              >
                                <Button
                                  onClick={
                                    handleUndertakingDischargeUploadClick
                                  }
                                  size="sm"
                                  color="primary"
                                  className="mr-10"
                                  disabled={isGenerating2}
                                >
                                  {isGenerating2 ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    "Upload Signed Copy Of Undertaking Discharge Form"
                                  )}
                                </Button>
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  ref={undertakingDischargeFileInputRef}
                                  className="sr-only"
                                  // style={{ display: "none" }}
                                  onChange={(e) => {
                                    console.log("incorrect is hitted");
                                    handleFileChangeundertakingDishcharge(e);
                                  }}
                                />
                                {test?.undertakingdischargeFormRaw?.length >
                                  0 && (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "center",
                                    }}
                                  >
                                    {test?.undertakingdischargeFormRaw.map(
                                      (file, index) => (
                                        <div key={index} className="mt-2">
                                          <a
                                            href={file?.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                          >
                                            Download Draft Undertaking Discharge
                                            Form {index + 1}{" "}
                                            {file?.uploadedAt
                                              ? `(${new Date(
                                                  file.uploadedAt
                                                ).toLocaleDateString()})`
                                              : ""}
                                          </a>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                                {test?.undertakingdischargeFormURL?.length >
                                  0 && (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "center",
                                    }}
                                  >
                                    {test?.undertakingdischargeFormURL.map(
                                      (file, index) => (
                                        <div key={index} className="mt-2">
                                          <a
                                            href={file?.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                          >
                                            Download Signed Undertaking
                                            Discharge Form {index + 1}{" "}
                                            {file?.uploadedAt
                                              ? `(${new Date(
                                                  file.uploadedAt
                                                ).toLocaleDateString()})`
                                              : ""}
                                          </a>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionBody>
                </AccordionItem>
              </Accordion>
            </AddmissionCard>
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
          Admission Form
        </ModalHeader>
        <ModalBody style={{ height: "80vh", overflow: "auto" }}>
          {openform === true ? (
            <form onSubmit={handleSubmit(onSubmitAdmission)}>
              {/* common start */}
              {/* <div ref={page1Ref}>
            <Page1
              register={register}
              admissions={admissions}
              patient={patient}
            />
          </div>
          <div ref={page2Ref}>
            <Page2 register={register} patient={patient} />
          </div>
          {/* common end */}
              {/* for adult */}
              {admissiontype === "INDEPENDENT_ADMISSION" &&
                adultationype === "ADULT" && (
                  <div ref={adultRef}>
                    <IndependentAdmAdult
                      register={register}
                      chartData={chartData}
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
                      chartData={chartData}
                      patient={patient}
                      details={details}
                    />
                  </div>
                )}
              {/* support form */}
              {admissiontype === "SUPPORTIVE_ADMISSION" &&
                supporttype === "UPTO30DAYS" && (
                  <div ref={supportRef}>
                    <AdmWithHighSupport
                      register={register}
                      chartData={chartData}
                      patient={patient}
                      details={details}
                    />
                  </div>
                )}
              {admissiontype === "SUPPORTIVE_ADMISSION" &&
                supporttype === "BEYOND30DAYS" && (
                  <div ref={supportRef}>
                    <AdmWithHighSupport2
                      register={register}
                      chartData={chartData}
                      patient={patient}
                      details={details}
                    />
                  </div>
                )}
              {/* hidden opinions */}
              {/* <div
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
              </div> */}
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
                  onClick={handlePrintAdmission}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Spinner size="sm" /> : "Print PDF"}
                </Button>
                <Button
                  style={{ marginLeft: "8px" }}
                  color="secondary"
                  className="me-2"
                  disabled={isGenerating2}
                  onClick={() => {
                    setOpenform(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </form>
          ) : (
            ""
          )}
        </ModalBody>
      </Modal>
      <Modal
        isOpen={openform4}
        toggle={() => {
          setOpenform4(false);
        }}
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <ModalHeader
          toggle={() => {
            setOpenform4(false);
          }}
        >
          Consent Form
        </ModalHeader>
        <ModalBody style={{ height: "80vh", overflow: "auto" }}>
          {openform4 === true ? (
            <form onSubmit={handleSubmit(onSubmitConsent)}>
              <div ref={admission1Ref}>
                <Admissionpage1
                  register={register}
                  chartData={chartData}
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
              <div ref={ectRef2}>
                <ECTConsentForm2
                  register={register}
                  patient={patient}
                  admissions={admissions}
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
                  onClick={handlePrintConsent}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Spinner size="sm" /> : "Print PDF"}
                </Button>
                <Button
                  style={{ marginLeft: "8px" }}
                  color="secondary"
                  className="me-2"
                  disabled={isGenerating2}
                  onClick={() => {
                    setOpenform4(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </form>
          ) : (
            ""
          )}
        </ModalBody>
      </Modal>
      <Modal
        isOpen={openform3}
        toggle={() => {
          setOpenform3(false);
        }}
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <ModalHeader
          toggle={() => {
            setOpenform3(false);
          }}
        >
          Discharge Form
        </ModalHeader>
        <ModalBody style={{ height: "80vh", overflow: "auto" }}>
          {openform3 === true ? (
            <form onSubmit={handleSubmit(onSubmitDischarge)}>
              {admissiontype === "INDEPENDENT_ADMISSION" &&
                adultationype === "ADULT" && (
                  <div ref={dischargeRefAdult}>
                    <DischargeIndependentAdult
                      register={register}
                      admissions={admissions[0]}
                      patient={patient}
                    />
                  </div>
                )}{" "}
              {/* for minor */}{" "}
              {admissiontype === "INDEPENDENT_ADMISSION" &&
                adultationype === "MINOR" && (
                  <div ref={dischargeRefMinor}>
                    <DischargeIndependentMinor
                      register={register}
                      admissions={admissions[0]}
                      patient={patient}
                    />
                  </div>
                )}
              {/* Undertaking Discharge */}{" "}
              {admissiontype === "DISCHARGE_UNDERTAKING" && (
                <div ref={dischargeRefUndertaking}>
                  <UndertakingDischargeForm
                    register={register}
                    admissions={admissions[0]}
                    patient={patient}
                  />
                </div>
              )}
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
                  onClick={handlePrintDischarge}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Spinner size="sm" /> : "Print PDF"}
                </Button>
              </div>
            </form>
          ) : (
            ""
          )}
        </ModalBody>
      </Modal>

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
            /Mobi|Android/i.test(navigator.userAgent) ? (
              // On mobile → show fallback message instead of iframe
              <div className="d-flex justify-content-center align-items-center h-100">
                <p className="text-muted">PDF opened in a new tab</p>
              </div>
            ) : (
              // On desktop → show inside iframe
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
          <Button color="primary" onClick={handleDownloadAdmission}>
            Download
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={previewModal2}
        toggle={togglePreview2}
        size="xl"
        style={{ maxWidth: "90%" }}
      >
        <ModalHeader toggle={togglePreview2}>PDF Preview</ModalHeader>
        <ModalBody style={{ height: "80vh" }}>
          {pdfUrl2 ? (
            /Mobi|Android/i.test(navigator.userAgent) ? (
              // On mobile → show fallback message instead of iframe
              <div className="d-flex justify-content-center align-items-center h-100">
                <p className="text-muted">PDF opened in a new tab</p>
              </div>
            ) : (
              // On desktop → show inside iframe
              <iframe
                src={pdfUrl2}
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
          <Button color="secondary" onClick={togglePreview2} className="me-2">
            Close
          </Button>
          <Button color="primary" onClick={handleDownloadConsent}>
            Download
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={previewModal3}
        toggle={togglePreview3}
        size="xl"
        style={{ maxWidth: "90%" }}
      >
        <ModalHeader toggle={togglePreview3}>PDF Preview</ModalHeader>
        <ModalBody style={{ height: "80vh" }}>
          {pdfUrl3 ? (
            /Mobi|Android/i.test(navigator.userAgent) ? (
              // On mobile → show fallback message instead of iframe
              <div className="d-flex justify-content-center align-items-center h-100">
                <p className="text-muted">PDF opened in a new tab</p>
              </div>
            ) : (
              // On desktop → show inside iframe
              <iframe
                src={pdfUrl3}
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
          <Button color="secondary" onClick={togglePreview3} className="me-2">
            Close
          </Button>
          <Button color="primary" onClick={handleDownloadDischarge}>
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
      />

      <DishchargeformModal
        isOpen={dateModal3}
        toggle={toggleModal3}
        admissiontype={admissiontype}
        setAdmissiontype={setAdmissiontype}
        adultationype={adultationype}
        setAdultationtype={setAdultationtype}
        supporttype={supporttype}
        setSupporttype={setSupporttype}
        setOpenform3={setOpenform3}
        openform3={openform3}
      />

      <ConsentformModal
        isOpen={dateModal4}
        toggle={toggleModal4}
        admissiontype={admissiontype}
        details={details}
        setDetails={setDetails}
        setOpenform={setOpenform4}
        openform={openform4}
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
  charts: state.Chart.charts,
});

export default connect(mapStateToProps)(AddmissionForms);
