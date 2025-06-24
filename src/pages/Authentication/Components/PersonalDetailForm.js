import React, { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";
import FormField from "../../../Components/Common/FormField";
import { connect, useDispatch } from "react-redux";
import convertToFormData from "../../../utils/convertToFormData";
import { addUserDetailInformation } from "../../../store/actions";

const PersonalDetailForm = ({ form, toggle, user }) => {
  const dispatch = useDispatch();

  const [files, setFiles] = useState({
    aadhaarCard: null,
    panCard: null,
  });

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: user ? user.name : "",
      fatherName: "",
      motherName: "",
      dateOfBirth: "",
      gender: "",
      emergencyContactNumber: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Your Name"),
    }),
    onSubmit: (values) => {
      const formData = convertToFormData(values);
      formData.append("userId", user._id);
      formData.append("dataId", user.detailInformation?._id || "");
      if (files?.aadhaarCard) formData.append("aadhaarCard", files.aadhaarCard);
      if (files?.panCard) formData.append("panCard", files.panCard);

      dispatch(addUserDetailInformation(formData));
      // validation.resetForm()
      // toggle();
    },
  });

  const fieldsArray = [
    {
      label: "Name",
      name: "name",
      type: "text",
    },
    {
      label: "Father Name",
      name: "fatherName",
      type: "text",
    },
    {
      label: "Mother Name",
      name: "motherName",
      type: "text",
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "Date",
    },
    {
      label: "Gender",
      name: "gender",
      type: "radio",
      options: ["MALE", "FEMALE", "OTHERS"],
    },
    {
      label: "Emergency Contact Number",
      name: "emergencyContactNumber",
      type: "text",
    },
  ];

  return (
    <React.Fragment>
      <CustomModal
        title={"Personal Details Form"}
        size={"lg"}
        centered
        isOpen={form.isOpen}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
          action="#"
        >
          <Row>
            <FormField fields={fieldsArray} validation={validation} />
            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label htmlFor="aadhaar-card" className="form-label">
                  Aadhaar Card
                </Label>
                <Input
                  type="file"
                  name="aadhaarCard"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setFiles({ ...files, aadhaarCard: e.target.files[0] });
                  }}
                  onBlur={validation.handleBlur}
                  //   value={files.aadhaarCard || ""}
                  invalid={
                    validation.touched.center && validation.errors.center
                      ? true
                      : false
                  }
                  className="form-control"
                  placeholder=""
                  id="aadhaar-card"
                  accept="image/*"
                />
                {validation.touched.center && validation.errors.center ? (
                  <FormFeedback type="invalid">
                    <div>{validation.errors.center}</div>
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label htmlFor="pan-card" className="form-label">
                  Aadhaar Card
                </Label>
                <Input
                  type="file"
                  name="panCard"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setFiles({ ...files, panCard: e.target.files[0] });
                  }}
                  onBlur={validation.handleBlur}
                  //   value={files.panCard || ""}
                  invalid={
                    validation.touched.center && validation.errors.center
                      ? true
                      : false
                  }
                  className="form-control"
                  placeholder=""
                  id="pan-card"
                  accept="image/*"
                />
                {validation.touched.center && validation.errors.center ? (
                  <FormFeedback type="invalid">
                    <div>{validation.errors.center}</div>
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12}>
              <div className="d-flex align-items-center justify-content-end gap-3">
                <Button
                  onClick={() => {
                    toggle();
                    validation.resetForm();
                  }}
                  size="sm"
                  color="danger"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" outline>
                  Save
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    </React.Fragment>
  );
};

PersonalDetailForm.propTypes = {};

const mapStateToProps = (state) => ({
  user: state.User.user,
});

export default connect(mapStateToProps)(PersonalDetailForm);
