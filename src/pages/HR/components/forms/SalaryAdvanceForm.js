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
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getExitEmployeesBySearch } from "../../../../store/features/HR/hrSlice";
import { editAdvanceSalary, postAdvanceSalary } from "../../../../helpers/backend_helper";

const validationSchema = Yup.object().shape({
    amount: Yup.number()
        .typeError("Amount must be a number")
        .required("Amount is required")
        .min(1, "Amount must be greater than 0"),
});

const SalaryAdvanceForm = ({ initialData, onSuccess, view, onCancel }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const isEdit = !!initialData?._id;

    const [searchText, setSearchText] = useState("");
    const [showList, setShowList] = useState(false);
    const [searching, setSearching] = useState(false);

    const { employees } = useSelector((state) => state.HR);
    const { centerAccess } = useSelector((state) => state.User);

    const searchEmployees = async (text) => {
        setSearching(true);
        try {
            await dispatch(
                getExitEmployeesBySearch({
                    query: text,
                    centers: centerAccess,
                    view: "SALARY_ADVANCE"
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
            name: initialData?.employeeData?.name || "",
            eCode: initialData?.employeeData?.eCode || "",
            currentLocation: initialData?.center?.title || "",
            amount: initialData?.amount || "",
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
                    amount: values.amount
                };

                if (isEdit) {
                    await editAdvanceSalary(initialData._id, payload);
                    toast.success("Advance Salary Request updated successfully");
                } else {
                    await postAdvanceSalary(payload);
                    toast.success("Advance Salary Request added successfully");
                }

                if (view === "PAGE") {
                    resetAll();
                } else {
                    onSuccess?.()
                }

            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to save advance salary request");
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

            {/* AMOUNT */}
            <FormGroup className="mb-3">
                <Label for="amount">Amount</Label>
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

            <div className="d-flex gap-2 justify-content-end">
                {view === "MODAL" && <Button color="secondary" onClick={onCancel} disabled={form.isSubmitting}>
                    Cancel
                </Button>}
                <Button
                    color="primary"
                    className="text-white"
                    onClick={form.handleSubmit}
                    disabled={
                        form.isSubmitting ||
                        !form.isValid ||
                        (!isEdit && !form.values.employeeId)
                    }
                >
                    {form.isSubmitting && <Spinner size="sm" className="me-2" />}
                    {isEdit ? "Update Request" : "Add Request"}
                </Button>
            </div>
        </>
    );
};

SalaryAdvanceForm.propTypes = {
    initialData: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
    view: PropTypes.oneOf(["MODAL", "PAGE"])
};

export default SalaryAdvanceForm;
