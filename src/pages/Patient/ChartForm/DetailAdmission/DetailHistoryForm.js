import React from "react";
import PropTypes from "prop-types";
import RenderFields from "../../../../Components/Common/RenderFields";
import { Button, Col, Input, Label, Row } from "reactstrap";
import NextButton from "./NextButton";

const fields = [
  {
    label: "History / Onset Duration & Progress",
    name: "history",
    type: "textarea",
  },
  {
    label: "Negative History",
    name: "negativeHistory",
    type: "textarea",
  },
  {
    label: "Past History",
    name: "pastHistory",
    type: "textarea",
  },
  {
    label: "Development History & Childhood/Adolescence",
    name: "developmentHistory",
    type: "textarea",
  },
  {
    label: "Occupation History",
    name: "occupationHistory",
    type: "textarea",
  },
  {
    label: "Family History",
    name: "familyHistory",
    type: "textarea",
  },
  {
    label: "Personal / Sexual / Marital History",
    name: "personalHistory",
    type: "textarea",
  },
  {
    label: "Personality",
    name: "personality",
    type: "textarea",
  },
  {
    label: "Social Support",
    name: "socialSupport",
    type: "textarea",
  },
];

const DetailHistoryForm = ({ validation, setFormStep, step }) => {
  return (
    <React.Fragment>
      <div>
        <Row>
          <Col xs={12} md={6}>
            <div className="mb-3">
              <Label>Informant</Label>
              <div className="input-group">
                <div className="input-group-text">Self +</div>
                <Input
                  type="text"
                  style={{
                    borderTopLeftRadius: "0 !important",
                    borderBottomLeftRadius: "0 !important",
                  }}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.informant || ""}
                  invalid={
                    validation.touched.informant && validation.errors.informant
                      ? true
                      : false
                  }
                  name="informant"
                  className="form-control"
                  aria-label="With textarea"
                  rows="2"
                />
              </div>
            </div>
          </Col>
          <Col xs={12} md={3}>
            <div className="mt-2">
              <Label></Label>
              <Input
                type="select"
                name="reliable"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.reliable || ""}
                invalid={
                  validation.touched.reliable && validation.errors.reliable
                    ? true
                    : false
                }
                className="form-control"
                aria-label="With textarea"
                rows="2"
              >
                <option>Reliable</option>
                <option>Unrelaible</option>
              </Input>
            </div>
          </Col>
          <Col>
            <div className="mt-2">
              <Label></Label>
              <Input
                type="select"
                name="adequate"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.adequate || ""}
                invalid={
                  validation.touched.adequate && validation.errors.adequate
                    ? true
                    : false
                }
                className="form-control"
                aria-label="With textarea"
                rows="2"
              >
                <option>Adequate</option>
                <option>Inadequate</option>
              </Input>
            </div>
          </Col>
        </Row>
        <RenderFields fields={fields} validation={validation} />
        <NextButton setFormStep={setFormStep} step={step} />
      </div>
    </React.Fragment>
  );
};

DetailHistoryForm.propTypes = {};

export default DetailHistoryForm;
