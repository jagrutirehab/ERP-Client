import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Select from "react-select";

const VALID_FILE_TYPES = [
  { value: "Form26AS", label: "Form 26AS" },
  { value: "TDS", label: "TDS" },
  { value: "Form16", label: "Form 16" },
  { value: "Payslip", label: "Payslip" },
];

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((m) => ({ value: m, label: m }));

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

const FormActionModal = ({
  isOpen,
  onClose,
  type,
  row,
  onConfirm,
  loading,
}) => {
  const fileInputRef = useRef(null);
  const isEdit = type === "edit";
  const isDelete = type === "delete";

  const [editState, setEditState] = useState({
    fileType: null,
    year: null,
    month: null,
    file: null,
  });

  useEffect(() => {
    if (isOpen && isEdit && row) {
      setEditState({
        fileType:
          VALID_FILE_TYPES.find((o) => o.value === row.fileType) || null,
        year: YEAR_OPTIONS.find((o) => o.value === row.year) || null,
        month: MONTH_OPTIONS.find((o) => o.value === row.month) || null,
        file: null,
      });
    }
  }, [isOpen, row]);

  const handleConfirm = () => {
    if (isEdit) {
      onConfirm({ ...editState, fileId: row.fileId, docId: row.docId });
    } else {
      onConfirm({ docId: row.docId, fileId: row.fileId });
    }
  };

  const isPayslip = editState.fileType?.value === "Payslip";

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>
        {isEdit ? "Edit Form Entry" : "Delete Employee Form"}
      </ModalHeader>

      <ModalBody>
        {isDelete && (
          <p className="mb-0">
            Are you sure you want to delete <strong>{row?.fileType}</strong>{" "}
            {row?.fileType === "Payslip" ? (
              <>
                for{" "}
                <strong>
                  {row?.month}/{row?.year}
                </strong>
              </>
            ) : (
              <>
                for <strong>{row?.year}</strong>
              </>
            )}{" "}
            of <strong>{row?.employeeName}</strong>? This action cannot be
            undone.
          </p>
        )}

        {isEdit && (
          <>
            <FormGroup>
              <Label>
                File Type <span className="text-danger">*</span>
              </Label>
              <Select
                placeholder="Select file type"
                isClearable
                options={VALID_FILE_TYPES}
                classNamePrefix="react-select"
                value={editState.fileType}
                onChange={(opt) => {
                  setEditState((prev) => ({
                    ...prev,
                    fileType: opt,
                    month: opt?.value !== "Payslip" ? null : prev.month,
                  }));
                }}
              />
            </FormGroup>

            <div className="d-flex gap-3">
              <FormGroup className="flex-fill">
                <Label>
                  Year <span className="text-danger">*</span>
                </Label>
                <Select
                  placeholder="Year"
                  isClearable
                  options={YEAR_OPTIONS}
                  classNamePrefix="react-select"
                  value={editState.year}
                  onChange={(opt) =>
                    setEditState((prev) => ({ ...prev, year: opt }))
                  }
                />
              </FormGroup>

              {isPayslip && (
                <FormGroup className="flex-fill">
                  <Label>
                    Month <span className="text-danger">*</span>
                  </Label>
                  <Select
                    placeholder="Month"
                    isClearable
                    options={MONTH_OPTIONS}
                    classNamePrefix="react-select"
                    value={editState.month}
                    onChange={(opt) =>
                      setEditState((prev) => ({ ...prev, month: opt }))
                    }
                  />
                </FormGroup>
              )}
            </div>

            <FormGroup className="mb-0">
              <Label>File</Label>
              {row?.fileName && (
                <div className="mb-2 small text-muted d-flex align-items-center gap-2">
                  <span>Current:</span>
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary"
                  >
                    {row.fileName}
                  </a>
                </div>
              )}
              <Input
                type="file"
                innerRef={fileInputRef}
                onChange={(e) =>
                  setEditState((prev) => ({
                    ...prev,
                    file: e.currentTarget.files[0] || null,
                  }))
                }
              />
              <div className="text-muted small mt-1">
                Leave empty to keep the existing file.
              </div>
            </FormGroup>
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" outline onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color={isDelete ? "danger" : "primary"}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading && <Spinner size="sm" className="me-2" />}
          {isDelete ? "Yes, Delete" : "Save Changes"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default FormActionModal;
