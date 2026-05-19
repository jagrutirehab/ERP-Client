import { Card, CardHeader, Spinner } from "reactstrap";
import AlertRow from "./AlertRow";

const AlertsList = ({ grouped, filteredCount, loading, onSelect }) => (
  <Card style={{ overflow: "hidden" }}>
    <CardHeader className="fw-semibold py-2 d-flex justify-content-between align-items-center">
      <span><i className="bx bx-inbox me-1" />Inbox</span>
      <small className="text-muted">{filteredCount} shown</small>
    </CardHeader>
    <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
      {loading && filteredCount === 0 ? (
        <div className="text-center text-muted py-5">
          <Spinner size="sm" /> <span className="ms-2">Loading...</span>
        </div>
      ) : filteredCount === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bx bx-bell-off display-5 d-block mb-2" />
          No alerts match these filters.
        </div>
      ) : (
        grouped.map(([label, items]) => (
          <div key={label}>
            <div
              className="px-3 py-1 bg-light border-bottom small text-muted fw-semibold sticky-top"
              style={{ top: 0, zIndex: 1 }}
            >
              {label}
            </div>
            {items.map((a) => (
              <AlertRow key={a._id} alert={a} onClick={onSelect} />
            ))}
          </div>
        ))
      )}
    </div>
  </Card>
);

export default AlertsList;
