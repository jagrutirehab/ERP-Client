import { useEffect, useState } from "react";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import { Row, Nav, NavItem, NavLink, Badge } from "reactstrap";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getMedicineActivitiesByStatus,
  getPatientPrescriptionHistory,
} from "../../../store/features/nurse/nurseSlice";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import {
  CheckCheck,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ActivityCard from "./Components/ActivityCard";
import moment from "moment";
import Select from "react-select";

const LIMIT = 10;

const Activities = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { medicineLoading, medicines, prescriptionHistory, loading } =
    useSelector((state) => state.Nurse);
  const [activeTab, setActiveTab] = useState("COMPLETED");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("");
  const [page, setPage] = useState(1);

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setPage(1);
    }
  };

  // Fetch prescription history on mount
  useEffect(() => {
    if (!id || id === "*") return;
    dispatch(getPatientPrescriptionHistory(id));
  }, [id, dispatch]);

  // Build react-select options with "Prescription 1", "Prescription 2" labels
  const prescriptionOptions = prescriptionHistory?.map((p, index) => ({
    value: p.prescriptionId,
    label: `Prescription ${prescriptionHistory.length - index} — ${moment(p.startDate).format("DD MMM YYYY")} → ${moment(p.endDate).format("DD MMM YYYY")}`,
  })) || [];

  // Auto-select first prescription when history loads
  useEffect(() => {
    if (prescriptionHistory?.length > 0 && !selectedPrescriptionId) {
      setSelectedPrescriptionId(prescriptionHistory[0].prescriptionId);
    }
  }, [prescriptionHistory]);

  // Fetch activities whenever tab, prescription, or page changes
  useEffect(() => {
    if (!id || id === "*" || !selectedPrescriptionId) return;
    dispatch(
      getMedicineActivitiesByStatus({
        patientId: id,
        prescriptionId: selectedPrescriptionId,
        status: activeTab === "COMPLETED" ? "completed" : "missed",
        page,
        limit: LIMIT,
      })
    );
  }, [activeTab, id, selectedPrescriptionId, page, dispatch]);

  const pagination = medicines?.activities?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  const handlePrescriptionChange = (option) => {
    setSelectedPrescriptionId(option?.value || "");
    setPage(1);
  };

  return (
    <div>
      <Row className="timeline-right" style={{ rowGap: "2rem" }}>
        <GeneralCard data="Daily Medication Record">
          <div style={{ padding: "1rem" }}>
            {/* Prescription selector */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted mb-1">
                Select Prescription
              </label>
              {loading ? (
                <div className="text-muted small">Loading prescriptions…</div>
              ) : prescriptionHistory?.length > 0 ? (
                <Select
                  options={prescriptionOptions}
                  value={prescriptionOptions.find(
                    (o) => o.value === selectedPrescriptionId
                  ) || null}
                  onChange={handlePrescriptionChange}
                  placeholder="Select a prescription…"
                  isSearchable={false}
                  styles={{ container: (base) => ({ ...base, maxWidth: 480 }) }}
                />
              ) : (
                <div className="text-muted small">
                  No prescription history found
                </div>
              )}
            </div>

            <Nav tabs className="mb-4">
              <NavItem>
                <NavLink
                  className={`cursor-pointer ${
                    activeTab === "COMPLETED" ? "active" : ""
                  }`}
                  onClick={() => toggle("COMPLETED")}
                >
                  <div className="d-flex align-items-center gap-2">
                    <CheckCheck size={16} className="text-success" />
                    Completed
                  </div>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={`cursor-pointer ${
                    activeTab === "MISSED" ? "active" : ""
                  }`}
                  onClick={() => toggle("MISSED")}
                >
                  <div className="d-flex align-items-center gap-2">
                    <XCircle size={16} className="text-danger" />
                    Missed
                  </div>
                </NavLink>
              </NavItem>
            </Nav>

            {medicineLoading ? (
              <Placeholder />
            ) : activeTab === "COMPLETED" ? (
              <ActivityCard medicines={medicines} status="completed" />
            ) : (
              <ActivityCard medicines={medicines} status="missed" />
            )}

            {/* Pagination */}
            {!medicineLoading && totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <small className="text-muted">
                  Page {pagination.page} of {totalPages} &nbsp;·&nbsp; Total:{" "}
                  {pagination.total} date(s)
                </small>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </GeneralCard>
      </Row>

      <style jsx>{`
        .nav-tabs .nav-link.active {
          background-color: #fff;
          border-color: #dee2e6 #dee2e6 #fff;
          color: #495057;
          font-weight: 600;
        }

        .nav-tabs .nav-link {
          border: 1px solid transparent;
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
          color: #6c757d;
          padding: 0.75rem 1rem;
        }

        .nav-tabs .nav-link:hover {
          border-color: #e9ecef #e9ecef #dee2e6;
          isolation: isolate;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }

        .space-y-4 > * + * {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Activities;
