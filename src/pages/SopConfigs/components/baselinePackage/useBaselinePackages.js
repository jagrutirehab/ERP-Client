import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  listBaselinePackages,
  toggleBaselinePackageActive,
  deleteBaselinePackage,
} from "../../../../helpers/backend_helper";

/**
 * List state for the baseline investigation packages screen.
 *
 * Local state + direct helper calls, matching useManageRules — there is no SOP
 * redux slice and this data is not shared with the patient views.
 *
 * NOTE on error handling: the axios response interceptor rejects with the
 * UNWRAPPED body, so the message is on `err.message`. `err.response.data.message`
 * is a dead path (useManageRules.js has three of them, which is why every one of
 * its toasts silently shows the generic fallback).
 */
export const useBaselinePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBaselinePackages();
      setPackages(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      toast.error(err?.message || "Could not load baseline packages");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return packages.filter((p) => {
      if (q && !(p.name || "").toLowerCase().includes(q)) return false;
      if (activeFilter === "active" && !p.isActive) return false;
      if (activeFilter === "inactive" && p.isActive) return false;
      return true;
    });
  }, [packages, search, activeFilter]);

  const counts = useMemo(
    () => ({
      total: packages.length,
      active: packages.filter((p) => p.isActive).length,
      inactive: packages.filter((p) => !p.isActive).length,
    }),
    [packages],
  );

  /**
   * Optimistic toggle with a reload on failure.
   *
   * Activation must echo back `effectiveFrom` — the server rejects it otherwise.
   * That is deliberate: it is the value deciding how many admissions come into
   * scope, so activating is not a one-click act.
   */
  const handleToggleActive = async (pkg) => {
    const next = !pkg.isActive;
    setPackages((prev) =>
      prev.map((p) => (p._id === pkg._id ? { ...p, isActive: next } : p)),
    );
    try {
      await toggleBaselinePackageActive(pkg._id, next, pkg.effectiveFrom);
      toast.success(next ? "Package activated" : "Package deactivated");
      return true;
    } catch (err) {
      toast.warn(err?.message || "Could not change the package state");
      load(); // rollback to server truth
      return false;
    }
  };

  const handleDelete = async (pkg) => {
    try {
      await deleteBaselinePackage(pkg._id);
      setPackages((prev) => prev.filter((p) => p._id !== pkg._id));
      toast.success("Package deleted");
      return true;
    } catch (err) {
      toast.warn(err?.message || "Could not delete the package");
      return false;
    }
  };

  return {
    packages,
    filtered,
    counts,
    loading,
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    load,
    handleToggleActive,
    handleDelete,
  };
};

export default useBaselinePackages;
