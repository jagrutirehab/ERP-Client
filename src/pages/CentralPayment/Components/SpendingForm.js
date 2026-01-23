import { format } from 'date-fns';
import { useFormik } from 'formik';
import { useState } from 'react'
import { connect, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import * as Yup from "yup";
import {
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Spinner,
} from "reactstrap";
import { useAuthError } from '../../../Components/Hooks/useAuthError';
import { addPayment, updateCentralPayment } from '../../../store/features/centralPayment/centralPaymentSlice';
import FileUpload from './FileUpload';
import { FileText, Share } from 'lucide-react';
import { categoryOptions } from '../../../Components/constants/centralPayment';
import Select from "react-select";
import { getExitEmployeesBySearch } from '../../../store/features/HR/hrSlice';
import AsyncSelect from "react-select/async";


const clearableFields = [
    "invoiceNo",
    "IFSCCode",
    "accountHolderName",
    "accountNo",
];

const SpendingForm = ({ centerAccess, centers, paymentData, onUpdate }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();

    const centerOptions = centers
        ?.filter((c) => centerAccess.includes(c._id))
        .map((c) => ({
            _id: c._id,
            title: c.title,
        }));

    const [existingFiles, setExistingFiles] = useState(paymentData?.attachments || []);
    const [removedAttachments, setRemovedAttachments] = useState([]);

    const validationSchema = Yup.object({
        name: Yup.string().required("Name is required"),
        center: Yup.string().required("Center is required"),
        items: Yup.string().required("Items are required"),
        category: Yup.string()
            .oneOf(categoryOptions.map((option) => option.value), "Invalid item category")
            .required("Item category is required"),
        otherCategory: Yup.string().when("category", {
            is: "OTHERS",
            then: (schema) =>
                schema.required("Please specify the other category details"),
            otherwise: (schema) => schema.notRequired(),
        }),
        employeeId: Yup.mixed().when("category", {
            is: "SALARY_ADVANCE",
            then: schema => schema.required("Please select an employee"),
            otherwise: schema => schema.notRequired(),
        }),
        date: Yup.string().required("Transaction date is required"),
        description: Yup.string()
            .max(20, "Description cannot be more than 20 characters")
            .required("Description is required"),
        vendor: Yup.string().required("Vendor is required"),
        invoiceNo: Yup.string().nullable(),
        totalAmountWithGST: Yup.number()
            .typeError("Total amount must be a number")
            .required("Total amount with GST is required")
            .moreThan(0, "Total amount with GST must be greater than 0")
            .test(
                "max-two-decimals",
                "Total amount can have at most 2 decimal places",
                (value) => {
                    if (value === undefined || value === null) return true;
                    return Math.round(value * 100) === value * 100;
                }
            ),
        GSTAmount: Yup.number()
            .typeError("GST amount must be a number")
            .required("GST amount is required")
            .test(
                "max-two-decimals",
                "GST amount can have at most 2 decimal places",
                (value) => {
                    if (value === undefined || value === null) return true;
                    return Math.round(value * 100) === value * 100;
                }
            ),
        IFSCCode: Yup.string()
            .nullable()
            .trim()
            .matches(/^\S{11}$/, "IFSC Code must be exactly 11 characters"),
        accountHolderName: Yup.string().nullable(),
        accountNo: Yup.string()
            .nullable()
            .max(25, "Account number cannot be more than 25 characters"),
        TDSRate: Yup.number()
            .typeError("TDS Rate must be a number")
            .nullable()
            .min(0, "TDS Rate cannot be negative")
            .max(30, "TDS Rate cannot be greater than 30%"),
        initialPaymentStatus: Yup.string()
            .oneOf(["PENDING", "COMPLETED"], "Invalid payment status")
            .required("Payment status is required"),
        attachmentType: Yup.string().oneOf(["INVOICE/BILL", "QUOTATION", "PROFORMA_INVOICE", "VOUCHER"], "Invalid attachment type").required("Attachment type is required"),
        attachments: Yup.array().when([], {
            is: () => !paymentData?._id,
            then: (schema) =>
                schema
                    .test("fileSize", "Each file must be under 100MB", (files) => {
                        if (!files || files.length === 0) return true;
                        return files.every((f) => f.size <= 100 * 1024 * 1024);
                    })
                    .test("fileCount", "Upload at least one file", (files) => {
                        return files && files.length > 0;
                    }),
            otherwise: (schema) =>
                schema.test("fileSize", "Each file must be under 100MB", (files) => {
                    if (!files || files.length === 0) return true;
                    return files.every((f) => f.size <= 100 * 1024 * 1024);
                }),
        }),

    });


    const form = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: paymentData?.name || "",
            center: paymentData?.center?._id || "",
            items: paymentData?.items || "",
            category: paymentData?.category || "",
            otherCategory: paymentData?.otherCategory || "",
            employeeId: paymentData?.employee
                ? {
                    value: paymentData.employee._id,
                    label: `${paymentData.employee.name} (${paymentData.employee.eCode})`,
                }
                : null,
            date: paymentData?.date ? format(new Date(paymentData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            description: paymentData?.description || "",
            vendor: paymentData?.vendor || "",
            invoiceNo: paymentData?.invoiceNo || "",
            totalAmountWithGST: paymentData?.totalAmountWithGST || 0,
            GSTAmount: paymentData?.GSTAmount || 0,
            IFSCCode: paymentData?.bankDetails?.IFSCCode || "",
            accountHolderName: paymentData?.bankDetails?.accountHolderName || "",
            accountNo: paymentData?.bankDetails?.accountNo || "",
            initialPaymentStatus: paymentData?.initialPaymentStatus || "",
            TDSRate: paymentData?.TDSRate || "",
            attachmentType: paymentData?.attachmentType || "",
            attachments: []
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            const remainingExistingAttachments = existingFiles.length;
            const newUploads = values.attachments.length;

            const finalCount = remainingExistingAttachments + newUploads;

            if (paymentData?._id && finalCount === 0) {
                toast.error("You must have at least one attachment");
                return;
            }

            const formData = new FormData();

            Object.entries(values).forEach(([key, val]) => {
                if (key === "attachments") return;

                if (key === "date") {
                    const now = new Date();
                    const spendingDate = new Date(val);
                    spendingDate.setHours(
                        now.getHours(),
                        now.getMinutes(),
                        now.getSeconds()
                    );
                    formData.append(key, spendingDate.toISOString());
                    return;
                }

                if (clearableFields.includes(key)) {
                    if (val !== undefined && val !== null) {
                        formData.append(key, val);
                    }
                    return;
                }

                if (key === "TDSRate") {
                    formData.append("TDSRate", val === "" ? 0 : val);
                    return;
                }

                if (key === "employeeId") {
                    if (val?.value) formData.append("employeeId", val.value);
                    return;
                }

                if (val !== undefined && val !== null && val !== "") {
                    formData.append(key, val);
                }
            });

            values.attachments.forEach(f => formData.append("attachments", f));
            if (paymentData?._id && removedAttachments.length > 0) {
                formData.append("removedAttachments", JSON.stringify(removedAttachments));
            }

            try {
                if (paymentData?._id) {
                    const response = await dispatch(updateCentralPayment({ id: paymentData?._id, formData: formData, centers: centerAccess })).unwrap();
                    if (response && onUpdate) onUpdate();
                    toast.success("Spending request updated successfully");
                } else {
                    await dispatch(addPayment({ formData, centers: centerAccess })).unwrap();
                    toast.success("Spending request submitted successfully");
                }
                resetForm();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error.message || "Failed to submit spending request");
                }
            }
        },
    });

    const handleSubmit = (e) => {
        form.handleSubmit(e);
    };

    // transform every text input in uppercase & comma not allowed validation & no space allowd for IFSCCode, accountNo
    const normalizeTextInput = (e) => {
        const { name, value } = e.target;

        if (value.includes(",")) {
            form.setFieldTouched(name, true, false);
            form.setFieldError(name, "Comma (,) is not allowed");
            return;
        }

        // special charracter not allowed in description
        if (name === "description") {
            const valid = /^[a-zA-Z0-9 ]*$/.test(value);
            if (!valid) {
                form.setFieldTouched(name, true, false);
                form.setFieldError(name, "No special characters allowed");
                return;
            }
        }

        let newValue = value;
        if (["IFSCCode", "accountNo"].includes(name)) {
            newValue = value.replace(/\s+/g, "");
        }

        form.setFieldValue(name, newValue.toUpperCase(), true);
    };

    const loadEmployees = async (inputValue) => {
        if (!inputValue) return [];

        try {
            const res = await dispatch(
                getExitEmployeesBySearch({
                    query: inputValue,
                    centers: centerAccess,
                    view: "SALARY_ADVANCE",
                })
            ).unwrap();
            return (res?.data || []).map(emp => ({
                value: emp._id,
                label: `${emp.name} (${emp.eCode})`,
            }));
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Failed to search employees");
            }
            return [];
        }
    };


    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label for="name" className="fw-medium">
                    Name <span className="text-danger">*</span>
                </Label>
                <Input
                    type="text"
                    id="name"
                    name="name"
                    value={form.values.name}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.name && form.errors.name
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.name && form.errors.name && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.name}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="center" className="fw-medium">
                    Center <span className="text-danger">*</span>
                </Label>
                <Input
                    type="select"
                    id="center"
                    name="center"
                    value={form.values.center}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={`form-select ${form.touched.center && form.errors.center
                        ? "is-invalid"
                        : ""
                        }`}
                >
                    <option value="" disabled>
                        Select a Center
                    </option>
                    {centerOptions.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.title}
                        </option>
                    ))}
                </Input>
                {form.touched.center && form.errors.center && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.center}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="items" className="fw-medium">
                    Items <span className="text-danger">*</span>
                </Label>
                <Input
                    type="text"
                    id="items"
                    name="items"
                    value={form.values.items}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.items && form.errors.items
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.items && form.errors.items && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.items}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="category" className="fw-medium">
                    Item Category <span className="text-danger">*</span>
                </Label>
                <Select
                    inputId="category"
                    name="category"
                    options={categoryOptions}
                    value={categoryOptions.find(
                        (opt) => opt.value === form.values.category
                    )}
                    onChange={(option) => {
                        const value = option?.value || "";
                        form.setFieldValue("category", value, true);

                        if (value !== "OTHERS") {
                            form.setFieldValue("otherCategory", "");
                            form.setFieldTouched("otherCategory", false, false);
                        }

                        if (value !== "SALARY_ADVANCE") {
                            form.setFieldValue("employeeId", null);
                            form.setFieldTouched("employeeId", false, false);
                        }
                        form.validateForm();
                    }}
                    onBlur={() => form.setFieldTouched("category", true)}
                    placeholder="Select item category"
                    classNamePrefix="react-select"
                    className={
                        form.touched.category && form.errors.category
                            ? "react-select is-invalid"
                            : "react-select"
                    }
                />
                {form.touched.category && form.errors.category && (
                    <div className="invalid-feedback d-block">
                        {form.errors.category}
                    </div>
                )}
            </FormGroup>
            {form.values.category === "SALARY_ADVANCE" && (
                <FormGroup className="mb-3">
                    <Label className="fw-medium">
                        Select Employee <span className="text-danger">*</span>
                    </Label>

                    <AsyncSelect
                        cacheOptions
                        defaultOptions={false}
                        loadOptions={loadEmployees}
                        placeholder="Search by name or eCode"
                        value={form.values.employeeId}
                        onChange={(option) => {
                            form.setFieldValue("employeeId", option);
                        }}
                        onBlur={() => form.setFieldTouched("employeeId", true)}
                        classNamePrefix="react-select"
                        className={
                            form.touched.employeeId && form.errors.employeeId
                                ? "react-select is-invalid"
                                : "react-select"
                        }
                        noOptionsMessage={({ inputValue }) =>
                            inputValue
                                ? "No employee found"
                                : "Start typing to search employee"
                        }
                    />

                    {form.touched.employeeId && form.errors.employeeId && (
                        <div className="invalid-feedback d-block">
                            {form.errors.employeeId}
                        </div>
                    )}
                </FormGroup>
            )}

            {form.values.category === "OTHERS" && (
                <FormGroup className="mt-2">
                    <Label for="otherCategory" className="fw-medium">
                        Specify Other Category Details<span className="text-danger">*</span>
                    </Label>
                    <Input
                        type="text"
                        id="otherCategory"
                        name="otherCategory"
                        value={form.values.otherCategory}
                        onChange={(e) => normalizeTextInput(e)}
                        onBlur={form.handleBlur}
                        className={`form-control ${form.touched.otherCategory && form.errors.otherCategory
                            ? "is-invalid"
                            : ""
                            }`}
                        placeholder="Enter Other category details"
                    />
                    {form.touched.otherCategory && form.errors.otherCategory && (
                        <div className="invalid-feedback d-block">
                            {form.errors.otherCategory}
                        </div>
                    )}
                </FormGroup>
            )}

            <FormGroup className="mb-4">
                <Label for="date" className="fw-medium text-muted">
                    Date <span className="text-danger">*</span>
                </Label>
                <Input
                    type="date"
                    id="date"
                    name="date"
                    value={form.values.date}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.date && form.errors.date
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.date && form.errors.date && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.date}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="description" className="fw-medium">
                    Description <span className="text-danger">*</span>
                    <span className="ms-1 text-muted fs-12">
                        (Max 20 characters, no special characters)
                    </span>
                </Label>
                <Input
                    type="textarea"
                    id="description"
                    name="description"
                    rows="3"
                    value={form.values.description}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.description && form.errors.description
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.description && form.errors.description && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.description}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="vendor" className="fw-medium">
                    Vendor <span className="text-danger">*</span>
                </Label>
                <Input
                    type="text"
                    id="vendor"
                    name="vendor"
                    value={form.values.vendor}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.vendor && form.errors.vendor
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.vendor && form.errors.vendor && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.vendor}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="invoiceNo" className="fw-medium">
                    Invoice No
                </Label>
                <Input
                    type="text"
                    id="invoiceNo"
                    name="invoiceNo"
                    value={form.values.invoiceNo}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.invoiceNo && form.errors.invoiceNo
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.invoiceNo && form.errors.invoiceNo && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.invoiceNo}
                    </div>
                )}
            </FormGroup>

            <FormGroup>
                <Label for="totalAmountWithGST" className="fw-medium">
                    Total Amount including GST <span className="text-danger">*</span>
                </Label>
                <Input
                    type="text"
                    id="totalAmountWithGST"
                    name="totalAmountWithGST"
                    value={form.values.totalAmountWithGST}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    placeholder="0.00"
                    className={`form-control ${form.touched.totalAmountWithGST && form.errors.totalAmountWithGST
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.totalAmountWithGST && form.errors.totalAmountWithGST && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.totalAmountWithGST}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="GSTAmount" className="fw-medium">
                    GST Amount (Mention amount from the bill, dont mention the %) <span className="text-danger">*</span>
                </Label>
                <Input
                    type="text"
                    id="GSTAmount"
                    name="GSTAmount"
                    value={form.values.GSTAmount}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    placeholder="0.00"
                    className={`form-control ${form.touched.GSTAmount && form.errors.GSTAmount
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.GSTAmount && form.errors.GSTAmount && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.GSTAmount}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="IFSCCode" className="fw-medium">
                    Bank IFSC Code
                </Label>
                <Input
                    type="text"
                    id="IFSCCode"
                    name="IFSCCode"
                    value={form.values.IFSCCode}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.IFSCCode && form.errors.IFSCCode
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.IFSCCode && form.errors.IFSCCode && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.IFSCCode}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="accountHolderName" className="fw-medium">
                    Account Holder Name
                </Label>
                <Input
                    type="text"
                    id="accountHolderName"
                    name="accountHolderName"
                    value={form.values.accountHolderName}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.accountHolderName && form.errors.accountHolderName
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.accountHolderName && form.errors.accountHolderName && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.accountHolderName}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="accountNo" className="fw-medium">
                    Account No
                </Label>
                <Input
                    type="text"
                    id="accountNo"
                    name="accountNo"
                    value={form.values.accountNo}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.accountNo && form.errors.accountNo
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.accountNo && form.errors.accountNo && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.accountNo}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label for="TDSRate" className="fw-medium">
                    Rate of TDS (%) (Just write the no. Eg. in case of 10% TDS, mention 10 and not 0.1)
                </Label>
                <Input
                    type="text"
                    id="TDSRate"
                    name="TDSRate"
                    value={form.values.TDSRate}
                    onChange={(e) => normalizeTextInput(e)}
                    onBlur={form.handleBlur}
                    className={`form-control ${form.touched.TDSRate && form.errors.TDSRate
                        ? "is-invalid"
                        : ""
                        }`}
                />
                {form.touched.TDSRate && form.errors.TDSRate && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.TDSRate}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label className="fw-medium">Status of the Payment <span className="text-danger">*</span></Label>
                <div>
                    <FormGroup check inline>
                        <Input
                            type="radio"
                            id="paid"
                            name="initialPaymentStatus"
                            value="COMPLETED"
                            checked={form.values.initialPaymentStatus === "COMPLETED"}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                        />
                        <Label for="paid" check>
                            Paid
                        </Label>
                    </FormGroup>

                    <FormGroup check inline>
                        <Input
                            type="radio"
                            id="pending"
                            name="initialPaymentStatus"
                            value="PENDING"
                            checked={form.values.initialPaymentStatus === "PENDING"}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                        />
                        <Label for="pending" check>
                            To be Paid
                        </Label>
                    </FormGroup>
                </div>

                {form.touched.initialPaymentStatus && form.errors.initialPaymentStatus && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.initialPaymentStatus}
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <Label className="fw-medium">
                    You need to upload at least one of the following <span className="text-danger"><span className="text-danger"><span className="text-danger">*</span></span></span>
                </Label>

                <div className="d-flex flex-wrap gap-3 mt-2">
                    <FormGroup check>
                        <Input
                            type="radio"
                            id="invoice-bill"
                            name="attachmentType"
                            value="INVOICE/BILL"
                            checked={form.values.attachmentType === "INVOICE/BILL"}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                        />
                        <Label for="invoice-bill" check>
                            Invoice/Bill
                        </Label>
                    </FormGroup>

                    <FormGroup check>
                        <Input
                            type="radio"
                            id="quotation"
                            name="attachmentType"
                            value="QUOTATION"
                            checked={form.values.attachmentType === "QUOTATION"}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                        />
                        <Label for="quotation" check>
                            Quotation
                        </Label>
                    </FormGroup>

                    <FormGroup check>
                        <Input
                            type="radio"
                            id="performa-invoice"
                            name="attachmentType"
                            value="PROFORMA_INVOICE"
                            checked={form.values.attachmentType === "PROFORMA_INVOICE"}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                        />
                        <Label for="performa-invoice" check>
                            Performa Invoice
                        </Label>
                    </FormGroup>

                    <FormGroup check>
                        <Input
                            type="radio"
                            id="voucher"
                            name="attachmentType"
                            value="VOUCHER"
                            checked={form.values.attachmentType === "VOUCHER"}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                        />
                        <Label for="voucher" check>
                            Voucher
                        </Label>
                    </FormGroup>
                </div>

                {form.touched.attachmentType && form.errors.attachmentType && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.attachmentType}
                    </div>
                )}
            </FormGroup>

            {paymentData?._id && existingFiles.length > 0 && (
                <FormGroup className="mb-3">
                    <Label className="fw-medium">Existing Attachments</Label>

                    <ul className="list-unstyled m-0 p-0">
                        {existingFiles.map((file, index) => (
                            <li key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">

                                <div className="d-flex align-items-center gap-2">
                                    <FileText size={18} className="text-primary" />
                                    <div>
                                        <strong className="me-2">{file.originalName || `Attachment ${index + 1}`}</strong>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-underline">
                                            View File
                                        </a>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    color="danger"
                                    onClick={() => {
                                        setRemovedAttachments(prev => [...prev, file._id]);
                                        setExistingFiles(prev => prev.filter(f => f._id !== file._id));
                                    }}
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}

                    </ul>
                </FormGroup>
            )}

            <FormGroup>
                <Label className="fw-medium">
                    Upload Attachment <span className="text-danger"><span className="text-danger">*</span></span>
                </Label>
                <FileUpload
                    files={form.values.attachments || []}
                    setFiles={(files) => form.setFieldValue("attachments", files)}
                />
                {form.touched.attachments && form.errors.attachments && (
                    <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {form.errors.attachments}
                    </div>
                )}
            </FormGroup>

            <Button
                color="primary"
                type="submit"
                className="w-100 text-white"
                disabled={form.isSubmitting || !form.isValid || !form.dirty}
            >
                {form.isSubmitting ? (
                    <Spinner size="sm" className="me-2" />
                ) : (
                    <>
                        <Share size={16} className="me-2" />
                        Submit for Approval
                    </>
                )}
            </Button>

        </Form>
    )
}

const mapStateToProps = (state) => ({
    centers: state.Center.data,
    centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(SpendingForm);