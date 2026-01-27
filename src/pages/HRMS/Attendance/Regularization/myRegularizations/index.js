import React, { useEffect, useState } from "react";
import { getMyRegularizations } from "../../../../../helpers/backend_helper";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import DataTableComponent from "../../../components/Table/DataTable";
import { MyRegularizationsColumn } from "../../../components/Table/Columns/myRegularizationColumn";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import classnames from "classnames";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const MyRegularizations = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [regularizationsData, setRegularizationsData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "HR",
    "GET_REGULARIZATIONS_REQUESTS",
    "READ",
  );

  const handleAuthError = useAuthError();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const tabs = ["pending", "regularized", "rejected"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyRegularizations({
        status: activeTab,
        year: selectedYear,
        month: selectedMonth,
        page,
        limit,
      });

      setRegularizationsData(res?.data || []);
      setPagination(res?.pagination || {});
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) {
      navigate("/unauthorized");
    }
    fetchData();
  }, [activeTab, selectedYear, selectedMonth, page, limit]);

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

  // const filteredData = regularizationsData.filter((item) => {
  //   const statusMatch = item?.status?.toLowerCase() === activeTab;

  //   const dateObj = new Date(item.date);

  //   const yearMatch =
  //     selectedYear === "all" ||
  //     dateObj.getFullYear().toString() === selectedYear;

  //   const monthMatch =
  //     selectedMonth === "all" ||
  //     dateObj.getMonth().toString() === selectedMonth;

  //   return statusMatch && yearMatch && monthMatch;
  // });

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">My Regularizations</h1>
      </div>

      {/* Tabs */}
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

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 align-items-center">
        <select
          className="form-select form-select-sm"
          style={{ width: "110px", maxHeight: "36px" }}
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
          style={{ width: "110px", maxHeight: "36px" }}
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
        columns={MyRegularizationsColumn()}
        data={regularizationsData}
        loading={loading}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        pagination={pagination}
      />
    </CardBody>
  );
};

export default MyRegularizations;
