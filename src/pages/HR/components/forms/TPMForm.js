import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useFormik } from "formik";
import { TPMOptions } from "../../../../Components/constants/HR";
import { fetchDesignations } from "../../../../store/features/HR/hrSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Form, FormGroup, Input, Label, Spinner } from "reactstrap";
import Select from "react-select";
import { editTPM, postTPM } from "../../../../helpers/backend_helper";
import { format } from "date-fns";

const objectIdRegex = /^[0-9a-fA-F]{24}$/

const validationSchema = Yup.object().shape({
    center: Yup.string()
        .required("Center is required")
        .matches(objectIdRegex, "Invalid center"),
    employeeName: Yup.string()
        .trim()
        .required("Employee name is required"),
    designation: Yup.string()
        .required("Designation is required")
        .matches(objectIdRegex, "Invalid designation"),
    vendor: Yup.string()
        .trim()
        .required("Vendor is required"),
    startDate: Yup.date()
        .required("Start date is required"),
    contractSignedWithVendor: Yup.boolean()
        .required("Contract signed with vendor is required"),
    manpowerApprovedByManagement: Yup.boolean()
        .required("Manpower approved by management is required"),
});

const TPMForm = ({ initialData, onSuccess, view, onCancel, hasCreatePermission }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const { designations: designationOptions, designationLoading } = useSelector((state) => state.HR);
    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const isEdit = !!initialData?._id;

    const centerOptions =
        userCenters
            ?.filter(center => centerAccess?.includes(center._id))
            .map(center => ({
                value: center._id,
                label: center.title,
            })) || [];

    useEffect(() => {
        const loadDesignations = async () => {
            try {
                dispatch(fetchDesignations({
                    status: "APPROVED",
                    only: TPMOptions
                })).unwrap();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error("Something went wrong while getting the designations");
                }
            }
        };

        loadDesignations();
    }, []);

    const form = useFormik({
        enableReinitialize: true,
        validateOnMount: true,
        initialValues: {
            center: initialData?.center?._id || "",
            employeeName: initialData?.employeeName || "",
            designation: initialData?.designation?._id || "",
            vendor: initialData?.vendor || "",
            startDate: initialData?.startDate
                ? format(new Date(initialData?.startDate), "yyyy-MM-dd")
                : "",
            contractSignedWithVendor: initialData?.contractSignedWithVendor || false,
            manpowerApprovedByManagement: initialData?.manpowerApprovedByManagement || false,
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                if (isEdit) {
                    await editTPM(initialData?._id, values);
                    toast.success("Request updated successfully");
                } else {
                    await postTPM(values);
                    toast.success("Request submitted successfully");
                }

                if (view === "PAGE") {
                    form.resetForm();
                } else {
                    onSuccess?.();
                }
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to submit the request");
                }
            } finally {
                setSubmitting(false);
            }
        }
    })
    return (
        <Form onSubmit={form.handleSubmit}>

            {/* CENTER */}
            <FormGroup>
                <Label htmlFor="designation">Center <span className="text-danger">*</span></Label>
                <Select
                    inputId="center"
                    options={centerOptions}
                    value={form.values.center ? centerOptions.find(
                        opt => opt.value === form.values.center
                    ) : null}
                    onChange={(option) => {
                        form.setFieldValue(
                            "center",
                            option ? option.value : ""
                        );
                    }}
                    onBlur={() =>
                        form.setFieldTouched("center", true)
                    }
                    placeholder="Select Center"
                    classNamePrefix="react-select"
                    isClearable
                />

                {form.touched.center &&
                    form.errors.center && (
                        <div className="text-danger mt-1 small">
                            {form.errors.center}
                        </div>
                    )}
            </FormGroup>

            {/* EMPLOYEE NAME */}
            <FormGroup>
                <Label htmlFor="employee">Employee Name <span className="text-danger">*</span></Label>
                <Input
                    type="text"
                    id="employee"
                    name="employeeName"
                    value={form.values.employee}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                />
                {form.touched.employee &&
                    form.errors.employee && (
                        <div className="text-danger mt-1 small">
                            {form.errors.employee}
                        </div>
                    )}
            </FormGroup>

            {/* DESIGNATION */}
            <FormGroup>
                <Label htmlFor="designation">Designation <span className="text-danger">*</span></Label>
                <Select
                    inputId="designation"
                    placeholder="Select Employee Designation"
                    isClearable
                    options={designationOptions}
                    isDisabled={designationLoading}
                    isLoading={designationLoading}
                    value={
                        designationOptions.find(
                            opt => opt.value === form.values.designation
                        ) || null
                    }
                    onChange={(option) =>
                        form.setFieldValue("designation", option ? option.value : "")
                    }
                    onBlur={() => form.setFieldTouched("designation", true)}
                />

                {form.touched.designation && form.errors.designation && (
                    <div className="text-danger small mt-1">
                        {form.errors.designation}
                    </div>
                )}
            </FormGroup>

            {/* VENDOR */}
            <FormGroup>
                <Label htmlFor="vendor">Vendor<span className="text-danger">*</span></Label>
                <Input
                    type="text"
                    id="vendor"
                    name="vendor"
                    value={form.values.vendor}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                />
                {form.touched.vendor &&
                    form.errors.vendor && (
                        <div className="text-danger mt-1 small">
                            {form.errors.vendor}
                        </div>
                    )}
            </FormGroup>

            {/* START DATE */}
            <FormGroup>
                <Label htmlFor="startDate">
                    Start Date <span className="text-danger">*</span>
                </Label>
                <Input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={form.values.startDate}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                />
                {form.touched.startDate && form.errors.startDate && (
                    <div className="text-danger small mt-1">
                        {form.errors.startDate}
                    </div>
                )}
            </FormGroup>

            {/* CONTRACT SIGNED */}
            <FormGroup>
                <Label>
                    Contract Signed with Vendor <span className="text-danger">*</span>
                </Label>

                <div className="d-flex gap-4 mt-2">
                    <FormGroup check>
                        <Input
                            type="radio"
                            id="contractSignedYes"
                            name="contractSignedWithVendor"
                            checked={form.values.contractSignedWithVendor === true}
                            onChange={() =>
                                form.setFieldValue("contractSignedWithVendor", true)
                            }
                        />
                        <Label for="contractSignedYes" check>
                            Yes
                        </Label>
                    </FormGroup>
                    <FormGroup check>
                        <Input
                            type="radio"
                            id="contractSignedNo"
                            name="contractSignedWithVendor"
                            checked={form.values.contractSignedWithVendor === false}
                            onChange={() =>
                                form.setFieldValue("contractSignedWithVendor", false)
                            }
                        />
                        <Label for="contractSignedNo" check>
                            No
                        </Label>
                    </FormGroup>
                </div>

                {form.touched.contractSignedWithVendor &&
                    form.errors.contractSignedWithVendor && (
                        <div className="text-danger small mt-1">
                            {form.errors.contractSignedWithVendor}
                        </div>
                    )}
            </FormGroup>

            {/* MANPOWER APPROVED */}
            <FormGroup>
                <Label>
                    Is the Manpower approved by Management <span className="text-danger">*</span>
                </Label>

                <div className="d-flex gap-4 mt-2">
                    <FormGroup check>
                        <Input
                            type="radio"
                            id="manpowerApprovedYes"
                            name="manpowerApprovedByManagement"
                            checked={form.values.manpowerApprovedByManagement === true}
                            onChange={() =>
                                form.setFieldValue("manpowerApprovedByManagement", true)
                            }
                        />
                        <Label for="manpowerApprovedYes" check>
                            Yes
                        </Label>
                    </FormGroup>
                    <FormGroup check>
                        <Input
                            type="radio"
                            id="manpowerApprovedNo"
                            name="manpowerApprovedByManagement"
                            checked={form.values.manpowerApprovedByManagement === false}
                            onChange={() =>
                                form.setFieldValue("manpowerApprovedByManagement", false)
                            }
                        />
                        <Label for="manpowerApprovedNo" check>
                            No
                        </Label>
                    </FormGroup>
                </div>

                {form.touched.manpowerApprovedByManagement &&
                    form.errors.manpowerApprovedByManagement && (
                        <div className="text-danger small mt-1">
                            {form.errors.manpowerApprovedByManagement}
                        </div>
                    )}
            </FormGroup>


            <div className="d-flex justify-content-end gap-2">
                {view === "MODAL" && <Button type="button" color="secondary" onClick={onCancel} disabled={form.isSubmitting}>
                    Cancel
                </Button>}

                {(view !== "PAGE" || hasCreatePermission) && (
                    <Button
                        type="submit"
                        className="text-white"
                        color="primary"
                        disabled={form.isSubmitting ||
                            !form.isValid ||
                            !form.dirty}
                    >
                        {form.isSubmitting && <Spinner size="sm" className="me-2" />}
                        {isEdit ? "Update Request" : "Add Request"}
                    </Button>
                )}
            </div>
        </Form>
    )
}

TPMForm.propTypes = {
    initialData: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    view: PropTypes.oneOf(["MODAL", "PAGE"]),
    hasCreatePermission: PropTypes.bool
};

export default TPMForm;