import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import withRouter from "../../Components/Hooks/withRouter";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { firstchange } from "../../helpers/backend_helper";
import { closeChangePasswordModal } from "../../store/features/auth/user/userSlice";
import RenderWhen from "../../Components/Common/RenderWhen";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [viewPassword, setViewPassword] = useState(false);
  const [viewNewPassword, setViewNewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const {
    showChangePasswordModal = false,
    tempToken = null,
    loading,
  } = useSelector((state) => state.User || {});

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: async (values) => {
      dispatch({ type: "user/loginUser", payload: { values, navigate } });
    },
  });

  const changePasswordValidation = useFormik({
    enableReinitialize: true,
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Please Enter Your New Password"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Please Confirm Your New Password"),
    }),
    onSubmit: async (values) => {
      try {
        const token = tempToken;
        await firstchange({
          oldPassword: validation.values.password,
          newPassword: values.newPassword,
          token,
        });
        toast.success("Password changed successfully!");
        dispatch(closeChangePasswordModal());
        dispatch({
          type: "user/loginUser",
          payload: {
            values: {
              email: validation.values.email,
              password: values.newPassword,
            },
            navigate,
          },
        });
      } catch (error) {
        console.error("Password change error:", error);
        setChangePasswordError(
          error.response?.data?.message || "Failed to change password"
        );
      }
    },
  });

  document.title = "Login";

  return (
    <React.Fragment>
      <ParticlesAuth>
        <div
          className="auth-page-content"
          style={{ minHeight: "100vh", backgroundColor: "#f4f6f9" }}
        >
          <Container>
            <Row>
              <Col lg={12}>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "3rem",
                    marginBottom: "2rem",
                    color: "#6c757d",
                  }}
                >
                  <div className="d-inline-block auth-logo">
                    <h2 style={{ fontWeight: 600, color: "#4a90e2" }}>
                      Jagruti Rehab Center Dashboard
                    </h2>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <div className="col-12 col-md-8 col-lg-5">
                <Card
                  className="shadow"
                  style={{
                    border: "none",
                    borderRadius: "20px",
                    backgroundColor: "#ffffff",
                    marginTop: "1rem",
                  }}
                >
                  <CardBody style={{ padding: "2rem" }}>
                    <div
                      style={{ textAlign: "center", marginBottom: "1.5rem" }}
                    >
                      <h4 style={{ color: "#1f2937", fontWeight: "600" }}>
                        Welcome Back!
                      </h4>
                      <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                        Sign in to continue.
                      </p>
                    </div>
                    <div>
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                        action="#"
                      >
                        <div className="mb-3">
                          <Label
                            htmlFor="email"
                            className="form-label"
                            style={{ fontWeight: "500", color: "#374151" }}
                          >
                            Email
                          </Label>
                          <Input
                            name="email"
                            className="form-control"
                            placeholder="Enter your email"
                            type="email"
                            autoComplete="on"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.email || ""}
                            invalid={
                              validation.touched.email &&
                              validation.errors.email
                                ? true
                                : false
                            }
                            style={{
                              height: "45px",
                              borderRadius: "10px",
                              borderColor: "#ced4da",
                            }}
                          />
                          {validation.touched.email &&
                          validation.errors.email ? (
                            <FormFeedback type="invalid">
                              {validation.errors.email}
                            </FormFeedback>
                          ) : null}
                        </div>

                        <div className="mb-3">
                          <Label
                            className="form-label"
                            htmlFor="password-input"
                            style={{ fontWeight: "500", color: "#374151" }}
                          >
                            Password
                          </Label>
                          <div
                            className="position-relative auth-pass-inputgroup mb-3"
                            style={{ position: "relative" }}
                          >
                            <Input
                              name="password"
                              value={validation.values.password || ""}
                              type={viewPassword ? "text" : "password"}
                              className="form-control pe-5"
                              placeholder="Enter Password"
                              autoComplete="on"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={
                                validation.touched.password &&
                                validation.errors.password
                                  ? true
                                  : false
                              }
                              style={{
                                height: "45px",
                                borderRadius: "10px",
                                borderColor: "#ced4da",
                              }}
                            />
                            {validation.touched.password &&
                            validation.errors.password ? (
                              <FormFeedback type="invalid">
                                {validation.errors.password}
                              </FormFeedback>
                            ) : null}
                            <button
                              className="btn btn-link position-absolute"
                              type="button"
                              onClick={() => setViewPassword(!viewPassword)}
                              style={{
                                top: "50%",
                                transform: "translateY(-50%)",
                                right: "10px",
                                color: "#6c757d",
                                fontSize: "1.1rem",
                              }}
                            >
                              <i className="ri-eye-fill align-middle"></i>
                            </button>
                          </div>
                          <div
                            style={{
                              textAlign: "right",
                              marginBottom: "0.25rem",
                            }}
                          >
                            <Link
                              to="/forgot-password"
                              className="text-muted"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Forgot password?
                            </Link>
                          </div>
                        </div>
                        <div className="d-grid">
                          <Button
                            disabled={loading}
                            color="success"
                            type="submit"
                            style={{
                              backgroundColor: "#10b981",
                              border: "none",
                              borderRadius: "10px",
                              height: "45px",
                              fontWeight: "500",
                              fontSize: "1rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "10px",
                            }}
                          >
                            <RenderWhen isTrue={loading}>
                              <div
                                className="spinner-border spinner-border-sm"
                                role="status"
                                style={{ width: "1rem", height: "1rem" }}
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </RenderWhen>
                            Sign In
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>

      <Modal
        isOpen={showChangePasswordModal}
        toggle={() => dispatch(closeChangePasswordModal())}
        centered
      >
        <ModalHeader toggle={() => dispatch(closeChangePasswordModal())}>
          Change Password
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              changePasswordValidation.handleSubmit();
              return false;
            }}
          >
            <div className="mb-3">
              <Label
                htmlFor="newPassword"
                className="form-label"
                style={{ fontWeight: "500", color: "#374151" }}
              >
                New Password
              </Label>
              <div
                className="position-relative auth-pass-inputgroup mb-3"
                style={{ position: "relative" }}
              >
                <Input
                  name="newPassword"
                  className="form-control pe-5"
                  placeholder="Enter new password"
                  type={viewNewPassword ? "text" : "password"}
                  onChange={changePasswordValidation.handleChange}
                  onBlur={changePasswordValidation.handleBlur}
                  value={changePasswordValidation.values.newPassword || ""}
                  invalid={
                    changePasswordValidation.touched.newPassword &&
                    changePasswordValidation.errors.newPassword
                      ? true
                      : false
                  }
                  style={{
                    height: "45px",
                    borderRadius: "10px",
                    borderColor: "#ced4da",
                  }}
                />
                {changePasswordValidation.touched.newPassword &&
                changePasswordValidation.errors.newPassword ? (
                  <FormFeedback type="invalid">
                    {changePasswordValidation.errors.newPassword}
                  </FormFeedback>
                ) : null}
                <button
                  className="btn btn-link position-absolute"
                  type="button"
                  onClick={() => setViewNewPassword(!viewNewPassword)}
                  style={{
                    top: "50%",
                    transform: "translateY(-50%)",
                    right: "10px",
                    color: "#6c757d",
                    fontSize: "1.1rem",
                  }}
                >
                  <i className="ri-eye-fill align-middle"></i>
                </button>
              </div>
            </div>

            <div className="mb-3">
              <Label
                htmlFor="confirmPassword"
                className="form-label"
                style={{ fontWeight: "500", color: "#374151" }}
              >
                Confirm Password
              </Label>
              <div
                className="position-relative auth-pass-inputgroup mb-3"
                style={{ position: "relative" }}
              >
                <Input
                  name="confirmPassword"
                  className="form-control pe-5"
                  placeholder="Confirm new password"
                  type={viewConfirmPassword ? "text" : "password"}
                  onChange={changePasswordValidation.handleChange}
                  onBlur={changePasswordValidation.handleBlur}
                  value={changePasswordValidation.values.confirmPassword || ""}
                  invalid={
                    changePasswordValidation.touched.confirmPassword &&
                    changePasswordValidation.errors.confirmPassword
                      ? true
                      : false
                  }
                  style={{
                    height: "45px",
                    borderRadius: "10px",
                    borderColor: "#ced4da",
                  }}
                />
                {changePasswordValidation.touched.confirmPassword &&
                changePasswordValidation.errors.confirmPassword ? (
                  <FormFeedback type="invalid">
                    {changePasswordValidation.errors.confirmPassword}
                  </FormFeedback>
                ) : null}
                <button
                  className="btn btn-link position-absolute"
                  type="button"
                  onClick={() => setViewConfirmPassword(!viewConfirmPassword)}
                  style={{
                    top: "50%",
                    transform: "translateY(-50%)",
                    right: "10px",
                    color: "#6c757d",
                    fontSize: "1.1rem",
                  }}
                >
                  <i className="ri-eye-fill align-middle"></i>
                </button>
              </div>
            </div>

            {changePasswordError && (
              <div className="alert alert-danger" role="alert">
                {changePasswordError}
              </div>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => changePasswordValidation.handleSubmit()}
            style={{
              borderRadius: "10px",
              height: "45px",
              fontWeight: "500",
            }}
          >
            Change Password
          </Button>
          <Button
            color="secondary"
            onClick={() => dispatch(closeChangePasswordModal())}
            style={{
              borderRadius: "10px",
              height: "45px",
              fontWeight: "500",
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default withRouter(Login);
