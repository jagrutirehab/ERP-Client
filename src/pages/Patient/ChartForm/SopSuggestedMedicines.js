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
  Table,
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

const SopSuggestedMedicines = ({ patientId, existingMedicines, onPopulate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daysSinceAdmission, setDaysSinceAdmission] = useState(null);
  const [groups, setGroups] = useState([]);
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
        const grps = Array.isArray(res?.groups) ? res.groups : [];
        setGroups(grps);
        // Default-check every suggestion.
        const init = {};
        grps.forEach((g) =>
          (g.medicines || []).forEach((m, i) => {
            init[m.medicine || `${g._id || g.ruleName}-${i}`] = true;
          }),
        );
        setSelected(init);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[SopSuggestedMedicines] fetch failed:", err?.message || err);
        setError("Failed to load SOP suggestions");
        setGroups([]);
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

  const keyOf = (m, groupId, i) => m.medicine || `${groupId}-${i}`;

  const isRowSelectable = (m) =>
    !existingNames.has(m.medicineSnapshot?.name?.toLowerCase?.().trim());

  const toggle = (key) => setSelected((s) => ({ ...s, [key]: !s[key] }));

  const allMedicines = useMemo(
    () =>
      groups.flatMap((g) =>
        (g.medicines || []).map((m, i) => ({
          med: m,
          key: keyOf(m, g._id || g.ruleName, i),
        })),
      ),
    [groups],
  );

  const selectableKeys = useMemo(
    () =>
      allMedicines.filter((x) => isRowSelectable(x.med)).map((x) => x.key),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allMedicines, existingNames],
  );

  const allSelected =
    selectableKeys.length > 0 && selectableKeys.every((k) => selected[k]);

  const toggleAll = () => {
    setSelected((s) => {
      const next = { ...s };
      const target = !allSelected;
      selectableKeys.forEach((k) => {
        next[k] = target;
      });
      return next;
    });
  };

  const groupSelectionState = (group) => {
    const keys = (group.medicines || [])
      .map((m, i) => ({
        key: keyOf(m, group._id || group.ruleName, i),
        ok: isRowSelectable(m),
      }))
      .filter((x) => x.ok)
      .map((x) => x.key);
    if (keys.length === 0) return { keys, allOn: false, anyOn: false };
    const allOn = keys.every((k) => selected[k]);
    const anyOn = keys.some((k) => selected[k]);
    return { keys, allOn, anyOn };
  };

  const toggleGroup = (keys, target) => {
    setSelected((s) => {
      const next = { ...s };
      keys.forEach((k) => {
        next[k] = target;
      });
      return next;
    });
  };

  const selectedCount = allMedicines.filter((x) => selected[x.key]).length;

  const handlePopulate = () => {
    const chosen = allMedicines
      .filter((x) => selected[x.key])
      .map((x) => mapSopMedicineToPrescription(x.med))
      // Drop suggestions whose medicine name is already in the table — matches
      // the dedupe rule in Prescription.js#addMdicine.
      .filter((m) => {
        const name = m?.medicine?.name?.toLowerCase?.().trim();
        return name && !existingNames.has(name);
      });

    if (chosen.length === 0) return;
    onPopulate?.(chosen);
  };

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
  if (daysSinceAdmission === null || allMedicines.length === 0) return null;

  return (
    <Card className="border-info mb-3">
      <CardHeader
        className="d-flex justify-content-between align-items-center bg-light"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="fw-semibold">
          Suggested by SOP ({allMedicines.length})
          <span className="text-muted ms-2 small">
            — Day {daysSinceAdmission} of admission
          </span>
        </span>
        <i
          className={`bx bx-chevron-${open ? "up" : "down"}`}
          style={{ fontSize: "1.25rem" }}
        />
      </CardHeader>
      <Collapse isOpen={open}>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table
              className="mb-0 align-middle sop-suggested-table"
              size="sm"
              hover
            >
              <thead className="table-light">
                <tr>
                  <th style={{ width: "40px" }} className="text-center">
                    <Input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      disabled={selectableKeys.length === 0}
                      aria-label="Select all"
                    />
                  </th>
                  <th>Medicine</th>
                  <th style={{ width: "130px" }}>Dose (M-A-E)</th>
                  <th style={{ width: "110px" }}>Intake</th>
                  <th style={{ width: "150px" }}>Days</th>
                  <th style={{ width: "110px" }}>Priority</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const { keys, allOn, anyOn } = groupSelectionState(group);
                  const headerCheckboxRef = (el) => {
                    if (el) el.indeterminate = !allOn && anyOn;
                  };
                  const groupKey = group._id || group.ruleName;

                  return (
                    <React.Fragment key={groupKey}>
                      <tr
                        className="sop-group-header"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(13,110,253,0.08) 0%, rgba(13,110,253,0.02) 100%)",
                          borderLeft: "3px solid #0d6efd",
                        }}
                      >
                        <td className="text-center">
                          <Input
                            type="checkbox"
                            innerRef={headerCheckboxRef}
                            checked={allOn}
                            onChange={() => toggleGroup(keys, !allOn)}
                            disabled={keys.length === 0}
                            aria-label={`Select all from ${group.ruleName}`}
                          />
                        </td>
                        <td colSpan={6}>
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <i
                              className="bx bx-bookmark text-primary"
                              style={{ fontSize: "1rem" }}
                            />
                            <span className="fw-semibold text-primary">
                              {group.ruleName}
                            </span>
                            {group.protocol && (
                              <Badge
                                color="primary"
                                className="bg-primary-subtle text-primary border border-primary-subtle"
                              >
                                {group.protocol}
                              </Badge>
                            )}
                            <span className="text-muted small ms-auto">
                              {group.count} medicine
                              {group.count === 1 ? "" : "s"}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {(group.medicines || []).map((m, i) => {
                        const key = keyOf(m, groupKey, i);
                        const snap = m.medicineSnapshot || {};
                        const priorityColor =
                          PRIORITY_COLOR[m.priority] || "secondary";
                        const alreadyPresent = existingNames.has(
                          snap.name?.toLowerCase?.().trim(),
                        );
                        const tooltipId = `sop-sugg-${groupKey}-${i}-tip`;

                        return (
                          <tr
                            key={key}
                            className={alreadyPresent ? "table-success" : ""}
                          >
                            <td className="text-center">
                              <Input
                                type="checkbox"
                                checked={!!selected[key]}
                                onChange={() => toggle(key)}
                                disabled={alreadyPresent}
                              />
                            </td>
                            <td>
                              <div className="fw-semibold">
                                {m.display?.name}
                              </div>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {m.category && (
                                  <Badge
                                    color="light"
                                    className="text-dark border"
                                  >
                                    {m.category}
                                  </Badge>
                                )}
                                {alreadyPresent && (
                                  <Badge color="success" pill>
                                    Already added
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="font-monospace">
                                {m.display?.dose}
                              </span>
                            </td>
                            <td>{m.intake || "—"}</td>
                            <td>{m.display?.days}</td>
                            <td>
                              {m.priority ? (
                                <Badge
                                  color={priorityColor}
                                  pill
                                  className="text-uppercase"
                                >
                                  {m.priority}
                                </Badge>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              {m.rationale && (
                                <span
                                  id={tooltipId}
                                  className="d-inline-flex align-items-center small text-info"
                                  style={{ cursor: "help" }}
                                >
                                  <i className="bx bx-info-circle me-1" />
                                  Rationale
                                  <UncontrolledTooltip
                                    placement="right"
                                    target={tooltipId}
                                  >
                                    {m.rationale}
                                  </UncontrolledTooltip>
                                </span>
                              )}
                              {m.instructions && (
                                <div className="small text-muted fst-italic">
                                  {m.instructions}
                                </div>
                              )}
                              {!m.rationale && !m.instructions && (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-end p-2 border-top">
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
