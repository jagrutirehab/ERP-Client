import React from "react";
import PropTypes from "prop-types";
import { Col, Input, Row } from "reactstrap";
import { denominationOptions } from "../../../Components/constants/cash";
import { formatCurrency } from "../../../utils/formatCurrency";

export const emptyDenominationRows = () =>
  denominationOptions.map((d) => ({ denomination: String(d.value), count: "" }));

export const rowAmount = (row) =>
  Number(row.denomination || 0) * Number(row.count || 0);

export const denominationTotal = (rows) =>
  rows.reduce((sum, row) => sum + rowAmount(row), 0);

export const validateDenominationRows = (rows) => {
  const errors = {};

  const rowErrors = {};
  rows.forEach((row, index) => {
    if (row.count === "") return;
    const count = Number(row.count);
    if (!Number.isInteger(count) || count < 0) {
      rowErrors[index] = "Enter a valid count";
    }
  });
  if (Object.keys(rowErrors).length) errors.rowErrors = rowErrors;

  return errors;
};

export const toDenominationPayload = (rows) =>
  rows
    .filter((row) => row.count !== "")
    .map((row) => ({
      denomination: Number(row.denomination),
      count: Number(row.count),
    }));

export const toDenominationRows = (denominations = []) =>
  denominationOptions.map((d) => {
    const match = denominations.find(
      (item) => Number(item.denomination) === d.value
    );
    return {
      denomination: String(d.value),
      count: match ? String(match.count) : "",
    };
  });

const DenominationEditor = ({ rows, setRows, errors = {}, disabled }) => {
  const handleCountChange = (index, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, count: value } : row))
    );
  };

  const labelFor = (value) =>
    denominationOptions.find((o) => String(o.value) === String(value))
      ?.label || `₹${value}`;

  return (
    <>
      <div className="d-none d-sm-flex text-muted small fw-semibold mb-1">
        <div className="flex-grow-1" style={{ flexBasis: "45%" }}>
          Denomination
        </div>
        <div style={{ flexBasis: "27%" }}>Count</div>
        <div className="text-end" style={{ flexBasis: "28%" }}>
          Amount
        </div>
      </div>

      {rows.map((row, index) => {
        const rowError = errors.rowErrors?.[index];
        return (
          <div key={row.denomination} className="border-bottom pb-2 mb-2">
            <Row className="g-2 align-items-center">
              <Col xs={12} sm={5} className="fw-medium">
                {labelFor(row.denomination)}
              </Col>
              <Col xs={6} sm={4}>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Count"
                  disabled={disabled}
                  value={row.count}
                  onChange={(e) => handleCountChange(index, e.target.value)}
                />
              </Col>
              <Col xs={6} sm={3} className="text-end fw-semibold">
                {formatCurrency(rowAmount(row))}
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

      <div className="d-flex justify-content-end align-items-center mb-3">
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
