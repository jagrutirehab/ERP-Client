import React from "react";
import PropTypes from "prop-types";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";

//modal
import CustomModal from "../../Components/Common/Modal";

import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";

//redux
import { connect, useDispatch } from "react-redux";
import {
  addReferral,
  createEditReferral,
  updateReferral,
} from "../../store/actions";

const ReferralForm = ({ user, isOpen, referral, centerAccess }) => {
  const dispatch = useDispatch();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: user ? user._id : "",
      doctorName: referral ? referral.doctorName : "",
      speciality: referral ? referral.speciality : "",
      hospitalClinic: referral ? referral.hospitalClinic : "",
      mobileNumber: referral ? referral.mobileNumber : "",
      email: referral ? referral.email : "",
    },
    validationSchema: Yup.object({
      doctorName: Yup.string().required("Referral Doctor's Name is required"),
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
      if (referral) {
        dispatch(
          updateReferral({
            ...values,
            id: referral._id,
            centerAccess,
          })
        );
      } else {
        dispatch(
          addReferral({
            ...values,
            centerAccess,
          })
        );
      }
      closeForm();
    },
  });

  const closeForm = () => {
    validation.resetForm();
    dispatch(createEditReferral({ isOpen: false, data: null }));
  };

  const referralFields = [
    {
      name: "doctorName",
      label: "Referral Doctor's Name",
      type: "text",
      required: true,
    },
    {
      name: "speciality",
      label: "Speciality",
      type: "text",
      required: true,
    },
    {
      name: "hospitalClinic",
      label: "Hospital/Clinic",
      type: "text",
      required: true,
    },
    {
      name: "mobileNumber",
      label: "Mobile Number",
      type: "phoneNumber",
      required: true,
    },
    {
      name: "email",
      label: "Email ID",
      type: "email",
      required: false,
    },
  ];

  return (
    <React.Fragment>
      <CustomModal
        centered
        isOpen={isOpen}
        size={"lg"}
        title={referral ? "Edit Referral" : "Add Referral"}
      >
        <div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
            action="#"
          >
            <Row>
              {referralFields.map((field, i) => (
                <Col key={i + field.name} xs={12} lg={6}>
                  <div className="mb-3">
                    <Label htmlFor={field.name} className="form-label">
                      {field.label}
                      {field.required && (
                        <span className="text-danger"> *</span>
                      )}
                    </Label>
                    {field.type === "phoneNumber" ? (
                      <>
                        <PhoneInputWithCountrySelect
                          placeholder="Enter phone number"
                          name={field.name}
                          value={validation.values[field.name]}
                          onBlur={validation.handleBlur}
                          onChange={(value) =>
                            validation.setFieldValue(field.name, value)
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
                        {validation.touched[field.name] &&
                          validation.errors[field.name] && (
                            <FormFeedback type="invalid" className="d-block">
                              {validation.errors[field.name]}
                            </FormFeedback>
                          )}
                      </>
                    ) : (
                      <>
                        <Input
                          name={field.name}
                          className="form-control"
                          placeholder={`Enter ${field.label}`}
                          type={field.type}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values[field.name] || ""}
                          invalid={
                            validation.touched[field.name] &&
                            validation.errors[field.name]
                              ? true
                              : false
                          }
                        />
                        {validation.touched[field.name] &&
                        validation.errors[field.name] ? (
                          <FormFeedback type="invalid">
                            {validation.errors[field.name]}
                          </FormFeedback>
                        ) : null}
                      </>
                    )}
                  </div>
                </Col>
              ))}
              <Col xs={12}>
                <div className="d-flex align-items-center justify-content-end gap-3 mt-3">
                  <Button type="submit" size="sm" color="primary" outline>
                    Save
                  </Button>
                  <Button onClick={closeForm} size="sm" color="danger">
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </CustomModal>
    </React.Fragment>
  );
};

ReferralForm.propTypes = {
  user: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  referral: PropTypes.object,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  user: state.User.user,
  isOpen: state.Referral.createEditReferral?.isOpen,
  referral: state.Referral.createEditReferral?.data,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(ReferralForm);
