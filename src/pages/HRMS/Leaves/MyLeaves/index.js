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
import { toast } from "react-toastify";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";

const MyLeaves = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loadingLeaveId, setLoadingLeaveId] = useState(null);

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleAuthError = useAuthError();
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

        const res = await getMyLeavesHistory({
          status: activeTab,
          year: selectedYear,
          month: selectedMonth,
          page,
          limit,
        });

        setData(res?.data || []);
        // setActiveTab(res?.status);
        // setPage(1);
        setPagination(res?.pagination || {});
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to fetch leaves");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [activeTab, selectedYear, selectedMonth, page, limit]);

  // console.log("data", data);

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
            regularizedDates: l?.regularizedDates,
          })) || [],
      )
    : [];

  const currentYear = new Date().getFullYear();
  const allYears = Array.from(
    { length: currentYear - 2015 + 6 },
    (_, i) => 2015 + i,
  );

  // console.log("leaves", leaves);

  const handleAction = async (docId, leaveId, status, action) => {
    setLoadingLeaveId(leaveId);
    try {
      const payload = { leaveId };

      const res = await retrieveActionOnLeave(action, docId, payload);

      // console.log("res to retrueve", res);
      const updated = (Array.isArray(data) ? data : []).map((d) =>
        d._id === docId
          ? {
              ...d,
              leaves: (d.leaves || []).map((l) =>
                l._id === leaveId ? { ...l, status } : l,
              ),
            }
          : d,
      );

      toast.success(res?.message);
      setActiveTab(status);
      setPage(1);
    } catch (error) {
      console.log("Action Error:", error);
    } finally {
      setLoadingLeaveId(null);
    }
  };

  // const leafPagination = {
  //   ...pagination,
  //   totalRecords: leaves.length,
  //   totalPages: Math.ceil(leaves.length / limit),
  // };

  const sortedLeaves = useMemo(() => {
  return [...leaves].sort(
    (a, b) => new Date(b.fromDate) - new Date(a.fromDate)
  );
}, [leaves]);

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
          <select
            className="form-select w-auto"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTableComponent
        columns={MyLeavesColumn(
          handleAction,
          loadingLeaveId,
          hasWrite,
          hasDelete,
          isLoading,
        )}
        data={sortedLeaves}
        loading={loading}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        // paginationData={pagination}
      />
    </CardBody>
  );
};

export default MyLeaves;
