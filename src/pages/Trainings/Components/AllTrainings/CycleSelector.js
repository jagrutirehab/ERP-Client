import React from "react";
import { formatDate } from "../../Helpers/adminTrainingHelpers";

const CycleSelector = ({ cycles, value, onChange }) => (
  <div>
    <label className="form-label small mb-1 d-block">Cycle</label>
    <select
      className="form-select form-select-sm"
      style={{ width: 260 }}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {cycles.map((item) => (
        <option key={item.cycle} value={item.cycle}>
          {item.current
            ? `Cycle ${item.cycle} (current)`
            : `Cycle ${item.cycle} · ended ${formatDate(item.endedAt)}`}
        </option>
      ))}
    </select>
  </div>
);

export default CycleSelector;
