import React, { useEffect } from "react";
import { Table, Input } from "reactstrap";
import Select from "react-select";
import { getIn } from "formik";


const FixedGridField = ({ field, values, onChange, error }) => {
  const { path, title, rowLabelKey, rowLabels, columns } = field;
  const currentValue = getIn(values, path);

  useEffect(() => {
    const needsSeed =
      !Array.isArray(currentValue) ||
      currentValue.length !== rowLabels.length ||
      currentValue.some((row) => !row || row[rowLabelKey] === undefined);

    if (needsSeed) {
      const emptyRowShape = columns.reduce(
        (acc, col) => ({ ...acc, [col.key]: "" }),
        {},
      );
      onChange(
        path,
        rowLabels.map((label) => ({ [rowLabelKey]: label, ...emptyRowShape })),
      );
    }
  }, [path]);

  const rows = Array.isArray(currentValue) ? currentValue : [];

  const setCell = (rowIndex, key, value) => {
    const next = rows.map((row, i) =>
      i === rowIndex ? { ...row, [key]: value } : row,
    );
    onChange(path, next);
  };

  return (
    <div className="mb-4">
      {title && (
        <h6 className="mb-2">
          {title} <span className="text-danger">*</span>
        </h6>
      )}
      <div className="table-responsive">
        <Table bordered size="sm" className="align-middle">
          <thead>
            <tr>
              <th style={{ minWidth: 160 }}> </th>
              {columns.map((col) => (
                <th key={col.key} style={{ minWidth: 140 }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rowLabel, rowIndex) => (
              <tr key={rowLabel}>
                <td className="fw-semibold">{rowLabel}</td>
                {columns.map((col) => {
                  const cellValue = rows[rowIndex]?.[col.key];
                  const cellName = `${path}.${rowIndex}.${col.key}`;

                  if (col.type === "select") {
                    const cellOptions = (col.options || []).map((opt) => ({
                      value: opt,
                      label: opt,
                    }));
                    return (
                      <td key={col.key} style={{ minWidth: 160 }}>
                        <Select
                          inputId={cellName}
                          name={cellName}
                          classNamePrefix="select"
                          placeholder="-- Select --"
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({ ...base, minHeight: 31 }),
                          }}
                          options={cellOptions}
                          value={
                            cellValue
                              ? { value: cellValue, label: cellValue }
                              : null
                          }
                          onChange={(selected) =>
                            setCell(
                              rowIndex,
                              col.key,
                              selected ? selected.value : "",
                            )
                          }
                        />
                      </td>
                    );
                  }

                  if (col.type === "number") {
                    return (
                      <td key={col.key}>
                        <Input
                          type="number"
                          bsSize="sm"
                          name={cellName}
                          value={cellValue ?? ""}
                          min={col.min}
                          max={col.max}
                          onChange={(e) =>
                            setCell(
                              rowIndex,
                              col.key,
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                      </td>
                    );
                  }

                  return (
                    <td key={col.key}>
                      <Input
                        type="text"
                        bsSize="sm"
                        name={cellName}
                        value={cellValue || ""}
                        onChange={(e) =>
                          setCell(rowIndex, col.key, e.target.value)
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
};

export default FixedGridField;
