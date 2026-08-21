import React, { useEffect, useState } from "react";
import { Row, Col, Table, Spinner } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import {
  getAllCenters,
  getCentreManagersByCenter,
  getCentersWithFallbackManager,
  setFallbackCentreManager,
  getEmployeesBySearch,
} from "../../../helpers/backend_helper";

const CenterFallbackManager = () => {
  const [centers, setCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const [checkingManager, setCheckingManager] = useState(false);
  const [existingManager, setExistingManager] = useState(null); // normal active manager, if any
  const [isFallbackActive, setIsFallbackActive] = useState(false); // true if fallback is being used already

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [fallbackList, setFallbackList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Load all centers for the dropdown
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoadingCenters(true);
        const response = await getAllCenters();
        const options =
          response?.payload?.map((c) => ({
            value: c._id,
            label: c.title,
          })) || [];
        setCenters(options);
      } catch (err) {
        console.log("Error fetching centers", err);
      } finally {
        setLoadingCenters(false);
      }
    };
    fetchCenters();
  }, []);

  // Load the reference list (centers that already have a fallback set)
  const fetchFallbackList = async () => {
    try {
      setLoadingList(true);
      const res = await getCentersWithFallbackManager();
      const withFallback = (res?.data || []).filter(
        (c) => c.fallbackCentreManager,
      );
      setFallbackList(withFallback);
    } catch (err) {
      console.log("Error fetching fallback list", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchFallbackList();
  }, []);

  // When a center is selected, check if it already has an active manager
  const checkManager = async (centerId) => {
    if (!centerId) {
      setExistingManager(null);
      setIsFallbackActive(false);
      setSelectedEmployee(null);
      return;
    }

    try {
      setCheckingManager(true);
      setSelectedEmployee(null);

      const res = await getCentreManagersByCenter({
        center: centerId,
      });

      const managers = res?.data || [];

      if (managers.length && !res?.isFallback) {
        // A real active manager exists
        setExistingManager(managers[0]);
        setIsFallbackActive(false);
      } else if (managers.length && res?.isFallback) {
        // Fallback is currently being used
        setExistingManager(null);
        setIsFallbackActive(true);
        setSelectedEmployee({
          value: managers[0]._id,
          label: `${managers[0].name} (${managers[0].eCode})`,
        });
      } else {
        setExistingManager(null);
        setIsFallbackActive(false);
      }
    } catch (err) {
      console.log("Error checking centre manager", err);
    } finally {
      setCheckingManager(false);
    }
  };

  useEffect(() => {
    checkManager(selectedCenter?.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCenter]);

  const fetchEmployees = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      setEmployeeOptions([]);
      return;
    }
    try {
      setLoadingEmployees(true);
      const params = { type: "employee" };
      if (/^\d+$/.test(searchText)) {
        params.eCode = searchText;
      } else {
        params.name = searchText;
      }
      const response = await getEmployeesBySearch(params);
      const options =
        response?.data?.map((emp) => ({
          value: emp._id,
          label: `${emp.name} (${emp.eCode})`,
        })) || [];
      setEmployeeOptions(options);
    } catch (err) {
      console.log("Error fetching employees", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const debouncedFetchEmployees = React.useMemo(
    () => debounce(fetchEmployees, 400),
    [],
  );

  const handleSave = async () => {
    if (!selectedCenter) {
      toast.error("Please select a center");
      return;
    }
    if (!selectedEmployee) {
      toast.error("Please select an employee before saving");
      return;
    }

    try {
      setSaving(true);
      await setFallbackCentreManager({
        centerId: selectedCenter.value,
        employeeId: selectedEmployee.value,
      });
      toast.success("Fallback Centre Manager updated successfully");
      setIsFallbackActive(true);
      fetchFallbackList();
    } catch (err) {
      toast.error(err?.message || "Failed to update fallback manager");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedCenter) return;

    try {
      setRemoving(true);
      await setFallbackCentreManager({
        centerId: selectedCenter.value,
        employeeId: null,
      });
      toast.success("Fallback manager removed successfully");
      setSelectedEmployee(null);
      setIsFallbackActive(false);
      fetchFallbackList();
    } catch (err) {
      toast.error(err?.message || "Failed to remove fallback manager");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="container-fluid px-3 py-4">
      <div className="mb-4">
        <h4 className="fw-semibold mb-1">Centre Fallback Manager</h4>
        <p className="text-muted small mb-0">
          Select a center to assign a backup Centre Manager — used only when
          no active Centre Manager is found for that center.
        </p>
      </div>

      <Row className="mb-4">
        <Col md={5}>
          <label className="form-label fw-semibold">Select Center</label>
          <Select
            placeholder="Select a center..."
            options={centers}
            value={selectedCenter}
            isLoading={loadingCenters}
            onChange={(option) => setSelectedCenter(option)}
          />
        </Col>
      </Row>

      {selectedCenter && (
        <Row className="mb-4">
          <Col md={8}>
            {checkingManager ? (
              <div className="d-flex align-items-center gap-2 text-muted">
                <Spinner size="sm" /> Checking existing Centre Manager...
              </div>
            ) : existingManager ? (
              <div className="alert alert-success mb-0">
                This center already has an active Centre Manager:{" "}
                <strong>
                  {existingManager.name} ({existingManager.eCode})
                </strong>
                . Fallback manager is not needed.
              </div>
            ) : (
              <>
                <div className="alert alert-warning">
                  {isFallbackActive
                    ? "No active Centre Manager found. This center is currently using a fallback manager below — you can change it."
                    : "No active Centre Manager found for this center. Please assign a fallback manager."}
                </div>

                <label className="form-label fw-semibold">
                  Assign Fallback Manager
                </label>
                <Select
                  placeholder="Search employee..."
                  options={employeeOptions}
                  value={selectedEmployee}
                  isLoading={loadingEmployees}
                  onInputChange={(value, { action }) => {
                    if (action === "input-change") {
                      debouncedFetchEmployees(value);
                    }
                  }}
                  onChange={(option) => setSelectedEmployee(option)}
                />

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? <Spinner size="sm" color="light" /> : "Save"}
                  </button>

                  {isFallbackActive && (
                    <button
                      className="btn btn-outline-danger"
                      disabled={removing}
                      onClick={handleRemove}
                    >
                      {removing ? (
                        <Spinner size="sm" color="danger" />
                      ) : (
                        "Remove Fallback"
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </Col>
        </Row>
      )}

      <hr className="my-4" />

      <h6 className="fw-semibold mb-3">
        Centers with Fallback Manager Configured
      </h6>

      {loadingList ? (
        <Spinner size="sm" />
      ) : fallbackList.length === 0 ? (
        <p className="text-muted">No fallback managers configured yet.</p>
      ) : (
        <Table responsive bordered className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Center</th>
              <th>Fallback Manager</th>
            </tr>
          </thead>
          <tbody>
            {fallbackList.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>
                  {c.fallbackCentreManager.name} (
                  {c.fallbackCentreManager.eCode})
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default CenterFallbackManager;