import React from "react";
import { Col, FormFeedback, Input, Label, Row } from "reactstrap";
import { capitalizeWords } from "../../utils/toCapitalize";
import Select from "react-select";
import * as Yup from "yup";

const RenderFields = ({ fields, validation }) => {


  console.log('fields', fields)

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
            const isFirst = i === 0;

            return (
              <Col xs={12} key={i + field.label} className="mt-3 mb-2">
                <div className="d-flex align-items-center">
                  <h6 className="fw-bold mb-0 me-2">{field.label}</h6>
                  {!isFirst && (
                    <div
                      style={{
                        height: "1px",
                        background: "#dcdcdc",
                        flex: 1,
                      }}
                    />
                  )}
                </div>
              </Col>
            );
          }
          return (
            <Col key={i + field} xs={12} lg={6}>
              <div className="mb-3">
                {!field.labelHidden && <Label htmlFor={field.name} className="form-label">
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
                      <option value="" disabled hidden>
                        Choose here
                      </option>

                      {(field.options || []).map((opt, idx) => {
                        const value = typeof opt === "string" ? opt : opt.value;
                        const label = typeof opt === "string" ? opt : opt.label;

                        return (
                          <option key={idx} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </Input>
                  </>
                ) : field.type === "select2" ? (
                  <>
                    <Select
                      name={field.name}
                      options={field.options || []}
                      isMulti={field.isMulti || false}
                      value={
                        field.isMulti
                          ? (field.options || []).filter(opt =>
                            (validation.values[field.name] || []).includes(opt.value)
                          )
                          : (field.options || []).find(
                            opt => opt.value === validation.values[field.name]
                          ) || null
                      }
                      onChange={(selected) => {
                        if (field.isMulti) {
                          validation.setFieldValue(
                            field.name,
                            selected ? selected.map(item => item.value) : []
                          );
                        } else {
                          validation.setFieldValue(
                            field.name,
                            selected ? selected.value : ""
                          );
                        }
                      }}
                      onBlur={() => validation.setFieldTouched(field.name, true)}
                      classNamePrefix="react-select"

                      styles={{
                        control: (base) => ({
                          ...base,
                          height: "auto",
                          alignItems: "flex-start",
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: "6px 8px",
                          height: "auto",
                          flexWrap: "wrap",
                        }),
                      }}
                    />
                    {validation.touched[field.name] &&
                      validation.errors[field.name] && (
                        <div className="text-danger mt-1">
                          {validation.errors[field.name]}
                        </div>
                      )}
                  </>
                )

                  : field.type === "checkbox" ? (
                    <>
                      <div className="d-flex flex-wrap">
                        {(field.options || []).map((item, idx) => {
                          return (
                            <React.Fragment key={idx}>
                              <div>
                                <div className="d-flex me-3 mb-2 align-items-center">
                                  <Input
                                    className="me-2 mt-0"
                                    type={field.type}
                                    name={field.name}
                                    value={item}
                                    onChange={validation.handleChange}
                                    checked={
                                      Array.isArray(validation.values[field.name]) &&
                                      validation.values[field.name].includes(item)
                                    }
                                  />
                                  <Label className="form-label fs-6 mb-0">
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                  </Label>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                        {validation.touched[field.name] && validation.errors[field.name] ? (
                          <FormFeedback type="invalid" className="d-block">
                            {validation.errors[field.name]}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </>
                  ) : field.type === "radio" ? (
                    <div className="d-flex flex-wrap gap-2">
                      {(field.options || []).map((opt, idx) => {
                        const value = typeof opt === "string" ? opt : opt.value;
                        const label = typeof opt === "string" ? capitalizeWords(opt) : opt.label;

                        return (
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
                              value={value}
                              onChange={validation.handleChange}
                              checked={validation.values[field.name] === value}
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
                                marginTop: "1.5px",
                              }}
                            >
                              {label}
                            </Label>
                          </div>
                        );
                      })}
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
                  )
                }
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
