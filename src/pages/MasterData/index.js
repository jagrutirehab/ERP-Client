import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Container, Spinner } from "reactstrap";
import Sidebar from "./Sidebar";
import Vendor from "./Vendor";
import Items from "./Items";
import UnitOfMeasurement from "./UnitOfMeasurement";
import Basic404 from "../AuthenticationInner/Errors/Basic404";
import { usePermissions } from "../../Components/Hooks/useRoles.js";
import "./masterData.scss";

const MasterData = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission, loading } = usePermissions(token);

  useEffect(() => {
    document.title = "Vendor Management | Jagruti Rehab";
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

  const canViewVendor = hasPermission("MASTERDATA", "VENDOR_VIEW", "READ");

  const canViewItems = hasPermission("MASTERDATA", "ITEM_VIEW", "READ");
  const canViewUom = hasPermission("MASTERDATA", "UOM_VIEW", "READ");

  if (!canViewVendor && !canViewItems && !canViewUom) {
    return <Basic404 />;
  }

  return (
    <div className="page-content" style={{ paddingTop: "70px" }}>
      <Container fluid className="p-0">
        <div className="master-data-shell">
          <div className="master-data-sidebar-col">
            <Sidebar />
          </div>
          <div className="master-data-content-col">
            <Routes>
              <Route path="/" element={null} />
              <Route path="vendor/*" element={<Vendor />} />
              <Route path="item/*" element={<Items />} />
              <Route path="uom/*" element={<UnitOfMeasurement />} />
            </Routes>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MasterData;
