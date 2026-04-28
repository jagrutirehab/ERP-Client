import React from "react";
import { Container } from "reactstrap";
import Sidebar from "./Sidebar";
import { Route, Routes } from "react-router-dom";
import InventoryManagement from "./InventoryManagement";
import InventoryDashboard from "./InventoryDashboard";
import GivenMedicine from "./GivenMedicine";
import MedicineApproval from "./MedicineApproval";
import AuditDashboad from "./AuditDashboard";
import NurseGivenMedicine from "./NurseGivenMedicine";
import InternalTransfer from "./Requisition/InternalTransfer";
import InternalTransferAddRequest from "./Requisition/InternalTransfer/AddRequest";
import InternalTransferEditRequest from "./Requisition/InternalTransfer/EditRequest";
import StockSummary from "./StockSummary";

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
                <Route path={`/nurse-given-med`} element={<NurseGivenMedicine />} />
                <Route path={`/approval`} element={<MedicineApproval />} />
                <Route path={`/audit`} element={<AuditDashboad />} />
                <Route path={`/requisition/internal-transfer`} element={<InternalTransfer isSareyaanPage={false} />} />
                <Route path={`/requisition/internal-transfer/add`} element={<InternalTransferAddRequest />} />
                <Route path={`/requisition/internal-transfer/edit/:id`} element={<InternalTransferEditRequest transferType="internal" />} />
                <Route path={`/requisition/sareyaan-orders`} element={<InternalTransfer isSareyaanPage={true} />} />
                <Route path={`/requisition/sareyaan-orders/add`} element={<InternalTransferAddRequest />} />
                <Route path={`/requisition/sareyaan-orders/edit/:id`} element={<InternalTransferEditRequest transferType="sareyaan" />} />
                <Route path={`/stock-summary`} element={<StockSummary />} />
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Pharmacy;
