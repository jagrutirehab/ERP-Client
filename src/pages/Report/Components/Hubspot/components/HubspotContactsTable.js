import React from "react";
import { Alert, Spinner } from "reactstrap";

const HubspotContactsTable = ({ contacts, loading, error }) => {
  if (error) {
    return (
      <Alert color="danger" className="mb-3">
        <strong>Error:</strong> {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" /> Loading contacts...
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Lifecycle Stage</th>
            <th>Created Date</th>
          </tr>
        </thead>
        <tbody>
          {contacts && contacts.length > 0 ? (
            contacts.map((contact) => (
              <tr key={contact.id || contact._id}>
                <td>
                  {contact.fullName ||
                    `${contact.firstname || ""} ${
                      contact.lastname || ""
                    }`.trim() ||
                    "N/A"}
                </td>
                <td>{contact.email || "-"}</td>
                <td>{contact.phone || "-"}</td>
                <td>{contact.company || "-"}</td>
                <td>
                  <span
                    className={`badge ${
                      contact.lifecyclestage === "lead"
                        ? "bg-warning"
                        : contact.lifecyclestage === "customer"
                        ? "bg-success"
                        : contact.lifecyclestage === "opportunity"
                        ? "bg-info"
                        : "bg-secondary"
                    }`}
                  >
                    {contact.lifecyclestage || "Unknown"}
                  </span>
                </td>
                <td>
                  {contact.createdate
                    ? new Date(contact.createdate).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                No contacts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HubspotContactsTable;
