import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Button, ButtonGroup, Input, Row, Col } from "reactstrap";
import { SEVERITIES, SEVERITY_COLOR } from "./alertConstants";

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
  const hasAnyServerFilter =
    !!serverFilters.search ||
    !!serverFilters.dateFrom ||
    !!serverFilters.dateTo ||
    serverFilters.readState !== "all" ||
    serverFilters.phase !== "all" ||
    serverFilters.severity?.length > 0;

  const handleDateChange = (dates) => {
    console.log("------------------");
    console.log({ dates });
    console.log("------------------");

    const dateFrom = dates?.[0];
    const dateTo = dates?.[1];
    if (!dateFrom || !dateTo) {
      return;
    }
    onServerFilterChange("dateFrom", dateFrom);
    onServerFilterChange("dateTo", dateTo);
  };

  // Flatpickr expects an array of Date objects (or empty)
  const flatpickrValue = serverFilters.dateFrom
    ? [
        new Date(serverFilters.dateFrom),
        serverFilters.dateTo
          ? new Date(serverFilters.dateTo)
          : new Date(serverFilters.dateFrom),
      ]
    : [];

  console.log("------------------");
  console.log({ flatpickrValue });
  console.log("------------------");

  return (
    <div className="mb-3 p-2 bg-light rounded">
      {/* Row 1 — Search + Date range */}
      <Row className="g-2 mb-2 align-items-end">
        <Col md={7}>
          <small className="text-muted d-block mb-1">
            Search (patient name, UID, SOP name, protocol)
          </small>
          <Input
            type="text"
            placeholder="Type to search..."
            value={serverFilters.search}
            onChange={(e) => onServerFilterChange("search", e.target.value)}
            bsSize="sm"
          />
        </Col>
        <Col md={5}>
          <small className="text-muted d-block mb-1">Date range</small>
          <Flatpickr
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
