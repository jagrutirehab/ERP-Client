import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";
import Select from "react-select";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";

import * as Yup from "yup";
import { useFormik } from "formik";
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

import CustomModal from "../../../Components/Common/Modal";
import { connect, useDispatch } from "react-redux";
import {
  admitIpdPatient,
  admitDischargePatient,
  editAdmission,
  fetchDoctors,
  fetchReferrals,
} from "../../../store/actions";
import {
  ADMIT_PATIENT,
  EDIT_ADMISSION,
} from "../../../Components/constants/patient";
import FormField from "../../../Components/Common/FormField";
import Divider from "../../../Components/Common/Divider";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import { getICDCodes } from "../../../helpers/backend_helper";

const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguans",
  "Argentinean", "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian",
  "Bahraini", "Bangladeshi", "Barbadian", "Barbudans", "Batswana", "Belarusian",
  "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian",
  "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian",
  "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean",
  "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban",
  "Cypriot", "Czech", "Danish", "Djibouti", "Dominican", "Dutch", "East Timorese",
  "Ecuadorean", "Egyptian", "Emirian", "Equatorial Guinean", "Eritrean", "Estonian",
  "Ethiopian", "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian",
  "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinea-Bissauan",
  "Guinean", "Guyanese", "Haitian", "Herzegovinian", "Honduran", "Hungarian", "I-Kiribati",
  "Icelander", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian",
  "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakhstani", "Kenyan", "Kittitian",
  "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan",
  "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian",
  "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian",
  "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan", "Mosotho",
  "Motswana", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander",
  "Nicaraguan", "Nigerian", "Nigerien", "North Korean", "Northern Irish", "Norwegian",
  "Omani", "Pakistani", "Palauan", "Panamanian", "Papua New Guinean", "Paraguayan",
  "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan",
  "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi",
  "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean",
  "Slovakian", "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean",
  "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", "Swedish", "Swiss",
  "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan",
  "Trinidadian or Tobagonian", "Tunisian", "Turkish", "Tuvaluan", "Ugandan", "Ukrainian",
  "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese", "Welsh", "Yemenite",
  "Zambian", "Zimbabwean",
].map((n) => ({ value: n, label: n }));

const AdmitPatient = ({
  isOpen,
  data,
  patient,
  centers,
  doctors,
  counsellors,
  doctorLoading,
  referrals,
  referralsLoading,
}) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [isOtherReferral, setIsOtherReferral] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [selectedNationality, setSelectedNationality] = useState(null);
  const [icdOptions, setIcdOptions] = useState([]);

  const toggle = () =>
    dispatch(admitDischargePatient({ data: null, isOpen: "" }));

  const dateOfBirth = patient?.dateOfBirth
    ? format(new Date(patient.dateOfBirth), "yyyy-MM-dd")
    : "";

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      admissionId: data?._id || "",
      patientId: patient?._id || "",
      name: patient ? patient.name : "",
      phoneNumber: patient ? patient.phoneNumber : "",
      email: patient ? patient.email : "",
      dateOfBirth,
      gender: patient ? patient.gender : "",
      address: patient ? patient.address : "",
      nationality: patient ? patient.nationality || "" : "",
      //guardian
      guardianName: patient ? patient.guardianName : "",
      guardianRelation: patient ? patient.guardianRelation : "",
      guardianPhoneNumber: patient ? patient.guardianPhoneNumber : "",
      referredBy: patient
        ? patient.referredBy?.doctorName || patient.referredBy
        : "",
      referralPhoneNumber: patient?.referredBy?.mobileNumber || "",
      ipdFileNumber: patient ? patient.ipdFileNumber : "",

      //admission
      center: data ? data.center?._id : "",
      addmissionDate: data ? new Date(data.addmissionDate) : "",
      ...(data?.dischargeDate && {
        dischargeDate: data ? new Date(data.dischargeDate) : "",
      }),
      psychologist: data ? data.psychologist?._id : "",
      doctor: data ? data.doctor?._id : "",
      provisional_diagnosis: [],
      Ipdnum: data ? data.Ipdnum : "",
    },
    validationSchema: Yup.object({
      //patient
      // aadhaarCardNumber: Yup.string()
      //   .nullable()
      //   .notRequired()
      //   .matches(
      //     /^$|^[0-9]{12}$/,
      //     "Aadhaar Card Number must be exactly 12 digits"
      //   ),
      // aadhaarCard: Yup.string().required("Please select Aadhaar Card"),
      name: Yup.string().required("Please select Name"),
      phoneNumber: Yup.string().required("Please select Phone Number"),
      email: Yup.string()
        .email("Please enter a valid email")
        .nullable()
        .notRequired(),
      dateOfBirth: Yup.string().required("Please select Date of birth"),
      gender: Yup.string().required("Please select Gender"),
      address: Yup.string().required("Please select Address"),
      nationality: Yup.string().required("Please select Nationality"),
      guardianName: Yup.string().required("Please select Guardian Name"),
      guardianRelation: Yup.string().required(
        "Please select Guardian Relation",
      ),
      guardianPhoneNumber: Yup.string().required(
        "Please select Guardian Phone Number",
      ),
      referredBy: Yup.string().required("Please select Referred By"),
      referralPhoneNumber: Yup.string()
        .nullable()
        .notRequired()
        .test(
          "is-valid-referral-phone",
          "Invalid phone number",
          function (value) {
            if (!value) return true;
            return isValidPhoneNumber(value);
          },
        ),
      // ipdFileNumber: Yup.string().required("Please select Ipd File Number"),
      //admission
      addmissionDate: Yup.date().required("Please select addmission date"),
      center: Yup.string().required("Please select center"),
      psychologist: Yup.string().required("Please select Psychologist"),
      doctor: Yup.string().required("Please select Doctor"),
      // provisional_diagnosis: Yup.array()
      //   .min(1, "Please select at least one Provisional Diagnosis")
      //   .required("Please select Provisional Diagnosis"),
      Ipdnum: Yup.string().required("Please Wait for Ipd file number"),
    }),
    onSubmit: (values) => {
      if (data) dispatch(editAdmission(values));
      else dispatch(admitIpdPatient(values));

      validation.resetForm();
      toggle();
    },
  });

  useEffect(() => {
    setStep(1);
  }, [isOpen]);

  useEffect(() => {
    dispatch(fetchReferrals());
  }, [dispatch]);

  useEffect(() => {
    // Initialize selectedNationality from patient data
    if (patient?.nationality) {
      setSelectedNationality({ value: patient.nationality, label: patient.nationality });
    } else {
      setSelectedNationality(null);
    }
  }, [patient, isOpen]);

  useEffect(() => {
    // Initialize selectedReferral and isOtherReferral based on patient data
    if (patient?.referredBy && referrals?.length) {
      const referralMatch = referrals.find(
        (ref) =>
          ref._id === patient.referredBy.id ||
          ref.doctorName === patient.referredBy.doctorName ||
          ref.doctorName === patient.referredBy,
      );
      if (referralMatch) {
        setSelectedReferral({
          value: referralMatch._id,
          label: referralMatch.doctorName,
        });
        setIsOtherReferral(false);
        validation.setFieldValue("referredBy", referralMatch._id);
      } else {
        // If not found in referrals, treat as "Other"
        setSelectedReferral({ value: "other", label: "Other" });
        setIsOtherReferral(true);
        // Ensure the field value is a string (doctor name), not an object
        const doctorName =
          typeof patient.referredBy === "string"
            ? patient.referredBy
            : patient.referredBy?.doctorName || "";
        validation.setFieldValue("referredBy", doctorName);
      }
    }
  }, [patient, referrals]);

  const handleChange = (e, fieldType) => {
    if (fieldType === "file") {
      const name = e.target.name;
      const file = e.target.files[0];
      const event = {
        target: { name, value: { file, path: e.target.value } },
      };
      validation.handleChange(event);
    } else {
      validation.handleChange(e);
    }
  };

  useEffect(() => {
    if (validation.values.center)
      dispatch(fetchDoctors({ center: validation.values.center }));
  }, [dispatch, validation.values.center]);

  const createIpdfile = async (id) => {
    try {
      const { data } = await axios.post(
        "/patient/ipdfilenum",
        { Patientid: id }, // body data
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (data?.Ipdnum) {
        validation.setFieldValue("Ipdnum", data.Ipdnum);
        // toast.success(`IPD file number: ${data.data.Ipdnum}`);
      } else {
        toast.error("Failed to receive IPD number");
      }
      // toast.success("IPD file number generated successfully");
    } catch (error) {
      toast.error("Failed to get IPD file number");
    }
  };

  useEffect(() => {
    if (step === 2 && patient?._id && !validation.values.Ipdnum) {
      createIpdfile(patient._id);
    }
    return;
  }, [patient, step]);

  const patientFields = [
    {
      label: "Name",
      name: "name",
      type: "text",
    },
    {
      label: "Phone Number",
      name: "phoneNumber",
      type: "number",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
    },
    {
      label: "Gender",
      name: "gender",
      type: "radio",
      options: ["MALE", "FEMALE", "OTHERS"],
    },
    {
      label: "Address",
      name: "address",
      type: "text",
    },
  ];

  const patientGuardianFields = [
    {
      label: "Guardian Name",
      name: "guardianName",
      type: "text",
      required: true,
    },
    {
      label: "Relation",
      name: "guardianRelation",
      type: "text",
      required: true,
    },
    {
      label: "Phone Number",
      name: "guardianPhoneNumber",
      type: "text",
      required: true,
    },
    // {
    //   label: "IPD File Number",
    //   name: "ipdFileNumber",
    //   type: "text",
    //   required: false,
    // },
  ];


  const loadIcds = async () => {
    try {
      const response = await getICDCodes();

      const formatted = response.map((item) => ({
        value: item._id,
        label: `${item.code} - ${item.text}`,
      }));

      setIcdOptions(formatted);

    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    loadIcds();
  }, [])

  const admissionFields = [
    {
      label: "Provisional Diagnosis",
      name: "provisional_diagnosis",
      type: "select",
      options: icdOptions,
      isMulti: true,
    },
    {
      label: "Doctor",
      name: "doctor",
      type: "select",
      options: doctors,
    },
    {
      label: "Psychologist",
      name: "psychologist",
      type: "select",
      options: counsellors,
    },
  ];

  const summaryTileStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0.5rem 0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  };

  const summaryLabelStyle = {
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const summaryValueStyle = {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#334155",
    wordBreak: "break-word",
  };

  const renderStep1 = () => (
    <>
      <Row>
        <FormField
          fields={patientFields}
          validation={validation}
          doctorLoading={doctorLoading}
          handleChange={handleChange}
        />
        {/* Nationality React Select */}
        <Col xs={12} lg={4}>
          <div className="mb-3">
            <Label htmlFor="nationality" className="form-label">
              Nationality <span className="text-danger">*</span>
            </Label>
            <Select
              inputId="nationality"
              value={selectedNationality}
              onChange={(option) => {
                setSelectedNationality(option);
                validation.setFieldValue("nationality", option?.value || "");
              }}
              onBlur={() => validation.setFieldTouched("nationality", true)}
              options={NATIONALITIES}
              placeholder="Search nationality..."
              isClearable
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderColor:
                    validation.touched.nationality &&
                    validation.errors.nationality
                      ? "#dc3545"
                      : "#ced4da",
                  boxShadow: state.isFocused
                    ? validation.touched.nationality &&
                      validation.errors.nationality
                      ? "0 0 0 0.2rem rgba(220, 53, 69, 0.25)"
                      : "0 0 0 0.2rem rgba(13, 110, 253, 0.25)"
                    : "none",
                  "&:hover": {
                    borderColor:
                      validation.touched.nationality &&
                      validation.errors.nationality
                        ? "#dc3545"
                        : "#86b7fe",
                  },
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
            />
            {validation.touched.nationality && validation.errors.nationality && (
              <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {validation.errors.nationality}
              </div>
            )}
          </div>
        </Col>
        <Col xs={12}>
          <div className="d-flex gap-3 align-items-center">
            <h6 className="display-6 fs-4">Guardian</h6>
            <Divider />
          </div>
        </Col>
        {(patientGuardianFields || []).map((f, idx) => (
          <Col key={f.name + idx} xs={12} lg={4}>
            <div className="mb-3">
              <Label htmlFor={f.name} className="form-label">
                {f.label}
                {f.required && <span className="text-danger">*</span>}
              </Label>
              <Input
                type={f.type}
                name={f.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values[f.name] || ""}
                invalid={
                  validation.touched[f.name] && validation.errors[f.name]
                    ? true
                    : false
                }
                className="form-control"
                placeholder=""
                id={f.name}
              />
              {validation.touched[f.name] && validation.errors[f.name] ? (
                <FormFeedback type="invalid">
                  <div>{validation.errors[f.name]}</div>
                </FormFeedback>
              ) : null}
            </div>
          </Col>
        ))}
        <Col xs={12} lg={4}>
          <div className="mb-3">
            <Label htmlFor="referredBy" className="form-label">
              Referred By <span className="text-danger">*</span>
            </Label>

            <Select
              value={selectedReferral}
              onChange={(option) => {
                setSelectedReferral(option);
                if (option?.value === "other") {
                  setIsOtherReferral(true);
                  validation.setFieldValue("referredBy", "");
                  validation.setFieldValue("referralPhoneNumber", "");
                } else {
                  setIsOtherReferral(false);
                  validation.setFieldValue("referredBy", option?.value || "");
                  validation.setFieldValue("referralPhoneNumber", "");
                }
              }}
              onBlur={() => validation.setFieldTouched("referredBy", true)}
              options={[
                ...(referrals || []).map((ref) => ({
                  value: ref._id,
                  label: ref.doctorName,
                })),
                { value: "other", label: "Other" },
              ]}
              placeholder="Select or search for a referral doctor"
              isClearable
              isLoading={referralsLoading}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderColor:
                    validation.touched.referredBy &&
                      validation.errors.referredBy
                      ? "#dc3545"
                      : "#ced4da",
                  boxShadow: state.isFocused
                    ? validation.touched.referredBy &&
                      validation.errors.referredBy
                      ? "0 0 0 0.2rem rgba(220, 53, 69, 0.25)"
                      : "0 0 0 0.2rem rgba(13, 110, 253, 0.25)"
                    : "none",
                  "&:hover": {
                    borderColor:
                      validation.touched.referredBy &&
                        validation.errors.referredBy
                        ? "#dc3545"
                        : "#86b7fe",
                  },
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
            />

            {isOtherReferral && (
              <>
                <Input
                  name="referredBy"
                  className="form-control mt-2"
                  placeholder="Enter doctor name"
                  type="text"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.referredBy || ""}
                  invalid={
                    validation.touched.referredBy &&
                    validation.errors.referredBy
                  }
                />
                <div className="mt-2">
                  <PhoneInputWithCountrySelect
                    placeholder="Referral phone number (optional)"
                    name="referralPhoneNumber"
                    value={validation.values.referralPhoneNumber}
                    onChange={(value) =>
                      validation.setFieldValue(
                        "referralPhoneNumber",
                        value || "",
                      )
                    }
                    onBlur={() =>
                      validation.setFieldTouched("referralPhoneNumber", true)
                    }
                    defaultCountry="IN"
                    limitMaxLength={true}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0.5rem 0.75rem",
                      border: `1px solid ${validation.touched.referralPhoneNumber &&
                        validation.errors.referralPhoneNumber
                        ? "#dc3545"
                        : "#ced4da"
                        }`,
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                    }}
                  />
                  {validation.touched.referralPhoneNumber &&
                    validation.errors.referralPhoneNumber && (
                      <div
                        style={{
                          color: "#dc3545",
                          fontSize: "0.875rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {validation.errors.referralPhoneNumber}
                      </div>
                    )}
                </div>
              </>
            )}

            {validation.touched.referredBy && validation.errors.referredBy && (
              <FormFeedback type="invalid" className="d-block">
                {validation.errors.referredBy}
              </FormFeedback>
            )}
          </div>
        </Col>
      </Row>
      <div className="d-flex justify-content-end mt-3">
        <Button
          onClick={() => {
            // Get all required fields from step 1 (excluding email)
            const step1Fields = [
              ...patientFields.filter((f) => f.name !== "email"),
              ...patientGuardianFields.filter(
                (f) => f.name !== "ipdFileNumber",
              ),
            ].map((f) => f.name);

            // Also touch nationality (custom Select field)
            validation.setFieldTouched("nationality", true);

            // Touch all fields to trigger validation
            step1Fields.forEach((field) => {
              validation.setFieldTouched(field, true);
            });

            // Check if there are any validation errors
            const step1Errors = step1Fields.filter(
              (field) => validation.errors[field],
            );

            // Check nationality error separately
            const nationalityMissing = !validation.values.nationality;

            // Check if any required fields are empty (excluding email)
            const emptyFields = step1Fields.filter(
              (field) =>
                !validation.values[field] ||
                validation.values[field].toString().trim() === "",
            );

            if (step1Errors.length > 0 || emptyFields.length > 0 || nationalityMissing) {
              return; // Don't proceed to next step
            }

            // If validation passes, proceed to step 2
            setStep(2);
          }}
          color="success"
          size="sm"
          type="button"
        >
          Next
        </Button>
      </div>
    </>
  );

  const renderStep2 = () => {
    const { name, phoneNumber, email, dateOfBirth, gender, address, nationality } =
      validation.values;

    return (
      <>
        {/* ── Patient Summary Card ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)",
            border: "1px solid #c8e1f9",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Patient Summary
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1e3a5f", textTransform: "capitalize" }}>
                {name || "—"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "0.65rem",
            }}
          >
            {/* Phone */}
            <div style={summaryTileStyle}>
              <span style={summaryLabelStyle}>📞 Phone</span>
              <span style={summaryValueStyle}>{phoneNumber || "—"}</span>
            </div>

            {/* Gender */}
            <div style={summaryTileStyle}>
              <span style={summaryLabelStyle}>⚧ Gender</span>
              <span style={summaryValueStyle}>{gender || "—"}</span>
            </div>

            {/* Date of Birth */}
            <div style={summaryTileStyle}>
              <span style={summaryLabelStyle}>🎂 Date of Birth</span>
              <span style={summaryValueStyle}>{dateOfBirth || "—"}</span>
            </div>

            {/* Nationality — highlighted */}
            <div
              style={{
                ...summaryTileStyle,
                background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                border: "1px solid #93c5fd",
              }}
            >
              <span style={{ ...summaryLabelStyle, color: "#1d4ed8" }}>🌍 Nationality</span>
              <span
                style={{
                  ...summaryValueStyle,
                  color: "#1e3a5f",
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {nationality || <em style={{ color: "#94a3b8", fontWeight: 400 }}>Not specified</em>}
              </span>
            </div>

            {/* Email */}
            {email && (
              <div style={{ ...summaryTileStyle, gridColumn: "span 2" }}>
                <span style={summaryLabelStyle}>✉ Email</span>
                <span style={summaryValueStyle}>{email}</span>
              </div>
            )}

            {/* Address */}
            {address && (
              <div style={{ ...summaryTileStyle, gridColumn: "span 2" }}>
                <span style={summaryLabelStyle}>📍 Address</span>
                <span style={{ ...summaryValueStyle, textTransform: "capitalize" }}>{address}</span>
              </div>
            )}
          </div>
        </div>
        {/* ── Admission Fields ── */}
        <Row>
          <Col xs={12} md={6}>
            <div className="mb-3">
              <Label htmlFor="Ipdnum" className="form-label">
                IPD file num.
              </Label>
              <Input
                name="Ipdnum"
                value={validation.values.Ipdnum || ""}
                disabled
                onChange={(e) => {
                  validation.handleChange(e);
                }}
                className="form-control shadow-none bg-light"
              />
              {validation.touched.Ipdnum && validation.errors.Ipdnum ? (
                <FormFeedback className="d-block" type="invalid">
                  {validation.errors.Ipdnum}
                </FormFeedback>
              ) : null}
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="mb-3">
              <Label className="form-label">
                Center <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                name="center"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.center || ""}
                disabled={data?.center}
                invalid={
                  validation.touched.center && validation.errors.center
                    ? true
                    : false
                }
              >
                <option value="" disabled hidden>
                  Choose here
                </option>
                {(centers || []).map((option, idx) => (
                  <option key={idx} value={option._id}>
                    {option.title}
                  </option>
                ))}
              </Input>
              {validation.touched.center && validation.errors.center ? (
                <FormFeedback>{validation.errors.center}</FormFeedback>
              ) : null}
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="mb-3">
              <Label htmlFor="addmissionDate" className="form-label">
                Addmission Date
              </Label>
              <Flatpicker
                name="addmissionDate"
                value={validation.values.addmissionDate || ""}
                onChange={([e]) => {
                  const now = new Date();
                  e.setHours(
                    now.getHours(),
                    now.getMinutes(),
                    now.getSeconds(),
                    now.getMilliseconds(),
                  );
                  const event = { target: { name: "addmissionDate", value: e } };
                  validation.handleChange(event);
                }}
                options={{
                  dateFormat: "d M, Y h:i K",
                  enableTime: true,
                  time_24hr: false,
                }}
                className="form-control shadow-none bg-light"
              />
              {validation.touched.addmissionDate &&
                validation.errors.addmissionDate ? (
                <FormFeedback className="d-block" type="invalid">
                  {validation.errors.addmissionDate}
                </FormFeedback>
              ) : null}
            </div>
          </Col>
          {data?.dischargeDate && (
            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label htmlFor="dischargeDate" className="form-label">
                  Discharge Date
                </Label>
                <Flatpicker
                  name="dischargeDate"
                  value={validation.values.dischargeDate || ""}
                  onChange={([e]) => {
                    const now = new Date();
                    e.setHours(
                      now.getHours(),
                      now.getMinutes(),
                      now.getSeconds(),
                      now.getMilliseconds(),
                    );
                    const event = { target: { name: "dischargeDate", value: e } };
                    validation.handleChange(event);
                  }}
                  options={{
                    dateFormat: "d M, Y",
                  }}
                  className="form-control shadow-none bg-light"
                />
                {validation.touched.dischargeDate &&
                  validation.errors.dischargeDate ? (
                  <FormFeedback className="d-block" type="invalid">
                    {validation.errors.dischargeDate}
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
          )}

          <FormField
            fields={admissionFields}
            validation={validation}
            doctorLoading={doctorLoading}
            handleChange={handleChange}
          />
        </Row>
        <div className="d-flex justify-content-between mt-3">
          <Button size="sm" color="secondary" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button
            size="sm"
            type="submit"
            onClick={(e) => {
              e.preventDefault();

              // First validate step 1 fields
              const step1Fields = [
                ...patientFields.filter((f) => f.name !== "email"),
                ...patientGuardianFields.filter(
                  (f) => f.name !== "ipdFileNumber",
                ),
              ].map((f) => f.name);

              // Touch nationality (custom Select, tracked separately)
              validation.setFieldTouched("nationality", true);

              // Touch all step 1 fields
              step1Fields.forEach((field) => {
                validation.setFieldTouched(field, true);
              });

              // Check step 1 validation
              const step1Errors = step1Fields.filter(
                (field) => validation.errors[field],
              );
              const step1EmptyFields = step1Fields.filter(
                (field) =>
                  !validation.values[field] ||
                  validation.values[field].toString().trim() === "",
              );
              const nationalityMissing = !validation.values.nationality;

              // Then validate step 2 fields
              const step2Fields = [
                "center",
                "addmissionDate",
                ...admissionFields
                  .filter((f) => f.name !== "provisional_diagnosis")
                  .map((f) => f.name),
              ];

              // Touch all step 2 fields
              step2Fields.forEach((field) => {
                validation.setFieldTouched(field, true);
              });

              // Check step 2 validation
              const step2Errors = step2Fields.filter(
                (field) => validation.errors[field],
              );
              const step2EmptyFields = step2Fields.filter(
                (field) =>
                  !validation.values[field] ||
                  validation.values[field].toString().trim() === "",
              );

              // If there are any errors or empty fields, don't submit
              if (
                step1Errors.length > 0 ||
                step1EmptyFields.length > 0 ||
                nationalityMissing ||
                step2Errors.length > 0 ||
                step2EmptyFields.length > 0
              ) {
                return;
              }

              // If all validation passes, submit the form
              validation.handleSubmit();
            }}
          >
            Save
          </Button>
        </div>
      </>
    );
  };

  return (
    <CustomModal
      isOpen={isOpen === ADMIT_PATIENT || isOpen === EDIT_ADMISSION}
      title="Admit Patient"
      toggle={toggle}
      size="lg"
    >
      {/* Step Navigation Buttons */}
      <div className="d-flex justify-content-center gap-3 mb-4">
        <Button
          className={step === 1 ? "text-white" : ""}
          color={step === 1 ? "primary" : "light"}
          onClick={() => setStep(1)}
          active={step === 1}
        >
          Patient Info
        </Button>
        <Button
          className={step === 2 ? "text-white" : ""}
          color={step === 2 ? "primary" : "light"}
          onClick={() => {
            if (step === 1) {
              // Get all required fields from step 1
              const step1Fields = [
                ...patientFields.filter((f) => f.name !== "email"),
                ...patientGuardianFields.filter(
                  (f) => f.name !== "ipdFileNumber",
                ),
              ].map((f) => f.name);

              // Touch nationality (custom Select, tracked separately)
              validation.setFieldTouched("nationality", true);

              // Touch all fields to trigger validation
              step1Fields.forEach((field) => {
                validation.setFieldTouched(field, true);
              });

              // Check if there are any validation errors
              const step1Errors = step1Fields.filter(
                (field) => validation.errors[field],
              );

              const nationalityMissing = !validation.values.nationality;

              // Check if any required fields are empty
              const emptyFields = step1Fields.filter(
                (field) =>
                  !validation.values[field] ||
                  validation.values[field].toString().trim() === "",
              );

              if (step1Errors.length > 0 || emptyFields.length > 0 || nationalityMissing) {
                return; // Don't proceed to step 2
              }
            }
            setStep(2);
          }}
          active={step === 2}
          disabled={
            step === 1 &&
            (() => {
              // Check if step 1 is incomplete (excluding email)
              const step1Fields = [
                ...patientFields.filter((f) => f.name !== "email"),
                ...patientGuardianFields.filter(
                  (f) => f.name !== "ipdFileNumber",
                ),
              ].map((f) => f.name);

              const hasErrors = step1Fields.some(
                (field) => validation.errors[field],
              );
              const hasEmptyFields = step1Fields.some(
                (field) =>
                  !validation.values[field] ||
                  validation.values[field].toString().trim() === "",
              );
              const nationalityMissing = !validation.values.nationality;

              return hasErrors || hasEmptyFields || nationalityMissing;
            })()
          }
        >
          Admission Info
        </Button>
      </div>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.handleSubmit();
        }}
        className="needs-validation"
        action="#"
      >
        {step === 1 ? renderStep1() : renderStep2()}
      </Form>
    </CustomModal>
  );
};

AdmitPatient.propTypes = {
  isOpen: PropTypes.string,
  patient: PropTypes.object,
};

const mapStateToProps = (state) => ({
  isOpen: state.Patient.admitDischargePatient?.isOpen,
  data: state.Patient.admitDischargePatient?.data,
  patient: state.Patient.patient,
  centers: state.Center.data,
  doctorLoading: state.User.doctorLoading,
  doctors: state.User.doctor,
  counsellors: state.User.counsellors,
  referrals: state.Referral.data,
  referralsLoading: state.Referral.loading,
});

export default connect(mapStateToProps)(AdmitPatient);
