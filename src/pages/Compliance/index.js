import React from "react";
import { Container, Spinner } from "reactstrap";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";
import Sidebar from "./Sidebar";
import Overview from "./pages/Overview";
import CenterDetail from "./pages/CenterDetail";
import Register from "./pages/Register";
import UploadDocument from "./forms/UploadDocument";
import ComplianceTypes from "./pages/ComplianceTypes";
import ComplianceTypeForm from "./forms/ComplianceTypeForm";
import Categories from "./pages/Categories";
import Approvals from "./pages/Approvals";
import MyDrafts from "./pages/MyDrafts";
import AllDrafts from "./pages/AllDrafts";


const Compliance = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading: permissionLoader } = usePermissions(token);
  const hasUserPermission = hasPermission("COMPLIANCE", null, "READ");

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

  return (
    <div className="page-conten overflow-hidden">
      <div className="patient-page">
        <Container fluid>
          <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
            <Sidebar />
            <div className="flex-grow-1 bg-white" style={{ minWidth: 0 }}>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="centres/:centreId" element={<CenterDetail />} />
                <Route path="register" element={<Register />} />
                <Route path="upload" element={<UploadDocument />} />
                <Route path="types" element={<ComplianceTypes />} />
                <Route path="types/new" element={<ComplianceTypeForm />} />
                <Route
                  path="types/:typeId/edit"
                  element={<ComplianceTypeForm />}
                />
                <Route path="categories" element={<Categories />} />
                <Route path="approvals" element={<Approvals />} />
                <Route path="my-drafts" element={<MyDrafts />} />
                <Route path="drafts" element={<AllDrafts />} />
                <Route
                  path="*"
                  element={<Navigate to="/compliance" replace />}
                />
              </Routes>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Compliance;
