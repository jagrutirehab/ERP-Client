import React, { useState, useCallback } from "react";
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
  ADMISSION_TYPE_OPTIONS,
  VALUELESS_OPERATORS,
  emptyConditionItem,
  emptyTargetBlock,
  emptyForm,
} from "../../../Components/constants/sopConstants";
import ConditionRow from "./ConditionRow";
import MainBlock from "./MainBlock";
import RoutingCard from "./RoutingCard";
import { sopGetFieldsByModel } from "../../../helpers/backend_helper";

const SOPForm = ({ onSubmit, isSubmitting = false, onCancel }) => {
  const [form, setForm] = useState(emptyForm());
  const [satisfyingCriteria, setSatisfyingCriteria] = useState({
    conditions: [emptyConditionItem()],
  });
  const [targetBlocks, setTargetBlocks] = useState([emptyTargetBlock()]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
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

  const handleSelect = useCallback((name, selected) => {
    setForm((prev) => ({ ...prev, [name]: selected }));
    clearError(name);
  }, []);

  const handleRoleToggle = useCallback((roleName) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    );
    clearError("routing");
  }, []);

  const handleUsersChange = useCallback((selected) => {
    setSelectedUsers(selected || []);
    clearError("routing");
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
    setSelectedRoles([]);
    setSelectedUsers([]);
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
    if (!form.admissionType) errs.admissionType = "Admission type is required";
    if (!selectedRoles.length && !selectedUsers.length)
      errs.routing = "Add at least one notification channel";

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
      severity: form.severity?.value,
      admissionType: form.admissionType?.value,
      isActive: form.isActive,
      targetBlocks: targetBlocks.map((block) => ({
        alertTemplate: block.alertTemplate?.trim() || undefined,
        conditions: block.conditions
          .filter((c) => c.model && c.field)
          .map(formatCondition),
      })),
      routing: {
        ...(selectedRoles.length && { notifyRoles: selectedRoles }),
        ...(selectedUsers.length && {
          notifySpecificUsers: selectedUsers.map((u) => u.value),
        }),
      },
    };

    if (validSCConditions.length > 0) {
      payload.satisfyingCriteria = {
        conditions: validSCConditions.map(formatCondition),
      };
    }

    if (form.protocol.trim()) payload.protocol = form.protocol.trim();
    if (form.actionGuidance.trim())
      payload.actionGuidance = form.actionGuidance.trim();
    if (form.referenceSection.trim())
      payload.referenceSection = form.referenceSection.trim();

    try {
      const response = await onSubmit(payload);
      if (response) resetForm();
    } catch (err) {
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
                  Rule Name <span className="text-danger">*</span>
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
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label>
                  Severity <span className="text-danger">*</span>
                </Label>
                <Select
                  options={SEVERITY_OPTIONS}
                  value={form.severity}
                  onChange={(v) => handleSelect("severity", v)}
                  isDisabled={isSubmitting}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>
                  Admission Type <span className="text-danger">*</span>
                </Label>
                <Select
                  options={ADMISSION_TYPE_OPTIONS}
                  value={form.admissionType}
                  onChange={(v) => handleSelect("admissionType", v)}
                  isDisabled={isSubmitting}
                  placeholder="Select type..."
                />
                {fieldErrors.admissionType && (
                  <small className="text-danger">
                    {fieldErrors.admissionType}
                  </small>
                )}
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
        x
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

        {targetBlocks.map((block, bIdx) => (
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
              <FormGroup>
                <Label>Alert Template</Label>
                <Input
                  type="textarea"
                  rows="2"
                  // placeholder="Patient {patient.name} — {field.value}"
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

              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Label className="fw-bold mb-0">Conditions</Label>
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
                    error={fieldErrors.targetBlocks?.[bIdx]?.conditions?.[cIdx]}
                    modelFieldsCache={modelFieldsCache}
                    onModelChange={fetchModelFields}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <RoutingCard
        selectedRoles={selectedRoles}
        onRoleToggle={handleRoleToggle}
        selectedUsers={selectedUsers}
        onUsersChange={handleUsersChange}
        routingError={fieldErrors.routing}
        isSubmitting={isSubmitting}
      />

      <Card className="mb-4">
        <CardHeader className="fw-semibold">
          Alert Details (Optional)
        </CardHeader>
        <CardBody>
          <FormGroup>
            <Label for="actionGuidance">Action Guidance</Label>
            <Input
              type="textarea"
              id="actionGuidance"
              name="actionGuidance"
              rows="2"
              value={form.actionGuidance}
              onChange={handleField}
              disabled={isSubmitting}
            />
          </FormGroup>
          <FormGroup className="mb-0">
            <Label for="referenceSection">Reference Section</Label>
            <Input
              id="referenceSection"
              name="referenceSection"
              value={form.referenceSection}
              onChange={handleField}
              disabled={isSubmitting}
            />
          </FormGroup>
        </CardBody>
      </Card>

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
              Creating...
            </>
          ) : (
            "Create SOP Rule"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default SOPForm;
