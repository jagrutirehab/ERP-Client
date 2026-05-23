import Flatpickr from "react-flatpickr";
import AsyncSelect from "react-select/async";
import "flatpickr/dist/themes/material_blue.css";
import { Button, ButtonGroup, Row, Col } from "reactstrap";
import { useSelector } from "react-redux";
import { SEVERITIES, SEVERITY_COLOR } from "./alertConstants";
import { endOfDay, startOfDay } from "date-fns";
import {
  getSearchPatients,
  listSopRules,
} from "../../../../helpers/backend_helper";

const READ_STATES = [
  { k: "all", label: "All" },
  { k: "unread", label: "Unread" },
  { k: "read", label: "Read" },
];

const PHASE_STATES = [
  { k: "all", label: "All" },
  { k: "IMMEDIATE", label: "Immediate" },
  { k: "DELAYED", label: "Delayed" },
];

const AlertsFilters = ({
  total,
  serverFilters,
  onServerFilterChange,
  onClearServerFilters,
  onToggleSeverity,
  onClearSeverity,
}) => {
  const centerAccess = useSelector((s) => s.User?.centerAccess);

  const hasAnyServerFilter =
    serverFilters.patients?.length > 0 ||
    serverFilters.rules?.length > 0 ||
    !!serverFilters.dateFrom ||
    !!serverFilters.dateTo ||
    serverFilters.readState !== "all" ||
    serverFilters.phase !== "all" ||
    serverFilters.severity?.length > 0;

  // ── Loaders for the AsyncSelect dropdowns ──

  // Patients: searches by name; respects center access scope. Empty input
  // returns no options (mirrors the existing patient search pattern).
  const loadPatientOptions = async (input) => {
    if (!input || input.trim().length < 1) return [];
    try {
      const res = await getSearchPatients({
        name: input,
        centerAccess: centerAccess?.map?.((c) => c._id) || centerAccess,
      });
      const list = res?.data || res?.payload || res || [];
      return list.map((p) => ({
        value: p._id,
        label: `${p.name}${p.id?.value ? ` (UID ${p.id.value})` : p.patientId ? ` (${p.patientId})` : ""}`,
      }));
    } catch (err) {
      console.warn("[AlertsFilters] patient search failed:", err?.message || err);
      return [];
    }
  };

  // SOP rules: searches by ruleName + protocol via the existing listSopRules
  // endpoint (regex match on ruleName). Empty input returns first page so the
  // user gets a starter set on first focus.
  const loadRuleOptions = async (input) => {
    try {
      const res = await listSopRules({ search: input || undefined });
      const list = res?.data || res?.payload || [];
      return list.map((r) => ({
        value: r._id,
        label: r.protocol
          ? `${r.ruleName} — ${r.protocol}`
          : r.ruleName,
      }));
    } catch (err) {
      console.warn("[AlertsFilters] rule search failed:", err?.message || err);
      return [];
    }
  };

  const handleDateChange = (dates) => {
    const dateFrom = dates?.[0];
    const dateTo = dates?.[1];
    if (!dateFrom || !dateTo) return;
    onServerFilterChange("dateFrom", startOfDay(dateFrom).toISOString());
    onServerFilterChange("dateTo", endOfDay(dateTo).toISOString());
  };

  const flatpickrValue = serverFilters.dateFrom
    ? [
        new Date(serverFilters.dateFrom),
        serverFilters.dateTo
          ? new Date(serverFilters.dateTo)
          : new Date(serverFilters.dateFrom),
      ]
    : [];

  return (
    <div className="mb-3 p-2 bg-light rounded">
      {/* Row 1 — Patient + SOP Rule multi-selects */}
      <Row className="g-2 mb-2 align-items-end">
        <Col md={5}>
          <small className="text-muted d-block mb-1">
            <i className="bx bx-user-circle me-1" />
            Patient
          </small>
          <AsyncSelect
            isMulti
            cacheOptions
            defaultOptions={false}
            loadOptions={loadPatientOptions}
            value={serverFilters.patients || []}
            onChange={(v) => onServerFilterChange("patients", v || [])}
            placeholder="Type patient name..."
            noOptionsMessage={({ inputValue }) =>
              inputValue ? "No patients found" : "Type to search..."
            }
          />
        </Col>
        <Col md={4}>
          <small className="text-muted d-block mb-1">
            <i className="bx bx-list-check me-1" />
            SOP Rule (name or protocol)
          </small>
          <AsyncSelect
            isMulti
            cacheOptions
            defaultOptions
            loadOptions={loadRuleOptions}
            value={serverFilters.rules || []}
            onChange={(v) => onServerFilterChange("rules", v || [])}
            placeholder="Type rule name or protocol..."
          />
        </Col>
        <Col md={3}>
          <small className="text-muted d-block mb-1">Date range</small>
          <Flatpickr
            key={serverFilters.dateFrom + "-" + serverFilters.dateTo}
            className="form-control form-control-sm"
            placeholder="Pick a date range..."
            options={{ mode: "range", dateFormat: "Y-m-d" }}
            value={flatpickrValue}
            onChange={handleDateChange}
          />
        </Col>
      </Row>

      {/* Row 2 — Read state + Phase + Severity + Clear */}
      <div className="d-flex flex-wrap gap-3 align-items-center">
        <ButtonGroup size="sm">
          {READ_STATES.map(({ k, label }) => (
            <Button
              key={k}
              color={serverFilters.readState === k ? "primary" : "secondary"}
              outline={serverFilters.readState !== k}
              onClick={() => onServerFilterChange("readState", k)}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>

        <div className="d-flex gap-1 align-items-center">
          <small className="text-muted me-1">Phase:</small>
          {PHASE_STATES.map(({ k, label }) => (
            <Button
              key={k}
              color={serverFilters.phase === k ? "primary" : "secondary"}
              outline={serverFilters.phase !== k}
              size="sm"
              onClick={() => onServerFilterChange("phase", k)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="d-flex gap-1 align-items-center">
          <small className="text-muted me-1">Severity:</small>
          {SEVERITIES.map((sev) => {
            const active = serverFilters.severity?.includes(sev);
            return (
              <Button
                key={sev}
                color={active ? SEVERITY_COLOR[sev] : "secondary"}
                outline={!active}
                size="sm"
                onClick={() => onToggleSeverity(sev)}
              >
                {sev}
              </Button>
            );
          })}
          {serverFilters.severity?.length > 0 && (
            <Button color="link" size="sm" onClick={onClearSeverity}>
              Clear
            </Button>
          )}
        </div>

        <div className="ms-auto d-flex gap-2 align-items-center">
          <small className="text-muted">
            {total} alert{total === 1 ? "" : "s"}
          </small>
          {hasAnyServerFilter && (
            <Button
              color="link"
              size="sm"
              onClick={onClearServerFilters}
              className="p-0"
            >
              <i className="bx bx-x-circle me-1" />
              Clear all filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsFilters;
