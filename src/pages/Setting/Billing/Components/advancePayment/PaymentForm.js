import React, { useState } from "react";
import { Form, Row, Col, Input, Button, FormFeedback, Label } from "reactstrap";
import PropTypes from "prop-types";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { connect, useDispatch } from "react-redux";
import { addPaymentAccount } from "../../../../../store/actions";

const PaymentForm = ({ toggle, centers, userCenters }) => {
  const dispatch = useDispatch();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: "",
      centers: centers.map((cen) => cen._id),
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Account Name"),
      centers: Yup.array().test(
        "notEmpty",
        "At least one center is required",
        (value) => !(!value || value.length === 0)
      ),
    }),
    onSubmit: (values) => {
      dispatch(addPaymentAccount({ ...values, centerIds: userCenters }));
      toggle();
      validation.resetForm();
    },
  });

  return (
    <React.Fragment>
      <div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            // toggle();
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          <Row className="ps-3 pe-3">
            <Col xs={12}>
              <Label>Centers</Label>
              <div className="d-flex flex-wrap gap-3">
                {(centers || []).map((cen) => (
                  <div>
                    <Input
                      type="checkbox"
                      value={cen._id}
                      checked={validation.values?.centers?.includes(cen._id)}
                      name="centers"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                    <Label className="ms-1">{cen.title}</Label>
                  </div>
                ))}
              </div>
              {validation.touched.centers && validation.errors.centers ? (
                <FormFeedback type="invalid" className="d-block">
                  {validation.errors.centers}
                </FormFeedback>
              ) : null}
            </Col>
            <Col md={4}>
              <Label>Account Name</Label>
              <div className="mb-3">
                <Input
                  required
                  bsSize="sm"
                  onChange={validation.handleChange}
                  name="name"
                  value={validation.values.name}
                  type="text"
                  className="form-control"
                />
              </div>
              {validation.touched.items && validation.errors.items ? (
                <FormFeedback type="invalid" className="d-block">
                  {validation.errors.items}
                </FormFeedback>
              ) : null}
            </Col>
            <Col xs={12}>
              <div className="d-flex justify-content-end">
                <Button size="sm" type="submit" color="primary" outline>
                  Save
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

PaymentForm.propTypes = {
  toggle: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  userCenters: state.User?.centerAccess,
});

export default connect(mapStateToProps)(PaymentForm);
