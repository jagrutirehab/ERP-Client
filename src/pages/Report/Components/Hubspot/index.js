import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchHubspotContacts } from "../../../../store/actions";
import { capitalizeWords } from "../../../../utils/toCapitalize";

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
  { label: "Planned Visits", value: "planned" },
];

const LeadDashboard = ({ leadDate }) => {
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

  // Fetch contacts when visitDateFilter, currentPage, or itemsPerPage changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      // leadDate: leadDate,
      // visitDate: visitDateFilter,
    };
    if (visitDateFilter === "planned") {
      params.status = "Planned";
    } else {
      params.visitDate = visitDateFilter;
    }

    console.log(params, "params");
    dispatch(fetchHubspotContacts(params));
  }, [visitDateFilter, currentPage, itemsPerPage, dispatch]);

  // Filtering (client-side for visitType, status, assignedTo)
  const filteredContacts = useMemo(() => {
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
    return filtered;
  }, [contacts, filters]);

  console.log(filteredContacts, "filteredContacts");

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
              filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
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
                    {contact.contactOwner}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {contact.lifecyclestage}
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

export default LeadDashboard;
