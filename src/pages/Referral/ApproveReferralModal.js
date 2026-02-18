import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  Row,
  Col,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";

const ApproveReferralModal = ({ isOpen, toggle, referral, onConfirm }) => {
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      doctorName: referral?.doctorName || "",
      speciality:
        referral?.speciality === "Pending" ? "" : referral?.speciality || "",
      hospitalClinic:
        referral?.hospitalClinic === "Pending"
          ? ""
          : referral?.hospitalClinic || "",
      mobileNumber: referral?.mobileNumber || "",
      email: referral?.email || "",
    },
    validationSchema: Yup.object({
      doctorName: Yup.string().required("Doctor Name is required"),
      speciality: Yup.string().required("Speciality is required"),
      hospitalClinic: Yup.string().required("Hospital/Clinic is required"),
      mobileNumber: Yup.string()
        .required("Mobile Number is required")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          return isValidPhoneNumber(value || "");
        }),
      email: Yup.string().email("Please enter a valid email address"),
    }),
    onSubmit: (values) => {
      onConfirm(values);
      validation.resetForm();
    },
  });

  const handleCancel = () => {
    validation.resetForm();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleCancel} centered size="lg">
      <ModalHeader toggle={handleCancel}>Approve Referral Doctor</ModalHeader>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.handleSubmit();
          return false;
        }}
      >
        <ModalBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label htmlFor="doctorName">
                  Doctor Name <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  id="doctorName"
                  name="doctorName"
                  className="form-control"
                  placeholder="Enter Doctor Name"
                  value={validation.values.doctorName || ""}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={
                    validation.touched.doctorName &&
                    validation.errors.doctorName
                      ? true
                      : false
                  }
                />
                {validation.touched.doctorName &&
                validation.errors.doctorName ? (
                  <FormFeedback type="invalid">
                    {validation.errors.doctorName}
                  </FormFeedback>
                ) : null}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label htmlFor="speciality">
                  Speciality <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  id="speciality"
                  name="speciality"
                  className="form-control"
                  placeholder="e.g., Cardiology"
                  value={validation.values.speciality || ""}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={
                    validation.touched.speciality &&
                    validation.errors.speciality
                      ? true
                      : false
                  }
                />
                {validation.touched.speciality &&
                validation.errors.speciality ? (
                  <FormFeedback type="invalid">
                    {validation.errors.speciality}
                  </FormFeedback>
                ) : null}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label htmlFor="hospitalClinic">
                  Hospital/Clinic <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  id="hospitalClinic"
                  name="hospitalClinic"
                  className="form-control"
                  placeholder="Enter Hospital/Clinic"
                  value={validation.values.hospitalClinic || ""}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={
                    validation.touched.hospitalClinic &&
                    validation.errors.hospitalClinic
                      ? true
                      : false
                  }
                />
                {validation.touched.hospitalClinic &&
                validation.errors.hospitalClinic ? (
                  <FormFeedback type="invalid">
                    {validation.errors.hospitalClinic}
                  </FormFeedback>
                ) : null}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label htmlFor="mobileNumber">
                  Mobile Number <span className="text-danger">*</span>
                </Label>
                <PhoneInputWithCountrySelect
                  placeholder="Enter phone number"
                  name="mobileNumber"
                  value={validation.values.mobileNumber}
                  onBlur={validation.handleBlur}
                  onChange={(value) =>
                    validation.setFieldValue("mobileNumber", value)
                  }
                  limitMaxLength={true}
                  defaultCountry="IN"
                  countries={["IN"]}
                  className="w-100"
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    fontSize: "1rem",
                  }}
                />
                {validation.touched.mobileNumber &&
                  validation.errors.mobileNumber && (
                    <FormFeedback type="invalid" className="d-block">
                      {validation.errors.mobileNumber}
                    </FormFeedback>
                  )}
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Optional"
                  value={validation.values.email || ""}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={
                    validation.touched.email && validation.errors.email
                      ? true
                      : false
                  }
                />
                {validation.touched.email && validation.errors.email ? (
                  <FormFeedback type="invalid">
                    {validation.errors.email}
                  </FormFeedback>
                ) : null}
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button color="success" type="submit">
            Approve Referral
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ApproveReferralModal;
