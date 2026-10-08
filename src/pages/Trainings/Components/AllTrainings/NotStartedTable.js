import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { getTrainingProgressReport } from "../../../../helpers/backend_helper";
import { getErrorMessage } from "../../Helpers/learnHelpers";
import ExportButton from "../ExportButton";

const PAGE_SIZE = 20;

const NotStartedTable = ({ trainingId, cycle, cntrs, onSummary }) => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);

  const requestKey = JSON.stringify([trainingId, cycle, cntrs, search, page]);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [cntrs]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getTrainingProgressReport(trainingId, {
          section: "not_started",
          ...(cycle && { cycle }),
          cntrs,
          search,
          page,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setData(response?.data);
        if (onSummary) onSummary(response?.data?.summary);
      } catch (error) {
        if (cancelled) return;
        setData((current) => current && { ...current, rows: [] });
        toast.error(getErrorMessage(error, "Failed to load employees"));
      } finally {
        if (!cancelled) setLoadedKey(requestKey);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [trainingId, cycle, cntrs, search, page]);

  const rows = data?.rows || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
        <div style={{ width: 260 }}>
          <label className="form-label small mb-1">Search</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Name or e-code"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="d-flex align-items-center gap-3">
          {pagination && (
            <span className="text-muted small">
              {pagination.totalRecords} employee{pagination.totalRecords !== 1 ? "s" : ""} have not started
            </span>
          )}
          <ExportButton
            trainingId={trainingId}
            params={{ section: "not_started", ...(cycle && { cycle }), cntrs, search }}
            disabled={!pagination?.totalRecords}
          />
        </div>
      </div>

      <div className="table-responsive" style={{ minHeight: 320 }}>
        <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
          <thead>
            <tr className="text-muted" style={{ fontSize: 12 }}>
              <th>Employee</th>
              <th>E-Code</th>
              <th>Email</th>
              <th>Center</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-5">
                  <Spinner color="primary" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted text-center py-5">
                  Everyone in this audience has started the training.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.employeeId}>
                  <td className="fw-semibold">{row.name}</td>
                  <td className="text-muted">{row.eCode || "—"}</td>
                  <td className="text-muted">{row.email || "—"}</td>
                  <td className="text-muted">{row.center || "—"}</td>
                  <td className="text-muted">{row.position || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
          <button className="btn btn-outline-primary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ← Previous
          </button>
          <span className="text-muted small">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotStartedTable;
