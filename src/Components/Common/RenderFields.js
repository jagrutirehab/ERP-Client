import React from "react";
import { Col, FormFeedback, Input, Label, Row } from "reactstrap";

const RenderFields = ({ fields, validation }) => {
  return (
    <React.Fragment>
      <Row>
        {(fields.filter((fl) => fl) || []).map((field, i) => {
          return (
            <Col key={i + field} xs={12} lg={6}>
              <div className="mb-3">
                <Label htmlFor={field.name} className="form-label">
                  {field.label}
                </Label>
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
