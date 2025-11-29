import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Spinner, Alert, Input, Label, Row, Col } from "reactstrap";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import {
  fetchMIHubSpotContacts,
  clearError,
} from "../../../../store/features/miReporting/miReportingSlice";

const HubSpotContactsTable = () => {
  const dispatch = useDispatch();

  // Redux state
  const { contacts, loading, error, pagination } = useSelector(
    (state) => state.MIReporting
  );

  // Date range state - default to last month
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return [start, end];
  });

  const fetchContacts = (page = 1, limit = 10, dates = dateRange) => {
    const [startDate, endDate] = dates;
    if (startDate && endDate) {
      dispatch(
        fetchMIHubSpotContacts({
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          page,
          limit,
        })
      );
    }
  };

  useEffect(() => {
    fetchContacts(pagination.page, pagination.limit, dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (selectedDates) => {
    if (selectedDates.length === 2) {
      setDateRange(selectedDates);
      // Auto-apply filter when both dates are selected
      fetchContacts(1, pagination.limit, selectedDates);
    }
  };

  const handlePageChange = (newPage) => {
    fetchContacts(newPage, pagination.limit, dateRange);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    fetchContacts(1, newLimit, dateRange);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* Date Range Filter */}
      <Row className="mb-3 align-items-end">
        <Col md={6}>
          <Label for="dateRange">Date Range</Label>
          <Flatpickr
            id="dateRange"
            value={dateRange}
            onChange={handleDateChange}
            options={{
              mode: "range",
              dateFormat: "d M, Y",
              maxDate: new Date(),
              disableMobile: true,
            }}
            className="form-control"
            placeholder="Select date range"
          />
          <small className="text-muted">
            Select a date range to automatically filter contacts
          </small>
        </Col>
        <Col md={6} className="text-end">
          <small className="text-muted">
            Showing {contacts.length} of {pagination.total} contacts
          </small>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2">Loading contacts...</p>
        </div>
      )}

      {/* Table */}
      {!loading && contacts.length > 0 && (
        <>
          <div className="table-responsive">
            <Table className="table-striped table-hover align-middle table-nowrap mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Center</th>
                  <th>Lead Source</th>
                  <th>Patient Name</th>
                  <th>Relation</th>
                  <th>Issues</th>
                  <th>Amount</th>
                  <th>Quality</th>
                  <th>OPD/IPD</th>
                  <th>Lifecycle Stage</th>
                  <th>Created Date</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={contact.id || index}>
                    <td>
                      <strong>
                        {contact.firstname || contact.lastname
                          ? `${contact.firstname || ""} ${
                              contact.lastname || ""
                            }`.trim()
                          : "N/A"}
                      </strong>
                    </td>
                    <td>
                      <small>{contact.email || "N/A"}</small>
                    </td>
                    <td>{contact.phone || contact.mobilephone || "N/A"}</td>
                    <td>{contact.gender || "N/A"}</td>
                    <td>{contact.city || "N/A"}</td>
                    <td>{contact.state || "N/A"}</td>
                    <td>{contact.center || "N/A"}</td>
                    <td>{contact.lead_source || "N/A"}</td>
                    <td>{contact.patient_name || "N/A"}</td>
                    <td>{contact.relation_with_patient || "N/A"}</td>
                    <td>
                      <div style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                        {contact.issues || "N/A"}
                      </div>
                    </td>
                    <td>{contact.amount || "N/A"}</td>
                    <td>{contact.quality_of_lead || "N/A"}</td>
                    <td>{contact.opd_ipd || "N/A"}</td>
                    <td>
                      <span className="badge badge-soft-info text-capitalize">
                        {contact.lifecyclestage || "N/A"}
                      </span>
                    </td>
                    <td>{formatDate(contact.createdate)}</td>
                    <td>{formatDate(contact.lastmodifieddate)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <Row className="mt-3 align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center gap-2">
                <span>Show</span>
                <Input
                  type="select"
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  style={{ width: "auto" }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Input>
                <span>entries</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </button>
                <span className="align-self-center">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Next
                </button>
              </div>
            </Col>
          </Row>
        </>
      )}

      {/* No Data Message */}
      {!loading && contacts.length === 0 && (
        <div className="text-center py-5">
          <i
            className="ri-inbox-line"
            style={{ fontSize: "3rem", color: "#ccc" }}
          ></i>
          <h5 className="mt-3 text-muted">No contacts found</h5>
          <p className="text-muted">Try adjusting your date range filter</p>
        </div>
      )}
    </div>
  );
};

export default HubSpotContactsTable;
