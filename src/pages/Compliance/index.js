import React from "react";
import { Container } from "reactstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Overview from "./Overview";
import CenterDetail from "./CenterDetail";
import Register from "./Register";
import UploadDocument from "./UploadDocument";
import ComplianceTypes from "./ComplianceTypes";
import ComplianceTypeForm from "./ComplianceTypeForm";
import Approvals from "./Approvals";

// Same shell pattern as Pharmacy/HR: "page-conten" (not the real "page-content"
// class) + "patient-page" gives the correct top offset below the fixed navbar,
// and the negative margins cancel the Container's gutter so the sidebar and
// content sit flush edge-to-edge instead of floating as a card with grey
// background showing around it.
const Compliance = () => {
  return (
    <div className="page-conten overflow-hidden">
      <div className="patient-page">
        <Container fluid>
          <div className="d-flex flex-column flex-lg-row align-items-stretch gap-0 mx-n4 my-n4 mb-n5">
            <Sidebar />
            <div className="flex-grow-1 bg-white" style={{ minWidth: 0 }}>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="centres/:centreId" element={<CenterDetail />} />
                <Route path="register" element={<Register />} />
                <Route path="upload" element={<UploadDocument />} />
                <Route path="types" element={<ComplianceTypes />} />
                <Route path="types/new" element={<ComplianceTypeForm />} />
                <Route path="types/:typeId/edit" element={<ComplianceTypeForm />} />
                <Route path="approvals" element={<Approvals />} />
                <Route path="*" element={<Navigate to="/compliance" replace />} />
              </Routes>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Compliance;
