import React from "react";
import { Table, Badge, Spinner } from "reactstrap";
import { format } from "date-fns";

const DBLogsTable = ({ data, loading }) => {
  // Get action badge color and icon
  const getActionBadge = (action) => {
    switch (action?.toLowerCase()) {
      case "delete":
        return { color: "danger", icon: "🗑️", text: "Delete" };
      case "update":
        return { color: "warning", icon: "✏️", text: "Update" };
      case "create":
        return { color: "success", icon: "➕", text: "Create" };
      default:
        return { color: "secondary", icon: "📝", text: action || "Unknown" };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading logs...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-database fa-3x text-muted mb-3"></i>
        <h5 className="text-muted">No logs found</h5>
        <p className="text-muted">No activity logs available</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped hover className="mb-0">
        <thead className="thead-light">
          <tr>
            <th>
              <i className="fas fa-clock mr-1"></i>#
            </th>
            <th>
              <i className="fas fa-clock mr-1"></i>
              Timestamp
            </th>
            <th>
              <i className="fas fa-chart-line mr-1"></i>
              Action
            </th>
            <th>
              <i className="fas fa-database mr-1"></i>
              Collection
            </th>
            <th>
              <i className="fas fa-id-card mr-1"></i>
              UID
            </th>
            <th>
              <i className="fas fa-database mr-1"></i>
              Source
            </th>
            <th>Details</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((log, index) => {
            const actionBadge = getActionBadge(log.action);
            const timestamp = log.date;

            return (
              <tr key={log._id || index}>
                <td>
                  <div className="d-flex flex-column">
                    <small className="text-muted">{index + 1}</small>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <small className="text-muted">
                      {timestamp &&
                        format(new Date(timestamp), "dd/MM/yyyy hh:mm a")}
                    </small>
                  </div>
                </td>
                <td>
                  <Badge
                    color={actionBadge.color}
                    className="d-flex align-items-center"
                  >
                    <span className="mr-1">{actionBadge.icon}</span>
                    {actionBadge.text}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <Badge color="info" className="mr-2">
                      {log.collectionName || "Unknown"}
                    </Badge>
                    {log.documentId && (
                      <small className="text-muted">ID: {log.documentId}</small>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <small className="text-muted">{log.uid || "N/A"}</small>
                  </div>
                </td>
                <td>
                  <Badge color="info" outline>
                    {log.source || "System"}
                  </Badge>
                </td>
                <td>
                  <small className="text-muted">
                    {log.note || "No description"}
                  </small>
                </td>
                <td>
                  {log.updatedFields &&
                    Object.keys(log.updatedFields).length > 0 && (
                      <div className="mb-1">
                        <small className="text-success">
                          <strong>Updated:</strong>{" "}
                          {Object.keys(log.updatedFields).join(", ")}
                        </small>
                      </div>
                    )}
                  {log.removedFields && log.removedFields.length > 0 && (
                    <div>
                      <small className="text-danger">
                        <strong>Removed:</strong> {log.removedFields.join(", ")}
                      </small>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default DBLogsTable;
