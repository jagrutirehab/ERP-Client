import React from "react";
import { Col, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import Select from "react-select";
import { getIn } from "formik";

const FormField = ({ field, values, onChange, error }) => {
  const { path, label, type = "text", options = [] } = field;
  const value = getIn(values, path);
  const isInvalid = Boolean(error);

  const setValue = (v) => onChange(path, v);

  const defaultColWidth =
    type === "textarea" ? 12 : type === "multiselect" ? 12 : 6;
  const colWidth = field.colWidth || defaultColWidth;

  const commonProps = {
    id: path,
    name: path,
    invalid: isInvalid,
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: isInvalid ? "#dc3545" : base.borderColor,
      "&:hover": { borderColor: isInvalid ? "#dc3545" : base.borderColor },
    }),
  };

  let control;

  switch (type) {
    case "textarea":
      control = (
        <Input
          {...commonProps}
          type="textarea"
          rows={3}
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
        />
      );
      break;

    case "number":
      control = (
        <Input
          {...commonProps}
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            setValue(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      );
      break;

    case "date":
      control = (
        <Input
          {...commonProps}
          type="date"
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
        />
      );
      break;

    case "datetime-local":
      control = (
        <Input
          {...commonProps}
          type="datetime-local"
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
        />
      );
      break;

    case "yesno": {
      const yesNoOptions = [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ];
      const yesNoValue =
        value === true
          ? yesNoOptions[0]
          : value === false
            ? yesNoOptions[1]
            : null;
      control = (
        <Select
          inputId={path}
          name={path}
          classNamePrefix="select"
          placeholder="-- Select --"
          isClearable
          styles={selectStyles}
          options={yesNoOptions}
          value={yesNoValue}
          onChange={(selected) => {
            const v = selected ? selected.value : "";
            setValue(v === "Yes" ? true : v === "No" ? false : "");
          }}
        />
      );
      break;
    }
    case "checkbox":
      control = (
        <FormGroup check className="mt-2">
          <Input
            type="checkbox"
            id={path}
            name={path}
            invalid={isInvalid}
            checked={value === true}
            onChange={(e) => setValue(e.target.checked)}
          />
          <Label check htmlFor={path}>
            {label}
          </Label>
        </FormGroup>
      );
      break;

    case "select":
      control = (
        <Select
          inputId={path}
          name={path}
          classNamePrefix="select"
          placeholder="-- Select --"
          isClearable
          styles={selectStyles}
          options={options.map((opt) => ({ value: opt, label: opt }))}
          value={value ? { value, label: value } : null}
          onChange={(selected) => setValue(selected ? selected.value : "")}
        />
      );
      break;

    case "multiselect": {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (opt) => {
        setValue(
          selected.includes(opt)
            ? selected.filter((v) => v !== opt)
            : [...selected, opt],
        );
      };
      control = (
        <div
          className="d-flex flex-wrap gap-3 p-2"
          style={
            isInvalid
              ? { border: "1px solid #dc3545", borderRadius: 4 }
              : undefined
          }
        >
          {options.map((opt) => (
            <FormGroup check key={opt} className="me-3">
              <Input
                type="checkbox"
                id={`${path}-${opt}`}
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <Label check htmlFor={`${path}-${opt}`}>
                {opt}
              </Label>
            </FormGroup>
          ))}
        </div>
      );
      break;
    }

    case "text":
    default:
      control = (
        <Input
          {...commonProps}
          type="text"
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
        />
      );
      break;
  }

  return (
    <Col md={colWidth} className="mb-3">
      <FormGroup className="mb-0">
        {type !== "checkbox" && (
          <Label htmlFor={path}>
            {label} <span className="text-danger">*</span>
          </Label>
        )}
        {control}
        {isInvalid &&
          (type === "select" ||
          type === "yesno" ||
          type === "multiselect" ||
          type === "checkbox" ? (
            <div className="text-danger small mt-1">{error}</div>
          ) : (
            <FormFeedback>{error}</FormFeedback>
          ))}
      </FormGroup>
    </Col>
  );
};

export default FormField;
