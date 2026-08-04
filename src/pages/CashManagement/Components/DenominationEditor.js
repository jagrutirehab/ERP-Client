import React from "react";
import PropTypes from "prop-types";
import { Button, Input, Table } from "reactstrap";
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

  return (
    <>
      <div className="table-responsive">
        <Table className="align-middle mb-2">
          <thead className="table-light">
            <tr>
              <th style={{ width: "40%" }}>Denomination</th>
              <th style={{ width: "25%" }}>Count</th>
              <th className="text-end" style={{ width: "25%" }}>
                Amount
              </th>
              <th style={{ width: "10%" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <Input
                    type="select"
                    disabled={disabled}
                    value={row.denomination}
                    onChange={(e) =>
                      handleRowChange(index, "denomination", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="">Select denomination</option>
                    {denominationOptions
                      .filter(
                        (d) =>
                          String(d.value) === String(row.denomination) ||
                          !usedDenominations.includes(String(d.value))
                      )
                      .map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                  </Input>
                </td>
                <td>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    disabled={disabled}
                    value={row.count}
                    onChange={(e) =>
                      handleRowChange(index, "count", e.target.value)
                    }
                  />
                </td>
                <td className="text-end fw-semibold">
                  {formatCurrency(rowAmount(row))}
                </td>
                <td className="text-end">
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
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {errors.rowErrors &&
        Object.entries(errors.rowErrors).map(([index, msg]) => (
          <div key={index} className="invalid-feedback d-block">
            <i className="fas fa-exclamation-circle me-1"></i>
            Row {Number(index) + 1}: {msg}
          </div>
        ))}
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
