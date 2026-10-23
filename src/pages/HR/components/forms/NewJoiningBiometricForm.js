import { useState } from "react";
import Select from "react-select";
import { Button, FormGroup, Label, Input, Spinner } from "reactstrap";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useCenterOptions } from "../../../../Components/Hooks/useCenterOptions";
import { addNewJoiningBiometricData } from "../../../../helpers/backend_helper";

const emptyShift = { shift: "", answers: "" };

const NewJoiningBiometricForm = ({ hasCreatePermission }) => {
  const [employeeName, setEmployeeName] = useState("");
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [biometricId, setBiometricId] = useState("");
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState([{ ...emptyShift }]);
  const [errors, setErrors] = useState({});

  const centerOptions = useCenterOptions({ includeAll: false });
  const handleAuthError = useAuthError();

  const handleShiftChange = (index, field, value) => {
    setShifts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!employeeName.trim()) newErrors.employeeName = "Employee name is required";
    if (!selectedCenter) newErrors.center = "Center is required";
    if (!biometricId.trim()) newErrors.biometricId = "Biometric ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setEmployeeName("");
    setSelectedCenter(null);
    setBiometricId("");
    setShifts([{ ...emptyShift }]);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addNewJoiningBiometricData({
        employeeName: employeeName.trim(),
        center: selectedCenter.value,
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
          Employee Name <span className="text-danger">*</span>
        </Label>
        <Input
          type="text"
          placeholder="Enter employee name"
          value={employeeName}
          onChange={(e) => {
            setEmployeeName(e.target.value);
            if (errors.employeeName)
              setErrors((prev) => ({ ...prev, employeeName: "" }));
          }}
        />
        {errors.employeeName && (
          <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
            {errors.employeeName}
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label>
          Center <span className="text-danger">*</span>
        </Label>
        <Select
          placeholder="Select Center"
          isClearable
          options={centerOptions}
          value={selectedCenter}
          onChange={(option) => {
            setSelectedCenter(option || null);
            if (errors.center) setErrors((prev) => ({ ...prev, center: "" }));
          }}
          classNamePrefix="react-select"
        />
        {errors.center && (
          <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
            {errors.center}
          </div>
        )}
      </FormGroup>

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
