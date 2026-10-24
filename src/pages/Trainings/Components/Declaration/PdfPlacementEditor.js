import React, { useRef, useState } from "react";
import { AUTO_SOURCES, newSignatureBox, normalizeBox, sourceLabel } from "../../Helpers/declaration";
import DeclarationPages from "./DeclarationPages";

const PdfPlacementEditor = ({ pages, placements, detected = [], onChange }) => {
  const box = (placements.boxes || [])[0] || null;
  const [activePage, setActivePage] = useState(box?.page || pages.length || 1);
  const dragRef = useRef(null);

  const setBox = (next) => onChange({ ...placements, boxes: next ? [next] : [] });

  const goToPage = (page) => {
    setActivePage(page);
    setBox(box ? { ...box, page } : newSignatureBox(page));
  };

  const startDrag = (event, mode) => {
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget.closest("[data-page]");
    if (!container || !box) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      mode,
      rect: container.getBoundingClientRect(),
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...box },
    };
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (event.clientX - drag.startX) / drag.rect.width;
    const dy = (event.clientY - drag.startY) / drag.rect.height;
    setBox(
      normalizeBox(
        drag.mode === "move"
          ? { ...drag.origin, x: drag.origin.x + dx, y: drag.origin.y + dy }
          : { ...drag.origin, width: drag.origin.width + dx, height: drag.origin.height + dy },
      ),
    );
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const renderOverlay = (page) => (
    <>
      {detected
        .filter((field) => field.page === page.page)
        .map((field) => (
          <div
            key={`${field.source}-${field.x}-${field.y}`}
            data-testid="detected-field"
            title={`Filled automatically: ${sourceLabel(field.source)}`}
            style={{
              position: "absolute",
              left: `${field.x * 100}%`,
              top: `${field.y * 100}%`,
              width: `${field.width * 100}%`,
              height: `${field.height * 100}%`,
              border: "1px dashed #16a34a",
              background: "rgba(22, 163, 74, 0.10)",
              pointerEvents: "none",
              fontSize: 9,
              lineHeight: 1,
              color: "#166534",
              overflow: "hidden",
            }}
          >
            <span style={{ padding: "0 2px" }}>{sourceLabel(field.source)}</span>
          </div>
        ))}
      {box && box.page === page.page && (
        <div
          data-testid="signature-box"
          onPointerDown={(event) => startDrag(event, "move")}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{
            position: "absolute",
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.width * 100}%`,
            height: `${box.height * 100}%`,
            border: "2px solid #111827",
            background: "rgba(55, 65, 81, 0.6)",
            boxShadow: "0 0 0 2px #ffffff, 0 0 0 4px #374151",
            zIndex: 5,
            cursor: "move",
            touchAction: "none",
            lineHeight: 1,
            fontSize: 11,
            color: "#ffffff",
            overflow: "hidden",
          }}
        >
          <span style={{ padding: "0 3px" }}>Signature</span>
          <span
            data-testid="signature-resize"
            onPointerDown={(event) => startDrag(event, "resize")}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 12,
              height: 12,
              background: "#111827",
              cursor: "nwse-resize",
              touchAction: "none",
            }}
          />
        </div>
      )}
    </>
  );

  const found = AUTO_SOURCES.filter((source) => detected.some((field) => field.source === source));
  const missing = AUTO_SOURCES.filter((source) => !found.includes(source));

  return (
    <div className="row g-3" data-testid="pdf-placement-editor">
      <div className="col-lg-8">
        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
          {pages.map((page) => (
            <button
              key={page.page}
              type="button"
              className={`btn btn-sm ${page.page === activePage ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => goToPage(page.page)}
            >
              Page {page.page}
            </button>
          ))}
        </div>
        <DeclarationPages pages={pages} activePage={activePage} renderOverlay={renderOverlay} />
      </div>
      <div className="col-lg-4">
        <h6 className="fw-semibold">Signature</h6>
        <p className="text-muted small">
          Drag the grey box to where the employee&apos;s signature goes and pull its corner to resize it.
        </p>
        <h6 className="fw-semibold mt-3">Filled automatically</h6>
        {found.length > 0 ? (
          <ul className="small mb-2" data-testid="auto-found">
            {found.map((source) => (
              <li key={source}>{sourceLabel(source)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted small mb-2">Nothing was recognised on this PDF.</p>
        )}
        {missing.length > 0 && (
          <p className="text-muted small" data-testid="auto-missing">
            Not found, so left as they are: {missing.map(sourceLabel).join(", ")}.
          </p>
        )}
        <p className="text-muted small">
          Fields are recognised from their labels and the empty cell next to them. If a form has no table borders, they are skipped.
        </p>
      </div>
    </div>
  );
};

export default PdfPlacementEditor;
