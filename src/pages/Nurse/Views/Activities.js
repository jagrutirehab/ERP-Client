import { useCallback, useEffect, useState } from "react";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import { Row, Nav, NavItem, NavLink, Badge } from "reactstrap";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import { CheckCheck, XCircle, Undo2, Clock } from "lucide-react";
import moment from "moment";
import Select from "react-select";
import { getDailyMedicationRecord } from "../../../helpers/backend_helper";

const STATUS_META = {
  completed: { label: "Completed", color: "success", Icon: CheckCheck },
  missed: { label: "Missed", color: "danger", Icon: XCircle },
  retrieved: { label: "Retrieved", color: "warning", Icon: Undo2 },
  pending: { label: "Pending", color: "secondary", Icon: Clock },
};

const TABS = ["completed", "missed", "retrieved"];
const SLOT_ORDER = { morning: 0, evening: 1, night: 2 };

const Activities = () => {
  const { id } = useParams();
  const [days, setDays] = useState([]);
  const [record, setRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState("completed");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!id || id === "*") return;
    setLoading(true);
    getDailyMedicationRecord({ patientId: id, date: selectedDate })
      .then((res) => {
        setDays(res?.days || []);
        setRecord(res?.record || null);
        // Server falls back to the newest day when none was asked for.
        if (!selectedDate && res?.record?.date) {
          setSelectedDate(res.record.date);
        }
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to load medication record");
        setDays([]);
        setRecord(null);
      })
      .finally(() => setLoading(false));
  }, [id, selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  const dayOptions = days.map((d) => ({
    value: d.date,
    // Tomorrow is in the list because its box is filled today — that is the
    // day the nurse is actually working on.
    label:
      moment(d.date).format("DD MMM YYYY") +
      (d.isTomorrow ? " (Tomorrow)" : d.isToday ? " (Today)" : ""),
  }));

  const counts = record?.counts || {};
  const shown = (record?.medicines || [])
    .filter((m) => m.status === activeTab)
    .sort((a, b) => (SLOT_ORDER[a.slot] ?? 9) - (SLOT_ORDER[b.slot] ?? 9));

  return (
    <div>
      <Row className="timeline-right" style={{ rowGap: "2rem" }}>
        <GeneralCard data="Daily Medication Record">
          <div style={{ padding: "1rem" }}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted mb-1">
                Select Day
              </label>
              {loading && !days.length ? (
                <div className="text-muted small">Loading days…</div>
              ) : days.length ? (
                <Select
                  options={dayOptions}
                  value={dayOptions.find((o) => o.value === selectedDate) || null}
                  onChange={(option) => {
                    setSelectedDate(option?.value || null);
                    setActiveTab("completed");
                  }}
                  placeholder="Select a day…"
                  isSearchable={false}
                  styles={{ container: (base) => ({ ...base, maxWidth: 480 }) }}
                />
              ) : (
                <div className="text-muted small">No medication days yet</div>
              )}
            </div>

            <Nav tabs className="mb-4">
              {TABS.map((key) => {
                const { label, color, Icon } = STATUS_META[key];
                return (
                  <NavItem key={key}>
                    <NavLink
                      className={`cursor-pointer ${activeTab === key ? "active" : ""}`}
                      onClick={() => setActiveTab(key)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <Icon size={16} className={`text-${color}`} />
                        {label}
                        {counts[key] > 0 && (
                          <Badge color={color} pill>
                            {counts[key]}
                          </Badge>
                        )}
                      </div>
                    </NavLink>
                  </NavItem>
                );
              })}
            </Nav>

            {loading ? (
              <Placeholder />
            ) : !record ? (
              <div className="text-center py-5">
                <Clock size={40} className="text-muted mb-3" />
                <h6 className="mb-1">No medication record</h6>
                <p className="text-muted small mb-0">
                  Days appear here once medicines are prescribed
                </p>
              </div>
            ) : !shown.length ? (
              <div className="text-center py-5">
                <h6 className="mb-1">
                  No {STATUS_META[activeTab].label} medications
                </h6>
                <p className="text-muted small mb-0">
                  {record.counts.total === 0
                    ? "No medicines were due on this day"
                    : `Nothing ${STATUS_META[activeTab].label.toLowerCase()} on ${moment(record.date).format("DD MMM, YYYY")}`}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Slot</th>
                      <th>Dosage</th>
                      <th>Intake</th>
                      <th>Prescribed by</th>
                      <th>Marked at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((med, idx) => (
                      <tr key={`${med.medicineName}-${med.slot}-${idx}`}>
                        <td>{med.medicineName}</td>
                        <td className="text-capitalize">{med.slot}</td>
                        <td>{med.dosage}</td>
                        <td>{med.intake || "-"}</td>
                        <td>{med.prescribedBy || "-"}</td>
                        <td>
                          {med.takenAt
                            ? moment(med.takenAt).format("DD MMM YYYY, hh:mm A")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      `}</style>
    </div>
  );
};

export default Activities;
