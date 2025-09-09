import React from "react";
import { Table, Button } from "reactstrap";
// import CheckPermission from "../../../Components/HOC/CheckPermission";

const ConditionsTable = ({ conditions, userRoles, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <Table className="table table-nowrap align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Created At</th>
            <th scope="col" className="text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {conditions.length > 0 ? (
            conditions.map((condition) => (
              <tr key={condition.id}>
                <td>
                  <h6 className="mb-0">{condition.title}</h6>
                </td>
                <td>
                  <p className="mb-0 text-muted">
                    {condition.description.length > 100
                      ? `${condition.description.substring(0, 100)}...`
                      : condition.description}
                  </p>
                </td>
                <td>
                  <span className="text-muted">
                    {new Date(condition.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    {/* <CheckPermission
                      accessRolePermission={userRoles?.permissions}
                      permission="edit"
                    > */}
                    <Button
                      color="link"
                      className="text-primary p-0"
                      onClick={() => onEdit(condition)}
                    >
                      <i className="ri-pencil-line fs-16"></i>
                    </Button>
                    {/* </CheckPermission>
                    <CheckPermission
                      accessRolePermission={userRoles?.permissions}
                      permission="delete"
                    > */}
                    <Button
                      color="link"
                      className="text-danger p-0"
                      onClick={() => onDelete(condition)}
                    >
                      <i className="ri-delete-bin-line fs-16"></i>
                    </Button>
                    {/* </CheckPermission> */}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">
                <div className="text-muted">
                  <i className="ri-inbox-line fs-48"></i>
                  <p className="mt-2">No conditions found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ConditionsTable;
