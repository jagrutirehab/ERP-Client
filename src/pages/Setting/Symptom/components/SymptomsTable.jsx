import React from "react";
import { Table, Button } from "reactstrap";

const SymptomsTable = ({ symptoms, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <Table className="table table-nowrap align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Created At</th>
            <th scope="col" className="text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {symptoms.length > 0 ? (
            symptoms.map((symptom) => (
              <tr key={symptom._id || symptom.id}>
                <td>
                  <h6 className="mb-0">
                    <span className="text-capitalize">{symptom.title}</span>
                  </h6>
                </td>

                <td>
                  <span className="text-muted">
                    {symptom.createdAt
                      ? new Date(symptom.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      color="link"
                      className="text-primary p-0"
                      onClick={() => onEdit(symptom)}
                    >
                      <i className="ri-pencil-line fs-16"></i>
                    </Button>
                    <Button
                      color="link"
                      className="text-danger p-0"
                      onClick={() => onDelete(symptom)}
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
                  <p className="mt-2">No symptoms found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default SymptomsTable;
