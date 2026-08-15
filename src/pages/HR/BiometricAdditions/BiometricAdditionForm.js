import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
  Button,
  FormGroup,
  Label,
  Input,
  Spinner,
  Card,
  CardBody,
} from "reactstrap";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  addBiometricAdditionRequest,
  getEmployeesBySearch,
} from "../../../helpers/backend_helper";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const isECodeLike = (value) => /^[A-Za-z]*\d+[A-Za-z0-9]*$/.test(value);

const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const BiometricAdditionForm = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [biometricId, setBiometricId] = useState("");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [shifts, setShifts] = useState([{ shift: "", answers: "" }]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading: permLoading } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "HR",
    "BIOMETRIC_ADDITION_REQUEST",
    "READ",
  );
  const hasWritePermission = hasPermission(
    "HR",
    "BIOMETRIC_ADDITION_REQUEST",
    "WRITE",
  );
  const fetchEmployees = async (text) => {
    if (!text || text.length < 2) {
      setEmployees([]);
      return;
    }
    try {
      setLoadingEmployees(true);
      const params = { type: "biometric" };
      if (isECodeLike(text)) {
        params.eCode = text;
      } else {
        params.name = text;
      }
      const response = await getEmployeesBySearch(params);
      const data = response?.data || [];
      setEmployees(
        data.map((emp) => ({
          value: emp._id,
          label: `${emp.name} (${emp.eCode})`,
          eCode: emp.eCode,
          currentLocation: emp.currentLocation,
        })),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch employees",
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  const debouncedFetchEmployees = useMemo(
    () => debounce(fetchEmployees, 400),
    [],
  );

  const handleEmployeeChange = (option) => {
    setSelectedEmployee(option || null);
    setEmployeeDetails(option || null);
    if (errors.employee) setErrors((prev) => ({ ...prev, employee: "" }));
  };

  const handleShiftChange = (index, field, value) => {
    setShifts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const addShift = () => {
    setShifts((prev) => [...prev, { shift: "", answers: "" }]);
  };

  const removeShift = (index) => {
    setShifts((prev) => prev.filter((_, i) => i !== index));
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
    setEmployeeDetails(null);
    setBiometricId("");
    setShifts([{ shift: "", answers: "" }]);
    setErrors({});
    setSearchText("");
    setEmployees([]);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addBiometricAdditionRequest({
        employeeId: selectedEmployee.value,
        biometricId,
        shifts: shifts.filter((s) => s.shift.trim()),
      });
      toast.success("Biometric addition request submitted successfully");
      resetForm();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit request";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!permLoading && !hasUserPermission) {
      navigate("/unauthorized");
    }
  }, [permLoading, hasUserPermission, navigate]);

  if (permLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-start p-4"
      style={{ minHeight: "80vh", width: "100%" }}
    >
      <Card style={{ width: "100%", maxWidth: "900px" }} className="shadow-sm">
        <CardBody className="p-4">
          <h4 className="fw-bold text-primary mb-4">
            Biometric Addition Request
          </h4>

          <FormGroup>
            <Label>
              Employee <span className="text-danger">*</span>
            </Label>
            <small className="text-danger d-block mb-1">
              * Only showing active employees without a biometric ID assigned
            </small>
            <Select
              placeholder="Search by name or ECode..."
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
              onChange={handleEmployeeChange}
              noOptionsMessage={() => {
                if (loadingEmployees) return "Searching...";
                if (searchText.length < 2) return "Type at least 2 characters";
                return "No employee found";
              }}
              classNamePrefix="react-select"
            />
            {errors.employee && (
              <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
                {errors.employee}
              </div>
            )}
          </FormGroup>

          {employeeDetails && (
            <div className="d-flex gap-3 mb-3">
              <FormGroup className="flex-fill mb-0">
                <Label>ECode</Label>
                <Input
                  type="text"
                  value={employeeDetails.eCode || "-"}
                  disabled
                  style={{ backgroundColor: "#f4f4f4", cursor: "not-allowed" }}
                />
              </FormGroup>
              <FormGroup className="flex-fill mb-0">
                <Label>Center</Label>
                <Input
                  type="text"
                  value={employeeDetails.currentLocation?.title || "-"}
                  disabled
                  style={{ backgroundColor: "#f4f4f4", cursor: "not-allowed" }}
                />
              </FormGroup>
            </div>
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
              <Button color="primary" size="sm" outline onClick={addShift}>
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
                      onClick={() => removeShift(index)}
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
            {hasWritePermission && (
              <Button color="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Submit"}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default BiometricAdditionForm;
