import React from "react";

const Loader = ({
  size = 22,
  color = "#0d6efd",
  thickness = 2,
}) => {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `${thickness}px solid rgba(0,0,0,0.1)`,
        borderTop: `${thickness}px solid ${color}`,
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
};

export default Loader;
