import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardBody,
  Collapse,
  Button,
  Badge,
  Input,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import { getSopSuggestedMedicines } from "../../../helpers/backend_helper";
import { mapSopMedicineToPrescription } from "./sopMedicineMapper";

const PRIORITY_COLOR = {
  EMERGENCY: "danger",
  URGENT: "warning",
  HIGH: "info",
  ROUTINE: "secondary",
};

const formatDays = (days) => {
  if (!Array.isArray(days) || days.length === 0) return "Throughout";
  const sorted = [...days].sort((a, b) => a - b);
  // Compress contiguous runs into "Day a–b".
  const runs = [];
  let runStart = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === prev + 1) {
      prev = sorted[i];
      continue;
    }
    runs.push(runStart === prev ? `Day ${runStart}` : `Day ${runStart}–${prev}`);
    runStart = sorted[i];
    prev = sorted[i];
  }
  runs.push(runStart === prev ? `Day ${runStart}` : `Day ${runStart}–${prev}`);
  return runs.join(", ");
};

const formatDose = (d = {}) =>
  `${d.morning || "0"}-${d.evening || "0"}-${d.night || "0"}${d.unit ? ` ${d.unit}` : ""}`;

const SopSuggestedMedicines = ({ patientId, existingMedicines, onPopulate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daysSinceAdmission, setDaysSinceAdmission] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!patientId) return;

    setLoading(true);
    setError(null);
    // Pass the client's local calendar date so the day-of-admission count
    // reflects the clinician's perspective, immune to server-timezone drift.
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    getSopSuggestedMedicines(patientId, today)
      .then((res) => {
        if (cancelled) return;
        setDaysSinceAdmission(res?.daysSinceAdmission ?? null);
        const list = Array.isArray(res?.data) ? res.data : [];
        setSuggestions(list);
        // Default-check every suggestion.
        const init = {};
        list.forEach((m, i) => {
          init[m.medicine || `idx-${i}`] = true;
        });
        setSelected(init);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[SopSuggestedMedicines] fetch failed:", err?.message || err);
        setError("Failed to load SOP suggestions");
        setSuggestions([]);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const existingNames = useMemo(
    () =>
      new Set(
        (existingMedicines || [])
          .map((m) => m?.medicine?.name?.toLowerCase?.().trim())
          .filter(Boolean),
      ),
    [existingMedicines],
  );

  const keyOf = (m, i) => m.medicine || `idx-${i}`;

  const toggle = (key) => setSelected((s) => ({ ...s, [key]: !s[key] }));

  const selectedCount = suggestions.filter((m, i) => selected[keyOf(m, i)]).length;

  const handlePopulate = () => {
    const chosen = suggestions
      .filter((m, i) => selected[keyOf(m, i)])
      .map(mapSopMedicineToPrescription)
      // Drop suggestions whose medicine name is already in the table — matches
      // the dedupe rule in Prescription.js#addMdicine.
      .filter((m) => {
        const name = m?.medicine?.name?.toLowerCase?.().trim();
        return name && !existingNames.has(name);
      });

    if (chosen.length === 0) return;
    onPopulate?.(chosen);
  };

  // Nothing to show — collapse out of the DOM entirely.
  if (loading) {
    return (
      <Card className="border-info mb-3">
        <CardBody className="d-flex align-items-center gap-2 py-2">
          <Spinner size="sm" color="info" />
          <span className="text-muted small">Checking SOP suggestions...</span>
        </CardBody>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="border-danger mb-3">
        <CardBody className="py-2 small text-danger">{error}</CardBody>
      </Card>
    );
  }
  if (daysSinceAdmission === null || suggestions.length === 0) return null;

  return (
    <Card className="border-info mb-3">
      <CardHeader
        className="d-flex justify-content-between align-items-center bg-light"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="fw-semibold">
          Suggested by SOP ({suggestions.length})
          <span className="text-muted ms-2 small">
            — Day {daysSinceAdmission} of admission
          </span>
        </span>
        <i className={`bx bx-chevron-${open ? "up" : "down"}`} style={{ fontSize: "1.25rem" }} />
      </CardHeader>
      <Collapse isOpen={open}>
        <CardBody className="p-2">
          {suggestions.map((m, i) => {
            const key = keyOf(m, i);
            const snap = m.medicineSnapshot || {};
            const label =
              [snap.type, snap.name, snap.strength, snap.unit]
                .filter(Boolean)
                .join(" ") || "(Medicine)";
            const priorityColor = PRIORITY_COLOR[m.priority] || "secondary";
            const alreadyPresent = existingNames.has(snap.name?.toLowerCase?.().trim());
            const tooltipId = `sop-sugg-${i}-tip`;

            return (
              <div
                key={key}
                className="d-flex align-items-start gap-2 p-2 border-bottom"
              >
                <Input
                  type="checkbox"
                  checked={!!selected[key]}
                  onChange={() => toggle(key)}
                  disabled={alreadyPresent}
                  className="mt-1"
                />
                <div className="flex-grow-1">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span className="fw-semibold">{label}</span>
                    {m.priority && (
                      <Badge color={priorityColor} pill className="text-uppercase">
                        {m.priority}
                      </Badge>
                    )}
                    {m.category && (
                      <Badge color="light" className="text-dark border">
                        {m.category}
                      </Badge>
                    )}
                    {alreadyPresent && (
                      <Badge color="success" pill>
                        Already added
                      </Badge>
                    )}
                  </div>
                  <div className="small text-muted mt-1">
                    <span className="me-3">
                      <strong>Dose:</strong> {formatDose(m.dosageAndFrequency)}
                    </span>
                    <span className="me-3">
                      <strong>Intake:</strong> {m.intake || "—"}
                    </span>
                    <span className="me-3">
                      <strong>Days:</strong> {formatDays(m.applicableDays)}
                    </span>
                  </div>
                  {(m.sourceRule?.ruleName || m.rationale) && (
                    <div className="small text-muted mt-1">
                      {m.sourceRule?.ruleName && (
                        <span className="me-2">
                          <i className="bx bx-bookmark" /> {m.sourceRule.ruleName}
                        </span>
                      )}
                      {m.rationale && (
                        <>
                          <i
                            id={tooltipId}
                            className="bx bx-info-circle text-info"
                            style={{ cursor: "help" }}
                          />
                          <UncontrolledTooltip placement="right" target={tooltipId}>
                            {m.rationale}
                          </UncontrolledTooltip>
                        </>
                      )}
                    </div>
                  )}
                  {m.instructions && (
                    <div className="small text-muted fst-italic mt-1">
                      {m.instructions}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="d-flex justify-content-end mt-2 gap-2">
            <Button
              type="button"
              size="sm"
              color="primary"
              outline
              disabled={selectedCount === 0}
              onClick={handlePopulate}
            >
              Populate Selected ({selectedCount})
            </Button>
          </div>
        </CardBody>
      </Collapse>
    </Card>
  );
};

SopSuggestedMedicines.propTypes = {
  patientId: PropTypes.string,
  existingMedicines: PropTypes.array,
  onPopulate: PropTypes.func.isRequired,
};

export default SopSuggestedMedicines;
