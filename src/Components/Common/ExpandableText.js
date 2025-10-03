import { useState } from "react";

export const ExpandableText = ({ text, limit = 80 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return "-";

  const toggle = () => setExpanded((prev) => !prev);

  return (
    <div>
      {expanded
        ? text
        : text.slice(0, limit) + (text.length > limit ? "..." : "")}
      {text.length > limit && (
        <span
          onClick={toggle}
          className="text-primary cursor-pointer ms-1"
          style={{ fontSize: "0.9rem", textDecoration: "underline" }}
        >
          {expanded ? "Show less" : "Read more"}
        </span>
      )}
    </div>
  );
};
