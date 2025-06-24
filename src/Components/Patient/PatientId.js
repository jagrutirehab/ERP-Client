import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Col, FormFeedback, Input, Label } from "reactstrap";

const PatientId = ({ validation, editData }) => {
  const [enable, setEnable] = useState(true);

  return (
    <React.Fragment>
      <Col xs={12} md={4}>
        <div className="mb-3">
          <Label htmlFor="aadhaar-card" className="form-label">
            Patient Id
            <span className="text-danger">*</span>
          </Label>
          <div className="d-flex gap-3">
            <Input
              type="text"
              name="id"
              bsSize="sm"
              disabled={editData || enable}
              onChange={(e) =>
                validation.setFieldValue("id", e.target.value.toUpperCase())
              }
              onBlur={validation.handleBlur}
              value={validation.values.id || ""}
              autoCapitalize
              invalid={
                validation.touched.id && validation.errors.id ? true : false
              }
              className="form-control"
              placeholder=""
              id="aadhaar-card"
            />
            {!editData && (
              <Button
                size="sm"
                outline
                color="success"
                onClick={() => setEnable(false)}
              >
                Edit
              </Button>
            )}
          </div>
          {validation.touched.id && validation.errors.id ? (
            <FormFeedback type="invalid">
              <div>{validation.errors.id}</div>
            </FormFeedback>
          ) : null}
        </div>
      </Col>
    </React.Fragment>
  );
};

PatientId.propTypes = {};

export default PatientId;
