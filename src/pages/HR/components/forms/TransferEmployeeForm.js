import { useFormik } from "formik";
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import {
    Button,
    Input,
    ModalFooter,
    FormGroup,
    Label,
    Spinner
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import * as Yup from "yup";
import Select from "react-select";
import PropTypes from "prop-types";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getExitEmployeesBySearch } from "../../../../store/features/HR/hrSlice";
import { editEmployeeTransfer, postEmployeeTransfer } from "../../../../helpers/backend_helper";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const validationSchema = Yup.object().shape({
    transferLocation: Yup.string()
        .required("Transfer Location is required")
        .matches(objectIdRegex, "Invalid Transfer Location"),

    transferDate: Yup.string()
        .required("Transfer Date is required")
        .trim("Transfer Date cannot be empty"),
});

const TransferEmployeeForm = ({ initialData, onSuccess, view, onCancel, hasCreatePermission }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const isEdit = !!initialData?._id;

    const [searchText, setSearchText] = useState("");
    const [showList, setShowList] = useState(false);
    const [searching, setSearching] = useState(false);

    const { employees } = useSelector((state) => state.HR);
    const { centerAccess, userCenters } = useSelector((state) => state.User);

    const searchEmployees = async (text) => {
        setSearching(true);
        try {
            await dispatch(
                getExitEmployeesBySearch({
                    query: text,
                    centers: centerAccess,
                    view: "TRANSFER_EMPLOYEE"
                })
            ).unwrap();
        } finally {
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
            currentLocation: initialData?.currentLocation?.title || "",
            transferDate: initialData?.transferDate || "",
            transferLocation: initialData?.transferLocation._id || "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (!isEdit && !values.employeeId) {
                    toast.error("Please select an employee");
                    return;
                }

                const payload = {
                    ...(!isEdit && { employeeId: values.employeeId }),
                    transferDate: values.transferDate,
                    transferLocation: values.transferLocation
                };

                if (isEdit) {
                    await editEmployeeTransfer(initialData._id, payload);
                    toast.success("Employee Transfer Request updated successfully");
                } else {
                    await postEmployeeTransfer(payload);
                    toast.success("Employee Transfer Request added successfully");
                }

                if (view === "PAGE") {
                    resetAll();
                } else {
                    onSuccess?.();
                }

            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to save employee transferr request");
                }
            }
        },
    });

    const chooseEmployee = (emp) => {
        form.setFieldValue("employeeId", emp._id);
        form.setFieldValue("name", emp.name);
        form.setFieldValue("eCode", emp.eCode);
        form.setFieldValue("currentLocation", emp.currentLocation);
        setShowList(false);
        setSearchText("");
    };

    const transferLocationOptions =
        userCenters
            ?.filter(
                center => center._id !== initialData?.currentLocation?._id
            )
            .map(center => ({
                value: center._id,
                label: center.title,
            })) || [];

    return (
        <>
            {/* Search Employee */}
            {!isEdit && (
                <FormGroup className="mb-3 position-relative">
                    <Label>Search Employee</Label>
                    <Input
                        type="text"
                        placeholder="Search by name or eCode"
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
                <Label for="name">Name</Label>
                <Input id="name" name="name" value={form.values.name} disabled />
            </FormGroup>

            {/* E-CODE */}
            <FormGroup className="mb-3">
                <Label for="eCode">E-Code</Label>
                <Input id="eCode" name="eCode" value={form.values.eCode} disabled />
            </FormGroup>

            {/* CURRENT LOCATION */}
            <FormGroup className="mb-3">
                <Label for="currentLocation">Current Location</Label>
                <Input
                    id="currentLocation"
                    name="currentLocation"
                    value={form.values.currentLocation}
                    disabled
                />
            </FormGroup>

            {/* TRANSFER LOCATION */}
            <FormGroup>
                <Label for="transferLocation">Transfer Location</Label>

                <Select
                    inputId="transferLocation"
                    options={transferLocationOptions}
                    value={form.values.transferLocation ? transferLocationOptions.find(
                        opt => opt.value === form.values.transferLocation
                    ) : null}
                    onChange={(option) => {
                        form.setFieldValue(
                            "transferLocation",
                            option ? option.value : ""
                        );
                    }}
                    onBlur={() =>
                        form.setFieldTouched("transferLocation", true)
                    }
                    placeholder="Select Transfer Location"
                    classNamePrefix="react-select"
                    isClearable
                />

                {form.touched.transferLocation &&
                    form.errors.transferLocation && (
                        <div className="text-danger mt-1 small">
                            {form.errors.transferLocation}
                        </div>
                    )}
            </FormGroup>

            {/* DATE OF TRANSFER */}
            <FormGroup className="mb-3">
                <Label for="transferDate">Date of Transfer</Label>
                <Input
                    id="transferDate"
                    type="date"
                    name="transferDate"
                    value={form.values.transferDate}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    invalid={form.touched.amount && !!form.errors.transferDate}
                />
                {form.touched.transferDate && form.errors.transferDate && (
                    <div className="text-danger small">{form.errors.transferDate}</div>
                )}
            </FormGroup>

            <ModalFooter>
                {view === "MODAL" && <Button color="secondary" className="text-white" onClick={onCancel} disabled={form.isSubmitting}>
                    Cancel
                </Button>}

                {(view !== "PAGE" || hasCreatePermission) && <Button
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
                    {form.isSubmitting && <Spinner size={"sm"} className="me-2" />}
                    {isEdit ? "Update Request" : "Add Request"}
                </Button>}
            </ModalFooter>
        </>
    );
};

TransferEmployeeForm.propTypes = {
    initialData: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    view: PropTypes.oneOf(["MODAL", "PAGE"]),
    hasCreatePermission: PropTypes.bool
};

export default TransferEmployeeForm;
