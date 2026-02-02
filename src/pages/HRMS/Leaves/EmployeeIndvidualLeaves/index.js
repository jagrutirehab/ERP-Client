import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { IndividualLeavesColumn } from "../../components/Table/Columns/individualEmpLeavesColumn";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import classnames from "classnames";
import { usePermissions } from "../../../../Components/Hooks/useRoles";

const IndividualLeavesOfEmp = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const location = useLocation();
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "LEAVE_HISTORY", "READ");

  const leaves = location?.state?.leaves || [];
  const employee = location?.state?.employeeId;
  // console.log("leaves", location?.state);

  const [activeTab, setActiveTab] = useState("pending");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  useEffect(() => {
    if (!hasUserPermission) navigate("/unauthorized");
  }, []);

  const filteredLeaves = useMemo(() => {
    return (leaves || [])?.filter((l) => {
      if (l?.status !== activeTab) return false;

      const created = new Date(l?.fromDate);
      // console.log("created", created.getMonth());
      // console.log("monthFilter", monthFilter);

      if (monthFilter !== "ALL" && created.getMonth() !== Number(monthFilter))
        return false;

      if (
        yearFilter !== "ALL" &&
        new Date(location?.state?.createdAt)?.getFullYear() !==
          Number(yearFilter)
      )
        return false;

      return true;
    });
  }, [leaves, activeTab, monthFilter, yearFilter])?.reverse();

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      {/* Heading */}
      <div className="mb-3">
        <h1 className="h4 fw-bold">Leaves of {employee?.name || "Employee"}</h1>
      </div>

      {/* Tabs */}

      <Nav tabs className="mb-3">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "pending" })}
            onClick={() => setActiveTab("pending")}
            style={{ cursor: "pointer", fontWeight: 500 }}
          >
            Pending
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "approved" })}
            onClick={() => setActiveTab("approved")}
            style={{ cursor: "pointer", fontWeight: 500 }}
          >
            Approved
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "rejected" })}
            onClick={() => setActiveTab("rejected")}
            style={{ cursor: "pointer", fontWeight: 500 }}
          >
            Rejected
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "retrieved" })}
            onClick={() => setActiveTab("retrieved")}
            style={{ cursor: "pointer", fontWeight: 500 }}
          >
            Retrieved
          </NavLink>
        </NavItem>
      </Nav>

      {/* Filters */}
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <select
          className="form-select w-auto"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="ALL">All Months</option>
          <option value="0">Jan</option>
          <option value="1">Feb</option>
          <option value="2">Mar</option>
          <option value="3">Apr</option>
          <option value="4">May</option>
          <option value="5">Jun</option>
          <option value="6">Jul</option>
          <option value="7">Aug</option>
          <option value="8">Sep</option>
          <option value="9">Oct</option>
          <option value="10">Nov</option>
          <option value="11">Dec</option>
        </select>

        <select
          className="form-select w-auto"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="ALL">All Years</option>
          {Array.from({ length: 2031 - 2015 + 1 }, (_, i) => {
            const year = 2015 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      {/* Table */}
      <DataTableComponent
        columns={IndividualLeavesColumn()}
        data={filteredLeaves}
        loading={false}
        pagination={false}
      />
    </CardBody>
  );
};

export default IndividualLeavesOfEmp;
