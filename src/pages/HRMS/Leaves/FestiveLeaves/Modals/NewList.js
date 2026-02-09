import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "reactstrap";

const NewList = ({ isOpen, toggle, onSubmit }) => {
  const [rows, setRows] = useState([{ date: "", particulars: "" }]);

  const addRow = () => {
    setRows([...rows, { date: "", particulars: "" }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSave = () => {
    const payload = {
      festiveLeaves: rows
        .filter((r) => r.date && r.particulars)
        .map((r) => ({
          ...r,
          date: new Date(r.date).toISOString(),
        })),
    };

    onSubmit(payload);
    toggle();
  };
  
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="fw-semibold">
        Add Festival / National Holidays
      </ModalHeader>

      <ModalBody>
        <div className="d-flex flex-column gap-3">
          {rows.map((row, index) => (
            <div
              key={index}
              className="d-grid align-items-center"
              style={{
                gridTemplateColumns: "180px 1fr auto auto",
                gap: "10px",
              }}
            >
              {/* Date */}
              <Input
                type="date"
                value={row.date}
                onChange={(e) => handleChange(index, "date", e.target.value)}
              />

              {/* Particulars */}
              <Input
                type="text"
                placeholder="Holiday name"
                value={row.particulars}
                onChange={(e) =>
                  handleChange(index, "particulars", e.target.value)
                }
              />

              {/* Remove */}
              {rows.length > 1 && (
                <Button
                  color="danger"
                  outline
                  size="sm"
                  onClick={() => removeRow(index)}
                  style={{ width: "36px", height: "36px" }}
                >
                  ✕
                </Button>
              )}

              {/* Add */}
              {index === rows.length - 1 && (
                <Button
                  color="primary"
                  outline
                  size="sm"
                  onClick={addRow}
                  style={{ width: "36px", height: "36px" }}
                >
                  ＋
                </Button>
              )}
            </div>
          ))}
        </div>
      </ModalBody>

      <ModalFooter className="d-flex justify-content-end gap-2">
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave}>
          Save Holidays
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default NewList;
