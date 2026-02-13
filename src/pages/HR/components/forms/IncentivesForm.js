import { useFormik } from "formik";
import { useState, useEffect } from "react";
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
import FileUpload from "../../../CashManagement/Components/FileUpload";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getExitEmployeesBySearch } from "../../../../store/features/HR/hrSlice";
import { editIncentives, postIncentives } from "../../../../helpers/backend_helper";
import { format, parse, set } from "date-fns";

const IncentivesForm = ({ initialData, onSuccess, view, onCancel, hasCreatePermission }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const isEdit = !!initialData?._id;

    const [searchText, setSearchText] = useState("");
    const [showList, setShowList] = useState(false);
    const [searching, setSearching] = useState(false);

    const { employees } = useSelector((state) => state.HR);
    const { centerAccess } = useSelector((state) => state.User);

    const validationSchema = Yup.object().shape({
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
        attachment: isEdit
            ? Yup.mixed().nullable().optional()
            : Yup.mixed()
                .required("Attachment is required")
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
                    view: "INCENTIVES"
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
            name: initialData?.employee?.name || "",
            eCode: initialData?.employee?.eCode || "",
            currentLocation: initialData?.center?.title || "",
            amount: initialData?.amount || "",
            details: initialData?.details || "",
            date: initialData?.date ? format(new Date(initialData.date), "yyyy-MM-dd") : "",
            attachment: null,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (!isEdit && !values.employeeId) {
                    toast.error("Please select an employee");
                    return;
                }

                let incentiveDate;

                if (values.date) {
                    const now = new Date();
                    incentiveDate = set(
                        parse(values.date, "yyyy-MM-dd", new Date()),
                        {
                            hours: now.getHours(),
                            minutes: now.getMinutes(),
                            seconds: now.getSeconds(),
                            milliseconds: 0,
                        }
                    );
                }

                const formData = new FormData();
                if (!isEdit) formData.append("employeeId", values.employeeId);
                formData.append("amount", values.amount);
                formData.append("details", values.details);
                formData.append("date", incentiveDate);
                if (values.attachment) {
                    formData.append("attachment", values.attachment);
                }

                if (isEdit) {
                    await editIncentives(initialData._id, formData);
                    toast.success("Incentives Request updated successfully");
                } else {
                    await postIncentives(formData);
                    toast.success("Incentives Request added successfully");
                }

                if (view === "PAGE") {
                    resetAll();
                } else {
                    onSuccess?.()
                }

            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to save incentives request");
                }
            }
        },
    });

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
            {/* Search Employee */}
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

            {/* NAME */}
            <FormGroup className="mb-3">
                <Label for="name">Name <span className="text-danger">*</span></Label>
                <Input id="name" name="name" value={form.values.name} disabled />
            </FormGroup>

            {/* E-CODE */}
            <FormGroup className="mb-3">
                <Label for="eCode">E-Code <span className="text-danger">*</span></Label>
                <Input id="eCode" name="eCode" value={form.values.eCode} disabled />
            </FormGroup>

            {/* CURRENT LOCATION */}
            <FormGroup className="mb-3">
                <Label for="currentLocation">Current Location <span className="text-danger">*</span></Label>
                <Input
                    id="currentLocation"
                    name="currentLocation"
                    value={form.values.currentLocation}
                    disabled
                />
            </FormGroup>

            {/* DATE */}
            <FormGroup className="mb-3">
                <Label for="date">
                    Date <span className="text-danger">*</span>
                </Label>
                <Input
                    id="date"
                    type="date"
                    name="date"
                    value={form.values.date}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    invalid={form.touched.date && !!form.errors.date}
                />
                {form.touched.date && form.errors.date && (
                    <div className="text-danger small">{form.errors.date}</div>
                )}
            </FormGroup>

            {/* AMOUNT */}
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

            {/* DETAILS */}
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

            {/* ATTACHMENT */}
            <FormGroup className="mb-3">
                <Label>Attachment <span className="text-danger">*</span></Label>
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

IncentivesForm.propTypes = {
    initialData: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    view: PropTypes.oneOf(["MODAL", "PAGE"]),
    hasCreatePermission: PropTypes.bool
};

export default IncentivesForm;
