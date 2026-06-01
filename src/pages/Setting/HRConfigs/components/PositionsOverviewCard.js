import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
  Badge,
  Table,
} from "reactstrap";

const PositionsOverviewCard = ({
  positionsLoading,
  flatPositions,
  filteredPositions,
  positionSearch,
  setPositionSearch,
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
                background: "#fff4e6",
                color: "#b45309",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              <i className="ri-list-check-2" />
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">Positions Overview</h6>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                All active positions mapped to departments
              </p>
            </div>
          </div>
          {!positionsLoading && (
            <Badge color="secondary" pill>
              {positionSearch
                ? `${filteredPositions.length} of ${flatPositions.length}`
                : `${flatPositions.length}`}{" "}
              positions
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardBody className="px-0 py-0">
        {positionsLoading ? (
          <div className="d-flex align-items-center gap-2 p-4">
            <Spinner size="sm" color="primary" />
            <span className="text-muted small">Loading positions...</span>
          </div>
        ) : flatPositions.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="ri-list-check-2 text-muted"
              style={{ fontSize: 32 }}
            />
            <p className="text-muted small mb-0 mt-2">No positions found</p>
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
                placeholder="Search by position or department..."
                value={positionSearch}
                onChange={(e) => setPositionSearch(e.target.value)}
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
                      Position
                    </th>
                    <th className="px-4 py-3 fw-semibold text-muted border-0">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPositions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-muted small"
                      >
                        No positions match "{positionSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredPositions.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-muted">{idx + 1}</td>
                        <td className="px-4 py-2 fw-medium">
                          {item.positionName}
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            color="light"
                            className="text-dark border fw-normal px-2 py-1"
                            style={{ fontSize: 11 }}
                          >
                            {item.department}
                          </Badge>
                        </td>
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

export default PositionsOverviewCard;
