import React, { useEffect, useRef, useState } from "react";
import { Input, Label, Row, Col } from "reactstrap";
import { getAssetCategories } from "../../../../helpers/backend_helper";
import SearchSelect from "./SearchSelect";

// a list longer than this gets a box you can type into, so a long list is quick to search
const SEARCH_FROM = 12;

export const EMPTY_CATEGORY = { categoryL1: "", categoryL2: "", categoryL3: "", categoryL4: "" };

// Picks an asset category level by level (1 to 4) from the existing Asset Category master.
// value: { categoryL1, categoryL2, categoryL3, categoryL4 } (ids, "" when not chosen)
// Choosing a level clears the levels below it.
// onSettings({ canAssign, identifierLabel }) is called with what the chosen category says (canAssign: the Level 4 tick only)
// levelLabels: optional names for the boxes, e.g. ["Category", "Sub-category"] (default: "Category level 1", ...)
// A deeper box only appears once the one above it is chosen, and only if there is something to choose.
const CategoryLevelSelect = ({ value, onChange, onSettings, required = false, disabled = false, levels = 4, md = 3, levelLabels = [] }) => {
  const cache = useRef({});
  const [options, setOptions] = useState([[], [], [], []]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);

  const ids = [value.categoryL1, value.categoryL2, value.categoryL3, value.categoryL4];
  const key = ids.slice(0, levels).join("|");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const next = [];
      for (let n = 1; n <= 4; n++) {
        const parent = n === 1 ? "" : ids[n - 2];
        if (n > levels || (n > 1 && !parent)) {
          next.push([]);
          continue;
        }
        const cacheKey = parent || "root";
        if (!cache.current[cacheKey]) {
          try {
            const res = await getAssetCategories(
              n === 1 ? { level: 1, status: "active" } : { parentCategoryId: parent, status: "active" },
            );
            cache.current[cacheKey] = (res?.data || []).map((c) => ({
              _id: c._id,
              name: c.name,
              assignableToEmployee: !!c.assignableToEmployee,
              identifierLabel: c.identifierLabel || "",
            }));
            if (!cancelled) setLoadFailed(false);
          } catch {
            if (!cancelled) setLoadFailed(true);
          }
        }
        next.push(cache.current[cacheKey] || []);
      }
      if (!cancelled) {
        setOptions(next);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, levels, retry]);

  // Tell the screen what the chosen category allows (the deepest chosen level that sets something wins)
  useEffect(() => {
    if (!onSettings) return;
    const chosen = [1, 2, 3, 4]
      .slice(0, levels)
      .map((n) => (options[n - 1] || []).find((c) => c._id === ids[n - 1]))
      .filter(Boolean)
      .reverse();
    // Is the category chosen down to its last level? (nothing left to pick below it)
    let depth = 0;
    while (depth < levels && ids[depth]) depth += 1;
    const hasMore = depth > 0 && depth < levels && (options[depth] || []).length > 0;
    onSettings({
      isComplete: depth > 0 && (loadFailed || (!loading && !hasMore)),
      hasCategory: chosen.length > 0,
      names: [...chosen].reverse().map((c) => c.name), // level 1 first
      // only the Level 4 category decides it
      canAssign: chosen.length === 0 ? true : !!(options[3] || []).find((c) => c._id === ids[3])?.assignableToEmployee,
      identifierLabel: chosen.map((c) => c.identifierLabel).find(Boolean) || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, key, loading, loadFailed]);

  const choose = (level, id) => {
    const next = { ...value };
    for (let n = level; n <= 4; n++) next[`categoryL${n}`] = n === level ? id : "";
    onChange(next);
  };

  return (
    <>
      <Row>
        {Array.from({ length: levels }, (_, i) => i + 1).map((n) => {
          const parentChosen = n === 1 || !!ids[n - 2];
          const list = options[n - 1] || [];
          // no sub-categories under the chosen one: nothing to show (no empty, disabled boxes)
          if (n > 1 && !(parentChosen && (loading || list.length > 0))) return null;
          return (
            <Col md={md} key={n} className="mb-3">
              <Label className="small">
                {levelLabels[n - 1] || `Category level ${n}`} {n === 1 && required && <span className="text-danger">*</span>}
              </Label>
              {(() => {
                const off = disabled || loading || !parentChosen || (parentChosen && list.length === 0 && n > 1);
                const emptyText = loading
                  ? "Loading..."
                  : !parentChosen
                    ? `Pick level ${n - 1} first`
                    : list.length === 0 && n > 1
                      ? "No sub-categories"
                      : n === 1
                        ? "Select category"
                        : "Select (optional)";
                return list.length > SEARCH_FROM ? (
                  <SearchSelect
                    options={list.map((c) => ({ value: c._id, label: c.name }))}
                    value={ids[n - 1] || ""}
                    onChange={(id) => choose(n, id)}
                    placeholder={emptyText}
                    clearLabel={n > 1 ? "Clear (no sub-category)" : ""}
                    disabled={off}
                  />
                ) : (
                  <Input type="select" value={ids[n - 1] || ""} disabled={off} onChange={(e) => choose(n, e.target.value)}>
                    <option value="">{emptyText}</option>
                    {list.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Input>
                );
              })()}
            </Col>
          );
        })}
      </Row>
      {loadFailed && <div className="text-danger small mb-2">
          Could not load the asset categories.{" "}
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setRetry((r) => r + 1)}>Try again</button>
        </div>}
    </>
  );
};

export default CategoryLevelSelect;
