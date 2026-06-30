import React from "react";
import { getSelectedSpecialRequirements } from "../../utils/specialRequirements";

// renders the "Yes" (true) special requirements as blue selected chips
const SpecialRequirementsChips = ({
  data,
  label = "Special Requirements",
  className = "",
}) => {
  const selected = getSelectedSpecialRequirements(data);
  if (selected.length === 0) return null;

  return (
    <div className={`d-flex align-items-center flex-wrap gap-1 ${className}`}>
      {label && <span className="me-1">{label}:</span>}
      {selected.map((item) => (
        <span key={item} className="badge bg-primary rounded-pill fw-normal">
          {item}
        </span>
      ))}
    </div>
  );
};

export default SpecialRequirementsChips;
