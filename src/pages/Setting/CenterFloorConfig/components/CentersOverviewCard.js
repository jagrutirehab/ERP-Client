import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
  Badge,
  Table,
} from "reactstrap";
import LocationConfigurationModal from "./LocationConfigurationModal";

const CentersOverviewCard = ({
  loading,
  centerRows,
  filteredCenters,
  centerSearch,
  setCenterSearch,
  hasWrite,
  onConfigured,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const openConfigModal = (center) => {
    setSelectedCenter(center);
    setModalOpen(true);
  };

  const toggleModal = () => setModalOpen((prev) => !prev);

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-white border-bottom py-3 px-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 32,
                height: 32,
                background: "#fff4e6",
                color: "#b45309",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              <i className="ri-hospital-line" />
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">Centers Overview</h6>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                Choose which floors show up for each center
              </p>
            </div>
          </div>
          {!loading && (
            <Badge color="secondary" pill>
              {centerSearch
                ? `${filteredCenters.length} of ${centerRows.length}`
                : `${centerRows.length}`}{" "}
              centers
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardBody className="px-0 py-0">
        {loading ? (
          <div className="d-flex align-items-center gap-2 p-4">
            <Spinner size="sm" color="primary" />
            <span className="text-muted small">Loading centers...</span>
          </div>
        ) : centerRows.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="ri-hospital-line text-muted"
              style={{ fontSize: 32 }}
            />
            <p className="text-muted small mb-0 mt-2">No centers found</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-bottom position-relative">
              <i
                className="ri-search-line position-absolute text-muted"
                style={{
                  left: 26,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  pointerEvents: "none",
                }}
              />
              <Input
                placeholder="Search by center or city..."
                value={centerSearch}
                onChange={(e) => setCenterSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13, maxWidth: 360 }}
              />
            </div>
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              <Table hover className="mb-0" style={{ fontSize: 13 }}>
                <thead
                  style={{ background: "#f8f9fa", position: "sticky", top: 0 }}
                >
                  <tr>
                    <th
                      className="px-4 py-3 fw-semibold text-muted border-0"
                      style={{ width: 60 }}
                    >
                      #
                    </th>
                    <th className="px-4 py-3 fw-semibold text-muted border-0">
                      Center
                    </th>
                    <th className="px-4 py-3 fw-semibold text-muted border-0">
                      City
                    </th>
                    <th className="px-4 py-3 fw-semibold text-muted border-0">
                      Floors
                    </th>
                    <th className="px-4 py-3 fw-semibold text-muted border-0">
                      Photo Locations
                    </th>
                    {hasWrite && (
                      <th className="px-4 py-3 fw-semibold text-muted border-0">
                        Configuration
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredCenters.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-center text-muted small"
                      >
                        No centers match "{centerSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredCenters.map((item, idx) => (
                      <tr key={item._id}>
                        <td className="px-4 py-2 text-muted">{idx + 1}</td>
                        <td className="px-4 py-2 fw-medium">
                          {item.centerName}
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            color="light"
                            className="text-dark border fw-normal px-2 py-1"
                            style={{ fontSize: 11 }}
                          >
                            {item.city}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          {item.totalFloors === 0 ? (
                            <span className="text-muted">Not configured</span>
                          ) : (
                            <span>
                              {item.totalFloors} floor
                              {item.totalFloors > 1 ? "s" : ""}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {item.totalSlots === 0 ? (
                            <span className="text-muted">—</span>
                          ) : (
                            <span>
                              {item.totalSlots} location
                              {item.totalSlots > 1 ? "s" : ""}
                              {item.mandatorySlots > 0 && (
                                <span className="text-muted">
                                  {" "}
                                  ({item.mandatorySlots} required)
                                </span>
                              )}
                              {item.maxDepth > 0 && (
                                <span className="text-muted">
                                  {" "}
                                  · up to {item.maxDepth + 1} levels
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                        {hasWrite && (
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => openConfigModal(item)}
                            >
                              Configure
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </CardBody>

      <LocationConfigurationModal
        isOpen={modalOpen}
        toggle={toggleModal}
        center={selectedCenter}
        onSuccess={onConfigured}
      />
    </Card>
  );
};

export default CentersOverviewCard;
