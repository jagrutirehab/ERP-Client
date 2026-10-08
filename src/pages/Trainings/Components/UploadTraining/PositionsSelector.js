import React, { useMemo, useState } from "react";

const PositionsSelector = ({
  allPositions,
  selectedPositions,
  onToggle,
  onChange,
  isSubmitted,
  loading,
}) => {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return allPositions;
    return allPositions.filter((position) =>
      position.name.toLowerCase().includes(needle),
    );
  }, [allPositions, search]);

  const allVisibleSelected =
    visible.length > 0 &&
    visible.every((position) => selectedPositions.includes(position._id));

  const handleSelectAll = () => {
    const visibleIds = visible.map((position) => position._id);
    if (allVisibleSelected) {
      onChange(selectedPositions.filter((id) => !visibleIds.includes(id)));
    } else {
      onChange([...new Set([...selectedPositions, ...visibleIds])]);
    }
  };

  const nameById = useMemo(
    () => new Map(allPositions.map((position) => [position._id, position.name])),
    [allPositions],
  );

  return (
    <div className="mb-3">
      <label className="form-label">Select Positions</label>
      <input
        type="text"
        className="form-control form-control-sm mb-2"
        placeholder="Search positions"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div
        className="border p-3 rounded"
        style={{ maxHeight: "240px", overflowY: "auto" }}
      >
        <div className="form-check border-bottom pb-2 mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="select-all-positions"
            checked={allVisibleSelected}
            disabled={visible.length === 0}
            onChange={handleSelectAll}
          />
          <label
            className="form-check-label fw-semibold"
            htmlFor="select-all-positions"
          >
            {search.trim() ? `Select all shown (${visible.length})` : "Select All"}
          </label>
        </div>
        {loading ? (
          <small className="text-muted">Loading positions...</small>
        ) : visible.length > 0 ? (
          visible.map((position) => (
            <div key={position._id} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`position-${position._id}`}
                checked={selectedPositions.includes(position._id)}
                onChange={() => onToggle(position._id)}
              />
              <label className="form-check-label" htmlFor={`position-${position._id}`}>
                {position.name}
              </label>
            </div>
          ))
        ) : (
          <small className="text-muted">
            {allPositions.length === 0 ? "No positions available" : "No positions match your search"}
          </small>
        )}
      </div>
      {isSubmitted && selectedPositions.length === 0 && (
        <small className="text-danger d-block mt-2">Select at least one position</small>
      )}
      {selectedPositions.length > 0 && (
        <small className="text-success d-block mt-2">
          Selected ({selectedPositions.length}):{" "}
          {selectedPositions.map((id) => nameById.get(id) || id).join(", ")}
        </small>
      )}
    </div>
  );
};

export default PositionsSelector;
