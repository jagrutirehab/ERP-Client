import { useFormik } from "formik";
import React, { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { getExitEmployeesBySearch } from "../../../store/features/HR/hrSlice";
import { editExitEmployee, postExitEmployee } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    employeeId: Yup.string()
        .required("Please select an employee"),

    exitDate: Yup.string()
        .required("Exit date is required"),

    reason: Yup.string()
        .required("Reason is required"),

    otherReason: Yup.string().when("reason", (reason, schema) => {
        return reason === "OTHER"
            ? schema.required("Other reason is required")
            : schema.notRequired();
    }),
});

const AddExitEmployeeModal = ({ isOpen, toggle, initialData, onUpdate }) => {
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
        await dispatch(
            getExitEmployeesBySearch({
                query: text,
                centers: centerAccess,
            })
        ).unwrap();
        setSearching(false)
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
            employeeId: initialData?._id || "",
            name: initialData?.name || "",
            eCode: initialData
                ? `${initialData.eCode?.prefix || ""}${initialData.eCode?.value || ""}`
                : "",
            currentLocation: initialData?.currentLocation?.title || "",
            exitDate: initialData?.exitWorkflow?.lastWorkingDay || "",
            reason: initialData?.exitWorkflow?.reason || "",
            otherReason: initialData?.exitWorkflow?.otherReason || "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const payload = {
                    employeeId: values.employeeId,
                    exitDate: values.exitDate,
                    reason: values.reason,
                    otherReason: values.otherReason,
                };

                if (isEdit) {
                    await editExitEmployee(payload);
                    toast.success("Employee Exit Record updated successfully");
                } else {
                    await postExitEmployee(payload);
                    toast.success("Employee Exit Record added successfully");
                }

                toggle();
                resetAll();
                onUpdate();

            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to save exit record");
                }
            }
        },
    });

    const chooseEmployee = (emp) => {
        form.setFieldValue("employeeId", emp._id);
        form.setFieldValue("name", emp.name);
        form.setFieldValue("eCode", emp.eCode);
        form.setFieldValue("currentLocation", emp.currentLocation)
        setShowList(false);
        setSearchText("");
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
            <ModalHeader toggle={toggle}>
                {isEdit ? "Edit Employee Exit Record" : "Add Employee Exit Record"}
            </ModalHeader>

            <ModalBody>
                {!isEdit && (
                    <div className="mb-3 position-relative">
                        <label>Search Employee</label>

                        <input
                            type="text"
                            placeholder="Search by name or eCode"
                            className="form-control"
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
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background = "#f7f7f7")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background = "#fff")
                                        }
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
                    </div>
                )}

                {/* NAME */}
                <div className="mb-3">
                    <label>Name</label>
                    <input
                        name="name"
                        value={form.values.name}
                        className="form-control"
                        disabled
                    />
                </div>

                {/* ECODE */}
                <div className="mb-3">
                    <label>E-Code</label>
                    <input
                        name="eCode"
                        value={form.values.eCode}
                        className="form-control"
                        disabled
                    />
                </div>

                <div className="mb-3">
                    <label>Current Location</label>
                    <input
                        name="currentLocation"
                        value={form.values.currentLocation}
                        className="form-control"
                        disabled
                    />
                </div>

                {/* EXIT DATE */}
                <div className="mb-3">
                    <label>Exit Date</label>
                    <input
                        type="date"
                        name="exitDate"
                        value={form.values.exitDate}
                        onChange={form.handleChange}
                        className="form-control"
                    />
                    {form.touched.exitDate && form.errors.exitDate && (
                        <div className="text-danger small">{form.errors.exitDate}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label>Reason</label>
                    <select
                        name="reason"
                        value={form.values.reason}
                        onChange={form.handleChange}
                        className="form-control"
                    >
                        <option disabled value="">Select</option>
                        <option value="SELF_RESIGNING">Self Resigning</option>
                        <option value="PERFORMANCE_ISSUE">Performance Issue</option>
                        <option value="BEHAVIOUR_ISSUE">Behavior Issue</option>
                        <option value="ETHICAL_ISSUE">Ethical Issue</option>
                        <option value="OTHER">Other</option>
                    </select>
                    {form.touched.reason && form.errors.reason && (
                        <div className="text-danger small">{form.errors.reason}</div>
                    )}
                </div>

                {form.values.reason === "OTHER" && (
                    <div className="mb-3">
                        <label>Other Reason</label>
                        <input
                            name="otherReason"
                            value={form.values.otherReason}
                            onChange={form.handleChange}
                            className="form-control"
                        />
                        {form.touched.otherReason && form.errors.otherReason && (
                            <div className="text-danger small">{form.errors.otherReason}</div>
                        )}
                    </div>
                )}
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
                <Button
                    color="primary"
                    onClick={form.handleSubmit}
                    disabled={!form.values.employeeId}
                >
                    {isEdit ? "Update Exit" : "Add Exit"}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AddExitEmployeeModal;
