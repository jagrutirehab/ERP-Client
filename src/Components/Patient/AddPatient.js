import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Form, Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Select from "react-select";
import { format } from "date-fns";
import * as Yup from "yup";
import { useFormik } from "formik";
import { addPatientFields, patientGuradianFields } from "../constants/patient";
import Divider from "../Common/Divider";
import CustomModal from "../Common/Modal";
import { connect, useDispatch } from "react-redux";
import {
  addLeadPatient,
  addPatient,
  fetchDoctors,
  fetchPatientId,
  removeAadhaarCard,
  togglePatientForm,
  updatePatient,
  fetchReferrals,
} from "../../store/actions";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Compressor from "compressorjs";
import UserDummyImage from "../../assets/images/users/user-dummy-img.jpg";
import UploadedFiles from "../Common/UploadedFiles";
import PatientId from "./PatientId";
import FormField from "../Common/FormField"; // Assuming this component is well-styled or will be adapted
import convertToFormDataPatient from "../../utils/convertToFormDataPatient";

const AddPatient = ({
  patient,
  user,
  centers,
  doctors,
  counsellors,
  doctorLoading,
  generatedPatientId,
  referrals,
  referralsLoading,
}) => {
  const dispatch = useDispatch();
  const [fields, setFields] = useState(addPatientFields);
  const [croppedImage, setCroppedImage] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const cropperRef = useRef(null);
  const [isOtherReferral, setIsOtherReferral] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

  const editData = patient.data;
  const leadData = patient.leadData;
  const name = editData ? editData.name : leadData ? leadData.patient.name : "";
  const phoneNumber = editData
    ? editData.phoneNumber
    : leadData
      ? leadData.patient.phoneNumber
      : "";
  const email = editData
    ? editData.email
    : leadData
      ? leadData.patient.email
      : "";
  const dateOfBirth = editData?.dateOfBirth
    ? format(new Date(editData.dateOfBirth), "yyyy-MM-dd")
    : leadData?.patient?.age
      ? (() => {
          const today = new Date();
          const birthYear = today.getFullYear() - leadData.patient.age;
          return format(
            new Date(birthYear, today.getMonth(), today.getDate()),
            "yyyy-MM-dd",
          );
        })()
      : "";
  const gender = editData
    ? editData.gender
    : leadData
      ? leadData.patient.gender
      : "";
  const center = editData
    ? editData.center?._id
    : leadData
      ? leadData.location?.[0]?._id
      : "";

  console.log({ leadData });

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      author: user?._id,
      editor: user?._id,
      id: editData?.id ? editData.id.value : generatedPatientId?.value,
      center,
      profilePicture: editData ? editData?.profilePicture : "",
      aadhaarCard: "",
      aadhaarCardNumber: editData ? editData.aadhaarCardNumber : "",
      name,
      phoneNumber,
      dateOfBirth,
      email,
      address: editData ? editData.address : "",
      age: editData ? editData.age : "",
      religion: editData ? editData.religion : "",
      maritalstatus: editData ? editData.maritalstatus : "",
      doctor: editData ? editData.doctor?._id : "",
      psychologist: editData ? editData.psychologist?._id : "",
      provisionalDiagnosis: editData ? editData.provisionalDiagnosis : "",
      gender,
      guardianName: editData ? editData.guardianName : "",
      guardianRelation: editData ? editData.guardianRelation : "",
      guardianPhoneNumber: editData ? editData.guardianPhoneNumber : "",
      dateOfAddmission: editData?.dateOfAddmission
        ? format(new Date(editData.dateOfAddmission), "yyyy-MM-dd")
        : "",
      referredBy: editData
        ? editData.referredBy
        : leadData
          ? leadData.refferedBy
          : "",
      referralPhoneNumber: editData?.referredBy?.mobileNumber || "",
      ipdFileNumber: editData ? editData.ipdFileNumber : "",
      socioeconomicstatus: editData ? editData.socioeconomicstatus : "",
      areatype: editData ? editData.areatype : "",
    },
    validationSchema: Yup.object({
      id: Yup.string()
        .required("Id is required")
        .matches(/^[A-Z0-9]+$/, "Id must contain only alphabets and digits"),
      center: Yup.string().required("Please Select Patient Center"),
      name: Yup.string().required("Please Enter Patient Name"),
      aadhaarCardNumber: Yup.string()
        .nullable()
        .notRequired()
        .matches(
          /^$|^[0-9]{12}$/,
          "Aadhaar Card Number must be exactly 12 digits",
        ),
      phoneNumber: Yup.string()
        .required("Please Enter Phone Number")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          return isValidPhoneNumber(value || "");
        }),
      dateOfBirth: Yup.string().required("Please Select Date of Birth"),
      address: Yup.string().required("Please Enter Patient Address"),
      gender: Yup.string().required("Please Select Gender"),
      guardianName: Yup.string().required("Please Enter Guardian Name"),
      guardianRelation: Yup.string().required("Please Enter Guardian Relation"),
      guardianPhoneNumber: Yup.string().required(
        "Please Enter Guardian Phone Number",
      ),
      referralPhoneNumber: Yup.string()
        .nullable()
        .notRequired()
        .test(
          "is-valid-referral-phone",
          "Invalid phone number",
          function (value) {
            if (!value) return true; // optional
            return isValidPhoneNumber(value);
          },
        ),
    }),

    onSubmit: (values) => {
      const formData = convertToFormDataPatient(values);
      if (values.aadhaarCard?.file instanceof Blob) {
        formData.append("aadhaarCard", values.aadhaarCard.file);
      }
      if (values.profilePicture instanceof Blob) {
        formData.append("profilePicture", values.profilePicture);
      }
      if (editData) {
        formData.append("editId", editData?._id);
        if (!(values.profilePicture instanceof Blob))
          formData.delete("profilePicture");
        if (!(values.aadhaarCard?.file instanceof Blob))
          formData.delete("aadhaarCard");
        dispatch(updatePatient(formData));
        dispatch(
          togglePatientForm({ data: null, leadData: null, isOpen: false }),
        );
      } else if (leadData) {
        formData.append("lead", leadData._id);
        formData.append("leadOrigin", leadData.leadOrigin);
        formData.append("leadQuery", JSON.stringify(leadData.leadQuery));
        formData.append("centerAccess", JSON.stringify(leadData.centerAccess));
        formData.append("grouped", JSON.stringify(leadData.grouped));
        formData.append("date", JSON.stringify(leadData.date));
        dispatch(addLeadPatient(formData));
        dispatch(
          togglePatientForm({ data: null, leadData: null, isOpen: false }),
        );
      } else {
        dispatch(addPatient(formData));
        dispatch(
          togglePatientForm({ data: null, leadData: null, isOpen: false }),
        );
      }
    },
  });

  useEffect(() => {
    if (validation.values.dateOfBirth) {
      const dob = new Date(validation.values.dateOfBirth);
      const today = new Date();
      const age = Math.floor((today - dob) / (1000 * 60 * 60 * 24 * 365.25));
      validation.setFieldValue("age", age);
    } else {
      validation.setFieldValue("age", "");
    }
  }, [validation.values.dateOfBirth]);

  const cancelForm = () => {
    validation.resetForm();
    dispatch(togglePatientForm({ data: null, leadData: null, isOpen: false }));
  };

  useEffect(() => {
    if (!editData) validation.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  useEffect(() => {
    if (patient?.isOpen) dispatch(fetchPatientId());
  }, [dispatch, patient]);

  useEffect(() => {
    dispatch(fetchReferrals());
  }, [dispatch]);

  useEffect(() => {
    // Initialize selectedReferral and isOtherReferral based on editData
    if (editData?.referredBy && referrals?.length) {
      const referralMatch = referrals.find(
        (ref) =>
          ref._id === editData.referredBy.id ||
          ref.doctorName === editData.referredBy.doctorName,
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
          typeof editData.referredBy === "string"
            ? editData.referredBy
            : editData.referredBy?.doctorName || "";
        validation.setFieldValue("referredBy", doctorName);
      }
    }
  }, [editData, referrals]);

  useEffect(() => {
    if (validation.values.center)
      dispatch(fetchDoctors({ center: validation.values.center }));
  }, [dispatch, validation.values.center]);

  useEffect(() => {
    if (doctors?.length) {
      let flds = [...fields].map((l) =>
        l.name === "doctor"
          ? { ...l, options: doctors }
          : l.name === "psychologist"
            ? { ...l, options: counsellors || [] }
            : l,
      );
      setFields(flds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  useEffect(() => {
    const fls = [...fields].map((l) =>
      l.name === "name" ? { ...l, disabled: !!editData } : l,
    );
    setFields(fls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  useEffect(() => {
    if (patient?.submitSuccess) {
      dispatch(
        togglePatientForm({ data: null, leadData: null, isOpen: false }),
      );
    }
  }, [dispatch, patient?.submitSuccess]);

  const toggleCropModal = () => setIsCropModalOpen(!isCropModalOpen);

  const handleFiles = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    if (!file) return;

    new Compressor(file, {
      quality: 0.5,
      success(result) {
        setImageToCrop(URL.createObjectURL(result));
        setIsCropModalOpen(true);
        validation.handleChange({ target: { name: name, value: result } });
      },
      error(err) {
        console.error(err.message);
      },
    });
  };

  const cropImage = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        canvas.toBlob((blob) => {
          validation.setFieldValue("profilePicture", blob);
          setCroppedImage(canvas.toDataURL());
          toggleCropModal();
        });
      }
    }
  };

  const handleChange = (e, fieldType) => {
    if (fieldType === "file") {
      const name = e.target.name;
      const file = e.target.files[0];
      validation.handleChange({
        target: { name, value: { file, path: e.target.value } },
      });
    } else {
      validation.handleChange(e);
    }
  };

  return (
    <CustomModal
      isOpen={patient.isOpen}
      title={editData ? "Update Patient" : "Add Patient"}
      centered
      size="xl"
    >
      <Form onSubmit={validation.handleSubmit} style={{ padding: "1.5rem" }}>
        <Row>
          {/* Profile Picture Section */}
          <Col
            xs={12}
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "2rem",
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={
                  croppedImage ||
                  editData?.profilePicture?.url ||
                  UserDummyImage
                }
                alt="profile"
                style={{
                  width: 144, // w-36 -> 144px
                  height: 144, // h-36 -> 144px
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #d1d5db", // border-4 border-gray-300
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // shadow-lg
                  transition: "transform 0.2s ease-in-out", // transition-transform
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                } // hover:scale-105
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
              <Label
                htmlFor="profile-img-file-input"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#ffffff", // bg-white
                  borderRadius: "50%",
                  padding: "0.5rem", // p-2
                  cursor: "pointer",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-md
                  transition: "background-color 0.2s ease-in-out", // transition-colors
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                } // hover:bg-gray-100
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ffffff")
                }
              >
                <i
                  className="ri-camera-fill"
                  style={{ color: "#4b5563", fontSize: "1.25rem" }}
                />{" "}
                {/* text-gray-700 text-xl */}
              </Label>
              <Input
                id="profile-img-file-input"
                onChange={handleFiles}
                type="file"
                style={{ display: "none" }} // hidden
                accept="image/*"
                name="profilePicture"
              />
            </div>
          </Col>

          {/* Aadhaar Files */}
          {editData?.aadhaarCard?.url && (
            <Col xs={12} style={{ marginBottom: "1.5rem" }}>
              <UploadedFiles
                title="Patient Files"
                files={[editData.aadhaarCard]}
                deleteFilePermanently={() =>
                  dispatch(removeAadhaarCard({ id: editData._id }))
                }
              />
            </Col>
          )}
          <Col xs={12} style={{ marginBottom: "1.5rem" }}>
            <Row
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <PatientId validation={validation} editData={editData} />
              <div className="mb-3">
                <Label htmlFor="center" className="form-label">
                  Center <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  name="center"
                  id="center"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.center || ""}
                  invalid={
                    validation.touched.center && validation.errors.center
                      ? true
                      : false
                  }
                  disabled={!!editData}
                  className="form-control"
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
                {validation.touched.center && validation.errors.center && (
                  <FormFeedback type="invalid">
                    <div>{validation.errors.center}</div>
                  </FormFeedback>
                )}
              </div>
              <Col
                xs={12}
                md={4}
                style={{
                  minWidth: "340px",
                  width: "100%",
                  flex: "1 1 340px",
                  marginBottom: "1.5rem",
                }}
              >
                <Label
                  htmlFor="referredBy"
                  className="form-label"
                  style={{
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                    color: "#374151",
                  }}
                >
                  Referred By
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
                      validation.setFieldValue(
                        "referredBy",
                        option?.value || "",
                      );
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
                      style={{
                        width: "100%",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.375rem",
                        fontSize: "1rem",
                      }}
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
                          validation.setFieldTouched(
                            "referralPhoneNumber",
                            true,
                          )
                        }
                        defaultCountry="IN"
                        limitMaxLength={true}
                        style={{
                          width: "100%",
                          height: "42px",
                          padding: "0.5rem 0.75rem",
                          border: `1px solid ${
                            validation.touched.referralPhoneNumber &&
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

                {validation.touched.referredBy &&
                  validation.errors.referredBy && (
                    <FormFeedback type="invalid" className="d-block">
                      {validation.errors.referredBy}
                    </FormFeedback>
                  )}
              </Col>
            </Row>
          </Col>

          {/* Main Form Fields */}
          <Col xs={12}>
            <Row
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <FormField
                fields={fields}
                validation={validation}
                doctorLoading={doctorLoading}
                handleChange={handleChange}
              />
            </Row>
          </Col>

          {/* Guardian Header */}
          <Col
            xs={12}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {" "}
            {/* flex items-center gap-4 mb-6 */}
            <h6
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#374151",
                margin: 0,
              }}
            >
              Guardian
            </h6>{" "}
            {/* text-2xl font-semibold text-gray-800 m-0 */}
            <Divider />
          </Col>

          {/* Guardian Fields */}
          <Col xs={12}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "2rem",
                marginBottom: "2.5rem",
              }}
            >
              {(patientGuradianFields || []).map((f, idx) => (
                <div key={f.name + idx}>
                  <Label
                    style={{
                      display: "block",
                      color: "#374151",
                      fontWeight: "500",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {f.label}
                    {f.required && <span className="text-danger">*</span>}
                  </Label>
                  <Input
                    type={f.type}
                    name={f.name}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values[f.name] || ""}
                    className={
                      validation.touched[f.name] && validation.errors[f.name]
                        ? "is-invalid"
                        : ""
                    }
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      fontSize: "1rem",
                      fontWeight: "400",
                      border: `1px solid ${
                        validation.touched[f.name] && validation.errors[f.name]
                          ? "#ef4444"
                          : "#d1d5db"
                      }`,
                      borderRadius: "0.375rem",
                      outline: "none",
                      boxShadow:
                        validation.touched[f.name] && validation.errors[f.name]
                          ? "0 0 0 2px rgba(239, 68, 68, 0.3)"
                          : "0 0 0 2px rgba(96, 165, 250, 0.3)",
                      transition:
                        "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                    }}
                    disabled={f.name === "dateOfAddmission" && !!editData}
                  />
                  {validation.touched[f.name] && validation.errors[f.name] && (
                    <FormFeedback
                      style={{
                        color: "#ef4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {validation.errors[f.name]}
                    </FormFeedback>
                  )}
                </div>
              ))}
            </div>
          </Col>

          {/* Buttons */}
          <Col xs={12}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "2.5rem",
                gap: "1rem",
              }}
            >
              {" "}
              {/* flex justify-end mt-10 gap-4 */}
              <Button
                type="button"
                onClick={cancelForm}
                size="sm"
                color="danger"
                style={{
                  padding: "0.5rem 1.5rem", // px-6 py-2
                  borderRadius: "0.375rem", // rounded-md
                  border: "1px solid #ef4444", // border border-red-500
                  color: "#dc2626", // text-red-600
                  backgroundColor: "transparent",
                  transition:
                    "background-color 0.2s ease-in-out, color 0.2s ease-in-out", // transition-colors
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // shadow-sm
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fef2f2")
                } // hover:bg-red-50
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                color="primary"
                style={{
                  padding: "0.5rem 1.5rem", // px-6 py-2
                  borderRadius: "0.375rem", // rounded-md
                  backgroundColor: "#2563eb", // bg-blue-600
                  color: "#ffffff", // text-white
                  border: "none",
                  transition: "background-color 0.2s ease-in-out", // transition-colors
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-md
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1d4ed8")
                } // hover:bg-blue-700
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563eb")
                }
              >
                {editData ? "Update" : "Save"}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Crop Modal */}
        <CustomModal
          isOpen={isCropModalOpen}
          title="Crop Image"
          centered
          size="lg"
          toggle={toggleCropModal}
        >
          {imageToCrop ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
              }}
            >
              {" "}
              {/* flex flex-col items-center justify-center p-4 */}
              <Cropper
                ref={cropperRef}
                src={imageToCrop}
                style={{
                  width: "100%",
                  maxHeight: 400,
                  marginBottom: "1rem",
                  backgroundColor: "#f3f4f6",
                }} // w-full max-h-96 mb-4 bg-gray-100
                viewMode={1}
                initialAspectRatio={1}
                guides={false}
                cropBoxResizable
                cropBoxMovable
              />
              <Button
                type="button"
                style={{
                  marginTop: "0.75rem", // mt-3
                  padding: "0.5rem 1.5rem", // px-6 py-2
                  borderRadius: "0.375rem", // rounded-md
                  border: "1px solid #10b981", // border border-green-500
                  color: "#059669", // text-green-600
                  backgroundColor: "transparent",
                  transition:
                    "background-color 0.2s ease-in-out, color 0.2s ease-in-out", // transition-colors
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // shadow-sm
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ecfdf5")
                } // hover:bg-green-50
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                onClick={cropImage}
              >
                Crop Image
              </Button>
            </div>
          ) : (
            <p
              style={{ textAlign: "center", color: "#4b5563", padding: "1rem" }}
            >
              No image selected for cropping
            </p>
          )}
        </CustomModal>
      </Form>
    </CustomModal>
  );
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patientForm,
  user: state.User.user,
  centers: state.Center.data,
  doctorLoading: state.User.doctorLoading,
  doctors: state.User.doctor,
  counsellors: state.User.counsellors,
  generatedPatientId: state.Patient.generatedPatientId,
  referrals: state.Referral.data,
  referralsLoading: state.Referral.loading,
});

AddPatient.propTypes = {
  patient: PropTypes.object,
  user: PropTypes.object,
  centers: PropTypes.array,
  generatedPatientId: PropTypes.object,
};

export default connect(mapStateToProps)(AddPatient);
