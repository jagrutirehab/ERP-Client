import { Button, ButtonGroup } from "reactstrap";
import { SEVERITIES, SEVERITY_COLOR } from "./alertConstants";

const AlertsFilters = ({
  counts,
  readFilter, onReadFilterChange,
  phaseFilter, onPhaseFilterChange,
  severityFilter, onToggleSeverity, onClearSeverity,
}) => {
  const readButtons = [
    { k: "all",    label: `All (${counts.total})` },
    { k: "unread", label: `Unread (${counts.unread})` },
    { k: "read",   label: `Read (${counts.total - counts.unread})` },
  ];

  const phaseButtons = [
    { k: "all",       label: "All" },
    { k: "IMMEDIATE", label: `Immediate (${counts.immediate})` },
    { k: "DELAYED",   label: `Delayed (${counts.delayed})` },
  ];

  return (
    <div className="d-flex flex-wrap gap-3 align-items-center mb-3 p-2 bg-light rounded">
      <ButtonGroup size="sm">
        {readButtons.map(({ k, label }) => (
          <Button
            key={k}
            color={readFilter === k ? "primary" : "secondary"}
            outline={readFilter !== k}
            onClick={() => onReadFilterChange(k)}
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>

      <div className="d-flex gap-1 align-items-center">
        <small className="text-muted me-1">Phase:</small>
        {phaseButtons.map(({ k, label }) => (
          <Button
            key={k}
            color={phaseFilter === k ? "primary" : "secondary"}
            outline={phaseFilter !== k}
            size="sm"
            onClick={() => onPhaseFilterChange(k)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="d-flex gap-1 align-items-center">
        <small className="text-muted me-1">Severity:</small>
        {SEVERITIES.map((sev) => {
          const active = severityFilter.includes(sev);
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
        {severityFilter.length > 0 && (
          <Button color="link" size="sm" onClick={onClearSeverity}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default AlertsFilters;
