import React, { useState, useCallback } from "react";
import Select from "react-select";
import {
  Card, CardBody, CardHeader, Form, FormGroup,
  Label, Input, Button, Row, Col, Alert, Spinner,
} from "reactstrap";
import {
  TRIGGER_OPTIONS, SEVERITY_OPTIONS, TARGET_OPTIONS,
  VALUELESS_OPERATORS, emptyCondition, emptyForm, emptyTargetBlock,
} from "../constants/sopConstants";
import ConditionRow from "./ConditionRow";
import RoutingCard from "./RoutingCard";
import { sopGetFieldsByModel } from "../../../helpers/backend_helper";

const SOPForm = ({ onSubmit, isSubmitting = false, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const [targetBlocks, setTargetBlocks] = useState([emptyTargetBlock()]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [topError, setTopError] = useState(null);
  const [modelFieldsCache, setModelFieldsCache] = useState({});
  const [fieldsLoading, setFieldsLoading] = useState({});

  const clearError = (key) =>
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const handleField = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    clearError(name);
  }, []);

  const handleSelect = useCallback((name, selected) => {
    setForm((prev) => ({ ...prev, [name]: selected }));
    clearError(name);
  }, []);

  const handleRoleToggle = useCallback((roleName) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
    clearError("routing");
  }, []);

  const handleUsersChange = useCallback((selected) => {
    setSelectedUsers(selected || []);
    clearError("routing");
  }, []);

  const handleBlockModelChange = async (blockIdx, selectedModel) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      next[blockIdx] = { ...next[blockIdx], model: selectedModel, conditions: [emptyCondition()] };
      return next;
    });

    const modelName = selectedModel?.value;
    if (modelName && !modelFieldsCache[modelName]) {
      setFieldsLoading((prev) => ({ ...prev, [modelName]: true }));
      try {
        const res = await sopGetFieldsByModel(modelName);
        const fields = res?.data?.fields || res?.fields || [];
        setModelFieldsCache((prev) => ({
          ...prev,
          [modelName]: fields.map((f) => ({ value: f.path, label: f.label, type: f.type })),
        }));
      } catch {
        setTopError(`Failed to load fields for ${modelName}`);
      } finally {
        setFieldsLoading((prev) => ({ ...prev, [modelName]: false }));
      }
    }
  };

  const handleBlockTriggerChange = (blockIdx, selected) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      next[blockIdx] = {
        ...next[blockIdx],
        triggerType: selected,
        deadlineHours: selected?.value !== 'DELAYED' ? "" : next[blockIdx].deadlineHours,
      };
      return next;
    });
  };

  const handleBlockDeadlineChange = (blockIdx, value) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      next[blockIdx] = { ...next[blockIdx], deadlineHours: value };
      return next;
    });
  };

  const handleConditionChange = useCallback((blockIdx, condIdx, key, value) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      const conds = [...next[blockIdx].conditions];
      conds[condIdx] = { ...conds[condIdx], [key]: value };
      if (key === "operator" && VALUELESS_OPERATORS.has(value?.value)) {
        conds[condIdx].value = "";
      }
      next[blockIdx].conditions = conds;
      return next;
    });
  }, []);

  const addTargetBlock = () => setTargetBlocks((prev) => [...prev, emptyTargetBlock()]);

  const removeTargetBlock = (idx) => setTargetBlocks((prev) => prev.filter((_, i) => i !== idx));

  const addCondition = (blockIdx) => {
    setTargetBlocks((prev) => {
      const next = [...prev];
      next[blockIdx].conditions = [...next[blockIdx].conditions, emptyCondition()];
      return next;
    });
  };

  const removeCondition = (blockIdx, condIdx) => {
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
    setTargetBlocks([emptyTargetBlock()]);
    setSelectedRoles([]);
    setSelectedUsers([]);
    setFieldErrors({});
    setTopError(null);
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.ruleName.trim()) errs.ruleName = "Rule name is required";
    if (!selectedRoles.length && !selectedUsers.length)
      errs.routing = "Add at least one notification channel";

    let hasBlockErrors = false;
    const blockErrors = [];

    targetBlocks.forEach((b, bIdx) => {
      const bErr = { conditions: [] };

      if (!b.model) {
        bErr.model = "Target model is required";
        hasBlockErrors = true;
      }

      if (b.triggerType?.value === 'DELAYED') {
        const hrs = Number(b.deadlineHours);
        if (!b.deadlineHours || isNaN(hrs) || hrs <= 0) {
          bErr.deadlineHours = "Deadline hours required for DELAYED";
          hasBlockErrors = true;
        }
      }

      b.conditions.forEach((c, cIdx) => {
        if (!c.field && (c.value === "" || c.value == null)) return;
        if (!c.field.trim()) {
          bErr.conditions[cIdx] = "Field is required";
          hasBlockErrors = true;
          return;
        }
        if (!VALUELESS_OPERATORS.has(c.operator?.value) && c.value === "") {
          bErr.conditions[cIdx] = "Value required";
          hasBlockErrors = true;
        }
      });

      blockErrors[bIdx] = bErr;
    });

    if (hasBlockErrors) errs.targetBlocks = blockErrors;

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

    const formattedTargetModels = targetBlocks.map((b) => {
      const cleanConditions = b.conditions
        .filter((c) => c.field.trim())
        .map((c) => {
          const out = { field: c.field.trim(), operator: c.operator?.value };
          if (!VALUELESS_OPERATORS.has(c.operator?.value)) {
            const n = Number(c.value);
            out.value = c.value !== "" && !isNaN(n) ? n : c.value;
          }
          return out;
        });

      const block = {
        model: b.model?.value,
        triggerType: b.triggerType?.value,
        conditionGroup: {
          logic: "AND",
          conditions: cleanConditions,
          groups: [],
        },
      };

      if (b.triggerType?.value === 'DELAYED') {
        block.deadlineHours = Number(b.deadlineHours);
      }

      return block;
    });

    const payload = {
      ruleName: form.ruleName.trim(),
      severity: form.severity?.value,
      isActive: form.isActive,
      targetModels: formattedTargetModels,
      routing: {
        ...(selectedRoles.length && { notifyRoles: selectedRoles }),
        ...(selectedUsers.length && { notifySpecificUsers: selectedUsers.map((u) => u.value) }),
      },
    };

    if (form.protocol.trim()) payload.protocol = form.protocol.trim();
    if (form.alertTemplate.trim()) payload.alertTemplate = form.alertTemplate.trim();
    if (form.actionGuidance.trim()) payload.actionGuidance = form.actionGuidance.trim();
    if (form.referenceSection.trim()) payload.referenceSection = form.referenceSection.trim();

    try {
      const response = await onSubmit(payload);
      if (response) resetForm();
    } catch (err) {
      setTopError(err?.message || "Submission failed");
    }
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {topError && <Alert color="danger" toggle={() => setTopError(null)}>{topError}</Alert>}

      <Card className="mb-4">
        <CardHeader className="fw-semibold">1. Basic Info</CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="ruleName">Rule Name <span className="text-danger">*</span></Label>
                <Input
                  id="ruleName" name="ruleName"
                  value={form.ruleName} onChange={handleField}
                  invalid={!!fieldErrors.ruleName} disabled={isSubmitting}
                />
                {fieldErrors.ruleName && <small className="text-danger">{fieldErrors.ruleName}</small>}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="protocol">Protocol</Label>
                <Input id="protocol" name="protocol" value={form.protocol} onChange={handleField} disabled={isSubmitting} />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Severity <span className="text-danger">*</span></Label>
                <Select
                  options={SEVERITY_OPTIONS} value={form.severity}
                  onChange={(v) => handleSelect("severity", v)} isDisabled={isSubmitting}
                />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold mb-0">2. Target Models & Conditions</h5>
          <Button color="primary" size="sm" onClick={addTargetBlock} disabled={isSubmitting}>
            + Add Target Model
          </Button>
        </div>

        {targetBlocks.map((block, bIdx) => {
          const bError = fieldErrors.targetBlocks?.[bIdx] || {};
          const modelFields = modelFieldsCache[block.model?.value] || [];
          const isFieldsLoading = fieldsLoading[block.model?.value];
          const showDeadline = block.triggerType?.value === 'DELAYED';

          return (
            <Card key={block.id} className="mb-3 border-secondary">
              <CardHeader className="bg-light d-flex justify-content-between align-items-center">
                <span className="fw-bold">Target Block {bIdx + 1}</span>
                {targetBlocks.length > 1 && (
                  <Button type="button" color="danger" size="sm" outline onClick={() => removeTargetBlock(bIdx)} disabled={isSubmitting}>
                    Remove Block
                  </Button>
                )}
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={showDeadline ? 4 : 6}>
                    <FormGroup>
                      <Label>Model <span className="text-danger">*</span></Label>
                      <Select
                        options={TARGET_OPTIONS}
                        value={block.model}
                        onChange={(v) => handleBlockModelChange(bIdx, v)}
                        isDisabled={isSubmitting}
                      />
                      {bError.model && <small className="text-danger">{bError.model}</small>}
                      {isFieldsLoading && <small className="text-info d-block mt-1">Loading fields...</small>}
                    </FormGroup>
                  </Col>
                  <Col md={showDeadline ? 4 : 6}>
                    <FormGroup>
                      <Label>Trigger Type <span className="text-danger">*</span></Label>
                      <Select
                        options={TRIGGER_OPTIONS}
                        value={block.triggerType}
                        onChange={(v) => handleBlockTriggerChange(bIdx, v)}
                        isDisabled={isSubmitting}
                      />
                    </FormGroup>
                  </Col>
                  {showDeadline && (
                    <Col md={4}>
                      <FormGroup>
                        <Label>Deadline (hours) <span className="text-danger">*</span></Label>
                        <Input
                          type="number" min="1" placeholder="e.g. 24"
                          value={block.deadlineHours}
                          onChange={(e) => handleBlockDeadlineChange(bIdx, e.target.value)}
                          invalid={!!bError.deadlineHours}
                          disabled={isSubmitting}
                        />
                        {bError.deadlineHours && <small className="text-danger">{bError.deadlineHours}</small>}
                      </FormGroup>
                    </Col>
                  )}
                </Row>

                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label className="fw-bold mb-0">Conditions</Label>
                    <Button type="button" color="secondary" size="sm" outline onClick={() => addCondition(bIdx)} disabled={isSubmitting || !block.model}>
                      + Add Condition
                    </Button>
                  </div>
                  {block.conditions.map((c, cIdx) => (
                    <ConditionRow
                      key={cIdx}
                      condition={c}
                      idx={cIdx}
                      onChange={(idx, key, val) => handleConditionChange(bIdx, idx, key, val)}
                      onRemove={(idx) => removeCondition(bIdx, idx)}
                      isDisabled={isSubmitting}
                      isOnly={block.conditions.length === 1}
                      error={bError.conditions?.[cIdx]}
                      fieldOptions={modelFields}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
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
        <CardHeader className="fw-semibold">Alert Details (Optional)</CardHeader>
        <CardBody>
          <FormGroup>
            <Label for="alertTemplate">Alert Message Template</Label>
            <Input type="textarea" id="alertTemplate" name="alertTemplate" rows="2" value={form.alertTemplate} onChange={handleField} disabled={isSubmitting} />
          </FormGroup>
          <FormGroup>
            <Label for="actionGuidance">Action Guidance</Label>
            <Input type="textarea" id="actionGuidance" name="actionGuidance" rows="2" value={form.actionGuidance} onChange={handleField} disabled={isSubmitting} />
          </FormGroup>
          <FormGroup className="mb-0">
            <Label for="referenceSection">Reference Section</Label>
            <Input id="referenceSection" name="referenceSection" value={form.referenceSection} onChange={handleField} disabled={isSubmitting} />
          </FormGroup>
        </CardBody>
      </Card>

      <div className="d-flex justify-content-end gap-2">
        {onCancel && (
          <Button type="button" color="secondary" outline onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="button" color="secondary" outline onClick={resetForm} disabled={isSubmitting}>
          Reset
        </Button>
        <Button type="submit" color="primary" disabled={isSubmitting}>
          {isSubmitting ? <><Spinner size="sm" className="me-2" />Creating...</> : "Create SOP Rule"}
        </Button>
      </div>
    </Form>
  );
};

export default SOPForm;