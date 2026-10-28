import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "reactstrap";
import { filterOptions } from "./searchFilter";

// A drop-down you can type into. Used where a list can be long (for example 160+ asset categories):
// click it, type a few letters, pick one. Works with the keyboard (arrows, Enter, Escape) and on a phone.
//   options: [{ value, label }]   value: the chosen value ("" = nothing)   onChange(value)
//   clearLabel: text of the first row that clears the choice (leave empty for "nothing to clear")
const SearchSelect = ({ options, value, onChange, placeholder = "Select", clearLabel = "", disabled = false, maxShown = 100 }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const { shown, total } = useMemo(() => filterOptions(options, query, maxShown), [options, query, maxShown]);
  const rows = clearLabel ? [{ value: "", label: clearLabel, isClear: true }, ...shown] : shown;

  // close when clicking outside
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // keep the highlighted row in view
  useEffect(() => {
    const el = listRef.current?.children?.[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openBox = () => {
    if (disabled) return;
    setQuery("");
    setActive(0);
    setOpen(true);
  };
  const pick = (row) => {
    onChange(row.value);
    setOpen(false);
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(rows.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // with a typed search the first real match is the natural choice
      const row = rows[query.trim() && clearLabel && rows.length > 1 && active === 0 ? 1 : active];
      if (row) pick(row);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      {!open ? (
        <button
          type="button"
          className="form-control text-start d-flex align-items-center justify-content-between"
          style={{ background: disabled ? "#f2f4f7" : "#fff", cursor: disabled ? "not-allowed" : "pointer", minHeight: 38 }}
          disabled={disabled}
          onClick={openBox}
          aria-haspopup="listbox"
        >
          <span className={`text-truncate ${selected ? "" : "text-muted"}`}>{selected ? selected.label : placeholder}</span>
          <i className="bx bx-chevron-down ms-2 text-muted"></i>
        </button>
      ) : (
        <>
          <Input
            autoFocus
            value={query}
            placeholder={`Type to search (${options.length})`}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <div
            ref={listRef}
            role="listbox"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 30,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              maxHeight: 260,
              overflowY: "auto",
              boxShadow: "0 8px 20px rgba(16,24,40,0.12)",
              marginTop: 2,
            }}
          >
            {rows.map((row, i) => (
              <div
                key={row.isClear ? "__clear" : row.value}
                role="option"
                aria-selected={row.value === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(row);
                }}
                onMouseEnter={() => setActive(i)}
                style={{
                  padding: "9px 12px",
                  cursor: "pointer",
                  fontSize: 14,
                  background: i === active ? "#eef2ff" : "#fff",
                  color: row.isClear ? "#667085" : "#101828",
                  fontWeight: row.value === value && !row.isClear ? 700 : 400,
                  wordBreak: "break-word",
                }}
              >
                {row.label}
              </div>
            ))}
            {shown.length === 0 && <div className="p-3 text-muted small">No category matches "{query}"</div>}
            {total > shown.length && (
              <div className="px-3 py-2 text-muted small" style={{ borderTop: "1px solid #f2f4f7" }}>
                Showing {shown.length} of {total}. Keep typing to narrow it down.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchSelect;
