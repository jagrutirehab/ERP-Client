import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";

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
} from "../../../store/actions";
import {
  ADMIT_PATIENT,
  EDIT_ADMISSION,
} from "../../../Components/constants/patient";
import FormField from "../../../Components/Common/FormField";
import Divider from "../../../Components/Common/Divider";
import { format } from "date-fns";

const AdmitPatient = ({
  isOpen,
  data,
  patient,
  centers,
  doctors,
  counsellors,
  doctorLoading,
}) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);

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
      //guardian
      guardianName: patient ? patient.guardianName : "",
      guardianRelation: patient ? patient.guardianRelation : "",
      guardianPhoneNumber: patient ? patient.guardianPhoneNumber : "",
      referredBy: patient ? patient.referredBy : "",
      ipdFileNumber: patient ? patient.ipdFileNumber : "",

      //admission
      center: data ? data.center?._id : "",
      addmissionDate: data ? new Date(data.addmissionDate) : "",
      ...(data?.dischargeDate && {
        dischargeDate: data ? new Date(data.dischargeDate) : "",
      }),
      psychologist: data ? data.psychologist?._id : "",
      doctor: data ? data.doctor?._id : "",
      provisionalDiagnosis: data ? data.provisionalDiagnosis : "",
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
      //patient guardian
      guardianName: Yup.string().required("Please select Guardian Name"),
      guardianRelation: Yup.string().required(
        "Please select Guardian Relation"
      ),
      guardianPhoneNumber: Yup.string().required(
        "Please select Guardian Phone Number"
      ),
      referredBy: Yup.string().required("Please select Referred By"),
      // ipdFileNumber: Yup.string().required("Please select Ipd File Number"),
      //admission
      addmissionDate: Yup.date().required("Please select addmission date"),
      center: Yup.string().required("Please select center"),
      psychologist: Yup.string().required("Please select Psychologist"),
      doctor: Yup.string().required("Please select Doctor"),
      provisionalDiagnosis: Yup.string().required(
        "Please select Provisional Diagnosis"
      ),
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

  const patientFields = [
    // {
    //   label: "Aadhaar Card Number",
    //   name: "aadhaarCardNumber",
    //   type: "text",
    // },
    // {
    //   label: "Aadhaar Card",
    //   name: "aadhaarCard",
    //   type: "file",
    //   accept: "image/*",
    // },
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
    {
      label: "Referred By",
      name: "referredBy",
      type: "text",
      required: true,
    },
    {
      label: "IPD File Number",
      name: "ipdFileNumber",
      type: "text",
      required: false,
    },
  ];

  const admissionFields = [
    {
      label: "Provisional Diagnosis",
      name: "provisionalDiagnosis",
      type: "text",
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

  const renderStep1 = () => (
    <>
      <Row>
        <FormField
          fields={patientFields}
          validation={validation}
          doctorLoading={doctorLoading}
          handleChange={handleChange}
        />
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
      </Row>
      <div className="d-flex justify-content-end mt-3">
        <Button
          onClick={() => {
            // Get all required fields from step 1 (excluding email)
            const step1Fields = [
              ...patientFields.filter((f) => f.name !== "email"), // Exclude email from required fields
              ...patientGuardianFields.filter(
                (f) => f.name !== "ipdFileNumber"
              ),
              // ...patientGuardianFields,
            ].map((f) => f.name);

            // Touch all fields to trigger validation
            step1Fields.forEach((field) => {
              validation.setFieldTouched(field, true);
            });

            // Check if there are any validation errors
            const step1Errors = step1Fields.filter(
              (field) => validation.errors[field]
            );

            // Check if any required fields are empty (excluding email)
            const emptyFields = step1Fields.filter(
              (field) =>
                !validation.values[field] ||
                validation.values[field].toString().trim() === ""
            );

            if (step1Errors.length > 0 || emptyFields.length > 0) {
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

  const renderStep2 = () => (
    <>
      <Row>
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
                  now.getMilliseconds()
                );
                const event = { target: { name: "addmissionDate", value: e } };
                validation.handleChange(event);
              }}
              options={{
                dateFormat: "d M, Y h:i K",
                enableTime: true,
                time_24hr: false,
                // enable: [
                //   (date) =>
                //     patient?.addmission?.dischargeDate
                //       ? date > new Date(patient?.addmission?.dischargeDate)
                //       : true,
                // ],
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
                    now.getMilliseconds()
                  );
                  const event = { target: { name: "dischargeDate", value: e } };
                  validation.handleChange(event);
                }}
                options={{
                  dateFormat: "d M, Y",
                  // enable: [
                  //   (date) =>
                  //     patient?.addmission?.dischargeDate
                  //       ? date > new Date(patient?.addmission?.dischargeDate)
                  //       : true,
                  // ],
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
              ...patientFields.filter((f) => f.name !== "email"), // Exclude email from required fields
              ...patientGuardianFields.filter(
                (f) => f.name !== "ipdFileNumber"
              ),
              // ...patientGuardianFields,
            ].map((f) => f.name);

            // Touch all step 1 fields
            step1Fields.forEach((field) => {
              validation.setFieldTouched(field, true);
            });

            // Check step 1 validation
            const step1Errors = step1Fields.filter(
              (field) => validation.errors[field]
            );
            const step1EmptyFields = step1Fields.filter(
              (field) =>
                !validation.values[field] ||
                validation.values[field].toString().trim() === ""
            );

            // Then validate step 2 fields
            const step2Fields = [
              "center",
              "addmissionDate",
              ...admissionFields.map((f) => f.name),
            ];

            // Touch all step 2 fields
            step2Fields.forEach((field) => {
              validation.setFieldTouched(field, true);
            });

            // Check step 2 validation
            const step2Errors = step2Fields.filter(
              (field) => validation.errors[field]
            );
            const step2EmptyFields = step2Fields.filter(
              (field) =>
                !validation.values[field] ||
                validation.values[field].toString().trim() === ""
            );

            // If there are any errors or empty fields, don't submit
            if (
              step1Errors.length > 0 ||
              step1EmptyFields.length > 0 ||
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
                ...patientFields.filter((f) => f.name !== "email"), // Exclude email from required fields
                ...patientGuardianFields.filter(
                  (f) => f.name !== "ipdFileNumber"
                ),
                // ...patientGuardianFields,
              ].map((f) => f.name);

              // Touch all fields to trigger validation
              step1Fields.forEach((field) => {
                validation.setFieldTouched(field, true);
              });

              // Check if there are any validation errors
              const step1Errors = step1Fields.filter(
                (field) => validation.errors[field]
              );

              // Check if any required fields are empty
              const emptyFields = step1Fields.filter(
                (field) =>
                  !validation.values[field] ||
                  validation.values[field].toString().trim() === ""
              );

              if (step1Errors.length > 0 || emptyFields.length > 0) {
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
                ...patientFields.filter((f) => f.name !== "email"), // Exclude email from required fields
                ...patientGuardianFields.filter(
                  (f) => f.name !== "ipdFileNumber"
                ),
                // ...patientGuardianFields,
              ].map((f) => f.name);

              const hasErrors = step1Fields.some(
                (field) => validation.errors[field]
              );
              const hasEmptyFields = step1Fields.some(
                (field) =>
                  !validation.values[field] ||
                  validation.values[field].toString().trim() === ""
              );

              return hasErrors || hasEmptyFields;
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
});

export default connect(mapStateToProps)(AdmitPatient);
