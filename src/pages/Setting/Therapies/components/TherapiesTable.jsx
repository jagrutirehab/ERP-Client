import React from "react";
import { Table, Button } from "reactstrap";

const TherapiesTable = ({ therapies, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <Table className="table table-nowrap align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Price</th>
            <th scope="col">Created At</th>
            <th scope="col" className="text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {therapies.length > 0 ? (
            therapies.map((therapy) => (
              <tr key={therapy._id || therapy.id}>
                <td style={{ width: "300px" }}>
                  <h6 className="mb-0 text-wrap">{therapy.title}</h6>
                </td>
                <td>
                  <p className="mb-0 text-muted">
                    {" "}
                    {therapy.description.length > 75
                      ? `${therapy.description.substring(0, 75)}...`
                      : therapy.description}
                  </p>
                </td>
                <td>
                  <span className="text-muted">{therapy.price}</span>
                </td>
                <td>
                  <span className="text-muted">
                    {therapy.createdAt
                      ? new Date(therapy.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      color="link"
                      className="text-primary p-0"
                      onClick={() => onEdit(therapy)}
                    >
                      <i className="ri-pencil-line fs-16"></i>
                    </Button>
                    <Button
                      color="link"
                      className="text-danger p-0"
                      onClick={() => onDelete(therapy)}
                    >
                      <i className="ri-delete-bin-line fs-16"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                <div className="text-muted">
                  <i className="ri-inbox-line fs-48"></i>
                  <p className="mt-2">No therapies found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TherapiesTable;
