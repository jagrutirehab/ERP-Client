import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import Select from "react-select";

const AddPositionsCard = ({
  departments,
  deptLoading,
  positionRows,
  addingPositions,
  addPositionRow,
  removePositionRow,
  updatePositionRow,
  handleAddPositions,
  readOnly,
}) => {
  const isFormValid = positionRows.some(
    (row) => row.department && row.names.trim(),
  );

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
                background: "#f0faf0",
                color: "#1a7340",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              <i className="ri-user-settings-line" />
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">Add Positions</h6>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                Map positions to departments
              </p>
            </div>
          </div>
          <Button
            color="light"
            size="sm"
            className="d-flex align-items-center gap-1 border"
            onClick={addPositionRow}
            disabled={addingPositions}
          >
            <i className="ri-add-line" />
            Add Row
          </Button>
        </div>
      </CardHeader>

      <CardBody className="px-4 py-3">
        <Row className="mb-2 px-1">
          <Col xs={4}>
            <span className="text-muted small fw-medium">Department</span>
          </Col>
          <Col xs={7}>
            <span className="text-muted small fw-medium">
              Positions{" "}
              <span style={{ fontWeight: 400 }}>(comma-separated)</span>
            </span>
          </Col>
        </Row>

        <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 2 }}>
          {positionRows.map((row, idx) => (
            <Row key={idx} className="mb-2 align-items-center g-2">
              <Col xs={4}>
                <Select
                  placeholder="Select dept"
                  value={
                    row.department
                      ? { label: row.department, value: row.department }
                      : null
                  }
                  onChange={(opt) =>
                    updatePositionRow(idx, "department", opt ? opt.value : "")
                  }
                  options={departments.map((d) => ({
                    label: d.department,
                    value: d.department,
                  }))}
                  isDisabled={addingPositions || deptLoading}
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: 13,
                      minHeight: 38,
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </Col>
              <Col xs={7}>
                <Input
                  placeholder="Nurse, Doctor, Pharmacist"
                  value={row.names}
                  onChange={(e) =>
                    updatePositionRow(idx, "names", e.target.value)
                  }
                  disabled={addingPositions}
                  style={{ fontSize: 13 }}
                />
              </Col>
              <Col xs={1} className="text-center">
                {positionRows.length > 1 && (
                  <Button
                    color="link"
                    className="text-danger p-0"
                    onClick={() => removePositionRow(idx)}
                    disabled={addingPositions}
                    title="Remove row"
                  >
                    <i className="ri-delete-bin-line" />
                  </Button>
                )}
              </Col>
            </Row>
          ))}
        </div>

        <p className="text-muted mt-2 mb-3" style={{ fontSize: 11 }}>
          <i className="ri-information-line me-1" />
          Separate multiple positions with commas. Each row maps to one
          department.
        </p>

        {!readOnly && (
          <div className="d-flex justify-content-end">
            <Button
              color="success"
              className="text-white px-4"
              onClick={handleAddPositions}
              disabled={addingPositions || !isFormValid}
            >
              {addingPositions ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="ri-save-line me-2" />
                  Save Positions
                </>
              )}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AddPositionsCard;
