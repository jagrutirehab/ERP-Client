import React, { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";
import FormField from "../../../Components/Common/FormField";
import { connect, useDispatch } from "react-redux";
import { addUserDetailInformation } from "../../../store/actions";

const EducationalDetailForm = ({ user, form, toggle }) => {
  const dispatch = useDispatch();

  const [certificates, setCertificates] = useState([
    { file: null, name: "10th Certificate" },
    { file: null, name: "12th Certificate" },
    { file: null, name: "1st Certificate" },
    { file: null, name: "2nd Certificate" },
    { file: null, name: "3rd Certificate" },
    { file: null, name: "4th Certificate" },
    { file: null, name: "Graduation Certificate" },
    { file: null, name: "Post Graduation Certificate" },
  ]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      certificates: [],
    },
    validationSchema: Yup.object({
      // name: Yup.string().required("Please Enter Your Name"),
    }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("dataId", user.detailInformation?._id || "");
      formData.append("certificates", JSON.stringify(certificates));
      if (certificates?.length)
        certificates.forEach((c) => formData.append("certificate", c.file));

      dispatch(addUserDetailInformation(formData));
    },
  });

  const addCertificate = () => {
    setCertificates([...certificates, { name: "", file: null }]);
  };

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
            {(certificates || []).map((c, i) => (
              <>
                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <Label className="form-label">Name</Label>
                    <Input
                      type="text"
                      name="name"
                      onChange={(e) => {
                        const value = e.target.value;
                        const cs = [...certificates];
                        cs[i].name = value;
                        setCertificates(cs);
                      }}
                      required
                      onBlur={validation.handleBlur}
                      value={c.name || ""}
                      className="form-control"
                      placeholder=""
                      accept="image/*"
                    />
                  </div>
                </Col>
                <Col xs={10} md={5}>
                  <div className="mb-3">
                    <Label className="form-label">Certificate</Label>
                    <Input
                      type="file"
                      name="certificate"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const cs = [...certificates];
                        cs[i].file = file;
                        setCertificates(cs);
                      }}
                      required
                      onBlur={validation.handleBlur}
                      //   value={files.panCard || ""}
                      className="form-control"
                      placeholder=""
                      accept="image/*"
                    />
                  </div>
                </Col>
                <Col className="" xs={2} md={1}>
                  <div className="d-flex align-items-center h-100">
                    <Button
                      onClick={() => {
                        let cs = [...certificates];
                        cs.splice(i, 1);
                        setCertificates(cs);
                      }}
                      className="mt-2"
                      color="danger"
                      size="sm"
                    >
                      <i className="ri-delete-bin-5-line text-white align-bottom text-muted"></i>{" "}
                    </Button>
                  </div>
                </Col>
              </>
            ))}

            <Col xs={12}>
              <div>
                <Button
                  onClick={addCertificate}
                  color="success"
                  size="sm"
                  outline
                >
                  add
                </Button>
              </div>
            </Col>
            <Col xs={12}>
              <div className="d-flex align-items-center justify-content-end gap-3">
                <Button onClick={toggle} size="sm" color="danger">
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

EducationalDetailForm.propTypes = {};

const mapStateToProps = (state) => ({
  user: state.User.user,
});

export default connect(mapStateToProps)(EducationalDetailForm);
