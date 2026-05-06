import React, { useState, useCallback, useMemo } from "react";
import Select from "react-select";
import {
  Card, CardBody, CardHeader,
  Form, FormGroup, Label, Input,
  Button, Row, Col, Alert, Spinner,
} from "reactstrap";
import {
  TRIGGER_OPTIONS, SEVERITY_OPTIONS, TARGET_OPTIONS,
  VALUELESS_OPERATORS, emptyCondition, emptyForm,
} from "../constants/sopConstants"
import ConditionRow from "./ConditionRow";
import RoutingCard from "./RoutingCard";

const SOPForm = ({ onSubmit, isSubmitting = false, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const [conditions, setConditions] = useState([emptyCondition()]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [topError, setTopError] = useState(null);

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

  const handleConditionChange = useCallback((idx, key, value) => {
    setConditions((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const next = { ...c, [key]: value };
        if (key === "operator" && VALUELESS_OPERATORS.has(value?.value)) next.value = "";
        return next;
      })
    );
  }, []);

  const addCondition = useCallback(() => {
    setConditions((prev) => [...prev, emptyCondition()]);
  }, []);

  const removeCondition = useCallback((idx) => {
    setConditions((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  }, []);

  const resetForm = useCallback(() => {
    setForm(emptyForm());
    setConditions([emptyCondition()]);
    setSelectedRoles([]);
    setSelectedUsers([]);
    setFieldErrors({});
    setTopError(null);
  }, []);

  const validate = () => {
    const errs = {};

    if (!form.ruleName.trim()) errs.ruleName = "Rule name is required";
    if (!form.targetModel) errs.targetModel = "Target model is required";
    if (!form.alertTemplate.trim()) errs.alertTemplate = "Alert template is required";

    if (form.triggerType?.value === "DELAYED") {
      const hrs = Number(form.deadlineHours);
      if (!form.deadlineHours || isNaN(hrs) || hrs <= 0)
        errs.deadlineHours = "Deadline hours must be greater than 0 for DELAYED rules";
    }

    const conditionErrs = [];
    conditions.forEach((c, i) => {
      if (!c.field && (c.value === "" || c.value == null)) return;
      if (!c.field.trim()) { conditionErrs[i] = "Field is required"; return; }
      if (!VALUELESS_OPERATORS.has(c.operator?.value) && c.value === "")
        conditionErrs[i] = `Value required for ${c.operator?.value}`;
    });
    if (conditionErrs.length) errs.conditions = conditionErrs;

    const parsedEmails = form.notifyEmails.split(",").map((e) => e.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const badEmails = parsedEmails.filter((e) => !emailRegex.test(e));
    if (badEmails.length) errs.notifyEmails = `Invalid email(s): ${badEmails.join(", ")}`;

    if (!selectedRoles.length && !parsedEmails.length && !selectedUsers.length)
      errs.routing = "Add at least one notification channel (role, email, or user)";

    return { valid: !Object.keys(errs).length, errors: errs, parsedEmails };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTopError(null);

    const { valid, errors, parsedEmails } = validate();
    if (!valid) {
      setFieldErrors(errors);
      setTopError("Please fix the highlighted fields before submitting");
      return;
    }
    setFieldErrors({});

    const cleanConditions = conditions
      .filter((c) => c.field.trim())
      .map((c) => {
        const out = { field: c.field.trim(), operator: c.operator?.value };
        if (!VALUELESS_OPERATORS.has(c.operator?.value)) {
          const n = Number(c.value);
          out.value = c.value !== "" && !isNaN(n) ? n : c.value;
        }
        return out;
      });

    const routing = {};
    if (selectedRoles.length) routing.notifyRoles = selectedRoles;
    if (parsedEmails.length) routing.notifyEmails = parsedEmails;
    if (selectedUsers.length) routing.notifySpecificUsers = selectedUsers.map((u) => u.value);

    const payload = {
      ruleName: form.ruleName.trim(),
      triggerType: form.triggerType?.value,
      targetModel: form.targetModel?.value,
      severity: form.severity?.value,
      alertTemplate: form.alertTemplate.trim(),
      isActive: form.isActive,
      conditions: cleanConditions,
      routing,
    };
    if (form.protocol.trim()) payload.protocol = form.protocol.trim();
    if (form.triggerType?.value === "DELAYED") payload.deadlineHours = Number(form.deadlineHours);


    try {
      const response = await onSubmit(payload);
      if (response) {
        setForm((prev) => ({ ...emptyForm(), targetModel: prev.targetModel, severity: prev.severity }));
        setConditions([emptyCondition()]);
        setSelectedRoles([]);
        setSelectedUsers([]);
      }
    } catch (err) {
      setTopError(err?.message || "Submission failed");
    }
  };

  const showDeadline = form.triggerType?.value === "DELAYED";

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {topError && (
        <Alert color="danger" toggle={() => setTopError(null)}>{topError}</Alert>
      )}

      {/* Basic Info */}

      <Card className="mb-4">
        <CardHeader className="fw-semibold">1. Basic Info</CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="ruleName">Rule Name <span className="text-danger">*</span></Label>
                <Input
                  id="ruleName"
                  name="ruleName"
                  placeholder="e.g. 24hr Admission Form Check"
                  value={form.ruleName}
                  onChange={handleField}
                  invalid={!!fieldErrors.ruleName}
                  disabled={isSubmitting}
                />
                {fieldErrors.ruleName && <small className="text-danger">{fieldErrors.ruleName}</small>}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="protocol">Protocol (optional)</Label>
                <Input
                  id="protocol"
                  name="protocol"
                  placeholder="e.g. PROTO-001"
                  value={form.protocol}
                  onChange={handleField}
                  disabled={isSubmitting}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Severity</Label>
                <Select
                  options={SEVERITY_OPTIONS}
                  value={form.severity}
                  onChange={(v) => handleSelect("severity", v)}
                  isDisabled={isSubmitting}
                />
              </FormGroup>
            </Col>
            <Col md={6} className="d-flex align-items-center">
              <FormGroup check className="mt-3">
                <Input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleField}
                  disabled={isSubmitting}
                />
                <Label check for="isActive">Activate rule immediately</Label>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Trigger */}
      <Card className="mb-4">
        <CardHeader className="fw-semibold">2. Trigger</CardHeader>
        <CardBody>
          <Row>
            <Col md={showDeadline ? 4 : 6}>
              <FormGroup>
                <Label>Trigger Type <span className="text-danger">*</span></Label>
                <Select
                  options={TRIGGER_OPTIONS}
                  value={form.triggerType}
                  onChange={(v) => handleSelect("triggerType", v)}
                  isDisabled={isSubmitting}
                />
                <small className="text-muted">
                  {form.triggerType?.value === "IMMEDIATE"
                    ? "Fires the moment the entity is created/updated."
                    : "Fires after the deadline if conditions are still met."}
                </small>
              </FormGroup>
            </Col>
            <Col md={showDeadline ? 4 : 6}>
              <FormGroup>
                <Label>Target Model <span className="text-danger">*</span></Label>
                <Select
                  options={TARGET_OPTIONS}
                  value={form.targetModel}
                  onChange={(v) => handleSelect("targetModel", v)}
                  isDisabled={isSubmitting}
                  placeholder="-- Select model --"
                  classNamePrefix={fieldErrors.targetModel ? "select-error" : ""}
                />
                {fieldErrors.targetModel && (
                  <small className="text-danger">{fieldErrors.targetModel}</small>
                )}
              </FormGroup>
            </Col>
            {showDeadline && (
              <Col md={4}>
                <FormGroup>
                  <Label for="deadlineHours">Deadline (hours) <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    id="deadlineHours"
                    name="deadlineHours"
                    min="1"
                    placeholder="e.g. 24"
                    value={form.deadlineHours}
                    onChange={handleField}
                    invalid={!!fieldErrors.deadlineHours}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.deadlineHours && (
                    <small className="text-danger">{fieldErrors.deadlineHours}</small>
                  )}
                </FormGroup>
              </Col>
            )}
          </Row>
        </CardBody>
      </Card>

      {/*  Conditions */}
      <Card className="mb-4">
        <CardHeader className="d-flex justify-content-between align-items-center fw-semibold">
          <span>
            3. Conditions{" "}
            <small className="text-muted fw-normal">(all must match for the rule to fire)</small>
          </span>
          <Button type="button" color="primary" size="sm" outline onClick={addCondition} disabled={isSubmitting}>
            + Add Condition
          </Button>
        </CardHeader>
        <CardBody>
          {conditions?.map((c, idx) => (
            <ConditionRow
              key={idx}
              condition={c}
              idx={idx}
              onChange={handleConditionChange}
              onRemove={removeCondition}
              isDisabled={isSubmitting}
              isOnly={conditions.length === 1}
              error={Array.isArray(fieldErrors.conditions) ? fieldErrors.conditions[idx] : null}
            />
          ))}
          <small className="text-muted d-block mt-2">
            Leave all fields blank in a row to ignore it. Conditions are optional — if none, the rule fires purely on the trigger.
          </small>
        </CardBody>
      </Card>

      {/* Routing */}
      <RoutingCard
        selectedRoles={selectedRoles}
        onRoleToggle={handleRoleToggle}
        selectedUsers={selectedUsers}
        onUsersChange={handleUsersChange}
        notifyEmails={form.notifyEmails}
        onNotifyEmailsChange={handleField}
        notifyEmailsError={fieldErrors.notifyEmails}
        routingError={fieldErrors.routing}
        isSubmitting={isSubmitting}
      />

      {/* Alert Message */}
      <Card className="mb-4">
        <CardHeader className="fw-semibold">5. Alert Message</CardHeader>
        <CardBody>
          <FormGroup>
            <Label for="alertTemplate">Alert Template <span className="text-danger">*</span></Label>
            <Input
              type="textarea"
              id="alertTemplate"
              name="alertTemplate"
              rows="3"
              value={form.alertTemplate}
              onChange={handleField}
              invalid={!!fieldErrors.alertTemplate}
              disabled={isSubmitting}
            />
            {fieldErrors.alertTemplate && (
              <small className="text-danger">{fieldErrors.alertTemplate}</small>
            )}
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