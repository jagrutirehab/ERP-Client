import React from "react";
import Select from "react-select";
import { Input, Button, Row, Col, Label } from "reactstrap";
import { OPERATOR_OPTIONS, VALUELESS_OPERATORS } from "../constants/sopConstants";

const ConditionRow = ({ condition, idx, onChange, onRemove, isDisabled, isOnly, error }) => {
  const valueless = VALUELESS_OPERATORS.has(condition.operator?.value);

  return (
    <Row className="align-items-end mb-2">
      <Col md={4}>
        <Label className="small text-muted mb-1">
          Field{idx === 0 && <span> (e.g. bloodPressure.systolic)</span>}
        </Label>
        <Input
          placeholder="Field path"
          value={condition.field}
          onChange={(e) => onChange(idx, "field", e.target.value)}
          invalid={!!error}
          disabled={isDisabled}
        />
      </Col>

      <Col md={valueless ? 7 : 3}>
        <Label className="small text-muted mb-1">Operator</Label>
        <Select
          options={OPERATOR_OPTIONS}
          value={condition.operator}
          onChange={(v) => onChange(idx, "operator", v)}
          isDisabled={isDisabled}
        />
      </Col>

      {!valueless && (
        <Col md={4}>
          <Label className="small text-muted mb-1">Value</Label>
          <Input
            placeholder="e.g. 160"
            value={condition.value}
            onChange={(e) => onChange(idx, "value", e.target.value)}
            disabled={isDisabled}
          />
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
          title={isOnly ? "At least one row required" : "Remove"}
        >
          ×
        </Button>
      </Col>

      {error && (
        <Col xs={12}>
          <small className="text-danger">{error}</small>
        </Col>
      )}
    </Row>
  );
};

export default ConditionRow;