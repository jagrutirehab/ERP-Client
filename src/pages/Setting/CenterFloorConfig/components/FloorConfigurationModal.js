import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert,
  Badge,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  getFloors,
  getAreas,
  getCenterFloorsConfiguration,
  postCenterFloorsConfiguration,
} from "../../../../helpers/backend_helper";

const FloorConfigurationModal = ({ isOpen, toggle, center, onSuccess }) => {
  const [floorsList, setFloorsList] = useState([]);
  const [areasList, setAreasList] = useState([]);
  const [loading, setLoading] = useState(false);
  // { [floorId]: { selected, markMandatory, areas: { [areaId]: { selected, markMandatory } } } }
  const [selections, setSelections] = useState({});
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
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

        const floors = floorsRes?.data || [];
        const areas = areasRes?.data || [];
        const existingFloors = configRes?.data || [];

        const existingByFloor = existingFloors.reduce(
          (acc, f) => ({ ...acc, [f.floor]: f }),
          {},
        );

        setFloorsList(floors);
        setAreasList(areas);
        setSelections(
          floors.reduce((acc, floor) => {
            const existing = existingByFloor[floor._id];
            const existingAreas = (existing?.areas || []).reduce(
              (areaAcc, a) => ({ ...areaAcc, [a.area]: a.markMandatory }),
              {},
            );

            return {
              ...acc,
              [floor._id]: {
                selected: !!existing,
                markMandatory: existing ? !!existing.markMandatory : false,
                areas: areas.reduce((areaAcc, area) => {
                  const isExisting = Object.prototype.hasOwnProperty.call(
                    existingAreas,
                    area._id,
                  );
                  return {
                    ...areaAcc,
                    [area._id]: {
                      selected: isExisting,
                      markMandatory: isExisting
                        ? !!existingAreas[area._id]
                        : false,
                    },
                  };
                }, {}),
              },
            };
          }, {}),
        );
        // Open the floors that already have areas so the config is visible.
        setExpanded(
          existingFloors.reduce(
            (acc, f) => ({ ...acc, [f.floor]: (f.areas || []).length > 0 }),
            {},
          ),
        );
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch floors";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isOpen, center]);

  const handleFloorSelect = (floorId, checked) => {
    setSelections((prev) => ({
      ...prev,
      [floorId]: {
        ...prev[floorId],
        selected: checked,
        markMandatory: checked ? prev[floorId]?.markMandatory : false,
      },
    }));
    if (checked) setExpanded((prev) => ({ ...prev, [floorId]: true }));
  };

  const handleFloorMandatory = (floorId, checked) => {
    setSelections((prev) => ({
      ...prev,
      [floorId]: { ...prev[floorId], markMandatory: checked },
    }));
  };

  const handleAreaSelect = (floorId, areaId, checked) => {
    setSelections((prev) => ({
      ...prev,
      [floorId]: {
        ...prev[floorId],
        areas: {
          ...prev[floorId]?.areas,
          [areaId]: {
            selected: checked,
            markMandatory: checked
              ? prev[floorId]?.areas?.[areaId]?.markMandatory
              : false,
          },
        },
      },
    }));
  };

  const handleAreaMandatory = (floorId, areaId, checked) => {
    setSelections((prev) => ({
      ...prev,
      [floorId]: {
        ...prev[floorId],
        areas: {
          ...prev[floorId]?.areas,
          [areaId]: {
            ...prev[floorId]?.areas?.[areaId],
            markMandatory: checked,
          },
        },
      },
    }));
  };

  const handleSelectAll = (checked) => {
    setSelections((prev) => {
      const updated = { ...prev };
      floorsList.forEach((floor) => {
        updated[floor._id] = {
          ...prev[floor._id],
          selected: checked,
          markMandatory: checked
            ? prev[floor._id]?.markMandatory || false
            : false,
        };
      });
      return updated;
    });
  };

  const resetAndClose = () => {
    setSearch("");
    setError("");
    toggle();
  };

  const selectedAreasFor = (floorId) =>
    areasList.filter((area) => selections[floorId]?.areas?.[area._id]?.selected);

  const handleSubmit = async () => {
    setError("");

    const requiredFloors = floorsList
      .filter((floor) => selections[floor._id]?.selected)
      .map((floor) => ({
        floor: floor._id,
        floorName: floor.floorName,
        markMandatory: !!selections[floor._id]?.markMandatory,
        areas: selectedAreasFor(floor._id).map((area) => ({
          area: area._id,
          areaName: area.areaName,
          markMandatory:
            !!selections[floor._id]?.areas?.[area._id]?.markMandatory,
        })),
      }));

    if (requiredFloors.length === 0) {
      setError("Select at least one floor");
      return;
    }

    setSubmitting(true);
    try {
      const res = await postCenterFloorsConfiguration({
        center: center._id,
        requiredFloors,
      });

      onSuccess && onSuccess(res.data);
      resetAndClose();

      toast.success(
        res?.data?.message || "Floor Configuration Saved Successfully.",
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to save configuration";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFloors = floorsList.filter((f) =>
    (f.floorName || "").toLowerCase().includes(search.toLowerCase()),
  );

  const allSelected =
    floorsList.length > 0 &&
    floorsList.every((f) => selections[f._id]?.selected);

  const selectedCount = floorsList.filter(
    (f) => selections[f._id]?.selected,
  ).length;

  return (
    <Modal isOpen={isOpen} toggle={resetAndClose} centered size="lg">
      <style>{`
        .floor-toggle {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 22px;
          flex-shrink: 0;
        }
        .floor-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .floor-toggle-slider {
          position: absolute;
          inset: 0;
          background-color: #dee2e6;
          transition: background-color 0.25s ease;
          border-radius: 34px;
          cursor: pointer;
        }
        .floor-toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: #fff;
          transition: transform 0.25s ease;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }
        .floor-toggle input:checked + .floor-toggle-slider {
          background-color: #0d6efd;
        }
        .floor-toggle input:checked + .floor-toggle-slider:before {
          transform: translateX(20px);
        }
        .floor-toggle input:disabled + .floor-toggle-slider {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .floor-row {
          display: grid;
          grid-template-columns: 24px 1fr 76px 42px 28px;
          align-items: center;
          gap: 14px;
          padding: 10px 4px;
          border-bottom: 1px solid #f1f3f5;
        }
        .area-row {
          display: grid;
          grid-template-columns: 24px 1fr 76px 42px;
          align-items: center;
          gap: 14px;
          padding: 7px 4px;
        }
        .area-panel {
          background: #f8f9fa;
          border-left: 3px solid #dee2e6;
          border-bottom: 1px solid #f1f3f5;
          padding: 8px 4px 8px 34px;
        }
      `}</style>

      <ModalHeader toggle={resetAndClose}>
        Configure Floors {center?.centerName ? `— ${center.centerName}` : ""}
      </ModalHeader>

      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <Spinner size="sm" color="primary" />
            <span className="text-muted small">Loading floors...</span>
          </div>
        ) : floorsList.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted small mb-0">
              No floors available. Add floors in the Floor Master above first.
            </p>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
              <div className="position-relative flex-grow-1">
                <i
                  className="ri-search-line position-absolute text-muted"
                  style={{
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 14,
                    pointerEvents: "none",
                  }}
                />
                <Input
                  placeholder="Search floors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 30, fontSize: 13 }}
                />
              </div>
              <span
                className="text-muted flex-shrink-0"
                style={{ fontSize: 12, whiteSpace: "nowrap" }}
              >
                {selectedCount} selected
              </span>
            </div>

            <p className="text-muted mb-2" style={{ fontSize: 12 }}>
              <i className="ri-information-line me-1" />
              Expand a floor to pick its rooms and areas. A floor with areas
              collects photos per area instead of at floor level.
            </p>

            <div
              className="floor-row"
              style={{ borderBottom: "2px solid #e9ecef" }}
            >
              <Input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="fw-semibold small text-muted">Floor</span>
              <span className="fw-semibold small text-muted">Mandatory</span>
              <span />
              <span />
            </div>

            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {filteredFloors.length === 0 ? (
                <p className="text-muted small text-center py-3 mb-0">
                  No floors match "{search}"
                </p>
              ) : (
                filteredFloors.map((floor) => {
                  const sel = selections[floor._id] || {
                    selected: false,
                    markMandatory: false,
                    areas: {},
                  };
                  const chosenAreas = selectedAreasFor(floor._id);
                  const isExpanded = !!expanded[floor._id];

                  return (
                    <div key={floor._id}>
                      <div className="floor-row">
                        <Input
                          type="checkbox"
                          checked={sel.selected}
                          onChange={(e) =>
                            handleFloorSelect(floor._id, e.target.checked)
                          }
                        />
                        <span
                          className="small d-flex align-items-center gap-2"
                          style={{ opacity: sel.selected ? 1 : 0.6 }}
                        >
                          {floor.floorName}
                          {chosenAreas.length > 0 && (
                            <Badge
                              color="light"
                              className="text-dark border fw-normal"
                              style={{ fontSize: 10 }}
                            >
                              {chosenAreas.length} area
                              {chosenAreas.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </span>
                        <span
                          className="text-muted"
                          style={{
                            fontSize: 11,
                            opacity: sel.selected ? 1 : 0.4,
                          }}
                        >
                          {sel.markMandatory ? "Required" : "Optional"}
                        </span>
                        <label className="floor-toggle">
                          <input
                            type="checkbox"
                            checked={sel.markMandatory}
                            disabled={!sel.selected}
                            onChange={(e) =>
                              handleFloorMandatory(floor._id, e.target.checked)
                            }
                          />
                          <span className="floor-toggle-slider" />
                        </label>
                        <Button
                          color="link"
                          className="p-0 text-muted"
                          title={isExpanded ? "Hide areas" : "Configure areas"}
                          disabled={!sel.selected}
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [floor._id]: !prev[floor._id],
                            }))
                          }
                        >
                          <i
                            className={
                              isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                            }
                            style={{ fontSize: 18 }}
                          />
                        </Button>
                      </div>

                      {sel.selected && isExpanded && (
                        <div className="area-panel">
                          {areasList.length === 0 ? (
                            <p
                              className="text-muted mb-0"
                              style={{ fontSize: 12 }}
                            >
                              No areas available. Add them in the Rooms &amp;
                              Areas Master first.
                            </p>
                          ) : (
                            <>
                              <div className="area-row">
                                <span />
                                <span
                                  className="fw-semibold text-muted"
                                  style={{ fontSize: 11 }}
                                >
                                  Room / Area
                                </span>
                                <span
                                  className="fw-semibold text-muted"
                                  style={{ fontSize: 11 }}
                                >
                                  Mandatory
                                </span>
                                <span />
                              </div>
                              {areasList.map((area) => {
                                const areaSel = sel.areas?.[area._id] || {
                                  selected: false,
                                  markMandatory: false,
                                };
                                return (
                                  <div className="area-row" key={area._id}>
                                    <Input
                                      type="checkbox"
                                      checked={areaSel.selected}
                                      onChange={(e) =>
                                        handleAreaSelect(
                                          floor._id,
                                          area._id,
                                          e.target.checked,
                                        )
                                      }
                                    />
                                    <span
                                      style={{
                                        fontSize: 12,
                                        opacity: areaSel.selected ? 1 : 0.6,
                                      }}
                                    >
                                      {area.areaName}
                                    </span>
                                    <span
                                      className="text-muted"
                                      style={{
                                        fontSize: 11,
                                        opacity: areaSel.selected ? 1 : 0.4,
                                      }}
                                    >
                                      {areaSel.markMandatory
                                        ? "Required"
                                        : "Optional"}
                                    </span>
                                    <label className="floor-toggle">
                                      <input
                                        type="checkbox"
                                        checked={areaSel.markMandatory}
                                        disabled={!areaSel.selected}
                                        onChange={(e) =>
                                          handleAreaMandatory(
                                            floor._id,
                                            area._id,
                                            e.target.checked,
                                          )
                                        }
                                      />
                                      <span className="floor-toggle-slider" />
                                    </label>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
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

export default FloorConfigurationModal;
