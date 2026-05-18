import { Button, Card, CardHeader, Spinner } from "reactstrap";
import RuleRow from "./RuleRow";

const RulesList = ({
  filtered,
  filteredCount,
  loading,
  emptyStateShowCreate,
  onCreate,
  onPreview,
  onToggleActive,
  onEdit,
  onDelete,
}) => (
  <Card style={{ overflow: "hidden" }}>
    <CardHeader className="fw-semibold py-2 d-flex justify-content-between align-items-center">
      <span><i className="bx bx-list-ul me-1" />Rules</span>
      <small className="text-muted">{filteredCount} shown</small>
    </CardHeader>
    <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
      {loading && filteredCount === 0 ? (
        <div className="text-center text-muted py-5">
          <Spinner size="sm" /> <span className="ms-2">Loading...</span>
        </div>
      ) : filteredCount === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bx bx-folder-open display-5 d-block mb-2" />
          No rules match these filters.
          {emptyStateShowCreate && (
            <div className="mt-2">
              <Button color="primary" size="sm" onClick={onCreate}>
                Create your first rule
              </Button>
            </div>
          )}
        </div>
      ) : (
        filtered.map((r) => (
          <RuleRow
            key={r._id}
            rule={r}
            onPreview={onPreview}
            onToggleActive={onToggleActive}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  </Card>
);

export default RulesList;
