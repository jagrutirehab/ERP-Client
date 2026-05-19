import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllSopAlerts,
  markSopAlertRead,
  markAllSopAlertsRead,
} from "../../../../helpers/backend_helper";
import { dateLabel } from "./alertUtils";

const SERVER_DEBOUNCE_MS = 350;
const DEFAULT_PAGE_SIZE = 50;

const buildServerParams = (filters, page, pageSize) => {
  const out = { page, pageSize };
  for (const [k, v] of Object.entries(filters)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      if (v.length) out[k] = v.join(",");
    } else if (String(v).trim() !== "") {
      out[k] = v;
    }
  }
  return out;
};

/**
 * Inbox state for the Alerts page. Every filter lives on the server now
 * (read state / phase / severity / search / date range) and pagination is
 * server-driven via $facet. Text inputs debounce 350ms before refetch.
 *
 * Live socket updates prepend new alerts to the current page (best-effort);
 * the next user-initiated load (refresh / page change / filter change) gets
 * the authoritative server state.
 */
export const useAlertsInbox = () => {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Unified server-side filter state.
  const [serverFilters, setServerFilters] = useState({
    search: "",
    dateFrom: "", // ISO string
    dateTo: "", // ISO string
    readState: "all", // all | unread | read
    phase: "all", // all | IMMEDIATE | DELAYED
    severity: [], // array of LOW/MEDIUM/HIGH/CRITICAL
  });

  // Debounced copy — only THIS triggers refetch.
  const [debouncedFilters, setDebouncedFilters] = useState(serverFilters);

  const alertsRef = useRef([]);
  alertsRef.current = alerts;

  const load = useCallback(async (filters, p, size) => {
    setLoading(true);
    try {
      const res = await getAllSopAlerts(buildServerParams(filters, p, size));
      setAlerts(res?.data || []);
      setTotal(res?.total || 0);
      setTotalUnread(res?.totalUnread || 0);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch whenever page/pageSize or debounced filters change.
  useEffect(() => {
    load(debouncedFilters, page, pageSize);
  }, [load, debouncedFilters, page, pageSize]);

  // Debounce filter changes by SERVER_DEBOUNCE_MS. Reset to page 1 whenever
  // filters change so we don't end up on page 50 of a now-shorter list.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters(serverFilters);
      setPage(1);
    }, SERVER_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [serverFilters]);

  const setServerFilter = useCallback((key, value) => {
    setServerFilters((p) => ({ ...p, [key]: value }));
  }, []);

  const clearServerFilters = useCallback(() => {
    setServerFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
      readState: "all",
      phase: "all",
      severity: [],
    });
  }, []);

  const toggleSeverity = useCallback((sev) => {
    setServerFilters((p) => ({
      ...p,
      severity: p.severity.includes(sev)
        ? p.severity.filter((s) => s !== sev)
        : [...p.severity, sev],
    }));
  }, []);

  const clearSeverityFilter = useCallback(
    () => setServerFilters((p) => ({ ...p, severity: [] })),
    [],
  );

  // Group the current page's rows by date label (Today / Yesterday / date).
  const grouped = useMemo(() => {
    const map = new Map();
    for (const a of alerts) {
      const label = dateLabel(a.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(a);
    }
    return [...map.entries()];
  }, [alerts]);

  const markRead = useCallback(async (id) => {
    let wasUnread = false;
    setAlerts((prev) =>
      prev.map((a) => {
        if (a._id === id && !a.isRead) {
          wasUnread = true;
          return { ...a, isRead: true };
        }
        return a;
      }),
    );
    if (wasUnread) setTotalUnread((u) => Math.max(0, u - 1));
    try {
      await markSopAlertRead(id);
    } catch {
      /* best-effort */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setBulkLoading(true);
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    setTotalUnread(0);
    try {
      const res = await markAllSopAlertsRead();
      toast.success(`Marked ${res?.count ?? "all"} alert(s) as read`);
    } catch {
      toast.error("Failed to mark all as read");
      load(debouncedFilters, page, pageSize);
    } finally {
      setBulkLoading(false);
    }
  }, [load, debouncedFilters, page, pageSize]);

  const getAlertById = useCallback(
    (id) => alerts.find((a) => a._id === id) || null,
    [alerts],
  );

  return {
    // data
    alerts,
    grouped,
    total,
    totalUnread,
    // pagination
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    // status
    loading,
    bulkLoading,
    // filters (all server-side now)
    serverFilters,
    setServerFilter,
    clearServerFilters,
    toggleSeverity,
    clearSeverityFilter,
    // actions
    load: () => load(debouncedFilters, page, pageSize),
    markRead,
    markAllRead,
    getAlertById,
  };
};
