import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  getFloors,
  getAreas,
  getCenterFloorsConfiguration,
  postCenterFloorsConfiguration,
} from "../../../../helpers/backend_helper";
import { flattenTreeToSlots, SLOT_SEPARATOR } from "../../../../utils/locationTree";
import LocationTreeBuilder, { makeNode } from "./LocationTreeBuilder";

// Rebuild the editable tree from the flat slot list the API returns.
const slotsToEditableTree = (slots) => {
  const roots = [];
  const byKey = new Map();

  slots.forEach((slot) => {
    const segmentIds = String(slot.slotKey).split(SLOT_SEPARATOR);
    const segmentNames = [slot.floorName, ...(slot.areaNames || [])];

    let siblings = roots;
    let cumulativeKey = "";

    segmentIds.forEach((segmentId, level) => {
      cumulativeKey =
        level === 0 ? segmentId : `${cumulativeKey}${SLOT_SEPARATOR}${segmentId}`;

      let node = byKey.get(cumulativeKey);
      if (!node) {
        node = makeNode(
          level === 0 ? "floor" : "area",
          segmentId,
          segmentNames[level],
        );
        byKey.set(cumulativeKey, node);
        siblings.push(node);
      }

      // Mandatory only ever lives on a leaf.
      if (level === segmentIds.length - 1) {
        node.markMandatory = !!slot.markMandatory;
      }

      siblings = node.children;
    });
  });

  return roots;
};

// Immutable tree edits, all keyed by uid.
const mapTree = (nodes, uid, fn) =>
  nodes.map((node) => {
    if (node.uid === uid) return fn(node);
    if (node.children.length === 0) return node;
    return { ...node, children: mapTree(node.children, uid, fn) };
  });

const removeFromTree = (nodes, uid) =>
  nodes
    .filter((node) => node.uid !== uid)
    .map((node) =>
      node.children.length === 0
        ? node
        : { ...node, children: removeFromTree(node.children, uid) },
    );

const countLeaves = (nodes) =>
  nodes.reduce(
    (sum, node) =>
      sum + (node.children.length === 0 ? 1 : countLeaves(node.children)),
    0,
  );

const LocationConfigurationModal = ({ isOpen, toggle, center, onSuccess }) => {
  const [floors, setFloors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tree, setTree] = useState([]);
  const [collapsed, setCollapsed] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !center?._id) return;

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [floorsRes, areasRes, configRes] = await Promise.all([
          getFloors(),
          getAreas(),
          getCenterFloorsConfiguration(center._id),
        ]);

        setFloors(floorsRes?.data || []);
        setAreas(areasRes?.data || []);
        setTree(slotsToEditableTree(configRes?.data || []));
        setCollapsed(new Set());
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch locations";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isOpen, center]);

  const floorOptions = useMemo(
    () =>
      floors.map((f) => ({ value: String(f._id), label: f.floorName })),
    [floors],
  );

  const areaOptions = useMemo(
    () => areas.map((a) => ({ value: String(a._id), label: a.areaName })),
    [areas],
  );

  const handleAddFloor = (option) => {
    setTree((prev) => [...prev, makeNode("floor", option.value, option.label)]);
  };

  const handleAddChild = (uid, option) => {
    setTree((prev) =>
      mapTree(prev, uid, (node) => ({
        ...node,
        // A parent stops collecting photos of its own, so its mandatory flag
        // no longer means anything.
        markMandatory: false,
        children: [
          ...node.children,
          makeNode("area", option.value, option.label),
        ],
      })),
    );
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.delete(uid);
      return next;
    });
  };

  const handleRemove = (uid) => {
    setTree((prev) => removeFromTree(prev, uid));
  };

  const handleToggleMandatory = (uid, checked) => {
    setTree((prev) =>
      mapTree(prev, uid, (node) => ({ ...node, markMandatory: checked })),
    );
  };

  const handleToggleCollapse = (uid) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const resetAndClose = () => {
    setError("");
    toggle();
  };

  const handleSubmit = async () => {
    setError("");

    const slots = flattenTreeToSlots(tree);

    if (slots.length === 0) {
      setError("Add at least one location");
      return;
    }

    setSubmitting(true);
    try {
      const res = await postCenterFloorsConfiguration({
        center: center._id,
        slots,
      });

      onSuccess && onSuccess(res.data);
      resetAndClose();

      toast.success(
        res?.data?.message || "Location Configuration Saved Successfully.",
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to save configuration";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const leafCount = countLeaves(tree);

  return (
    <Modal isOpen={isOpen} toggle={resetAndClose} centered size="lg">
      <ModalHeader toggle={resetAndClose}>
        Configure Locations {center?.centerName ? `— ${center.centerName}` : ""}
      </ModalHeader>

      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <Spinner size="sm" color="primary" />
            <span className="text-muted small">Loading locations...</span>
          </div>
        ) : floors.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted small mb-0">
              No floors available. Add floors in the Floor Master first.
            </p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-end mb-2">
              <span className="text-muted" style={{ fontSize: 12 }}>
                {leafCount} photo location{leafCount === 1 ? "" : "s"}
              </span>
            </div>

            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              <LocationTreeBuilder
                tree={tree}
                areaOptions={areaOptions}
                floorOptions={floorOptions}
                collapsed={collapsed}
                onToggleCollapse={handleToggleCollapse}
                onAddFloor={handleAddFloor}
                onAddChild={handleAddChild}
                onRemove={handleRemove}
                onToggleMandatory={handleToggleMandatory}
              />
            </div>
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" outline onClick={resetAndClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={submitting || loading}
        >
          {submitting ? (
            <span className="d-inline-flex align-items-center justify-content-center gap-1">
              <Spinner size="sm" /> Saving...
            </span>
          ) : (
            "Save Configuration"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default LocationConfigurationModal;
