import React from "react";
import { Col, FormFeedback, Input, Label, Spinner } from "reactstrap";
import RenderWhen from "./RenderWhen";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";

const FormField = ({ fields, validation, doctorLoading, handleChange }) => {
  return (
    <React.Fragment>
      {(fields || []).map((field, i) => (
        <Col
          key={i + field.name}
          xs={12}
          style={{
            minWidth: "340px",
            width: "100%",
            flex: "1 1 340px", // makes it flex-grow to fill space responsively
            marginBottom: "1.5rem", // mb-4
          }}
        >
          <Label
            htmlFor={field.name}
            className="form-label"
            style={{
              fontWeight: "500",
              marginBottom: "0.5rem",
              color: "#374151",
            }}
          >
            {field.label}
            {field.required && <span style={{ color: "#ef4444" }}>*</span>}
          </Label>

          {field.type === "radio" ? (
            <>
              <div className="d-flex flex-wrap">
                {(field.options || []).map((item, idx) => (
                  <div
                    key={item + idx}
                    className="d-flex me-4 align-items-center"
                  >
                    <Input
                      className="me-2 mt-0"
                      type="radio"
                      name={field.name}
                      value={item}
                      onChange={validation.handleChange}
                      checked={validation.values[field.name] === item}
                    />
                    <Label className="form-label fs-14 mb-0">{item}</Label>
                  </div>
                ))}
              </div>
              {validation.touched[field.name] &&
                validation.errors[field.name] && (
                  <FormFeedback type="invalid" className="d-block">
                    {validation.errors[field.name]}
                  </FormFeedback>
                )}
            </>
          ) : field.name === "phoneNumber" || field.type === "phoneNumber" ? (
            <>
              <PhoneInputWithCountrySelect
                placeholder="Enter phone number"
                name={field.name}
                value={validation.values[field.name]}
                onBlur={validation.handleBlur}
                onChange={(value) =>
                  validation.setFieldValue(field.name, value)
                }
                limitMaxLength={true}
                defaultCountry="IN"
                className="w-100"
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                }}
              />
              {validation.touched[field.name] &&
                validation.errors[field.name] && (
                  <FormFeedback type="invalid" className="d-block">
                    {validation.errors[field.name]}
                  </FormFeedback>
                )}
            </>
          ) : field.type === "select" ? (
            <>
              <div className="position-relative d-flex align-items-center">
                <Input
                  type="select"
                  name={field.name}
                  className="form-select"
                  value={validation.values[field.name]}
                  onChange={validation.handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.375rem",
                    fontSize: "1rem",
                  }}
                >
                  <option value="" disabled hidden>
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
                    style={{ right: "50px", position: "absolute" }}
                  >
                    <Spinner size={"sm"} color="success" />
                  </span>
                </RenderWhen>
              </div>
              {validation.touched[field.name] &&
                validation.errors[field.name] && (
                  <FormFeedback type="invalid" className="d-block">
                    {validation.errors[field.name]}
                  </FormFeedback>
                )}
            </>
          ) : (
            <>
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
                onBlur={validation.handleBlur}
                value={
                  field.type !== "file"
                    ? validation.values[field.name] || ""
                    : validation.values[field.name]?.path || ""
                }
                invalid={
                  validation.touched[field.name] &&
                  validation.errors[field.name]
                }
                accept={field.accept}
                disabled={field.disabled}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  ...(field.name === "name" && {
                    textTransform: "capitalize",
                  }),
                }}
              />
              {validation.touched[field.name] &&
                validation.errors[field.name] && (
                  <FormFeedback type="invalid" className="d-block">
                    {validation.errors[field.name]}
                  </FormFeedback>
                )}
            </>
          )}
        </Col>
      ))}
    </React.Fragment>
  );
};

export default FormField;
