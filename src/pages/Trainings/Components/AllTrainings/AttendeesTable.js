import React, { useCallback, useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { getAdminSignedCopy, getTrainingProgressReport } from "../../../../helpers/backend_helper";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { getErrorMessage } from "../../Helpers/learnHelpers";
import {
  PAST_STATUS_FILTERS,
  STATUS_FILTERS,
  STATUS_STYLES,
  formatDate,
  formatDateTime,
  formatRelative,
} from "../../Helpers/adminTrainingHelpers";
import ExportButton from "../ExportButton";
import SignedCopyViewer from "../Declaration/SignedCopyViewer";
import { formatSigned } from "../../Helpers/declaration";
import StageStatus from "./StageStatus";

const PAGE_SIZE = 15;

const AttendeesTable = ({ trainingId, cycle, cntrs, isPast, onSummary }) => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedRange, setAppliedRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);
  const [viewing, setViewing] = useState(null);
  const token = JSON.parse(localStorage.getItem("micrologin") || "null")?.token;
  const { hasPermission } = usePermissions(token);
  const canViewSigned = hasPermission("TRAININGS", "ALL_TRAININGS", "WRITE");

  const requestKey = JSON.stringify([trainingId, cycle, cntrs, search, status, appliedRange, page]);
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
          section: "started",
          ...(cycle && { cycle }),
          cntrs,
          search,
          status,
          from: appliedRange.from || undefined,
          to: appliedRange.to || undefined,
          page,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setData(response?.data);
        if (onSummary) onSummary(response?.data?.summary);
      } catch (error) {
        if (cancelled) return;
        setData((current) => current && { ...current, rows: [] });
        toast.error(getErrorMessage(error, "Failed to load attendees"));
      } finally {
        if (!cancelled) setLoadedKey(requestKey);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [trainingId, cycle, cntrs, search, status, appliedRange, page]);

  const loadSigned = useCallback(
    () =>
      getAdminSignedCopy(trainingId, viewing?.employeeId, cycle ? { cycle } : undefined),
    [trainingId, viewing, cycle],
  );

  const summary = data?.summary;
  const rows = data?.rows || [];
  const pagination = data?.pagination;

  const chipCount = (key) => {
    if (!summary) return null;
    return key === "all" ? summary.started : summary.byStatus[key];
  };

  const changeStatus = (key) => {
    setStatus(key);
    setPage(1);
  };

  const applyRange = () => {
    setAppliedRange({ from, to });
    setPage(1);
  };

  const clearRange = () => {
    setFrom("");
    setTo("");
    setAppliedRange({ from: "", to: "" });
    setPage(1);
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {(isPast ? PAST_STATUS_FILTERS : STATUS_FILTERS).map((key) => {
          const count = chipCount(key);
          const active = status === key;
          const style = key === "all" ? null : STATUS_STYLES[key];
          return (
            <button
              key={key}
              type="button"
              className={`btn btn-sm rounded-pill ${active ? "btn-primary" : "btn-outline-secondary"}`}
              style={{ fontSize: 12, opacity: count === 0 && !active ? 0.55 : 1 }}
              onClick={() => changeStatus(key)}
            >
              {key === "all" ? "All" : style.label}
              {count !== null && (
                <span
                  className={`ms-1 badge rounded-pill ${active ? "bg-white text-primary" : "bg-primary text-white"}`}
                  style={{ fontSize: 10 }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
        <div style={{ width: 240 }}>
          <label className="form-label small mb-1">Search</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Name or e-code"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label small mb-1">Acknowledged between</label>
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: 150 }}
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: 150 }}
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={applyRange}>
              Apply
            </button>
            {(appliedRange.from || appliedRange.to) && (
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearRange}>
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="ms-auto d-flex align-items-center gap-3">
          {pagination && (
            <span className="text-muted small">
              {pagination.totalRecords} employee{pagination.totalRecords !== 1 ? "s" : ""}
            </span>
          )}
          <ExportButton
            trainingId={trainingId}
            params={{
              section: "started",
              ...(cycle && { cycle }),
              cntrs,
              search,
              status,
              from: appliedRange.from || undefined,
              to: appliedRange.to || undefined,
            }}
            disabled={!pagination?.totalRecords}
          />
        </div>
      </div>

      <div className="table-responsive" style={{ minHeight: 320 }}>
        <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
          <thead>
            <tr className="text-muted" style={{ fontSize: 12 }}>
              <th style={{ minWidth: 200 }}>Employee</th>
              <th style={{ minWidth: 300 }}>Status and stage</th>
              <th style={{ minWidth: 110 }}>Last activity</th>
              <th style={{ minWidth: 140 }}>Acknowledged</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-5">
                  <Spinner color="primary" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted text-center py-5">
                  No employees match these filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.employeeId}>
                  <td>
                    <div className="fw-semibold">{row.name}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {[row.eCode, row.center, row.position].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </td>
                  <td>
                    <StageStatus row={row} />
                    {(data?.hasDeclaration || data?.declarationInactive || row.declaration) && (
                      <div className="mt-2 d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: 12 }} data-testid="declaration-state">
                        {row.declarationFormat && <span className="badge bg-soft-secondary text-secondary">{row.declarationFormat.toUpperCase()}</span>}
                        {row.declaration === "signed" && (
                          <>
                            <span className="badge bg-success" title={formatSigned(row.signedAt)}>Signed</span>
                            {canViewSigned && (
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm py-0"
                                onClick={() => setViewing({ employeeId: row.employeeId, name: row.name })}
                              >
                                {row.declarationFormat === "docx" ? "Download signed copy" : "View signed copy"}
                              </button>
                            )}
                          </>
                        )}
                        {row.declaration === "read" && <span className="badge bg-info text-dark">Declaration read</span>}
                        {row.declaration === "pending" && <span className="badge bg-warning text-dark">Declaration pending</span>}
                        {row.declaration === "inactive" && <span className="badge bg-secondary">Declaration inactive</span>}
                        {!row.declaration && <span className="text-muted">Declaration: —</span>}
                      </div>
                    )}
                  </td>
                  <td className="text-muted" title={formatDateTime(row.lastActivityAt)}>
                    {formatRelative(row.lastActivityAt)}
                  </td>
                  <td>
                    {row.acknowledgedOn ? (
                      <>
                        <div className="text-success fw-medium">{formatDate(row.acknowledgedOn)}</div>
                        {row.score !== null && row.score !== undefined && (
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Score {row.score}%
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SignedCopyViewer
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Signed declaration: ${viewing.name}` : "Signed declaration"}
        loader={loadSigned}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span className="text-muted small">
            Page {pagination.page} of {pagination.totalPages} · {pagination.totalRecords} employees
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

export default AttendeesTable;
