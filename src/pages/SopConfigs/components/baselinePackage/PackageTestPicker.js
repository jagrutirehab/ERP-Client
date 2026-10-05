import React from "react";
import Select from "react-select";
import { Badge, Button, Label } from "reactstrap";

/**
 * Which catalogue tests make up the baseline package.
 *
 * Catalogue ids only, no free text: these are the same stable identifiers SOP
 * rule conditions persist, and a second free-text vocabulary would be
 * unmatchable against anything.
 *
 * Panels are one-click fills that expand to their member ids. They are never
 * stored — a panel id is not a catalogue entry, so persisting one would inject a
 * "test" that appears on no report and that the server's validator rejects.
 */
const PackageTestPicker = ({
  tests = [],
  panels = [],
  value = [],
  onChange,
  disabled,
  error,
}) => {
  const options = tests.map((t) => ({
    value: t.id,
    label: t.unit ? `${t.display} (${t.unit})` : t.display,
  }));

  const selected = options.filter((o) => value.includes(o.value));

  const addPanel = (panel) => {
    const merged = [...new Set([...value, ...(panel.tests || [])])];
    onChange(merged);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Label className="mb-0">
          Package Tests <span className="text-danger">*</span>
        </Label>
        <div className="d-flex align-items-center gap-2">
          <Badge color="light" className="text-dark">
            {value.length} selected
          </Badge>
          {value.length > 0 && (
            <Button
              size="sm"
              color="link"
              className="p-0 text-decoration-none"
              onClick={() => onChange([])}
              disabled={disabled}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {panels.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mb-2">
          <small className="text-muted me-1 align-self-center">
            Quick add:
          </small>
          {panels.map((p) => (
            <Button
              key={p.id}
              size="sm"
              color="light"
              onClick={() => addPanel(p)}
              disabled={disabled}
            >
              {p.display}
            </Button>
          ))}
        </div>
      )}

      <Select
        isMulti
        options={options}
        value={selected}
        onChange={(sel) => onChange((sel || []).map((s) => s.value))}
        isDisabled={disabled || options.length === 0}
        placeholder={
          options.length === 0 ? "Loading catalogue..." : "Select tests..."
        }
      />
      {error && <small className="text-danger">{error}</small>}
      <small className="text-muted d-block mt-1">
        Advisory only — nothing matches results against this list. A clinician
        attests that the package was completed; the list tells them what to
        collect.
      </small>
    </div>
  );
};

export default PackageTestPicker;
