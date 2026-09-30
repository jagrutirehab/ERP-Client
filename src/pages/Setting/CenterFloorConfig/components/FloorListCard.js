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

const FloorListCard = ({
  loading,
  floors,
  filteredFloors,
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
                background: "#e7f5ff",
                color: "#1971c2",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              <i className="ri-building-4-line" />
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">Floor Master</h6>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                Manage the floors used across center configurations
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {!loading && (
              <Badge color="secondary" pill>
                {search
                  ? `${filteredFloors.length} of ${floors.length}`
                  : `${floors.length}`}{" "}
                floors
              </Badge>
            )}
            {hasWrite && (
              <Button color="primary" size="sm" onClick={onAddClick}>
                <i className="ri-add-line me-1" />
                Add Floor
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-0 py-0">
        {loading ? (
          <div className="d-flex align-items-center gap-2 p-4">
            <Spinner size="sm" color="primary" />
            <span className="text-muted small">Loading floors...</span>
          </div>
        ) : floors.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="ri-building-4-line text-muted"
              style={{ fontSize: 32 }}
            />
            <p className="text-muted small mb-0 mt-2">No floors found</p>
            {hasWrite && (
              <Button
                color="primary"
                size="sm"
                className="mt-3"
                onClick={onAddClick}
              >
                Add your first floor
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
                placeholder="Search floors..."
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
                      Floor Name
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
                  {filteredFloors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-muted small"
                      >
                        No floors match "{search}"
                      </td>
                    </tr>
                  ) : (
                    filteredFloors.map((floor, idx) => (
                      <tr key={floor._id}>
                        <td className="px-4 py-2 text-muted">{idx + 1}</td>
                        <td className="px-4 py-2 fw-medium">
                          {floor.floorName}
                        </td>
                        {(hasWrite || hasDelete) && (
                          <td className="px-4 py-2 text-end">
                            <span id={`edit-floor-btn-${floor._id}`}>
                              {hasWrite && (
                                <Button
                                  color="link"
                                  className={
                                    floor.canEdit
                                      ? "text-primary p-1"
                                      : "text-muted p-1"
                                  }
                                  onClick={() =>
                                    floor.canEdit && onEditClick(floor)
                                  }
                                  disabled={!floor.canEdit}
                                >
                                  <i className="ri-pencil-line" />
                                </Button>
                              )}
                            </span>
                            {!floor.canEdit && (
                              <UncontrolledTooltip
                                target={`edit-floor-btn-${floor._id}`}
                                placement="top"
                              >
                                {floor?.centerCount} center
                                {floor?.centerCount > 1 ? "s have" : " has"}{" "}
                                already uploaded photos under this name
                              </UncontrolledTooltip>
                            )}
                            {hasDelete && (
                              <Button
                                color="link"
                                className="text-danger p-1"
                                onClick={() => onDeleteClick(floor)}
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

export default FloorListCard;
