import { Button, ButtonGroup, Input } from "reactstrap";
import { SEVERITIES, SEVERITY_COLOR } from "../../../Alerts/components/alertConstants";
import { SOP_CATEGORY_OPTIONS } from "../../../../Components/constants/sopConstants";

const ManageRulesFilters = ({
  counts,
  search,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  severityFilter,
  onToggleSeverity,
  onClearSeverity,
}) => {
  const activeButtons = [
    { k: "all", label: `All (${counts.total})` },
    { k: "active", label: `Active (${counts.active})` },
    { k: "inactive", label: `Inactive (${counts.inactive})` },
  ];

  return (
    <div className="d-flex flex-wrap gap-3 align-items-center mb-3 p-2 bg-light rounded">
      <Input
        type="text"
        placeholder="Search by SOP name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 260 }}
        bsSize="sm"
      />

      <ButtonGroup size="sm">
        {activeButtons.map(({ k, label }) => (
          <Button
            key={k}
            color={activeFilter === k ? "primary" : "secondary"}
            outline={activeFilter !== k}
            onClick={() => onActiveFilterChange(k)}
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>

      <Input
        type="select"
        bsSize="sm"
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value)}
        style={{ width: 220 }}
        aria-label="Filter by SOP category"
      >
        <option value="all">All categories</option>
        {SOP_CATEGORY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value="UNCATEGORISED">No category</option>
      </Input>

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

export default ManageRulesFilters;
