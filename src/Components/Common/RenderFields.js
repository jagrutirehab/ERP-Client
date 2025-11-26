import React from "react";
import { Col, FormFeedback, Input, Label, Row } from "reactstrap";
import { capitalizeWords } from "../../utils/toCapitalize";

const RenderFields = ({ fields, validation }) => {
  return (
    <React.Fragment>
      <Row>
        {(fields.filter((fl) => fl) || []).map((field, i) => {
          if (field.showIf) {
            const conditionField = field.showIf.field;
            const conditionValue = field.showIf.value;

            if (validation.values[conditionField] !== conditionValue) {
              return null;
            }
          }

          if (field.type === "header") {
            return (
              <Col xs={12} key={i + field.label}>
                <h6 className="mt-1 mb-2 fw-bold">
                  {field.label}
                </h6>
              </Col>
            );
          }
          return (
            <Col key={i + field} xs={12} lg={6}>
              <div className="mb-3">
               {!field.labelHidden &&  <Label htmlFor={field.name} className="form-label">
                  {field.label}
                </Label>}
                {field.type === "select" ? (
                  <>
                    <Input
                      name={field.name}
                      className="form-control"
                      placeholder={`Enter ${field.label}`}
                      type={field.type}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values[field.name] || ""}
                      invalid={
                        validation.touched[field.name] &&
                          validation.errors[field.name]
                          ? true
                          : false
                      }
                    >
                      <option value="" selected disabled hidden>
                        Choose here
                      </option>
                      {(field.options || []).map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </Input>
                  </>
                ) : field.type === "checkbox" ? (
                  <>
                    <div className="d-flex flex-wrap">
                      {(field.options || []).map((item, idx) => {
                        return (
                          <React.Fragment key={idx}>
                            <div className="">
                              <div
                                // key={item[field.value]}
                                className="d-flex me-3 mb-2 align-items-center"
                              >
                                <Input
                                  className="me-2 mt-0"
                                  type={field.type}
                                  name={field.name}
                                  value={item}
                                  onChange={validation.handleChange}
                                  checked={validation.values[
                                    field.name
                                  ].includes(item)}
                                />
                                <Label className="form-label fs-9 mb-0">
                                  {item}
                                </Label>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      {validation.touched[field.name] &&
                        validation.errors[field.name] ? (
                        <FormFeedback type="invalid" className="d-block">
                          {validation.errors[field.name]}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </>
                ) : field.type === "radio" ? (
                  <div className="d-flex flex-wrap gap-2">
                    {(field.options || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center px-2 py-1"
                        style={{
                          cursor: "pointer",
                          minWidth: "120px",
                        }}
                      >
                        <Input
                          type="radio"
                          name={field.name}
                          value={item}
                          onChange={validation.handleChange}
                          checked={validation.values[field.name] === item}
                          style={{
                            width: "14px",
                            height: "14px",
                            cursor: "pointer",
                          }}
                        />
                        <Label
                          className="mb-0 ms-1"
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            marginTop: "1.5px"
                          }}
                        >
                          {capitalizeWords(item)}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Input
                    name={field.name}
                    className="form-control"
                    placeholder={`Enter ${field.label}`}
                    type={field.type}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values[field.name] || ""}
                    invalid={
                      validation.touched[field.name] &&
                        validation.errors[field.name]
                        ? true
                        : false
                    }
                  />
                )}
                {validation.touched[field.name] &&
                  validation.errors[field.name] ? (
                  <FormFeedback type="invalid">
                    {validation.errors[field.name]}
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
};

RenderFields.propTypes = {};

export default RenderFields;
