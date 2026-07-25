import { useFormik } from "formik";
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { Button, Input, FormGroup, Label, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getExitEmployeesBySearch } from "../../../../store/features/HR/hrSlice";
import {
  requestForRegularization,
  createAndApproveRegularization,
} from "../../../../helpers/backend_helper";

const RegularizationOnBehalfForm = ({ onSuccess, hasApprovePermission }) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();

  const [searchText, setSearchText] = useState("");
  const [showList, setShowList] = useState(false);
  const [searching, setSearching] = useState(false);
  const [managerName, setManagerName] = useState("");
  const [submittingAs, setSubmittingAs] = useState(null);

  const { employees } = useSelector((state) => state.HR);
  const { centerAccess } = useSelector((state) => state.User);

  const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required("Please select an employee"),
    managerId: Yup.string().required("No manager found for this employee"),
    date: Yup.string().required("Date is required"),
    checkIn: Yup.string().required("Check-in time is required"),
    checkOut: Yup.string()
      .required("Check-out time is required")
      .test(
        "not-same",
        "Check-in and check-out cannot be the same",
        function (value) {
          return value !== this.parent.checkIn;
        },
      ),
    description: Yup.string().trim().required("Reason is required"),
  });

  const searchEmployees = async (text) => {
    setSearching(true);
    try {
      await dispatch(
        getExitEmployeesBySearch({
          query: text,
          centers: centerAccess,
          view: "REGULARIZATION",
        }),
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Something went wrong");
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const form = useFormik({
    initialValues: {
      employeeId: "",
      name: "",
      eCode: "",
      currentLocation: "",
      managerId: "",
      date: "",
      checkIn: "",
      checkOut: "",
      description: "",
    },
    validationSchema,
    onSubmit: () => {}, 
  });

  const resetAll = () => {
    form.resetForm();
    setSearchText("");
    setShowList(false);
    setManagerName("");
  };

  const chooseEmployee = (emp) => {
    form.setFieldValue("employeeId", emp._id);
    form.setFieldValue("name", emp.name);
    form.setFieldValue("eCode", emp.eCode);
    form.setFieldValue("currentLocation", emp.currentLocation);
    if (emp.manager) {
      form.setFieldValue("managerId", emp.manager);
      setManagerName(emp.managerName || "");
    } else {
      form.setFieldValue("managerId", "");
      setManagerName("No Manager Found");
    }
    setShowList(false);
    setSearchText("");
  };

  // action: "submit" (create pending) | "approve" (create + regularize)
  const handleSubmit = async (action) => {
    const errors = await form.validateForm();
    form.setTouched({
      employeeId: true,
      managerId: action === "submit",
      date: true,
      checkIn: true,
      checkOut: true,
      description: true,
    });
    if (action === "approve") delete errors.managerId;
    if (Object.keys(errors).length > 0) return;

    setSubmittingAs(action);
    try {
      const payload = {
        employee_id: form.values.employeeId,
        manager_id: form.values.managerId,
        reqClockInTime: form.values.checkIn,
        reqClockOutTime: form.values.checkOut,
        description: form.values.description,
        skipLimit: true,
        date: new Date(
          form.values.date + "T00:00:00+05:30",
        ).toISOString(),
      };

      if (action === "approve") {
        const res = await createAndApproveRegularization(payload);
        toast.success(res?.message || "Regularization created and approved");
      } else {
        const res = await requestForRegularization(payload);
        toast.success(res?.message || "Regularization request created");
      }

      resetAll();
      onSuccess?.();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to create regularization");
      }
    } finally {
      setSubmittingAs(null);
    }
  };

  const busy = submittingAs !== null;

  return (
    <>
      {/* Search Employee */}
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
            {searching && <div className="p-2 text-muted">Loading...</div>}

            {employees.length === 0 && !searching && (
              <div className="p-2 text-muted">No employees found</div>
            )}

            {employees.map((emp) => (
              <div
                key={emp._id}
                className="p-2"
                style={{ cursor: "pointer", borderBottom: "1px solid #eee" }}
                onClick={() => chooseEmployee(emp)}
              >
                <strong>{emp.name}</strong>
                <br />
                <span className="text-muted">ECode: {emp.eCode}</span>
              </div>
            ))}
          </div>
        )}
      </FormGroup>

      {/* NAME */}
      <FormGroup className="mb-3">
        <Label for="name">Name <span className="text-danger">*</span></Label>
        <Input id="name" name="name" value={form.values.name} disabled />
      </FormGroup>

      {/* E-CODE + CURRENT LOCATION */}
      <div className="row">
        <FormGroup className="mb-3 col-md-6">
          <Label for="eCode">E-Code <span className="text-danger">*</span></Label>
          <Input id="eCode" name="eCode" value={form.values.eCode} disabled />
        </FormGroup>

        <FormGroup className="mb-3 col-md-6">
          <Label for="currentLocation">
            Current Location <span className="text-danger">*</span>
          </Label>
          <Input
            id="currentLocation"
            name="currentLocation"
            value={form.values.currentLocation}
            disabled
          />
        </FormGroup>
      </div>

      {/* MANAGER */}
      <FormGroup className="mb-3">
        <Label>Manager <span className="text-danger">*</span></Label>
        <Input
          value={managerName}
          disabled
          className={managerName === "No Manager Found" ? "text-danger" : ""}
        />
        {form.touched.managerId && form.errors.managerId && (
          <div className="text-danger small">{form.errors.managerId}</div>
        )}
      </FormGroup>

      {/* DATE */}
      <FormGroup className="mb-3">
        <Label for="date">Date <span className="text-danger">*</span></Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={form.values.date}
          onChange={(e) => form.setFieldValue("date", e.target.value)}
          onBlur={() => form.setFieldTouched("date", true)}
          invalid={form.touched.date && !!form.errors.date}
        />
        {form.touched.date && form.errors.date && (
          <div className="text-danger small">{form.errors.date}</div>
        )}
      </FormGroup>

      {/* TIMES */}
      <div className="row mb-3">
        <div className="col-md-6">
          <Label for="checkIn">
            Check In <span className="text-danger">*</span>
          </Label>
          <Input
            id="checkIn"
            name="checkIn"
            type="time"
            lang="en-GB"
            value={form.values.checkIn}
            onChange={(e) => form.setFieldValue("checkIn", e.target.value)}
            onBlur={() => form.setFieldTouched("checkIn", true)}
            invalid={form.touched.checkIn && !!form.errors.checkIn}
          />
          {form.touched.checkIn && form.errors.checkIn && (
            <div className="text-danger small">{form.errors.checkIn}</div>
          )}
        </div>

        <div className="col-md-6">
          <Label for="checkOut">
            Check Out <span className="text-danger">*</span>
          </Label>
          <Input
            id="checkOut"
            name="checkOut"
            type="time"
            lang="en-GB"
            value={form.values.checkOut}
            onChange={(e) => form.setFieldValue("checkOut", e.target.value)}
            onBlur={() => form.setFieldTouched("checkOut", true)}
            invalid={form.touched.checkOut && !!form.errors.checkOut}
          />
          {form.touched.checkOut && form.errors.checkOut && (
            <div className="text-danger small">{form.errors.checkOut}</div>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <FormGroup className="mb-3">
        <Label for="description">
          Reason <span className="text-danger">*</span>
        </Label>
        <Input
          id="description"
          name="description"
          type="textarea"
          rows={4}
          placeholder="Enter reason"
          value={form.values.description}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          invalid={form.touched.description && !!form.errors.description}
        />
        {form.touched.description && form.errors.description && (
          <div className="text-danger small">{form.errors.description}</div>
        )}
      </FormGroup>

      <div className="d-flex gap-2 justify-content-end">
        <Button
          color="primary"
          className="text-white"
          onClick={() => handleSubmit("submit")}
          disabled={busy}
        >
          {submittingAs === "submit" && <Spinner size="sm" className="me-2" />}
          Submit Request
        </Button>

        {hasApprovePermission && (
          <Button
            color="success"
            className="text-white"
            onClick={() => handleSubmit("approve")}
            disabled={busy}
          >
            {submittingAs === "approve" && (
              <Spinner size="sm" className="me-2" />
            )}
            Submit &amp; Approve
          </Button>
        )}
      </div>
    </>
  );
};

RegularizationOnBehalfForm.propTypes = {
  onSuccess: PropTypes.func,
  hasApprovePermission: PropTypes.bool,
};

export default RegularizationOnBehalfForm;
