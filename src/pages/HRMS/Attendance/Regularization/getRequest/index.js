import React, { useEffect, useMemo, useState } from "react";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import DataTableComponent from "../../../components/Table/DataTable";
import { regularizeRequestColumn } from "../../../components/Table/Columns/regularizeRequestColumn";
import {
  getRegularizationsRequests,
  updateRegularizationStatus,
} from "../../../../../helpers/backend_helper";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import classnames from "classnames";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const GetRegularizationsRequest = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const handleAuthError = useAuthError();

  const [loading, setLoading] = useState(false);
  const [requestsData, setRequestsData] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const user = useSelector((state) => state.User);
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "HR",
    "GET_REGULARIZATIONS_REQUESTS",
    "READ",
  );
  const hasWrite = hasPermission("HR", "GET_REGULARIZATIONS_REQUESTS", "WRITE");
  const hasDelete = hasPermission(
    "HR",
    "GET_REGULARIZATIONS_REQUESTS",
    "DELETE",
  );
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
    }
  }, [selectedCenter, user?.centerAccess]);

  const tabs = ["pending", "regularized", "rejected"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRegularizationsRequests();
      setRequestsData(res?.data || []);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const allYears = Array.from({ length: 2031 - 2015 + 1 }, (_, i) => 2015 + i);

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
  const filteredData = useMemo(() => {
    const allowedCenters = user?.centerAccess || [];

    return requestsData.filter((item) => {
      const statusMatch =
        item?.status?.toLowerCase() === activeTab?.toLowerCase();

      const dateObj = new Date(item.date || item.createdAt);

      const yearMatch =
        selectedYear === "all" ||
        dateObj.getFullYear().toString() === selectedYear;

      const monthMatch =
        selectedMonth === "all" ||
        dateObj.getMonth().toString() === selectedMonth;

      const searchMatch =
        !debouncedSearch ||
        item?.employee_id?.eCode?.toLowerCase()?.includes(debouncedSearch) ||
        item?.employee_id?.name?.toLowerCase()?.includes(debouncedSearch);

      const centerId = item?.center?._id || item?.center;

      const centerMatch = !allowedCenters.length
        ? true
        : selectedCenter === "ALL"
          ? allowedCenters.includes(centerId?.toString())
          : centerId === selectedCenter;

      return (
        statusMatch && yearMatch && monthMatch && searchMatch && centerMatch
      );
    });
  }, [
    requestsData,
    activeTab,
    selectedYear,
    selectedMonth,
    debouncedSearch,
    selectedCenter,
    user?.centerAccess,
  ]);

  const handleAction = async (id, status) => {
    console.log("Id in function", id);
    try {
      setActionLoadingId(id);
      await updateRegularizationStatus(id, status );
      toast.success(`Request ${status} successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Action failed");
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
        <h1 className="display-6 fw-bold text-primary">
          Regularizations Requests
        </h1>
      </div>

      <Nav tabs className="mb-3">
        {tabs.map((tab) => (
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

      <div className="d-flex gap-2 mb-3">
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
              <option key={c?.value} value={c?.value}>
                {c?.label}
              </option>
            ))
          )}
        </select>

        <input
          type="text"
          className="form-control form-control-sm"
          style={{ width: "220px" }}
          placeholder="Search by ECode or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-select form-select-sm"
          style={{ width: "120px" }}
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

      <DataTableComponent
        columns={regularizeRequestColumn(
          handleAction,
          activeTab,
          isLoading,
          hasWrite,
          hasDelete,
          actionLoadingId,
        )}
        data={filteredData}
        loading={loading}
      />
    </CardBody>
  );
};

export default GetRegularizationsRequest;
