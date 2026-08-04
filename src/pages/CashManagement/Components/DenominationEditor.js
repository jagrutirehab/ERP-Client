import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Input, Row } from "reactstrap";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";
import { denominationOptions } from "../../../Components/constants/cash";
import { formatCurrency } from "../../../utils/formatCurrency";

export const emptyDenominationRow = () => ({ denomination: "", count: "" });

export const rowAmount = (row) =>
  Number(row.denomination || 0) * Number(row.count || 0);

export const denominationTotal = (rows) =>
  rows.reduce((sum, row) => sum + rowAmount(row), 0);

export const validateDenominationRows = (rows) => {
  const errors = {};

  if (rows.filter((row) => row.denomination !== "").length === 0) {
    errors.rows = "Please add at least one denomination";
  }

  const rowErrors = {};
  rows.forEach((row, index) => {
    if (row.denomination === "" && row.count === "") return;
    if (row.denomination === "") {
      rowErrors[index] = "Select a denomination";
      return;
    }
    const count = Number(row.count);
    if (row.count === "" || !Number.isInteger(count) || count < 0) {
      rowErrors[index] = "Enter a valid count";
    }
  });
  if (Object.keys(rowErrors).length) errors.rowErrors = rowErrors;

  if (!errors.rows && denominationTotal(rows) <= 0) {
    errors.rows = "Total must be greater than 0";
  }

  return errors;
};

export const toDenominationPayload = (rows) =>
  rows
    .filter((row) => row.denomination !== "")
    .map((row) => ({
      denomination: Number(row.denomination),
      count: Number(row.count || 0),
    }));

export const toDenominationRows = (denominations = []) =>
  denominations.map((d) => ({
    denomination: String(d.denomination),
    count: String(d.count),
  }));

const DenominationEditor = ({ rows, setRows, errors = {}, disabled }) => {
  const usedDenominations = rows
    .map((row) => String(row.denomination))
    .filter(Boolean);

  const handleRowChange = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyDenominationRow()]);

  const removeRow = (index) =>
    setRows((prev) =>
      prev.length === 1
        ? [emptyDenominationRow()]
        : prev.filter((_, i) => i !== index)
    );

  const denominationSelectOptions = denominationOptions.map((d) => ({
    value: d.value,
    label: d.label,
  }));

  return (
    <>
      <div className="d-none d-sm-flex text-muted small fw-semibold mb-1">
        <div className="flex-grow-1" style={{ flexBasis: "45%" }}>
          Denomination
        </div>
        <div style={{ flexBasis: "22%" }}>Count</div>
        <div className="text-end" style={{ flexBasis: "23%" }}>
          Amount
        </div>
        <div style={{ flexBasis: "10%" }} />
      </div>

      {rows.map((row, index) => {
        const rowError = errors.rowErrors?.[index];
        return (
          <div key={index} className="border-bottom pb-2 mb-2">
            <Row className="g-2 align-items-center">
              <Col xs={12} sm={5}>
                <Select
                  classNamePrefix="react-select"
                  isDisabled={disabled}
                  placeholder="Select denomination"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  options={denominationSelectOptions.filter(
                    (o) =>
                      String(o.value) === String(row.denomination) ||
                      !usedDenominations.includes(String(o.value))
                  )}
                  value={
                    denominationSelectOptions.find(
                      (o) => String(o.value) === String(row.denomination)
                    ) || null
                  }
                  onChange={(option) =>
                    handleRowChange(index, "denomination", option?.value ?? "")
                  }
                  isClearable
                />
              </Col>
              <Col xs={6} sm={3}>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Count"
                  disabled={disabled}
                  value={row.count}
                  onChange={(e) =>
                    handleRowChange(index, "count", e.target.value)
                  }
                />
              </Col>
              <Col xs={4} sm={3} className="text-end fw-semibold">
                {formatCurrency(rowAmount(row))}
              </Col>
              <Col xs={2} sm={1} className="text-end">
                <Button
                  color="link"
                  className="text-danger p-0"
                  type="button"
                  disabled={disabled}
                  onClick={() => removeRow(index)}
                  title="Remove row"
                >
                  <Trash2 size={16} />
                </Button>
              </Col>
            </Row>
            {rowError && (
              <div className="invalid-feedback d-block small mt-1 mb-0">
                <i className="fas fa-exclamation-circle me-1"></i>
                {rowError}
              </div>
            )}
          </div>
        );
      })}

      {errors.rows && (
        <div className="invalid-feedback d-block">
          <i className="fas fa-exclamation-circle me-1"></i>
          {errors.rows}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          color="secondary"
          outline
          size="sm"
          type="button"
          onClick={addRow}
          disabled={disabled || rows.length >= denominationOptions.length}
        >
          <Plus size={14} className="me-1" />
          Add Denomination
        </Button>
        <span className="fw-semibold">
          Total: {formatCurrency(denominationTotal(rows))}
        </span>
      </div>
    </>
  );
};

DenominationEditor.propTypes = {
  rows: PropTypes.array.isRequired,
  setRows: PropTypes.func.isRequired,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
};

export default DenominationEditor;
