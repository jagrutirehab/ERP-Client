import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { Button, Form, FormGroup, Label, Input, Spinner } from "reactstrap";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { addDesignation, fetchDesignations } from "../../../../store/features/HR/hrSlice";
import { HiringPreferredGenderOptions } from "../../../../Components/constants/HR";
import { editHiring, postHiring } from "../../../../helpers/backend_helper";
import PhoneInputWithCountrySelect from "react-phone-number-input";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const validationSchema = Yup.object({
    designation: Yup.string()
        .required("Designation is required")
        .matches(objectIdRegex, "Invalid Designation"),

    center: Yup.string()
        .required("Center is required")
        .matches(objectIdRegex, "Invalid Center"),

    preferredGender: Yup.string()
        .oneOf(["MALE", "FEMALE", "OTHER"], "Preferred Gender must be MALE, FEMALE, or OTHER"),

    requiredCount: Yup.number()
        .typeError("Required count must be a number")
        .integer("Required count must be an integer")
        .min(1, "At least 1 position is required")
        .required("Required count is required"),
});


const HiringForm = ({ initialData, onSuccess, onCancel, view, hasCreatePermission }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const { designations: designationOptions, designationLoading } = useSelector((state) => state.HR);
    const { user, centerAccess, userCenters } = useSelector((state) => state.User);
    const isEdit = !!initialData?._id;

    const [creatingDesignation, setCreatingDesignation] = useState(false);

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
                dispatch(fetchDesignations({ status: ["PENDING", "APPROVED"] })).unwrap();
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
        initialValues: {
            center: initialData?.center?._id || "",
            designation: initialData?.designation?._id || "",
            preferredGender: initialData?.preferredGender || "",
            requiredCount: initialData?.requiredCount || 1,
            contactNumber: initialData?.contactNumber || user?.phoneNumber || "",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = { ...values };

                if (!payload.preferredGender) {
                    delete payload.preferredGender;
                }
                if (isEdit) {
                    await editHiring(initialData?._id, payload);
                    toast.success("Request updated successfully");
                } else {
                    await postHiring(payload);
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
        },
    });


    const handleCreateDesignation = async (inputValue) => {
        if (view === "PAGE" && !hasCreatePermission) {
            toast.error("You don't have permission to create designation");
            return;
        }

        try {
            setCreatingDesignation(true);
            const response = await dispatch(addDesignation({ name: inputValue, status: "PENDING" })).unwrap();
            console.log(response);
            form.setFieldValue("designation", response.data.value);
            form.setFieldTouched("designation", true, false);
            toast.success("designation created successfully");
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error("something went wrong while creating new designation");
            }
        } finally {
            setCreatingDesignation(false);
        }
    };

    return (
        <Form onSubmit={form.handleSubmit}>
            <FormGroup>
                <Label for="center">Center  <span className="text-danger">*</span></Label>

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

            <FormGroup>
                <Label htmlFor="contactNumber">
                    Contact Number <span className="text-danger">*</span>
                </Label>
                <PhoneInputWithCountrySelect
                    name="contactNumber"
                    id="contactNumber"
                    min="10"
                    value={form.values.contactNumber}
                    onChange={(value) =>
                        form.handleChange({
                            target: {
                                name: "contactNumber",
                                value: value,
                            },
                        })
                    }
                    limitMaxLength={true}
                    defaultCountry="IN"
                    className="w-100"
                    style={{
                        width: "100%",
                        height: "42px",
                        padding: "0.5rem 0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "1rem",
                    }}
                />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="designation">Designation  <span className="text-danger">*</span></Label>

                <CreatableSelect
                    inputId="designation"
                    placeholder="Select or create designation"
                    isClearable
                    isDisabled={designationLoading}
                    isLoading={designationLoading || creatingDesignation}
                    options={designationOptions}
                    value={
                        designationOptions.find(
                            opt => opt.value === form.values.designation
                        ) || null
                    }
                    onChange={(option) =>
                        form.setFieldValue("designation", option ? option.value : "")
                    }
                    onBlur={() => form.setFieldTouched("designation", true)}
                    onCreateOption={handleCreateDesignation}
                />

                {form.touched.designation && form.errors.designation && (
                    <div className="text-danger small mt-1">
                        {form.errors.designation}
                    </div>
                )}
            </FormGroup>

            <FormGroup>
                <Label htmlFor="preferredGender">Preferred Gender</Label>

                <Select
                    inputId="preferredGender"
                    placeholder="Select gender"
                    options={HiringPreferredGenderOptions}
                    isClearable
                    value={
                        HiringPreferredGenderOptions.find(
                            opt => opt.value === form.values.preferredGender
                        ) || null
                    }
                    onChange={(option) =>
                        form.setFieldValue(
                            "preferredGender",
                            option ? option.value : ""
                        )
                    }
                    onBlur={() =>
                        form.setFieldTouched("preferredGender", true)
                    }
                />

                {form.touched.preferredGender && form.errors.preferredGender && (
                    <div className="text-danger small mt-1">
                        {form.errors.preferredGender}
                    </div>
                )}
            </FormGroup>


            <FormGroup>
                <Label htmlFor="requiredCount">Required Count  <span className="text-danger">*</span></Label>
                <Input
                    type="number"
                    name="requiredCount"
                    id="requiredCount"
                    min={1}
                    value={form.values.requiredCount}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                />

                {form.touched.requiredCount && form.errors.requiredCount && (
                    <div className="text-danger small mt-1">
                        {form.errors.requiredCount}
                    </div>
                )}
            </FormGroup>

            <div className="d-flex justify-content-end gap-2">
                {view === "MODAL" && <Button type="button" color="secondary" onClick={onCancel} disabled={form.isSubmitting}>
                    Cancel
                </Button>}

                {(view !== "PAGE" || hasCreatePermission) && (
                    <Button
                        className="text-white"
                        onClick={form.handleSubmit}
                        color="primary"
                        disabled={form.isSubmitting || !form.isValid}
                    >
                        {form.isSubmitting && <Spinner size="sm" className="me-2" />}
                        Add Request
                    </Button>
                )}
            </div>
        </Form>
    );
};

HiringForm.propTypes = {
    initialData: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    view: PropTypes.oneOf(["MODAL", "PAGE"]),
    hasCreatePermission: PropTypes.bool,
};

export default HiringForm;
