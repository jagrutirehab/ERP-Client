import React from "react";
import { Container, Spinner } from "reactstrap";
import { Route, Routes, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import InventoryManagement from "./InventoryManagement";
import InventoryDashboard from "./InventoryDashboard";
import GivenMedicine from "./GivenMedicine";
import MedicineApproval from "./MedicineApproval";
import AuditDashboad from "./AuditDashboard";
import NurseGivenMedicine from "./NurseGivenMedicine";
import InternalTransfer from "./Requisition/InternalTransfer";
import InternalTransferAddRequest from "./Requisition/InternalTransfer/AddRequest";
import InternalTransferEditRequest from "./Requisition/InternalTransfer/EditRequest";
import MedicineRequisition from "./Requisition/MedicineRequisition";
import MedicineRequisitionAddRequest from "./Requisition/MedicineRequisition/AddRequest";
import MedicineRequisitionEditRequest from "./Requisition/MedicineRequisition/EditRequest";
import StockSummary from "./StockSummary";
// import OCRBillImport from "./OCRBillImport/OCRBillImport";
// import BillUploadDashboard from "./BillUploadDashboard/BillUploadDashboard";
import { usePermissions } from "../../Components/Hooks/useRoles";

const Pharmacy = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading: permissionLoader } = usePermissions(token);
  const hasUserPermission = hasPermission("PHARMACY", null, "READ");

  if (permissionLoader) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  if (!permissionLoader && !hasUserPermission) {
    navigate("/unauthorized");
  }

  document.title = "Pharmacy Dashboard";
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
                <Route path={`/requisition/medicine-requisition`} element={<MedicineRequisition />} />
                <Route path={`/requisition/medicine-requisition/add`} element={<MedicineRequisitionAddRequest />} />
                <Route path={`/requisition/medicine-requisition/edit/:id`} element={<MedicineRequisitionEditRequest />} />
                <Route path={`/stock-summary`} element={<StockSummary />} />
                {/* <Route path={`/ocr-bill-import`} element={<OCRBillImport />} />
                <Route path={`/bill-upload-dashboard`} element={<BillUploadDashboard />} /> */}
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Pharmacy;
