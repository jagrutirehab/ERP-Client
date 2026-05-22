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
} from "../../../Components/constants/sopConstants";
import { getICDCodes } from "../../../helpers/backend_helper";

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

  const fieldOptions = modelFieldsCache[condition.model?.value] || [];
  const selectedField = fieldOptions.find((f) => f.value === condition.field);
  const fieldType = selectedField?.type || "String";
  const fieldEnumOpts = selectedField?.enumValues || null;

  const isFieldExists = condition.field === "FIELD_EXISTS";
  const isProvisional = ICD_FIELDS.has(condition.field);
  const isGender = condition.field === "gender";
  const isBloodGroup = condition.field === "detailAdmission.bloodGroup";
  const isBoolean = fieldType === "Boolean";
  const isDelayed = condition.triggerType?.value === "DELAYED";
  const hasEnum =
    !!fieldEnumOpts && !isGender && !isProvisional && !isBloodGroup;

  const allowedOps = isBoolean
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
    if (selected?.value) onModelChange(selected.value);
  };

  const handleFieldChange = (selected) => {
    const newField = selected?.value || "";
    const newType =
      fieldOptions.find((f) => f.value === newField)?.type || "String";
    onChange(idx, "field", newField);
    onChange(idx, "value", []);
    onChange(
      idx,
      "operator",
      newField === "FIELD_EXISTS"
        ? { value: "EXISTS", label: "EXISTS" }
        : newType === "Boolean"
          ? { value: "EQUALS", label: "EQUALS" }
          : { value: "EQUALS", label: "EQUALS" },
    );
    if (ICD_FIELDS.has(newField)) fetchIcd();
  };
  const renderValue = () => {
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
            <Label className="small text-muted mb-1">Period</Label>
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
