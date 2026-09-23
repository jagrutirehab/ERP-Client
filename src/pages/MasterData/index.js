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
import PurchaseRequisition from "./Procurement/PurchaseRequisition";
import PurchaseOrder from "./Procurement/PurchaseOrder";
import RFQModule from "./Procurement/RFQ";
import Contract from "./Contract";
import DeliveryIntimation from "./Procurement/DeliveryIntimation";
import GoodsReceiptNote from "./Inventory/GRN";
import StorageLocation from "./Inventory/StorageLocation";
import Putaway from "./Inventory/Putaway";
import Stock from "./Inventory/Stock";
import InventoryTransfer from "./Inventory/InventoryTransfer";
import MoveOrder from "./Inventory/MoveOrder";
import CycleCount from "./Inventory/CycleCount";
import StockAdjustment from "./Inventory/StockAdjustment";
import ReorderRule from "./Inventory/ReorderRule";
import MaterialIssue from "./Inventory/MaterialIssue";
import MaterialReturn from "./Inventory/MaterialReturn";
import CapitalizationRequest from "./AssetLifecycle/CapitalizationRequest";
import CWIP from "./AssetLifecycle/CWIP";
import AssetCapitalization from "./AssetLifecycle/AssetCapitalization";
import FixedAssetRegister from "./AssetLifecycle/FixedAssetRegister";
import LocationStock from "./Inventory/LocationStock";
import VendorInvoice from "./Finance/VendorInvoice";
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
  const canViewPR = hasPermission("MASTERDATA", "PR", "READ");
  const canViewRFQ = hasPermission("MASTERDATA", "RFQ", "READ");
  const canViewPO = hasPermission("MASTERDATA", "PO", "READ");
  const canViewContract = hasPermission("MASTERDATA", "CONTRACT", "READ");
  const canViewDI = hasPermission("MASTERDATA", "DELIVERY_INTIMATION", "READ");
  const canViewGRN = hasPermission("MASTERDATA", "GRN", "READ");
  const canViewVI = hasPermission("MASTERDATA", "VENDOR_INVOICE", "READ");
  const canViewStorageLocation = hasPermission(
    "MASTERDATA",
    "STORAGE_LOCATION",
    "READ",
  );
  const canViewPutaway = hasPermission("MASTERDATA", "PUTAWAY", "READ");
  const canViewStock = hasPermission("MASTERDATA", "STOCK", "READ");
  const canViewInventoryTransfer = hasPermission(
    "MASTERDATA",
    "INVENTORY_TRANSFER",
    "READ",
  );
  const canViewMoveOrder = hasPermission("MASTERDATA", "MOVE_ORDER", "READ");
  const canViewCycleCount = hasPermission("MASTERDATA", "CYCLE_COUNT", "READ");
  const canViewStockAdjustment = hasPermission(
    "MASTERDATA",
    "STOCK_ADJUSTMENT",
    "READ",
  );
  const canViewReorderRule = hasPermission(
    "MASTERDATA",
    "REORDER_RULE",
    "READ",
  );
  const canViewMaterialIssue = hasPermission(
    "MASTERDATA",
    "MATERIAL_ISSUE",
    "READ",
  );
  const canViewMaterialReturn = hasPermission(
    "MASTERDATA",
    "MATERIAL_RETURN",
    "READ",
  );
  const canViewLocationStock = hasPermission("MASTERDATA", "PUTAWAY", "READ");

  const canViewCapReq = hasPermission(
    "MASTERDATA",
    "CAPITALIZATION_REQUEST",
    "READ",
  );
  const canViewCWIP = hasPermission("MASTERDATA", "CWIP", "READ");
  const canViewFixedAsset = hasPermission(
    "MASTERDATA",
    "FIXED_ASSET",
    "READ",
  );

  const canViewAssetCap = hasPermission(
    "MASTERDATA",
    "ASSET_CAPITALIZATION",
    "READ",
  );

  if (
    !canViewVendor &&
    !canViewItems &&
    !canViewUom &&
    !canViewAssetCategory &&
    !canViewBudget &&
    !canViewPR &&
    !canViewRFQ &&
    !canViewPO &&
    !canViewContract &&
    !canViewDI &&
    !canViewGRN &&
    !canViewVI &&
    !canViewStorageLocation &&
    !canViewPutaway &&
    !canViewStock &&
    !canViewInventoryTransfer &&
    !canViewMoveOrder &&
    !canViewCycleCount &&
    !canViewStockAdjustment &&
    !canViewReorderRule &&
    !canViewMaterialIssue &&
    !canViewMaterialReturn &&
    !canViewLocationStock &&
    !canViewCapReq &&
    !canViewAssetCap &&
    !canViewCWIP &&
    !canViewFixedAsset
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
              <Route
                path="purchase-requisition/*"
                element={<PurchaseRequisition />}
              />
              <Route path="rfq/*" element={<RFQModule />} />
              <Route path="po/*" element={<PurchaseOrder />} />
              <Route path="contract/*" element={<Contract />} />
              <Route
                path="delivery-intimation/*"
                element={<DeliveryIntimation />}
              />
              <Route path="grn/*" element={<GoodsReceiptNote />} />
              <Route path="storage-location/*" element={<StorageLocation />} />
              <Route path="putaway/*" element={<Putaway />} />
              <Route path="stock/*" element={<Stock />} />
              <Route
                path="inventory-transfer/*"
                element={<InventoryTransfer />}
              />  
              <Route path="move-order/*" element={<MoveOrder />} />
              <Route path="cycle-count/*" element={<CycleCount />} />
              <Route path="stock-adjustment/*" element={<StockAdjustment />} />
              <Route path="reorder-rule/*" element={<ReorderRule />} />
              <Route path="material-issue/*" element={<MaterialIssue />} />
              <Route path="material-return/*" element={<MaterialReturn />} />
              <Route
                path="capitalization-request/*"
                element={<CapitalizationRequest />}
              />
              <Route
                path="asset-capitalization/*"
                element={<AssetCapitalization />}
              />
              <Route path="cwip/*" element={<CWIP />} />
              <Route path="location-stock/*" element={<LocationStock />} />
              <Route path="vendor-invoice/*" element={<VendorInvoice />} />
              <Route path="fixed-asset/*" element={<FixedAssetRegister />} />
              <Route path="*" element={<Basic404 />} />
            </Routes>
          </div>
        </div>
      </Container>
    </div>
  );
};
export default MasterData;
