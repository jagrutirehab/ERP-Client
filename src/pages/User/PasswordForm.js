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
} from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { updateUserPassword } from "../../store/actions";

const PasswordForm = ({ userData, isOpen, toggleForm, setUserData }) => {
  const dispatch = useDispatch();

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
    onSubmit: (values) => {
      dispatch(updateUserPassword({ ...values, userId: userData._id }));
      setUserData(null);
      validation.resetForm();
      toggleForm();
    },
  });

  const cancelForm = () => {
    toggleForm();
    setUserData(null);
    validation.resetForm();
  };

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} centered size="xl">
        <ModalHeader toggle={cancelForm}>Edit Password</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
            action="#"
          >
            <Row>
              <Col>
                <div className="mb-3">
                  <Label htmlFor="password" className="form-label">
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
                      validation.touched.password && validation.errors.password
                        ? true
                        : false
                    }
                  />
                  {validation.touched.password && validation.errors.password ? (
                    <FormFeedback type="invalid">
                      {validation.errors.password}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col>
                <div className="mb-3">
                  <Label htmlFor="confirmPassword" className="form-label">
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
                <div className="d-flex align-items-center justify-content-end gap-3">
                  <Button type="submit" size="sm" color="primary" outline>
                    Save
                  </Button>
                  <Button onClick={cancelForm} size="sm" color="danger">
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default PasswordForm;
