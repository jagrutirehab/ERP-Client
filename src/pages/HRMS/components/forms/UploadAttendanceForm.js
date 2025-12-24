import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    FormFeedback,
    Table,
} from "reactstrap";
import { useSelector } from "react-redux";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { uploadAttendance } from "../../../../helpers/backend_helper";
import * as XLSX from "xlsx";
import { useState } from "react";

const REQUIRED_HEADERS = [
    "Employee ID",
    "First Name",
    "Department",
    "Date",
    "Weekday",
    "First Check In",
    "Last Check Out",
    "Total Time",
];

const normalize = (v) =>
    String(v || "").trim().toLowerCase();


const findHeaderRowIndex = (rows) => {
    return rows.findIndex((row) => {
        const normalizedRow = row.map(normalize);
        return REQUIRED_HEADERS.every((h) =>
            normalizedRow.includes(normalize(h))
        );
    });
};

const extractGeneratedOn = (rows) => {
    for (const row of rows) {
        for (const cell of row) {
            if (
                typeof cell === "string" &&
                cell.toLowerCase().includes("generated on")
            ) {
                return cell.split("Generated On :")[1]?.trim() || null;
            }
        }
    }
    return null;
};


const validationSchema = Yup.object({
    center: Yup.object().required("Center is required").nullable(),
    attachment: Yup.mixed().required("File is required"),
});


const UploadAttendanceForm = ({ onSuccess, onCancel }) => {
    const handleAuthError = useAuthError();
    const { centerAccess, userCenters } = useSelector((state) => state.User);

    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [previewRows, setPreviewRows] = useState([]);
    const [headerError, setHeaderError] = useState("");
    const [generatedOn, setGeneratedOn] = useState(null);

    const centerOptions =
        centerAccess?.map((id) => {
            const center = userCenters?.find((c) => c._id === id);
            return {
                value: id,
                label: center?.title || "Unknown Center",
            };
        }) || [];

    const handleFileChange = (file) => {
        if (!file) return;

        setHeaderError("");
        setPreviewHeaders([]);
        setPreviewRows([]);
        setGeneratedOn(null);

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

                const generated = extractGeneratedOn(rows);
                setGeneratedOn(generated);

                const headerIndex = findHeaderRowIndex(rows);
                if (headerIndex === -1) {
                    setHeaderError(
                        "Invalid attendance report format. Please upload the correct report."
                    );
                    return;
                }

                setPreviewHeaders(rows[headerIndex]);
                setPreviewRows(rows.slice(headerIndex + 1, headerIndex + 11));
            } catch (err) {
                setHeaderError("Failed to read Excel file");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const formik = useFormik({
        initialValues: {
            center: null,
            attachment: null,
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const formData = new FormData();
                formData.append("center", values.center.value);
                formData.append("attachment", values.attachment);

                const response = await uploadAttendance(formData);
                onSuccess?.({
                    importId: response?.importId,
                    centerId: values.center.value,
                    centerName: values.center.label,
                });
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error("Something went wrong while uploading the XLSX");
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Form onSubmit={formik.handleSubmit}>
            {/* Center */}
            <FormGroup>
                <Label htmlFor="center">
                    Center <span className="text-danger">*</span>
                </Label>
                <Select
                    name="center"
                    id="center"
                    options={centerOptions}
                    value={formik.values.center}
                    onChange={(option) =>
                        formik.setFieldValue("center", option)
                    }
                    onBlur={() =>
                        formik.setFieldTouched("center", true)
                    }
                />
                {formik.touched.center && formik.errors.center && (
                    <div className="text-danger mt-1">
                        {formik.errors.center}
                    </div>
                )}
            </FormGroup>

            {/* File */}
            <FormGroup>
                <Label htmlFor="attachment">
                    Upload File <span className="text-danger">*</span>
                </Label>
                <Input
                    type="file"
                    id="attachment"
                    name="attachment"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                        const file = e.currentTarget.files[0];
                        formik.setFieldValue("attachment", file);
                        handleFileChange(file);
                    }}
                    onBlur={() =>
                        formik.setFieldTouched("attachment", true)
                    }
                    invalid={formik.touched.attachment && !!formik.errors.attachment}
                />
                <FormFeedback>{formik.errors.attachment}</FormFeedback>
            </FormGroup>

            {/* Errors */}
            {headerError && (
                <div className="text-danger mt-2">
                    {headerError}
                </div>
            )}

            {/* Generated On */}
            {generatedOn && (
                <div className="text-muted mt-2">
                    <strong>Generated On:</strong> {generatedOn}
                </div>
            )}

            {/* Preview */}
            {previewRows.length > 0 && !headerError && (
                <div className="mt-4">
                    <h6>Preview (First 10 Rows)</h6>
                    <div
                        className="table-responsive"
                        style={{ maxHeight: 300 }}
                    >
                        <Table bordered size="sm">
                            <thead>
                                <tr>
                                    {previewHeaders.map((h, i) => (
                                        <th key={i}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewRows.map((row, r) => (
                                    <tr key={r}>
                                        {previewHeaders.map((_, c) => (
                                            <td key={c}>
                                                {row[c] ?? ""}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-3">
                <Button onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    color="primary"
                    className="text-white"
                    disabled={
                        formik.isSubmitting ||
                        !formik.isValid ||
                        !formik.values.attachment ||
                        !formik.values.center ||
                        !!headerError
                    }
                >
                    Upload
                </Button>
            </div>
        </Form>
    );
};

export default UploadAttendanceForm;
