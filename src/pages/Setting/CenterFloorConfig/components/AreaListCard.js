import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
  Badge,
  Table,
  Button,
  UncontrolledTooltip,
} from "reactstrap";

const AreaListCard = ({
  loading,
  areas,
  filteredAreas,
  search,
  setSearch,
  onAddClick,
  onEditClick,
  onDeleteClick,
  hasWrite,
  hasDelete,
}) => {
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
                background: "#f3f0ff",
                color: "#6741d9",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              <i className="ri-door-open-line" />
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">Rooms &amp; Areas Master</h6>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                Spaces that can sit inside a floor — rooms, kitchen, bathroom
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {!loading && (
              <Badge color="secondary" pill>
                {search
                  ? `${filteredAreas.length} of ${areas.length}`
                  : `${areas.length}`}{" "}
                areas
              </Badge>
            )}
            {hasWrite && (
              <Button color="primary" size="sm" onClick={onAddClick}>
                <i className="ri-add-line me-1" />
                Add Area
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-0 py-0">
        {loading ? (
          <div className="d-flex align-items-center gap-2 p-4">
            <Spinner size="sm" color="primary" />
            <span className="text-muted small">Loading areas...</span>
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="ri-door-open-line text-muted"
              style={{ fontSize: 32 }}
            />
            <p className="text-muted small mb-0 mt-2">No areas found</p>
            {hasWrite && (
              <Button
                color="primary"
                size="sm"
                className="mt-3"
                onClick={onAddClick}
              >
                Add your first area
              </Button>
            )}
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
                placeholder="Search areas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13, maxWidth: 360 }}
              />
            </div>
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
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
                      Area Name
                    </th>
                    {(hasWrite || hasDelete) && (
                      <th
                        className="px-4 py-3 fw-semibold text-muted border-0 text-end"
                        style={{ width: 140 }}
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredAreas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-muted small"
                      >
                        No areas match "{search}"
                      </td>
                    </tr>
                  ) : (
                    filteredAreas.map((area, idx) => (
                      <tr key={area._id}>
                        <td className="px-4 py-2 text-muted">{idx + 1}</td>
                        <td className="px-4 py-2 fw-medium">{area.areaName}</td>
                        {(hasWrite || hasDelete) && (
                          <td className="px-4 py-2 text-end">
                            <span id={`edit-area-btn-${area._id}`}>
                              {hasWrite && (
                                <Button
                                  color="link"
                                  className={
                                    area.canEdit
                                      ? "text-primary p-1"
                                      : "text-muted p-1"
                                  }
                                  onClick={() =>
                                    area.canEdit && onEditClick(area)
                                  }
                                  disabled={!area.canEdit}
                                >
                                  <i className="ri-pencil-line" />
                                </Button>
                              )}
                            </span>
                            {!area.canEdit && (
                              <UncontrolledTooltip
                                target={`edit-area-btn-${area._id}`}
                                placement="top"
                              >
                                {area?.centerCount} center
                                {area?.centerCount > 1 ? "s have" : " has"}{" "}
                                already uploaded photos under this name
                              </UncontrolledTooltip>
                            )}
                            {hasDelete && (
                              <Button
                                color="link"
                                className="text-danger p-1"
                                onClick={() => onDeleteClick(area)}
                                title="Delete"
                              >
                                <i className="ri-delete-bin-line" />
                              </Button>
                            )}
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
    </Card>
  );
};

export default AreaListCard;
