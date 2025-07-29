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
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { useDispatch } from "react-redux";
import { loginUser } from "../../store/actions";
import { Link, useNavigate } from "react-router-dom";
import withRouter from "../../Components/Hooks/withRouter";
import * as Yup from "yup";
import { useFormik } from "formik";

const Login = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [viewPassword, setViewPassword] = useState(false);

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
    onSubmit: (values) => {
      dispatch(loginUser({ values, navigate }));
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
                            color="success"
                            type="submit"
                            style={{
                              backgroundColor: "#10b981",
                              border: "none",
                              borderRadius: "10px",
                              height: "45px",
                              fontWeight: "500",
                              fontSize: "1rem",
                            }}
                          >
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
    </React.Fragment>
  );
};

export default withRouter(Login);
