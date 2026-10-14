import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Label,
  Spinner,
  Badge,
  Table,
} from "reactstrap";

const DepartmentsCard = ({
  departments,
  deptLoading,
  newDeptName,
  setNewDeptName,
  addingDept,
  handleAddDepartment,
  deptSearch,
  setDeptSearch,
  filteredDepartments,
  hasWrite,
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-white border-bottom py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: 32,
              height: 32,
              background: "#e8f4ff",
              color: "#0a66c2",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            <i className="ri-building-line" />
          </div>
          <div>
            <h6 className="mb-0 fw-semibold">Departments</h6>
            <p className="text-muted mb-0" style={{ fontSize: 12 }}>
              Add new departments to the organization
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-4 py-3">
        <div className="mb-4">
          <Label className="fw-medium small mb-1">Department Name</Label>
          <div className="d-flex gap-2">
            <Input
              placeholder="e.g. Marketing, Finance"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddDepartment();
              }}
              disabled={addingDept}
            />
            {hasWrite && (
              <Button
                color="primary"
                className="text-white px-3"
                style={{ whiteSpace: "nowrap" }}
                onClick={handleAddDepartment}
                disabled={addingDept || !newDeptName.trim()}
              >
                {addingDept ? <Spinner size="sm" /> : "Add"}
              </Button>
            )}
          </div>
          <p className="text-muted mt-1 mb-0" style={{ fontSize: 11 }}>
            Press Enter or click Add to save
          </p>
        </div>

        <div>
          <Label className="fw-medium small mb-2 d-flex align-items-center gap-2">
            Existing Departments
            {!deptLoading && (
              <Badge color="secondary" pill>
                {departments.length}
              </Badge>
            )}
          </Label>

          {deptLoading ? (
            <div className="d-flex align-items-center gap-2 py-3">
              <Spinner size="sm" color="primary" />
              <span className="text-muted small">Loading departments...</span>
            </div>
          ) : departments.length === 0 ? (
            <div
              className="text-center py-4 rounded"
              style={{ background: "#f8f9fa" }}
            >
              <i
                className="ri-building-line text-muted"
                style={{ fontSize: 28 }}
              />
              <p className="text-muted small mb-0 mt-2">No departments yet</p>
            </div>
          ) : (
            <>
              <div className="mb-2 position-relative">
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
                  placeholder="Search departments..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  style={{ paddingLeft: 32, fontSize: 13 }}
                />
              </div>
              <div
                className="border rounded"
                style={{ maxHeight: 200, overflowY: "auto" }}
              >
                <Table size="sm" className="mb-0">
                  <thead
                    style={{
                      background: "#f8f9fa",
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    <tr>
                      <th className="px-3 py-2 small fw-semibold text-muted border-0">
                        #
                      </th>
                      <th className="px-3 py-2 small fw-semibold text-muted border-0">
                        Department
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-3 py-3 text-center text-muted small"
                        >
                          No departments match "{deptSearch}"
                        </td>
                      </tr>
                    ) : (
                      filteredDepartments.map((dept, idx) => (
                        <tr key={dept._id}>
                          <td className="px-3 py-2 small text-muted">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 small fw-medium">
                            {dept.department}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default DepartmentsCard;
