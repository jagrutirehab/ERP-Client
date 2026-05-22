import React, { useState, useEffect } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Collapse,
} from "reactstrap";
import {
  MEDICINE_CATEGORY_OPTIONS,
  MEDICINE_PRIORITY_OPTIONS,
  MEDICINE_INTAKE_OPTIONS,
} from "../../../../Components/constants/sopConstants";
import { getMedicines } from "../../../../helpers/backend_helper";
import DaysActiveSelect from "./DaysActiveSelect";

// AsyncSelect loader against the existing Medicine API.
// The axios interceptor already strips `response.data`, so `res` IS the body.
// The body shape is `{ payload: [...medicines] }` — same as how
// pages/Patient/Dropdowns/Medicine.js reads it in the Prescription form.
const loadMedicineOptions = async (input) => {
  try {
    const res = await getMedicines({ page: 1, limit: 20, search: input || "" });
    const items = Array.isArray(res?.payload)
      ? res.payload
      : Array.isArray(res)
        ? res
        : [];
    return items.map((m) => ({
      value: m._id,
      label: `${m.type ? `${m.type} ` : ""}${m.name}${m.strength ? ` ${m.strength}` : ""}${m.unit ? ` ${m.unit}` : ""}`,
      snapshot: {
        name: m.name || "",
        type: m.type || "",
        strength: m.strength || "",
        unit: m.unit || "",
      },
    }));
  } catch (err) {
    console.warn(
      "[SuggestedMedicineRow] medicine search failed:",
      err?.message || err,
    );
    return [];
  }
};

const SuggestedMedicineRow = ({
  medicine,
  idx,
  onChange,
  onRemove,
  isDisabled,
  error = {},
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Auto-expand on validation error so the user can see what's wrong.
  useEffect(() => {
    if (error && Object.values(error).some(Boolean)) setCollapsed(false);
  }, [error]);

  const set = (key, value) => onChange(idx, key, value);
  const setNested = (parentKey, childKey, value) =>
    onChange(idx, parentKey, { ...medicine[parentKey], [childKey]: value });

  const handleMedicineChange = (selected) => {
    set("medicine", selected);
    if (selected?.snapshot) {
      set("medicineSnapshot", selected.snapshot);
      if (!medicine.dosageAndFrequency?.unit && selected.snapshot.unit) {
        onChange(idx, "dosageAndFrequency", {
          ...medicine.dosageAndFrequency,
          unit: selected.snapshot.unit,
        });
      }
    }
  };

  const dose = medicine.dosageAndFrequency || {};

  return (
    <Card className="mb-3 border-info">
      <CardHeader
        className="d-flex justify-content-between align-items-center bg-light"
        style={{ cursor: "pointer" }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="fw-bold">{idx + 1}</span>
        <div className="d-flex align-items-center gap-2">
          <Button
            type="button"
            color="danger"
            size="sm"
            outline
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
            disabled={isDisabled}
          >
            Remove
          </Button>
          <i
            className={`bx bx-chevron-${collapsed ? "down" : "up"}`}
            style={{ fontSize: "1.25rem" }}
          />
        </div>
      </CardHeader>

      <Collapse isOpen={!collapsed}>
        <CardBody>
          {/* Row 1 — Medicine + Category + Priority */}
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label className="small text-muted mb-1">
                  Medicine <span className="text-danger">*</span>
                </Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadMedicineOptions}
                  value={medicine.medicine}
                  onChange={handleMedicineChange}
                  isDisabled={isDisabled}
                  placeholder="Search medicine by name..."
                  styles={
                    error.medicine
                      ? {
                          control: (base) => ({
                            ...base,
                            borderColor: "#dc3545",
                          }),
                        }
                      : undefined
                  }
                />
                {error.medicine && (
                  <small className="text-danger d-block mt-1">
                    {error.medicine}
                  </small>
                )}
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label className="small text-muted mb-1">Category</Label>
                <Select
                  options={MEDICINE_CATEGORY_OPTIONS}
                  value={medicine.category}
                  onChange={(v) => set("category", v)}
                  isDisabled={isDisabled}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label className="small text-muted mb-1">Priority</Label>
                <Select
                  options={MEDICINE_PRIORITY_OPTIONS}
                  value={medicine.priority}
                  onChange={(v) => set("priority", v)}
                  isDisabled={isDisabled}
                />
              </FormGroup>
            </Col>
          </Row>

          {/* Row 2 — Days Active (integer tags + presets + always-on checkbox) */}
          <DaysActiveSelect
            value={medicine.applicableDays}
            onChange={(days) => set("applicableDays", days)}
            disabled={isDisabled}
          />

          {/* Row 3 — Daily dose (Morning / Afternoon / Evening + Unit + Intake) */}
          <FormGroup>
            <Label className="small text-muted mb-1">
              Daily Dose <span className="text-danger">*</span>
            </Label>
            <Row className="g-2">
              <Col xs={2}>
                <Input
                  placeholder="Morning"
                  type="number"
                  min={0}
                  max={1}
                  value={dose.morning || ""}
                  onChange={(e) =>
                    setNested("dosageAndFrequency", "morning", e.target.value)
                  }
                  disabled={isDisabled}
                  invalid={!!error.dose}
                />
              </Col>
              <Col xs={2}>
                <Input
                  placeholder="Afternoon"
                  type="number"
                  min={0}
                  max={1}
                  value={dose.afternoon || ""}
                  onChange={(e) =>
                    setNested("dosageAndFrequency", "afternoon", e.target.value)
                  }
                  disabled={isDisabled}
                  invalid={!!error.dose}
                />
              </Col>
              <Col xs={2}>
                <Input
                  placeholder="Evening"
                  type="number"
                  min={0}
                  max={1}
                  value={dose.evening || ""}
                  onChange={(e) =>
                    setNested("dosageAndFrequency", "evening", e.target.value)
                  }
                  disabled={isDisabled}
                  invalid={!!error.dose}
                />
              </Col>
              <Col xs={3}>
                <Input
                  placeholder="Unit (tab/ml) *"
                  value={dose.unit || ""}
                  onChange={(e) =>
                    setNested("dosageAndFrequency", "unit", e.target.value)
                  }
                  disabled={isDisabled}
                  invalid={!!error.unit}
                />
              </Col>
              <Col xs={3}>
                <Select
                  options={MEDICINE_INTAKE_OPTIONS}
                  value={medicine.intake}
                  onChange={(v) => set("intake", v)}
                  isDisabled={isDisabled}
                  placeholder="Intake *"
                  styles={
                    error.intake
                      ? {
                          control: (base) => ({
                            ...base,
                            borderColor: "#dc3545",
                          }),
                        }
                      : undefined
                  }
                />
              </Col>
            </Row>
            {(error.dose || error.unit || error.intake) && (
              <small className="text-danger d-block mt-1">
                {[error.dose, error.unit, error.intake]
                  .filter(Boolean)
                  .join(" · ")}
              </small>
            )}
          </FormGroup>

          {/* Row 4 — Instructions + Rationale */}
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label className="small text-muted mb-1">Instructions</Label>
                <Input
                  type="textarea"
                  rows="2"
                  placeholder="instructions..."
                  value={medicine.instructions || ""}
                  onChange={(e) => set("instructions", e.target.value)}
                  disabled={isDisabled}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label className="small text-muted mb-1">
                  Rationale (tooltip in prescription panel)
                </Label>
                <Input
                  type="textarea"
                  rows="2"
                  placeholder="e.g. Section II.1, Standard Adult CDZ taper"
                  value={medicine.rationale || ""}
                  onChange={(e) => set("rationale", e.target.value)}
                  disabled={isDisabled}
                />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default SuggestedMedicineRow;
