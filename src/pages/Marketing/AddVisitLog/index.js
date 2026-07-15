import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Input,
  Label,
  FormFeedback,
  Button,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { createVisitLog, searchDoctors } from "../../../helpers/backend_helper";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const STEPS = [
  { key: "visit", label: "Visit Details" },
  { key: "doctor", label: "Doctor & Clinic" },
  { key: "collateral", label: "Collateral" },
  { key: "discussion", label: "Discussion" },
  { key: "photo", label: "Photo Proof" },
  { key: "review", label: "Review & Submit" },
];

const INTEREST_OPTIONS = [
  { value: "HOT", label: "Hot" },
  { value: "WARM", label: "Warm" },
  { value: "COLD", label: "Cold" },
];

const AddVisitLog = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const { hasPermission } = usePermissions(token);
  const canWrite = hasPermission("MARKETING", "ADD_VISIT_LOG", "WRITE");
  const [activeStep, setActiveStep] = useState(0);
  const [gps, setGps] = useState({
    lat: null,
    lng: null,
    error: null,
    updatedAt: null,
  });
  const [gpsRefreshing, setGpsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  //Selfie live camera only
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [clinicPhotoFile, setClinicPhotoFile] = useState(null);
  const [clinicPhotoPreview, setClinicPhotoPreview] = useState(null);
  const [clinicCameraOpen, setClinicCameraOpen] = useState(false);
  const [clinicFacingMode, setClinicFacingMode] = useState("environment");
  const clinicVideoRef = useRef(null);
  const clinicCanvasRef = useRef(null);
  const clinicStreamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  //Collateral proof
  const [collateralProofFiles, setCollateralProofFiles] = useState({
    pricing: null,
    centre: null,
  });
  const [collateralProofPreviews, setCollateralProofPreviews] = useState({
    pricing: null,
    centre: null,
  });
  const pricingProofInputRef = useRef(null);
  const centreProofInputRef = useRef(null);

  //Doctor search repeat visit
  const [doctorQuery, setDoctorQuery] = useState("");
  const [doctorResults, setDoctorResults] = useState([]);
  const [doctorSearching, setDoctorSearching] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(false);
  const doctorSearchTimeout = useRef(null);

  const fetchLocation = (isManualRefresh = false) => {
    if (!navigator.geolocation) {
      setGps((g) => ({
        ...g,
        error: "Geolocation not supported on this device",
      }));
      return;
    }
    if (isManualRefresh) setGpsRefreshing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          updatedAt: new Date(),
        });
        if (isManualRefresh) {
          setGpsRefreshing(false);
          toast.success("Location updated");
        }
      },
      () => {
        setGps((g) => ({
          ...g,
          error: "Location permission denied. Please enable GPS.",
        }));
        if (isManualRefresh) {
          setGpsRefreshing(false);
          toast.error("Couldn't fetch location. Check GPS permission.");
        }
      },
      { enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    fetchLocation(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      areaLocality: "",
      doctorName: "",
      clinicName: "",
      contactNumber: "",
      specialisation: "",
      visitType: "",
      metWith: "",
      collateralGiven: "",
      pricingBrochure: false,
      centreBrochure: false,
      visitNotes: "",
      interestLevel: "",
      commissionDiscussed: "",
      commissionPercentage: "",
      nextFollowUpDate: "",
    },
    validationSchema: Yup.object({
      areaLocality: Yup.string().required("Area / locality is required"),
      doctorName: Yup.string().required("Doctor name is required"),
      clinicName: Yup.string().required("Clinic name is required"),
      contactNumber: Yup.string()
        .length(10, "Must be exactly 10 digits")
        .required("Contact number is required"),
      specialisation: Yup.string().required("Specialisation is required"),
      visitType: Yup.string().required("Visit type is required"),
      metWith: Yup.string().required("Please select who you met"),
      collateralGiven: Yup.string().required("Please select Yes or No"),
      pricingBrochure: Yup.boolean().when("collateralGiven", {
        is: "true",
        then: (schema) =>
          schema.test(
            "at-least-one",
            "Select at least one collateral type",
            function (value) {
              return value || this.parent.centreBrochure;
            },
          ),
      }),
      visitNotes: Yup.string()
        .min(20, "Visit notes must be at least 2 lines long")
        .required("Visit notes are required"),
      interestLevel: Yup.string().required("Interest level is required"),
      commissionDiscussed: Yup.string().required("Please select Yes or No"),
      commissionPercentage: Yup.number()
        .min(0, "Must be between 0-100")
        .max(100, "Must be between 0-100")
        .when("commissionDiscussed", {
          is: "true",
          then: (schema) => schema.required("Enter commission percentage"),
        }),
    }),
    onSubmit: async (values) => {
      if (!gps.lat || !gps.lng) {
        toast.error("GPS location not available. Please enable location.");
        return;
      }
      if (!selfieFile) {
        toast.error("Selfie photo proof is required");
        setActiveStep(4);
        return;
      }

      if (!clinicPhotoFile) {
        toast.error("Clinic/hospital photo is required");
        setActiveStep(4);
        return;
      }

      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("gps[lat]", gps.lat);
        formData.append("gps[lng]", gps.lng);
        formData.append("areaLocality", values.areaLocality);
        formData.append("doctor[name]", values.doctorName);
        formData.append("doctor[clinicName]", values.clinicName);
        formData.append("doctor[contactNumber]", values.contactNumber);
        formData.append("doctor[specialisation]", values.specialisation);
        formData.append("visitType", values.visitType);
        formData.append("metWith", values.metWith);
        formData.append("collateral[given]", values.collateralGiven);
        formData.append("collateral[pricingBrochure]", values.pricingBrochure);
        formData.append("collateral[centreBrochure]", values.centreBrochure);
        formData.append("visitNotes", values.visitNotes);
        formData.append("interestLevel", values.interestLevel);
        formData.append("commissionDiscussed", values.commissionDiscussed);
        if (
          values.commissionDiscussed === "true" &&
          values.commissionPercentage
        ) {
          formData.append("commissionPercentage", values.commissionPercentage);
        }
        if (values.nextFollowUpDate) {
          formData.append("nextFollowUpDate", values.nextFollowUpDate);
        }
        formData.append("selfie", selfieFile, "selfie.jpg");
        formData.append("clinicPhoto", clinicPhotoFile, "clinic.jpg");
        if (collateralProofFiles.pricing) {
          formData.append(
            "collateralProofPricing",
            collateralProofFiles.pricing,
          );
        }
        if (collateralProofFiles.centre) {
          formData.append("collateralProofCentre", collateralProofFiles.centre);
        }

        await createVisitLog(formData);
        toast.success("Visit logged successfully");
        validation.resetForm();
        setSelfieFile(null);
        setSelfiePreview(null);
        setClinicPhotoFile(null);
        setClinicPhotoPreview(null);
        setCollateralProofFiles({ pricing: null, centre: null });
        setCollateralProofPreviews({ pricing: null, centre: null });
        setSelectedDoctor(null);
        setDoctorQuery("");
        setActiveStep(0);
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to submit visit log",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  //LIVE CAMERA
  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      setCameraError(
        "Camera access denied or unavailable. Please allow camera permission.",
      );
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };
  const openClinicCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: clinicFacingMode },
        audio: false,
      });
      clinicStreamRef.current = stream;
      setClinicCameraOpen(true);
      setTimeout(() => {
        if (clinicVideoRef.current) {
          clinicVideoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      toast.error("Camera access denied or unavailable.");
    }
  };

  const closeClinicCamera = () => {
    if (clinicStreamRef.current) {
      clinicStreamRef.current.getTracks().forEach((t) => t.stop());
      clinicStreamRef.current = null;
    }
    setClinicCameraOpen(false);
  };
  const switchClinicCamera = () => {
    if (clinicStreamRef.current) {
      clinicStreamRef.current.getTracks().forEach((t) => t.stop());
      clinicStreamRef.current = null;
    }
    setClinicFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (clinicCameraOpen) {
      openClinicCamera();
    }
  }, [clinicFacingMode]);

  const captureClinicPhoto = () => {
    const video = clinicVideoRef.current;
    const canvas = clinicCanvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setClinicPhotoFile(blob);
          setClinicPhotoPreview(URL.createObjectURL(blob));
        }
      },
      "image/jpeg",
      0.9,
    );
    closeClinicCamera();
  };

  const retakeClinicPhoto = () => {
    setClinicPhotoFile(null);
    setClinicPhotoPreview(null);
    openClinicCamera();
  };

  const switchCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (cameraOpen) {
      openCamera();
    }
  }, [facingMode]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setSelfieFile(blob);
          setSelfiePreview(URL.createObjectURL(blob));
        }
      },
      "image/jpeg",
      0.9,
    );

    closeCamera();
  };

  const retakePhoto = () => {
    setSelfieFile(null);
    setSelfiePreview(null);
    openCamera();
  };

  // COLLATERAL PROOF
  const handleCollateralProofChange = (type, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCollateralProofFiles((f) => ({ ...f, [type]: file }));
      setCollateralProofPreviews((p) => ({
        ...p,
        [type]: URL.createObjectURL(file),
      }));
    }
  };

  const removeCollateralProof = (type) => {
    setCollateralProofFiles((f) => ({ ...f, [type]: null }));
    setCollateralProofPreviews((p) => ({ ...p, [type]: null }));
  };

  // repeat visit
  const handleDoctorQueryChange = (val) => {
    setDoctorQuery(val);
    setSelectedDoctor(null);
    if (doctorSearchTimeout.current) clearTimeout(doctorSearchTimeout.current);

    if (val.trim().length < 2) {
      setDoctorResults([]);
      return;
    }

    doctorSearchTimeout.current = setTimeout(async () => {
      setDoctorSearching(true);
      try {
        const res = await searchDoctors(val);
        const data = res?.payload || res?.data?.payload || [];
        setDoctorResults(data);
      } catch (err) {
        setDoctorResults([]);
      } finally {
        setDoctorSearching(false);
      }
    }, 400);
  };

  const pickDoctor = (doc) => {
    setSelectedDoctor(doc);
    setEditingDoctor(false);
    setDoctorResults([]);
    setDoctorQuery(doc.name);
    validation.setFieldValue("doctorName", doc.name);
    validation.setFieldValue("clinicName", doc.clinicName);
    validation.setFieldValue("contactNumber", doc.contactNumber);
    validation.setFieldValue("specialisation", doc.specialisation);
  };

  const clearSelectedDoctor = () => {
    setSelectedDoctor(null);
    setEditingDoctor(false);
    setDoctorQuery("");
    validation.setFieldValue("doctorName", "");
    validation.setFieldValue("clinicName", "");
    validation.setFieldValue("contactNumber", "");
    validation.setFieldValue("specialisation", "");
  };

  const stepHasError = (idx) => {
    const t = validation.touched;
    const err = validation.errors;
    if (idx === 0) return t.areaLocality && err.areaLocality;
    if (idx === 1)
      return (
        (t.doctorName && err.doctorName) ||
        (t.clinicName && err.clinicName) ||
        (t.contactNumber && err.contactNumber) ||
        (t.specialisation && err.specialisation) ||
        (t.visitType && err.visitType) ||
        (t.metWith && err.metWith)
      );
    if (idx === 2)
      return t.collateralGiven && (err.collateralGiven || err.pricingBrochure);
    if (idx === 3)
      return (
        (t.visitNotes && err.visitNotes) ||
        (t.interestLevel && err.interestLevel)
      );
    return false;
  };

  const STEP_FIELDS = [
    ["areaLocality"],
    [
      "doctorName",
      "clinicName",
      "contactNumber",
      "specialisation",
      "visitType",
      "metWith",
    ],
    ["collateralGiven", "pricingBrochure"],
    [
      "visitNotes",
      "interestLevel",
      "commissionDiscussed",
      "commissionPercentage",
    ],
    [],
    [],
  ];

  const validateCurrentStep = async () => {
    if (activeStep === 4 && !selfieFile) {
      toast.error("Please take a live selfie before continuing");
      return false;
    }

    const errors = await validation.validateForm();
    const fieldsToCheck = STEP_FIELDS[activeStep];

    const touchedPatch = {};
    fieldsToCheck.forEach((f) => (touchedPatch[f] = true));
    validation.setTouched({ ...validation.touched, ...touchedPatch });

    const firstErrorField = fieldsToCheck.find((f) => errors[f]);
    if (firstErrorField) {
      toast.error(errors[firstErrorField]);
      return false;
    }
    return true;
  };

  const goNext = async () => {
    const ok = await validateCurrentStep();
    if (ok && activeStep < STEPS.length - 1) setActiveStep(activeStep + 1);
  };

  const goBack = () => {
    if (cameraOpen) closeCamera();
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const goToStep = (idx) => {
    if (cameraOpen) closeCamera();
    setActiveStep(idx);
  };

  const handleFinalSubmit = async () => {
    if (!gps.lat || !gps.lng) {
      toast.error(
        "GPS location not available. Please enable location and reload the page.",
      );
      return;
    }
    if (!selfieFile) {
      toast.error("Selfie photo proof is required");
      setActiveStep(4);
      return;
    }
    if (!clinicPhotoFile) {
      toast.error("Clinic/hospital photo is required");
      setActiveStep(4);
      return;
    }

    const errors = await validation.validateForm();
    for (let i = 0; i < STEP_FIELDS.length; i++) {
      const badField = STEP_FIELDS[i].find((f) => errors[f]);
      if (badField) {
        const touchedPatch = {};
        STEP_FIELDS[i].forEach((f) => (touchedPatch[f] = true));
        validation.setTouched({ ...validation.touched, ...touchedPatch });
        toast.error(errors[badField]);
        setActiveStep(i);
        return;
      }
    }

    validation.submitForm();
  };

  return (
    <div className="visit-log-wizard p-3 p-lg-4 bg-white">
      <style>{`
        .visit-log-wizard {
          --vlw-primary: #3577f1;
          --vlw-success: #0ab39c;
          --vlw-border: #e5e7eb;
          --vlw-muted: #8a92a6;
          --vlw-surface: #f8f9fb;
          --vlw-ink: #2a2f3c;
        }

        .visit-log-wizard .form-control,
        .visit-log-wizard .form-select {
          font-size: 16px;
          border-color: var(--vlw-border);
          height: 46px;
        }
        .visit-log-wizard textarea.form-control { height: auto; }
        .visit-log-wizard .form-control:focus,
        .visit-log-wizard .form-select:focus {
          border-color: var(--vlw-primary);
          box-shadow: 0 0 0 3px rgba(53,119,241,0.1);
        }

        .visit-log-wizard .field-group { margin-bottom: 1.75rem; }
        .visit-log-wizard .field-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--vlw-ink);
          display: block;
          margin-bottom: 8px;
        }
        .visit-log-wizard .field-required { color: #f06548; }
        .visit-log-wizard .field-hint {
          font-size: 12.5px;
          color: var(--vlw-muted);
          margin-top: 8px;
        }

        .visit-log-wizard .wizard-card {
          border: 1px solid var(--vlw-border);
        }
        .visit-log-wizard .wizard-card-body {
          padding: 1.5rem;
        }
        @media (min-width: 992px) {
          .visit-log-wizard .wizard-card-body {
            padding: 3rem 3.5rem;
          }
        }

        .visit-log-wizard .wizard-title { font-size: 20px; font-weight: 600; margin: 0; }
        .visit-log-wizard .wizard-subtitle { font-size: 14px; color: var(--vlw-muted); margin: 4px 0 0; }

        .visit-log-wizard .gps-card {
          margin-top: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          border: 1px solid var(--vlw-border);
          background: var(--vlw-surface);
          border-radius: 8px;
          padding: 10px 12px;
        }
        .visit-log-wizard .gps-card.is-ok {
          border-color: rgba(10,179,156,0.35);
          background: rgba(10,179,156,0.05);
        }
        .visit-log-wizard .gps-card.is-warn {
          border-color: rgba(240,101,72,0.35);
          background: rgba(240,101,72,0.05);
        }
        .visit-log-wizard .gps-card-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--vlw-muted);
          min-width: 0;
        }
        .visit-log-wizard .gps-card.is-ok .gps-card-info { color: var(--vlw-success); }
        .visit-log-wizard .gps-card.is-warn .gps-card-info { color: #c04a35; }
        .visit-log-wizard .gps-card-icon { font-size: 16px; display: flex; flex-shrink: 0; }
        .visit-log-wizard .gps-card-time { color: var(--vlw-muted); }
        .visit-log-wizard .gps-refresh-btn {
          font-size: 12.5px;
          font-weight: 500;
          padding: 6px 12px;
          min-height: 32px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* ---- Mobile progress ---- */
        .visit-log-wizard .mobile-progress-track {
          height: 4px;
          border-radius: 99px;
          background: var(--vlw-border);
          overflow: hidden;
        }
        .visit-log-wizard .mobile-progress-fill {
          height: 100%;
          background: var(--vlw-primary);
          border-radius: 99px;
          transition: width .25s ease;
        }

        /* ---- Desktop stepper ---- */
        .visit-log-wizard .stepper-item {
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 0 0 12px 0;
          flex: 1;
          text-align: left;
          border-bottom: 2px solid var(--vlw-border);
        }
        .visit-log-wizard .stepper-item.is-active { border-bottom-color: var(--vlw-primary); }
        .visit-log-wizard .stepper-item.is-done { border-bottom-color: var(--vlw-success); }
        .visit-log-wizard .stepper-num {
          font-size: 12px;
          color: var(--vlw-muted);
          font-weight: 600;
        }
        .visit-log-wizard .stepper-item.is-active .stepper-num { color: var(--vlw-primary); }
        .visit-log-wizard .stepper-item.is-done .stepper-num { color: var(--vlw-success); }
        .visit-log-wizard .stepper-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--vlw-muted);
          display: block;
          margin-top: 2px;
          white-space: nowrap;
        }
        .visit-log-wizard .stepper-item.is-active .stepper-label { color: var(--vlw-ink); }
        .visit-log-wizard .stepper-item.is-done .stepper-label { color: var(--vlw-ink); }

        /* ---- Choice controls ---- */
        .visit-log-wizard .choice-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .visit-log-wizard .choice-btn {
          cursor: pointer;
          border-radius: 8px;
          border: 1px solid var(--vlw-border);
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: var(--vlw-ink);
          background: #fff;
        }
        .visit-log-wizard .choice-btn.is-active {
          border-color: var(--vlw-primary);
          background: rgba(53,119,241,0.06);
          color: var(--vlw-primary);
        }

        /* ---- Doctor search ---- */
        .visit-log-wizard .doctor-result-item {
          cursor: pointer;
          padding: 12px 14px;
        }
        .visit-log-wizard .doctor-result-item:hover { background: var(--vlw-surface); }
        .visit-log-wizard .doctor-panel {
          border-radius: 8px;
          border: 1px solid var(--vlw-border);
          padding: 16px;
        }
        .visit-log-wizard .doctor-panel.is-selected { border-color: var(--vlw-success); background: rgba(10,179,156,0.04); }

        /* ---- Upload ---- */
        .visit-log-wizard .upload-zone {
          border: 1px dashed var(--vlw-border);
          border-radius: 8px;
          background: var(--vlw-surface);
          padding: 16px;
        }

        /* ---- Review ---- */
        .visit-log-wizard .review-section { margin-bottom: 2rem; }
        .visit-log-wizard .review-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--vlw-border);
        }
        .visit-log-wizard .review-section-title { font-size: 14px; font-weight: 600; color: var(--vlw-ink); }
        .visit-log-wizard .review-row {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 16px;
          font-size: 14px;
          padding: 6px 0;
        }
        .visit-log-wizard .review-row dt { color: var(--vlw-muted); }
        .visit-log-wizard .review-row dd { margin: 0; color: var(--vlw-ink); font-weight: 500; }
        @media (max-width: 480px) {
          .visit-log-wizard .review-row { grid-template-columns: 1fr; gap: 2px; }
        }

        /* ---- Nav ---- */
        .visit-log-wizard .wizard-nav {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--vlw-border);
        }
        @media (max-width: 767px) {
          .visit-log-wizard .wizard-nav {
            position: sticky;
            bottom: 0;
            background: #fff;
            margin: 2rem -1.5rem 0;
            padding: 1rem 1.5rem calc(1rem + env(safe-area-inset-bottom));
            border-top: 1px solid var(--vlw-border);
          }
        }
        .visit-log-wizard .btn {
          min-height: 44px;
          font-weight: 500;
          border-radius: 8px;
          font-size: 14px;
        }
      `}</style>

      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          <Card className="wizard-card shadow-none mb-0">
            <CardBody className="wizard-card-body">
              {/* ---- Header ---- */}
              <div>
                <h4 className="wizard-title">Add Visit Log</h4>
                <p className="wizard-subtitle">
                  Record a field visit to a doctor or clinic
                </p>

                <div
                  className={
                    "gps-card " +
                    (gps.error ? "is-warn" : gps.lat ? "is-ok" : "")
                  }
                >
                  <div className="gps-card-info">
                    <span className="gps-card-icon">
                      {gps.error ? (
                        <i className="bx bx-error" />
                      ) : gps.lat ? (
                        <i className="bx bx-check-circle" />
                      ) : (
                        <i className="bx bx-loader-alt bx-spin" />
                      )}
                    </span>
                    <span>
                      {gps.error && gps.error}
                      {!gps.error && !gps.lat && "Fetching your location…"}
                      {gps.lat && gps.lng && (
                        <>
                          Location verified &middot; {gps.lat.toFixed(5)},{" "}
                          {gps.lng.toFixed(5)}
                          {gps.updatedAt && (
                            <span className="gps-card-time">
                              {" "}
                              &middot; updated{" "}
                              {gps.updatedAt.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    color="light"
                    className="gps-refresh-btn"
                    onClick={() => fetchLocation(true)}
                    disabled={gpsRefreshing}
                  >
                    <i
                      className={
                        "bx bx-refresh" + (gpsRefreshing ? " bx-spin" : "")
                      }
                    />
                    {gpsRefreshing ? "Refreshing…" : "Refresh"}
                  </Button>
                </div>
              </div>

              {/* Step indicator MOBILE */}
              <div className="d-md-none mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold fs-14">
                    {STEPS[activeStep].label}
                  </span>
                  <span className="text-muted fs-13">
                    {activeStep + 1} / {STEPS.length}
                  </span>
                </div>
                <div className="mobile-progress-track">
                  <div
                    className="mobile-progress-fill"
                    style={{
                      width: `${((activeStep + 1) / STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Step indicator: DESKTOP */}
              <div className="d-none d-md-flex mt-4 gap-2">
                {STEPS.map((step, idx) => (
                  <button
                    key={step.key}
                    type="button"
                    className={
                      "stepper-item " +
                      (idx === activeStep
                        ? "is-active "
                        : idx < activeStep
                          ? "is-done"
                          : "")
                    }
                    onClick={() => goToStep(idx)}
                  >
                    <span className="stepper-num">
                      {String(idx + 1).padStart(2, "0")}
                      {stepHasError(idx) && (
                        <i className="bx bx-error-circle text-danger ms-1" />
                      )}
                    </span>
                    <span className="stepper-label">{step.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-2">
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* ---- STEP 0: VISIT DETAILS ---- */}
                  {activeStep === 0 && (
                    <Row>
                      <Col xs={12} lg={7}>
                        <div className="field-group">
                          <Label className="field-label">
                            Area / Locality{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <Input
                            name="areaLocality"
                            placeholder="e.g. Lajpat Nagar, Sector 14 Gurugram"
                            value={validation.values.areaLocality}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.areaLocality &&
                              !!validation.errors.areaLocality
                            }
                            autoFocus
                          />
                          <FormFeedback>
                            {validation.errors.areaLocality}
                          </FormFeedback>
                          <div className="field-hint">
                            Helps map your visit coverage across the territory
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )}

                  {/* {STEP 1 DOCTOR & CLINIC } */}
                  {activeStep === 1 && (
                    <Row>
                      <Col xs={12} lg={6}>
                        <div className="field-group">
                          <Label className="field-label">
                            New or Repeat Visit?{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <Input
                            type="select"
                            name="visitType"
                            value={validation.values.visitType}
                            onChange={(e) => {
                              validation.handleChange(e);
                              clearSelectedDoctor();
                            }}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.visitType &&
                              !!validation.errors.visitType
                            }
                          >
                            <option value="" disabled hidden>
                              Choose here
                            </option>
                            <option value="FIRST_VISIT">First Visit</option>
                            <option value="REPEAT_VISIT">Repeat Visit</option>
                          </Input>
                          <FormFeedback>
                            {validation.errors.visitType}
                          </FormFeedback>
                        </div>
                      </Col>

                      <Col xs={12} lg={6}>
                        <div className="field-group">
                          <Label className="field-label">
                            Who Did You Meet?{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <Input
                            type="select"
                            name="metWith"
                            value={validation.values.metWith}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.metWith &&
                              !!validation.errors.metWith
                            }
                          >
                            <option value="" disabled hidden>
                              Choose here
                            </option>
                            <option value="DOCTOR_DIRECTLY">
                              Doctor Directly
                            </option>
                            <option value="RECEPTIONIST">Receptionist</option>
                            <option value="STAFF">Staff</option>
                          </Input>
                          <FormFeedback>
                            {validation.errors.metWith}
                          </FormFeedback>
                        </div>
                      </Col>

                      {/*  FIRST VISIT manual entry */}
                      {validation.values.visitType === "FIRST_VISIT" && (
                        <>
                          <Col xs={12} lg={6}>
                            <div className="field-group">
                              <Label className="field-label">
                                Doctor Name{" "}
                                <span className="field-required">*</span>
                              </Label>
                              <Input
                                name="doctorName"
                                value={validation.values.doctorName}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.doctorName &&
                                  !!validation.errors.doctorName
                                }
                              />
                              <FormFeedback>
                                {validation.errors.doctorName}
                              </FormFeedback>
                            </div>
                          </Col>
                          <Col xs={12} lg={6}>
                            <div className="field-group">
                              <Label className="field-label">
                                Clinic / Hospital Name{" "}
                                <span className="field-required">*</span>
                              </Label>
                              <Input
                                name="clinicName"
                                value={validation.values.clinicName}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.clinicName &&
                                  !!validation.errors.clinicName
                                }
                              />
                              <FormFeedback>
                                {validation.errors.clinicName}
                              </FormFeedback>
                            </div>
                          </Col>
                          <Col xs={12} lg={6}>
                            <div className="field-group">
                              <Label className="field-label">
                                Phone Number{" "}
                                <span className="field-required">*</span>
                              </Label>
                              <Input
                                name="contactNumber"
                                value={validation.values.contactNumber}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.contactNumber &&
                                  !!validation.errors.contactNumber
                                }
                                maxLength={10}
                                inputMode="numeric"
                              />
                              <FormFeedback>
                                {validation.errors.contactNumber}
                              </FormFeedback>
                            </div>
                          </Col>
                          <Col xs={12} lg={6}>
                            <div className="field-group">
                              <Label className="field-label">
                                Specialisation{" "}
                                <span className="field-required">*</span>
                              </Label>
                              <Input
                                name="specialisation"
                                placeholder="e.g. Psychiatrist, Neurologist, GP"
                                value={validation.values.specialisation}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.specialisation &&
                                  !!validation.errors.specialisation
                                }
                              />
                              <FormFeedback>
                                {validation.errors.specialisation}
                              </FormFeedback>
                            </div>
                          </Col>
                        </>
                      )}

                      {/* REPEAT VISIT search existing doctor */}
                      {validation.values.visitType === "REPEAT_VISIT" && (
                        <Col xs={12}>
                          <div className="field-group">
                            <Label className="field-label">
                              Search Doctor{" "}
                              <span className="field-required">*</span>
                            </Label>

                            {!selectedDoctor ? (
                              <div className="position-relative">
                                <Input
                                  placeholder="Type doctor name to search…"
                                  value={doctorQuery}
                                  onChange={(e) =>
                                    handleDoctorQueryChange(e.target.value)
                                  }
                                />
                                {doctorSearching && (
                                  <div className="text-muted fs-13 mt-2">
                                    Searching…
                                  </div>
                                )}
                                {doctorResults.length > 0 && (
                                  <div
                                    className="border rounded mt-1 overflow-hidden"
                                    style={{
                                      background: "#fff",
                                      position: "relative",
                                      zIndex: 5,
                                    }}
                                  >
                                    {doctorResults.map((doc, idx) => (
                                      <div
                                        key={idx}
                                        className="doctor-result-item border-bottom"
                                        onClick={() => pickDoctor(doc)}
                                      >
                                        <div className="fw-medium fs-14">
                                          {doc.name}
                                        </div>
                                        <div className="text-muted fs-13">
                                          {doc.clinicName} &middot;{" "}
                                          {doc.specialisation}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {doctorQuery.trim().length >= 2 &&
                                  !doctorSearching &&
                                  doctorResults.length === 0 && (
                                    <div className="text-muted fs-13 mt-2">
                                      No matching doctor found — check spelling
                                      or add as First Visit
                                    </div>
                                  )}
                                {validation.touched.doctorName &&
                                  validation.errors.doctorName && (
                                    <div className="text-danger fs-13 mt-1">
                                      Please search and select a doctor
                                    </div>
                                  )}
                              </div>
                            ) : editingDoctor ? (
                              <div className="doctor-panel">
                                <Row className="g-3">
                                  <Col xs={12} lg={6}>
                                    <Label
                                      className="text-muted mb-1"
                                      style={{ fontSize: "13px" }}
                                    >
                                      Doctor Name
                                    </Label>
                                    <Input
                                      name="doctorName"
                                      value={validation.values.doctorName}
                                      onChange={validation.handleChange}
                                    />
                                  </Col>
                                  <Col xs={12} lg={6}>
                                    <Label
                                      className="text-muted mb-1"
                                      style={{ fontSize: "13px" }}
                                    >
                                      Clinic Name
                                    </Label>
                                    <Input
                                      name="clinicName"
                                      value={validation.values.clinicName}
                                      onChange={validation.handleChange}
                                    />
                                  </Col>
                                  <Col xs={12} lg={6}>
                                    <Label
                                      className="text-muted mb-1"
                                      style={{ fontSize: "13px" }}
                                    >
                                      Contact Number
                                    </Label>
                                    <Input
                                      name="contactNumber"
                                      value={validation.values.contactNumber}
                                      onChange={validation.handleChange}
                                    />
                                  </Col>
                                  <Col xs={12} lg={6}>
                                    <Label
                                      className="text-muted mb-1"
                                      style={{ fontSize: "13px" }}
                                    >
                                      Specialisation
                                    </Label>
                                    <Input
                                      name="specialisation"
                                      value={validation.values.specialisation}
                                      onChange={validation.handleChange}
                                    />
                                  </Col>
                                </Row>
                                <Button
                                  size="sm"
                                  color="primary"
                                  className="mt-3"
                                  onClick={() => setEditingDoctor(false)}
                                >
                                  Done
                                </Button>
                              </div>
                            ) : (
                              <div className="doctor-panel is-selected d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div>
                                  <div className="fw-medium fs-14">
                                    {validation.values.doctorName}
                                  </div>
                                  <div className="text-muted fs-13">
                                    {validation.values.clinicName} &middot;{" "}
                                    {validation.values.specialisation} &middot;{" "}
                                    {validation.values.contactNumber}
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    color="light"
                                    onClick={() => setEditingDoctor(true)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="light"
                                    onClick={clearSelectedDoctor}
                                  >
                                    Change
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </Col>
                      )}
                    </Row>
                  )}

                  {/*STEP 2 COLLATERAL*/}
                  {activeStep === 2 && (
                    <Row>
                      <Col xs={12} lg={6}>
                        <div className="field-group">
                          <Label className="field-label">
                            Did You Give Any Collateral?{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <Input
                            type="select"
                            name="collateralGiven"
                            value={validation.values.collateralGiven}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.collateralGiven &&
                              !!validation.errors.collateralGiven
                            }
                          >
                            <option value="" disabled hidden>
                              Choose here
                            </option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </Input>
                          <FormFeedback>
                            {validation.errors.collateralGiven}
                          </FormFeedback>
                        </div>
                      </Col>

                      {validation.values.collateralGiven === "true" && (
                        <>
                          <Col xs={12}>
                            <div className="field-group">
                              <Label className="field-label">
                                Collateral Type
                              </Label>
                              <div className="choice-row">
                                {[
                                  {
                                    name: "pricingBrochure",
                                    label: "Pricing Brochure",
                                  },
                                  {
                                    name: "centreBrochure",
                                    label: "Centre Brochure",
                                  },
                                ].map((item) => (
                                  <label
                                    key={item.name}
                                    className={
                                      "choice-btn d-flex align-items-center gap-2 " +
                                      (validation.values[item.name]
                                        ? "is-active"
                                        : "")
                                    }
                                  >
                                    <Input
                                      type="checkbox"
                                      name={item.name}
                                      checked={validation.values[item.name]}
                                      onChange={validation.handleChange}
                                      className="m-0"
                                    />
                                    {item.label}
                                  </label>
                                ))}
                              </div>
                              {validation.errors.pricingBrochure && (
                                <div className="text-danger mt-2 fs-13">
                                  {validation.errors.pricingBrochure}
                                </div>
                              )}
                            </div>
                          </Col>

                          {(validation.values.pricingBrochure ||
                            validation.values.centreBrochure) && (
                            <Col xs={12}>
                              <div className="field-group">
                                <Label className="field-label">
                                  Upload Proof (optional)
                                </Label>
                                <Row className="g-3">
                                  {validation.values.pricingBrochure && (
                                    <Col xs={12} lg={6}>
                                      <div
                                        className="text-muted mb-1"
                                        style={{ fontSize: "13px" }}
                                      >
                                        Pricing Brochure Proof
                                      </div>
                                      <div className="upload-zone d-flex align-items-center gap-3">
                                        {collateralProofPreviews.pricing ? (
                                          <>
                                            <img
                                              src={
                                                collateralProofPreviews.pricing
                                              }
                                              alt="Pricing proof"
                                              style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 6,
                                                objectFit: "cover",
                                              }}
                                            />
                                            <div className="flex-grow-1 fs-13 text-muted text-truncate">
                                              {
                                                collateralProofFiles.pricing
                                                  ?.name
                                              }
                                            </div>
                                            <Button
                                              size="sm"
                                              color="light"
                                              onClick={() =>
                                                removeCollateralProof("pricing")
                                              }
                                            >
                                              <i className="bx bx-x" />
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            type="button"
                                            color="light"
                                            size="sm"
                                            onClick={() =>
                                              pricingProofInputRef.current?.click()
                                            }
                                          >
                                            Choose file
                                          </Button>
                                        )}
                                        <Input
                                          innerRef={pricingProofInputRef}
                                          type="file"
                                          accept="image/*,.pdf"
                                          onChange={(e) =>
                                            handleCollateralProofChange(
                                              "pricing",
                                              e,
                                            )
                                          }
                                          className="d-none"
                                        />
                                      </div>
                                    </Col>
                                  )}

                                  {validation.values.centreBrochure && (
                                    <Col xs={12} lg={6}>
                                      <div
                                        className="text-muted mb-1"
                                        style={{ fontSize: "13px" }}
                                      >
                                        Centre Brochure Proof
                                      </div>
                                      <div className="upload-zone d-flex align-items-center gap-3">
                                        {collateralProofPreviews.centre ? (
                                          <>
                                            <img
                                              src={
                                                collateralProofPreviews.centre
                                              }
                                              alt="Centre proof"
                                              style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 6,
                                                objectFit: "cover",
                                              }}
                                            />
                                            <div className="flex-grow-1 fs-13 text-muted text-truncate">
                                              {
                                                collateralProofFiles.centre
                                                  ?.name
                                              }
                                            </div>
                                            <Button
                                              size="sm"
                                              color="light"
                                              onClick={() =>
                                                removeCollateralProof("centre")
                                              }
                                            >
                                              <i className="bx bx-x" />
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            type="button"
                                            color="light"
                                            size="sm"
                                            onClick={() =>
                                              centreProofInputRef.current?.click()
                                            }
                                          >
                                            Choose file
                                          </Button>
                                        )}
                                        <Input
                                          innerRef={centreProofInputRef}
                                          type="file"
                                          accept="image/*,.pdf"
                                          onChange={(e) =>
                                            handleCollateralProofChange(
                                              "centre",
                                              e,
                                            )
                                          }
                                          className="d-none"
                                        />
                                      </div>
                                    </Col>
                                  )}
                                </Row>
                                <div className="field-hint">
                                  Photo or PDF scan of the brochure/receipt
                                  handed over
                                </div>
                              </div>
                            </Col>
                          )}
                        </>
                      )}
                    </Row>
                  )}

                  {/* STEP 3 DISCUSSION */}
                  {activeStep === 3 && (
                    <Row>
                      <Col xs={12}>
                        <div className="field-group">
                          <Label className="field-label">
                            Visit Notes{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <Input
                            type="textarea"
                            rows={4}
                            name="visitNotes"
                            placeholder="What did you discuss with the doctor?"
                            value={validation.values.visitNotes}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.visitNotes &&
                              !!validation.errors.visitNotes
                            }
                          />
                          <FormFeedback>
                            {validation.errors.visitNotes}
                          </FormFeedback>
                        </div>
                      </Col>
                      <Col xs={12} lg={7}>
                        <div className="field-group">
                          <Label className="field-label">
                            How Interested Is the Doctor?{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <div className="choice-row">
                            {INTEREST_OPTIONS.map((opt) => (
                              <label
                                key={opt.value}
                                className={
                                  "choice-btn " +
                                  (validation.values.interestLevel === opt.value
                                    ? "is-active"
                                    : "")
                                }
                                onClick={() =>
                                  validation.setFieldValue(
                                    "interestLevel",
                                    opt.value,
                                  )
                                }
                              >
                                {opt.label}
                              </label>
                            ))}
                          </div>
                          {validation.errors.interestLevel && (
                            <div className="text-danger mt-2 fs-13">
                              {validation.errors.interestLevel}
                            </div>
                          )}
                        </div>
                      </Col>

                      <Col xs={12} lg={5}>
                        <div className="field-group">
                          <Label className="field-label">
                            Commission Discussed{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <Input
                            type="select"
                            name="commissionDiscussed"
                            value={validation.values.commissionDiscussed}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.commissionDiscussed &&
                              !!validation.errors.commissionDiscussed
                            }
                          >
                            <option value="" disabled hidden>
                              Choose here
                            </option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </Input>
                          <FormFeedback>
                            {validation.errors.commissionDiscussed}
                          </FormFeedback>
                        </div>
                      </Col>

                      {validation.values.commissionDiscussed === "true" && (
                        <Col xs={12} lg={5}>
                          <div className="field-group">
                            <Label className="field-label">
                              Commission Percentage{" "}
                              <span className="field-required">*</span>
                            </Label>
                            <Input
                              type="number"
                              name="commissionPercentage"
                              placeholder="e.g. 10"
                              min={0}
                              max={100}
                              value={validation.values.commissionPercentage}
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={
                                validation.touched.commissionPercentage &&
                                !!validation.errors.commissionPercentage
                              }
                            />
                            <FormFeedback>
                              {validation.errors.commissionPercentage}
                            </FormFeedback>
                          </div>
                        </Col>
                      )}

                      <Col xs={12} lg={5}>
                        <div className="field-group">
                          <Label className="field-label">
                            Next Follow-up Date (Optional)
                          </Label>
                          <Input
                            type="date"
                            name="nextFollowUpDate"
                            value={validation.values.nextFollowUpDate}
                            onChange={validation.handleChange}
                          />
                        </div>
                      </Col>
                    </Row>
                  )}

                  {/*STEP 4: PHOTO PROOF live camera only */}
                  {activeStep === 4 && (
                    <Row>
                      <Col xs={12} lg={7}>
                        <div className="field-group">
                          <Label className="field-label">
                            Selfie with Clinic Nameplate / Building{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <div className="upload-zone text-center">
                            {!cameraOpen && !selfiePreview && (
                              <div className="py-4">
                                <p className="text-muted fs-14 mb-3">
                                  Live camera only — gallery selection is not
                                  allowed
                                </p>
                                <Button
                                  type="button"
                                  color="primary"
                                  onClick={openCamera}
                                >
                                  Open Camera
                                </Button>
                                {cameraError && (
                                  <div className="text-danger fs-13 mt-2">
                                    {cameraError}
                                  </div>
                                )}
                              </div>
                            )}

                            {cameraOpen && (
                              <div>
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  style={{
                                    width: "100%",
                                    maxWidth: 360,
                                    borderRadius: 8,
                                  }}
                                />
                                <canvas
                                  ref={canvasRef}
                                  style={{ display: "none" }}
                                />
                                <div className="d-flex justify-content-center gap-2 mt-3">
                                  <Button
                                    type="button"
                                    color="success"
                                    onClick={capturePhoto}
                                  >
                                    Capture
                                  </Button>
                                  <Button
                                    type="button"
                                    color="light"
                                    onClick={switchCamera}
                                  >
                                    Switch Camera
                                  </Button>
                                  <Button
                                    type="button"
                                    color="light"
                                    onClick={closeCamera}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}

                            {!cameraOpen && selfiePreview && (
                              <div>
                                <img
                                  src={selfiePreview}
                                  alt="Selfie preview"
                                  style={{
                                    maxWidth: "200px",
                                    maxHeight: "200px",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div>
                                  <Button
                                    type="button"
                                    color="light"
                                    size="sm"
                                    className="mt-3"
                                    onClick={retakePhoto}
                                  >
                                    Retake
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} lg={7}>
                        <div className="field-group">
                          <Label className="field-label">
                            Photo Inside the Clinic / Hospital{" "}
                            <span className="field-required">*</span>
                          </Label>
                          <div className="upload-zone text-center">
                            {!clinicCameraOpen && !clinicPhotoPreview && (
                              <div className="py-4">
                                <p className="text-muted fs-14 mb-3">
                                  Live camera only — gallery selection is not
                                  allowed
                                </p>
                                <Button
                                  type="button"
                                  color="primary"
                                  onClick={openClinicCamera}
                                >
                                  Open Camera
                                </Button>
                              </div>
                            )}

                            {clinicCameraOpen && (
                              <div>
                                <video
                                  ref={clinicVideoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  style={{
                                    width: "100%",
                                    maxWidth: 360,
                                    borderRadius: 8,
                                  }}
                                />
                                <canvas
                                  ref={clinicCanvasRef}
                                  style={{ display: "none" }}
                                />
                                <div className="d-flex justify-content-center gap-2 mt-3">
                                  <Button
                                    type="button"
                                    color="success"
                                    onClick={captureClinicPhoto}
                                  >
                                    Capture
                                  </Button>
                                  <Button
                                    type="button"
                                    color="light"
                                    onClick={switchClinicCamera}
                                  >
                                    Switch Camera
                                  </Button>
                                  <Button
                                    type="button"
                                    color="light"
                                    onClick={closeClinicCamera}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}

                            {!clinicCameraOpen && clinicPhotoPreview && (
                              <div>
                                <img
                                  src={clinicPhotoPreview}
                                  alt="Clinic preview"
                                  style={{
                                    maxWidth: "200px",
                                    maxHeight: "200px",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div>
                                  <Button
                                    type="button"
                                    color="light"
                                    size="sm"
                                    className="mt-3"
                                    onClick={retakeClinicPhoto}
                                  >
                                    Retake
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )}

                  {/* STEP 5: REVIEW & SUBMIT */}
                  {activeStep === 5 && (
                    <div>
                      <p className="text-muted fs-13 mb-4">
                        Check everything below before submitting. Use "Edit" to
                        make changes.
                      </p>

                      {[
                        {
                          step: 0,
                          title: "Visit Details",
                          rows: [
                            ["Area / Locality", validation.values.areaLocality],
                          ],
                        },
                        {
                          step: 1,
                          title: "Doctor & Clinic",
                          rows: [
                            ["Doctor Name", validation.values.doctorName],
                            ["Clinic Name", validation.values.clinicName],
                            ["Contact Number", validation.values.contactNumber],
                            [
                              "Specialisation",
                              validation.values.specialisation,
                            ],
                            [
                              "Visit Type",
                              validation.values.visitType === "FIRST_VISIT"
                                ? "First Visit"
                                : "Repeat Visit",
                            ],
                            [
                              "Who You Met",
                              validation.values.metWith?.replaceAll("_", " "),
                            ],
                          ],
                        },
                        {
                          step: 2,
                          title: "Collateral",
                          rows: [
                            [
                              "Collateral Given?",
                              validation.values.collateralGiven === "true"
                                ? "Yes"
                                : "No",
                            ],
                            ...(validation.values.collateralGiven === "true"
                              ? [
                                  [
                                    "Type",
                                    [
                                      validation.values.pricingBrochure &&
                                        "Pricing Brochure",
                                      validation.values.centreBrochure &&
                                        "Centre Brochure",
                                    ]
                                      .filter(Boolean)
                                      .join(", ") || "—",
                                  ],
                                  [
                                    "Proof Uploaded",
                                    [
                                      collateralProofFiles.pricing && "Pricing",
                                      collateralProofFiles.centre && "Centre",
                                    ]
                                      .filter(Boolean)
                                      .join(", ") || "No",
                                  ],
                                ]
                              : []),
                          ],
                        },
                        {
                          step: 3,
                          title: "Discussion",
                          rows: [
                            ["Visit Notes", validation.values.visitNotes],
                            ["Interest Level", validation.values.interestLevel],
                            [
                              "Commission Discussed",
                              validation.values.commissionDiscussed === "true"
                                ? "Yes"
                                : "No",
                            ],
                            ...(validation.values.commissionDiscussed === "true"
                              ? [
                                  [
                                    "Commission %",
                                    `${validation.values.commissionPercentage}%`,
                                  ],
                                ]
                              : []),
                            [
                              "Next Follow-up",
                              validation.values.nextFollowUpDate || "Not set",
                            ],
                          ],
                        },
                      ].map((section) => (
                        <div key={section.title} className="review-section">
                          <div className="review-section-head">
                            <span className="review-section-title">
                              {section.title}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              color="link"
                              className="text-decoration-none p-0"
                              onClick={() => {
                                goToStep(section.step);
                                if (
                                  section.step === 1 &&
                                  validation.values.visitType === "REPEAT_VISIT"
                                ) {
                                  setEditingDoctor(true);
                                }
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                          <dl className="mb-0">
                            {section.rows.map(([label, value]) => (
                              <div key={label} className="review-row">
                                <dt>{label}</dt>
                                <dd>{value || "—"}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))}

                      <div className="review-section mb-0">
                        <div className="review-section-head">
                          <span className="review-section-title">
                            Photo Proof
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            color="link"
                            className="text-decoration-none p-0"
                            onClick={() => goToStep(4)}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="d-flex align-items-center gap-4 flex-wrap">
                          <div className="d-flex align-items-center gap-2">
                            {selfiePreview ? (
                              <>
                                <img
                                  src={selfiePreview}
                                  alt="Selfie"
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                  }}
                                />
                                <span className="text-success fs-13">
                                  Selfie captured
                                </span>
                              </>
                            ) : (
                              <span className="text-danger fs-13">
                                No selfie captured yet
                              </span>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            {clinicPhotoPreview ? (
                              <>
                                <img
                                  src={clinicPhotoPreview}
                                  alt="Clinic"
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                  }}
                                />
                                <span className="text-success fs-13">
                                  Clinic photo captured
                                </span>
                              </>
                            ) : (
                              <span className="text-danger fs-13">
                                No clinic photo yet
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/*Navigation buttons*/}
                  <div className="wizard-nav">
                    <Button
                      type="button"
                      color="light"
                      className="px-4 flex-fill flex-md-grow-0"
                      onClick={goBack}
                      disabled={activeStep === 0}
                    >
                      Back
                    </Button>

                    {canWrite &&
                      (activeStep !== STEPS.length - 1 ? (
                        <Button
                          type="button"
                          color="primary"
                          className="px-4 flex-fill flex-md-grow-0"
                          onClick={goNext}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          color="success"
                          className="px-4 flex-fill flex-md-grow-0"
                          disabled={submitting}
                          onClick={handleFinalSubmit}
                        >
                          {submitting ? "Submitting…" : "Submit Visit"}
                        </Button>
                      ))}
                  </div>
                </form>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddVisitLog;
