// Locations are stored flat — one entry per leaf, each carrying its full path —
// because a nested tree cannot be expressed cleanly as a Mongoose schema.
// Nothing is lost: every intermediate node is implied by being a slotKey prefix
// of some leaf, so the tree is rebuilt here whenever it needs rendering.

export const SLOT_SEPARATOR = ">";

// Total levels the builder allows, counting the floor as level 1 —
// e.g. Floor 1 / Room 1 / Bathroom / Shower. The server accepts deeper paths as
// a tolerant backstop; this is the limit the UI enforces.
export const MAX_LEVELS = 4;

// Deepest areaPath length that fits within MAX_LEVELS (the floor is not an area).
export const MAX_DEPTH = MAX_LEVELS - 1;

export const buildSlotKey = (floorId, areaPath = []) =>
  [floorId, ...areaPath].map((id) => String(id)).join(SLOT_SEPARATOR);

export const buildLocationLabel = (segments = []) =>
  segments.filter(Boolean).join(" / ");

/**
 * Turn a flat slot list into a tree.
 *
 * Group nodes carry `children` and a null `slot`; leaves carry `slot` and no
 * children — so a renderer can tell "this is a heading" from "this collects
 * photos" without extra flags.
 */
export const buildLocationTree = (slots = []) => {
  const tree = [];
  const nodeByKey = new Map();

  slots.forEach((slot) => {
    const segmentIds = String(slot.slotKey).split(SLOT_SEPARATOR);
    const segmentNames = [slot.floorName, ...(slot.areaNames || [])];

    let siblings = tree;
    let cumulativeKey = "";

    segmentIds.forEach((segmentId, level) => {
      cumulativeKey =
        level === 0 ? segmentId : `${cumulativeKey}${SLOT_SEPARATOR}${segmentId}`;

      let node = nodeByKey.get(cumulativeKey);
      if (!node) {
        node = {
          key: cumulativeKey,
          id: segmentId,
          name: segmentNames[level],
          level,
          children: [],
          slot: null,
        };
        nodeByKey.set(cumulativeKey, node);
        siblings.push(node);
      }

      if (level === segmentIds.length - 1) {
        node.slot = slot;
      }

      siblings = node.children;
    });
  });

  return tree;
};

/**
 * Collapse an editable tree back to the flat leaf list the API expects.
 * Only leaves become slots, and only ids are sent — the server resolves names.
 */
export const flattenTreeToSlots = (tree = []) => {
  const slots = [];

  const walkAreas = (nodes, floorId, areaPath) => {
    nodes.forEach((node) => {
      const path = [...areaPath, node.refId];

      if (node.children.length === 0) {
        slots.push({
          floor: floorId,
          areaPath: path,
          markMandatory: !!node.markMandatory,
          order: slots.length,
        });
        return;
      }

      walkAreas(node.children, floorId, path);
    });
  };

  // Root nodes are always floors; everything below them is an area.
  tree.forEach((floorNode) => {
    if (floorNode.children.length === 0) {
      slots.push({
        floor: floorNode.refId,
        areaPath: [],
        markMandatory: !!floorNode.markMandatory,
        order: slots.length,
      });
      return;
    }

    walkAreas(floorNode.children, floorNode.refId, []);
  });

  return slots;
};

// Counts for the "n of m required" badge on a group node.
export const summariseBranch = (node) => {
  let total = 0;
  let mandatory = 0;
  let filled = 0;

  const walk = (n) => {
    if (n.slot && n.children.length === 0) {
      total += 1;
      if (n.slot.markMandatory) mandatory += 1;
      if ((n.slot.files || []).length > 0) filled += 1;
      return;
    }
    n.children.forEach(walk);
  };

  walk(node);
  return { total, mandatory, filled };
};
