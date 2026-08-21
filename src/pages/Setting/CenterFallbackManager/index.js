import React, { useEffect, useState } from "react";
import { Row, Col, Table, Spinner } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import {
  getCentersWithFallbackManager,
  setFallbackCentreManager,
  getEmployeesBySearch,
} from "../../../helpers/backend_helper";

const CenterFallbackManager = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // per-row selected employee (before saving)
  const [selectedEmployee, setSelectedEmployee] = useState({});
  // per-row employee search options
  const [employeeOptions, setEmployeeOptions] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState({});
  // per-row save loading
  const [savingRow, setSavingRow] = useState({});

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await getCentersWithFallbackManager();
      setCenters(res?.data || []);
    } catch (err) {
      toast.error(err?.message || "Failed to fetch centers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchEmployeesForRow = async (centerId, searchText) => {
    if (!searchText || searchText.length < 2) {
      setEmployeeOptions((prev) => ({ ...prev, [centerId]: [] }));
      return;
    }
    try {
      setLoadingEmployees((prev) => ({ ...prev, [centerId]: true }));

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

      setEmployeeOptions((prev) => ({ ...prev, [centerId]: options }));
    } catch (err) {
      console.log("Error fetching employees", err);
    } finally {
      setLoadingEmployees((prev) => ({ ...prev, [centerId]: false }));
    }
  };

  // debounced fetch per row (created once per center via closure)
  const getDebouncedFetch = (centerId) =>
    debounce((text) => fetchEmployeesForRow(centerId, text), 400);

  const debouncedFetchersRef = React.useRef({});
  const getDebouncedFetcher = (centerId) => {
    if (!debouncedFetchersRef.current[centerId]) {
      debouncedFetchersRef.current[centerId] = getDebouncedFetch(centerId);
    }
    return debouncedFetchersRef.current[centerId];
  };

  const handleSave = async (centerId) => {
    const employee = selectedEmployee[centerId];
    try {
      setSavingRow((prev) => ({ ...prev, [centerId]: true }));

      await setFallbackCentreManager({
        centerId,
        employeeId: employee ? employee.value : null,
      });

      toast.success(
        employee
          ? "Fallback Centre Manager updated successfully"
          : "Fallback Centre Manager removed successfully",
      );

      fetchCenters();
    } catch (err) {
      toast.error(err?.message || "Failed to update fallback manager");
    } finally {
      setSavingRow((prev) => ({ ...prev, [centerId]: false }));
    }
  };

  const filteredCenters = centers.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container-fluid px-3 py-4">
      <div className="mb-4">
        <h4 className="fw-semibold mb-1">Centre Fallback Manager</h4>
        {/* <p className="text-muted small mb-0">
          Assign a backup Centre Manager for each center — used only when no
          active Centre Manager is found for that center.
        </p> */}
      </div>

      <Row className="mb-3">  
        <Col md={4}>
          <input
            type="text"
            className="form-control"
            placeholder="Search center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <Table responsive bordered hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "220px" }}>Center</th>
                  <th style={{ width: "220px" }}>Current Fallback Manager</th>
                  <th style={{ width: "280px" }}>Change Manager</th>
                  <th style={{ width: "120px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCenters.map((center) => (
                  <tr key={center._id}>
                    <td className="fw-semibold">{center.title}</td>
                    <td>
                      {center.fallbackCentreManager ? (
                        <span>
                          {center.fallbackCentreManager.name}{" "}
                          <span className="text-muted small">
                            ({center.fallbackCentreManager.eCode})
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted">Not set</span>
                      )}
                    </td>
                    <td>
                      <Select
                        placeholder="Search employee..."
                        options={employeeOptions[center._id] || []}
                        value={selectedEmployee[center._id] || null}
                        isLoading={loadingEmployees[center._id]}
                        isClearable
                        onInputChange={(value, { action }) => {
                          if (action === "input-change") {
                            getDebouncedFetcher(center._id)(value);
                          }
                        }}
                        onChange={(option) =>
                          setSelectedEmployee((prev) => ({
                            ...prev,
                            [center._id]: option,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={savingRow[center._id]}
                        onClick={() => handleSave(center._id)}
                      >
                        {savingRow[center._id] ? (
                          <Spinner size="sm" color="light" />
                        ) : (
                          "Save"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredCenters.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      No centers found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CenterFallbackManager;
