import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AUTO_SOURCES, DEFAULT_SIGNATURE_HEIGHT_PT, sourceLabel } from "../../Helpers/declaration";

const STYLE = `
.declaration-docx { font-size: 13px; line-height: 1.45; overflow-x: auto; }
.declaration-docx table { border-collapse: collapse; width: 100%; margin: 8px 0; }
.declaration-docx td, .declaration-docx th { border: 1px solid #cbd5e1; padding: 4px 8px; vertical-align: top; }
.declaration-docx p { margin: 0 0 6px; }
.declaration-docx img { max-width: 100%; height: auto; max-height: 90px; }
.declaration-docx [data-pid] { cursor: pointer; min-height: 1.2em; }
.declaration-docx [data-pid]:empty { display: block; background: #f8fafc; outline: 1px dashed #cbd5e1; }
.declaration-docx [data-pid]:hover { background: #eef2f7; }
.declaration-docx [data-detected] { outline: 1px dashed #16a34a; background: rgba(22, 163, 74, 0.10); }
.declaration-docx [data-assigned], .declaration-docx [data-selected] { outline: 3px solid #111827 !important; outline-offset: -2px; background: #6b7280 !important; color: #ffffff !important; }
.declaration-docx td[data-cell-state], .declaration-docx th[data-cell-state] { outline: 3px solid #111827 !important; outline-offset: -3px; background: #6b7280 !important; color: #ffffff !important; box-shadow: inset 0 0 0 2px #ffffff; }
.declaration-docx td[data-cell-state] [data-pid], .declaration-docx th[data-cell-state] [data-pid] { outline: none !important; background: transparent !important; }
`;

const keyOf = (address) =>
  address.kind === "paragraph"
    ? `p:${address.index}`
    : `c:${address.table}:${address.row}:${address.cell}:${address.paragraph ?? 0}`;

const describe = (address) =>
  address.kind === "paragraph"
    ? `Paragraph ${address.index + 1}`
    : `Table ${address.table + 1}, row ${address.row + 1}, cell ${address.cell + 1}${address.paragraph ? `, paragraph ${address.paragraph + 1}` : ""}`;

const DocxPlacementEditor = ({ html, addresses, placements, detected = [], onChange }) => {
  const target = (placements.targets || [])[0] || null;
  const containerRef = useRef(null);
  const [selectedPid, setSelectedPid] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const detectedKeys = new Map(detected.filter((field) => field.kind === "cell").map((field) => [keyOf(field), sourceLabel(field.source)]));
    const targetKey = target ? keyOf(target) : null;

    container.querySelectorAll("[data-cell-state]").forEach((cell) => cell.removeAttribute("data-cell-state"));

    container.querySelectorAll("[data-pid]").forEach((element) => {
      const pid = element.getAttribute("data-pid");
      const address = addresses[pid];
      const key = address ? keyOf(address) : null;

      if (key && detectedKeys.has(key)) {
        element.setAttribute("data-detected", detectedKeys.get(key));
        element.setAttribute("title", `Filled automatically: ${detectedKeys.get(key)}`);
      } else {
        element.removeAttribute("data-detected");
        element.removeAttribute("title");
      }

      if (key && key === targetKey) {
        element.setAttribute("data-assigned", "Signature");
        element.setAttribute("title", "Signature");
      } else {
        element.removeAttribute("data-assigned");
      }

      const isSelected = String(selectedPid) === pid;
      if (isSelected) element.setAttribute("data-selected", "true");
      else element.removeAttribute("data-selected");

      if (isSelected || (key && key === targetKey)) {
        const cell = element.closest("td, th");
        if (cell) cell.setAttribute("data-cell-state", isSelected ? "selected" : "assigned");
      }
    });
  }, [target, detected, addresses, selectedPid, html]);

  const handleClick = (event) => {
    const element = event.target.closest("[data-pid]");
    if (!element) return;
    const pid = element.getAttribute("data-pid");
    if (!addresses[pid]) {
      toast.info("This part of the form cannot be used. Pick another cell or paragraph.");
      return;
    }
    setSelectedPid(pid);
  };

  const selectedAddress = selectedPid !== null ? addresses[selectedPid] : null;

  const assign = () => {
    if (!selectedAddress) return;
    onChange({ ...placements, targets: [{ id: "signature", source: "signature", ...selectedAddress }] });
  };

  const found = AUTO_SOURCES.filter((source) => detected.some((field) => field.source === source));
  const missing = AUTO_SOURCES.filter((source) => !found.includes(source));

  return (
    <div className="row g-3" data-testid="docx-placement-editor">
      <div className="col-lg-8">
        <style>{STYLE}</style>
        <p className="text-muted small mb-2">Click the cell or paragraph where the signature goes.</p>
        <div
          ref={containerRef}
          className="declaration-docx border rounded bg-white p-3"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className="col-lg-4">
        <h6 className="fw-semibold">Signature spot</h6>
        {selectedAddress ? (
          <div className="border rounded p-2 mb-2" data-testid="docx-selected">
            <div className="small mb-2">{describe(selectedAddress)}</div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={assign}>
              Use as the signature spot
            </button>
          </div>
        ) : (
          <p className="text-muted small">Nothing selected yet.</p>
        )}
        {target && (
          <div className="border rounded p-2 mb-3" data-testid="docx-target">
            <small className="fw-semibold">Signature</small>
            <div className="text-muted" style={{ fontSize: 11 }}>{describe(target)}</div>
          </div>
        )}

        <h6 className="fw-semibold">Signature picture</h6>
        <div className="d-flex gap-3 mb-2">
          <label className="small">
            <input
              type="radio"
              name="signature-mode"
              className="me-1"
              checked={placements.signatureMode !== "floating"}
              onChange={() => onChange({ ...placements, signatureMode: "inline" })}
            />
            Inline (recommended)
          </label>
          <label className="small">
            <input
              type="radio"
              name="signature-mode"
              className="me-1"
              checked={placements.signatureMode === "floating"}
              onChange={() => onChange({ ...placements, signatureMode: "floating" })}
            />
            Floating
          </label>
        </div>
        <div className="d-flex align-items-center gap-2 mb-3">
          <label className="small mb-0" htmlFor="signature-height">Height (pt)</label>
          <input
            id="signature-height"
            type="number"
            className="form-control form-control-sm"
            style={{ width: 90 }}
            min={12}
            max={80}
            value={placements.signatureHeightPt ?? DEFAULT_SIGNATURE_HEIGHT_PT}
            onChange={(event) => onChange({ ...placements, signatureHeightPt: Number(event.target.value) || DEFAULT_SIGNATURE_HEIGHT_PT })}
          />
        </div>

        <h6 className="fw-semibold">Filled automatically</h6>
        {found.length > 0 ? (
          <ul className="small mb-2" data-testid="auto-found">
            {found.map((source) => (
              <li key={source}>{sourceLabel(source)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted small mb-2">Nothing was recognised in this document.</p>
        )}
        {missing.length > 0 && (
          <p className="text-muted small" data-testid="auto-missing">
            Not found, so left as they are: {missing.map(sourceLabel).join(", ")}.
          </p>
        )}
        <p className="text-muted small">
          Fields are recognised from their labels and the empty cell next to them (shown with a green outline).
        </p>
      </div>
    </div>
  );
};

export default DocxPlacementEditor;
