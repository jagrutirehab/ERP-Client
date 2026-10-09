import React from "react";

const DeclarationPages = ({ pages, activePage, renderOverlay, className = "" }) => {
  const visible = activePage ? pages.filter((page) => page.page === activePage) : pages;

  return (
    <div className={className}>
      {visible.map((page) => (
        <div
          key={page.page}
          className="position-relative mb-3 border rounded bg-white"
          style={{ lineHeight: 0, touchAction: "pan-y pinch-zoom" }}
          data-page={page.page}
        >
          <img
            src={page.image}
            alt={`Page ${page.page}`}
            draggable={false}
            style={{ width: "100%", height: "auto", display: "block", userSelect: "none" }}
          />
          {renderOverlay && renderOverlay(page)}
        </div>
      ))}
    </div>
  );
};

export default DeclarationPages;
