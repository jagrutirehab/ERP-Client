import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Input, Button, Row, Col, Label } from "reactstrap";
import CreatableSelect from "react-select/creatable";
import {
  GENDER_OPTIONS,
  OPERATOR_OPTIONS,
  VALUELESS_OPERATORS,
  TARGET_OPTIONS,
  TRIGGER_OPTIONS,
  OPERATORS_BY_TYPE,
  BOOLEAN_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  PERIOD_OPTIONS,
  PER_OPTIONS,
  emptyBand,
  SEVERITY_THRESHOLD_OPTIONS,
  ANY_LAB_TEST_OPTION,
  RELATIVE_DAY_OPERATORS,
} from "../../../Components/constants/sopConstants";
import { getICDCodes, sopGetLabTests } from "../../../helpers/backend_helper";

// Cache lab-test catalogue at module scope — same across all ConditionRow
// instances in a session. Loaded lazily the first time a row needs it.
let _labTestsPromise = null;
const loadLabTests = () => {
  if (!_labTestsPromise) {
    _labTestsPromise = sopGetLabTests()
      .then((res) => res?.data || res || { tests: [], severityThresholds: [] })
      .catch(() => ({ tests: [], severityThresholds: [] }));
  }
  return _labTestsPromise;
};

const ICD_FIELDS = new Set([
  "provisional_diagnosis",
  "doctorSignature.provisionaldiagnosis",
]);

const ConditionRow = ({
  condition,
  idx,
  onChange,
  onRemove,
  isDisabled,
  disableTrigger = false,
  isOnly,
  error,
  modelFieldsCache,
  onModelChange,
}) => {
  const [icdOptions, setIcdOptions] = useState([]);
  const [isLoadingIcd, setIsLoadingIcd] = useState(false);
  const [labTests, setLabTests] = useState([]);

  const fieldOptions = modelFieldsCache[condition.model?.value] || [];
  const selectedField = fieldOptions.find((f) => f.value === condition.field);
  const fieldType = selectedField?.type || "String";
  const fieldEnumOpts = selectedField?.enumValues || null;

  const isFieldExists = condition.field === "FIELD_EXISTS";
  const isProvisional = ICD_FIELDS.has(condition.field);
  const isGender = condition.field === "gender";
  const isBloodGroup = condition.field === "detailAdmission.bloodGroup";
  const isBoolean = fieldType === "Boolean";
  const isFlaggedItems = fieldType === "FlaggedItemArray";
  const isDelayed = condition.triggerType?.value === "DELAYED";
  const isFrequency = condition.schedule?.period?.value === "FREQUENCY";
  const hasEnum =
    !!fieldEnumOpts && !isGender && !isProvisional && !isBloodGroup;

  const allowedOps = isFlaggedItems
    ? ["ARRAY_ANY_MATCHES"]
    : isBoolean
      ? ["EQUALS"]
      : isFieldExists
        ? []
        : OPERATORS_BY_TYPE[fieldType] || OPERATORS_BY_TYPE.String;

  console.log({ allowedOps });

  const filteredOps = OPERATOR_OPTIONS.filter((op) =>
    allowedOps.includes(op.value),
  );
  const valueless = VALUELESS_OPERATORS.has(condition.operator?.value);

  useEffect(() => {
    if (isProvisional && icdOptions.length === 0) fetchIcd();
  }, [condition.field]);

  useEffect(() => {
    if (!isFlaggedItems) return;
    let cancelled = false;
    loadLabTests().then((data) => {
      if (cancelled) return;
      setLabTests(Array.isArray(data?.tests) ? data.tests : []);
    });
    return () => {
      cancelled = true;
    };
  }, [isFlaggedItems]);

  const fetchIcd = async () => {
    setIsLoadingIcd(true);
    try {
      const res = await getICDCodes();
      const dataArray = Array.isArray(res) ? res : res.data || [];
      setIcdOptions(
        dataArray.map((i) => ({
          value: i._id,
          label: `${i.text} - ${i.code}`,
        })),
      );
    } catch (err) {
      console.error("ICD fetch error:", err);
    } finally {
      setIsLoadingIcd(false);
    }
  };

  const handleModelChange = (selected) => {
    onChange(idx, "model", selected);
    onChange(idx, "field", "");
    onChange(idx, "value", []);
    onChange(idx, "operator", { value: "EXISTS", label: "EXISTS" });
    onChange(idx, "arrayMatch", null);
    if (selected?.value) onModelChange(selected.value);
  };

  const handleFieldChange = (selected) => {
    const newField = selected?.value || "";
    const newType =
      fieldOptions.find((f) => f.value === newField)?.type || "String";
    onChange(idx, "field", newField);
    onChange(idx, "value", []);
    if (newType === "FlaggedItemArray") {
      onChange(idx, "operator", { value: "ARRAY_ANY_MATCHES", label: "ARRAY ANY MATCHES" });
      onChange(idx, "arrayMatch", {
        keyField: "canonicalName",
        keyValue: "",
        compareField: "severity",
        comparator: "SEVERITY",
      });
    } else {
      onChange(
        idx,
        "operator",
        newField === "FIELD_EXISTS"
          ? { value: "EXISTS", label: "EXISTS" }
          : newType === "Boolean"
            ? { value: "EQUALS", label: "EQUALS" }
            : { value: "EQUALS", label: "EQUALS" },
      );
      onChange(idx, "arrayMatch", null);
    }
    if (ICD_FIELDS.has(newField)) fetchIcd();
  };
  // FlaggedItemArray supports two modes, set via arrayMatch.comparator:
  //   SEVERITY (default) — Test + severity bucket (existing behaviour).
  //   GREATER_THAN / LESS_THAN / *_OR_EQUAL / BETWEEN — Test + numeric ULN
  //     multiplier (or other numeric compareField) + threshold value(s).
  // The mode toggle drives which sub-editor renders.
  const MODE_OPTIONS = [
    { value: "SEVERITY", label: "By severity" },
    { value: "GREATER_THAN", label: "ULN multiplier  >" },
    { value: "GREATER_THAN_OR_EQUAL", label: "ULN multiplier  ≥" },
    { value: "LESS_THAN", label: "ULN multiplier  <" },
    { value: "LESS_THAN_OR_EQUAL", label: "ULN multiplier  ≤" },
    { value: "BETWEEN", label: "ULN multiplier  between" },
  ];

  const renderFlaggedItemsEditor = () => {
    const comparator = condition.arrayMatch?.comparator || "SEVERITY";
    const isSeverityMode = comparator === "SEVERITY";

    // Test options:
    //   Severity mode keeps the wildcard ("Any test").
    //   Numeric modes only allow catalogue entries that carry a ULN — a
    //   per-test multiplier comparison against a test with uln=null is
    //   meaningless. Sodium/eGFR etc. should use numericValue + GREATER_THAN
    //   on an explicit threshold instead (left for future UI; the API
    //   already supports it via compareField:"numericValue").
    const testsForMode = isSeverityMode
      ? labTests
      : labTests.filter((t) => t.uln != null);
    const testOpts = [
      ...(isSeverityMode ? [ANY_LAB_TEST_OPTION] : []),
      ...testsForMode.map((t) => ({
        value: t.id,
        label: t.display || t.id,
        uln: t.uln,
        unit: t.unit,
      })),
    ];

    const selectedTest =
      testOpts.find((o) => o.value === condition.arrayMatch?.keyValue) || null;
    const selectedSeverity =
      SEVERITY_THRESHOLD_OPTIONS.find((o) => o.value === condition.value?.[0]) ||
      null;
    const selectedMode =
      MODE_OPTIONS.find((o) => o.value === comparator) || MODE_OPTIONS[0];

    // Switching mode wipes test/value so we never leave stale state (e.g. a
    // severity token in `value` while the comparator is GREATER_THAN, which
    // the server validator would reject).
    const handleModeChange = (next) => {
      const nextComparator = next?.value || "SEVERITY";
      const isNextSeverity = nextComparator === "SEVERITY";
      onChange(idx, "arrayMatch", {
        keyField: "canonicalName",
        keyValue: "",
        compareField: isNextSeverity ? "severity" : "ulnMultiplier",
        comparator: nextComparator,
      });
      onChange(idx, "value", []);
    };

    const handleTestChange = (s) =>
      onChange(idx, "arrayMatch", {
        ...(condition.arrayMatch || {
          keyField: "canonicalName",
          compareField: isSeverityMode ? "severity" : "ulnMultiplier",
          comparator,
        }),
        keyValue: s?.value || "",
      });

    // Derived hint for numeric mode: "3 × 40 IU/L = 120 IU/L" so the
    // rule author can sanity-check the threshold in real-world units.
    const hint = (() => {
      if (isSeverityMode || !selectedTest?.uln) return null;
      const a = Number(condition.value?.[0]);
      if (comparator === "BETWEEN") {
        const b = Number(condition.value?.[1]);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
        return `≈ ${(a * selectedTest.uln).toFixed(2)} – ${(b * selectedTest.uln).toFixed(2)} ${selectedTest.unit}`;
      }
      if (!Number.isFinite(a)) return null;
      return `≈ ${(a * selectedTest.uln).toFixed(2)} ${selectedTest.unit}  (ULN = ${selectedTest.uln} ${selectedTest.unit})`;
    })();

    return (
      <div>
        <Select
          options={MODE_OPTIONS}
          value={selectedMode}
          onChange={handleModeChange}
          isDisabled={isDisabled}
          placeholder="Mode..."
        />
        <div className="mt-1">
          <Select
            options={testOpts}
            value={selectedTest}
            onChange={handleTestChange}
            isDisabled={isDisabled || testOpts.length === 0}
            placeholder={
              testOpts.length === 0
                ? "Loading tests..."
                : isSeverityMode
                  ? "Select test..."
                  : "Select test (× ULN)..."
            }
          />
        </div>
        {isSeverityMode ? (
          <div className="mt-1">
            <Select
              options={SEVERITY_THRESHOLD_OPTIONS}
              value={selectedSeverity}
              onChange={(s) => onChange(idx, "value", s ? [s.value] : [])}
              isDisabled={isDisabled}
              placeholder="Severity ≥ ..."
            />
          </div>
        ) : comparator === "BETWEEN" ? (
          <Row className="g-1 mt-1">
            <Col xs={6}>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="low × ULN"
                value={condition.value?.[0] ?? ""}
                onChange={(e) =>
                  onChange(idx, "value", [
                    e.target.value,
                    condition.value?.[1] ?? "",
                  ])
                }
                disabled={isDisabled}
              />
            </Col>
            <Col xs={6}>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="high × ULN"
                value={condition.value?.[1] ?? ""}
                onChange={(e) =>
                  onChange(idx, "value", [
                    condition.value?.[0] ?? "",
                    e.target.value,
                  ])
                }
                disabled={isDisabled}
              />
            </Col>
          </Row>
        ) : (
          <div className="mt-1">
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="× ULN (e.g. 3)"
              value={condition.value?.[0] ?? ""}
              onChange={(e) => onChange(idx, "value", [e.target.value])}
              disabled={isDisabled}
            />
          </div>
        )}
        {hint && <small className="text-muted d-block mt-1">{hint}</small>}
      </div>
    );
  };

  // FREQUENCY band table — "N documents per period over a day range". Each row
  // mirrors a clinical-policy line (e.g. From 5 · To 30 · 2 · per week). Empty
  // "To day" + the onwards toggle means "from this day until discharge".
  const setBands = (bands) =>
    onChange(idx, "schedule", { ...condition.schedule, bands });

  const renderFrequencyBands = () => {
    const bands = condition.schedule?.bands || [];
    return (
      <Col md={12} className="mt-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Label className="small text-muted mb-0">
            Frequency bands — N documents per period within a day range
          </Label>
          <Button
            type="button"
            size="sm"
            color="secondary"
            outline
            onClick={() => setBands([...bands, emptyBand()])}
            disabled={isDisabled}
          >
            + Add band
          </Button>
        </div>
        {bands.length === 0 && (
          <small className="text-muted d-block">
            e.g. From 5 · To 30 · 2 · per week.
          </small>
        )}
        {bands.map((band, bi) => {
          const updateBand = (patch) =>
            setBands(bands.map((x, i) => (i === bi ? { ...x, ...patch } : x)));
          return (
            <Row className="g-1 mb-1 align-items-center" key={bi}>
              <Col xs={2}>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="From day"
                  value={band.fromDay ?? ""}
                  onChange={(e) =>
                    updateBand({ fromDay: e.target.value.replace(/[^\d]/g, "") })
                  }
                  disabled={isDisabled}
                />
              </Col>
              <Col xs={2}>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="To day"
                  value={band.onwards ? "" : (band.toDay ?? "")}
                  onChange={(e) =>
                    updateBand({ toDay: e.target.value.replace(/[^\d]/g, "") })
                  }
                  disabled={isDisabled || band.onwards}
                />
              </Col>
              <Col xs={2} className="d-flex align-items-center">
                <div className="form-check mb-0">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`onwards-${idx}-${bi}`}
                    checked={!!band.onwards}
                    disabled={isDisabled}
                    onChange={(e) =>
                      updateBand(
                        e.target.checked
                          ? { onwards: true, toDay: "" }
                          : { onwards: false },
                      )
                    }
                  />
                  <label
                    className="form-check-label small"
                    htmlFor={`onwards-${idx}-${bi}`}
                  >
                    onwards
                  </label>
                </div>
              </Col>
              <Col xs={2}>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Times"
                  value={band.times ?? ""}
                  onChange={(e) =>
                    updateBand({ times: e.target.value.replace(/[^\d]/g, "") })
                  }
                  disabled={isDisabled}
                />
              </Col>
              <Col xs={3}>
                <Select
                  options={PER_OPTIONS}
                  value={band.per || PER_OPTIONS[1]}
                  onChange={(v) => updateBand({ per: v })}
                  isDisabled={isDisabled}
                />
              </Col>
              <Col xs={1}>
                <Button
                  type="button"
                  color="danger"
                  outline
                  size="sm"
                  onClick={() => setBands(bands.filter((_, i) => i !== bi))}
                  disabled={isDisabled}
                >
                  ×
                </Button>
              </Col>
            </Row>
          );
        })}
      </Col>
    );
  };

  const renderValue = () => {
    if (isFlaggedItems) return renderFlaggedItemsEditor();

    // Relative-date operators (e.g. OLDER_THAN_DAYS) take a plain number of
    // days, not a date. Stored as a single-element array to match the other
    // numeric value editors.
    if (RELATIVE_DAY_OPERATORS.has(condition.operator?.value)) {
      return (
        <Input
          type="number"
          min="1"
          step="1"
          placeholder="days (e.g. 90)"
          value={condition.value?.[0] ?? ""}
          onChange={(e) => onChange(idx, "value", [e.target.value])}
          disabled={isDisabled}
        />
      );
    }
    if (isProvisional) {
      return (
        <Select
          isMulti
          options={icdOptions}
          isLoading={isLoadingIcd}
          value={
            Array.isArray(condition.value)
              ? icdOptions.filter((o) => condition.value.includes(o.value))
              : []
          }
          onChange={(s) =>
            onChange(idx, "value", s ? s.map((x) => x.value) : [])
          }
          isDisabled={isDisabled}
          placeholder="Select diagnoses..."
        />
      );
    }

    if (isBloodGroup) {
      return (
        <Select
          options={BLOOD_GROUP_OPTIONS}
          value={
            BLOOD_GROUP_OPTIONS.find((o) => o.value === condition.value?.[0]) ||
            null
          }
          onChange={(s) => onChange(idx, "value", s ? [s.value] : [])}
          isDisabled={isDisabled}
          placeholder="Select blood group..."
        />
      );
    }

    if (isGender) {
      return (
        <Select
          options={GENDER_OPTIONS}
          value={
            Array.isArray(condition.value) && condition.value.length === 2
              ? { value: "Both", label: "Both" }
              : GENDER_OPTIONS.find((o) => o.value === condition.value?.[0]) ||
              null
          }
          onChange={(s) => {
            if (!s) return onChange(idx, "value", []);
            onChange(
              idx,
              "value",
              s.value === "Both" ? ["Male", "Female"] : [s.value],
            );
          }}
          isDisabled={isDisabled}
          placeholder="Select gender..."
        />
      );
    }

    if (isBoolean) {
      return (
        <Select
          options={BOOLEAN_OPTIONS}
          value={
            BOOLEAN_OPTIONS.find((o) => o.value === condition.value?.[0]) ||
            null
          }
          onChange={(s) => onChange(idx, "value", s ? [s.value] : [])}
          isDisabled={isDisabled}
          placeholder="Select..."
        />
      );
    }

    if (hasEnum) {
      return (
        <Select
          options={fieldEnumOpts}
          value={
            fieldEnumOpts.find((o) => o.value === condition.value?.[0]) || null
          }
          onChange={(s) => onChange(idx, "value", s ? [s.value] : [])}
          isDisabled={isDisabled}
          placeholder="Select..."
        />
      );
    }

    return (
      <Input
        placeholder={fieldType === "Number" ? "e.g. 160" : "Enter value"}
        type={fieldType === "Number" ? "number" : "text"}
        value={
          Array.isArray(condition.value)
            ? (condition.value[0] ?? "")
            : condition.value || ""
        }
        onChange={(e) => onChange(idx, "value", e.target.value)}
        disabled={isDisabled}
      />
    );
  };

  console.log({ filteredOps });

  return (
    <>
      <Row className="align-items-end mb-2">
        <Col md={2}>
          <Label className="small text-muted mb-1">Model</Label>
          <Select
            options={TARGET_OPTIONS}
            value={condition.model}
            onChange={handleModelChange}
            isDisabled={isDisabled}
            placeholder="Model..."
          />
        </Col>

        <Col md={2}>
          <Label className="small text-muted mb-1">Field</Label>
          <Select
            options={fieldOptions}
            value={
              fieldOptions.find((f) => f.value === condition.field) || null
            }
            onChange={handleFieldChange}
            isDisabled={isDisabled || !condition.model}
            placeholder={
              condition.model ? "Select field" : "Select model first"
            }
          />
        </Col>

        <Col md={2}>
          <Label className="small text-muted mb-1">Operator</Label>
          <Select
            options={filteredOps}
            value={
              filteredOps.find((o) => o.value === condition.operator?.value) ||
              null
            }
            onChange={(v) => onChange(idx, "operator", v)}
            isDisabled={isDisabled || isFieldExists}
          />
        </Col>

        {!disableTrigger && (
          <Col md={isDelayed ? 1 : 2}>
            <Label className="small text-muted mb-1">Trigger</Label>
            <Select
              options={TRIGGER_OPTIONS}
              value={condition.triggerType}
              onChange={(v) => {
                onChange(idx, "triggerType", v);
                if (v?.value !== "DELAYED") onChange(idx, "deadlineHours", "");
              }}
              isDisabled={isDisabled}
            />
          </Col>
        )}

        {!valueless && !isFieldExists && (
          <Col md={3}>
            <Label className="small text-muted mb-1">Value</Label>
            {renderValue()}
          </Col>
        )}

        <Col md={1}>
          <Button
            type="button"
            color="danger"
            outline
            size="sm"
            onClick={() => onRemove(idx)}
            disabled={isDisabled || isOnly}
          >
            ×
          </Button>
        </Col>
      </Row>

      {/* DELAYED-only: schedule controls (Period + Days + Interval + Grace) */}
      {isDelayed && (
        <Row className="align-items-end mb-3 p-2 border rounded bg-light mx-0">
          <Col md={3}>
            <Label className="small text-muted mb-1">Cycle</Label>
            <Select
              options={PERIOD_OPTIONS}
              value={condition.schedule?.period || PERIOD_OPTIONS[0]}
              onChange={(v) =>
                onChange(idx, "schedule", { ...condition.schedule, period: v })
              }
              isDisabled={isDisabled}
            />
          </Col>

          {condition.schedule?.period?.value === "DAYS" && (
            <Col md={4}>
              <Label className="small text-muted mb-1">
                Days (e.g. 1, 3, 7)
              </Label>
              <CreatableSelect
                isMulti
                isClearable
                placeholder="Type a day number and press Enter..."
                options={[]}
                value={(condition.schedule?.days || []).map((d) => ({
                  value: d,
                  label: `Day ${d}`,
                }))}
                onChange={(selected) => {
                  const nums = (selected || [])
                    .map((o) => Number(o.value))
                    .filter((n) => Number.isInteger(n) && n >= 0);
                  onChange(idx, "schedule", {
                    ...condition.schedule,
                    days: [...new Set(nums)].sort((a, b) => a - b),
                  });
                }}
                onCreateOption={(input) => {
                  const n = Number(String(input).trim());
                  if (!Number.isInteger(n) || n < 0) return;
                  const next = [
                    ...new Set([...(condition.schedule?.days || []), n]),
                  ].sort((a, b) => a - b);
                  onChange(idx, "schedule", {
                    ...condition.schedule,
                    days: next,
                  });
                }}
                isValidNewOption={(input) =>
                  /^\d+$/.test(String(input || "").trim())
                }
                formatCreateLabel={(input) => `Add Day ${input}`}
                isDisabled={isDisabled}
              />
              {(condition.schedule?.days || []).length > 0 && (
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`daysOnwards-${idx}`}
                    checked={!!condition.schedule?.daysOnwards}
                    disabled={isDisabled}
                    onChange={(e) =>
                      onChange(idx, "schedule", {
                        ...condition.schedule,
                        daysOnwards: e.target.checked,
                      })
                    }
                  />
                  <label
                    className="form-check-label small"
                    htmlFor={`daysOnwards-${idx}`}
                  >
                    Day {Math.max(...condition.schedule.days)} onwards (then due
                    every day until discharge)
                  </label>
                </div>
              )}
            </Col>
          )}

          {/* Hours field — label & semantics shift with Period:
                DEADLINE   → "Deadline (h)" — one-time check at admission + N
                CONTINUOUS → "Interval (h)" — every N hours
                DAYS       → "Sub-interval (h)" — optional, per-day sub-cadence
              Hidden for FREQUENCY (it uses the band table instead).
          */}
          {!isFrequency && (
            <Col md={2}>
              <Label className="small text-muted mb-1">
                {condition.schedule?.period?.value === "DEADLINE"
                  ? "Deadline (h)"
                  : condition.schedule?.period?.value === "CONTINUOUS"
                    ? "Interval (h)"
                    : "Sub-interval (h)"}
              </Label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder={
                  condition.schedule?.period?.value === "DAYS"
                    ? "optional"
                    : "required"
                }
                value={condition.schedule?.intervalHours ?? ""}
                onChange={(e) =>
                  onChange(idx, "schedule", {
                    ...condition.schedule,
                    intervalHours: e.target.value.replace(/[^\d]/g, ""),
                  })
                }
                disabled={isDisabled}
              />
            </Col>
          )}

          {!isFrequency && (
            <Col md={2}>
              <Label className="small text-muted mb-1">Grace (h)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={condition.schedule?.graceHours ?? 0}
                onChange={(e) =>
                  onChange(idx, "schedule", {
                    ...condition.schedule,
                    graceHours: e.target.value.replace(/[^\d]/g, ""),
                  })
                }
                disabled={isDisabled}
              />
            </Col>
          )}

          {isFrequency && renderFrequencyBands()}
        </Row>
      )}

      {error && <small className="text-danger d-block mb-2">{error}</small>}
    </>
  );
};

export default ConditionRow;
