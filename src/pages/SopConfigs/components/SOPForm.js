import React, { useState, useCallback, useEffect } from "react";
import Select from "react-select";
import {
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
} from "reactstrap";
import {
  SEVERITY_OPTIONS,
  VALUELESS_OPERATORS,
  TARGET_OPTIONS,
  OPERATOR_OPTIONS,
  TRIGGER_OPTIONS,
  emptyConditionItem,
  emptyTargetBlock,
  emptyForm,
} from "../../../Components/constants/sopConstants";
import ConditionRow from "./ConditionRow";
import MainBlock from "./MainBlock";
import RoutingCard from "./RoutingCard";
import { sopGetFieldsByModel } from "../../../helpers/backend_helper";

// Convert a single stored condition (DB shape) into the form's UI shape.
const findOpt = (options, val) => options.find((o) => o.value === val) || null;
const hydrateCondition = (c) => ({
  model: findOpt(TARGET_OPTIONS, c.model),
  field: c.field || "",
  operator: findOpt(OPERATOR_OPTIONS, c.operator) || {
    value: "EXISTS",
    label: "EXISTS",
  },
  triggerType: findOpt(TRIGGER_OPTIONS, c.triggerType) || TRIGGER_OPTIONS[0],
  deadlineHours: c.deadlineHours != null ? String(c.deadlineHours) : "",
  value: Array.isArray(c.value) ? c.value : c.value != null ? [c.value] : [],
});

const SOPForm = ({
  onSubmit,
  isSubmitting = false,
  onCancel,
  initialValues = null,
  submitLabel = "Create SOP Rule",
  submittingLabel = "Creating...",
}) => {
  const [form, setForm] = useState(emptyForm());
  const [satisfyingCriteria, setSatisfyingCriteria] = useState({
    conditions: [emptyConditionItem()],
  });
  const [targetBlocks, setTargetBlocks] = useState([emptyTargetBlock()]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [topError, setTopError] = useState(null);
  const [modelFieldsCache, setModelFieldsCache] = useState({});

  const clearError = (key) =>
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const handleField = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearError(name);
  }, []);

  const fetchModelFields = useCallback(
    async (modelName) => {
      if (!modelName || modelFieldsCache[modelName]) return;
      try {
        const res = await sopGetFieldsByModel(modelName);
        const fields = res?.data?.fields || res?.fields || [];
        setModelFieldsCache((prev) => ({
          ...prev,
          [modelName]: fields?.map((f) => ({
            value: f.path,
            label: f.label,
            type: f.type,
            enumValues: f.options,
          })),
        }));
      } catch {
        setTopError(`Failed to load fields for ${modelName}`);
      }
    },
    [modelFieldsCache],
  );

  // Edit mode: when initialValues is provided, seed every piece of state
  // from the stored rule. Per-block fields (severity, routing, action
  // guidance, reference) hydrate INSIDE each block.
  useEffect(() => {
    if (!initialValues) return;

    setForm({
      ruleName: initialValues.ruleName || "",
      protocol: initialValues.protocol || "",
      isActive: initialValues.isActive !== false,
    });

    const sc = initialValues.satisfyingCriteria?.conditions?.length
      ? {
          conditions:
            initialValues.satisfyingCriteria.conditions.map(hydrateCondition),
        }
      : { conditions: [emptyConditionItem()] };
    setSatisfyingCriteria(sc);

    const blocks = initialValues.targetBlocks?.length
      ? initialValues.targetBlocks.map((b) => ({
          id: b._id?.toString() || `${Date.now()}-${Math.random()}`,
          name: b.name || "",
          alertTemplate: b.alertTemplate || "",
          conditions: b.conditions?.length
            ? b.conditions.map(hydrateCondition)
            : [emptyConditionItem()],
          severity:
            findOpt(SEVERITY_OPTIONS, b.severity) || SEVERITY_OPTIONS[1],
          actionGuidance: b.actionGuidance || "",
          referenceSection: b.referenceSection || "",
          selectedRoles: b.routing?.notifyRoles || [],
          selectedUsers: b._specificUsersDetailed || [],
        }))
      : [emptyTargetBlock()];
    setTargetBlocks(blocks);

    // Prefetch field metadata for every unique model referenced.
    const models = new Set();
    sc.conditions.forEach((c) => c.model?.value && models.add(c.model.value));
    blocks.forEach((b) =>
      b.conditions.forEach((c) => c.model?.value && models.add(c.model.value)),
    );
    models.forEach((m) => fetchModelFields(m));
  }, [initialValues, fetchModelFields]);

  const handleTargetConditionChange = (blockIdx, condIdx, key, value) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      const conds = [...next[blockIdx].conditions];
      conds[condIdx] = { ...conds[condIdx], [key]: value };
      next[blockIdx] = { ...next[blockIdx], conditions: conds };
      return next;
    });
  };

  const handleTargetBlockField = (blockIdx, key, value) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      next[blockIdx] = { ...next[blockIdx], [key]: value };
      return next;
    });
    if (
      key === "severity" ||
      key === "selectedRoles" ||
      key === "selectedUsers"
    ) {
      clearError("targetBlocks");
    }
  };

  const handleBlockRoleToggle = (blockIdx, roleName) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      const cur = next[blockIdx].selectedRoles || [];
      next[blockIdx] = {
        ...next[blockIdx],
        selectedRoles: cur.includes(roleName)
          ? cur.filter((r) => r !== roleName)
          : [...cur, roleName],
      };
      return next;
    });
    clearError("targetBlocks");
  };

  const handleBlockUsersChange = (blockIdx, selected) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      next[blockIdx] = { ...next[blockIdx], selectedUsers: selected || [] };
      return next;
    });
    clearError("targetBlocks");
  };

  const addTargetBlock = () =>
    setTargetBlocks((prev) => [...prev, emptyTargetBlock()]);
  const removeTargetBlock = (idx) =>
    setTargetBlocks((prev) => prev.filter((_, i) => i !== idx));

  const addConditionToBlock = (blockIdx) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      next[blockIdx] = {
        ...next[blockIdx],
        conditions: [...next[blockIdx].conditions, emptyConditionItem()],
      };
      return next;
    });
  };

  const removeConditionFromBlock = (blockIdx, condIdx) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      next[blockIdx].conditions =
        next[blockIdx].conditions.length === 1
          ? next[blockIdx].conditions
          : next[blockIdx].conditions.filter((_, i) => i !== condIdx);
      return next;
    });
  };

  const resetForm = useCallback(() => {
    setForm(emptyForm());
    setSatisfyingCriteria({ conditions: [emptyConditionItem()] });
    setTargetBlocks([emptyTargetBlock()]);
    setFieldErrors({});
    setTopError(null);
  }, []);

  const formatCondition = (c) => {
    const out = {
      model: c.model?.value,
      field: c.field,
      operator: c.operator?.value,
      triggerType: c.triggerType?.value || "IMMEDIATE",
    };

    if (c.triggerType?.value === "DELAYED" && c.deadlineHours) {
      out.deadlineHours = Number(c.deadlineHours);
    }

    if (!VALUELESS_OPERATORS.has(c.operator?.value)) {
      if (Array.isArray(c.value)) {
        out.value = c.value;
      } else {
        const n = Number(c.value);
        out.value = [c.value !== "" && !isNaN(n) ? n : c.value];
      }
    }

    return out;
  };

  const validate = () => {
    const errs = {};
    if (!form.ruleName.trim()) errs.ruleName = "Rule name is required";

    let hasTargetErrors = false;
    const targetErrors = targetBlocks.map((block) => {
      const bErr = { conditions: [] };
      block.conditions.forEach((c, cIdx) => {
        if (!c.model) {
          bErr.conditions[cIdx] = "Model is required";
          hasTargetErrors = true;
        } else if (!c.field) {
          bErr.conditions[cIdx] = "Field is required";
          hasTargetErrors = true;
        }
      });
      if (!block.name?.trim()) {
        bErr.name = "Rule name is required";
        hasTargetErrors = true;
      }
      if (!block.severity?.value) {
        bErr.severity = "Severity is required";
        hasTargetErrors = true;
      }
      const hasRouting =
        (block.selectedRoles?.length || 0) +
          (block.selectedUsers?.length || 0) >
        0;
      if (!hasRouting) {
        bErr.routing = "Add at least one notification channel";
        hasTargetErrors = true;
      }
      return bErr;
    });
    if (hasTargetErrors) errs.targetBlocks = targetErrors;

    return { valid: !Object.keys(errs).length, errors: errs };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTopError(null);

    const { valid, errors } = validate();
    if (!valid) {
      setFieldErrors(errors);
      setTopError("Please fix the highlighted fields before submitting");
      return;
    }
    setFieldErrors({});

    const validSCConditions = satisfyingCriteria.conditions.filter(
      (c) => c.model && c.field,
    );

    const payload = {
      ruleName: form.ruleName.trim(),
      isActive: form.isActive,
      targetBlocks: targetBlocks.map((block) => ({
        name: block.name?.trim(),
        alertTemplate: block.alertTemplate?.trim() || undefined,
        conditions: block.conditions
          .filter((c) => c.model && c.field)
          .map(formatCondition),
        severity: block.severity?.value,
        actionGuidance: block.actionGuidance?.trim() || undefined,
        referenceSection: block.referenceSection?.trim() || undefined,
        routing: {
          ...(block.selectedRoles?.length && {
            notifyRoles: block.selectedRoles,
          }),
          ...(block.selectedUsers?.length && {
            notifySpecificUsers: block.selectedUsers.map((u) => u.value),
          }),
        },
      })),
    };

    if (validSCConditions.length > 0) {
      payload.satisfyingCriteria = {
        conditions: validSCConditions.map(formatCondition),
      };
    }

    if (form.protocol.trim()) payload.protocol = form.protocol.trim();

    try {
      const response = await onSubmit(payload);
      if (response) resetForm();
    } catch (err) {
      console.log({ err });

      setTopError(err?.message || "Submission failed");
    }
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {topError && (
        <Alert color="danger" toggle={() => setTopError(null)}>
          {topError}
        </Alert>
      )}

      <Card className="mb-4">
        <CardHeader className="fw-semibold">1. Basic Info</CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="ruleName">
                  SOP Name <span className="text-danger">*</span>
                </Label>
                <Input
                  id="ruleName"
                  name="ruleName"
                  value={form.ruleName}
                  onChange={handleField}
                  invalid={!!fieldErrors.ruleName}
                  disabled={isSubmitting}
                />
                {fieldErrors.ruleName && (
                  <small className="text-danger">{fieldErrors.ruleName}</small>
                )}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="protocol">Protocol</Label>
                <Input
                  id="protocol"
                  name="protocol"
                  value={form.protocol}
                  onChange={handleField}
                  disabled={isSubmitting}
                />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <MainBlock
        satisfyingCriteria={satisfyingCriteria}
        setSatisfyingCriteria={setSatisfyingCriteria}
        modelFieldsCache={modelFieldsCache}
        fetchModelFields={fetchModelFields}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
      />

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold mb-0">3. Target Blocks</h5>
          <Button
            color="primary"
            size="sm"
            onClick={addTargetBlock}
            disabled={isSubmitting}
          >
            + Add Block
          </Button>
        </div>

        {targetBlocks.map((block, bIdx) => {
          const blockErrors = fieldErrors.targetBlocks?.[bIdx] || {};
          return (
            <Card key={block.id} className="mb-3 border-secondary">
              <CardHeader className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-bold">Block {bIdx + 1}</span>
                {targetBlocks.length > 1 && (
                  <Button
                    type="button"
                    color="danger"
                    size="sm"
                    outline
                    onClick={() => removeTargetBlock(bIdx)}
                    disabled={isSubmitting}
                  >
                    Remove Block
                  </Button>
                )}
              </CardHeader>
              <CardBody>
                {/* Rule Name — block label, shown in alert UI as "Rule" */}
                <FormGroup>
                  <Label>
                    Rule Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    value={block.name || ""}
                    onChange={(e) =>
                      handleTargetBlockField(bIdx, "name", e.target.value)
                    }
                    invalid={!!blockErrors.name}
                    placeholder="e.g. Severe-SBP180"
                    disabled={isSubmitting}
                  />
                  {blockErrors.name && (
                    <small className="text-danger">{blockErrors.name}</small>
                  )}
                </FormGroup>

                {/* Severity + Alert Template — top row per block */}
                <Row>
                  <Col md={3}>
                    <FormGroup>
                      <Label>
                        Severity <span className="text-danger">*</span>
                      </Label>
                      <Select
                        options={SEVERITY_OPTIONS}
                        value={block.severity}
                        onChange={(v) =>
                          handleTargetBlockField(bIdx, "severity", v)
                        }
                        isDisabled={isSubmitting}
                      />
                      {blockErrors.severity && (
                        <small className="text-danger">
                          {blockErrors.severity}
                        </small>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={9}>
                    <FormGroup>
                      <Label>Alert Template</Label>
                      <Input
                        type="textarea"
                        rows="2"
                        placeholder="Patient {patient.name} — {field.value}"
                        value={block.alertTemplate}
                        onChange={(e) =>
                          handleTargetBlockField(
                            bIdx,
                            "alertTemplate",
                            e.target.value,
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Conditions */}
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label className="fw-bold mb-0">
                      Conditions <span className="text-danger">*</span>
                    </Label>
                    <Button
                      type="button"
                      color="secondary"
                      size="sm"
                      outline
                      onClick={() => addConditionToBlock(bIdx)}
                      disabled={isSubmitting}
                    >
                      + Add Condition
                    </Button>
                  </div>
                  {block.conditions.map((c, cIdx) => (
                    <ConditionRow
                      key={cIdx}
                      condition={c}
                      idx={cIdx}
                      onChange={(idx, key, val) =>
                        handleTargetConditionChange(bIdx, idx, key, val)
                      }
                      onRemove={(idx) => removeConditionFromBlock(bIdx, idx)}
                      isDisabled={isSubmitting}
                      isOnly={block.conditions.length === 1}
                      error={blockErrors.conditions?.[cIdx]}
                      modelFieldsCache={modelFieldsCache}
                      onModelChange={fetchModelFields}
                    />
                  ))}
                </div>

                {/* Per-block Routing */}
                <div className="mt-3">
                  <RoutingCard
                    selectedRoles={block.selectedRoles || []}
                    onRoleToggle={(roleName) =>
                      handleBlockRoleToggle(bIdx, roleName)
                    }
                    selectedUsers={block.selectedUsers || []}
                    onUsersChange={(sel) => handleBlockUsersChange(bIdx, sel)}
                    routingError={blockErrors.routing}
                    isSubmitting={isSubmitting}
                  />
                </div>

                {/* Per-block Alert Details (optional) */}
                <Row className="mt-2">
                  <Col md={8}>
                    <FormGroup>
                      <Label>Action Guidance (optional)</Label>
                      <Input
                        type="textarea"
                        rows="2"
                        value={block.actionGuidance || ""}
                        onChange={(e) =>
                          handleTargetBlockField(
                            bIdx,
                            "actionGuidance",
                            e.target.value,
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Reference Section</Label>
                      <Input
                        value={block.referenceSection || ""}
                        onChange={(e) =>
                          handleTargetBlockField(
                            bIdx,
                            "referenceSection",
                            e.target.value,
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="d-flex justify-content-end gap-2">
        {onCancel && (
          <Button
            type="button"
            color="secondary"
            outline
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          color="secondary"
          outline
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" color="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="me-2" />
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </Form>
  );
};

export default SOPForm;
