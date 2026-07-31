import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container } from "reactstrap";
import Sidebar from "./Sidebar";
import Vendor from "./Vendor";
import "./masterData.scss";

const MasterData = () => {
  return (
    <div className="page-content" style={{ paddingTop: "70px" }}>
      <Container fluid className="p-0">
        <div className="master-data-shell">
          <div className="master-data-sidebar-col">
            <Sidebar />
          </div>
          <div className="master-data-content-col">
            <Routes>
              <Route path="/" element={<Navigate to="vendor" replace />} />
              <Route path="vendor/*" element={<Vendor />} />
            </Routes>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MasterData;