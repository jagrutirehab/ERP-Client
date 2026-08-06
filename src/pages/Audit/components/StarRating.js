import React from "react";

// 5-star picker. Renders buttons so it stays keyboard-reachable.
const StarRating = ({ value = 0, onChange, disabled }) => {
  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            className="btn btn-link p-0 border-0"
            style={{
              lineHeight: 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            disabled={disabled}
            title={`${star} star${star > 1 ? "s" : ""}`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange && onChange(star)}
          >
            <i
              className={filled ? "ri-star-fill" : "ri-star-line"}
              style={{
                fontSize: 22,
                color: filled ? "#f59f00" : "#ced4da",
              }}
            />
          </button>
        );
      })}
      <span className="text-muted small ms-2">
        {value ? `${value}/5` : "Not rated"}
      </span>
    </div>
  );
};

export default StarRating;
