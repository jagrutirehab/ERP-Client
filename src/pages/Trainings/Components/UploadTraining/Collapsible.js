import React, { useEffect, useState } from "react";

const DURATION_MS = 250;

const Collapsible = ({ open, children }) => {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const timer = setTimeout(() => setExpanded(true), 20);
      return () => clearTimeout(timer);
    }

    setExpanded(false);
    const timer = setTimeout(() => setMounted(false), DURATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: expanded ? "1fr" : "0fr",
        opacity: expanded ? 1 : 0,
        transition: `grid-template-rows ${DURATION_MS}ms ease, opacity ${DURATION_MS}ms ease`,
      }}
    >
      <div style={{ overflow: "hidden", minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default Collapsible;
