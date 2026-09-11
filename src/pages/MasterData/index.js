import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Container, Spinner } from "reactstrap";
import Sidebar from "./Sidebar";
import Vendor from "./Vendor";
import Items from "./Items";
import UnitOfMeasurement from "./UnitOfMeasurement";
import PaymentTerm from "./PaymentTerm";
import DepartmentMaster from "./DepartmentMaster";
import AssetCategory from "./AssetCategory";
import BudgetManagement from "./Finance/BudgetManagement";
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

  const canViewVendor = hasPermission("MASTERDATA", "VENDOR", "READ");
  const canViewItems = hasPermission("MASTERDATA", "ITEM_MASTER", "READ");
  const canViewUom = hasPermission("MASTERDATA", "UOM", "READ");
  const canViewAssetCategory = hasPermission(
    "MASTERDATA",
    "ASSET_CATEGORY",
    "READ",
  );
  const canViewBudget = hasPermission("MASTERDATA", "BUDGET", "READ");

  if (
    !canViewVendor &&
    !canViewItems &&
    !canViewUom &&
    !canViewAssetCategory &&
    !canViewBudget
  ) {
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
              <Route path="payment-term/*" element={<PaymentTerm />} />
              <Route path="department/*" element={<DepartmentMaster />} />
              <Route
                path="asset-category/level/:level/*"
                element={<AssetCategory />}
              />
              <Route path="budget/*" element={<BudgetManagement />} />
            </Routes>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MasterData;
