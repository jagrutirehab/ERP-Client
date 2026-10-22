import React from "react";
import { Col, FormFeedback, Input, Label, Row } from "reactstrap";
import { capitalizeWords } from "../../utils/toCapitalize";
import Select from "react-select";
import { getIn } from "formik";

const evaluateCondition = (condition, validation, prefix) => {
  if (!condition) return true;
  const conditionField = condition.field;
  const fieldPath = prefix ? `${prefix}.${conditionField}` : conditionField;
  const currentVal = getIn(validation.values, fieldPath);

  if (condition.value !== undefined && currentVal !== condition.value)
    return false;
  if (condition.notEquals !== undefined && currentVal === condition.notEquals)
    return false;
  if (
    condition.includes !== undefined &&
    (!Array.isArray(currentVal) || !currentVal.includes(condition.includes))
  )
    return false;
  if (
    condition.includesAny !== undefined &&
    (!Array.isArray(currentVal) ||
      !condition.includesAny.some((v) => currentVal.includes(v)))
  )
    return false;

  return true;
};

const RenderFields = ({ fields, validation, prefix }) => {
  const handleCheckboxToggle = (field, optValue) => {
    const fieldPath = prefix ? `${prefix}.${field.name}` : field.name;
    const rawVal = getIn(validation.values, fieldPath);
    const currentArr = Array.isArray(rawVal) ? rawVal : [];
    const isChecked = currentArr.includes(optValue);

    let updated;
    if (isChecked) {
      updated = currentArr.filter((item) => item !== optValue);
    } else {
      if (typeof optValue === "string" && optValue.toLowerCase() === "none") {
        updated = [optValue];
      } else {
        updated = [
          ...currentArr.filter(
            (item) => typeof item !== "string" || item.toLowerCase() !== "none",
          ),
          optValue,
        ];
      }
    }

    validation.setFieldValue(fieldPath, updated);
  };

  return (
    <React.Fragment>
      <Row>
        {(fields.filter((fl) => fl) || []).map((field, i) => {
          if (
            field.showIf &&
            !evaluateCondition(field.showIf, validation, prefix)
          ) {
            return null;
          }

          const isFieldRequired = field.requiredIf
            ? evaluateCondition(field.requiredIf, validation, prefix)
            : field.required;

          if (field.type === "empty") {
            return <Col key={i + "empty"} xs={12} lg={6} />;
          }
          if (field.type === "group") {
            return (
              <Col key={i + "group"} xs={12}>
                <Row>
                  <Col xs={12} lg={6}>
                    {field.left.map((f, li) => (
                      <div key={li} className="mb-3">
                        {!f.labelHidden && (
                          <Label className="form-label">
                            {f.label}
                            {f.required && (
                              <span className="text-danger ms-1">*</span>
                            )}
                          </Label>
                        )}
                        <div className="d-flex flex-wrap gap-2">
                          {(f.options || []).map((opt, idx) => {
                            const value =
                              typeof opt === "string" ? opt : opt.value;
                            const label =
                              typeof opt === "string"
                                ? capitalizeWords(opt)
                                : opt.label;
                            return (
                              <div
                                key={idx}
                                className="d-flex align-items-center px-2 py-1"
                                style={{ cursor: "pointer", minWidth: "120px" }}
                              >
                                <Input
                                  type="radio"
                                  name={f.name}
                                  value={value}
                                  onChange={validation.handleChange}
                                  checked={validation.values[f.name] === value}
                                  onClick={() => {
                                    if (validation.values[f.name] === value)
                                      validation.setFieldValue(f.name, "");
                                  }}
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
                      </div>
                    ))}
                  </Col>
                  <Col xs={12} lg={6}>
                    {field.right.map((f, ri) => (
                      <div key={ri} className="mb-3">
                        {!f.labelHidden && (
                          <Label className="form-label">
                            {f.label}
                            {f.required && (
                              <span className="text-danger ms-1">*</span>
                            )}
                          </Label>
                        )}
                        <div className="d-flex flex-wrap gap-2">
                          {(f.options || []).map((opt, idx) => {
                            const value =
                              typeof opt === "string" ? opt : opt.value;
                            const label =
                              typeof opt === "string"
                                ? capitalizeWords(opt)
                                : opt.label;
                            return (
                              <div
                                key={idx}
                                className="d-flex align-items-center px-2 py-1"
                                style={{ cursor: "pointer", minWidth: "120px" }}
                              >
                                <Input
                                  type="radio"
                                  name={f.name}
                                  value={value}
                                  onChange={validation.handleChange}
                                  checked={validation.values[f.name] === value}
                                  onClick={() => {
                                    if (validation.values[f.name] === value)
                                      validation.setFieldValue(f.name, "");
                                  }}
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
                      </div>
                    ))}
                  </Col>
                </Row>
              </Col>
            );
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
            <Col key={i + field} xs={12} lg={field.fullWidth ? 12 : 6}>
              <div className="mb-3">
                {!field.labelHidden && (
                  <Label htmlFor={field.name} className="form-label">
                    {field.label}
                    {isFieldRequired && (
                      <span className="text-danger ms-1">*</span>
                    )}
                  </Label>
                )}
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
                          ? (field.options || []).filter((opt) =>
                              (validation.values[field.name] || []).includes(
                                opt.value,
                              ),
                            )
                          : (field.options || []).find(
                              (opt) =>
                                opt.value === validation.values[field.name],
                            ) || null
                      }
                      onChange={(selected) => {
                        if (field.isMulti) {
                          validation.setFieldValue(
                            field.name,
                            selected ? selected.map((item) => item.value) : [],
                          );
                        } else {
                          validation.setFieldValue(
                            field.name,
                            selected ? selected.value : "",
                          );
                        }
                        validation.setFieldTouched(field.name, true);
                      }}
                      onBlur={() =>
                        validation.setFieldTouched(field.name, true)
                      }
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
                ) : field.type === "checkboxWithText" ? (
                  <div className="d-flex flex-column gap-2">
                    {(field.options || []).map((opt, idx) => {
                      const value = typeof opt === "string" ? opt : opt.value;
                      const textName =
                        typeof opt === "string" ? null : opt.textName;
                      const fieldPath = prefix
                        ? `${prefix}.${field.name}`
                        : field.name;
                      const rawVal = getIn(validation.values, fieldPath);
                      const currentArr = Array.isArray(rawVal) ? rawVal : [];
                      const isChecked = currentArr.includes(value);

                      return (
                        <div key={idx}>
                          <div
                            className="d-flex align-items-center mb-1"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              if (e.target.tagName !== "INPUT") {
                                handleCheckboxToggle(field, value);
                              }
                            }}
                          >
                            <Input
                              className="me-2 mt-0"
                              type="checkbox"
                              name={fieldPath}
                              value={value}
                              onChange={() =>
                                handleCheckboxToggle(field, value)
                              }
                              checked={isChecked}
                              style={{ cursor: "pointer" }}
                            />
                            <Label
                              className="form-label fs-6 mb-0"
                              style={{ cursor: "pointer" }}
                            >
                              {typeof opt === "object" && opt.label
                                ? opt.label
                                : value.charAt(0).toUpperCase() + value.slice(1)}
                            </Label>
                          </div>
                          {isChecked && textName && (
                            <Input
                              name={textName}
                              className="form-control ms-4"
                              placeholder={`Enter ${value} details`}
                              type="text"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={getIn(validation.values, textName) || ""}
                              style={{ width: "80%" }}
                            />
                          )}
                        </div>
                      );
                    })}
                    {getIn(
                      validation.touched,
                      prefix ? `${prefix}.${field.name}` : field.name,
                    ) &&
                      getIn(
                        validation.errors,
                        prefix ? `${prefix}.${field.name}` : field.name,
                      ) && (
                        <div
                          className="text-danger mt-1"
                          style={{ fontSize: "0.875em" }}
                        >
                          {getIn(
                            validation.errors,
                            prefix ? `${prefix}.${field.name}` : field.name,
                          )}
                        </div>
                      )}
                  </div>
                ) : field.type === "checkbox" ? (
                  <>
                    <div className="d-flex flex-wrap">
                      {(field.options || []).map((item, idx) => {
                        const fieldPath = prefix
                          ? `${prefix}.${field.name}`
                          : field.name;
                        const rawVal = getIn(validation.values, fieldPath);
                        const currentArr = Array.isArray(rawVal) ? rawVal : [];
                        const isChecked = currentArr.includes(item);

                        return (
                          <React.Fragment key={idx}>
                            <div>
                              <div
                                className="d-flex me-3 mb-2 align-items-center"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  if (e.target.tagName !== "INPUT") {
                                    handleCheckboxToggle(field, item);
                                  }
                                }}
                              >
                                <Input
                                  className="me-2 mt-0"
                                  type={field.type}
                                  name={fieldPath}
                                  value={item}
                                  onChange={() =>
                                    handleCheckboxToggle(field, item)
                                  }
                                  checked={isChecked}
                                  style={{ cursor: "pointer" }}
                                />
                                <Label
                                  className="form-label fs-6 mb-0"
                                  style={{ cursor: "pointer" }}
                                >
                                  {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Label>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      {getIn(
                        validation.touched,
                        prefix ? `${prefix}.${field.name}` : field.name,
                      ) &&
                        getIn(
                          validation.errors,
                          prefix ? `${prefix}.${field.name}` : field.name,
                        ) && (
                          <div
                            className="text-danger mt-1"
                            style={{ fontSize: "0.875em" }}
                          >
                            {getIn(
                              validation.errors,
                              prefix ? `${prefix}.${field.name}` : field.name,
                            )}
                          </div>
                        )}
                    </div>
                  </>
                ) : field.type === "radio" ? (
                  <div className="d-flex flex-wrap gap-2">
                    {(field.options || []).map((opt, idx) => {
                      const value = typeof opt === "string" ? opt : opt.value;
                      const label =
                        typeof opt === "string"
                          ? capitalizeWords(opt)
                          : opt.label;

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
                            onClick={() => {
                              if (validation.values[field.name] === value) {
                                validation.setFieldValue(field.name, "");
                              }
                            }}
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
                )}
                {validation.touched[field.name] &&
                validation.errors[field.name] ? (
                  <FormFeedback type="invalid" className="d-block">
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
