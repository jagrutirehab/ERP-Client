import React, { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import { addUserDetailInformation } from "../../../store/actions";

const WorkExperienceForm = ({ user, form, toggle }) => {
  const dispatch = useDispatch();

  const [experienceLetters, setExperienceLetters] = useState([{ file: null }]);
  const [paySlips, setPaySlips] = useState([{ file: null }]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      experienceLetters: [],
      paySlips: [],
    },
    validationSchema: Yup.object({
      // name: Yup.string().required("Please Enter Your Name"),
    }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("dataId", user.detailInformation?._id || "");
      if (experienceLetters?.length)
        experienceLetters.forEach((e) =>
          formData.append("experienceLetter", e.file)
        );
      if (paySlips?.length)
        paySlips.forEach((e) => formData.append("paySlip", e.file));

      dispatch(addUserDetailInformation(formData));
    },
  });

  const addExperienceLetters = () => {
    setExperienceLetters([...experienceLetters, { file: null }]);
  };

  const addPaySlips = () => {
    setPaySlips([...paySlips, { file: null }]);
  };

  return (
    <React.Fragment>
      <CustomModal
        title={"Work Experience Form"}
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
            <Col md={6}>
              <Row>
                {(experienceLetters || []).map((c, i) => (
                  <>
                    <Col xs={10} md={10}>
                      <div className="mb-3">
                        <Label className="form-label">Experience Letter</Label>
                        <Input
                          type="file"
                          name="certificate"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const cs = [...experienceLetters];
                            cs[i].file = file;
                            setExperienceLetters(cs);
                          }}
                          onBlur={validation.handleBlur}
                          //   value={files.panCard || ""}
                          className="form-control"
                          placeholder=""
                          accept="image/*, application/pdf"
                        />
                      </div>
                    </Col>
                    <Col className="" xs={2} md={1}>
                      <div className="d-flex align-items-center h-100">
                        <Button
                          onClick={() => {
                            let cs = [...experienceLetters];
                            cs.splice(i, 1);
                            setExperienceLetters(cs);
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
              </Row>
            </Col>

            <Col md={6}>
              <Row>
                {(paySlips || []).map((c, i) => (
                  <>
                    <Col xs={10} md={10}>
                      <div className="mb-3">
                        <Label className="form-label">Pay Slip</Label>
                        <Input
                          type="file"
                          name="certificate"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const cs = [...paySlips];
                            cs[i].file = file;
                            setPaySlips(cs);
                          }}
                          onBlur={validation.handleBlur}
                          //   value={files.panCard || ""}
                          className="form-control"
                          placeholder=""
                          accept="image/*, application/pdf"
                        />
                      </div>
                    </Col>
                    <Col className="" xs={2} md={1}>
                      <div className="d-flex align-items-center h-100">
                        <Button
                          onClick={() => {
                            let cs = [...paySlips];
                            cs.splice(i, 1);
                            setPaySlips(cs);
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
              </Row>
            </Col>

            <Col xs={6}>
              <div>
                <Button
                  onClick={addExperienceLetters}
                  color="success"
                  size="sm"
                  outline
                >
                  add Letters
                </Button>
              </div>
            </Col>
            <Col xs={6}>
              <div>
                <Button onClick={addPaySlips} color="success" size="sm" outline>
                  add Slips
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

WorkExperienceForm.propTypes = {};

const mapStateToProps = (state) => ({
  user: state.User.user,
});

export default connect(mapStateToProps)(WorkExperienceForm);
