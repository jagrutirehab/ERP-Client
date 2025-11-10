import React from "react";
import { Container } from "reactstrap";
import Sidebar from "./Sidebar";
import { Route, Routes } from "react-router-dom";
import InventoryManagement from "./InventoryManagement";
import InventoryDashboard from "./InventoryDashboard";
import GivenMedicine from "./GivenMedicine";
// import MedicineApproval from "./MedicineApproval";
// import AuditDashboad from "./AuditDashboard";

const Pharmacy = () => {
  return (
    <React.Fragment>
      <div className="page-conten overflow-hidden">
        <div className="patient-page">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <Sidebar />
              <Routes>
                <Route path={`/dashboard`} element={<InventoryDashboard />} />
                <Route path={`/management`} element={<InventoryManagement />} />
                <Route path={`/given-med`} element={<GivenMedicine />} />
                {/* <Route path={`/approval`} element={<MedicineApproval />} />
                <Route path={`/audit`} element={<AuditDashboad />} /> */}
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Pharmacy;
