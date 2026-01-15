// import React, { useEffect, useState } from "react";
// import DataTableComponent from "../../components/Table/DataTable";
// import { leaveColumns } from "../../components/Table/Columns/leave";
// import { CardBody } from "reactstrap";
// import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
// import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
// import classnames from "classnames";
// import { useNavigate } from "react-router-dom";
// import { usePermissions } from "../../../../Components/Hooks/useRoles";
// import { adminGetAllLeavesInfo } from "../../../../helpers/backend_helper";

// const LeaveHistory = () => {
//   const isMobile = useMediaQuery("(max-width: 1000px)");
//   const [activeTab, setActiveTab] = useState("Approved");
//   const [leavesData, setLeavesData] = useState([]);
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);

//   const microUser = localStorage.getItem("micrologin");
//   const token = microUser ? JSON.parse(microUser).token : null;

//   // console.log("token", token);

//   const {
//     hasPermission,
//     loading: permissionLoader,
//     roles,
//   } = usePermissions(token);

//   // console.log("roles", roles);

//   const hasUserPermission =
//     // roles?.name === "SUPERADMIN" ||
//     hasPermission("HRMS", "LEAVE_HISTORY", "READ");
//   // console.log("hasUserPermission", hasUserPermission);

//   const fetchLeavesData = async () => {
//     try {
//       setLoading(true);
//       const res = await adminGetAllLeavesInfo();
//       console.log("res", res);
//       setLeavesData(res?.data);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!hasUserPermission) {
//       navigate("/unauthorized");
//     }
//     fetchLeavesData();
//   }, []);

//   console.log("leavesData", leavesData);

//   // const filteredData = leaveHistory?.filter((item) => item?.status === activeTab);

//   return (
//     <CardBody
//       className="p-3 bg-white"
//       style={isMobile ? { width: "100%" } : { width: "78%" }}
//     >
//       <div className="text-center text-md-left mb-4">
//         <h1 className="display-6 fw-bold text-primary">LEAVE HISTORY</h1>
//       </div>

//       {/* Table */}
//       <DataTableComponent
//         columns={leaveColumns(navigate)}
//         data={leavesData}
//         loading={loading}
//         pagination={false}
//       />
//     </CardBody>
//   );
// };

// export default LeaveHistory;

import React, { useEffect, useState, useMemo } from "react";
import DataTableComponent from "../../components/Table/DataTable";
import { leaveColumns } from "../../components/Table/Columns/leave";
import { CardBody, Input } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { adminGetAllLeavesInfo } from "../../../../helpers/backend_helper";

const LeaveHistory = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [leavesData, setLeavesData] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HRMS", "LEAVE_HISTORY", "READ");

  const fetchLeavesData = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllLeavesInfo();
      setLeavesData(res?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) navigate("/unauthorized");
    fetchLeavesData();
  }, []);

 
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

 
  const filteredLeaves = useMemo(() => {
    if (!debouncedSearch) return leavesData;

    return leavesData.filter((item) => {
      const empId = item?.employeeId?.eCode?.toString().toLowerCase() || "";
      const name = item?.employeeId?.name?.toLowerCase() || "";

      return (
        empId.includes(debouncedSearch.toLowerCase()) ||
        name.includes(debouncedSearch.toLowerCase())
      );
    });
  }, [debouncedSearch, leavesData]);

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">LEAVE HISTORY</h3>

        
        <Input
          type="text"
          placeholder="Search by Employee ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "280px" }}
        />
      </div>

      <DataTableComponent
        columns={leaveColumns(navigate)}
        data={filteredLeaves}
        loading={loading}
        pagination={false}
      />
    </CardBody>
  );
};

export default LeaveHistory;
