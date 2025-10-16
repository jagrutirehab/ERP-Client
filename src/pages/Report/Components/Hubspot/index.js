import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSelector, useDispatch, connect } from "react-redux";
import {
  fetchHubspotContacts,
  togglePatientForm,
} from "../../../../store/actions";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { Button, Tooltip } from "reactstrap";

const statusBadge = {
  Planned: "bg-blue-100 text-blue-700 border-blue-300",
  Completed: "bg-green-100 text-green-700 border-green-300",
  Missed: "bg-red-100 text-red-700 border-red-300",
};

const visitTypes = ["First", "Follow-up"];
const statusOptions = ["Planned", "Missed", "Completed"];
const agents = ["Agent A", "Agent B", "Agent C"];

const visitDateOptions = [
  { label: "All", value: "" },
  { label: "Today Visits", value: "today" },
  { label: "Tomorrow Visits", value: "tomorrow" },
  { label: "Past Visits", value: "past" },
  { label: "Future Visits", value: "future" },
  { label: "Planned Visits", value: "planned" },
];

const LeadDashboard = ({ leadDate, centers, centerAccess }) => {
  const dispatch = useDispatch();
  const {
    contacts = [],
    loading,
    pagination = {},
  } = useSelector((state) => state.HubspotContacts);

  // UI state
  const [filters, setFilters] = useState({
    visitType: "",
    status: "",
    assignedTo: "",
  });
  const [visitDateFilter, setVisitDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [tooltipOpen, setTooltipOpen] = useState(null);
  const buttonRefs = useRef({});

  // Fetch contacts when visitDateFilter, currentPage, or itemsPerPage changes
  useEffect(() => {
    const access = centers
      .filter((cn) => centerAccess.includes(cn._id))
      .map((cn) => {
        const titles = cn.title.split("-").join(",");
        return titles;
        // cn.title
      })
      .join(",");
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      // leadDate: leadDate,
      // visitDate: visitDateFilter,
    };
    console.log({ access });

    if (access) params.centers = access;
    if (visitDateFilter === "planned") {
      params.status = "Planned";
    } else {
      params.visitDate = visitDateFilter;
    }
    dispatch(fetchHubspotContacts(params));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitDateFilter, currentPage, itemsPerPage, dispatch, centerAccess]);

  // Reset tooltip state and cleanup refs when data changes or component unmounts
  useEffect(() => {
    // Reset tooltip state when data changes
    setTooltipOpen(null);
    // Clear refs to prevent stale references
    buttonRefs.current = {};

    // Cleanup function for unmount
    return () => {
      buttonRefs.current = {};
      setTooltipOpen(null);
    };
  }, [contacts, currentPage, visitDateFilter]);

  // Filtering (client-side for visitType, status, assignedTo)
  const filteredContacts = useMemo(() => {
    const access = centers
      .filter((cn) => centerAccess.includes(cn._id))
      .map((cn) => cn.title);

    let filtered = contacts;
    if (filters.visitType) {
      filtered = filtered.filter((c) => c.visitType === filters.visitType);
    }
    if (filters.status) {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    if (filters.assignedTo) {
      filtered = filtered.filter((c) => c.assignedTo === filters.assignedTo);
    }
    // if (access?.length > 0)
    //   filtered = filtered.filter((c) =>
    //     access.some((a) => c.center.includes(a))
    //   );
    // else filtered = [];
    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts, centerAccess, filters]);

  console.log({ filteredContacts, contacts, filters });

  // Pagination controls
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow flex flex-wrap items-center gap-2 px-4 py-3 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {visitDateOptions.map((opt) => (
            <button
              key={opt.value}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                visitDateFilter === opt.value
                  ? "bg-blue-600 text-gray-700 border-blue-600 shadow"
                  : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50"
              }`}
              onClick={() => {
                setVisitDateFilter(opt.value);
                setCurrentPage(1);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {/* Future: Add more filters here if needed */}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Lead Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                City
              </th>{" "}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Center
              </th>{" "}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Relation with patient
              </th>{" "}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Issues
              </th>{" "}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Quality of Lead
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                OPD/IPD
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Visit Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Lead Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Contact Owner
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Lifecycle Stage
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-gray-400 text-lg font-medium"
                >
                  Loading contacts...
                </td>
              </tr>
            ) : filteredContacts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-gray-400 text-lg font-medium"
                >
                  No contacts found.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 transition-colors group"
                >
                  <td className="px-4 py-3 font-bold whitespace-nowrap font-semibold text-gray-900 flex items-center gap-2">
                    {/* <span
                      role="img"
                      aria-label="user"
                      className="text-blue-400"
                    >
                      👤
                    </span>{" "} */}
                    {capitalizeWords(
                      `${contact.firstname || ""} ${contact.lastname || ""}`
                    ) || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.phone}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.gender}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.lead_source}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.city}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.center}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.relation_with_patient}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    <div style={{ width: "300px" }}>{contact.issues}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.amount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.quality_of_lead}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.opd_ipd}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    <div style={{ width: "300px" }}>{contact.notes}</div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.visitDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs font-semibold ${
                        statusBadge[contact.leadStatus] ||
                        "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {contact.leadStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.hubspot_owner_id?.name}
                  </td>
                  <td className="px-4 py-3 text-capitalize whitespace-nowrap text-gray-700">
                    {contact.lifecyclestage}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-700">
                    <div>
                      <Button
                        ref={(el) => (buttonRefs.current[index] = el)}
                        onClick={() =>
                          dispatch(
                            togglePatientForm({
                              data: null,
                              leadData: {
                                leadOrigin: "hubspot",
                                patient: {
                                  name: `${contact.firstname} ${contact.lastname}`?.trim(),
                                  phoneNumber: contact.phone,
                                  email: contact.email,
                                },
                              },
                              isOpen: true,
                            })
                          )
                        }
                        onMouseEnter={() => setTooltipOpen(index)}
                        onMouseLeave={() => setTooltipOpen(null)}
                      >
                        <i className="ri-user-add-line align-bottom text-white text-muted me-2"></i>{" "}
                      </Button>
                      {tooltipOpen === index && buttonRefs.current[index] && (
                        <Tooltip
                          isOpen={true}
                          target={buttonRefs.current[index]}
                          placement="top"
                          delay={{ show: 100, hide: 100 }}
                        >
                          Register this HubSpot contact as a new patient
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between mt-8 gap-2 bg-white rounded-xl shadow border border-gray-100 px-4 py-3">
        <div className="text-sm text-gray-600">
          Showing{" "}
          {filteredContacts.length === 0
            ? 0
            : (currentPage - 1) * itemsPerPage + 1}
          -{Math.min(currentPage * itemsPerPage, pagination?.totalItems || 0)}{" "}
          of {pagination?.totalItems || 0} contacts
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-2 py-1 text-gray-700 font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
          <select
            className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(LeadDashboard);
