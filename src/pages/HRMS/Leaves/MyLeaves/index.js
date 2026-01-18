import React, { useEffect, useMemo, useState } from "react";
import {
  getMyLeavesHistory,
  retrieveActionOnLeave,
} from "../../../../helpers/backend_helper";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import classnames from "classnames";
import DataTableComponent from "../../components/Table/DataTable";
import { MyLeavesColumn } from "../../components/Table/Columns/myLeaves";
import ButtonLoader from "../../../../Components/Common/ButtonLoader";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../../Components/Hooks/useRoles";

const MyLeaves = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loadingLeaveId, setLoadingLeaveId] = useState(null);

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "MY_LEAVES", "READ");
  const hasRead = hasPermission("HR", "MY_LEAVES", "READ");
  const hasWrite = hasPermission("HR", "MY_LEAVES", "WRITE");
  const hasDelete = hasPermission("HR", "MY_LEAVES", "DELETE");
  const isReadOnly = hasRead && !hasWrite && !hasDelete;

  useEffect(() => {
    if (!hasUserPermission) navigate("/unauthorized");
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await getMyLeavesHistory();
        setData(res?.data || {});
      } catch (error) {
        console.log("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  console.log("data", data);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.toLowerCase());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const leaves = Array.isArray(data)
    ? data.flatMap(
        (d) =>
          d.leaves?.map((l) => ({
            ...l,
            parentDocId: d?._id,
            employeeId: d?.employeeId,
            docCreatedAt: d?.createdAt,
            year: d?.year,
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

  console.log("leaves", leaves);

  const filteredData = useMemo(() => {
    return leaves.filter((item) => {
      const statusMatch = item?.status?.toLowerCase() === activeTab;

      // console.log("docDate", item?.year)
      const docDate = item?.docCreatedAt ? new Date(item?.docCreatedAt) : null;

      const yearMatch =
        selectedYear === "all"
          ? true
          : docDate && docDate?.getFullYear().toString() === selectedYear;

      const monthMatch =
        selectedMonth === "all"
          ? true
          : docDate && docDate?.getMonth().toString() === selectedMonth;

      const searchMatch =
        debouncedSearch === ""
          ? true
          : item?.employeeId?.eCode?.toLowerCase().includes(debouncedSearch) ||
            item?.employeeId?.name?.toLowerCase().includes(debouncedSearch);

      return statusMatch && yearMatch && monthMatch && searchMatch;
    });
  }, [
    leaves,
    activeTab,
    selectedYear,
    selectedMonth,
    debouncedSearch,
    data?.createdAt,
  ]);

  const handleAction = async (docId, leaveId, status, action) => {
    setLoadingLeaveId(leaveId);
    try {
      const payload = { leaveId };

      await retrieveActionOnLeave(action, docId, payload);

      const updated = (Array.isArray(data) ? data : []).map((d) =>
        d._id === docId
          ? {
              ...d,
              leaves: (d.leaves || []).map((l) =>
                l._id === leaveId ? { ...l, status } : l
              ),
            }
          : d
      );

      setData(updated);
      // setActiveTab(status);
    } catch (error) {
      console.log("Action Error:", error);
    } finally {
      setLoadingLeaveId(null);
    }
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">MY LEAVES</h1>
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
        {/* Search */}
        {/* <input
          type="text"
          className="form-control w-25"
          placeholder="Search by ECode or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> */}

        <div className="d-flex gap-2">
          {/* Year Filter */}
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

          {/* Month Filter */}
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
        columns={MyLeavesColumn(
          handleAction,
          loadingLeaveId,
          hasWrite,
          hasDelete,
          isLoading
        )}
        data={filteredData}
        loading={loading}
        pagination={false}
      />
    </CardBody>
  );
};

export default MyLeaves;
