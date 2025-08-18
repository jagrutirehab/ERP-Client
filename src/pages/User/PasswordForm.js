import React from "react";
import {
  Row,
  Col,
  Form,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
  FormFeedback,
  Button,
  Card,
  CardBody,
} from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { updateUserPassword } from "../../store/actions";
import RenderWhen from "../../Components/Common/RenderWhen";
import { toast } from "react-toastify";
import { useAuthError } from "../../Components/Hooks/useAuthError";

const PasswordForm = ({ userData, isOpen, toggleForm, setUserData, token }) => {
  const dispatch = useDispatch();
  const loader = useSelector((state) => state.User.loading);
  const handleAuthError = useAuthError();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().required("Please Enter Your Password"),
      confirmPassword: Yup.string().oneOf(
        [Yup.ref("password")],
        "Confirm Password Doesn't Match"
      ),
    }),
    onSubmit: async (values) => {
      try {
       await dispatch(
          updateUserPassword({
            id: userData._id,
            newPassword: values.password,
            token,
          })
        ).unwrap();
        setUserData(null);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error("Failed to update password.");
        }
      } finally {
        validation.resetForm();
        toggleForm();
      }
    },
  });

  const cancelForm = () => {
    toggleForm();
    setUserData(null);
    validation.resetForm();
  };

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} centered size="md" className="p-0 border-0">
        <ModalHeader toggle={cancelForm}>Edit Password</ModalHeader>
        <ModalBody className="p-4">
          <Card className="shadow-sm border-0 rounded">
            <CardBody>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  return false;
                }}
                action="#"
              >
                <Row className="gy-3">
                  <Col xs={12}>
                    <div className="mb-3">
                      <Label
                        htmlFor="password"
                        className="form-label fw-semibold"
                      >
                        Password
                      </Label>
                      <Input
                        name="password"
                        className="form-control"
                        placeholder="Enter Password"
                        type="password"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.password || ""}
                        invalid={
                          validation.touched.password &&
                          validation.errors.password
                            ? true
                            : false
                        }
                      />
                      {validation.touched.password &&
                      validation.errors.password ? (
                        <FormFeedback type="invalid">
                          {validation.errors.password}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-3">
                      <Label
                        htmlFor="confirmPassword"
                        className="form-label fw-semibold"
                      >
                        Confirm Password
                      </Label>
                      <Input
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Enter Confirm Password"
                        type="password"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.confirmPassword || ""}
                        invalid={
                          validation.touched.confirmPassword &&
                          validation.errors.confirmPassword
                            ? true
                            : false
                        }
                      />
                      {validation.touched.confirmPassword &&
                      validation.errors.confirmPassword ? (
                        <FormFeedback type="invalid">
                          {validation.errors.confirmPassword}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="d-flex align-items-center justify-content-end gap-2 mt-2">
                      <Button
                        type="submit"
                        size="sm"
                        color="primary"
                        outline
                        className="d-flex align-items-center"
                      >
                        <RenderWhen isTrue={loader}>
                          <div
                            className="spinner-border spinner-border-sm text-light me-2"
                            role="status"
                            style={{ width: "1rem", height: "1rem" }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </RenderWhen>
                        Save
                      </Button>
                      <Button onClick={cancelForm} size="sm" color="danger">
                        Cancel
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default PasswordForm;
