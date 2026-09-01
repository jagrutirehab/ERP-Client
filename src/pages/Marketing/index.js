import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Container, Spinner } from "reactstrap";
import Sidebar from "./Sidebar";
import AddVisitLog from "./AddVisitLog";
import VisitLogList from "./VisitLogList";
import AgentReport from "./AgentReport";
import AgentProfile from "./AgentProfile";
import Basic404 from "../AuthenticationInner/Errors/Basic404";
import { usePermissions } from "../../Components/Hooks/useRoles.js";
import Logout from "../Authentication/Logout.js";
import DoctorDirectoryExport from "./DoctorDirectoryExport";
import MyDrafts from "./MyDrafts";
const Marketing = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission, loading } = usePermissions(token);

  useEffect(() => {
    document.title = "Marketing | Jagruti Rehab";
  }, []);

  if (loading) {
    return (
      <div
        className="page-content d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  const canViewAdd = hasPermission("MARKETING", "ADD_VISIT_LOG", "READ");
  const canViewList = hasPermission("MARKETING", "VIEW_VISIT_LOGS", "READ");
  const canViewReport = hasPermission("MARKETING", "VIEW_AGENT_REPORT", "READ");
  const canViewProfile = hasPermission(
    "MARKETING",
    "VIEW_AGENT_PROFILE",
    "READ",
  );
  const canViewDoctorExport = hasPermission(
    "MARKETING",
    "EXPORT_DOCTOR_DIRECTORY",
    "READ",
  );
  const canViewDrafts = hasPermission("MARKETING", "ADD_VISIT_LOG", "READ");
  if (
    !canViewAdd &&
    !canViewList &&
    !canViewReport &&
    !canViewProfile &&
    !canViewDoctorExport &&
    !canViewDrafts
  ) {
    return <Basic404 />;
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div
            className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1"
            style={{ alignItems: "flex-start", overflowX: "visible" }}
          >
            <Sidebar />
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <Routes>
                {canViewAdd && (
                  <Route path="visit-log/add" element={<AddVisitLog />} />
                )}
                {canViewList && (
                  <Route path="visit-log/list" element={<VisitLogList />} />
                )}
                {canViewReport && (
                  <Route path="reports/agent" element={<AgentReport />} />
                )}
                {canViewProfile && (
                  <Route path="my-profile" element={<AgentProfile />} />
                )}
                {canViewDoctorExport && (
                  <Route
                    path="doctors/export"
                    element={<DoctorDirectoryExport />}
                  />
                )}
                {canViewDrafts && (
                  <Route path="drafts" element={<MyDrafts />} />
                )}
                <Route index element={null} />
                <Route path="*" element={<Logout />} />
              </Routes>
            </div>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Marketing;
