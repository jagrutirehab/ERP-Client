import { useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    FormFeedback,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Spinner,
    Table,
    Alert,
} from "reactstrap";
import { useSelector } from "react-redux";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { uploadMonthlyAttendance } from "../../../helpers/backend_helper";
import * as XLSX from "xlsx";

const MonthlyAttendanceUploadModal = ({ isOpen, toggle, onRefresh }) => {
    const handleAuthError = useAuthError();
    const { centerAccess, userCenters } = useSelector((state) => state.User);

    const [selectedCenter, setSelectedCenter] = useState(null);
    const [file, setFile] = useState(null);
    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [previewRows, setPreviewRows] = useState([]);
    const [fileError, setFileError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const centerOptions =
        centerAccess?.map((id) => {
            const center = userCenters?.find((c) => c._id === id);
            return {
                value: id,
                label: center?.title || "Unknown Center",
            };
        }) || [];

    const resetState = () => {
        setSelectedCenter(null);
        setFile(null);
        setPreviewHeaders([]);
        setPreviewRows([]);
        setFileError("");
        setUploading(false);
        setUploadResult(null);
    };

    const handleClose = () => {
        if (uploading) return;
        const hadSuccess = uploadResult?.success;
        resetState();
        toggle();
        if (hadSuccess) {
            onRefresh?.();
        }
    };

    const isRowBlank = (row) =>
        row.every(
            (cell) =>
                cell === null ||
                cell === undefined ||
                String(cell).trim() === ""
        );

    const handleFileChange = (selectedFile) => {
        if (!selectedFile) return;

        setFileError("");
        setPreviewHeaders([]);
        setPreviewRows([]);
        setUploadResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(
                    new Uint8Array(e.target.result),
                    { type: "array" }
                );

                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    defval: "",
                });

                if (!rows.length) {
                    setFileError("The file appears to be empty.");
                    return;
                }

                // Find the first non-blank row as the header
                const headerIndex = rows.findIndex((row) => !isRowBlank(row));
                if (headerIndex === -1) {
                    setFileError("No data found in the file.");
                    return;
                }

                const headers = rows[headerIndex];
                setPreviewHeaders(headers);

                const dataRows = rows
                    .slice(headerIndex + 1)
                    .filter((row) => !isRowBlank(row));

                if (dataRows.length === 0) {
                    setFileError("No data rows found in the file.");
                    return;
                }

                setPreviewRows(dataRows.slice(0, 10));
            } catch (err) {
                setFileError("Failed to read the Excel file.");
            }
        };

        reader.readAsArrayBuffer(selectedFile);
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!selectedCenter || !file) return;

        setUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append("uploadCenter", selectedCenter.value);
            formData.append("attachment", file);

            const response = await uploadMonthlyAttendance(formData);

            setUploadResult({
                success: response?.success ?? true,
                attempted: response?.attempted ?? 0,
                upserted: response?.upserted ?? 0,
                matched: response?.matched ?? 0,
                modified: response?.modified ?? 0,
                errors: response?.errors ?? [],
            });

            if (response?.success) {
                toast.success("Attendance uploaded successfully!");
            } else {
                toast.warn("Upload completed with issues.");
            }
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(
                    error?.message || "Something went wrong while uploading"
                );
                setUploadResult({
                    success: false,
                    message: error?.message || "Upload failed",
                    errors: error?.writeErrors || error?.errors || [],
                });
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            toggle={handleClose}
            size="xl"
            backdrop="static"
            keyboard={false}
        >
            <ModalHeader toggle={!uploading ? handleClose : undefined}>
                Import Monthly Attendance
            </ModalHeader>

            <ModalBody>
                {/* Upload Result */}
                {uploadResult && (
                    <Alert
                        color={uploadResult.success ? "success" : "danger"}
                        className="mb-3"
                    >
                        <h6 className="alert-heading fw-bold">
                            {uploadResult.success
                                ? "Upload Successful"
                                : "Upload Failed"}
                        </h6>
                        {uploadResult.success ? (
                            <div className="d-flex flex-wrap gap-3 mt-2">
                                <div>
                                    <strong>Attempted:</strong>{" "}
                                    {uploadResult.attempted}
                                </div>
                                <div>
                                    <strong>Upserted:</strong>{" "}
                                    {uploadResult.upserted}
                                </div>
                                <div>
                                    <strong>Matched:</strong>{" "}
                                    {uploadResult.matched}
                                </div>
                                <div>
                                    <strong>Modified:</strong>{" "}
                                    {uploadResult.modified}
                                </div>
                            </div>
                        ) : (
                            <p className="mb-0">
                                {uploadResult.message || "Something went wrong"}
                            </p>
                        )}

                        {uploadResult.errors?.length > 0 && (
                            <div className="mt-2">
                                <strong className="text-danger">
                                    Errors ({uploadResult.errors.length}):
                                </strong>
                                <ul
                                    className="mb-0 mt-1"
                                    style={{
                                        maxHeight: 150,
                                        overflowY: "auto",
                                    }}
                                >
                                    {uploadResult.errors
                                        .slice(0, 10)
                                        .map((err, i) => (
                                            <li key={i}>
                                                {typeof err === "string"
                                                    ? err
                                                    : err?.message ||
                                                      JSON.stringify(err)}
                                            </li>
                                        ))}
                                    {uploadResult.errors.length > 10 && (
                                        <li className="text-muted">
                                            ...and{" "}
                                            {uploadResult.errors.length - 10}{" "}
                                            more
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </Alert>
                )}


                {!uploadResult?.success && (
                    <Form>
                        {/* Center Selection */}
                        <FormGroup>
                            <Label className="fw-semibold">
                                Select Center{" "}
                                <span className="text-danger">*</span>
                            </Label>
                            <Select
                                value={selectedCenter}
                                onChange={(opt) => setSelectedCenter(opt)}
                                options={centerOptions}
                                classNamePrefix="react-select"
                                placeholder="Select center..."
                                isDisabled={uploading}
                            />
                        </FormGroup>

                        {/* File Input */}
                        <FormGroup>
                            <Label className="fw-semibold">
                                Upload File{" "}
                                <span className="text-danger">*</span>
                            </Label>
                            <Input
                                type="file"
                                accept=".xlsx,.xls"
                                disabled={uploading}
                                onChange={(e) => {
                                    const f = e.currentTarget.files[0];
                                    handleFileChange(f);
                                }}
                                invalid={!!fileError}
                            />
                            <FormFeedback>{fileError}</FormFeedback>
                        </FormGroup>

                        {/* File Error (shown outside FormFeedback too for visibility) */}
                        {fileError && (
                            <div className="text-danger mb-2">{fileError}</div>
                        )}

                        {/* Preview */}
                        {previewRows.length > 0 && !fileError && (
                            <div className="mt-3">
                                <h6 className="fw-semibold">
                                    Preview (First 10 Rows)
                                </h6>
                                <div
                                    className="table-responsive"
                                    style={{ maxHeight: 300, overflowY: "auto" }}
                                >
                                    <Table bordered size="sm" className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                {previewHeaders.map(
                                                    (header, i) => (
                                                        <th
                                                            key={i}
                                                            style={{
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            {header}
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewRows.map((row, r) => (
                                                <tr key={r}>
                                                    {previewHeaders.map(
                                                        (_, c) => (
                                                            <td
                                                                key={c}
                                                                style={{
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {row[c] ?? ""}
                                                            </td>
                                                        )
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                                <small className="text-muted">
                                    Showing {previewRows.length} of total rows
                                </small>
                            </div>
                        )}
                    </Form>
                )}
            </ModalBody>

            <ModalFooter>
                <Button
                    color="light"
                    onClick={handleClose}
                    disabled={uploading}
                >
                    {uploadResult?.success ? "Close" : "Cancel"}
                </Button>

                {!uploadResult?.success && (
                    <Button
                        color="primary"
                        className="text-white"
                        onClick={handleUpload}
                        disabled={
                            uploading ||
                            !selectedCenter ||
                            !file ||
                            !!fileError
                        }
                    >
                        {uploading ? (
                            <>
                                <Spinner size="sm" className="me-1" />
                                Uploading...
                            </>
                        ) : (
                            "Upload"
                        )}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
};

MonthlyAttendanceUploadModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onRefresh: PropTypes.func,
};

export default MonthlyAttendanceUploadModal;
