import React from "react";
import { Col, FormGroup, Input, Label } from "reactstrap";
import Select from "react-select";
import { getIn } from "formik";

const FormField = ({ field, values, onChange }) => {
  const { path, label, type = "text", options = [] } = field;
  const value = getIn(values, path);

  const setValue = (v) => onChange(path, v);

  const defaultColWidth =
    type === "textarea" ? 12 : type === "multiselect" ? 12 : 6;
  const colWidth = field.colWidth || defaultColWidth;

  const commonProps = {
    id: path,
    name: path,
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

    case "select":
      control = (
        <Select
          inputId={path}
          name={path}
          classNamePrefix="select"
          placeholder="-- Select --"
          isClearable
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
        <div className="d-flex flex-wrap gap-3">
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
        <Label htmlFor={path}>{label}</Label>
        {control}
      </FormGroup>
    </Col>
  );
};

export default FormField;
