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
  SEVERITY_THRESHOLD_OPTIONS,
  ANY_LAB_TEST_OPTION,
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
  // FlaggedItemArray gets a bespoke pair of selectors: Test Name + Severity
  // threshold. Packed into condition.arrayMatch.keyValue and condition.value.
  const renderFlaggedItemsEditor = () => {
    // Wildcard option first: "Any test" fires on any flagged test that meets
    // the severity threshold, instead of pinning to one catalogue test.
    const testOpts = [
      ANY_LAB_TEST_OPTION,
      ...labTests.map((t) => ({
        value: t.id,
        label: t.display || t.id,
      })),
    ];
    const selectedTest =
      testOpts.find((o) => o.value === condition.arrayMatch?.keyValue) || null;
    const selectedSeverity =
      SEVERITY_THRESHOLD_OPTIONS.find((o) => o.value === condition.value?.[0]) ||
      null;
    return (
      <div>
        <Select
          options={testOpts}
          value={selectedTest}
          onChange={(s) =>
            onChange(idx, "arrayMatch", {
              ...(condition.arrayMatch || {
                keyField: "canonicalName",
                compareField: "severity",
              }),
              keyValue: s?.value || "",
            })
          }
          isDisabled={isDisabled || testOpts.length === 0}
          placeholder={testOpts.length === 0 ? "Loading tests..." : "Select test..."}
        />
        <div className="mt-1">
          <Select
            options={SEVERITY_THRESHOLD_OPTIONS}
            value={selectedSeverity}
            onChange={(s) => onChange(idx, "value", s ? [s.value] : [])}
            isDisabled={isDisabled}
            placeholder="Severity ≥ ..."
          />
        </div>
      </div>
    );
  };

  const renderValue = () => {
    if (isFlaggedItems) return renderFlaggedItemsEditor();
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
            </Col>
          )}

          {/* Hours field — label & semantics shift with Period:
                DEADLINE   → "Deadline (h)" — one-time check at admission + N
                CONTINUOUS → "Interval (h)" — every N hours
                DAYS       → "Sub-interval (h)" — optional, per-day sub-cadence
          */}
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
        </Row>
      )}

      {error && <small className="text-danger d-block mb-2">{error}</small>}
    </>
  );
};

export default ConditionRow;
