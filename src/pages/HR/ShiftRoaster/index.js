
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardBody, Spinner, Button, Input, InputGroup, InputGroupText } from "reactstrap";
import { Search, Pencil } from "lucide-react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";
import { startOfWeek } from "date-fns";
import { getEmployeeReportings } from "../../../helpers/backend_helper";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import Header from "../../Report/Components/Header";
import { DAY_LABELS, SHIFT_STYLES } from "../../../Components/constants/HRMS";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const LIMIT = 10;

const ShiftRoaster = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const user = useSelector((s) => s.User);

  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [rosterData, setRosterData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalDocs: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [rosterLoading, setRosterLoading] = useState(false);

  // debounce search input → search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [reportDate, setReportDate] = useState(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
    return { start: ws, end: addDays(ws, 6) };
  });

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const {
    hasPermission,
    loading: permissionLoader,
  } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "SHIFT_ROSTER", "READ");
  const hasWritePermission = hasPermission("HR", "SHIFT_ROSTER", "WRITE") || hasPermission("HR", "SHIFT_ROSTER", "DELETE");

  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [{ value: "ALL", label: "All Centers" }]
      : []),
    ...(user?.centerAccess?.map((id) => {
      const center = user?.userCenters?.find((c) => c._id === id);
      return { value: id, label: center?.title || "Unknown Center" };
    }) || []),
  ];

  const selectedCenterOption = centerOptions.find(
    (opt) => opt.value === selectedCenter
  ) || centerOptions[0];

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      !user?.centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [selectedCenter, user?.centerAccess]);

  const startDate = reportDate.start ? format(reportDate.start, "yyyy-MM-dd") : null;
  const endDate = reportDate.end ? format(reportDate.end, "yyyy-MM-dd") : null;

  // build date columns from the selected range
  const dateColumns = useMemo(() => {
    if (!reportDate.start || !reportDate.end) return [];
    const cols = [];
    let cur = new Date(reportDate.start);
    const end = new Date(reportDate.end);
    while (cur <= end) {
      cols.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    return cols;
  }, [reportDate]);

  useEffect(() => {
    if (!startDate || !endDate || !hasUserPermission) return;
    let cancelled = false;
    setRosterLoading(true);
    const centers = selectedCenter === "ALL"
      ? user?.centerAccess
      : !user?.centerAccess?.length ? [] : [selectedCenter];
    getEmployeeReportings({ status: "ALL", shiftType: "ROTATIONAL", limit: LIMIT, page, startDate, endDate, tz, centers, ...(search ? { search } : {}) })
      .then((res) => {
        if (!cancelled) {
          setRosterData(res?.data || []);
          if (res?.pagination) setPagination(res.pagination);
        }
      })
      .catch(() => { })
      .finally(() => { if (!cancelled) setRosterLoading(false); });
    return () => { cancelled = true; };
  }, [startDate, endDate, selectedCenter, page, search, hasUserPermission, user?.centerAccess]);

  useEffect(() => { setPage(1); }, [startDate, endDate, selectedCenter, search]);

  const shiftMap = useMemo(() => {
    return rosterData.map((r) => {
      const shifts = {};
      (r.rotationalShifts || []).forEach((s) => {
        if (!s.date) return;
        shifts[s.date.substring(0, 10)] = { type: "shift", start: s.start, end: s.end, shift: s.shift };
      });
      const leaves = {};
      (r.leaves || []).forEach((l) => {
        if (!l.date) return;
        leaves[l.date.substring(0, 10)] = { type: "leave", leaveType: l.leaveType === "WEEK_OFFS" ? "WEEK OFF" : l.leaveType };
      });
      return { employee: r.employee, center: r.center, days: { ...shifts, ...leaves }, reportingId: r._id };
    });
  }, [rosterData]);

  if (!permissionLoader && !hasUserPermission) {
    navigate("/unauthorized");
  }

  if (permissionLoader) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
      <h5 className="text-primary text-center fw-bold mb-3" style={{ fontSize: "22px" }}>SHIFT ROSTER</h5>

      {/* filters */}
      <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
        {centerOptions.length > 1 && (
          <div style={{ width: "200px" }}>
            <Select
              value={selectedCenterOption}
              onChange={(o) => {
                setSelectedCenter(o?.value);
                setPage(1);
              }}
              options={centerOptions}
              placeholder="All Centers"
              classNamePrefix="react-select"
            />
          </div>
        )}
        <div className="col-md-3">
          <Input
            type="text"
            className="form-control"
            placeholder="Search by name or Ecode..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="ms-auto">
          <Header reportDate={reportDate} setReportDate={setReportDate} />
        </div>
      </div>

      {/* calendar grid */}
      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          {rosterLoading ? (
            <div className="d-flex justify-content-center py-5"><Spinner color="primary" /></div>
          ) : shiftMap.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">No rotational assignments found for this period.</p>
              {/* {hasWritePermission && (
                <Button color="primary" size="sm" onClick={() => navigate("/hr/reporting/shift-roster/assign")}>
                  <Plus size={14} className="me-1" />Assign Shift
                </Button>
              )} */}
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="mb-0" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <th style={{
                        position: "sticky", left: 0, background: "#f8f9fa", zIndex: 2,
                        padding: "8px 12px", fontWeight: 600, minWidth: 180, borderRight: "1px solid #dee2e6",
                      }}>
                        Employee
                      </th>
                      {dateColumns.map((day, i) => {
                        const todayFlag = isToday(day);
                        return (
                          <th key={i} style={{
                            padding: "8px 6px", textAlign: "center", minWidth: 100,
                            color: todayFlag ? "#1565c0" : "#495057",
                            background: todayFlag ? "#e8f4fd" : "#f8f9fa",
                            borderRight: "1px solid #dee2e6",
                          }}>
                            <div style={{ fontWeight: 600 }}>{DAY_LABELS[day.getDay()]}</div>
                            <div style={{ fontWeight: 400, fontSize: "11px", color: todayFlag ? "#1565c0" : "#6c757d" }}>
                              {format(day, "dd MMM")}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {shiftMap.map((entry, idx) => (
                      <tr key={entry.employee?._id || idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        {/* employee cell */}
                        <td style={{
                          position: "sticky", left: 0, background: "#fff", zIndex: 1,
                          padding: "8px 12px", borderRight: "1px solid #dee2e6", verticalAlign: "middle",
                        }}>
                          <div className="d-flex align-items-start justify-content-between gap-1">
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "12px" }}>{entry.employee?.name}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>{entry.employee?.eCode}</div>
                              {entry.center?.title && (
                                <div style={{ fontSize: "10px", color: "#adb5bd", marginTop: 1 }}>{entry.center.title}</div>
                              )}
                            </div>
                            {hasWritePermission && (
                              <button
                                className="btn btn-link p-0 text-primary"
                                title="Edit shifts"
                                style={{ lineHeight: 1, flexShrink: 0 }}
                                onClick={() => navigate(`/hr/reporting/shift-roster/assign/${entry.reportingId}`)}
                              >
                                <Pencil size={13} />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* day cells */}
                        {dateColumns.map((day, i) => {
                          const key = format(day, "yyyy-MM-dd");
                          const cell = entry.days[key];
                          const todayFlag = isToday(day);
                          const isLeave = cell?.type === "leave";
                          const s = (!isLeave && cell?.shift) ? SHIFT_STYLES[cell.shift] : null;

                          return (
                            <td key={i} style={{
                              padding: "6px", verticalAlign: "middle", textAlign: "center",
                              background: todayFlag ? "#f5faff" : "#fff",
                              borderRight: "1px solid #f0f0f0",
                            }}>
                              {cell ? (
                                isLeave ? (
                                  <div className="rounded px-1 py-1" style={{
                                    background: "#fff3cd", border: "1px solid #ffc107", color: "#856404",
                                  }}>
                                    <div style={{ fontWeight: 700, fontSize: "10px", letterSpacing: "0.04em" }}>LEAVE</div>
                                    <div style={{ fontSize: "10px", marginTop: 1 }}>
                                      {cell.leaveType?.replace(/_/g, " ")}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded px-1 py-1" style={{
                                    background: s?.bg || "#f8f9fa",
                                    border: `1px solid ${s?.border || "#dee2e6"}`,
                                    color: s?.text || "#495057",
                                  }}>
                                    {cell.shift && (
                                      <div style={{ fontWeight: 700, fontSize: "10px", letterSpacing: "0.04em" }}>
                                        {cell.shift}
                                      </div>
                                    )}
                                    <div style={{ fontSize: "10px", marginTop: 1 }}>
                                      {cell.start} – {cell.end}
                                    </div>
                                  </div>
                                )
                              ) : (
                                <span style={{ color: "#dee2e6", fontSize: "11px" }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ borderTop: "1px solid #f0f0f0" }}>
                  <span className="text-muted small">
                    Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.totalDocs)} of {pagination.totalDocs}
                  </span>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="small px-2">{page} / {pagination.totalPages}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

    </CardBody>
  );
};

export default ShiftRoaster;
