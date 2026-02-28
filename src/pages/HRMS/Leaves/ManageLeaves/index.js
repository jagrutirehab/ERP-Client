import React, { useEffect, useMemo, useState } from "react";
import {
  actionOnLeaves,
  getLeavesRequest,
} from "../../../../helpers/backend_helper";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { leaveRequestsColumns } from "../../components/Table/Columns/leaveRequests";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import classnames from "classnames";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { toast } from "react-toastify";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useSelector } from "react-redux";

const ManageLeaves = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const handleAuthError = useAuthError();

  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("q") || "";
  const queryTab = searchParams.get("tab") || "pending";
  const queryCenter = searchParams.get("center") || "ALL";
  const [activeTab, setActiveTab] = useState(queryTab);
  const [search, setSearch] = useState(querySearch);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(queryCenter);
  const [requestsData, setRequestsData] = useState([]);
  const user = useSelector((state) => state.User);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "MANAGE_LEAVES", "READ");
  const hasRead = hasPermission("HR", "MANAGE_LEAVES", "READ");
  const hasWrite = hasPermission("HR", "MANAGE_LEAVES", "WRITE");
  const hasDelete = hasPermission("HR", "MANAGE_LEAVES", "DELETE");

  const loggedInUser = JSON.parse(localStorage.getItem("authUser"));
  const managerId = loggedInUser?.data?._id;

  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [
          {
            value: "ALL",
            label: "All Centers",
            isDisabled: false,
          },
        ]
      : []),
    ...(user?.centerAccess?.map((id) => {
      const center = user?.userCenters?.find((c) => c._id === id);
      return {
        value: id,
        label: center?.title || "Unknown Center",
      };
    }) || []),
  ];

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) ||
    centerOptions[0];

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      !user?.centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [selectedCenter, user?.centerAccess]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let centers = [];

      if (selectedCenter === "") {
        centers = [];
      } else if (selectedCenter === "ALL") {
        centers = user?.centerAccess || [];
      } else {
        centers = [selectedCenter];
      }
      const res = await getLeavesRequest(managerId, {
        page,
        limit,
        centers,
        status: activeTab,
        year: selectedYear,
        month: selectedMonth,
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      // console.log("res", res);
      setRequestsData(res?.data || []);
      setPagination(res?.pagination || null);
    } catch (error) {
      console.log("API Error:", error);
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch reportings");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!managerId) return;
    if (!hasUserPermission) navigate("/unauthorized");
    fetchLeaves();
  }, [
    managerId,
    page,
    limit,
    selectedCenter,
    activeTab,
    selectedYear,
    selectedMonth,
    debouncedSearch,
    user?.centerAccess,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.toLowerCase());
      setSearchParams((prev) => {
        if (search.trim()) {
          prev.set("q", search);
        } else {
          prev.delete("q");
          prev.delete("tab");
          prev.delete("center");
        }
        return prev;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // console.log("data", data)

  const leaves = useMemo(() => {
    if (!Array.isArray(requestsData)) return [];

    return requestsData.map((item) => ({
      ...item.leaves, 
      parentDocId: item._id,
      leaveId: item.leaves._id, 
      employeeId: item.id,
      center: item.center, 
      approvalAuthority: item.approvalAuthority,
      createdAt: item.createdAt,
      eCode: item.eCode,
    }));
  }, [requestsData]);

  const currentYear = new Date().getFullYear();
  const allYears = Array.from(
    { length: currentYear - 2015 + 6 },
    (_, i) => 2015 + i,
  );

  const handleAction = async (docId, leaveId, status) => {
    setActionLoadingId(leaveId);
    try {
      const payload = { leaveId, status };

      const res = await actionOnLeaves(docId, payload);

      toast.success(res?.message);

      fetchLeaves();
      // setRequestsData(updated);
    } catch (error) {
      console.log("Action Error:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const months = [
    { value: "all", label: "All Months" },
    { value: 0, label: "Jan" },
    { value: 1, label: "Feb" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Apr" },
    { value: 4, label: "May" },
    { value: 5, label: "Jun" },
    { value: 6, label: "Jul" },
    { value: 7, label: "Aug" },
    { value: 8, label: "Sep" },
    { value: 9, label: "Oct" },
    { value: 10, label: "Nov" },
    { value: 11, label: "Dec" },
  ];

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
        <div className="d-flex align-items-center gap-3">
          {/* Center Dropdown */}
          <select
            className="form-select"
            style={{ width: "180px" }}
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            disabled={!centerOptions.length}
          >
            {centerOptions.length === 0 ? (
              <option value="">No Centers Available</option>
            ) : (
              centerOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))
            )}
          </select>

          {/* Search */}
          <input
            type="text"
            className="form-control"
            style={{ width: "260px" }}
            placeholder="Search by name or Ecode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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

          <select
            className="form-select form-select-sm"
            style={{ width: "120px" }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTableComponent
        columns={leaveRequestsColumns(
          handleAction,
          actionLoadingId,
          isLoading,
          hasWrite,
          hasDelete,
          activeTab,
        )}
        data={leaves}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        loading={loading}
      />
    </CardBody>
  );
};

export default ManageLeaves;
