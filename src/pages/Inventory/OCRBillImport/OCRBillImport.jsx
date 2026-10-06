import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Alert,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Badge,
  Spinner,
} from "reactstrap";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import {
  uploadOCRBill,
  checkPharmacyBatch,
  checkExistingMedicineInPharmacy,
  confirmOCRMedicines,
  getMatchingMedicines,
  getOCRBillDetails,
  updateBillErrors,
} from "../../../helpers/backend_helper";
import FileUpload from "../../CashManagement/Components/FileUpload";
import { normalizeUnderscores } from "../../../utils/normalizeUnderscore";

// One control for a missed medicine: the auto-found matches are the default options,
// typing searches the whole master. Picking sets the selection for that row.
const MissedMedicineSearch = ({ candidates, selectedId, onPick, onClear }) => {
  const timer = useRef(null);
  const toOption = (m) => ({ value: m._id || m.id, label: formatMedicineLabel(m), data: m });
  const defaults = (candidates || []).map(toOption);
  const selected = selectedId ? defaults.find((o) => o.value === selectedId) || null : null;

  const loadOptions = (input) =>
    new Promise((resolve) => {
      clearTimeout(timer.current);
      if (!input || input.trim().length < 2) return resolve(defaults);
      timer.current = setTimeout(async () => {
        try {
          const res = await getMatchingMedicines({ extractedName: input.trim(), typeahead: true });
          const list = Array.isArray(res?.data) ? res.data : [];
          resolve(list.map(toOption));
        } catch (e) {
          resolve([]);
        }
      }, 300);
    });

  return (
    <AsyncSelect
      key={defaults.map((o) => o.value).join(",")}
      defaultOptions={defaults}
      loadOptions={loadOptions}
      value={selected}
      onChange={(opt) => (opt ? onPick(opt.data) : onClear())}
      isClearable
      placeholder="Search or pick the correct medicine..."
      noOptionsMessage={({ inputValue }) =>
        inputValue && inputValue.trim().length >= 2 ? "No medicines found" : "Type at least 2 letters"
      }
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
    />
  );
};

// Dropdown label: "<id> | <type> <name> <strength> (baseunit: <baseUnit>)"
const formatMedicineLabel = (m) => {
  if (!m) return "";
  const main = [m.type, m.name, m.strength].filter(Boolean).join(" ");
  const unit = m.baseUnit || m.unit;
  return `${m.id ? `${m.id} | ` : ""}${main}${unit ? ` (baseunit: ${unit})` : ""}`;
};

const OCRBillImport = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const centerList = useSelector((state) => state.Center.data);
  const location = useLocation();
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);
  const hasUploadPermission = hasPermission("PHARMACY", "BILL_UPLOAD_DASHBOARD", "WRITE");

  // State management
  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null); // "uploading", "extracting", "matching"
  const [rechecking, setRechecking] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Results from API calls
  const [billImportId, setBillImportId] = useState(null);
  const [billFileUrl, setBillFileUrl] = useState(null);
  const [extractedMedicines, setExtractedMedicines] = useState([]);
  const [errorMedicines, setErrorMedicines] = useState([]);

  // Extracted form data - editable fields from OCR
  const [extractedFormData, setExtractedFormData] = useState({});

  // Medicine selection - checkbox for which medicines to process
  const [checkedMedicines, setCheckedMedicines] = useState({});
  // Selected medicine IDs from dropdown
  const [selectedMedicineIds, setSelectedMedicineIds] = useState({});

  // Error medicines editing
  const [errorMedicinesFormData, setErrorMedicinesFormData] = useState({});
  const [selectedErrorMedicineIds, setSelectedErrorMedicineIds] = useState({});
  const [errorMatchingMedicinesMap, setErrorMatchingMedicinesMap] = useState({});
  const [errorCheckedMedicines, setErrorCheckedMedicines] = useState({});

  // Pharmacy check results
  const [pharmacyCheckResults, setPharmacyCheckResults] = useState({});

  // Medicine confirmation
  const [confirmedMedicines, setConfirmedMedicines] = useState({});
  const [matchingMedicinesMap, setMatchingMedicinesMap] = useState({});
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  // User input for filling forms
  const [medicineFormData, setMedicineFormData] = useState({});
  const [pharmacyStatus, setPharmacyStatus] = useState({});
  const [successResult, setSuccessResult] = useState(null);
  const [billSupplier, setBillSupplier] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billGrossAmount, setBillGrossAmount] = useState(0);
  const [billDiscountPercentage, setBillDiscountPercentage] = useState(0);
  const [billDiscountAmount, setBillDiscountAmount] = useState(0);
  const [billFinalAmount, setBillFinalAmount] = useState(0);
  const [billTotal, setBillTotal] = useState(0);

  // Track if we're resuming from navigation (skip loading screen when resuming)
  const [isResuming, setIsResuming] = useState(!!location.state?.resumeBillId || !!location.state?.retryBillId);

  // Edit missing medicine modal
  const [editingMissingMedicineIdx, setEditingMissingMedicineIdx] = useState(null);
  const [editingMissingMedicineData, setEditingMissingMedicineData] = useState({});
  const [editingMissingMatches, setEditingMissingMatches] = useState([]);
  const [editingMissingLoading, setEditingMissingLoading] = useState(false);

  // Per-row search-again state for the missing medicines table (extract step)
  const [errorSearchLoading, setErrorSearchLoading] = useState({});

  // Track debounce timers for refetching matching medicines
  const debounceTimersRef = useRef({});

  // Center dropdown — only centers the user has access to, sourced
  // directly from state.Center.data (already scoped to the user's centerAccess).
  const centerOptions = useMemo(() => {
    return (centerList || []).map((center) => ({
      value: center._id,
      label: center.title || "Unknown Center",
    }));
  }, [centerList]);

  // Keep selectedCenter in sync with the user's centerAccess.
  //   - First render with options available → pick the first one.
  //   - centerAccess changed and the current pick is no longer allowed →
  //     clear it (or pick the new first one if any remain).
  // Side-effect kept inside useEffect, not useMemo, since this mutates state.
  useEffect(() => {
    if (centerOptions.length === 0) {
      if (selectedCenter) setSelectedCenter(null);
      return;
    }
    const stillAllowed =
      selectedCenter &&
      centerOptions.some(
        (c) => String(c.value) === String(selectedCenter.value)
      );
    if (!stillAllowed) {
      setSelectedCenter(centerOptions[0]);
    }
  }, [centerOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const centerId = selectedCenter?.value;

  // Handle resume/retry from BillUploadDashboard navigation.
  // After dispatching, clear location.state via replaceState so a browser
  // back-navigation doesn't re-trigger the same load.
  useEffect(() => {
    if (location.state?.resumeBillId) {
      handleResumeBill(location.state.resumeBillId);
      navigate(location.pathname, { replace: true, state: null });
    } else if (location.state?.retryBillId) {
      handleRetryMissing(location.state.retryBillId);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state?.resumeBillId, location.state?.retryBillId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // Single source of truth for per-medicine discount calculation.
  //
  // Each medicine receives ITS FAIR SHARE of the bill-level discount,
  // weighted by its line total against the bill's full gross amount.
  // This matters when only some of the bill's medicines are being
  // entered into inventory — the unentered items still "own" their
  // share of the discount; we don't redistribute that share onto the
  // entered ones.
  //
  //   lineTotal_i        = unitPrice_i * quantity_i
  //   denominator        = billGrossAmount  (preferred; whole bill)
  //                          || Σ lineTotal_i  (fallback if gross is missing)
  //   effectiveAmount    = billDiscountAmount
  //                          || denominator * billDiscountPercentage / 100
  //   medicineDiscount_i = (lineTotal_i / denominator) * effectiveAmount
  //   purchasePrice_i    = max(0, unitPrice_i - medicineDiscount_i / qty_i)
  //
  // Returns an array aligned with the input order, each entry shaped
  //   { purchasePrice, medicineDiscount }
  // ============================================================
  const computeDiscountedPrices = (lines, discountAmount, discountPercentage, grossAmount) => {
    if (!Array.isArray(lines) || lines.length === 0) return [];

    const totals = lines.map((m) => {
      const unitPrice = Number(m.unitPrice) || 0;
      const qty = Number(m.quantity) || 0;
      return { unitPrice, qty, lineTotal: unitPrice * qty };
    });
    const totalSelected = totals.reduce((acc, t) => acc + t.lineTotal, 0);

    // Use the bill's gross as the denominator so each medicine gets only
    // its share of the discount — even when other bill lines weren't
    // selected for entry. Fall back to the sum of selected lines if the
    // bill metadata didn't carry a gross.
    const denominator = Number(grossAmount) > 0 ? Number(grossAmount) : totalSelected;

    // Effective discount: prefer absolute amount; derive from % only if amount is 0.
    let effectiveAmount = Number(discountAmount) || 0;
    if (effectiveAmount === 0 && Number(discountPercentage) > 0) {
      effectiveAmount = (denominator * Number(discountPercentage)) / 100;
    }

    return totals.map((t) => {
      // Guards: no qty, no denominator, or no discount → keep unit price as-is.
      if (t.qty === 0 || denominator === 0 || effectiveAmount === 0) {
        return { purchasePrice: t.unitPrice, medicineDiscount: 0 };
      }
      const medicineDiscount = (t.lineTotal / denominator) * effectiveAmount;
      const perUnit = medicineDiscount / t.qty;
      const purchasePrice = Math.max(
        0,
        Math.round((t.unitPrice - perUnit) * 100) / 100
      );
      return {
        purchasePrice,
        medicineDiscount: Math.round(medicineDiscount * 100) / 100,
      };
    });
  };

  // Separate medicines into new and existing (at top level)
  const { newMedicines, existingMedicines } = useMemo(() => {
    const newMeds = [];
    const existingMeds = [];

    Object.entries(pharmacyCheckResults).forEach(([idx, result]) => {
      const { pharmacyStatus } = result;
      const exists = pharmacyStatus?.exists || false;

      if (exists) {
        existingMeds.push({ idx, result });
      } else {
        newMeds.push({ idx, result });
      }
    });

    return { newMedicines: newMeds, existingMedicines: existingMeds };
  }, [pharmacyCheckResults]);

  const newMedicinesColumns = useMemo(() => [
    {
      name: <div>Medicine</div>,
      width: "320px",
      cell: (row) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.4, fontSize: "0.85rem", fontWeight: 500, color: "#111827" }}>{row.label}</span>
      ),
    },
    {
      name: <div>Form</div>,
      width: "100px",
      cell: (row) => <small>{normalizeUnderscores(row.form) || "—"}</small>,
    },
    {
      name: <div>Purchase Unit</div>,
      width: "85px",
      cell: (row) => <Badge color="info" className="px-2" style={{ fontSize: "0.75rem" }}>{row.purchaseUnit}</Badge>,
    },
    {
      name: <div>Batch</div>,
      width: "110px",
      cell: (row) => <small>{row.batchNumber}</small>,
    },
    {
      name: <div>Expiry</div>,
      width: "120px",
      cell: (row) => <small>{row.expiryDate}</small>,
    },
    {
      name: <div>Add Qty*</div>,
      width: "100px",
      cell: (row) => (
        <div>
          <Input type="number" bsSize="sm" value={row.quantity || ""} onChange={(e) => handleFormChange(row.idx, "quantity", e.target.value)} placeholder="0" style={{ fontSize: "0.85rem", width: "100%" }} />
          <small className="text-muted d-block mt-1">{row.baseUnit}</small>
        </div>
      ),
    },
    {
      name: <div>Packs (price unit)</div>,
      width: "130px",
      cell: (row) => (
        <small className="text-muted">
          {row.qty === 0 ? "—" : `${row.packQtyDisplay} ${row.purchaseUnit}`}
        </small>
      ),
    },
    {
      name: <div>Purchase Price</div>,
      width: "90px",
      cell: (row) => <Input type="number" bsSize="sm" value={row.purchasePrice || ""} onChange={(e) => handleFormChange(row.idx, "purchasePrice", e.target.value)} placeholder="0" step="0.01" style={{ fontSize: "0.85rem", width: "100%" }} />,
    },
    {
      name: <div>MRP</div>,
      width: "90px",
      cell: (row) => <Input type="number" bsSize="sm" value={row.mrp || ""} onChange={(e) => handleFormChange(row.idx, "mrp", e.target.value)} placeholder="0" step="0.01" style={{ fontSize: "0.85rem", width: "100%" }} />,
    },
  ], []);

  const existingMedicinesColumns = useMemo(() => [
    {
      name: <div>Medicine</div>,
      width: "300px",
      cell: (row) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.4, fontSize: "0.85rem", fontWeight: 500, color: "#111827" }}>{row.label}</span>
      ),
    },
    {
      name: <div>Inventory Record</div>,
      width: "150px",
      cell: (row) => (
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>{row.pharmId || "N/A"}</div>
          <small className="text-muted d-block">
            Batch {row.batchNumber || "—"}
          </small>
          <small className="text-muted d-block">Exp {row.expiryDate || "—"}</small>
        </div>
      ),
    },
    {
      name: <div>Current Stock</div>,
      width: "140px",
      cell: (row) => (
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>
            {row.centerStock || 0} {row.baseUnit}
          </div>
          <small className="text-muted d-block">this center</small>
        </div>
      ),
    },
    {
      name: <div>Add Qty*</div>,
      width: "100px",
      cell: (row) => (
        <div>
          <Input type="number" bsSize="sm" value={row.quantity || ""} onChange={(e) => handleFormChange(row.idx, "quantity", e.target.value)} placeholder="0" style={{ fontSize: "0.85rem", width: "100%" }} />
          <small className="text-muted d-block mt-1">{row.baseUnit}</small>
        </div>
      ),
    },
    {
      name: <div>Packs (price unit)</div>,
      width: "130px",
      cell: (row) => (
        <small className="text-muted">
          {row.qty === 0 ? "—" : `${row.packQtyDisplay} ${row.purchaseUnit}`}
        </small>
      ),
    },
    {
      name: <div>Stock After</div>,
      width: "130px",
      cell: (row) => (
        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>
          {row.qty === 0 ? "—" : `${row.stockAfter} ${row.baseUnit}`}
        </div>
      ),
    },
    {
      name: <div>Purchase Price</div>,
      width: "120px",
      cell: (row) => (
        <div>
          <Input type="number" bsSize="sm" value={row.purchasePrice || ""} onChange={(e) => handleFormChange(row.idx, "purchasePrice", e.target.value)} placeholder="0" step="0.01" style={{ fontSize: "0.85rem", width: "100%" }} />
          {row.existingPurchasePrice !== null && row.existingPurchasePrice !== undefined && (
            <small className="text-muted d-block mt-1">In inventory: {row.existingPurchasePrice}</small>
          )}
        </div>
      ),
    },
    {
      name: <div>MRP</div>,
      width: "120px",
      cell: (row) => (
        <div>
          <Input type="number" bsSize="sm" value={row.mrp || ""} onChange={(e) => handleFormChange(row.idx, "mrp", e.target.value)} placeholder="0" step="0.01" style={{ fontSize: "0.85rem", width: "100%" }} />
          {row.existingMrp !== null && row.existingMrp !== undefined && (
            <small className="text-muted d-block mt-1">In inventory: {row.existingMrp}</small>
          )}
        </div>
      ),
    },
  ], []);

  // Build the per-row display data for new + existing tables.
  // Both pull discount from the single helper so what the user sees is
  // exactly what will be persisted (no more display/save divergence).
  // Quantity is entered/stored in the BASE unit; price is per PURCHASE unit.
  // factor = base units per purchase unit, so packs = baseQty / factor.
  const getConversionFactor = (medicine) => {
    const conv = medicine?.conversion || { purchaseQuantity: 1, baseQuantity: 1 };
    return (conv.baseQuantity || 1) / (conv.purchaseQuantity || 1);
  };

  const buildRowDisplay = (collection) => {
    const lines = collection.map(({ idx, result }) => {
      const fd = medicineFormData[idx] || {};
      const factor = getConversionFactor(result?.selectedMedicine) || 1;
      return {
        unitPrice: parseFloat(fd.unitPrice) || 0,
        // line total = price per pack x number of packs
        quantity: (parseFloat(fd.quantity) || 0) / factor,
      };
    });
    const discounts = computeDiscountedPrices(lines, billDiscountAmount, billDiscountPercentage, billGrossAmount);

    return collection.map(({ idx, result }, i) => {
      const { selectedMedicine, extractedData, pharmacyStatus } = result;
      const formData = medicineFormData[idx] || {};
      const qty = parseFloat(formData.quantity) || 0;
      const unitPrice = parseFloat(formData.unitPrice) || 0;
      const { purchasePrice, medicineDiscount } = discounts[i] || {
        purchasePrice: unitPrice,
        medicineDiscount: 0,
      };

      const purchaseUnit = selectedMedicine?.purchaseUnit || selectedMedicine?.baseUnit || "unit";
      const factor = getConversionFactor(selectedMedicine) || 1;
      const baseUnitQty = qty;
      const packQtyDisplay = qty === 0 ? "—" : String(Math.round((qty / factor) * 100) / 100);

      // Once the user manually edits Purchase Price, that value is final —
      // it must stop being overwritten by the auto-discount recompute on
      // every subsequent render (e.g. when quantity changes).
      const displayedPurchasePrice = formData.purchasePriceEdited
        ? parseFloat(formData.purchasePrice) || 0
        : purchasePrice;

      return {
        idx,
        medId: selectedMedicine?._id?.slice(-6) || selectedMedicine?.id,
        pharmId: pharmacyStatus?.data?.pharmacyId || "N/A",
        existingPurchasePrice: pharmacyStatus?.data?.purchasePrice ?? null,
        existingMrp: pharmacyStatus?.data?.mrp ?? null,
        stockAfter: Math.round(((Number(pharmacyStatus?.data?.centerStock) || 0) + baseUnitQty) * 100) / 100,
        label: formatMedicineLabel(selectedMedicine),
        name: selectedMedicine?.name,
        strength: selectedMedicine?.strength,
        form: selectedMedicine?.form,
        baseUnit: selectedMedicine?.baseUnit,
        batchNumber: formData.batchNumber || extractedData?.batchNumber || "",
        expiryDate: formData.expiryDate || extractedData?.expiryDate || "",
        centerStock: pharmacyStatus?.data?.centerStock || 0,
        quantity: formData.quantity || "",
        qty,
        purchaseUnit,
        packQtyDisplay,
        purchasePrice: displayedPurchasePrice,
        discountedPrice: displayedPurchasePrice,
        medicineDiscount,
        mrp: formData.mrp || "",
      };
    });
  };

  const newMedicinesData = useMemo(
    () => (newMedicines?.length ? buildRowDisplay(newMedicines) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newMedicines, medicineFormData, billDiscountAmount, billDiscountPercentage, billGrossAmount]
  );

  const existingMedicinesData = useMemo(
    () => (existingMedicines?.length ? buildRowDisplay(existingMedicines) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingMedicines, medicineFormData, billDiscountAmount, billDiscountPercentage, billGrossAmount]
  );

  if (permissionLoader) {
    return (
      <CardBody
        className="p-3 bg-white d-flex justify-content-center align-items-center"
        style={isMobile ? { width: "100%" } : { width: "78%", minHeight: "300px" }}
      >
        <Spinner color="primary" />
      </CardBody>
    );
  }

  if (!hasUploadPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ============================================
  // Helper Functions
  // ============================================

  const getMissingMasterFields = (masterData) => {
    const required = ["form", "baseUnit", "category", "storageType"];
    return required.filter((field) => !masterData[field]);
  };

  const downloadMissingFieldsCSV = async (medicines) => {
    if (medicines.length === 0) {
      toast.info("No missing medicines to download");
      return;
    }

    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Missing Medicines");

      // Mirror the columns the user sees in the missing-medicines table,
      // plus a few extras for downstream use (confidence, reason, bill URL).
      worksheet.columns = [
        { header: "Medicine Name", key: "name", width: 30 },
        { header: "Strength", key: "strength", width: 20 },
        { header: "Quantity", key: "quantity", width: 12 },
        { header: "Batch", key: "batch", width: 18 },
        { header: "Expiry", key: "expiry", width: 14 },
        { header: "Unit Price", key: "unitPrice", width: 14 },
        { header: "Total Price", key: "totalPrice", width: 14 },
        { header: "OCR Confidence", key: "confidence", width: 15 },
        { header: "Reason", key: "reason", width: 40 },
        { header: "Source Bill URL", key: "billUrl", width: 50 },
      ];

      // Prefer the user's inline edits from errorMedicinesFormData (keyed by
      // index in the rendered table). Fall back to the original OCR value.
      medicines.forEach((med, idx) => {
        const form = errorMedicinesFormData[idx] || {};
        worksheet.addRow({
          name: form.extractedName ?? med.extractedName ?? med.name ?? "",
          strength: form.extractedStrength ?? med.extractedStrength ?? med.strength ?? "",
          quantity: form.quantity ?? med.quantity ?? "",
          batch: form.batchNumber ?? med.batchNumber ?? "",
          expiry: form.expiryDate ?? med.expiryDate ?? "",
          unitPrice: form.unitPrice ?? med.unitPrice ?? "",
          totalPrice: form.totalPrice ?? med.totalPrice ?? "",
          confidence: med.confidence ? (med.confidence * 100).toFixed(0) + "%" : "N/A",
          reason: med.reason || "Not found in master database",
          billUrl: billFileUrl || "-",
        });
      });

      // Style header
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC00000" } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `missing-medicines-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Excel downloaded! Add these medicines to your master database.");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to generate Excel report");
    }
  };

  const downloadFailedMedicinesExcel = async (medicines) => {
    if (medicines.length === 0) {
      toast.info("No failed medicines to download");
      return;
    }

    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Failed Medicines");

      worksheet.columns = [
        { header: "Medicine Name", key: "name", width: 30 },
        { header: "Strength", key: "strength", width: 20 },
        { header: "Batch", key: "batch", width: 20 },
        { header: "Expiry", key: "expiry", width: 15 },
        { header: "Quantity", key: "quantity", width: 15 },
        { header: "Unit Price", key: "unitPrice", width: 15 },
        { header: "Reason", key: "reason", width: 40 },
      ];

      medicines.forEach((med) => {
        worksheet.addRow({
          name: med.extractedName || med.name || "Unknown",
          strength: med.extractedStrength || med.strength || "N/A",
          batch: med.batchNumber || "N/A",
          expiry: med.expiryDate || "N/A",
          quantity: med.quantity || "N/A",
          unitPrice: med.unitPrice || "N/A",
          reason: med.reason || "Import failed",
        });
      });

      // Style header
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `failed-medicines-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Failed medicines list downloaded!");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to generate Excel report");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const downloadExtractedMedicinesExcel = (medicines) => {
    if (medicines.length === 0) {
      toast.info("No medicines to download");
      return;
    }

    const headers = [
      "Medicine Name",
      "Strength",
      "Quantity",
      "Batch Number",
      "Unit Price",
      "OCR Confidence",
    ];

    const rows = medicines.map((med) => [
      med.extractedName,
      med.extractedStrength || "N/A",
      med.quantity || "N/A",
      med.batchNumber || "N/A",
      med.unitPrice || "N/A",
      (med.confidence * 100).toFixed(0) + "%",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted-medicines-${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Extracted medicines list downloaded!");
  };

  // Get matching medicines for user confirmation
  // strict (default): strength must match - used for bill lines in the review table.
  // strict: false: name only - used for missing medicines (search, edit, retry).
  const fetchMatchingMedicines = async (extractedName, extractedStrength, { strict = true } = {}) => {
    if (!extractedName || extractedName.trim() === "") {
      console.warn("⚠️ fetchMatchingMedicines: Empty name provided");
      return [];
    }
    try {
      console.log(`🔍 CALLING API: getMatchingMedicines("${extractedName}", "${extractedStrength || ""}")`);

      // Create a promise that rejects after 10 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("API call timeout after 10s")), 10000)
      );

      const apiCall = getMatchingMedicines({
        extractedName: extractedName.trim(),
        extractedStrength: strict ? extractedStrength?.trim() || "" : "",
        strictStrength: strict,
      });

      // Race between API call and timeout
      const result = await Promise.race([apiCall, timeoutPromise]);
      console.log(`✅ API Response received for "${extractedName}":`, result);

      // Axios interceptor already unwraps response.data, so result is { success: true, data: [...] }
      // Extract the medicines array from the response
      // NOTE: API already filters by strict strength matching, so no frontend filtering needed
      const medicinesArray = result?.data || [];
      console.log(`   Total matches found: ${Array.isArray(medicinesArray) ? medicinesArray.length : 'ERROR - not an array'}`);
      if (Array.isArray(medicinesArray) && medicinesArray.length > 0) {
        console.log(`   Sample match:`, medicinesArray[0]);
      }

      return Array.isArray(medicinesArray) ? medicinesArray : [];
    } catch (err) {
      console.error(`❌ API Error for "${extractedName}":`, err?.message || err);
      return [];
    }
  };


  // ============================================
  // STEP 1: Upload Bill
  // ============================================

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only PDF, JPG, PNG, GIF, WEBP are supported");
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUploadBill = async () => {
    if (!selectedCenter) {
      setError("Please select a center");
      return;
    }

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!centerId) {
      setError("Center ID not found. Please select your center.");
      return;
    }

    // Reset all form state before uploading new bill
    setStep("upload");
    setBillImportId(null);
    setExtractedMedicines([]);
    setErrorMedicines([]);
    setExtractedFormData({});
    setCheckedMedicines({});
    setSelectedMedicineIds({});
    setErrorMedicinesFormData({});
    setSelectedErrorMedicineIds({});
    setErrorMatchingMedicinesMap({});
    setErrorCheckedMedicines({});
    setPharmacyCheckResults({});
    setMedicineFormData({});
    setPharmacyStatus({});
    setSuccessResult(null);
    setBillSupplier("");
    setBillNumber("");
    setBillGrossAmount(0);
    setBillDiscountPercentage(0);
    setBillDiscountAmount(0);
    setBillFinalAmount(0);
    setBillTotal(0);
    setMatchingMedicinesMap({});
    setConfirmedMedicines({});

    setLoading(true);
    setError(null);
    setProcessingStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("centerId", centerId);

      setProcessingStatus("extracting");
      const response = await uploadOCRBill(formData);

      console.log("📤 Full upload response:", response);
      console.log("   response.data:", response.data);

      // Handle both response.data.data and response.data structures
      const result = response.data || response;
      console.log("📤 Extracted result:", result);

      // Validation
      if (!result || !result.billImportId) {
        console.error("❌ Invalid response:", result);
        throw new Error("Invalid response structure: missing billImportId");
      }

      console.log("✅ Upload successful, bill ID:", result.billImportId);
      console.log("   Extracted medicines count:", (result.extractedMedicines || []).length);
      console.log("   Missing medicines count:", (result.errorMedicines || []).length);
      if (result.createdRequisitions?.length > 0) {
        console.log(`✅ Created ${result.createdRequisitions.length} medicine requisitions`);
        console.log("   Justification:", result.requisitionJustification);
      }

      setBillImportId(result.billImportId);
      setBillFileUrl(result.fileUrl);
      setExtractedMedicines(addIdsToMedicines(result.extractedMedicines || []));
      setErrorMedicines(addIdsToMedicines(result.errorMedicines || []));

      // Initialize extracted form data with OCR data
      console.log("📋 Building extracted form data from medicines...");
      const initialExtractedData = {};
      let extractedSupplier = result.billMetadata?.supplier || "";
      let extractedBillNumber = result.billMetadata?.billNumber || result.extractedBillNumber || "";
      let extractedGrossAmount = result.billMetadata?.grossAmount || result.billMetadata?.totalAmount || 0;
      let extractedDiscountPercentage = result.billMetadata?.discountPercentage || 0;
      let extractedDiscountAmount = result.billMetadata?.discountAmount || 0;
      // Always calculate finalAmount as Gross - Discount for consistency
      let extractedFinalAmount = extractedGrossAmount - extractedDiscountAmount;
      let extractedTax = result.billMetadata?.tax || result.billMetadata?.gst || 0;
      let totalBillAmount = result.billMetadata?.totalAmount || (extractedFinalAmount + extractedTax) || 0;

      if (result.extractedMedicines && Array.isArray(result.extractedMedicines)) {
        console.log(`   Processing ${result.extractedMedicines.length} medicines`);
        result.extractedMedicines.forEach((med, idx) => {
          const quantity = parseFloat(med.ocrExtracted?.quantity) || 0;
          const unitPrice = parseFloat(med.ocrExtracted?.unitPrice) || 0;
          if (!totalBillAmount || totalBillAmount === 0) {
            totalBillAmount += quantity * unitPrice;
          }

          initialExtractedData[idx] = {
            medicineName: med.ocrExtracted?.name || "",
            strength: med.ocrExtracted?.strength || "",
            quantity: med.ocrExtracted?.quantity || "",
            batchNumber: med.ocrExtracted?.batchNumber || "",
            expiryDate: med.ocrExtracted?.expiryDate || "",
            unitPrice: med.ocrExtracted?.unitPrice || "",
            totalPrice: med.ocrExtracted?.totalPrice || "",
          };
          console.log(`   [${idx}] ${med.ocrExtracted?.name}`);
        });
      }
      console.log("✅ Form data built successfully");
      setExtractedFormData(initialExtractedData);
      setBillSupplier(extractedSupplier);
      setBillNumber(extractedBillNumber);
      setBillGrossAmount(extractedGrossAmount);
      setBillDiscountPercentage(extractedDiscountPercentage);
      setBillDiscountAmount(extractedDiscountAmount);
      setBillFinalAmount(extractedFinalAmount);
      setBillTotal(totalBillAmount);

      console.log("✅ All state set. Ready to fetch matching medicines...");

      // Fetch matching medicines for each extracted medicine
      const matchingMap = {};
      const totalMeds = (result.extractedMedicines || []).length;
      console.log("\n🔍 FETCHING MATCHING MEDICINES:");
      console.log(`  Total medicines to fetch: ${totalMeds}`);

      if (totalMeds === 0) {
        console.warn("⚠️ No medicines to fetch matches for");
      }

      for (let idx = 0; idx < totalMeds; idx++) {
        const extractedData = initialExtractedData[idx];
        console.log(`\n  [${idx}] Fetching matches for: "${extractedData.medicineName}" ${extractedData.strength || ""}`);
        try {
          const matches = await fetchMatchingMedicines(
            extractedData.medicineName,
            extractedData.strength
          );
          console.log(`    [${idx}] Found ${matches?.length || 0} matches`);
          matchingMap[idx] = matches || [];
        } catch (err) {
          console.error(`  [${idx}] API Error:`, err);
          matchingMap[idx] = [];
        }
      }
      console.log("\n  ✅ All medicines processed. Final matchingMap:", matchingMap);

      // Filter out medicines with no matches and move them to errors
      const medicinesWithMatches = [];
      const medicinesWithoutMatches = [];
      const currentErrors = [...(result.errorMedicines || [])];

      (result.extractedMedicines || []).forEach((med, idx) => {
        if (matchingMap[idx] && matchingMap[idx].length > 0) {
          medicinesWithMatches.push(med);
        } else {
          medicinesWithoutMatches.push({
            _tempId: med._tempId, // Preserve ID for tracking
            extractedName: med.ocrExtracted?.name || "",
            extractedStrength: med.ocrExtracted?.strength || "",
            quantity: med.ocrExtracted?.quantity || 0,
            batchNumber: med.ocrExtracted?.batchNumber || null,
            expiryDate: med.ocrExtracted?.expiryDate || null,
            unitPrice: med.ocrExtracted?.unitPrice || null,
            totalPrice: med.ocrExtracted?.totalPrice || null,
            reason: "No matching medicine found in master database",
            action: "Try editing the name or strength to find a match",
          });
        }
      });

      console.log(`\n📊 MEDICINE FILTERING RESULTS:`);
      console.log(`  - Medicines with matches: ${medicinesWithMatches.length}`);
      console.log(`  - Medicines without matches: ${medicinesWithoutMatches.length}`);

      // Update extracted medicines to only include those with matches
      setExtractedMedicines(medicinesWithMatches);

      // Filter matching map to only include medicines with matches
      const filteredMatchingMap = {};
      let newIdx = 0;
      (result.extractedMedicines || []).forEach((med, originalIdx) => {
        if (matchingMap[originalIdx] && matchingMap[originalIdx].length > 0) {
          filteredMatchingMap[newIdx] = matchingMap[originalIdx];
          newIdx++;
        }
      });
      setMatchingMedicinesMap(filteredMatchingMap);

      // Rebuild extracted form data and state indices to only include medicines with matches
      const filteredFormData = {};
      const filteredCheckedMedicines = {};
      const filteredSelectedMedicineIds = {};
      newIdx = 0;
      if (result.extractedMedicines && Array.isArray(result.extractedMedicines)) {
        result.extractedMedicines.forEach((med, originalIdx) => {
          if (matchingMap[originalIdx] && matchingMap[originalIdx].length > 0) {
            filteredFormData[newIdx] = {
              medicineName: med.ocrExtracted?.name || "",
              strength: med.ocrExtracted?.strength || "",
              quantity: med.ocrExtracted?.quantity || "",
              batchNumber: med.ocrExtracted?.batchNumber || "",
              expiryDate: med.ocrExtracted?.expiryDate || "",
              unitPrice: med.ocrExtracted?.unitPrice || "",
              totalPrice: med.ocrExtracted?.totalPrice || "",
            };

            // Rebuild checked and selected state with new indices
            if (checkedMedicines[originalIdx]) {
              filteredCheckedMedicines[newIdx] = true;
            }
            if (selectedMedicineIds[originalIdx]) {
              filteredSelectedMedicineIds[newIdx] = selectedMedicineIds[originalIdx];
            }

            newIdx++;
          }
        });
      }
      setExtractedFormData(filteredFormData);
      setCheckedMedicines(filteredCheckedMedicines);
      setSelectedMedicineIds(filteredSelectedMedicineIds);

      // Update error medicines to include those without matches
      const updatedErrors = [...currentErrors, ...medicinesWithoutMatches];
      setErrorMedicines(updatedErrors);

      if (medicinesWithoutMatches.length > 0) {
        toast.warning(`${medicinesWithoutMatches.length} medicine(s) with no matches moved to missing list`);
      }

      setStep("extract");
    } catch (err) {
      console.error("❌ Upload error details:", err);
      console.error("   Error message:", err.message);
      console.error("   Error stack:", err.stack);
      setError(err.response?.data?.message || err.message || "Failed to process bill");
    } finally {
      setLoading(false);
      setProcessingStatus(null);
    }
  };

  // ============================================
  // STEP 1: Handle Extracted Data Changes
  // ============================================

  const handleExtractedDataChange = (idx, field, value) => {
    setExtractedFormData((prev) => {
      const updated = {
        ...prev,
        [idx]: {
          ...prev[idx],
          [field]: value,
        },
      };

      // Refetch matching medicines if name or strength changed
      if (field === "medicineName" || field === "strength") {
        // Clear previous debounce timer for this index
        if (debounceTimersRef.current[idx]) {
          clearTimeout(debounceTimersRef.current[idx]);
        }

        // Set new debounce timer
        debounceTimersRef.current[idx] = setTimeout(async () => {
          const medicineName = field === "medicineName" ? value : updated[idx]?.medicineName;
          const strength = field === "strength" ? value : updated[idx]?.strength;

          if (medicineName && medicineName.trim() !== "") {
            console.log(`Refetching matches for idx ${idx}: "${medicineName}" ${strength}`);
            const matches = await fetchMatchingMedicines(medicineName, strength);
            setMatchingMedicinesMap((prevMap) => ({
              ...prevMap,
              [idx]: matches,
            }));
          }
        }, 500); // Debounce for 500ms
      }

      return updated;
    });
  };

  // Handle error medicines data changes (for retry/search).
  //
  // Three side-effects per edit:
  //   1. Update errorMedicinesFormData (drives the input value).
  //   2. Mirror the edit onto errorMedicines[idx] so any in-flight
  //      submission picks up the latest values (the confirm payload
  //      sends errorMedicines directly).
  //   3. Debounced auto-save to the server via updateBillErrors —
  //      keeps billImport.errors[] in sync so the consolidated Excel
  //      export reflects the user's edits without waiting for a full
  //      bill submission.
  const handleErrorMedicineDataChange = (idx, field, value) => {
    // Mirror onto the underlying errorMedicines array.
    const errorField =
      field === "extractedName" ? "extractedName" :
      field === "extractedStrength" ? "extractedStrength" :
      field; // quantity / batchNumber / expiryDate / unitPrice / totalPrice
    setErrorMedicines((prev) => {
      if (!prev[idx]) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], [errorField]: value };
      return next;
    });

    setErrorMedicinesFormData((prev) => {
      const updated = {
        ...prev,
        [idx]: {
          ...prev[idx],
          [field]: value,
        },
      };

      // Refetch matching medicines if name or strength changed
      if (field === "extractedName" || field === "extractedStrength") {
        if (debounceTimersRef.current[`error-${idx}`]) {
          clearTimeout(debounceTimersRef.current[`error-${idx}`]);
        }

        debounceTimersRef.current[`error-${idx}`] = setTimeout(async () => {
          const medicineName = field === "extractedName" ? value : updated[idx]?.extractedName;
          const strength = field === "extractedStrength" ? value : updated[idx]?.extractedStrength;

          if (medicineName && medicineName.trim() !== "") {
            console.log(`Refetching matches for error idx ${idx}: "${medicineName}" ${strength}`);
            const matches = await fetchMatchingMedicines(medicineName, strength, { strict: false });
            setErrorMatchingMedicinesMap((prevMap) => ({
              ...prevMap,
              [idx]: matches,
            }));
          }
        }, 500);
      }

      return updated;
    });

    // Debounced auto-save so the DB (and consequently the server-generated
    // consolidated Excel) reflects edits without requiring a bill submission.
    if (billImportId) {
      const saveKey = `error-save-${idx}`;
      if (debounceTimersRef.current[saveKey]) {
        clearTimeout(debounceTimersRef.current[saveKey]);
      }
      debounceTimersRef.current[saveKey] = setTimeout(async () => {
        try {
          // Build the latest snapshot of this row from state. Reading from a
          // ref-fresh place: use the underlying errorMedicines array since
          // we already mirrored the edit there synchronously above.
          setErrorMedicines((current) => {
            const row = current[idx];
            if (row && row._tempId) {
              updateBillErrors({
                billImportId,
                errors: [row],
              }).catch((err) =>
                console.warn("Auto-save of edited error failed:", err?.message || err)
              );
            }
            return current;
          });
        } catch (err) {
          console.warn("Auto-save of edited error failed:", err?.message || err);
        }
      }, 800);
    }
  };

  // Search Again for a missing medicine using the user's edited name/strength.
  // Populates errorMatchingMedicinesMap[idx] so the row can render a dropdown,
  // then the user picks one and clicks Move → handleAddErrorMedicineToExtracted.
  const handleErrorMedicineSearch = async (idx) => {
    const data = errorMedicinesFormData[idx] || errorMedicines[idx] || {};
    const name = (data.extractedName || "").trim();
    const strength = (data.extractedStrength || "").trim();

    if (!name) {
      toast.warning("Please enter a medicine name to search");
      return;
    }

    setErrorSearchLoading((prev) => ({ ...prev, [idx]: true }));
    try {
      const matches = await fetchMatchingMedicines(name, strength, { strict: false });
      setErrorMatchingMedicinesMap((prev) => ({ ...prev, [idx]: matches || [] }));
      // Clear any prior selection for this row since the match list changed
      setSelectedErrorMedicineIds((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });

      if (!matches || matches.length === 0) {
        toast.info("No matches found. Try a different name or strength.");
      } else {
        toast.success(`Found ${matches.length} match(es). Pick one and click "Move to Extracted".`);
      }
    } catch (err) {
      console.error("Error medicine search failed:", err);
      toast.error("Search failed");
    } finally {
      setErrorSearchLoading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  // Typeahead pick: make sure the medicine is in this row's match list, then select it
  const handleSearchPick = (idx, med) => {
    setErrorMatchingMedicinesMap((prev) => {
      const cur = prev[idx] || [];
      return cur.some((m) => m._id === med._id) ? prev : { ...prev, [idx]: [med, ...cur] };
    });
    setSelectedErrorMedicineIds((prev) => ({ ...prev, [idx]: med._id }));
  };

  // Convert error medicine to extracted medicine when matched
  const handleAddErrorMedicineToExtracted = (errorIdx) => {
    // Source of truth: the original error record (carries _tempId).
    // errorMedicinesFormData only stores editable fields — never _tempId —
    // so it must NOT be used to pull the ID.
    const originalError = errorMedicines[errorIdx];
    const formData = errorMedicinesFormData[errorIdx] || originalError || {};
    const movedTempId = originalError?._tempId;
    const selectedId = selectedErrorMedicineIds[errorIdx];

    if (!selectedId) {
      toast.warning("Please select a medicine from the dropdown");
      return;
    }

    const selectedMed = errorMatchingMedicinesMap[errorIdx]?.find(m => m._id === selectedId);
    if (!selectedMed) {
      toast.error("Medicine not found");
      return;
    }

    if (!movedTempId) {
      console.warn("[Move to Extracted] error row has no _tempId — downstream tracking may fall back to name/strength matching");
    }

    // Add to extracted medicines, preserving the _tempId for tracking
    const newIdx = extractedMedicines.length;
    setExtractedMedicines([...extractedMedicines, {
      _tempId: movedTempId, // Same ID the medicine had at extraction time
      medicineId: selectedId,
      ocrExtracted: {
        name: formData.extractedName,
        strength: formData.extractedStrength,
        batchNumber: formData.batchNumber || null,
        quantity: formData.quantity || 0,
        unitPrice: formData.unitPrice || null,
        totalPrice: formData.totalPrice || null,
        expiryDate: formData.expiryDate || null,
        confidence: 1.0,
      },
      masterData: {
        medicineId: selectedMed._id,
        name: selectedMed.name,
        strength: selectedMed.strength || null,
        form: selectedMed.form,
        baseUnit: selectedMed.baseUnit,
        category: selectedMed.category,
        storageType: selectedMed.storageType,
        scheduleType: selectedMed.scheduleType,
      },
      matchingMedicines: [],
      strengthWarning: false,
    }]);

    // Initialize form data for new medicine
    setExtractedFormData(prev => ({
      ...prev,
      [newIdx]: {
        // Keep what the bill said; the matched master medicine is shown in the dropdown
        medicineName: formData.extractedName || selectedMed.name,
        strength: formData.extractedStrength ?? (selectedMed.strength || ""),
        quantity: formData.quantity || 0,
        batchNumber: formData.batchNumber || "",
        expiryDate: formData.expiryDate || "",
        unitPrice: formData.unitPrice || 0,
        totalPrice: formData.totalPrice || 0,
      },
    }));

    setSelectedMedicineIds(prev => ({
      ...prev,
      [newIdx]: selectedId,
    }));

    // Tick the row like a dropdown pick does — unticked rows are sent back to
    // the missing list on Proceed, which made moved medicines silently vanish.
    setCheckedMedicines(prev => ({
      ...prev,
      [newIdx]: true,
    }));

    setMatchingMedicinesMap(prev => ({
      ...prev,
      [newIdx]: errorMatchingMedicinesMap[errorIdx],
    }));

    // Remove from error medicines by _tempId (stable across array reorders).
    const updatedErrors = movedTempId
      ? errorMedicines.filter((e) => e._tempId !== movedTempId)
      : errorMedicines.filter((_, i) => i !== errorIdx);
    setErrorMedicines(updatedErrors);

    // Clean up per-row state for the removed index. The remaining indices
    // shift down by one (since we removed from the middle), so re-key the
    // form-data / selection maps to match the new array order.
    const reindex = (map) => {
      const next = {};
      let cursor = 0;
      errorMedicines.forEach((e, i) => {
        if (i === errorIdx) return; // skip the removed one
        if (map[i] !== undefined) next[cursor] = map[i];
        cursor++;
      });
      return next;
    };
    setErrorMedicinesFormData(reindex(errorMedicinesFormData));
    setSelectedErrorMedicineIds(reindex(selectedErrorMedicineIds));
    setErrorMatchingMedicinesMap(reindex(errorMatchingMedicinesMap));

    toast.success("Medicine moved to extracted list");
  };

  // Handle editing missing medicines in success view
  const handleEditMissingMedicine = (medicine, idx) => {
    setEditingMissingMedicineIdx(idx);
    setEditingMissingMedicineData({
      _tempId: medicine._tempId, // Preserve ID so retry flow can track this medicine
      extractedName: medicine.extractedName,
      extractedStrength: medicine.extractedStrength,
    });
    setEditingMissingMatches([]);
  };

  const handleSearchMissingMedicine = async () => {
    if (!editingMissingMedicineData.extractedName?.trim()) {
      toast.warning("Please enter medicine name");
      return;
    }

    setEditingMissingLoading(true);
    try {
      const matches = await fetchMatchingMedicines(
        editingMissingMedicineData.extractedName,
        editingMissingMedicineData.extractedStrength,
        { strict: false }
      );
      setEditingMissingMatches(matches || []);
      if (!matches || matches.length === 0) {
        toast.info("No matches found. Try different name or strength");
      }
    } catch (err) {
      console.error("Error searching medicines:", err);
      toast.error("Failed to search medicines");
    } finally {
      setEditingMissingLoading(false);
    }
  };

  const handleProceedFromExtraction = async () => {
    // Process ALL medicines (checked & unchecked)
    // Unselected ones will be moved to errors array
    let indicesToProcess = extractedMedicines.map((_, idx) => String(idx));

    if (indicesToProcess.length === 0) {
      setError("No medicines to process");
      return;
    }

    if (!centerId) {
      setError("Please select a pharmacy center before proceeding");
      toast.error("Pharmacy center is required");
      return;
    }

    setConfirmationLoading(true);
    setError(null);

    try {
      // Step 1: Fetch matching medicines for ALL medicines
      const matchingMap = {};
      for (let idx of indicesToProcess) {
        const extractedData = extractedFormData[idx];
        const matches = await fetchMatchingMedicines(
          extractedData.medicineName,
          extractedData.strength
        );
        matchingMap[idx] = matches || [];

        // Keep the user's pick even if the re-search no longer returns it
        // (e.g. it was found via an edited name/strength on the missing list,
        // or fell outside the server's candidate limit). Without this the
        // selection couldn't be resolved and the medicine was silently dropped.
        const selectedId = selectedMedicineIds[idx];
        if (selectedId && !matchingMap[idx].some((m) => (m._id || m.id) === selectedId)) {
          const previousPick = matchingMedicinesMap[idx]?.find((m) => (m._id || m.id) === selectedId);
          if (previousPick) matchingMap[idx] = [previousPick, ...matchingMap[idx]];
        }
      }
      setMatchingMedicinesMap(matchingMap);

      // Step 2: Process all medicines (selected ones proceed, unselected go to errors)
      await handleProceedToPharmacyCheckAuto(indicesToProcess, matchingMap);
    } catch (err) {
      console.error("Error in extraction flow:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to process medicines";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setConfirmationLoading(false);
    }
  };

  const handleProceedToPharmacyCheckAuto = async (indicesToProcess, matchingMap) => {
    try {
      const results = {};
      const unselectedMedicines = [];

      // Precompute discounted prices once for the whole submission. The
      // proportional-distribution formula needs the total bill across all
      // medicines, so it must be calculated outside the per-medicine loop.
      // Only includes rows the user actually selected + checked, so unselected
      // rows don't dilute the share. Pharmacy-check below reads from this map.
      const eligibleIdx = indicesToProcess.filter((idx) => {
        const i = parseInt(idx);
        return checkedMedicines[i] && selectedMedicineIds[i];
      });
      const eligibleLines = eligibleIdx.map((idx) => {
        const i = parseInt(idx);
        const editedData = extractedFormData[i] || extractedMedicines[i]?.ocrExtracted;
        return {
          unitPrice: parseFloat(editedData?.unitPrice) || 0,
          quantity: parseFloat(editedData?.quantity) || 0,
        };
      });
      const eligibleDiscounts = computeDiscountedPrices(eligibleLines, billDiscountAmount, billDiscountPercentage, billGrossAmount);
      const discountByIdx = {};
      eligibleIdx.forEach((idx, j) => {
        discountByIdx[parseInt(idx)] = eligibleDiscounts[j]?.purchasePrice ?? null;
      });

      for (const idx of indicesToProcess) {
        const idx_num = parseInt(idx);
        const isChecked = checkedMedicines[idx_num];
        const selectedMedicineId = selectedMedicineIds[idx_num];
        const medicine = extractedMedicines[idx_num];

        // Check if medicine is unchecked OR user didn't select a medicine from dropdown
        if (!isChecked || !selectedMedicineId) {
          // Medicine is unchecked OR no dropdown selection - add to errors
          const reason = !isChecked
            ? "Not checked by user"
            : "No medicine selected from dropdown";
          const editedData = extractedFormData[idx_num] || medicine.ocrExtracted;
          unselectedMedicines.push({
            _tempId: medicine._tempId, // Preserve ID for tracking
            extractedName: editedData?.medicineName || medicine.ocrExtracted?.name,
            extractedStrength: editedData?.strength || medicine.ocrExtracted?.strength,
            quantity: editedData?.quantity || medicine.ocrExtracted?.quantity || 0,
            batchNumber: editedData?.batchNumber || medicine.ocrExtracted?.batchNumber || null,
            expiryDate: editedData?.expiryDate || medicine.ocrExtracted?.expiryDate || null,
            unitPrice: editedData?.unitPrice || medicine.ocrExtracted?.unitPrice || null,
            totalPrice: editedData?.totalPrice || medicine.ocrExtracted?.totalPrice || null,
            reason: reason,
            action: "Edit & Retry from missing list",
          });
          continue;
        }

        // Find the medicine that user selected from dropdown
        let selectedMedicine = matchingMap[idx_num]?.find(
          m => (m._id || m.id) === selectedMedicineId
        );

        // Never drop a row silently: if the pick can't be resolved, send it back
        // to the missing list so the user sees it and can select again.
        if (!selectedMedicine) {
          const editedData = extractedFormData[idx_num] || medicine.ocrExtracted;
          unselectedMedicines.push({
            _tempId: medicine._tempId,
            extractedName: editedData?.medicineName || medicine.ocrExtracted?.name,
            extractedStrength: editedData?.strength || medicine.ocrExtracted?.strength,
            quantity: editedData?.quantity || medicine.ocrExtracted?.quantity || 0,
            batchNumber: editedData?.batchNumber || medicine.ocrExtracted?.batchNumber || null,
            expiryDate: editedData?.expiryDate || medicine.ocrExtracted?.expiryDate || null,
            unitPrice: editedData?.unitPrice || medicine.ocrExtracted?.unitPrice || null,
            totalPrice: editedData?.totalPrice || medicine.ocrExtracted?.totalPrice || null,
            reason: "Selected medicine could not be resolved — please search and select again",
            action: "Edit & Retry from missing list",
          });
          continue;
        }

        if (selectedMedicine) {
          const medicineId = selectedMedicine._id || selectedMedicine.id;
          const editedData = extractedFormData[idx_num] || medicine.ocrExtracted;

          // Use the single-formula discounted price computed up-front for the
          // whole submission. Falls back to raw unitPrice if somehow missing.
          const unitPrice = parseFloat(editedData?.unitPrice) || 0;
          const discountedPrice = discountByIdx[idx_num] ?? unitPrice;

          try {
            const checkResult = await checkExistingMedicineInPharmacy({
              medicineId: medicineId,
              centerId: centerId,
              batchNumber: editedData?.batchNumber,
              expiryDate: editedData?.expiryDate,
              purchasePrice: discountedPrice,
            });

            results[idx_num] = {
              medicineId: medicineId,
              _tempId: medicine._tempId, // Track processed medicine ID
              selectedMedicine,
              extractedData: editedData, // Use edited form data, fallback to original
              pharmacyStatus: { exists: checkResult.exists, data: checkResult.data },
            };
          } catch (err) {
            console.error(`Error checking medicine at index ${idx_num}:`, err);
            // Still add medicine to results even if check fails, just mark as error
            results[idx_num] = {
              medicineId: medicineId,
              _tempId: medicine._tempId, // Track processed medicine ID
              selectedMedicine,
              extractedData: editedData,
              pharmacyStatus: { exists: false, error: err.message },
            };
          }
        }
      }

      // Add unselected medicines to error list
      if (unselectedMedicines.length > 0) {
        const newErrorList = [...errorMedicines, ...unselectedMedicines];
        console.log(`📊 ERROR MEDICINES UPDATE:`);
        console.log(`   Before: ${errorMedicines.length} medicines`);
        console.log(`   Adding: ${unselectedMedicines.length} unselected medicines`);
        console.log(`   After: ${newErrorList.length} medicines`, newErrorList);
        setErrorMedicines(newErrorList);

        toast.info(`${unselectedMedicines.length} medicine(s) not selected — moved to "Missing" list. You can retry them later.`);
      }

      if (Object.keys(results).length === 0) {
        const errorMsg = unselectedMedicines.length > 0
          ? "All medicines were unselected. Please select medicines from the dropdown before proceeding."
          : "No medicines could be processed. Please try again.";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      setPharmacyCheckResults(results);
      initializeMedicineFormData(results);
      setStep("confirm");
    } catch (err) {
      console.error("Error in pharmacy check:", err);
      setError(err.message || "Failed to process medicines");
      throw err;
    }
  };

  // ============================================
  // STEP 2: Handle Medicine Selection
  // ============================================

  const handleMedicineSelect = (idx, medicineId) => {
    setSelectedMedicineIds((prev) => ({
      ...prev,
      [idx]: medicineId,
    }));
  };

  const handleSelectAllMedicines = () => {
    const allSelected = {};
    extractedMedicines.forEach((_, idx) => {
      if (matchingMedicinesMap[idx]?.length > 0) {
        allSelected[idx] = matchingMedicinesMap[idx][0]._id;
      }
    });
    setSelectedMedicineIds(allSelected);
  };

  const handleDeselectAllMedicines = () => {
    setSelectedMedicineIds({});
  };

  const handleProceedToPharmacyCheck = async () => {
    const selectedCount = Object.keys(selectedMedicineIds).length;
    if (selectedCount === 0) {
      setError("Please select at least one medicine");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check pharmacy status for each selected medicine
      const results = {};
      for (const [idx, medicineId] of Object.entries(selectedMedicineIds)) {
        const idx_num = parseInt(idx);
        const extractedData = extractedFormData[idx_num];
        const selectedMedicine = matchingMedicinesMap[idx_num]?.find(
          (m) => m._id === medicineId
        );

        if (!selectedMedicine) continue;

        // Get discounted price calculated from proportional discount distribution
        const medicineData = newMedicinesData.find(m => m.idx === idx_num) ||
          existingMedicinesData.find(m => m.idx === idx_num);
        const discountedPrice = medicineData?.discountedPrice ||
          parseFloat(extractedData.purchasePrice) || 0;

        try {
          const checkResult = await checkExistingMedicineInPharmacy({
            medicineId,
            centerId: centerId,
            batchNumber: extractedData.batchNumber,
            expiryDate: extractedData.expiryDate,
            purchasePrice: discountedPrice,
          });

          results[idx_num] = {
            medicineId,
            selectedMedicine,
            extractedData,
            pharmacyStatus: {
              exists: checkResult.exists,
              data: checkResult.data,
            },
          };
        } catch (err) {
          console.error(`Error checking medicine ${idx}:`, err);
          results[idx_num] = {
            medicineId,
            selectedMedicine,
            extractedData,
            pharmacyStatus: { exists: false },
          };
        }
      }

      setPharmacyCheckResults(results);
      initializeMedicineFormData(results);
      setStep("confirm");
    } catch (err) {
      console.error("Error in pharmacy check:", err);
      setError(err.response?.data?.message || "Failed to check pharmacy status");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // STEP 3: Initialize Medicine Form Data
  // ============================================

  const initializeMedicineFormData = (results) => {
    const initialData = {};

    // Use the single proportional-discount helper so initial purchasePrice
    // matches what the display memo and pharmacy-check both compute.
    const orderedEntries = Object.entries(results);
    const lines = orderedEntries.map(([, result]) => {
      const ext = result.extractedData || {};
      return {
        unitPrice: parseFloat(ext.unitPrice) || 0,
        quantity: parseFloat(ext.quantity) || 0,
      };
    });
    const discounts = computeDiscountedPrices(lines, billDiscountAmount, billDiscountPercentage, billGrossAmount);

    orderedEntries.forEach(([idx, result], i) => {
      const { extractedData } = result;
      const basePrice = parseFloat(extractedData.unitPrice) || 0;
      const purchasePriceWithDiscount = discounts[i]?.purchasePrice ?? basePrice;

      initialData[idx] = {
        medicineName: extractedData.medicineName || "",
        strength: extractedData.strength || "",
        quantity: parseFloat(extractedData.quantity) || 0,
        batchNumber: extractedData.batchNumber || "",
        expiryDate: extractedData.expiryDate || "",
        unitPrice: basePrice,
        totalCost: extractedData.totalCost || 0,
        purchasePrice: purchasePriceWithDiscount,
        mrp: basePrice > 0 ? Math.round(basePrice * 100) / 100 : "",
        salePrice: "",
        company: "",
        manufacturer: "",
        rackNumber: "",
      };
    });
    setMedicineFormData(initialData);
  };

  const handleFormChange = (idx, field, value) => {
    setMedicineFormData((prev) => {
      const updated = {
        ...prev,
        [idx]: {
          ...prev[idx],
          [field]: value,
          // Manually editing Purchase Price makes it final — stop
          // auto-recomputing it from unitPrice/quantity/discount from here on.
          ...(field === "purchasePrice" ? { purchasePriceEdited: true } : {}),
        },
      };

      return updated;
    });
  };

  // ============================================
  // STEP 4: Summary and Confirmation
  // ============================================

  const validatePharmacyCheckData = () => {
    for (const data of Object.values(medicineFormData)) {
      if (!data?.batchNumber) {
        setError(`Batch Number is required`);
        return false;
      }
      if (!data?.expiryDate) {
        setError(`Expiry Date is required`);
        return false;
      }
      if (!data?.quantity) {
        setError(`Quantity is required`);
        return false;
      }
    }
    return true;
  };

  // Consolidated: handleProceedToSummary removed - confirm step now includes summary

  // ============================================
  // Final Submission
  // ============================================

  const handleFinalSubmission = async () => {
    console.log(`\n🔍 FINAL SUBMISSION DEBUG:`);
    console.log(`   Error Medicines Count: ${errorMedicines.length}`);
    console.log(`   Error Medicines Details:`, errorMedicines.map(m => ({
      name: m.extractedName,
      strength: m.extractedStrength,
      reason: m.reason
    })));
    console.log(`   Confirmed Medicines: ${Object.keys(pharmacyCheckResults).length}`);

    setLoading(true);
    setError(null);

    try {
      // Build medicine confirmations from selected medicines
      const medicineConfirmations = [];
      const processedMedicineIds = []; // Database IDs
      const processedTempIds = []; // Temporary session IDs for error medicine filtering

      Object.entries(pharmacyCheckResults).forEach(([idx, result]) => {
        const formData = medicineFormData[idx];
        const medicineName = formData.medicineName || extractedFormData[idx]?.medicineName;
        const strength = formData.strength || extractedFormData[idx]?.strength;

        // Track successfully processed medicines by ID for API and by temp ID for filtering errors
        processedMedicineIds.push(result.medicineId);
        if (result._tempId) {
          processedTempIds.push(result._tempId);
        }

        medicineConfirmations.push({
          _tempId: result._tempId, // Send stable ID so server can match to its extracted record
          medicineId: result.medicineId,
          quantity: formData.quantity,
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate,
          purchasePrice: formData.purchasePrice,
          mrp: formData.mrp,
          salePrice: formData.salePrice,
          company: formData.company,
          manufacturer: formData.manufacturer,
          rackNumber: formData.rackNumber,
        });
      });

      console.log(`\n📤 SENDING TO API:`);
      console.log(`   medicineConfirmations count: ${medicineConfirmations.length}`);
      console.log(`   errorMedicines count: ${errorMedicines.length}`);
      console.log(`   errorMedicines being passed:`, errorMedicines);

      const response = await confirmOCRMedicines({
        billImportId,
        billMetadata: {
          billNumber,
          billSupplier,
          billGrossAmount,
          billDiscountPercentage,
          billDiscountAmount,
          billFinalAmount,
          billTotal,
        },
        medicineConfirmations,
        errorMedicines: errorMedicines, // Include all error medicines (unchecked + not found)
      });

      console.log("✅ Confirm response:", response);

      const result = response.data || response;

      if (!result || !result.billImportId) {
        console.error("Invalid confirm response:", result);
        throw new Error("Invalid response: missing billImportId");
      }

      // Remove successfully processed medicines from error list using temp IDs
      console.log("🔍 FILTERING LOGIC DEBUG (ID-BASED):");
      console.log(`   Processed temp IDs:`, processedTempIds);
      console.log(`   Error medicines before filtering:`, errorMedicines);

      const updatedErrorMedicines = errorMedicines.filter(error => {
        const wasProcessed = processedTempIds.includes(error._tempId);

        if (error._tempId) {
          console.log(`   Checking error: "${error.extractedName}" (${error.extractedStrength}) - ID: ${error._tempId}`);
          console.log(`   Result: ${wasProcessed ? "REMOVE" : "KEEP"}`);
        }

        return !wasProcessed;
      });

      if (updatedErrorMedicines.length < errorMedicines.length) {
        const removed = errorMedicines.filter(e => !updatedErrorMedicines.includes(e));
        console.log(`🗑️ Removed ${removed.length} processed medicines from error list`);
        console.log(`   Removed: ${removed.map(e => `${e.extractedName} (${e.extractedStrength})`).join(", ")}`);
      } else {
        console.log(`ℹ️ No medicines removed from error list`);
      }

      // Update state with filtered medicines and add to success result
      setErrorMedicines(updatedErrorMedicines);
      setSuccessResult({
        ...result,
        pendingErrors: updatedErrorMedicines, // Store filtered errors in result
      });
      setStep("success");
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || err.message || "Failed to submit medicines");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Resume & Retry Functions
  // ============================================

  const handleResumeBill = async (billImportIdParam) => {
    console.log("\n📂 RESUMING BILL:", billImportIdParam);
    setLoading(true);
    try {
      const bill = await getOCRBillDetails(billImportIdParam);
      const billData = bill?.data || bill;

      console.log("  Bill loaded:", billData);

      // Restore bill state
      setBillImportId(billImportIdParam);
      setBillFileUrl(billData.fileUrl || null);
      setErrorMedicines(addIdsToMedicines(billData.errors || []));

      // Restore center selection from the bill record so the next pharmacy-check
      // call lands on the correct center (without this, the user's last manual
      // center pick was reused).
      const restoredCenterId =
        typeof billData.center === "object" ? billData.center?._id : billData.center;
      if (restoredCenterId) {
        const matchedCenter = centerOptions.find(
          (c) => String(c.value) === String(restoredCenterId)
        );
        if (matchedCenter) setSelectedCenter(matchedCenter);
      }

      // Restore financial state
      const meta = billData.extractedData?.billMetadata || {};
      setBillSupplier(meta.supplier || "");
      setBillNumber(meta.billNumber || "");
      const grossAmount = meta.grossAmount || 0;
      const discountAmount = meta.discountAmount || 0;
      const calculatedFinalAmount = grossAmount - discountAmount;

      setBillGrossAmount(grossAmount);
      setBillDiscountPercentage(meta.discountPercentage || 0);
      setBillDiscountAmount(discountAmount);
      setBillFinalAmount(calculatedFinalAmount);
      setBillTotal(meta.totalAmount || 0);

      // Everything extracted from the bill that has NOT been added to inventory yet.
      // Already-processed lines are skipped (matched by _tempId, then name+strength).
      const processedTempIds = new Set(
        (billData.processedItems || []).map((item) => item._tempId).filter(Boolean)
      );
      const processedNameStrength = new Set(
        (billData.processedItems || []).map((item) => {
          const name = (item.pharmacyId?.medicineName || "").toLowerCase().trim();
          const strength = (item.pharmacyId?.Strength || "").toLowerCase().trim();
          return name ? `${name}|${strength}` : null;
        }).filter(Boolean)
      );
      const isProcessedLine = (m) =>
        (m._tempId && processedTempIds.has(m._tempId)) ||
        processedNameStrength.has(`${(m.name || "").toLowerCase().trim()}|${(m.strength || "").toLowerCase().trim()}`);

      const pendingLines = addIdsToMedicines(
        (billData.extractedData?.medicines || []).filter((m) => !isProcessedLine(m))
      );

      // Look every pending line up again (the master / matcher may have changed since upload)
      const matchesByTempId = {};
      for (const med of pendingLines) {
        try {
          matchesByTempId[med._tempId] = (await fetchMatchingMedicines(med.name, med.strength)) || [];
        } catch (err) {
          console.error(`  Error fetching matches for "${med.name}":`, err);
          matchesByTempId[med._tempId] = [];
        }
      }

      const withMatches = pendingLines.filter((m) => matchesByTempId[m._tempId].length > 0);
      const withoutMatches = pendingLines.filter((m) => matchesByTempId[m._tempId].length === 0);

      // Matched lines go to the review table (same shape as a fresh extraction)
      const transformedMedicines = withMatches.map((med) => ({
        _tempId: med._tempId,
        medicineId: null, // Will be selected from matching medicines
        ocrExtracted: {
          name: med.name || "",
          strength: med.strength || "",
          quantity: med.quantity || 0,
          batchNumber: med.batchNumber || null,
          expiryDate: med.expiryDate || null,
          unitPrice: med.unitPrice || null,
          totalPrice: med.totalPrice || null,
          confidence: med.confidence || 0,
        },
        masterData: {},
        matchingMedicines: [],
        strengthWarning: false,
      }));
      setExtractedMedicines(transformedMedicines);

      const initialData = {};
      const matchingMap = {};
      transformedMedicines.forEach((med, idx) => {
        initialData[idx] = {
          medicineName: med.ocrExtracted.name || "",
          strength: med.ocrExtracted.strength || "",
          quantity: med.ocrExtracted.quantity || "",
          batchNumber: med.ocrExtracted.batchNumber || "",
          expiryDate: med.ocrExtracted.expiryDate || "",
          unitPrice: med.ocrExtracted.unitPrice || "",
          totalPrice: med.ocrExtracted.totalPrice || "",
        };
        matchingMap[idx] = matchesByTempId[med._tempId];
      });
      setExtractedFormData(initialData);
      setMatchingMedicinesMap(matchingMap);
      setCheckedMedicines({});
      setSelectedMedicineIds({});

      // Unmatched lines stay in the missing list. Keep the saved error entry when there
      // is one (it carries the user's edits); otherwise build it from the extracted line.
      const savedErrorsById = new Map((billData.errors || []).filter((e) => e._tempId).map((e) => [e._tempId, e]));
      const missingList = withoutMatches.map((med) => {
        const saved = savedErrorsById.get(med._tempId) || {};
        return {
          ...saved,
          _tempId: med._tempId,
          extractedName: saved.extractedName ?? med.name ?? "",
          extractedStrength: saved.extractedStrength ?? med.strength ?? "",
          quantity: med.quantity || 0,
          batchNumber: med.batchNumber || null,
          expiryDate: med.expiryDate || null,
          unitPrice: med.unitPrice || null,
          totalPrice: med.totalPrice || null,
          reason: saved.reason || "No matching medicine found in master database",
        };
      });
      // Saved errors that are not part of extractedData (legacy records without _tempId)
      (billData.errors || []).forEach((e) => {
        const inPending = e._tempId && pendingLines.some((m) => m._tempId === e._tempId);
        if (!inPending && !(e._tempId && processedTempIds.has(e._tempId))) missingList.push(e);
      });
      setErrorMedicines(addIdsToMedicines(missingList));
      setIsResuming(false);

      // Show notification about missing medicines
      if (missingList.length > 0) {
        toast.info(`${missingList.length} missing medicine(s) - Edit and search again!`);
      }

      setStep("extract");
      console.log("✅ Bill resumed successfully");
    } catch (err) {
      console.error("❌ Failed to resume bill:", err);
      setError("Failed to resume bill");
      setIsResuming(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryMissing = async (billImportIdParam) => {
    setLoading(true);
    setIsResuming(true);
    try {
      const bill = await getOCRBillDetails(billImportIdParam);
      const billData = bill?.data || bill;

      // Store billImportId for submission
      setBillImportId(billImportIdParam);

      // Restore center selection so retry's pharmacy-check uses the bill's
      // original center, not whatever the user last picked manually.
      const restoredCenterId =
        typeof billData.center === "object" ? billData.center?._id : billData.center;
      if (restoredCenterId) {
        const matchedCenter = centerOptions.find(
          (c) => String(c.value) === String(restoredCenterId)
        );
        if (matchedCenter) setSelectedCenter(matchedCenter);
      }

      // Restore bill level information from extracted metadata
      const meta = billData.extractedData?.billMetadata || {};
      setBillSupplier(meta.supplier || "");
      setBillNumber(meta.billNumber || "");
      setBillGrossAmount(meta.grossAmount || 0);
      setBillDiscountPercentage(meta.discountPercentage || 0);
      setBillDiscountAmount(meta.discountAmount || 0);
      // Same rule as a fresh extraction / resume: final = gross - discount
      setBillFinalAmount((meta.grossAmount || 0) - (meta.discountAmount || 0));
      setBillTotal(meta.totalAmount || 0);

      // Filter out medicines that are already processed (added to inventory).
      // Prefer _tempId match (stable across renames/case differences); fall back
      // to name+strength for legacy records where the server didn't persist _tempId.
      const processedTempIds = new Set(
        (billData.processedItems || []).map(item => item._tempId).filter(Boolean)
      );
      const processedNameStrength = new Set(
        (billData.processedItems || []).map(item => {
          const name = (item.pharmacyId?.medicineName || "").toLowerCase().trim();
          const strength = (item.pharmacyId?.Strength || "").toLowerCase().trim();
          return name ? `${name}|${strength}` : null;
        }).filter(Boolean)
      );

      // Hydrate errors with quantity/batch/expiry/prices from extractedData.medicines
      // via _tempId lookup. Legacy bills' errors[] don't persist these fields,
      // but extractedData.medicines[] always does — so we can recover them.
      const extractedById = new Map();
      (billData.extractedData?.medicines || []).forEach((m) => {
        if (m._tempId) extractedById.set(m._tempId, m);
      });

      let errorsToRetry = (billData.errors || errorMedicines || []).map((e) => {
        const src = e._tempId ? extractedById.get(e._tempId) : null;
        return {
          ...e,
          quantity: e.quantity ?? src?.quantity ?? 0,
          batchNumber: e.batchNumber ?? src?.batchNumber ?? "",
          expiryDate: e.expiryDate ?? src?.expiryDate ?? "",
          unitPrice: e.unitPrice ?? src?.unitPrice ?? 0,
          totalPrice: e.totalPrice ?? src?.totalPrice ?? 0,
        };
      });

      const isProcessed = (e) => {
        if (e._tempId && processedTempIds.has(e._tempId)) return true;
        const key = `${(e.extractedName || "").toLowerCase().trim()}|${(e.extractedStrength || "").toLowerCase().trim()}`;
        return processedNameStrength.has(key);
      };

      const alreadyProcessed = errorsToRetry.filter(isProcessed);
      errorsToRetry = errorsToRetry.filter(e => !isProcessed(e));

      if (alreadyProcessed.length > 0) {
        console.log(`⏭️ Skipping ${alreadyProcessed.length} medicines already added to inventory:`, alreadyProcessed.map(m => m.extractedName));
        toast.info(`${alreadyProcessed.length} medicine(s) already added to inventory - skipping retry`);
      }

      if (errorsToRetry.length === 0) {
        // All medicines already processed - show success message
        toast.success("All medicines have been successfully added to inventory.");
        setError(null);
        setIsResuming(false);
        // Stay on upload view but show success
        setLoading(false);
        return;
      }

      let newMatches = [];
      const newMatchingMap = { ...matchingMedicinesMap };

      // Re-search for each missing medicine
      console.log(`🔄 Retrying ${errorsToRetry.length} missing medicines...`);
      for (const error of errorsToRetry) {
        try {
          const matches = await fetchMatchingMedicines(error.extractedName, error.extractedStrength, { strict: false });
          if (matches && matches.length > 0) {
            // Found matches! Add to extracted medicines
            const nextIdx = Object.keys(matchingMedicinesMap).length + newMatches.length;
            newMatchingMap[nextIdx] = matches;
            newMatches.push({
              _tempId: error._tempId, // Stable ID — used to look up the original extracted medicine
              name: error.extractedName,
              strength: error.extractedStrength,
              matches,
            });
          }
        } catch (err) {
          console.error(`Failed to retry "${error.extractedName}":`, err);
        }
      }

      if (newMatches.length === 0) {
        // No new matches found - show the medicines that still need attention
        setErrorMedicines(addIdsToMedicines(errorsToRetry));
        toast.warning(`${errorsToRetry.length} medicine(s) still need to be found. Edit them and search again.`);
        setError(null);
        setIsResuming(false);
        setStep("extract");
        setLoading(false);
        return;
      }

      // Build new extracted medicine entries from retried errors
      const updatedExtractedMedicines = [...extractedMedicines];
      const newFormDataEntries = { ...extractedFormData };
      const newCheckedMedicines = { ...checkedMedicines };
      const newSelectedMedicineIds = { ...selectedMedicineIds };

      let startIdx = extractedMedicines.length;

      for (const newMatch of newMatches) {
        // Resolve the original error and extracted-medicine records by _tempId.
        // _tempId is set by the server at extraction time and persisted on
        // both billData.errors[] and billData.extractedData.medicines[],
        // so a single ID lookup is exact across both arrays.
        const originalErrorMedicine = newMatch._tempId
          ? errorsToRetry.find(e => e._tempId === newMatch._tempId)
          : null;

        let originalMedicine = newMatch._tempId
          ? (billData.extractedData?.medicines || []).find(m => m._tempId === newMatch._tempId)
          : null;

        // Legacy fallback: bills created before _tempId tracking — match by name+strength,
        // then by name only.
        const fallbackErrorMedicine = !originalErrorMedicine
          ? errorsToRetry.find(
              e =>
                (e.extractedName || "").toLowerCase().trim() === (newMatch.name || "").toLowerCase().trim() &&
                (e.extractedStrength || "").toLowerCase().trim() === (newMatch.strength || "").toLowerCase().trim()
            ) ||
            errorsToRetry.find(
              e => (e.extractedName || "").toLowerCase().trim() === (newMatch.name || "").toLowerCase().trim()
            )
          : null;

        if (!originalMedicine) {
          originalMedicine = (billData.extractedData?.medicines || []).find(
            m =>
              (m.name || "").toLowerCase().trim() === (newMatch.name || "").toLowerCase().trim() &&
              (m.strength || "").toLowerCase().trim() === (newMatch.strength || "").toLowerCase().trim()
          );
          if (!originalMedicine) {
            originalMedicine = (billData.extractedData?.medicines || []).find(
              m => (m.name || "").toLowerCase().trim() === (newMatch.name || "").toLowerCase().trim()
            );
          }
        }

        if (originalMedicine || newMatch.name) {
          // Ensure expiryDate is in YYYY-MM-DD format for date input
          let formattedExpiryDate = originalMedicine?.expiryDate || "";
          if (formattedExpiryDate && typeof formattedExpiryDate === "string") {
            // If it's already in YYYY-MM-DD, keep it; otherwise try to parse it
            if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedExpiryDate)) {
              let parsed = null;
              const dateStr = formattedExpiryDate.trim();

              // Try MM/YY or MM-YY format (pharmacy expiry, e.g., "07/27" = July 2027)
              const mmyyMatch = dateStr.match(/^(\d{1,2})[-\/](\d{2})$/);
              if (mmyyMatch) {
                const month = parseInt(mmyyMatch[1]);
                let year = parseInt(mmyyMatch[2]);
                // Convert 2-digit year to 4-digit (00-26 = 2000-2026, 27-99 = 1927-1999)
                if (year < 100) {
                  const currentYear = new Date().getFullYear();
                  const twoDigitCurrent = currentYear % 100;
                  year = year <= twoDigitCurrent + 10 ? 2000 + year : 1900 + year;
                }
                if (month >= 1 && month <= 12) {
                  // Set to last day of the month
                  parsed = new Date(year, month, 0);
                }
              }

              // Try DD-MM-YYYY or DD/MM/YYYY format (common in India)
              if (!parsed || isNaN(parsed.getTime())) {
                const ddmmMatch = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
                if (ddmmMatch) {
                  const day = parseInt(ddmmMatch[1]);
                  const month = parseInt(ddmmMatch[2]);
                  const year = parseInt(ddmmMatch[3]);
                  if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    parsed = new Date(year, month - 1, day);
                  }
                }
              }

              // Fallback: try standard Date parsing
              if (!parsed || isNaN(parsed.getTime())) {
                parsed = new Date(dateStr);
              }

              if (parsed && !isNaN(parsed.getTime())) {
                formattedExpiryDate = parsed.toISOString().split('T')[0];
              } else {
                formattedExpiryDate = "";
              }
            }
          }

          // Use first matched medicine's strength from database
          const firstMatch = newMatch.matches?.[0];
          const matchedStrength = firstMatch?.strength || newMatch.strength || "";

          // Create a new medicine entry with the structure expected by extract step
          const errorMedForId = originalErrorMedicine || fallbackErrorMedicine;
          updatedExtractedMedicines.push({
            _tempId: errorMedForId?._tempId, // Preserve ID for tracking across workflow
            medicineId: null, // Will be selected from dropdown
            ocrExtracted: {
              name: newMatch.name,
              strength: matchedStrength,
              batchNumber: originalMedicine?.batchNumber || null,
              quantity: originalMedicine?.quantity || 0,
              unitPrice: originalMedicine?.unitPrice || null,
              totalPrice: originalMedicine?.totalPrice || null,
              expiryDate: originalMedicine?.expiryDate || null,
              confidence: originalMedicine?.confidence || 0,
            },
            masterData: {},
            matchingMedicines: newMatch.matches,
            strengthWarning: false,
          });

          // Initialize form data for this medicine
          newFormDataEntries[startIdx] = {
            medicineName: newMatch.name,
            strength: matchedStrength,
            quantity: originalMedicine?.quantity || 0,
            batchNumber: originalMedicine?.batchNumber || null,
            expiryDate: formattedExpiryDate,
            unitPrice: originalMedicine?.unitPrice || null,
            totalPrice: originalMedicine?.totalPrice || null,
          };

          // Don't auto-select on retry - let user manually verify strength match
          // This ensures user catches any strength mismatches (e.g., 7 vs 7.5)
          newCheckedMedicines[startIdx] = false;
          // newSelectedMedicineIds[startIdx] remains empty - user must manually select

          startIdx++;
        }
      }

      // Update all related state
      setExtractedMedicines(updatedExtractedMedicines);
      setExtractedFormData(newFormDataEntries);
      setCheckedMedicines(newCheckedMedicines);
      setSelectedMedicineIds(newSelectedMedicineIds);

      // Update matching medicines map
      setMatchingMedicinesMap(newMatchingMap);

      // Update the error medicines to remove the newly matched ones
      const retryNames = newMatches.map(m => m.name);
      const updatedErrors = errorMedicines.filter(e => !retryNames.includes(e.extractedName));
      setErrorMedicines(updatedErrors);

      // Update database to mark retried medicines as processed
      try {
        await updateBillErrors({
          billImportId: billImportIdParam,
          errors: updatedErrors,
        });
      } catch (updateErr) {
        console.error("Failed to update bill errors in database:", updateErr);
      }

      setError(null);
      setIsResuming(false);
      toast.success(`Found ${newMatches.length} new matches! Select them to continue.`);
      setStep("extract");
    } catch (err) {
      console.error("Failed to retry missing medicines:", err);
      setError("Failed to retry missing medicines");
      setIsResuming(false);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Reset for new bill
  // ============================================
  // Helper function to add unique IDs to medicines
  // ============================================

  const addIdsToMedicines = (medicines) => {
    return (medicines || []).map((med, idx) => ({
      ...med,
      _tempId: med._tempId || `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
    }));
  };

  // ============================================

  const handleStartNew = () => {
    setStep("upload");
    setFile(null);
    setBillImportId(null);
    setExtractedMedicines([]);
    setErrorMedicines([]);
    setExtractedFormData({});
    setCheckedMedicines({});
    setSelectedMedicineIds({});
    setPharmacyCheckResults({});
    setMedicineFormData({});
    setPharmacyStatus({});
    setSuccessResult(null);
    setError(null);
    setConfirmedMedicines({});
    setMatchingMedicinesMap({});
    setBillSupplier("");
    setBillNumber("");
    setBillGrossAmount(0);
    setBillDiscountPercentage(0);
    setBillDiscountAmount(0);
    setBillFinalAmount(0);
    setBillTotal(0);
  };

  // ============================================
  // Render Functions
  // ============================================

  // Show loading spinner while resuming from navigation
  if (isResuming) {
    return (
      <CardBody
        className="p-3 bg-white d-flex justify-content-center align-items-center"
        style={isMobile ? { width: "100%" } : { width: "78%", minHeight: "300px" }}
      >
        <div className="text-center">
          <Spinner color="primary" />
          <p className="mt-3 text-muted">Loading bill details...</p>
        </div>
      </CardBody>
    );
  }

  // Step 1: Upload
  if (step === "upload") {
    return (
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="px-3 pt-3">
          <h5 className="mb-1 text-uppercase font-weight-bold">
            Upload Pharmacy Bill
          </h5>
          <small className="text-muted">
            Upload a bill image or PDF to automatically extract medicine details
          </small>
        </div>
        <hr className="mb-4 border-secondary" />

        <div className="d-flex justify-content-center mb-5">
          <div style={{ width: "100%", maxWidth: "700px" }}>
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <FormGroup className="mb-4">
                  <Label className="fw-bold mb-2">Select Center</Label>
                  <Select
                    options={centerOptions}
                    value={selectedCenter}
                    onChange={(option) => setSelectedCenter(option)}
                    classNamePrefix="react-select"
                    isDisabled={loading}
                    placeholder="Select a center..."
                    isClearable={false}
                  />
                </FormGroup>

                <FormGroup className="mb-4">
                  <Label className="fw-bold mb-2">Select Bill Image or PDF</Label>
                  <FileUpload
                    attachment={file}
                    setAttachment={(newFile) => {
                      if (newFile) {
                        handleFileSelect({ target: { files: [newFile] } });
                      } else {
                        setFile(null);
                      }
                    }}
                  />
                </FormGroup>

                {error && (
                  <Alert color="danger" className="mt-3">
                    {error}
                  </Alert>
                )}

                <div className="d-flex gap-2 mt-4 justify-content-end">
                  <Button
                    color="primary"
                    onClick={handleUploadBill}
                    disabled={!selectedCenter || !file || loading}
                    className="px-4 py-2 text-white"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      "Upload & Extract"
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Processing Modal */}
        {loading && processingStatus && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 99999,
            }}
          >
            <Card
              style={{
                width: "90%",
                maxWidth: "440px",
                textAlign: "center",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                backgroundColor: "#ffffff",
              }}
            >
              <CardBody style={{ padding: "2rem 2rem 1.5rem" }}>
                {(() => {
                  const stages = [
                    { key: "uploading", label: "Uploading bill" },
                    { key: "extracting", label: "Extracting and matching medicines" },
                  ];
                  const activeIdx = Math.max(0, stages.findIndex((x) => x.key === processingStatus));
                  const copy = {
                    uploading: ["Uploading bill", "Preparing your document for processing."],
                    extracting: ["Extracting medicine details", "This can take a minute or two for longer bills."],
                    matching: ["Matching medicines", "Comparing the extracted names with your medicine master."],
                  }[stages[activeIdx].key];
                  return (
                    <>
                      <Spinner
                        style={{ width: "2.25rem", height: "2.25rem", borderWidth: "3px", color: "#475569" }}
                      />
                      <h5 className="mt-3 mb-1" style={{ color: "#111827", fontWeight: 600 }}>{copy[0]}</h5>
                      <p className="mb-4" style={{ color: "#6b7280", fontSize: "0.9rem" }}>{copy[1]}</p>

                      <div
                        className="text-start mx-auto"
                        style={{ maxWidth: "320px", borderTop: "1px solid #eef0f3", paddingTop: "1rem" }}
                      >
                        {stages.map((st, i) => {
                          const done = i < activeIdx;
                          const active = i === activeIdx;
                          return (
                            <div
                              key={st.key}
                              className="d-flex align-items-center"
                              style={{
                                gap: "0.65rem",
                                padding: "0.3rem 0",
                                fontSize: "0.875rem",
                                color: done || active ? "#111827" : "#9ca3af",
                                fontWeight: active ? 600 : 400,
                              }}
                            >
                              <span
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  flex: "0 0 18px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.65rem",
                                  color: done ? "#fff" : "#6b7280",
                                  background: done ? "#475569" : "#fff",
                                  border: done ? "1px solid #475569" : active ? "2px solid #475569" : "1px solid #d1d5db",
                                }}
                              >
                                {done ? "\u2713" : ""}
                              </span>
                              {st.label}
                            </div>
                          );
                        })}
                      </div>

                      <p className="mb-0 mt-4" style={{ color: "#6b7280", fontSize: "0.78rem" }}>
                        Please keep this page open until it finishes.
                      </p>
                    </>
                  );
                })()}
              </CardBody>
            </Card>
          </div>
        )}
      </CardBody>
    );
  }

  // STEP 1: Extract & Review Medicines
  if (step === "extract") {
    return (
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="px-3 pt-3">
          <h5 className="mb-1 text-primary text-uppercase font-weight-bold">
            Step 1 of 2: Extract & Review
          </h5>
          <small className="text-muted">
            Review extracted medicines in table • Edit inline • All fields are editable
          </small>
        </div>
        <hr className="mb-4 border-secondary" />

        <div className="content-wrapper">
          {extractedMedicines.length > 0 && (
            <Card className="border-0 shadow-sm mb-4 bg-light">
              <CardHeader className="bg-light border-0">
                <h6 className="mb-0 font-weight-bold">📄 Bill Level Information</h6>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>Bill Number</strong>
                        </Label>
                        <Input
                          type="text"
                          size="sm"
                          value={billNumber}
                          onChange={(e) => setBillNumber(e.target.value)}
                          placeholder="Bill number (if extracted)"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>Supplier</strong>
                        </Label>
                        <Input
                          type="text"
                          size="sm"
                          value={billSupplier}
                          onChange={(e) => setBillSupplier(e.target.value)}
                          placeholder="Supplier/Company name for entire bill"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  {/* Financial Breakdown - Always show all fields */}
                  <Row>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>Gross Amount</strong>
                        </Label>
                        <Input
                          type="number"
                          size="sm"
                          value={billGrossAmount || ""}
                          onChange={(e) => setBillGrossAmount(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          step="0.01"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>Discount %</strong>
                        </Label>
                        <Input
                          type="number"
                          size="sm"
                          value={billDiscountPercentage || ""}
                          onChange={(e) => setBillDiscountPercentage(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          step="0.01"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>— Discount Amount</strong>
                        </Label>
                        <Input
                          type="number"
                          size="sm"
                          value={billDiscountAmount || ""}
                          onChange={(e) => setBillDiscountAmount(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          step="0.01"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>= Final Amount (After Discount)</strong>
                        </Label>
                        <Input
                          type="number"
                          size="sm"
                          value={billFinalAmount || ""}
                          onChange={(e) => setBillFinalAmount(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          step="0.01"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>= Total Amount</strong>
                        </Label>
                        <Input
                          type="number"
                          size="sm"
                          value={billTotal || ""}
                          onChange={(e) => setBillTotal(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          step="0.01"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          )}

          {errorMedicines.length > 0 && extractedMedicines.length > 0 && (
            <Card className="mb-4 shadow-sm" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <CardHeader style={{ background: "#f8f9fb", borderBottom: "1px solid #e5e7eb" }}>
                <Row className="align-items-center">
                  <Col>
                    <h6 className="mb-0 font-weight-bold">Missing Medicines ({errorMedicines.length})</h6>
                  </Col>
                  <Col xs="auto">
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => downloadMissingFieldsCSV(errorMedicines)}
                    >
                    Download Excel
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="p-0">
                <style>{`
                .error-medicine-table { border-collapse: separate; border-spacing: 0; }
                .error-medicine-table thead th {
                  position: sticky; top: 0; z-index: 1;
                  background: #f8f9fb;
                  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
                  color: #6b7280;
                  padding: 0.65rem 0.6rem !important;
                  border-bottom: 1px solid #e5e7eb !important;
                  white-space: nowrap;
                }
                .error-medicine-table td {
                  padding: 0.45rem 0.6rem !important;
                  vertical-align: middle;
                  border-top: 0 !important;
                  border-bottom: 1px solid #eef0f3 !important;
                }
                .error-medicine-table tbody tr { transition: background-color .12s ease; }
                .error-medicine-table tbody tr:hover { background-color: #f8fafc; }
                .error-medicine-table input.form-control {
                  font-size: 0.85rem;
                  padding: 0.3rem 0.5rem !important;
                  border: 1px solid #cbd5e1 !important;
                  background-color: #fff;
                  border-radius: 6px;
                  transition: border-color .12s ease, background-color .12s ease, box-shadow .12s ease;
                }
                .error-medicine-table input.form-control:hover { border-color: #94a3b8 !important; }
                .error-medicine-table input.form-control:focus {
                  border-color: #64748b !important;
                  background-color: #fff;
                  box-shadow: 0 0 0 3px rgba(100,116,139, 0.18) !important;
                }
                .error-medicine-table input[type="number"] { text-align: right; font-variant-numeric: tabular-nums; }
                .error-medicine-table input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; }
                
              `}</style>
                <div className="table-responsive">
                  <table className="table table-sm mb-0 error-medicine-table">
                    <thead className="bg-light">
                      <tr>
                        <th style={{ width: "17%" }}>Medicine Name</th>
                        <th style={{ width: "11%" }}>Strength</th>
                        <th style={{ width: "8%" }}>Qty</th>
                        <th style={{ width: "13%" }}>Batch</th>
                        <th style={{ width: "13%" }}>Expiry</th>
                        <th style={{ width: "10%" }}>Unit Price</th>
                        <th style={{ width: "10%" }}>Total</th>
                        <th style={{ width: "18%", textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorMedicines.map((med, idx) => {
                        // Initialize form data for this error medicine on first render
                        if (!errorMedicinesFormData[idx]) {
                          setErrorMedicinesFormData(prev => ({
                            ...prev,
                            [idx]: {
                              _tempId: med._tempId,
                              extractedName: med.extractedName,
                              extractedStrength: med.extractedStrength,
                              quantity: med.quantity || 0,
                              batchNumber: med.batchNumber || "",
                              expiryDate: med.expiryDate || "",
                              unitPrice: med.unitPrice || 0,
                              totalPrice: med.totalPrice || 0,
                            },
                          }));
                        }

                        // Auto-fetch disabled - search happens in extracted list instead

                        return (
                          <React.Fragment key={idx}>
                          <tr>
                            <td>
                              <Input
                                type="text"
                                bsSize="sm"
                                value={errorMedicinesFormData[idx]?.extractedName || ""}
                                onChange={(e) =>
                                  handleErrorMedicineDataChange(idx, "extractedName", e.target.value)
                                }
                                placeholder="Medicine"
                                autoComplete="off"
                              />
                            </td>
                            <td>
                              <Input
                                type="text"
                                bsSize="sm"
                                value={errorMedicinesFormData[idx]?.extractedStrength || ""}
                                onChange={(e) =>
                                  handleErrorMedicineDataChange(idx, "extractedStrength", e.target.value)
                                }
                                placeholder="Strength"
                                autoComplete="off"
                              />
                            </td>
                            <td>
                              <Input
                                type="number"
                                bsSize="sm"
                                value={errorMedicinesFormData[idx]?.quantity || ""}
                                onChange={(e) =>
                                  handleErrorMedicineDataChange(idx, "quantity", e.target.value)
                                }
                                placeholder="0"
                              />
                            </td>
                            <td>
                              <Input
                                type="text"
                                bsSize="sm"
                                value={errorMedicinesFormData[idx]?.batchNumber || ""}
                                onChange={(e) =>
                                  handleErrorMedicineDataChange(idx, "batchNumber", e.target.value)
                                }
                                placeholder="Batch"
                                autoComplete="off"
                              />
                            </td>
                            <td>
                              <Input
                                type="date"
                                bsSize="sm"
                                value={errorMedicinesFormData[idx]?.expiryDate || ""}
                                onChange={(e) =>
                                  handleErrorMedicineDataChange(idx, "expiryDate", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <Input
                                type="number"
                                bsSize="sm"
                                value={errorMedicinesFormData[idx]?.unitPrice || ""}
                                onChange={(e) =>
                                  handleErrorMedicineDataChange(idx, "unitPrice", e.target.value)
                                }
                                placeholder="0"
                              />
                            </td>
                            <td>
                              <Input
                                type="number"
                                bsSize="sm"
                                value={errorMedicinesFormData[idx]?.totalPrice || ""}
                                onChange={(e) =>
                                  handleErrorMedicineDataChange(idx, "totalPrice", e.target.value)
                                }
                                placeholder="0"
                                disabled
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="d-flex gap-1 justify-content-center align-items-center">
                                <Button
                                  color="primary"
                                  size="sm"
                                  outline
                                  disabled={!!errorSearchLoading[idx]}
                                  onClick={() => handleErrorMedicineSearch(idx)}
                                  title="Search for matching medicine in master"
                                  style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}
                                >
                                  {errorSearchLoading[idx] ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    "Search"
                                  )}
                                </Button>
                                <Button
                                  color="link"
                                  size="sm"
                                  onClick={() => {
                                    const updated = errorMedicines.filter((_, i) => i !== idx);
                                    setErrorMedicines(updated);
                                    const updatedFormData = { ...errorMedicinesFormData };
                                    delete updatedFormData[idx];
                                    setErrorMedicinesFormData(updatedFormData);
                                    const updatedMatches = { ...errorMatchingMedicinesMap };
                                    delete updatedMatches[idx];
                                    setErrorMatchingMedicinesMap(updatedMatches);
                                    const updatedSelected = { ...selectedErrorMedicineIds };
                                    delete updatedSelected[idx];
                                    setSelectedErrorMedicineIds(updatedSelected);
                                  }}
                                  title="Remove"
                                  style={{ padding: "0.15rem 0.3rem" }}
                                >
                                  ✕
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {(
                            <tr key={`${idx}-matches`} style={{ backgroundColor: "#f8f9fb" }}>
                              <td colSpan={8} style={{ padding: "0.5rem 1rem" }}>
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4b5563" }}>
                                    Match to:
                                  </span>
                                  <div style={{ minWidth: "280px", flex: 1 }}>
                                    <MissedMedicineSearch
                                      candidates={errorMatchingMedicinesMap[idx]}
                                      selectedId={selectedErrorMedicineIds[idx]}
                                      onPick={(med) => handleSearchPick(idx, med)}
                                      onClear={() => setSelectedErrorMedicineIds((prev) => ({ ...prev, [idx]: null }))}
                                    />
                                  </div>
                                  <Button
                                    color="success"
                                    size="sm"
                                    disabled={!selectedErrorMedicineIds[idx]}
                                    onClick={() => handleAddErrorMedicineToExtracted(idx)}
                                    title="Move this medicine to the extracted list"
                                  >
                                    Move to Extracted
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {extractedMedicines.length === 0 && (
            <div className="text-center py-5">
              {errorMedicines.length === 0 && (
                <Alert color="warning" className="mb-4">
                  <h5 className="font-weight-bold">No Medicines Extracted</h5>
                  <p className="mb-0">
                    No medicines were found in the bill. Please try uploading a different bill.
                  </p>
                </Alert>
              )}

              {errorMedicines.length > 0 && (
                <Card className="mt-4 shadow-sm" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                  <CardHeader style={{ background: "#f8f9fb", borderBottom: "1px solid #e5e7eb" }}>
                    <Row className="align-items-center">
                      <Col>
                        <h6 className="mb-0 font-weight-bold">Missing Medicines Found ({errorMedicines.length})</h6>
                      </Col>
                      <Col xs="auto">
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => downloadMissingFieldsCSV(errorMedicines)}
                        >
                          Download Excel
                        </Button>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody className="p-0">
                    <style>{`
                .error-medicine-table-no-extracted { border-collapse: separate; border-spacing: 0; }
                .error-medicine-table-no-extracted thead th {
                  position: sticky; top: 0; z-index: 1;
                  background: #f8f9fb;
                  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
                  color: #6b7280;
                  padding: 0.65rem 0.6rem !important;
                  border-bottom: 1px solid #e5e7eb !important;
                  white-space: nowrap;
                }
                .error-medicine-table-no-extracted td {
                  padding: 0.45rem 0.6rem !important;
                  vertical-align: middle;
                  border-top: 0 !important;
                  border-bottom: 1px solid #eef0f3 !important;
                }
                .error-medicine-table-no-extracted tbody tr { transition: background-color .12s ease; }
                .error-medicine-table-no-extracted tbody tr:hover { background-color: #f8fafc; }
                .error-medicine-table-no-extracted input.form-control {
                  font-size: 0.85rem;
                  padding: 0.3rem 0.5rem !important;
                  border: 1px solid #cbd5e1 !important;
                  background-color: #fff;
                  border-radius: 6px;
                  transition: border-color .12s ease, background-color .12s ease, box-shadow .12s ease;
                }
                .error-medicine-table-no-extracted input.form-control:hover { border-color: #94a3b8 !important; }
                .error-medicine-table-no-extracted input.form-control:focus {
                  border-color: #64748b !important;
                  background-color: #fff;
                  box-shadow: 0 0 0 3px rgba(100,116,139, 0.18) !important;
                }
                .error-medicine-table-no-extracted input[type="number"] { text-align: right; font-variant-numeric: tabular-nums; }
                .error-medicine-table-no-extracted input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; }
                
              `}</style>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0 error-medicine-table-no-extracted">
                        <thead className="bg-light">
                          <tr>
                            <th style={{ width: "17%" }}>Medicine Name</th>
                            <th style={{ width: "11%" }}>Strength</th>
                            <th style={{ width: "8%" }}>Qty</th>
                            <th style={{ width: "13%" }}>Batch</th>
                            <th style={{ width: "13%" }}>Expiry</th>
                            <th style={{ width: "10%" }}>Unit Price</th>
                            <th style={{ width: "10%" }}>Total</th>
                            <th style={{ width: "18%", textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errorMedicines.map((med, idx) => {
                            if (!errorMedicinesFormData[idx]) {
                              setErrorMedicinesFormData(prev => ({
                                ...prev,
                                [idx]: {
                                  _tempId: med._tempId,
                                  extractedName: med.extractedName,
                                  extractedStrength: med.extractedStrength,
                                  quantity: med.quantity || 0,
                                  batchNumber: med.batchNumber || "",
                                  expiryDate: med.expiryDate || "",
                                  unitPrice: med.unitPrice || 0,
                                  totalPrice: med.totalPrice || 0,
                                },
                              }));
                            }

                            return (
                              <React.Fragment key={idx}>
                              <tr>
                                <td>
                                  <Input
                                    type="text"
                                    bsSize="sm"
                                    value={errorMedicinesFormData[idx]?.extractedName || ""}
                                    onChange={(e) =>
                                      handleErrorMedicineDataChange(idx, "extractedName", e.target.value)
                                    }
                                    placeholder="Medicine"
                                    autoComplete="off"
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="text"
                                    bsSize="sm"
                                    value={errorMedicinesFormData[idx]?.extractedStrength || ""}
                                    onChange={(e) =>
                                      handleErrorMedicineDataChange(idx, "extractedStrength", e.target.value)
                                    }
                                    placeholder="Strength"
                                    autoComplete="off"
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="number"
                                    bsSize="sm"
                                    value={errorMedicinesFormData[idx]?.quantity || ""}
                                    onChange={(e) =>
                                      handleErrorMedicineDataChange(idx, "quantity", e.target.value)
                                    }
                                    placeholder="0"
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="text"
                                    bsSize="sm"
                                    value={errorMedicinesFormData[idx]?.batchNumber || ""}
                                    onChange={(e) =>
                                      handleErrorMedicineDataChange(idx, "batchNumber", e.target.value)
                                    }
                                    placeholder="Batch"
                                    autoComplete="off"
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="date"
                                    bsSize="sm"
                                    value={errorMedicinesFormData[idx]?.expiryDate || ""}
                                    onChange={(e) =>
                                      handleErrorMedicineDataChange(idx, "expiryDate", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="number"
                                    bsSize="sm"
                                    value={errorMedicinesFormData[idx]?.unitPrice || ""}
                                    onChange={(e) =>
                                      handleErrorMedicineDataChange(idx, "unitPrice", e.target.value)
                                    }
                                    placeholder="0"
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="number"
                                    bsSize="sm"
                                    value={errorMedicinesFormData[idx]?.totalPrice || ""}
                                    onChange={(e) =>
                                      handleErrorMedicineDataChange(idx, "totalPrice", e.target.value)
                                    }
                                    placeholder="0"
                                    disabled
                                  />
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <div className="d-flex gap-1 justify-content-center align-items-center">
                                    <Button
                                      color="primary"
                                      size="sm"
                                      outline
                                      disabled={!!errorSearchLoading[idx]}
                                      onClick={() => handleErrorMedicineSearch(idx)}
                                      title="Search for matching medicine in master"
                                      style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}
                                    >
                                      {errorSearchLoading[idx] ? <Spinner size="sm" /> : "Search"}
                                    </Button>
                                    <Button
                                      color="link"
                                      size="sm"
                                      onClick={() => {
                                        const updated = errorMedicines.filter((_, i) => i !== idx);
                                        setErrorMedicines(updated);
                                        const updatedFormData = { ...errorMedicinesFormData };
                                        delete updatedFormData[idx];
                                        setErrorMedicinesFormData(updatedFormData);
                                        const updatedMatches = { ...errorMatchingMedicinesMap };
                                        delete updatedMatches[idx];
                                        setErrorMatchingMedicinesMap(updatedMatches);
                                        const updatedSelected = { ...selectedErrorMedicineIds };
                                        delete updatedSelected[idx];
                                        setSelectedErrorMedicineIds(updatedSelected);
                                      }}
                                      title="Remove"
                                      style={{ padding: "0.15rem 0.3rem" }}
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                              {(
                                <tr key={`${idx}-matches`} style={{ backgroundColor: "#f8f9fb" }}>
                                  <td colSpan={8} style={{ padding: "0.5rem 1rem" }}>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4b5563" }}>
                                        Match to:
                                      </span>
                                      <div style={{ minWidth: "280px", flex: 1 }}>
                                        <MissedMedicineSearch
                                          candidates={errorMatchingMedicinesMap[idx]}
                                          selectedId={selectedErrorMedicineIds[idx]}
                                          onPick={(med) => handleSearchPick(idx, med)}
                                          onClear={() => setSelectedErrorMedicineIds((prev) => ({ ...prev, [idx]: null }))}
                                        />
                                      </div>
                                      <Button
                                        color="success"
                                        size="sm"
                                        disabled={!selectedErrorMedicineIds[idx]}
                                        onClick={() => handleAddErrorMedicineToExtracted(idx)}
                                        title="Move this medicine to the extracted list"
                                      >
                                        Move to Extracted
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {/* Quick Summary Bar */}
          {extractedMedicines.length > 0 && (
            <Row className="mb-3 g-2">
              <Col xs="auto">
                <div style={{ minWidth: 140, padding: "0.5rem 0.9rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>Medicines</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{extractedMedicines.length}</div>
                </div>
              </Col>
              <Col xs="auto">
                <div style={{ minWidth: 140, padding: "0.5rem 0.9rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>Bill total</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", fontVariantNumeric: "tabular-nums" }}>₹{billTotal.toFixed(2)}</div>
                </div>
              </Col>
              {errorMedicines.length > 0 && (
              <Col xs="auto">
                <div style={{ minWidth: 140, padding: "0.5rem 0.9rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>Missing from master</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{errorMedicines.length}</div>
                </div>
              </Col>
              )}
            </Row>
          )}

          {/* Compact Table View for Quick Bulk Entry - Only show if medicines were extracted */}
          {extractedMedicines.length > 0 && (
          <Card className="shadow-sm" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <CardHeader className="bg-white" style={{ borderBottom: "1px solid #eef0f3", padding: "0.9rem 1.1rem" }}>
              <h6 className="mb-0 font-weight-bold">
                Extracted Medicines ({extractedMedicines.filter((_, idx) => matchingMedicinesMap[idx]?.length > 0).length} with matches)
              </h6>
              <small className="text-muted d-block mt-1">Tick the rows to import. Use Tab to move between cells, type to edit inline.</small>
            </CardHeader>
            <CardBody className="p-0">
              <style>{`
                .medicine-table { border-collapse: separate; border-spacing: 0; }
                .medicine-table thead th {
                  position: sticky; top: 0; z-index: 1;
                  background: #f8f9fb;
                  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
                  color: #6b7280;
                  padding: 0.65rem 0.6rem !important;
                  border-bottom: 1px solid #e5e7eb !important;
                  white-space: nowrap;
                }
                .medicine-table td {
                  padding: 0.45rem 0.6rem !important;
                  vertical-align: middle;
                  border-top: 0 !important;
                  border-bottom: 1px solid #eef0f3 !important;
                }
                .medicine-table tbody tr { transition: background-color .12s ease; }
                .medicine-table tbody tr:hover { background-color: #f8fafc; }
                .medicine-table input.form-control {
                  font-size: 0.85rem;
                  padding: 0.3rem 0.5rem !important;
                  border: 1px solid #cbd5e1 !important;
                  background-color: #fff;
                  border-radius: 6px;
                  transition: border-color .12s ease, background-color .12s ease, box-shadow .12s ease;
                }
                .medicine-table input.form-control:hover { border-color: #94a3b8 !important; }
                .medicine-table input.form-control:focus {
                  border-color: #64748b !important;
                  background-color: #fff;
                  box-shadow: 0 0 0 3px rgba(100,116,139, 0.18) !important;
                }
                .medicine-table input[type="number"] { text-align: right; font-variant-numeric: tabular-nums; }
                .medicine-table input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; }
                .medicine-table tbody tr.row-checked { background-color: #fafbfc; }
                .medicine-table tbody tr.row-unchecked td { opacity: 0.55; }
                .medicine-table tbody tr.row-unchecked:hover td { opacity: 1; }
                .medicine-table input[type="date"] { min-width: 128px; }
              `}</style>
              <div className="table-responsive">
                <table className="table table-sm mb-0 medicine-table">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: "3%" }}>
                        <Input
                          type="checkbox"
                          checked={Object.keys(checkedMedicines).length === extractedMedicines.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const allChecked = {};
                              extractedMedicines.forEach((_, i) => {
                                allChecked[i] = true;
                              });
                              setCheckedMedicines(allChecked);
                            } else {
                              setCheckedMedicines({});
                            }
                          }}
                          title="Select all"
                        />
                      </th>
                      <th style={{ width: "24%" }}>Matched Medicine</th>
                      <th style={{ width: "16%" }}>Medicine Name</th>
                      <th style={{ width: "9%" }}>Strength</th>
                      <th style={{ width: "7%", textAlign: "right" }}>Qty</th>
                      <th style={{ width: "11%" }}>Batch</th>
                      <th style={{ width: "11%" }}>Expiry</th>
                      <th style={{ width: "8%", textAlign: "right" }}>Unit Price</th>
                      <th style={{ width: "8%", textAlign: "right" }}>Total</th>
                      <th style={{ width: "3%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedMedicines.map((_, idx) => {
                      // Skip medicines with no matches - they should be in errors array
                      if (!matchingMedicinesMap[idx] || matchingMedicinesMap[idx].length === 0) {
                        return null;
                      }
                      return (
                      <tr key={idx} className={checkedMedicines[idx] ? "row-checked" : "row-unchecked"}>
                        <td>
                          <Input
                            type="checkbox"
                            checked={!!checkedMedicines[idx]}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCheckedMedicines({
                                  ...checkedMedicines,
                                  [idx]: true,
                                });
                              } else {
                                const updated = { ...checkedMedicines };
                                delete updated[idx];
                                setCheckedMedicines(updated);
                              }
                            }}
                          />
                        </td>
                        <td style={{ minWidth: "250px" }}>
                          {matchingMedicinesMap[idx]?.length > 0 ? (
                            <Select
                              options={matchingMedicinesMap[idx]?.map((m) => ({
                                value: m._id,
                                label: formatMedicineLabel(m),
                                data: m,
                              })) || []}
                              value={
                                selectedMedicineIds[idx]
                                  ? {
                                    value: selectedMedicineIds[idx],
                                    label: formatMedicineLabel(matchingMedicinesMap[idx]?.find((m) => m._id === selectedMedicineIds[idx])) || selectedMedicineIds[idx],
                                  }
                                  : null
                              }
                              onChange={(selected) => {
                                if (selected) {
                                  setSelectedMedicineIds({
                                    ...selectedMedicineIds,
                                    [idx]: selected.value,
                                  });
                                  // Auto-check the checkbox when medicine is selected
                                  setCheckedMedicines({
                                    ...checkedMedicines,
                                    [idx]: true,
                                  });
                                } else {
                                  // X clicked — clear selection and uncheck the row
                                  const updatedIds = { ...selectedMedicineIds };
                                  delete updatedIds[idx];
                                  setSelectedMedicineIds(updatedIds);
                                  const updatedChecked = { ...checkedMedicines };
                                  delete updatedChecked[idx];
                                  setCheckedMedicines(updatedChecked);
                                }
                              }}
                              isClearable
                              isSearchable
                              placeholder="Select medicine..."
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: "36px",
                                  fontSize: "0.8rem",
                                  padding: "0 4px",
                                }),
                                option: (base, state) => ({
                                  ...base,
                                  fontSize: "0.8rem",
                                  padding: "8px 12px",
                                  whiteSpace: "nowrap",
                                  backgroundColor: state.isSelected ? "#007bff" : state.isFocused ? "#e7f3ff" : "white",
                                  color: state.isSelected ? "white" : "black",
                                }),
                                menu: (base) => ({
                                  ...base,
                                  width: "auto",
                                  minWidth: "300px",
                                }),
                                menuList: (base) => ({
                                  ...base,
                                  maxHeight: "200px",
                                }),
                                singleValue: (base) => ({
                                  ...base,
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                  color: "#007bff",
                                }),
                              }}
                            />
                          ) : (
                            <span className="text-muted small">Searching...</span>
                          )}
                        </td>
                        <td>
                          <Input
                            type="text"
                            bsSize="sm"
                            value={extractedFormData[idx]?.medicineName || ""}
                            onChange={(e) =>
                              handleExtractedDataChange(idx, "medicineName", e.target.value)
                            }
                            placeholder="Medicine"
                            autoComplete="off"
                          />
                        </td>
                        <td>
                          <Input
                            type="text"
                            bsSize="sm"
                            value={extractedFormData[idx]?.strength || ""}
                            onChange={(e) =>
                              handleExtractedDataChange(idx, "strength", e.target.value)
                            }
                            placeholder="Strength"
                            autoComplete="off"
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            bsSize="sm"
                            value={extractedFormData[idx]?.quantity || ""}
                            onChange={(e) =>
                              handleExtractedDataChange(idx, "quantity", e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <Input
                            type="text"
                            bsSize="sm"
                            value={extractedFormData[idx]?.batchNumber || ""}
                            onChange={(e) =>
                              handleExtractedDataChange(idx, "batchNumber", e.target.value)
                            }
                            placeholder="Batch"
                            autoComplete="off"
                          />
                        </td>
                        <td>
                          <Input
                            type="date"
                            bsSize="sm"
                            value={extractedFormData[idx]?.expiryDate || ""}
                            onChange={(e) =>
                              handleExtractedDataChange(idx, "expiryDate", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            bsSize="sm"
                            value={extractedFormData[idx]?.unitPrice || ""}
                            onChange={(e) =>
                              handleExtractedDataChange(idx, "unitPrice", e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            bsSize="sm"
                            value={extractedFormData[idx]?.totalPrice || ""}
                            onChange={(e) =>
                              handleExtractedDataChange(idx, "totalPrice", e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="text-center">
                          <Badge color="light" className="text-muted border" style={{ fontSize: "0.75rem", fontWeight: 500 }} title="Extracted by OCR">
                            ✓
                          </Badge>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
          )}

          {error && <Alert color="danger" className="mt-3">{error}</Alert>}

          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button
              color="secondary"
              onClick={() => setStep("upload")}
              outline
            >
              Upload Different Bill
            </Button>
            <Button
              color="primary"
              onClick={handleProceedFromExtraction}
              disabled={confirmationLoading || extractedMedicines.length === 0 || Object.keys(checkedMedicines).length === 0}
            >
              {confirmationLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                "Review & Proceed"
              )}
            </Button>
          </div>
        </div>
      </CardBody>
    );
  }

  // STEP 2: Select Medicines
  if (step === "selectMedicines") {
    return (
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="px-3 pt-3">
          <h5 className="mb-1 text-primary text-uppercase font-weight-bold">
            Step 2: Select Medicines
          </h5>
          <small className="text-muted">
            Choose which medicines to import from the extracted list
          </small>
        </div>
        <hr className="mb-4 border-secondary" />

        <div className="content-wrapper">
          {/* Bill Summary Card at Top */}
          <Card className="border-0 shadow-sm mb-4 bg-light">
            <CardHeader className="bg-light border-0 pb-2">
              <h6 className="mb-0 font-weight-bold">Bill Summary</h6>
            </CardHeader>
            <CardBody className="p-3">
              <Row>
                <Col md="6" sm="12" className="mb-2">
                  <small className="text-muted d-block mb-1">
                    <strong>Bill Supplier</strong>
                  </small>
                  <div className="font-weight-bold">
                    {billSupplier || "Not specified"}
                  </div>
                </Col>
                <Col md="6" sm="12" className="mb-2">
                  <small className="text-muted d-block mb-1">
                    <strong>Bill Total</strong>
                  </small>
                  <div className="font-weight-bold text-success">
                    ₹ {billTotal.toFixed(2)}
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {Object.keys(matchingMedicinesMap).length === 0 ? (
            <Alert color="warning">
              <h5>No medicines found</h5>
              <p>Could not find matching medicines in the database for the extracted items.</p>
            </Alert>
          ) : (
            <>
              <div className="mb-4 d-flex gap-2">
                <Button
                  color="info"
                  outline
                  size="sm"
                  onClick={handleSelectAllMedicines}
                >
                  Select All
                </Button>
                <Button
                  color="warning"
                  outline
                  size="sm"
                  onClick={handleDeselectAllMedicines}
                >
                  Deselect All
                </Button>
              </div>

              {extractedMedicines.map((_, idx) => {
                const selectedMedicineId = selectedMedicineIds[idx];
                const selectedMedicineData = matchingMedicinesMap[idx]?.find(
                  (m) => m._id === selectedMedicineId
                );

                return (
                  <Card key={idx} className="border-0 shadow-sm mb-3">
                    <CardBody>
                      <Row className="align-items-start">
                        <Col md="1" className="text-center pt-2">
                          <Input
                            type="checkbox"
                            checked={!!selectedMedicineIds[idx]}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const firstMedicine = matchingMedicinesMap[idx]?.[0];
                                if (firstMedicine) {
                                  handleMedicineSelect(idx, firstMedicine._id);
                                }
                              } else {
                                handleMedicineSelect(idx, null);
                              }
                            }}
                          />
                        </Col>
                        <Col md="11">
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1">
                                  {extractedFormData[idx]?.medicineName}
                                  {extractedFormData[idx]?.strength && ` - ${extractedFormData[idx]?.strength}`}
                                </h6>
                                {selectedMedicineData && (
                                  <small className="text-primary d-block mb-2">
                                    <strong>ID:</strong> {selectedMedicineData.id || selectedMedicineData._id}
                                  </small>
                                )}
                              </div>
                            </div>
                            <small className="text-muted d-block">
                              Batch: {extractedFormData[idx]?.batchNumber} | Qty: {extractedFormData[idx]?.quantity} | Price: ₹{extractedFormData[idx]?.unitPrice}
                            </small>
                          </div>

                          {matchingMedicinesMap[idx]?.length > 0 ? (
                            <FormGroup className="mb-0">
                              <Select
                                options={(matchingMedicinesMap[idx] || []).map((m) => ({
                                  value: m._id,
                                  label: formatMedicineLabel(m),
                                }))}
                                value={
                                  selectedMedicineIds[idx]
                                    ? {
                                      value: selectedMedicineIds[idx],
                                      label:
                                        formatMedicineLabel(
                                          matchingMedicinesMap[idx]?.find((m) => m._id === selectedMedicineIds[idx])
                                        ) || "Selected",
                                    }
                                    : null
                                }
                                onChange={(option) => {
                                  if (option) {
                                    handleMedicineSelect(idx, option.value);
                                  }
                                }}
                                placeholder="Select medicine..."
                                classNamePrefix="react-select"
                                isSearchable
                                isDisabled={!selectedMedicineIds[idx]}
                              />
                            </FormGroup>
                          ) : (
                            <Alert color="warning" className="mb-0 p-2">
                              <small>No matching medicines found</small>
                            </Alert>
                          )}
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                );
              })}
            </>
          )}

          {error && <Alert color="danger" className="mt-3">{error}</Alert>}

          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button
              color="secondary"
              onClick={() => setStep("confirmExtraction")}
              outline
            >
              Back
            </Button>
            <Button
              color="primary"
              onClick={handleProceedToPharmacyCheck}
              disabled={loading || Object.keys(selectedMedicineIds).length === 0}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Checking...
                </>
              ) : (
                "Proceed to Pharmacy Check"
              )}
            </Button>
          </div>
        </div>
      </CardBody>
    );
  }

  // STEP 2: Confirm & Submit (Pharmacy Check + Inventory Forms + Summary)
  if (step === "confirm") {
    return (
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="px-3 pt-3">
          <h5 className="mb-1 font-weight-bold" style={{ color: "#111827" }}>
            Step 2 of 2: Confirm & Submit
          </h5>
          <small className="text-muted">
            Review pharmacy status • Fill inventory details • Submit
          </small>
        </div>
        <hr className="mb-4" style={{ borderColor: "#e5e7eb" }} />

        <div className="content-wrapper">
          {/* BILL SUMMARY */}
          <Card className="shadow-sm mb-4" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <CardHeader style={{ background: "#f8f9fb", borderBottom: "1px solid #e5e7eb" }}>
              <h6 className="mb-0 font-weight-bold">Bill Summary</h6>
            </CardHeader>
            <CardBody className="p-3">
              <Row>
                {billNumber && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="d-block" style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>
                      <strong style={{ fontWeight: 700 }}>Bill #</strong>
                    </small>
                    <div className="font-weight-bold small">{billNumber}</div>
                  </Col>
                )}
                {billSupplier && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="d-block" style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>
                      <strong style={{ fontWeight: 700 }}>Supplier</strong>
                    </small>
                    <div className="font-weight-bold small">{billSupplier}</div>
                  </Col>
                )}
                {billGrossAmount > 0 && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="d-block" style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>
                      <strong style={{ fontWeight: 700 }}>Gross</strong>
                    </small>
                    <div className="font-weight-bold small">₹ {billGrossAmount.toFixed(2)}</div>
                  </Col>
                )}
                {billDiscountPercentage > 0 && (
                  <Col md="1" sm="6" className="mb-2">
                    <small className="d-block" style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>
                      <strong style={{ fontWeight: 700 }}>Disc %</strong>
                    </small>
                    <div className="font-weight-bold small">{billDiscountPercentage.toFixed(0)}%</div>
                  </Col>
                )}
                {billDiscountAmount > 0 && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="d-block" style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>
                      <strong style={{ fontWeight: 700 }}>Discount</strong>
                    </small>
                    <div className="font-weight-bold small">— ₹ {billDiscountAmount.toFixed(2)}</div>
                  </Col>
                )}
                {billFinalAmount > 0 && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="d-block" style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>
                      <strong style={{ fontWeight: 700 }}>After Disc</strong>
                    </small>
                    <div className="font-weight-bold small" style={{ color: "#111827" }}>₹ {billFinalAmount.toFixed(2)}</div>
                  </Col>
                )}
                <Col md={billGrossAmount > 0 ? "2" : "3"} sm="6" className="mb-2">
                  <small className="d-block" style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>
                    <strong style={{ fontWeight: 700 }}>Total</strong>
                  </small>
                  <div className="font-weight-bold small" style={{ color: "#111827", fontSize: "0.95rem" }}>₹ {billTotal.toFixed(2)}</div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <style>{`
            .react-data-table-component input {
              font-size: 0.85rem;
              padding: 0.3rem 0.5rem !important;
              border: 1px solid #cbd5e1 !important;
              background-color: #fff;
              border-radius: 6px;
              min-width: 80px;
              transition: border-color .12s ease, box-shadow .12s ease;
            }
            .react-data-table-component input:hover { border-color: #94a3b8 !important; }
            .react-data-table-component input:focus {
              border-color: #64748b !important;
              box-shadow: 0 0 0 3px rgba(100,116,139, 0.18) !important;
            }
            .react-data-table-component input::placeholder { color: #9ca3af; }
          `}</style>

          {/* SECTION 1: NEW MEDICINES TO ADD */}
          {newMedicines.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h6 className="mb-2 font-weight-bold" style={{ color: "#111827" }}>New Medicines ({newMedicines.length})</h6>
              <Card className="shadow-sm" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <CardBody className="p-0" style={{ overflowX: "auto" }}>
                  <DataTable
                    columns={newMedicinesColumns}
                    data={newMedicinesData}
                    defaultSortFieldId={1}
                    noDataComponent={<div style={{ padding: "20px" }}>No medicines to add</div>}
                    highlightOnHover
                    pointerOnHover
                    striped
                    customStyles={{
                      table: { style: { fontSize: "0.85rem", minWidth: "1220px" } },
                      headRow: {
                        style: {
                          backgroundColor: "#f8f9fb",
                          fontWeight: 700,
                          padding: "8px 4px",
                          borderBottom: "1px solid #e5e7eb",
                          fontSize: "0.72rem",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "#6b7280"
                        }
                      },
                      rows: {
                        style: {
                          minHeight: "40px",
                          padding: "6px 4px",
                          "&:hover": { backgroundColor: "#f8fafc" }
                        }
                      },
                      cells: { style: { padding: "6px 8px" } },
                    }}
                  />
                </CardBody>
              </Card>
            </div>
          )}

          {/* SECTION 2: EXISTING MEDICINES */}
          {existingMedicines.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h6 className="mb-2 font-weight-bold" style={{ color: "#111827" }}>Existing Medicines ({existingMedicines.length})</h6>
              <Card className="shadow-sm" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <CardBody className="p-0" style={{ overflowX: "auto" }}>
                  <DataTable
                    columns={existingMedicinesColumns}
                    data={existingMedicinesData}
                    defaultSortFieldId={1}
                    noDataComponent={<div style={{ padding: "20px" }}>No existing medicines</div>}
                    highlightOnHover
                    pointerOnHover
                    striped
                    customStyles={{
                      table: { style: { fontSize: "0.85rem", minWidth: "1300px" } },
                      headRow: {
                        style: {
                          backgroundColor: "#f8f9fb",
                          fontWeight: 700,
                          padding: "8px 4px",
                          borderBottom: "1px solid #e5e7eb",
                          fontSize: "0.72rem",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "#6b7280"
                        }
                      },
                      rows: {
                        style: {
                          minHeight: "40px",
                          padding: "6px 4px",
                          "&:hover": { backgroundColor: "#f8fafc" }
                        }
                      },
                      cells: { style: { padding: "6px 8px" } },
                    }}
                  />
                </CardBody>
              </Card>
            </div>
          )}

          {newMedicines.length === 0 && existingMedicines.length === 0 && (
            <Alert color="info">
              No medicines to process.
            </Alert>
          )}

          {error && <Alert color="danger" className="mt-3">{error}</Alert>}

          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button
              color="secondary"
              onClick={() => setStep("extract")}
              outline
            >
              Back to Extract
            </Button>
            <Button
              color="info"
              onClick={async () => {
                setRechecking(true);
                setError(null);
                try {
                  const results = {};
                  for (const [idx, result] of Object.entries(pharmacyCheckResults)) {
                    const idx_num = parseInt(idx);
                    const formData = medicineFormData[idx_num];
                    const selectedMedicine = result.selectedMedicine;

                    if (!selectedMedicine) continue;

                    // formData.purchasePrice is already the final price with discount applied
                    const purchasePrice = formData.purchasePrice ? Number(formData.purchasePrice) : 0;

                    try {
                      const checkResult = await checkExistingMedicineInPharmacy({
                        medicineId: selectedMedicine._id || selectedMedicine.id,
                        centerId: centerId,
                        batchNumber: formData.batchNumber,
                        expiryDate: formData.expiryDate,
                        purchasePrice: purchasePrice,
                      });

                      results[idx_num] = {
                        medicineId: selectedMedicine._id || selectedMedicine.id,
                        selectedMedicine,
                        extractedData: result.extractedData,
                        pharmacyStatus: { exists: checkResult.exists, data: checkResult.data },
                      };
                    } catch (err) {
                      console.error(`Error rechecking medicine at index ${idx_num}:`, err);
                    }
                  }

                  setPharmacyCheckResults(results);
                  toast.success("Pharmacy check completed. Review the results above.");
                } catch (err) {
                  console.error("Recheck error:", err);
                  setError("Failed to recheck pharmacy status");
                  toast.error("Failed to recheck pharmacy status");
                } finally {
                  setRechecking(false);
                }
              }}
              disabled={rechecking}
              outline
            >
              {rechecking ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Rechecking...
                </>
              ) : (
                "Review Again"
              )}
            </Button>
            <Button
              color="primary"
              onClick={() => {
                if (!validatePharmacyCheckData()) {
                  return;
                }
                handleFinalSubmission();
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                "Submit & Confirm"
              )}
            </Button>
          </div>
        </div>
      </CardBody>
    );
  }

  // Step 4: Success
  if (step === "success") {
    // Safety check
    if (!successResult) {
      return (
        <CardBody
          className="p-3 bg-white"
          style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
          <Alert color="danger">
            <h4>Error Loading Results</h4>
            <p>Could not load success details. Please try again.</p>
            <Button
              color="primary"
              onClick={handleStartNew}
            >
              Upload New Bill
            </Button>
          </Alert>
        </CardBody>
      );
    }

    return (
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="px-3 pt-3 d-flex align-items-center" style={{ gap: "0.85rem" }}>
          <span
            style={{
              width: 36,
              height: 36,
              flex: "0 0 36px",
              borderRadius: "50%",
              background: "#111827",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            {"\u2713"}
          </span>
          <div>
            <h5 className="mb-0 font-weight-bold" style={{ color: "#111827" }}>
              Bill processed
            </h5>
            <small className="text-muted">
              {[billNumber && `Bill ${billNumber}`, billSupplier].filter(Boolean).join(" \u00b7 ") ||
                "Your inventory has been updated"}
            </small>
          </div>
        </div>
        <hr className="mb-4" style={{ borderColor: "#e5e7eb" }} />

        <div className="content-wrapper">
          <style>{`
            .result-table { margin-bottom: 0; }
            .result-table thead th {
              background: #f8f9fb;
              font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
              color: #6b7280; padding: 0.65rem 0.9rem !important;
              border-bottom: 1px solid #e5e7eb !important; border-top: 0 !important; white-space: nowrap;
            }
            .result-table td {
              padding: 0.7rem 0.9rem !important; vertical-align: middle;
              border-top: 0 !important; border-bottom: 1px solid #eef0f3 !important;
              font-size: 0.875rem; color: #111827;
            }
            .result-table tbody tr:last-child td { border-bottom: 0 !important; }
            .result-table tbody tr:hover { background: #f8fafc; }
          `}</style>

          {(() => {
            const addedCount = successResult?.updatedItems?.length || 0;
            const failedCount = successResult?.errors?.length || 0;
            const tiles = [
              { label: "Added to inventory", value: addedCount },
              ...((successResult?.requisitions || []).length > 0
                ? [{ label: "Requisitions raised", value: successResult.requisitions.length }]
                : []),
              ...(failedCount > 0 ? [{ label: "Failed", value: failedCount }] : []),
            ];
            return (
              <Row className="mb-4 g-2">
                {tiles.map((t) => (
                  <Col xs="auto" key={t.label}>
                    <div style={{ minWidth: 150, padding: "0.5rem 0.9rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" }}>{t.label}</div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{t.value}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            );
          })()}

          {successResult.updatedItems.length > 0 && (
            <Card className="shadow-sm mb-4" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <CardHeader style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0.85rem 1rem" }}>
                <h6 className="mb-0 font-weight-bold">Added to inventory ({successResult.updatedItems.length})</h6>
              </CardHeader>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <table className="table result-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Batch</th>
                        <th>Expiry</th>
                        <th style={{ textAlign: "right" }}>Qty added</th>
                        <th>Inventory ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {successResult.updatedItems.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 500 }}>
                            {item.medicineMaster
                              ? formatMedicineLabel(item.medicineMaster)
                              : [item.medicineName, item.medicineStrength || item.strength].filter(Boolean).join(" ")}
                          </td>
                          <td>{item.batchNumber || "\u2014"}</td>
                          <td>{item.expiryDate || "\u2014"}</td>
                          <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                            <strong>{item.quantity}</strong>{" "}
                            <span className="text-muted">{item.baseUnit || "units"}</span>
                          </td>
                          <td className="text-muted">{item.pharmacyId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {(successResult.requisitions || []).length > 0 && (
            <Card className="shadow-sm mb-4" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <CardHeader style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0.85rem 1rem" }}>
                <h6 className="mb-0 font-weight-bold">Requisitions raised ({successResult.requisitions.length})</h6>
                <small className="text-muted">These medicines are not in the master yet. They stay missing on this bill and can be retried from Bill Upload History.</small>
              </CardHeader>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <table className="table result-table">
                    <thead>
                      <tr>
                        <th>Requisition ID</th>
                        <th>Medicine</th>
                        <th style={{ textAlign: "right" }}>Qty on bill</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {successResult.requisitions.map((r, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{r.requisitionNumber}</td>
                          <td style={{ fontWeight: 500 }}>{[r.name, r.strength].filter(Boolean).join(" ")}</td>
                          <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.quantity || "\u2014"}</td>
                          <td className="text-muted">{r.reused ? "Pending (already raised)" : "Pending"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {successResult.errors?.length > 0 && (
            <Card className="shadow-sm mb-4" style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <CardHeader style={{ background: "#f8f9fb", borderBottom: "1px solid #e5e7eb", padding: "0.85rem 1rem" }}>
                <h6 className="mb-0 font-weight-bold">Failed ({successResult.errors.length})</h6>
              </CardHeader>
              <CardBody>
                <ul className="mb-3 ps-3" style={{ fontSize: "0.875rem", color: "#b91c1c" }}>
                  {successResult.errors.map((err, idx) => (
                    <li key={idx} className="mb-1">{err.error}</li>
                  ))}
                </ul>
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => downloadFailedMedicinesExcel(successResult.errors)}
                  outline
                >
                  Download failed medicines (Excel)
                </Button>
              </CardBody>
            </Card>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button color="primary" onClick={handleStartNew}>
              Process Another Bill
            </Button>
          </div>
        </div>
      </CardBody>
    );
  }
};

export default OCRBillImport;
