import React, { useEffect, useMemo, useState } from "react";
import {
  actionOnLeaves,
  getLeavesRequest,
} from "../../../../helpers/backend_helper";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import DataTableComponent from "../../components/Table/DataTable";
import { leaveRequestsColumns } from "../../components/Table/Columns/leaveRequests";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import classnames from "classnames";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../../Components/Hooks/useRoles";

const ManageLeaves = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "LEAVE_HISTORY", "READ");

  const loggedInUser = JSON.parse(localStorage.getItem("authUser"));
  const managerId = loggedInUser?.data?._id;

  useEffect(() => {
    if (!managerId) return;
    if (!hasUserPermission) navigate("/unauthorized");

    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await getLeavesRequest(managerId);
        setData(res?.data || []);
      } catch (error) {
        console.log("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [managerId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.toLowerCase());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // console.log("data", data)

  const leaves = Array.isArray(data)
    ? data?.flatMap(
        (d) =>
          d?.leaves?.map((l) => ({
            ...l,
            parentDocId: d?._id,
            employeeId: d?.employeeId,
            docCreatedAt: d?.createdAt,
            eCode: d?.eCode,
            center: d?.center,
            approvalAuthority: d?.approvalAuthority,
          })) || []
      )
    : [];

  const currentYear = new Date().getFullYear();
  const allYears = Array.from(
    { length: currentYear - 2015 + 6 },
    (_, i) => 2015 + i
  );

  const filteredData = useMemo(() => {
    return leaves.filter((item) => {
      const statusMatch = item?.status?.toLowerCase() === activeTab;

      const docDate = item?.docCreatedAt ? new Date(item.docCreatedAt) : null;

      const yearMatch =
        selectedYear === "all"
          ? true
          : docDate && docDate.getFullYear().toString() === selectedYear;

      const monthMatch =
        selectedMonth === "all"
          ? true
          : docDate && docDate.getMonth().toString() === selectedMonth;

      const searchMatch =
        debouncedSearch === ""
          ? true
          : item?.employeeId?.eCode?.toLowerCase().includes(debouncedSearch) ||
            item?.employeeId?.name?.toLowerCase().includes(debouncedSearch);

      return statusMatch && yearMatch && monthMatch && searchMatch;
    });
  }, [leaves, activeTab, selectedYear, selectedMonth, debouncedSearch]);

  const handleAction = async (docId, leaveId, status) => {
    setActionLoadingId(leaveId);
    try {
      const payload = { leaveId, status };

      await actionOnLeaves(docId, payload);

      const updated = (data || []).map((d) =>
        d?._id === docId
          ? {
              ...d,
              leaves: d?.leaves?.map((l) =>
                l._id === leaveId ? { ...l, status } : l
              ),
            }
          : d
      );

      setData(updated);
    } catch (error) {
      console.log("Action Error:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">MANAGE LEAVES</h1>
      </div>

      <Nav tabs className="mb-3">
        {["pending", "approved", "rejected", "retrieved"].map((tab) => (
          <NavItem key={tab}>
            <NavLink
              className={classnames({ active: activeTab === tab })}
              onClick={() => setActiveTab(tab)}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search by ECode or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="d-flex gap-2">
          <select
            className="form-select w-auto"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {allYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Months Filter */}
          {/* <select
            className="form-select w-auto"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {[
              "Jan","Feb","Mar","Apr","May","Jun",
              "Jul","Aug","Sep","Oct","Nov","Dec"
            ].map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select> */}
        </div>
      </div>

      <DataTableComponent
        columns={leaveRequestsColumns(handleAction, actionLoadingId)}
        data={filteredData}
        loading={loading}
        pagination={false}
      />
    </CardBody>
  );
};

export default ManageLeaves;
