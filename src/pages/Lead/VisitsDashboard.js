import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaUser,
  FaCheck,
  FaTimes,
  FaEdit,
  FaEye,
} from "react-icons/fa";

// Mock data for contacts
const mockContacts = [
  {
    id: 1,
    name: "Ali Raza",
    email: "ali.raza@example.com",
    phone: "+923001234567",
    leadSource: "Website",
    owner: "Sarah Khan",
    visitDate: new Date().toISOString().split("T")[0],
    visitType: "First",
    status: "Planned",
    assignedTo: "Agent A",
  },
  {
    id: 2,
    name: "Fatima Noor",
    email: "fatima.noor@example.com",
    phone: "+923004567890",
    leadSource: "Referral",
    owner: "Ahmed Ali",
    visitDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    visitType: "Follow-up",
    status: "Planned",
    assignedTo: "Agent B",
  },
  {
    id: 3,
    name: "Usman Tariq",
    email: "usman.tariq@example.com",
    phone: "+923008765432",
    leadSource: "Event",
    owner: "Sarah Khan",
    visitDate: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    visitType: "First",
    status: "Missed",
    assignedTo: "Agent C",
  },
  {
    id: 4,
    name: "Ayesha Siddiqui",
    email: "ayesha.siddiqui@example.com",
    phone: "+923009876543",
    leadSource: "LinkedIn",
    owner: "Ahmed Ali",
    visitDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    visitType: "Follow-up",
    status: "Planned",
    assignedTo: "Agent A",
  },
  {
    id: 5,
    name: "Bilal Hassan",
    email: "bilal.hassan@example.com",
    phone: "+923001112233",
    leadSource: "Website",
    owner: "Sarah Khan",
    visitDate: new Date().toISOString().split("T")[0],
    visitType: "First",
    status: "Completed",
    assignedTo: "Agent B",
  },
  // ...add more mock contacts as needed
];

const visitTypes = ["First", "Follow-up"];
const statusOptions = ["Planned", "Missed", "Completed"];
const agents = ["Agent A", "Agent B", "Agent C"];

const tabOptions = [
  { label: "All Contacts", filter: () => true },
  {
    label: "Visits Planned Today",
    filter: (c) => c.visitDate === new Date().toISOString().split("T")[0],
  },
  {
    label: "Visits Planned Tomorrow",
    filter: (c) =>
      c.visitDate ===
      new Date(Date.now() + 86400000).toISOString().split("T")[0],
  },
  {
    label: "This Week's Visits",
    filter: (c) => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const visit = new Date(c.visitDate);
      return visit >= start && visit <= end;
    },
  },
  { label: "Missed Visits", filter: (c) => c.status === "Missed" },
  { label: "Completed Visits", filter: (c) => c.status === "Completed" },
];

const statusBadge = {
  Planned: "bg-blue-100 text-blue-700 border-blue-300",
  Completed: "bg-green-100 text-green-700 border-green-300",
  Missed: "bg-red-100 text-red-700 border-red-300",
};

const PAGE_SIZE = 5;

const VisitsDashboard = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    visitDate: "",
    visitType: "",
    status: "",
    assignedTo: "",
  });
  const [page, setPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);

  // KPI calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000)
    .toISOString()
    .split("T")[0];
  const visitsToday = mockContacts.filter(
    (c) => c.visitDate === todayStr
  ).length;
  const visitsTomorrow = mockContacts.filter(
    (c) => c.visitDate === tomorrowStr
  ).length;
  const totalVisits = mockContacts.length;

  // Filtering
  let filteredContacts = mockContacts.filter(tabOptions[activeTab].filter);
  if (filters.visitDate) {
    filteredContacts = filteredContacts.filter(
      (c) => c.visitDate === filters.visitDate
    );
  }
  if (filters.visitType) {
    filteredContacts = filteredContacts.filter(
      (c) => c.visitType === filters.visitType
    );
  }
  if (filters.status) {
    filteredContacts = filteredContacts.filter(
      (c) => c.status === filters.status
    );
  }
  if (filters.assignedTo) {
    filteredContacts = filteredContacts.filter(
      (c) => c.assignedTo === filters.assignedTo
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);
  const paginatedContacts = filteredContacts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Calendar mock (for demonstration)
  const calendarDates = mockContacts.map((c) => ({
    date: c.visitDate,
    name: c.name,
    status: c.status,
  }));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPIBox
          label="Visits Planned Today"
          value={visitsToday}
          icon={<FaCalendarAlt />}
          color="blue"
        />
        <KPIBox
          label="Visits Planned Tomorrow"
          value={visitsTomorrow}
          icon={<FaCalendarAlt />}
          color="purple"
        />
        <KPIBox
          label="Total Visits Planned"
          value={totalVisits}
          icon={<FaCalendarAlt />}
          color="green"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabOptions.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-2 rounded-lg font-medium border transition-colors duration-150 text-sm ${
              activeTab === idx
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
            }`}
            onClick={() => {
              setActiveTab(idx);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
        <button
          className="ml-auto px-4 py-2 rounded-lg font-medium border border-gray-300 bg-white text-gray-700 hover:bg-blue-50"
          onClick={() => setShowCalendar((v) => !v)}
        >
          {showCalendar ? "Hide Calendar" : "Show Calendar"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Visit Date
          </label>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filters.visitDate}
            onChange={(e) => {
              setFilters((f) => ({ ...f, visitDate: e.target.value }));
              setPage(1);
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Visit Type
          </label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filters.visitType}
            onChange={(e) => {
              setFilters((f) => ({ ...f, visitType: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">All</option>
            {visitTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Status
          </label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">All</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Assigned Agent
          </label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filters.assignedTo}
            onChange={(e) => {
              setFilters((f) => ({ ...f, assignedTo: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">All</option>
            {agents.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar View */}
      {showCalendar && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600" /> Upcoming Visits
            Calendar (Mock)
          </h3>
          <div className="flex flex-wrap gap-2">
            {calendarDates.map((d, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded border text-xs font-medium ${
                  statusBadge[d.status] ||
                  "bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                {d.date}: {d.name} ({d.status})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Contact Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Lead Source
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Contact Owner
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Visit Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Visit Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Assigned To
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400">
                  No contacts found.
                </td>
              </tr>
            ) : (
              paginatedContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                    <FaUser className="text-blue-400" /> {contact.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {contact.email}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {contact.phone}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {contact.leadSource}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {contact.owner}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {contact.visitDate}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {contact.visitType}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs font-semibold ${
                        statusBadge[contact.status] ||
                        "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {contact.assignedTo}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center flex gap-2 justify-center">
                    <button
                      className="p-1 rounded hover:bg-blue-100"
                      title="View"
                    >
                      <FaEye className="text-blue-600" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-yellow-100"
                      title="Edit"
                    >
                      <FaEdit className="text-yellow-600" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-green-100"
                      title="Mark as Done"
                    >
                      <FaCheck className="text-green-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
        <div className="text-sm text-gray-600">
          Showing{" "}
          {filteredContacts.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, filteredContacts.length)} of{" "}
          {filteredContacts.length} contacts
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="px-2 py-1 text-gray-700">
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
const KPIBox = ({ label, value, icon, color }) => (
  <div
    className={`flex items-center gap-4 bg-white rounded-lg shadow p-4 border-t-4 border-${color}-500`}
  >
    <div className={`text-${color}-600 text-3xl`}>{icon}</div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  </div>
);

export default VisitsDashboard;
