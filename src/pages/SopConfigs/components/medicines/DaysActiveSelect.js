import { useId, useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import {
  FormGroup,
  Label,
  Input,
  Button,
  ButtonGroup,
  Row,
  Col,
} from "reactstrap";

/**
 * Integer-only multi-tag select for "which days of admission this medicine is active".
 *
 *   value:    Number[]                — sorted unique day numbers (empty = throughout admission)
 *   onChange: (Number[]) => void
 *
 * Behaviour:
 *   - User types "1", "2", "10" etc. → press Enter → adds a "Day N" tag.
 *   - Non-integer or negative input is rejected.
 *   - Preset buttons (1-10, 1-15, 1-30, 1-45) expand into individual day tags.
 *   - "Throughout admission" checkbox short-circuits to [] (no day filter).
 */
const PRESETS = [
  { label: "Day 1 only",  range: [1, 1] },
  { label: "1-10 days",   range: [1, 10] },
  { label: "1-15 days",   range: [1, 15] },
  { label: "1-30 days",   range: [1, 30] },
  { label: "1-45 days",   range: [1, 45] },
];

const expandRange = (from, to) => {
  const out = [];
  for (let i = from; i <= to; i++) out.push(i);
  return out;
};

const dedupSort = (arr) =>
  [...new Set(arr.filter((n) => Number.isInteger(n) && n >= 0))].sort(
    (a, b) => a - b,
  );

const DaysActiveSelect = ({ value = [], onChange, disabled = false }) => {
  // Unique id per row so multiple medicines on the same form don't share
  // a checkbox label target (clicking row 2's label was toggling row 1's box).
  const checkboxId = useId();

  // Mode is tracked separately from `value`. Deriving `isAlways` from
  // `value.length === 0` made unchecking impossible — value stayed [], so
  // the box recomputed to checked and snapped back.
  // Initial mode: "always" if value is empty, else "specific".
  const [mode, setMode] = useState(
    Array.isArray(value) && value.length > 0 ? "specific" : "always",
  );

  // If the value becomes non-empty (e.g. preset applied, edit-mode hydration),
  // force mode to "specific" so the controls stay consistent with the data.
  useEffect(() => {
    if (Array.isArray(value) && value.length > 0 && mode !== "specific") {
      setMode("specific");
    }
  }, [value, mode]);

  const isAlways = mode === "always";

  const handleChange = (selected) => {
    const nums = (selected || []).map((o) => Number(o.value));
    onChange(dedupSort(nums));
  };

  const handleCreate = (input) => {
    const n = Number(String(input).trim());
    if (!Number.isInteger(n) || n < 0) return;
    onChange(dedupSort([...(value || []), n]));
  };

  const applyPreset = (from, to) => {
    onChange(dedupSort([...(value || []), ...expandRange(from, to)]));
  };

  const clearAll = () => onChange([]);

  const toggleAlways = (checked) => {
    if (checked) {
      onChange([]);          // wipe any picked days
      setMode("always");     // disable input + presets
    } else {
      setMode("specific");   // enable input; value stays [] until user picks
    }
  };

  return (
    <FormGroup>
      <Row className="g-2 align-items-center mb-2">
        <Col xs="auto">
          <Label className="small text-muted mb-0">Days Active</Label>
        </Col>
        <Col xs="auto">
          <FormGroup check className="mb-0">
            <Input
              type="checkbox"
              id={checkboxId}
              checked={isAlways}
              onChange={(e) => toggleAlways(e.target.checked)}
              disabled={disabled}
            />
            <Label check for={checkboxId} className="small text-muted ms-1">
              Throughout admission
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <CreatableSelect
        isMulti
        isClearable
        placeholder="Type a day number and press Enter (e.g. 1, 3, 7)..."
        options={[]}
        value={(value || []).map((d) => ({ value: d, label: `Day ${d}` }))}
        onChange={handleChange}
        onCreateOption={handleCreate}
        isValidNewOption={(input) => /^\d+$/.test(String(input || "").trim())}
        formatCreateLabel={(input) => `Add Day ${input}`}
        isDisabled={disabled || isAlways}
      />

      {!isAlways && (
        <div className="mt-2 d-flex flex-wrap align-items-center gap-2">
          <small className="text-muted">Quick add:</small>
          <ButtonGroup size="sm">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                type="button"
                color="secondary"
                outline
                onClick={() => applyPreset(p.range[0], p.range[1])}
                disabled={disabled}
              >
                {p.label}
              </Button>
            ))}
          </ButtonGroup>
          {value.length > 0 && (
            <Button
              type="button"
              color="link"
              size="sm"
              className="text-danger p-0 ms-2"
              onClick={clearAll}
              disabled={disabled}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {isAlways && (
        <small className="text-muted d-block mt-1">
          ✓ Active throughout admission (no day filter applied)
        </small>
      )}
    </FormGroup>
  );
};

export default DaysActiveSelect;
