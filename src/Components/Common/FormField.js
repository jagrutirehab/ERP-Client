import React from "react";
import PropTypes from "prop-types";
import { Col, FormFeedback, Input, Label, Spinner } from "reactstrap";
import RenderWhen from "./RenderWhen";
import PhoneInputWithCountrySelect, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

const FormField = ({ fields, validation, doctorLoading, handleChange }) => {
  return (
    <React.Fragment>
      {(fields || []).map((field, i) => (
        <Col key={i + field} xs={12} lg={6}>
          <div className="mb-3">
            <Label htmlFor={field.name} className="form-label">
              {field.label}
            </Label>
            {field.type === "radio" ? (
              <>
                <div className="d-flex flex-wrap">
                  {(field.options || []).map((item, idx) => (
                    <React.Fragment key={item + idx}>
                      <div
                        key={item + idx}
                        className="d-flex me-5 align-items-center"
                      >
                        <Input
                          className="me-2 mt-0"
                          type={field.type}
                          name={field.name}
                          value={item}
                          onChange={validation.handleChange}
                          checked={validation.values[field.name] === item}
                        />
                        <Label className="form-label fs-14 mb-0">{item}</Label>
                      </div>
                    </React.Fragment>
                  ))}
                  {validation.touched[field.name] &&
                  validation.errors[field.name] ? (
                    <FormFeedback type="invalid" className="d-block">
                      {validation.errors[field.name]}
                    </FormFeedback>
                  ) : null}
                </div>
              </>
            ) : field.name === "phoneNumber" || field.type === "phoneNumber" ? (
              <>
                <div className="d-flex flex-wrap">
                  <PhoneInputWithCountrySelect
                    placeholder="Enter phone number"
                    name={field.name}
                    value={validation.values[field.name]}
                    onBlur={validation.handleBlur}
                    onChange={(value) => {
                      validation.setFieldValue(field.name, value);
                    }}
                    limitMaxLength={true}
                    className="w-full flex-grow-1"
                    defaultCountry="IN"
                    style={{ height: "40px" }}
                  />
                  {validation.touched[field.name] &&
                  validation.errors[field.name] ? (
                    <FormFeedback type="invalid" className="d-block">
                      {validation.errors[field.name]}
                    </FormFeedback>
                  ) : null}
                </div>
              </>
            ) : field.type === "select" ? (
              <>
                <div
                  // key={item + idx}
                  className="d-flex align-items-center position-relative"
                >
                  <Input
                    className="me-2 fs-13 mt-0"
                    type={field.type}
                    name={field.name}
                    value={validation.values[field.name]}
                    onChange={validation.handleChange}
                  >
                    <option value="" selected disabled hidden>
                      Choose here
                    </option>
                    {(field.options || []).map((option, idx) => (
                      <option key={idx} value={option._id}>
                        {option.name}
                      </option>
                    ))}
                  </Input>
                  <RenderWhen isTrue={doctorLoading}>
                    <span
                      className="link-success dropdown-input-icon"
                      style={{ right: "50px" }}
                    >
                      <Spinner size={"sm"} color="success" />
                    </span>
                  </RenderWhen>
                </div>
                {validation.touched[field.name] &&
                validation.errors[field.name] ? (
                  <FormFeedback type="invalid" className="d-block">
                    {validation.errors[field.name]}
                  </FormFeedback>
                ) : null}
              </>
            ) : (
              <Input
                name={field.name}
                className="form-control"
                placeholder={`Enter ${field.label}`}
                type={field.type}
                onChange={(e) =>
                  handleChange
                    ? handleChange(e, field.type)
                    : validation.handleChange(e)
                }
                style={
                  field.name === "name" ? { textTransform: "capitalize" } : {}
                }
                onBlur={validation.handleBlur}
                value={
                  field.type !== "file"
                    ? validation.values[field.name] || ""
                    : validation.values[field.name]?.path || ""
                }
                invalid={
                  validation.touched[field.name] &&
                  validation.errors[field.name]
                    ? true
                    : false
                }
                accept={field.accept}
                disabled={field.disabled ? true : false}
              />
            )}
            {validation.touched[field.name] && validation.errors[field.name] ? (
              <FormFeedback type="invalid">
                {validation.errors[field.name]}
              </FormFeedback>
            ) : null}
          </div>
        </Col>
      ))}
    </React.Fragment>
  );
};

FormField.propTypes = {};

export default FormField;
