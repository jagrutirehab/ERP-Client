import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card, CardBody, Spinner, Button, Label,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { ChevronLeft, ChevronRight, RotateCcw, Trash2, Copy, Save, Plus, X, Moon } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, parseISO } from "date-fns";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getExitEmployeesBySearch } from "../../../store/features/HR/hrSlice";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { setBulkRotationalShifts } from "../../../helpers/backend_helper";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";


const minutesToTime = (m) => {
  if (m == null) return "";
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

const minutesToDate = (m) => {
  if (m == null) return null;
  const d = new Date();
  d.setHours(Math.floor(m / 60) % 24, m % 60, 0, 0);
  return d;
};

const detectShiftName = (start, end) => {
  if (start == null || end == null) return null;
  // Night crosses midnight: start 8PM–12AM, end 3AM–8AM
  if (start >= 1200 && end >= 180 && end <= 480) return "NIGHT";
  // Normal: start 8–10AM, end 5–7:30PM
  if (start >= 480 && start <= 600 && end >= 1020 && end <= 1170) return "NORMAL";
  // Morning: start 4–7:30AM, end 1–3PM
  if (start >= 240 && start <= 450 && end >= 780 && end <= 900) return "MORNING";
  // Afternoon: start 12–3PM, end 8–11PM
  if (start >= 720 && start <= 900 && end >= 1200 && end <= 1380) return "AFTERNOON";
  return null;
};

const SHIFT_STYLES = {
  NORMAL: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  MORNING: { bg: "#fffde7", text: "#e65100", border: "#ffe082" },
  AFTERNOON: { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
  NIGHT: { bg: "#f3e5f5", text: "#6a1b9a", border: "#ce93d8" },
};

const BASE_TIME_CONFIG = {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true,
  minuteIncrement: 5,
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

let rowIdCounter = 0;
const newRowId = () => ++rowIdCounter;


const EmployeeShiftRow = ({ rowIndex, dispatch, centerAccess, handleAuthError, onDataChange, onRemove, canRemove, prevRoster, hasFailed }) => {
  const [employeeCache, setEmployeeCache] = useState([]);
  const [empSearch, setEmpSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [roster, setRoster] = useState({});
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const {
    hasPermission,
    loading: permissionLoader,
  } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "ASSIGN_ROTATIONAL_SHIFT", "READ");

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const doSearch = useCallback(async (text) => {
    if (!text.trim()) return;
    setSearching(true);
    try {
      const res = await dispatch(
        getExitEmployeesBySearch({ query: text, centers: centerAccess, view: "ASSIGN_ROTATIONAL_SHIFT" })
      ).unwrap();
      setEmployeeCache(res?.data || res || []);
    } catch (err) {
      if (!handleAuthError(err)) toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  }, [dispatch, centerAccess, handleAuthError]);

  const debouncedSearch = useMemo(() => debounce(doSearch, 400), [doSearch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (empSearch) debouncedSearch(empSearch); }, [empSearch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { debouncedSearch.cancel(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const empOptions = employeeCache.map((e) => ({
    value: e._id,
    label: `${e.name} (${e.eCode})`,
    reportingId: e.reportingId || null,
  }));

  // ── notify parent whenever key data changes ──
  useEffect(() => {
    onDataChange({ selectedEmployee, roster });
  }, [selectedEmployee, roster]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── cell helpers ──
  const getCell = (day) => roster[format(day, "yyyy-MM-dd")] || null;

  const setCell = useCallback((day, field, value) => {
    const key = format(day, "yyyy-MM-dd");
    setRoster((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { start: null, end: null, weekOff: false }), [field]: value },
    }));
  }, []);

  const clearCell = useCallback((day) => {
    const key = format(day, "yyyy-MM-dd");
    setRoster((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const toggleWeekOff = useCallback((day) => {
    const key = format(day, "yyyy-MM-dd");
    setRoster((prev) => {
      const current = prev[key];
      if (current?.weekOff) {
        // toggle off — remove entry
        const n = { ...prev }; delete n[key]; return n;
      }
      // toggle on — set weekOff, clear times
      return { ...prev, [key]: { start: null, end: null, weekOff: true } };
    });
  }, []);

  const copyToNextWeek = () => {
    const replacements = {};
    weekDays.forEach((day) => {
      const cell = roster[format(day, "yyyy-MM-dd")];
      if (cell) replacements[format(addDays(day, 7), "yyyy-MM-dd")] = { ...cell };
    });
    if (!Object.keys(replacements).length) { toast.info("No shifts this week to copy."); return; }
    setRoster((prev) => ({ ...prev, ...replacements }));
    setWeekStart((w) => addWeeks(w, 1));
    toast.success("Copied to next week.");
  };

  const filledShifts = useMemo(
    () => Object.entries(roster)
      .filter(([, v]) => v.start != null && v.end != null && !v.weekOff)
      .sort(([a], [b]) => a.localeCompare(b)),
    [roster]
  );

  const weekOffDays = useMemo(
    () => Object.entries(roster).filter(([, v]) => v.weekOff).map(([d]) => d).sort(),
    [roster]
  );

  const weekLabel = `${format(weekStart, "dd MMM")} – ${format(addDays(weekStart, 6), "dd MMM yyyy")}`;
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <Card className="shadow-sm mb-3" style={{ border: hasFailed ? "1.5px solid #f5c2c7" : "none", background: hasFailed ? "#fff8f8" : undefined }}>
      <CardBody>

        {/* row header */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <span
            className="fw-semibold text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 26, height: 26, fontSize: 12, background: "#495057", flexShrink: 0 }}
          >
            {rowIndex + 1}
          </span>
          {hasFailed && (
            <span className="badge ms-2" style={{ background: "#f8d7da", color: "#842029", fontSize: "11px" }}>
              Failed — fix &amp; resubmit
            </span>
          )}
          {canRemove && (
            <button className="btn btn-link p-0 text-danger ms-auto" onClick={onRemove} title="Remove row">
              <X size={16} />
            </button>
          )}
        </div>

        {/* employee select */}
        <div className="mb-3" style={{ maxWidth: 360 }}>
          <Label className="form-label small fw-semibold">Employee</Label>
          <Select
            options={empOptions}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            onInputChange={setEmpSearch}
            isLoading={searching}
            placeholder="Search by name or eCode..."
            isClearable
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (b) => ({ ...b, zIndex: 9999 }),
              control: (b) => ({ ...b, fontSize: "13px" }),
            }}
          />
        </div>

        {/* week nav */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center gap-1 rounded border bg-white px-2 py-1"
              style={{ fontSize: "13px" }}
            >
              <button className="btn btn-link btn-sm p-0 text-muted" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
                <ChevronLeft size={16} />
              </button>
              <span className="fw-medium px-2" style={{ minWidth: "200px", textAlign: "center" }}>
                {weekLabel}
              </span>
              <button className="btn btn-link btn-sm p-0 text-muted" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
            <Button size="sm" color="outline-secondary" onClick={goToday}>
              <RotateCcw size={12} className="me-1" />Today
            </Button>
          </div>
          <div className="d-flex align-items-center gap-2">
            {filledShifts.length > 0 && (
              <span className="badge bg-primary" style={{ fontSize: "12px" }}>
                {filledShifts.length} shift{filledShifts.length !== 1 ? "s" : ""} added
              </span>
            )}
            <Button size="sm" color="outline-secondary" onClick={copyToNextWeek}>
              <Copy size={12} className="me-1" />Copy to next week
            </Button>
            {prevRoster && Object.keys(prevRoster).length > 0 && (
              <Button size="sm" color="outline-secondary" onClick={() => setRoster({ ...prevRoster })} title="Copy shifts from previous employee">
                <Copy size={12} className="me-1" />Copy from previous Employee
              </Button>
            )}
          </div>
        </div>

        {/* day cards */}
        <div className="row g-2 mb-3">
          {weekDays.map((day, i) => {
            const cell = getCell(day);
            const isWeekOff = cell?.weekOff === true;
            const todayFlag = isToday(day);
            const shiftName = !isWeekOff && cell ? detectShiftName(cell.start, cell.end) : null;
            const s = shiftName ? SHIFT_STYLES[shiftName] : null;
            const isFilled = !isWeekOff && cell && cell.start != null && cell.end != null;

            return (
              <div className="col" key={i} style={{ minWidth: "120px" }}>
                <div
                  className="rounded p-2 h-100"
                  style={{
                    border: `1.5px solid ${isWeekOff ? "#ced4da" : todayFlag ? "#90caf9" : isFilled ? (s?.border || "#dee2e6") : "#dee2e6"}`,
                    background: isWeekOff ? "#f1f3f5" : isFilled ? (s?.bg || "#f8f9fa") : todayFlag ? "#f5faff" : "#fafafa",
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* day header */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <div className="fw-semibold" style={{ fontSize: "12px", color: todayFlag ? "#1565c0" : "#495057" }}>
                        {DAY_LABELS[i]}
                      </div>
                      <div className="text-muted" style={{ fontSize: "11px" }}>{format(day, "dd MMM")}</div>
                    </div>
                    {(isFilled || isWeekOff) && (
                      <button className="btn btn-link p-0 text-danger" onClick={() => clearCell(day)} title="Clear">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* week off state */}
                  {isWeekOff ? (
                    <div
                      className="text-center rounded py-1"
                      style={{ background: "#e9ecef", color: "#6c757d", fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em" }}
                    >
                      <Moon size={10} className="me-1" />WEEK OFF
                    </div>
                  ) : (
                    <>
                      {shiftName && (
                        <div
                          className="text-center rounded mb-2"
                          style={{
                            background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                            fontSize: "10px", fontWeight: 600, padding: "1px 4px", letterSpacing: "0.04em",
                          }}
                        >
                          {shiftName}
                        </div>
                      )}

                      <div className="mb-1">
                        <div className="text-muted mb-1" style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>Start</div>
                        <Flatpickr
                          options={BASE_TIME_CONFIG}
                          value={minutesToDate(cell?.start)}
                          onChange={([d]) => setCell(day, "start", d ? d.getHours() * 60 + d.getMinutes() : null)}
                          className="form-control form-control-sm"
                          placeholder="--:--"
                          style={{ fontSize: "12px" }}
                        />
                      </div>

                      <div className="mb-2">
                        <div className="text-muted mb-1" style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>End</div>
                        <Flatpickr
                          options={BASE_TIME_CONFIG}
                          value={minutesToDate(cell?.end)}
                          onChange={([d]) => setCell(day, "end", d ? d.getHours() * 60 + d.getMinutes() : null)}
                          className="form-control form-control-sm"
                          placeholder="--:--"
                          style={{ fontSize: "12px" }}
                        />
                      </div>

                      {/* week off toggle */}
                      <button
                        className="btn btn-sm w-100"
                        style={{ fontSize: "10px", padding: "2px 4px", border: "1px dashed #adb5bd", color: "#6c757d", background: "transparent" }}
                        onClick={() => toggleWeekOff(day)}
                      >
                        <Moon size={10} className="me-1" />Week Off
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* summary chips */}
        {(filledShifts.length > 0 || weekOffDays.length > 0) && (
          <div className="p-2 rounded" style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
            {filledShifts.length > 0 && (
              <>
                <p className="text-muted small fw-semibold mb-2">Shifts ({filledShifts.length})</p>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {filledShifts.map(([date, { start, end }]) => {
                    const name = detectShiftName(start, end);
                    const st = name ? SHIFT_STYLES[name] : { bg: "#e9ecef", text: "#495057", border: "#dee2e6" };
                    return (
                      <div
                        key={date}
                        className="d-flex align-items-center gap-1 rounded px-2 py-1"
                        style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.text, fontSize: "11px" }}
                      >
                        <span className="fw-semibold">{format(parseISO(date), "dd MMM")}</span>
                        <span className="text-muted mx-1">·</span>
                        <span>{minutesToTime(start)}–{minutesToTime(end)}</span>
                        {name && <span className="ms-1" style={{ opacity: 0.8 }}>({name})</span>}
                        <button
                          className="btn btn-link p-0 ms-1"
                          style={{ color: st.text, opacity: 0.6, lineHeight: 1 }}
                          onClick={() => setRoster((prev) => { const n = { ...prev }; delete n[date]; return n; })}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {weekOffDays.length > 0 && (
              <>
                <p className="text-muted small fw-semibold mb-2">Week Offs ({weekOffDays.length})</p>
                <div className="d-flex flex-wrap gap-2">
                  {weekOffDays.map((date) => (
                    <div
                      key={date}
                      className="d-flex align-items-center gap-1 rounded px-2 py-1"
                      style={{ background: "#e9ecef", border: "1px solid #ced4da", color: "#495057", fontSize: "11px" }}
                    >
                      <Moon size={10} />
                      <span className="fw-semibold ms-1">{format(parseISO(date), "dd MMM")}</span>
                      <button
                        className="btn btn-link p-0 ms-1 text-danger"
                        style={{ lineHeight: 1 }}
                        onClick={() => setRoster((prev) => { const n = { ...prev }; delete n[date]; return n; })}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </CardBody>
    </Card>
  );
};

// ─── main page ───────────────────────────────────────────────────────────────

const AssignShift = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleAuthError = useAuthError();
  const { centerAccess } = useSelector((s) => s.User);

  const isMobile = useMediaQuery("(max-width: 1000px)");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);
  const hasWritePermission = hasPermission("HR", "SHIFT_ROASTER", "WRITE");

  // each item: { id, data: { selectedEmployee, roster, leaves } }
  const [rows, setRows] = useState(() =>
    Array.from({ length: 10 }, () => ({ id: newRowId(), data: {} }))
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failedRows, setFailedRows] = useState([]); // [{ reportingId, label, message }]
  const [errorOpen, setErrorOpen] = useState(false);
  // set of reportingIds that failed — used to highlight rows
  const [failedIds, setFailedIds] = useState(new Set());

  const addRows = (count = 5) =>
    setRows((prev) => [
      ...prev,
      ...Array.from({ length: count }, () => ({ id: newRowId(), data: {} })),
    ]);

  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRowData = (id, data) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, data } : r)));

  // ── submit ──
  const readyRows = rows.filter((r) => {
    const { selectedEmployee, roster } = r.data;
    if (!selectedEmployee?.reportingId) return false;
    const filled = Object.values(roster || {}).filter((v) => !v.weekOff && v.start != null && v.end != null);
    return filled.length > 0;
  });

  const handleSubmit = () => {
    if (!readyRows.length) {
      toast.error("Fill in at least one employee with shifts.");
      return;
    }
    setConfirmOpen(true);
  };

  const totalShifts = readyRows.reduce((sum, r) => {
    const filled = Object.values(r.data.roster || {}).filter((v) => !v.weekOff && v.start != null && v.end != null);
    return sum + filled.length;
  }, 0);

  const handleConfirmedSubmit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    setFailedRows([]);
    setFailedIds(new Set());

    const payload = readyRows.map((row) => {
      const { selectedEmployee, roster } = row.data;
      const entries = Object.entries(roster || {}).sort(([a], [b]) => a.localeCompare(b));
      const filledShifts = entries.filter(([, v]) => !v.weekOff && v.start != null && v.end != null);
      const weekOffLeaves = entries.filter(([, v]) => v.weekOff).map(([date]) => ({ date, leaveType: "WEEK_OFFS" }));
      return {
        reportingId: selectedEmployee.reportingId,
        _label: selectedEmployee.label, // local only, stripped before send
        shifts: filledShifts.map(([date, { start, end }]) => ({ date, start, end })),
        ...(weekOffLeaves.length ? { leaves: weekOffLeaves } : {}),
      };
    });

    // strip local-only _label before sending
    const body = payload.map(({ _label, ...rest }) => rest); // eslint-disable-line no-unused-vars

    try {
      const res = await setBulkRotationalShifts(body);
      const data = res?.data || res;

      if (data.success) {
        toast.success(data.message || `All ${data.successCount} updated successfully.`);
        setRows(Array.from({ length: 10 }, () => ({ id: newRowId(), data: {} })));
      } else {
        // 207 partial
        toast.warn(data.message || `${data.successCount} succeeded, ${data.failCount} failed.`);
        const failed = (data.results || [])
          .filter((r) => !r.success)
          .map((r) => ({
            reportingId: r.reportingId,
            label: payload.find((p) => p.reportingId === r.reportingId)?._label || r.reportingId,
            message: r.message || "Unknown error",
          }));
        setFailedRows(failed);
        setFailedIds(new Set(failed.map((f) => f.reportingId)));
        setErrorOpen(true);
      }
    } catch (err) {
      if (!handleAuthError(err)) toast.error(err?.message || "Bulk update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!permissionLoader && !hasWritePermission) {
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
      {/* header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0 fw-semibold">Assign Rotational Shift</h5>
          <p className="text-muted small mb-0">Assign shifts for one or more employees</p>
        </div>
        <Button color="outline-secondary" size="sm" onClick={() => navigate("/hr/reporting/shift-roster/list")}>
          ← Back to Roster
        </Button>
      </div>

      {/* employee rows */}
      {rows.map((row, i) => {
        const rid = row.data?.selectedEmployee?.reportingId;
        const hasFailed = rid ? failedIds.has(rid) : false;
        return (
          <EmployeeShiftRow
            key={row.id}
            rowIndex={i}
            prevRoster={i > 0 ? (rows[i - 1].data.roster || {}) : null}
            hasFailed={hasFailed}
            dispatch={dispatch}
            centerAccess={centerAccess}
            handleAuthError={handleAuthError}
            onDataChange={(data) => updateRowData(row.id, data)}
            onRemove={() => removeRow(row.id)}
            canRemove={rows.length > 1}
          />
        );
      })}

      {/* add row */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button color="outline-secondary" size="sm" onClick={() => addRows(5)}>
          <Plus size={14} className="me-1" />Add 5 More Rows
        </Button>
        <span className="text-muted small">{rows.length} row{rows.length !== 1 ? "s" : ""} total</span>
      </div>

      {/* submit */}
      <div className="d-flex justify-content-end gap-2">
        <Button color="secondary" outline onClick={() => navigate("/hr/reporting/shift-roster/list")}>
          Cancel
        </Button>
        <Button
          color="primary"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? <Spinner size="sm" /> : <><Save size={14} className="me-1" />Assign Shifts</>}
        </Button>
      </div>

      {/* error summary modal (partial failure) */}
      <Modal isOpen={errorOpen} toggle={() => setErrorOpen(false)} centered size="md">
        <ModalHeader toggle={() => setErrorOpen(false)} style={{ background: "#fff3cd", borderBottom: "1px solid #ffc107" }}>
          ⚠ Partial Failure — {failedRows.length} employee{failedRows.length !== 1 ? "s" : ""} not updated
        </ModalHeader>
        <ModalBody style={{ fontSize: "13px" }}>
          <p className="text-muted mb-2">The following entries failed. Fix the highlighted rows and resubmit.</p>
          <div className="d-flex flex-column gap-2">
            {failedRows.map((f) => (
              <div
                key={f.reportingId}
                className="rounded px-3 py-2"
                style={{ background: "#fff5f5", border: "1px solid #f5c2c7" }}
              >
                <div className="fw-semibold" style={{ color: "#842029" }}>{f.label}</div>
                <div className="text-muted" style={{ fontSize: "12px" }}>{f.message}</div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline size="sm" onClick={() => setErrorOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* confirm modal */}
      <Modal isOpen={confirmOpen} toggle={() => setConfirmOpen(false)} centered size="sm">
        <ModalHeader toggle={() => setConfirmOpen(false)}>Confirm Update</ModalHeader>
        <ModalBody style={{ fontSize: "13px" }}>
          This will update shifts for <strong>{readyRows.length} employee{readyRows.length !== 1 ? "s" : ""}</strong> ({totalShifts} shift{totalShifts !== 1 ? "s" : ""} total). Each existing record will be deactivated and replaced. Continue?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="primary" size="sm" onClick={handleConfirmedSubmit}>Confirm</Button>
        </ModalFooter>
      </Modal>
    </CardBody>
  );
};

export default AssignShift;
