import { useEffect, useMemo } from "react";

const omitKeys = (obj, keys) => {
  if (!obj || !keys || keys.length === 0) return obj;
  const copy = { ...obj };
  keys.forEach((key) => {
    delete copy[key];
  });
  return copy;
};

// Generic localStorage draft persistence for a Formik form. Mirrors the
// pattern in Patient/ChartForm/DetailAdmission/index.js: read once on mount,
// save on every values change (skipped when disabled), clear only when the
// caller confirms a real submit succeeded.
export const useFormDraft = (draftKey, values, options = {}) => {
  const { enabled = true, exclude = [] } = options;

  const savedDraft = useMemo(() => {
    if (!enabled) return null;
    try {
      const raw = localStorage.getItem(draftKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, enabled]);

  useEffect(() => {
    if (!enabled) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify(omitKeys(values, exclude)),
      );
    } catch {
      // localStorage can throw (private browsing, quota) — losing the draft
      // is acceptable, breaking the form is not.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, draftKey, values]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
  };

  return { savedDraft, clearDraft };
};

export default useFormDraft;
