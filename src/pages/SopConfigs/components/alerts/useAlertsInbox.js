import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllSopAlerts,
  markSopAlertRead,
  markAllSopAlertsRead,
} from "../../../../helpers/backend_helper";
import { socket } from "../../../../workers/sopsocket";
import { dateLabel } from "./alertUtils";

/**
 * Inbox state + side effects in one place. Page composes from this.
 *
 * Returns alerts, filters, derived (filtered/grouped/counts), and actions
 * (load, markRead, markAllRead, toggleSeverity). Subscribes to NEW_SOP_ALERT
 * for live updates while mounted; tears down on unmount.
 */
export const useAlertsInbox = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [readFilter, setReadFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState([]);

  // Mirrors alerts so the socket handler can dedupe without re-binding on every state change.
  const alertsRef = useRef([]);
  alertsRef.current = alerts;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSopAlerts();
      console.log({ res });

      setAlerts(res?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onNew = (alert) => {
      if (!alert?._id) return;
      if (alertsRef.current.some((a) => a._id === alert._id)) return;
      setAlerts((prev) => [
        {
          ...alert,
          isRead: false,
          phase: alert.dedupeKey ? "DELAYED" : "IMMEDIATE",
        },
        ...prev,
      ]);
    };
    socket.on("NEW_SOP_ALERT", onNew);
    return () => socket.off("NEW_SOP_ALERT", onNew);
  }, []);

  const toggleSeverity = useCallback((sev) => {
    setSeverityFilter((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev],
    );
  }, []);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (readFilter === "unread" && a.isRead) return false;
      if (readFilter === "read" && !a.isRead) return false;
      if (phaseFilter !== "all" && a.phase !== phaseFilter) return false;
      if (severityFilter.length && !severityFilter.includes(a.severity))
        return false;
      return true;
    });
  }, [alerts, readFilter, phaseFilter, severityFilter]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const a of filtered) {
      const label = dateLabel(a.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(a);
    }
    return [...map.entries()];
  }, [filtered]);

  const counts = useMemo(
    () => ({
      total: alerts.length,
      unread: alerts.filter((a) => !a.isRead).length,
      immediate: alerts.filter((a) => a.phase === "IMMEDIATE").length,
      delayed: alerts.filter((a) => a.phase === "DELAYED").length,
    }),
    [alerts],
  );

  const markRead = useCallback(async (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a._id === id ? { ...a, isRead: true } : a)),
    );
    try {
      await markSopAlertRead(id);
    } catch {
      /* best-effort */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (counts.unread === 0) return;
    setBulkLoading(true);
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    try {
      const res = await markAllSopAlertsRead();
      toast.success(
        `Marked ${res?.data?.count ?? counts.unread} alert(s) as read`,
      );
    } catch {
      toast.error("Failed to mark all as read");
      load();
    } finally {
      setBulkLoading(false);
    }
  }, [counts.unread, load]);

  const getAlertById = useCallback(
    (id) => alerts.find((a) => a._id === id) || null,
    [alerts],
  );

  const clearSeverityFilter = useCallback(() => setSeverityFilter([]), []);

  return {
    // data
    alerts,
    filtered,
    grouped,
    counts,
    // status
    loading,
    bulkLoading,
    // filters
    readFilter,
    setReadFilter,
    phaseFilter,
    setPhaseFilter,
    severityFilter,
    toggleSeverity,
    clearSeverityFilter,
    // actions
    load,
    markRead,
    markAllRead,
    getAlertById,
  };
};
