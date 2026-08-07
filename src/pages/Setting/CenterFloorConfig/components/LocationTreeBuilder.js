import React from "react";
import { Button, Badge } from "reactstrap";
import Select from "react-select";
import { MAX_LEVELS } from "../../../../utils/locationTree";

const newUid = () =>
  `n_${Math.random().toString(36).slice(2)}_${performance.now().toString(36)}`;

export const makeNode = (type, refId, name) => ({
  uid: newUid(),
  type,
  refId: String(refId),
  name,
  markMandatory: false,
  children: [],
});

// Counts leaves beneath a node, for the "n of m required" badge on groups.
const branchCounts = (node) => {
  let total = 0;
  let mandatory = 0;

  const walk = (n) => {
    if (n.children.length === 0) {
      total += 1;
      if (n.markMandatory) mandatory += 1;
      return;
    }
    n.children.forEach(walk);
  };

  walk(node);
  return { total, mandatory };
};

const LocationNodeRow = ({
  node,
  depth,
  areaOptions,
  collapsed,
  onToggleCollapse,
  onAddChild,
  onRemove,
  onToggleMandatory,
}) => {
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(node.uid);
  // depth is 0-based and the floor is level 1, so the last level that may still
  // take children is MAX_LEVELS - 2.
  const atMaxDepth = depth >= MAX_LEVELS - 1;
  const counts = hasChildren ? branchCounts(node) : null;

  // Adding the same sub-location twice under one parent would produce a
  // duplicate path, so filter the options rather than validating after.
  const takenRefIds = new Set(node.children.map((c) => c.refId));
  const available = areaOptions.filter((o) => !takenRefIds.has(o.value));

  return (
    <div>
      <div
        className="d-flex align-items-center gap-2 py-2 border-bottom"
        style={{ paddingLeft: 8 + depth * 22 }}
      >
        {hasChildren ? (
          <Button
            color="link"
            className="p-0 text-muted flex-shrink-0"
            style={{ width: 20 }}
            onClick={() => onToggleCollapse(node.uid)}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <i
              className={
                isCollapsed ? "ri-arrow-right-s-line" : "ri-arrow-down-s-line"
              }
              style={{ fontSize: 18 }}
            />
          </Button>
        ) : (
          <span
            className="text-muted flex-shrink-0 text-center"
            style={{ width: 20 }}
          >
            <i className="ri-camera-line" style={{ fontSize: 13 }} />
          </span>
        )}

        <span className="small flex-grow-1">
          {node.name}
          {counts && (
            <Badge
              color="light"
              className="text-dark border fw-normal ms-2"
              style={{ fontSize: 10 }}
            >
              {counts.mandatory} of {counts.total} required
            </Badge>
          )}
        </span>

        {/* Only a leaf collects photos, so only a leaf can be mandatory. */}
        {!hasChildren && (
          <label
            className="d-flex align-items-center gap-1 mb-0 flex-shrink-0"
            style={{ fontSize: 11, cursor: "pointer" }}
            title="Photos required at this location"
          >
            <input
              type="checkbox"
              checked={!!node.markMandatory}
              onChange={(e) => onToggleMandatory(node.uid, e.target.checked)}
            />
            <span className={node.markMandatory ? "" : "text-muted"}>
              Required
            </span>
          </label>
        )}

        <div style={{ minWidth: 190 }} className="flex-shrink-0">
          {atMaxDepth ? (
            <span className="text-muted" style={{ fontSize: 11 }}>
              Deepest level
            </span>
          ) : (
            <Select
              options={available}
              value={null}
              onChange={(selected) =>
                selected && onAddChild(node.uid, selected)
              }
              placeholder="+ Add sub-location"
              isDisabled={available.length === 0}
              menuPortalTarget={document.body}
              styles={{
                control: (base) => ({ ...base, minHeight: 30, fontSize: 12 }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, fontSize: 12 }),
                dropdownIndicator: (base) => ({ ...base, padding: 4 }),
                indicatorSeparator: () => ({ display: "none" }),
              }}
            />
          )}
        </div>

        <Button
          color="link"
          className="text-danger p-1 flex-shrink-0"
          onClick={() => onRemove(node.uid)}
          title="Remove"
        >
          <i className="ri-delete-bin-line" />
        </Button>
      </div>

      {hasChildren && !isCollapsed && (
        <div style={{ borderLeft: "2px solid #e9ecef", marginLeft: depth * 22 + 14 }}>
          {node.children.map((child) => (
            <LocationNodeRow
              key={child.uid}
              node={child}
              depth={depth + 1}
              areaOptions={areaOptions}
              collapsed={collapsed}
              onToggleCollapse={onToggleCollapse}
              onAddChild={onAddChild}
              onRemove={onRemove}
              onToggleMandatory={onToggleMandatory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LocationTreeBuilder = ({
  tree,
  areaOptions,
  floorOptions,
  collapsed,
  onToggleCollapse,
  onAddFloor,
  onAddChild,
  onRemove,
  onToggleMandatory,
}) => {
  const takenFloorIds = new Set(tree.map((n) => n.refId));
  const availableFloors = floorOptions.filter(
    (o) => !takenFloorIds.has(o.value),
  );

  return (
    <>
      <p className="text-muted mb-2" style={{ fontSize: 12 }}>
        <i className="ri-information-line me-1" />
        Only the innermost locations collect photos (
        <i className="ri-camera-line" />
        ). Adding a sub-location turns its parent into a grouping, so the parent
        stops collecting photos of its own. Nesting goes up to {MAX_LEVELS}{" "}
        levels — e.g. Floor 1 / Room 1 / Bathroom / Shower.
      </p>

      <div className="border rounded mb-3">
        {tree.length === 0 ? (
          <p className="text-muted small text-center py-4 mb-0">
            No locations yet — add a floor to begin.
          </p>
        ) : (
          tree.map((node) => (
            <LocationNodeRow
              key={node.uid}
              node={node}
              depth={0}
              areaOptions={areaOptions}
              collapsed={collapsed}
              onToggleCollapse={onToggleCollapse}
              onAddChild={onAddChild}
              onRemove={onRemove}
              onToggleMandatory={onToggleMandatory}
            />
          ))
        )}
      </div>

      <div style={{ maxWidth: 280 }}>
        <Select
          options={availableFloors}
          value={null}
          onChange={(selected) => selected && onAddFloor(selected)}
          placeholder="+ Add floor"
          isDisabled={availableFloors.length === 0}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      </div>
    </>
  );
};

export default LocationTreeBuilder;
