import React, { useEffect, useState } from "react";
import { CardBody, Button, Input, Label, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { postESICRecords } from "../../../../helpers/backend_helper";
import EmployeeSearchSelect from "../components/EmployeeSearchSelect";
import ESICAttachmentPicker from "../components/ESICAttachmentPicker";

const makeEmptyRow = (id) => ({
  id,
  employee: null,
  description: "",
  files: [],
});

const getRowErrors = (row) => {
  const errors = {};
  if (!row.employee) errors.employee = "Select an employee";
  if (row.files.length === 0) errors.files = "At least one file is required";
  return errors;
};

const UploadESIC = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoading } = usePermissions(token);
  const hasReadPermission = hasPermission("HR", "ESIC_UPLOAD", "READ");
  const hasWritePermission = hasPermission("HR", "ESIC_UPLOAD", "WRITE");

  const [rows, setRows] = useState([makeEmptyRow(0)]);
  const [submitting, setSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [rowErrors, setRowErrors] = useState({});

  useEffect(() => {
    if (!permissionLoading && !hasReadPermission) {
      navigate("/unauthorized");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionLoading, hasReadPermission]);

  const updateRow = (id, changes) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      makeEmptyRow((prev[prev.length - 1]?.id || 0) + 1),
    ]);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const errorsByRow = {};
    rows.forEach((row) => {
      const errors = getRowErrors(row);
      if (Object.keys(errors).length > 0) errorsByRow[row.id] = errors;
    });
    setRowErrors(errorsByRow);

    if (Object.keys(errorsByRow).length > 0) {
      toast.error("Please fix the highlighted fields before submitting");
      return;
    }

    // Handles the structured { success, message, results } payload this
    // endpoint always returns for a per-row outcome — whether it arrived as
    // a resolved response (some/all rows saved) or as a rejected one (the
    // server still returns 400 with the same shape when zero rows saved,
    // e.g. every row hit a duplicate check).
    const handleSubmissionResult = (result) => {
      const failed = (result.results || []).filter((row) => !row.success);

      if (failed.length === 0) {
        toast.success(result.message || "ESIC records submitted successfully");
        setRows([makeEmptyRow(0)]);
        setSubmitAttempted(false);
        setRowErrors({});
        return;
      }

      // Show the real, specific per-row reason(s) in the toast rather than
      // the generic top-level summary message.
      toast.error(failed.map((row) => row.message).join(" | "));
      const apiErrorsByRow = {};
      failed.forEach((row) => {
        const matchingRow = rows[row.index];
        if (matchingRow) apiErrorsByRow[matchingRow.id] = { api: row.message };
      });
      setRowErrors((prev) => ({ ...prev, ...apiErrorsByRow }));
    };

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append(
        "records",
        JSON.stringify(
          rows.map((row) => ({
            employeeId: row.employee._id,
            description: row.description.trim(),
          })),
        ),
      );
      rows.forEach((row, index) => {
        row.files.forEach((file) => formData.append(`files_${index}`, file));
      });

      const response = await postESICRecords(formData);
      handleSubmissionResult(response);
    } catch (error) {
      // The server returns the same { message, results } shape even on a
      // rejected (4xx) response when every row in the batch failed — handle
      // it identically instead of only showing the generic top-level message.
      if (Array.isArray(error?.results)) {
        handleSubmissionResult(error);
      } else {
        toast.error(error?.message || "Failed to submit ESIC records");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (permissionLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  return (
    <CardBody
      className="bg-white"
      style={
        isMobile
          ? {
              width: "100%",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingBottom: "1rem",
            }
          : { width: "78%" }
      }
    >
      <div className="px-3 pt-3">
        <h5 className="mb-1">ESIC Upload</h5>
        <small className="text-muted">
          Add one or more ESIC records and submit them together
        </small>
      </div>
      <hr className="mb-2 border-secondary" />
      <div className="px-3">
        {rows.map((row) => {
          const errors = submitAttempted ? rowErrors[row.id] || {} : {};
          return (
            <div key={row.id} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <Label className="fw-semibold mb-0">
                  Employee <span className="text-danger">*</span>
                </Label>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    color="link"
                    className="text-danger p-0"
                    onClick={() => removeRow(row.id)}
                    disabled={submitting}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <EmployeeSearchSelect
                value={row.employee}
                onSelect={(employee) => updateRow(row.id, { employee })}
                disabled={submitting}
              />
              {errors.employee && (
                <p className="text-danger small mt-1 mb-0">
                  {errors.employee}
                </p>
              )}

              <Label className="fw-semibold mt-3">Description (optional)</Label>
              <Input
                type="textarea"
                value={row.description}
                onChange={(event) =>
                  updateRow(row.id, { description: event.target.value })
                }
                disabled={submitting}
              />

              <Label className="fw-semibold mt-3 d-block">
                Files <span className="text-danger">*</span>
              </Label>
              <ESICAttachmentPicker
                newFiles={row.files}
                onAddFiles={(added) =>
                  updateRow(row.id, { files: [...row.files, ...added] })
                }
                onRemoveNew={(index) =>
                  updateRow(row.id, {
                    files: row.files.filter((_, i) => i !== index),
                  })
                }
                disabled={submitting}
              />
              {errors.files && (
                <p className="text-danger small mt-1 mb-0">{errors.files}</p>
              )}
              {errors.api && (
                <p className="text-danger small mt-1 mb-0">{errors.api}</p>
              )}
            </div>
          );
        })}

        <Button type="button" color="light" onClick={addRow} disabled={submitting}>
          + Add Another Record
        </Button>

        <div className="mt-4">
          <Button
            type="button"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting || !hasWritePermission}
          >
            {submitting ? (
              <Spinner size="sm" />
            ) : rows.length > 1 ? (
              `Submit ${rows.length} Records`
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>
    </CardBody>
  );
};

export default UploadESIC;
