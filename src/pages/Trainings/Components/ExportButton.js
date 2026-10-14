import React, { useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { exportProgressCsv } from "../../../helpers/backend_helper";
import { getErrorMessage } from "../Helpers/learnHelpers";
import { getFileNameFromHeaders } from "../Helpers/adminTrainingHelpers";

const ExportButton = ({ trainingId, params, label = "Export CSV", disabled, className = "btn-outline-primary" }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportProgressCsv(trainingId, params);
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = getFileNameFromHeaders(response.headers, "training-export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      toast.error(getErrorMessage(error, "Export failed"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-sm ${className}`}
      disabled={exporting || disabled}
      onClick={handleExport}
    >
      {exporting ? <Spinner size="sm" /> : <><i className="ri-download-2-line me-1" /> {label}</>}
    </button>
  );
};

export default ExportButton;
