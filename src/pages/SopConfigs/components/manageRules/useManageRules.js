import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  listSopRules,
  toggleSopRuleActive,
  deleteSopRule,
} from "../../../../helpers/backend_helper";

/**
 * Inbox state + actions for Manage Rules. Page composes the result.
 *
 * Returns the list, derived (filtered/counts), filter state + setters, and
 * action handlers (toggle active, delete) that already do optimistic updates
 * with rollback on failure.
 */
export const useManageRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // all | active | inactive

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listSopRules();
      setRules(res?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSeverity = useCallback(
    (sev) =>
      setSeverityFilter((p) =>
        p.includes(sev) ? p.filter((s) => s !== sev) : [...p, sev],
      ),
    [],
  );

  const clearSeverityFilter = useCallback(() => setSeverityFilter([]), []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rules.filter((r) => {
      if (s && !r.ruleName?.toLowerCase().includes(s)) return false;
      if (severityFilter.length && !severityFilter.includes(r.severity))
        return false;
      if (activeFilter === "active" && !r.isActive) return false;
      if (activeFilter === "inactive" && r.isActive) return false;
      return true;
    });
  }, [rules, search, severityFilter, activeFilter]);

  const counts = useMemo(
    () => ({
      total: rules.length,
      active: rules.filter((r) => r.isActive).length,
      inactive: rules.filter((r) => !r.isActive).length,
    }),
    [rules],
  );

  const handleToggleActive = useCallback(
    async (rule, next) => {
      setRules((p) =>
        p.map((r) => (r._id === rule._id ? { ...r, isActive: next } : r)),
      );
      try {
        await toggleSopRuleActive(rule._id, next);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Toggle failed");
        load();
      }
    },
    [load],
  );

  const handleDelete = useCallback(async (rule) => {
    try {
      await deleteSopRule(rule._id);
      toast.success(`Deleted "${rule.ruleName}"`);
      setRules((p) => p.filter((r) => r._id !== rule._id));
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
      return false;
    }
  }, []);

  return {
    // data
    rules,
    filtered,
    counts,
    // status
    loading,
    // filters
    search,
    setSearch,
    severityFilter,
    toggleSeverity,
    clearSeverityFilter,
    activeFilter,
    setActiveFilter,
    // actions
    load,
    handleToggleActive,
    handleDelete,
  };
};
