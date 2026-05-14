import React from "react";
import { Card, CardBody, CardHeader, Button, Label } from "reactstrap";
import ConditionRow from "./ConditionRow";
import { emptyConditionItem } from "../../../Components/constants/sopConstants";

const MainBlock = ({
  satisfyingCriteria,
  setSatisfyingCriteria,
  modelFieldsCache,
  fetchModelFields,
  isSubmitting,
  fieldErrors,
}) => {
  const addCondition = () => {
    setSatisfyingCriteria(prev => ({
      ...prev,
      conditions: [...prev.conditions, emptyConditionItem()],
    }));
  };

  const removeCondition = (idx) => {
    setSatisfyingCriteria(prev => ({
      ...prev,
      conditions: prev.conditions.length === 1
        ? prev.conditions
        : prev.conditions.filter((_, i) => i !== idx),
    }));
  };

  const handleConditionChange = (idx, key, value) => {
    setSatisfyingCriteria(prev => {
      const next = [...prev.conditions];
      next[idx]  = { ...next[idx], [key]: value };
      return { ...prev, conditions: next };
    });
  };

  return (
    <Card className="mb-4 border-primary">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <span className="fw-semibold text-primary">
          2. Satisfying Criteria
          {/* <small className="text-muted fw-normal ms-2">— optional, if empty all patients are counted</small> */}
        </span>
        <Button color="primary" size="sm" outline onClick={addCondition} disabled={isSubmitting}>
          + Add Condition
        </Button>
      </CardHeader>
      <CardBody>
        {satisfyingCriteria.conditions.map((c, cIdx) => (
          <ConditionRow
            key={cIdx}
            condition={c}
            idx={cIdx}
            onChange={handleConditionChange}
            onRemove={removeCondition}
            isDisabled={isSubmitting}
            isOnly={satisfyingCriteria.conditions.length === 1}
            error={fieldErrors?.satisfyingCriteria?.conditions?.[cIdx]}
            modelFieldsCache={modelFieldsCache}
            onModelChange={fetchModelFields}
          />
        ))}
      </CardBody>
    </Card>
  );
};

export default MainBlock;