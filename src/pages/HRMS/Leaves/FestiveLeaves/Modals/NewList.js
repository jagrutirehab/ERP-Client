import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "reactstrap";

const NewList = ({ isOpen, toggle, onSubmit, initialRows = [] }) => {
  const [rows, setRows] = useState([{ date: "", particulars: "" }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initial =
        initialRows.length > 0
          ? initialRows
          : [{ date: "", particulars: "" }];

      setRows(initial);
      setErrors({});
    }
  }, [isOpen, initialRows]);

  const addRow = () => {
    setRows([...rows, { date: "", particulars: "" }]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  
  useEffect(() => {
    const dateMap = {};
    const newErrors = {};

    rows.forEach((row, index) => {
      if (!row.date) return;

      if (dateMap[row.date]) {
        newErrors[index] = "This date is already selected";
        newErrors[dateMap[row.date] - 1] =
          "This date is already selected";
      } else {
        dateMap[row.date] = index + 1;
      }
    });

    setErrors(newErrors);
  }, [rows]);

  const isSaveDisabled = useMemo(() => {
    if (Object.keys(errors).length > 0) return true;

    return rows.some((r) => !r.date || !r.particulars);
  }, [errors, rows]);

  const handleSave = () => {
    if (isSaveDisabled) return;

    const payload = {
      festiveLeaves: rows.map((r) => ({
        ...r,
        date: new Date(r.date).toISOString(),
      })),
    };

    onSubmit(payload);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        Add / Update Festival Holidays
      </ModalHeader>

      <ModalBody>
        <div className="d-flex flex-column gap-3">
          {rows.map((row, index) => (
            <div key={index}>
              <div
                className="d-grid"
                style={{
                  gridTemplateColumns: "180px 1fr auto auto",
                  gap: 10,
                }}
              >
                <Input
                  type="date"
                  value={row.date}
                  invalid={!!errors[index]}
                  onChange={(e) =>
                    handleChange(index, "date", e.target.value)
                  }
                />

                <Input
                  type="text"
                  placeholder="Holiday name"
                  value={row.particulars}
                  onChange={(e) =>
                    handleChange(index, "particulars", e.target.value)
                  }
                />

                {rows.length > 1 && (
                  <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={() => removeRow(index)}
                  >
                    ✕
                  </Button>
                )}

                {index === rows.length - 1 && (
                  <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={addRow}
                  >
                    ＋
                  </Button>
                )}
              </div>

              
              {errors[index] && (
                <div className="text-danger small mt-1">
                  {errors[index]}
                </div>
              )}
            </div>
          ))}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>

        <Button
          color="primary"
          disabled={isSaveDisabled} 
          onClick={handleSave}
        >
          Save Holidays
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default NewList;
