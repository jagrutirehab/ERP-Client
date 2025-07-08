import React from "react";
import { CardHeader, Button } from "reactstrap";

const DBLogsHeader = ({ onRefresh, onToggleFilters, showFilters, loading }) => {
  return (
    <CardHeader className="d-flex justify-content-between align-items-center">
      <div>
        <h5 className="mb-0">
          <i className="fas fa-chart-line mr-2"></i>
          Activity Logs
        </h5>
        <small className="text-muted">
          Monitor system activities and user actions
        </small>
      </div>
      <div className="d-flex gap-2">
        <Button
          color="primary"
          outline
          onClick={onRefresh}
          disabled={loading}
          className="btn-sm"
          style={{ minWidth: "120px" }}
        >
          <i className="fas fa-sync-alt mr-1"></i>
          Refresh
        </Button>
        <Button
          color="outline-secondary"
          onClick={onToggleFilters}
          className="btn-sm"
          style={{ minWidth: "120px" }}
        >
          <i className="fas fa-filter mr-1"></i>
          {showFilters ? "Hide" : "Show"} Filters
          <i
            className={`fas fa-chevron-${showFilters ? "up" : "down"} ml-1`}
          ></i>
        </Button>
      </div>
    </CardHeader>
  );
};

export default DBLogsHeader;
