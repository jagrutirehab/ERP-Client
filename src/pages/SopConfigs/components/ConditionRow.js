import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Input, Button, Row, Col, Label } from "reactstrap";
import { OPERATOR_OPTIONS, VALUELESS_OPERATORS } from "../constants/sopConstants";
import { getICDCodes } from "../../../helpers/backend_helper";

const ConditionRow = ({ condition, idx, onChange, onRemove, isDisabled, isOnly, error, fieldOptions = [] }) => {
  const valueless = VALUELESS_OPERATORS.has(condition.operator?.value);
  const [icdOptions, setIcdOptions] = useState([]);
  const [isLoadingIcd, setIsLoadingIcd] = useState(false);

  useEffect(() => {
    if (condition.field === "provisional_diagnosis" && icdOptions.length === 0) {
      fetchProvisionalData();
    }
  }, [condition.field]);

  const handleFieldChange = (selectedOption) => {
    const newValue = selectedOption?.value || "";
    onChange(idx, "field", newValue);
    onChange(idx, "value", "");
    if (newValue === "provisional_diagnosis") {
      fetchProvisionalData();
    }
  };

  const fetchProvisionalData = async () => {
    setIsLoadingIcd(true);
    try {
      const response = await getICDCodes();
      const dataArray = Array.isArray(response) ? response : (response.data || []);
      setIcdOptions(dataArray.map((item) => ({
        label: `${item.text} - ${item.code}`,
        value: item._id,
      })));
    } catch (err) {
      console.error("API Error fetching ICD codes:", err);
    } finally {
      setIsLoadingIcd(false);
    }
  };

  return (
    <Row className="align-items-end mb-2">
      <Col md={4}>
        <Label className="small text-muted mb-1">Field</Label>
        <Select
          options={fieldOptions}
          value={fieldOptions.find((f) => f.value === condition.field) || null}
          onChange={handleFieldChange}
          isDisabled={isDisabled || !fieldOptions.length}
          placeholder={fieldOptions.length ? "Select field" : "Select target model first"}
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
          {condition.field === "provisional_diagnosis" ? (
            <Select
              options={icdOptions}
              isLoading={isLoadingIcd}
              value={icdOptions.find((opt) => opt.value === condition.value) || null}
              onChange={(selected) => onChange(idx, "value", selected ? selected.value : "")}
              isDisabled={isDisabled}
              placeholder="Select diagnosis..."
            />
          ) : (
            <Input
              placeholder="e.g. 160"
              value={condition.value || ""}
              onChange={(e) => onChange(idx, "value", e.target.value)}
              disabled={isDisabled}
            />
          )}
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

      {error && (
        <Col xs={12}>
          <small className="text-danger">{error}</small>
        </Col>
      )}
    </Row>
  );
};

export default ConditionRow;