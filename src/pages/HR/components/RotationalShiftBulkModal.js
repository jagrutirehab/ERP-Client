import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { format } from "date-fns";
import {
  Alert,
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
} from "reactstrap";
import * as XLSX from "xlsx";
import { checkIsExcel } from "../../../utils/checkIsExcel";

const toDate = (value) => (value ? new Date(value) : null);

const formatExcelTime = (value) => {
  if (typeof value !== "number") return value;
  const totalSeconds = Math.round(value * 24 * 60 * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const h = hours % 24;
  return `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const RotationalShiftBulkModal = ({
  isOpen,
  toggle,
  mode,
  loading,
  centerOptions,
  defaultCenter,
  defaultDateRange,
  onConfirm,
}) => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [reportDate, setReportDate] = useState({
    start: null,
    end: null,
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedCenter(defaultCenter || centerOptions[0]?.value || null);
    setReportDate({
      start: toDate(defaultDateRange?.start),
      end: toDate(defaultDateRange?.end),
    });
    setFile(null);
    setFileError("");
    setPreviewData([]);
  }, [isOpen, defaultCenter, defaultDateRange, centerOptions]);

  const selectedCenterOption = useMemo(
    () => centerOptions.find((option) => option.value === selectedCenter) || null,
    [centerOptions, selectedCenter]
  );

  const isUploadMode = mode === "upload";

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    event.target.value = "";

    if (!selectedFile) {
      setFile(null);
      setFileError("");
      return;
    }

    if (!checkIsExcel(selectedFile)) {
      setFile(null);
      setFileError("Please select a valid Excel file (.xlsx or .xls).");
      return;
    }

    setFile(selectedFile);
    setFileError("");

    // Parse preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setPreviewData(json.slice(0, 11)); // Header + 10 rows
      } catch (err) {
        console.error("Error parsing excel for preview", err);
        setPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleConfirm = () => {
    if (isUploadMode) {
      if (!file) {
        setFileError("Please select an Excel file to upload.");
        return;
      }
      onConfirm({ file });
    } else {
      if (!selectedCenter || !reportDate.start || !reportDate.end) return;
      onConfirm({
        center: selectedCenter,
        startDate: format(reportDate.start, "yyyy-MM-dd"),
        endDate: format(reportDate.end, "yyyy-MM-dd"),
      });
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={!loading ? toggle : undefined} size="xl" >
      <ModalHeader toggle={!loading ? toggle : undefined}>
        {isUploadMode ? "Upload Rotational Shift Excel" : "Download Rotational Shift Template"}
      </ModalHeader>

      <ModalBody>
        <div className="d-flex flex-column gap-3">
          {!isUploadMode && (
            <>
              <div>
                <Label className="form-label fw-semibold">Select Center</Label>
                <Select
                  value={selectedCenterOption}
                  onChange={(option) => setSelectedCenter(option?.value || null)}
                  options={centerOptions}
                  classNamePrefix="react-select"
                  placeholder="Select center"
                  isDisabled={loading || centerOptions.length === 0}
                />
              </div>

              <div>
                <Label className="form-label fw-semibold">Start Date</Label>
                <Flatpickr
                  value={reportDate.start || ""}
                  options={{
                    dateFormat: "d M, Y",
                    maxDate: reportDate.end || undefined,
                    disableMobile: true,
                  }}
                  onChange={([date]) => setReportDate((prev) => ({ ...prev, start: date || null }))}
                  className="form-control"
                  disabled={loading}
                />
              </div>

              <div>
                <Label className="form-label fw-semibold">End Date</Label>
                <Flatpickr
                  value={reportDate.end || ""}
                  options={{
                    dateFormat: "d M, Y",
                    minDate: reportDate.start || undefined,
                    disableMobile: true,
                  }}
                  onChange={([date]) => setReportDate((prev) => ({ ...prev, end: date || null }))}
                  className="form-control"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {isUploadMode && (
            <>
              <div>
                <Label className="form-label fw-semibold">Select Excel File</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {file && <div className="small text-muted mt-2">Selected file: {file.name}</div>}
                {fileError && <div className="small text-danger mt-2">{fileError}</div>}
              </div>

              {previewData.length > 0 && (
                <div className="border rounded p-2" style={{ maxHeight: "250px", overflow: "auto", background: "#f8f9fa" }}>
                  <Label className="form-label fw-semibold small mb-2 text-primary">Preview (Top 10 Rows)</Label>
                  <Table size="sm" responsive bordered hover className="mb-0" style={{ fontSize: "11px" }}>
                    <thead className="table-light">
                      <tr>
                        {previewData[0]?.map((col, idx) => (
                          <th key={idx}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(1).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {previewData[0]?.map((colName, colIdx) => {
                            const value = row[colIdx];
                            const isTimeCol = colName?.toLowerCase().includes("time");
                            return (
                              <td key={colIdx}>
                                {isTimeCol && typeof value === "number" ? formatExcelTime(value) : (value ?? "")}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="light" onClick={toggle} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleConfirm}
          disabled={loading || (isUploadMode ? !file : (!selectedCenter || !reportDate.start || !reportDate.end))}
        >
          {loading ? <Spinner size="sm" /> : isUploadMode ? "Upload" : "Download"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

RotationalShiftBulkModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["download", "upload"]).isRequired,
  loading: PropTypes.bool,
  centerOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  defaultCenter: PropTypes.string,
  defaultDateRange: PropTypes.shape({
    start: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    end: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  }),
  onConfirm: PropTypes.func.isRequired,
};

RotationalShiftBulkModal.defaultProps = {
  loading: false,
  centerOptions: [],
  defaultCenter: null,
  defaultDateRange: {
    start: null,
    end: null,
  },
};

export default RotationalShiftBulkModal;
