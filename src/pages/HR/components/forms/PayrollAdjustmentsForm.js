import { useFormik } from "formik";
import { useState, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import {
    Button,
    Input,
    FormGroup,
    Label,
    Spinner
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import PropTypes from "prop-types";
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import FileUpload from "../../../CashManagement/Components/FileUpload";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getExitEmployeesBySearch } from "../../../../store/features/HR/hrSlice";
import { editPayrollAdjustments, postPayrollAdjustments } from "../../../../helpers/backend_helper";
import { adjustmentTypeGroups, adjustmentTypeOptions } from "../../../../Components/constants/payrollAdjustments";
import Select from "react-select";
import { endOfMonth } from "date-fns";

const PayrollAdjustmentsForm = ({ initialData, onSuccess, view, onCancel, hasCreatePermission }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const isEdit = !!initialData?._id;

    const [searchText, setSearchText] = useState("");
    const [showList, setShowList] = useState(false);
    const [searching, setSearching] = useState(false);

    const { employees } = useSelector((state) => state.HR);
    const { centerAccess } = useSelector((state) => state.User);

    const validationSchema = Yup.object().shape({
        type: Yup.string()
            .oneOf(adjustmentTypeOptions.map((option) => option.value), "Select a valid type")
            .required("Type is required"),
        amount: Yup.number()
            .typeError("Amount must be a number")
            .required("Amount is required")
            .min(1, "Amount must be greater than 0"),
        details: Yup.string()
            .trim()
            .required("Details are required"),
        date: Yup.date()
            .typeError("Invalid date")
            .required("Date is required"),
        attachment: Yup.mixed()
                .nullable()
                .optional()
                .test("fileSize", "File size must be less than 10 MB", (value) => {
                    if (!value) return true;
                    return value && value.size <= 10 * 1024 * 1024;
                })
                .test("fileType", "Unsupported file format", (value) => {
                    if (!value) return true;
                    const supportedFormats = [
                        "image/jpeg",
                        "image/jpg",
                        "image/png",
                        "application/pdf",
                    ];
                    return value && supportedFormats.includes(value.type);
                }),
    });

    const searchEmployees = async (text) => {
        setSearching(true);
        try {
            await dispatch(
                getExitEmployeesBySearch({
                    query: text,
                    centers: centerAccess,
                    view: "PAYROLL_ADJUSTMENTS"
                })
            ).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "something went wrong")
            }
        }
        finally {
            setSearching(false);
        }
    };

    const debouncedSearch = debounce(searchEmployees, 400);

    useEffect(() => {
        if (searchText.trim()) {
            debouncedSearch(searchText);
            setShowList(true);
        } else {
            setShowList(false);
        }

        return debouncedSearch.cancel;
    }, [searchText]);

    const resetAll = () => {
        form.resetForm();
        setSearchText("");
        setShowList(false);
    };

    const form = useFormik({
        enableReinitialize: true,
        initialValues: {
            employeeId: "",
            type: initialData?.type || "",
            name: initialData?.employee?.name || "",
            eCode: initialData?.employee?.eCode || "",
            currentLocation: initialData?.center?.title || "",
            amount: initialData?.amount || "",
            details: initialData?.details || "",
            date: initialData?.date ? endOfMonth(new Date(initialData.date)) : "",
            attachment: null,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (!isEdit && !values.employeeId) {
                    toast.error("Please select an employee");
                    return;
                }

                let adjustmentDate;

                if (values.date) {


                    adjustmentDate = endOfMonth(new Date(values.date));
                }

                const formData = new FormData();
                if (!isEdit) formData.append("employeeId", values.employeeId);
                formData.append("type", values.type);
                formData.append("amount", values.amount);
                formData.append("details", values.details);
                formData.append("date", adjustmentDate);
                if (values.attachment) {
                    formData.append("attachment", values.attachment);
                }

                if (isEdit) {
                    await editPayrollAdjustments(initialData._id, formData);
                    toast.success("Payroll adjustment request updated successfully");
                } else {
                    await postPayrollAdjustments(formData);
                    toast.success("Payroll adjustment request added successfully");
                }

                if (view === "PAGE") {
                    resetAll();
                } else {
                    onSuccess?.()
                }

            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to save payroll adjustment request");
                }
            }
        },
    });

    const monthPickerOptions = useMemo(
        () => ({
            plugins: [
                monthSelectPlugin({
                    shorthand: false,
                    dateFormat: "Y-m",
                    altFormat: "F Y",
                }),
            ],
            altInput: true,
            disableMobile: true,
        }),
        []
    );

    const handleAttachmentChange = (file) => {
        form.setFieldValue("attachment", file, true);
        form.setFieldTouched("attachment", true, false);
    };

    const chooseEmployee = (emp) => {
        form.setFieldValue("employeeId", emp._id);
        form.setFieldValue("name", emp.name);
        form.setFieldValue("eCode", emp.eCode);
        form.setFieldValue("currentLocation", emp.currentLocation);
        setShowList(false);
        setSearchText("");
    };

    return (
        <>
            {!isEdit && (
                <FormGroup className="mb-3 position-relative">
                    <Label>Search Employee</Label>
                    <Input
                        type="text"
                        placeholder="Search by name or ECode"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    {form.touched.employeeId && form.errors.employeeId && (
                        <div className="text-danger small">{form.errors.employeeId}</div>
                    )}

                    {showList && (
                        <div
                            className="border rounded bg-white shadow-sm mt-1"
                            style={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                position: "absolute",
                                width: "100%",
                                zIndex: 99,
                            }}
                        >
                            {searching && (
                                <div className="p-2 text-muted">Loading...</div>
                            )}

                            {employees.length === 0 && !searching && (
                                <div className="p-2 text-muted">No employees found</div>
                            )}

                            {employees.map((emp) => (
                                <div
                                    key={emp._id}
                                    className="p-2"
                                    style={{
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                    }}
                                    onClick={() => chooseEmployee(emp)}
                                >
                                    <strong>{emp.name}</strong>
                                    <br />
                                    <span className="text-muted">
                                        ECode: {emp.eCode}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </FormGroup>
            )}

            <FormGroup className="mb-3">
                <Label for="name">Name <span className="text-danger">*</span></Label>
                <Input id="name" name="name" value={form.values.name} disabled />
            </FormGroup>

            <FormGroup className="mb-3">
                <Label for="eCode">E-Code <span className="text-danger">*</span></Label>
                <Input id="eCode" name="eCode" value={form.values.eCode} disabled />
            </FormGroup>

            <FormGroup className="mb-3">
                <Label for="currentLocation">Current Location <span className="text-danger">*</span></Label>
                <Input
                    id="currentLocation"
                    name="currentLocation"
                    value={form.values.currentLocation}
                    disabled
                />
            </FormGroup>

            <FormGroup className="mb-3">
                <Label for="type">Type <span className="text-danger">*</span></Label>
                <Select
                    inputId="type"
                    options={adjustmentTypeGroups}
                    value={adjustmentTypeOptions.find((option) => option.value === form.values.type) || null}
                    onChange={(option) => {
                        form.setFieldValue("type", option?.value || "");
                        form.setFieldTouched("type", true, false);
                    }}
                    placeholder="Select type"
                    classNamePrefix="react-select"
                />
                {form.touched.type && form.errors.type && (
                    <div className="text-danger small">{form.errors.type}</div>
                )}
            </FormGroup>

            <FormGroup className="mb-3">
                <Label for="date">
                    Adjustment for the month of <span className="text-danger">*</span>
                </Label>
                <Flatpickr
                    id="date"
                    name="date"
                    value={form.values.date}
                    options={monthPickerOptions}
                    onChange={([date]) => {
                        form.setFieldValue("date", date ? endOfMonth(date) : "");
                        form.setFieldTouched("date", true, false);
                    }}
                    className={`form-control${form.touched.date && form.errors.date ? " is-invalid" : ""}`}
                    placeholder="Select month"
                />
                {form.touched.date && form.errors.date && (
                    <div className="text-danger small">{form.errors.date}</div>
                )}
            </FormGroup>

            <FormGroup className="mb-3">
                <Label for="amount">Amount <span className="text-danger">*</span></Label>
                <Input
                    id="amount"
                    type="number"
                    name="amount"
                    value={form.values.amount}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    invalid={form.touched.amount && !!form.errors.amount}
                />
                {form.touched.amount && form.errors.amount && (
                    <div className="text-danger small">{form.errors.amount}</div>
                )}
            </FormGroup>

            <FormGroup className="mb-3">
                <Label for="details">Details <span className="text-danger">*</span></Label>
                <Input
                    id="details"
                    name="details"
                    type="textarea"
                    rows={5}
                    value={form.values.details}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    invalid={form.touched.details && !!form.errors.details}
                />
                {form.touched.details && form.errors.details && (
                    <div className="text-danger small">{form.errors.details}</div>
                )}
            </FormGroup>

            <FormGroup className="mb-3">
                <Label>Attachment (optional)</Label>
                <FileUpload
                    attachment={form.values.attachment}
                    setAttachment={handleAttachmentChange}
                    existingFile={
                        initialData?.attachment ?? null
                    }
                />
                {form.touched.attachment && form.errors.attachment && (
                    <div className="text-danger small mt-1">{form.errors.attachment}</div>
                )}
            </FormGroup>

            <div className="d-flex gap-2 justify-content-end">
                {view === "MODAL" && <Button color="secondary" onClick={onCancel} disabled={form.isSubmitting}>
                    Cancel
                </Button>}
                {(view !== "PAGE" || hasCreatePermission) && (
                    <Button
                        color="primary"
                        className="text-white"
                        onClick={form.handleSubmit}
                        disabled={
                            form.isSubmitting ||
                            !form.isValid ||
                            !form.dirty ||
                            (!isEdit && !form.values.employeeId)
                        }
                    >
                        {form.isSubmitting && <Spinner size="sm" className="me-2" />}
                        {isEdit ? "Update Request" : "Add Request"}
                    </Button>
                )}
            </div>
        </>
    );
};

PayrollAdjustmentsForm.propTypes = {
    initialData: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    view: PropTypes.oneOf(["MODAL", "PAGE"]),
    hasCreatePermission: PropTypes.bool
};

export default PayrollAdjustmentsForm;
