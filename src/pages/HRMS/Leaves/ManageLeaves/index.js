import React, { useEffect, useState } from "react";
import { actionOnLeaves, getLeavesRequest } from "../../../../helpers/backend_helper";
import { CardBody, Nav, NavItem, NavLink } from "reactstrap";
import DataTableComponent from "../../components/Table/DataTable";
import { leaveRequestsColumns } from "../../components/Table/Columns/leaveRequests";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import classnames from "classnames";

const ManageLeaves = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const loggedInUser = JSON.parse(localStorage.getItem("authUser"));
  const managerId = loggedInUser?.data?._id;

  useEffect(() => {
    if (!managerId) return;

    const fetchLeaves = async () => {
      try {
        const res = await getLeavesRequest(managerId);
        setData(res?.data || []);
      } catch (error) {
        console.log("API Error:", error);
      }
    };

    fetchLeaves();
  }, [managerId]);

  const leaves =
    data[0]?.leaves?.map((l) => ({
      ...l,
      parentDocId: data[0]?._id,
      employeeId: data[0]?.employeeId,
    })) || [];

  const filteredData = leaves.filter(
    (item) => item?.status?.toLowerCase() === activeTab
  );

  console.log("data", data);

const handleAction = async (docId, leaveId, status) => {
  console.log("Inside function")
  try {
    const payload = {
      leaveId,
      status,
    };

    const res = await actionOnLeaves(docId, payload);
    // console.log("Action Res:", res);

    const updated = data.map(d =>
      d._id === docId
        ? {
            ...d,
            leaves: d.leaves.map(l =>
              l._id === leaveId ? { ...l, status } : l
            ),
          }
        : d
    );

    setData(updated);
  } catch (error) {
    console.log("Action Error:", error);
  }
};



  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">MANAGE LEAVE</h1>
      </div>

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

      <DataTableComponent
        columns={leaveRequestsColumns(handleAction)}
        data={filteredData}
        loading={false}
        pagination={false}
      />
    </CardBody>
  );
};

export default ManageLeaves;
