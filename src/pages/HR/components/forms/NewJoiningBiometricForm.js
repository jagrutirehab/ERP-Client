import { useMemo, useState } from "react";
import Select from "react-select";
import { Button, FormGroup, Label, Input, Spinner } from "reactstrap";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import {
  addNewJoiningBiometricData,
  searchExitEmployee,
} from "../../../../helpers/backend_helper";

const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const emptyShift = { shift: "", answers: "" };

const NewJoiningBiometricForm = ({ hasCreatePermission }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [biometricId, setBiometricId] = useState("");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [shifts, setShifts] = useState([{ ...emptyShift }]);
  const [errors, setErrors] = useState({});

  const { centerAccess } = useSelector((state) => state.User);
  const handleAuthError = useAuthError();

  const fetchEmployees = async (text) => {
    if (!text || text.trim().length < 2) {
      setEmployees([]);
      return;
    }
    try {
      setLoadingEmployees(true);
      const response = await searchExitEmployee({
        query: text.trim(),
        centers: centerAccess,
        view: "NEW_JOINING_BIOMETRIC",
      });
      setEmployees(
        (response?.data || []).map((emp) => ({
          value: emp._id,
          label: emp.name,
          center: emp.currentLocation,
        })),
      );
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch employees",
        );
      }
    } finally {
      setLoadingEmployees(false);
    }
  };

  const debouncedFetchEmployees = useMemo(
    () => debounce(fetchEmployees, 400),
    [centerAccess],
  );

  const handleShiftChange = (index, field, value) => {
    setShifts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedEmployee) newErrors.employee = "Employee is required";
    if (!biometricId.trim()) newErrors.biometricId = "Biometric ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setBiometricId("");
    setShifts([{ ...emptyShift }]);
    setErrors({});
    setSearchText("");
    setEmployees([]);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addNewJoiningBiometricData({
        employeeId: selectedEmployee.value,
        biometricId: biometricId.trim(),
        shifts: shifts.filter((s) => s.shift.trim()),
      });
      toast.success("Biometric request submitted for approval");
      resetForm();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to submit request",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FormGroup>
        <Label>
          Employee <span className="text-danger">*</span>
        </Label>
        <small className="text-danger d-block mb-1">
          * Only showing new joinings that are pending approval
        </small>
        <Select
          placeholder="Search by name..."
          isClearable
          isLoading={loadingEmployees}
          options={employees}
          value={selectedEmployee}
          onInputChange={(value, { action }) => {
            if (action === "input-change") {
              setSearchText(value);
              debouncedFetchEmployees(value);
            }
          }}
          onChange={(option) => {
            setSelectedEmployee(option || null);
            if (errors.employee)
              setErrors((prev) => ({ ...prev, employee: "" }));
          }}
          noOptionsMessage={() => {
            if (loadingEmployees) return "Searching...";
            if (searchText.trim().length < 2)
              return "Type at least 2 characters";
            return "No new joining found";
          }}
          classNamePrefix="react-select"
        />
        {errors.employee && (
          <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
            {errors.employee}
          </div>
        )}
      </FormGroup>

      {selectedEmployee && (
        <FormGroup>
          <Label>Center</Label>
          <Input
            type="text"
            value={selectedEmployee.center || "-"}
            disabled
            style={{ backgroundColor: "#f4f4f4", cursor: "not-allowed" }}
          />
        </FormGroup>
      )}

      <FormGroup>
        <Label>
          Biometric ID <span className="text-danger">*</span>
        </Label>
        <Input
          type="text"
          placeholder="Enter Biometric ID"
          value={biometricId}
          onChange={(e) => {
            setBiometricId(e.target.value);
            if (errors.biometricId)
              setErrors((prev) => ({ ...prev, biometricId: "" }));
          }}
        />
        {errors.biometricId && (
          <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
            {errors.biometricId}
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Label className="mb-0">Shifts</Label>
          <Button
            color="primary"
            size="sm"
            outline
            onClick={() => setShifts((prev) => [...prev, { ...emptyShift }])}
          >
            <Plus size={14} className="me-1" />
            Add Shift
          </Button>
        </div>

        {shifts.map((s, index) => (
          <div
            key={index}
            className="border rounded p-3 mb-2"
            style={{ backgroundColor: "#f9f9f9" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span
                className="fw-semibold text-muted"
                style={{ fontSize: "13px" }}
              >
                Shift {index + 1}
              </span>
              {shifts.length > 1 && (
                <Button
                  color="danger"
                  size="sm"
                  outline
                  onClick={() =>
                    setShifts((prev) => prev.filter((_, i) => i !== index))
                  }
                  style={{ padding: "2px 8px" }}
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>

            <div className="d-flex gap-3">
              <FormGroup className="flex-fill mb-0">
                <Label style={{ fontSize: "13px" }}>Shift Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Morning, Night"
                  value={s.shift}
                  onChange={(e) =>
                    handleShiftChange(index, "shift", e.target.value)
                  }
                />
              </FormGroup>
              <FormGroup className="flex-fill mb-0">
                <Label style={{ fontSize: "13px" }}>Answers</Label>
                <Input
                  type="textarea"
                  rows={1}
                  placeholder="Enter answers for this shift"
                  value={s.answers}
                  onChange={(e) =>
                    handleShiftChange(index, "answers", e.target.value)
                  }
                />
              </FormGroup>
            </div>
          </div>
        ))}
      </FormGroup>

      <div className="d-flex justify-content-end mt-3">
        {hasCreatePermission && (
          <Button color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewJoiningBiometricForm;
