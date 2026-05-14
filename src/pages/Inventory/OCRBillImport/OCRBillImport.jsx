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
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
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

const OCRBillImport = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const location = useLocation();
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

  // Track debounce timers for refetching matching medicines
  const debounceTimersRef = useRef({});

  // Get available centers for dropdown
  const centerOptions = useMemo(() => {
    if (!user?.userCenters) return [];
    return user.userCenters.map((center) => ({
      value: center._id || center.id,
      label: center.title || "Unknown Center",
    }));
  }, [user?.userCenters]);

  // Set default center on mount
  useMemo(() => {
    if (!selectedCenter && centerOptions.length > 0) {
      setSelectedCenter(centerOptions[0]);
    }
  }, [centerOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const centerId = selectedCenter?.value;

  // Handle resume/retry from BillUploadDashboard navigation
  useEffect(() => {
    if (location.state?.resumeBillId) {
      handleResumeBill(location.state.resumeBillId);
    } else if (location.state?.retryBillId) {
      handleRetryMissing(location.state.retryBillId);
    }
  }, [location.state?.resumeBillId, location.state?.retryBillId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      width: "200px",
      cell: (row) => (
        <div>
          <small><strong>{row.name}</strong></small><br />
          <small className="text-muted">{row.strength}</small>
        </div>
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
          <small className="text-muted d-block mt-1">{row.purchaseUnit}</small>
        </div>
      ),
    },
    {
      name: <div>In Base Unit</div>,
      width: "130px",
      cell: (row) => (
        <div>
          <small className="text-muted d-block">
            = {row.qty === 0 ? "—" : `${row.baseUnitQtyDisplay} ${row.baseUnit}`}
          </small>
        </div>
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
      width: "200px",
      cell: (row) => (
        <div>
          <small><strong>{row.name}</strong></small><br />
          <small className="text-muted">{row.strength}</small>
        </div>
      ),
    },
    {
      name: <div>Med ID</div>,
      width: "100px",
      cell: (row) => <small className="text-muted">{row.medId}</small>,
    },
    {
      name: <div>Pharmacy ID</div>,
      width: "120px",
      cell: (row) => <small className="text-muted" title={row.pharmId || "N/A"}>{row.pharmId || "N/A"}</small>,
    },
    {
      name: <div>Batch</div>,
      width: "100px",
      cell: (row) => <small>{row.batchNumber}</small>,
    },
    {
      name: <div>Expiry</div>,
      width: "110px",
      cell: (row) => <small>{row.expiryDate}</small>,
    },
    {
      name: <div>Stock</div>,
      width: "90px",
      cell: (row) => <Badge color="info" className="px-2" style={{ fontSize: "0.75rem" }}>{row.centerStock || 0} {row.baseUnit}</Badge>,
    },
    {
      name: <div>Add Qty*</div>,
      width: "100px",
      cell: (row) => (
        <div>
          <Input type="number" bsSize="sm" value={row.quantity || ""} onChange={(e) => handleFormChange(row.idx, "quantity", e.target.value)} placeholder="0" style={{ fontSize: "0.85rem", width: "100%" }} />
          <small className="text-muted d-block mt-1">{row.purchaseUnit}</small>
        </div>
      ),
    },
    {
      name: <div>In Base Unit</div>,
      width: "130px",
      cell: (row) => (
        <div>
          <small className="text-muted d-block">
            = {row.qty === 0 ? "—" : `${row.baseUnitQtyDisplay} ${row.baseUnit}`}
          </small>
        </div>
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

  // Prepare data for new medicines table
  const newMedicinesData = useMemo(() => {
    if (!newMedicines || newMedicines.length === 0) return [];

    // Calculate total bill price for all medicines (for discount distribution)
    let totalBillPrice = 0;
    newMedicines.forEach(({ idx, result }) => {
      const formData = medicineFormData[idx];
      const price = parseFloat(formData?.purchasePrice) || 0;
      const qty = parseFloat(formData?.quantity) || 0;
      totalBillPrice += price * qty;
    });

    return newMedicines.map(({ idx, result }) => {
      const { selectedMedicine, extractedData } = result;
      const formData = medicineFormData[idx];
      const qty = parseFloat(formData?.quantity) || 0;
      const purchasePrice = parseFloat(formData?.purchasePrice) || 0;
      const medicineTotalPrice = purchasePrice * qty;

      // Calculate discount for this medicine (proportional to its share of total bill)
      const medicineDiscount = totalBillPrice > 0
        ? (medicineTotalPrice / totalBillPrice) * billDiscountAmount
        : 0;
      const discountedPrice = Math.round((purchasePrice - (medicineDiscount / qty)) * 100) / 100;

      const purchaseUnit = selectedMedicine?.purchaseUnit || selectedMedicine?.baseUnit || "unit";
      const conv = selectedMedicine?.conversion || { purchaseQuantity: 1, baseQuantity: 1 };
      const factor = (conv.baseQuantity || 1) / (conv.purchaseQuantity || 1);
      const baseUnitQty = qty * factor;
      const baseUnitQtyDisplay = qty === 0 ? "—" : baseUnitQty.toFixed(2);

      return {
        idx,
        medId: selectedMedicine?._id?.slice(-6) || selectedMedicine?.id,
        name: selectedMedicine?.name,
        strength: selectedMedicine?.strength,
        form: selectedMedicine?.form,
        baseUnit: selectedMedicine?.baseUnit,
        batchNumber: formData?.batchNumber || "",
        expiryDate: formData?.expiryDate || "",
        quantity: formData?.quantity || "",
        qty,
        purchaseUnit,
        baseUnitQtyDisplay,
        purchasePrice: purchasePrice,
        discountedPrice: discountedPrice,
        medicineDiscount: Math.round(medicineDiscount * 100) / 100,
        mrp: formData?.mrp || "",
      };
    });
  }, [newMedicines, medicineFormData, billDiscountAmount]);

  // Prepare data for existing medicines table
  const existingMedicinesData = useMemo(() => {
    if (!existingMedicines || existingMedicines.length === 0) return [];

    // Calculate total bill price for all medicines (for discount distribution)
    let totalBillPrice = 0;
    existingMedicines.forEach(({ idx, result }) => {
      const formData = medicineFormData[idx];
      const price = parseFloat(formData?.purchasePrice) || 0;
      const qty = parseFloat(formData?.quantity) || 0;
      totalBillPrice += price * qty;
    });

    return existingMedicines.map(({ idx, result }) => {
      const { selectedMedicine, extractedData, pharmacyStatus } = result;
      const formData = medicineFormData[idx];
      const qty = parseFloat(formData?.quantity) || 0;
      const purchasePrice = parseFloat(formData?.purchasePrice) || 0;
      const medicineTotalPrice = purchasePrice * qty;

      // Calculate discount for this medicine (proportional to its share of total bill)
      const medicineDiscount = totalBillPrice > 0
        ? (medicineTotalPrice / totalBillPrice) * billDiscountAmount
        : 0;
      const discountedPrice = Math.round((purchasePrice - (medicineDiscount / qty)) * 100) / 100;

      const purchaseUnit = selectedMedicine?.purchaseUnit || selectedMedicine?.baseUnit || "unit";
      const conv = selectedMedicine?.conversion || { purchaseQuantity: 1, baseQuantity: 1 };
      const factor = (conv.baseQuantity || 1) / (conv.purchaseQuantity || 1);
      const baseUnitQty = qty * factor;
      const baseUnitQtyDisplay = qty === 0 ? "—" : baseUnitQty.toFixed(2);
      return {
        idx,
        medId: selectedMedicine?.id,
        pharmId: pharmacyStatus?.data?.pharmacyId?.slice(-6) || "N/A",
        name: selectedMedicine?.name,
        strength: selectedMedicine?.strength,
        batchNumber: extractedData.batchNumber,
        expiryDate: extractedData.expiryDate,
        centerStock: pharmacyStatus?.data?.centerStock || 0,
        baseUnit: selectedMedicine?.baseUnit,
        quantity: formData?.quantity || "",
        qty,
        purchaseUnit,
        baseUnitQtyDisplay,
        purchasePrice: purchasePrice,
        discountedPrice: discountedPrice,
        medicineDiscount: Math.round(medicineDiscount * 100) / 100,
        mrp: formData?.mrp || "",
      };
    });
  }, [existingMedicines, medicineFormData, billDiscountAmount]);

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

      worksheet.columns = [
        { header: "Medicine Name", key: "name", width: 30 },
        { header: "Strength", key: "strength", width: 20 },
        { header: "Form", key: "form", width: 15 },
        { header: "Base Unit", key: "baseUnit", width: 15 },
        { header: "Category", key: "category", width: 20 },
        { header: "Storage Type", key: "storage", width: 20 },
        { header: "OCR Confidence", key: "confidence", width: 15 },
        { header: "Reason", key: "reason", width: 40 },
        { header: "Source Bill URL", key: "billUrl", width: 50 },
      ];

      medicines.forEach((med) => {
        worksheet.addRow({
          name: med.extractedName || med.name,
          strength: med.extractedStrength || med.strength || "N/A",
          form: "",
          baseUnit: "",
          category: "",
          storage: "",
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
  const fetchMatchingMedicines = async (extractedName, extractedStrength) => {
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
        extractedStrength: extractedStrength?.trim() || "",
      });

      // Race between API call and timeout
      const result = await Promise.race([apiCall, timeoutPromise]);
      console.log(`✅ API Response received for "${extractedName}":`, result);

      // Axios interceptor already unwraps response.data, so result is { success: true, data: [...] }
      // Extract the medicines array from the response
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
      setExtractedMedicines(result.extractedMedicines || []);
      setErrorMedicines(result.errorMedicines || []);

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

      // Recalculate bill total if quantity or unitPrice changed
      if (field === "quantity" || field === "unitPrice") {
        let newTotal = 0;
        Object.values(updated).forEach((med) => {
          const qty = parseFloat(med.quantity) || 0;
          const price = parseFloat(med.unitPrice) || 0;
          newTotal += qty * price;
        });
        setBillTotal(newTotal);
      }

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

  // Handle error medicines data changes (for retry/search)
  const handleErrorMedicineDataChange = (idx, field, value) => {
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
            const matches = await fetchMatchingMedicines(medicineName, strength);
            setErrorMatchingMedicinesMap((prevMap) => ({
              ...prevMap,
              [idx]: matches,
            }));
          }
        }, 500);
      }

      return updated;
    });
  };

  // Convert error medicine to extracted medicine when matched
  const handleAddErrorMedicineToExtracted = (errorIdx) => {
    const errorMed = errorMedicinesFormData[errorIdx] || errorMedicines[errorIdx];
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

    // Add to extracted medicines
    const newIdx = extractedMedicines.length;
    setExtractedMedicines([...extractedMedicines, {
      medicineId: selectedId,
      ocrExtracted: {
        name: errorMed.extractedName,
        strength: errorMed.extractedStrength,
        batchNumber: errorMedicinesFormData[errorIdx]?.batchNumber || null,
        quantity: errorMedicinesFormData[errorIdx]?.quantity || 0,
        unitPrice: errorMedicinesFormData[errorIdx]?.unitPrice || null,
        totalPrice: errorMedicinesFormData[errorIdx]?.totalPrice || null,
        expiryDate: errorMedicinesFormData[errorIdx]?.expiryDate || null,
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
        medicineName: selectedMed.name,
        strength: selectedMed.strength || "",
        quantity: errorMedicinesFormData[errorIdx]?.quantity || 0,
        batchNumber: errorMedicinesFormData[errorIdx]?.batchNumber || "",
        expiryDate: errorMedicinesFormData[errorIdx]?.expiryDate || "",
        unitPrice: errorMedicinesFormData[errorIdx]?.unitPrice || 0,
        totalPrice: errorMedicinesFormData[errorIdx]?.totalPrice || 0,
      },
    }));

    setSelectedMedicineIds(prev => ({
      ...prev,
      [newIdx]: selectedId,
    }));

    setMatchingMedicinesMap(prev => ({
      ...prev,
      [newIdx]: errorMatchingMedicinesMap[errorIdx],
    }));

    // Remove from error medicines
    const updatedErrors = errorMedicines.filter((_, i) => i !== errorIdx);
    setErrorMedicines(updatedErrors);

    // Clean up error medicine states
    const updatedFormData = { ...errorMedicinesFormData };
    delete updatedFormData[errorIdx];
    setErrorMedicinesFormData(updatedFormData);

    const updatedSelected = { ...selectedErrorMedicineIds };
    delete updatedSelected[errorIdx];
    setSelectedErrorMedicineIds(updatedSelected);

    toast.success("Medicine moved to extracted list!");
  };

  const handleProceedFromExtraction = async () => {
    // Get checked medicines
    let indicesToProcess = Object.keys(checkedMedicines).filter(idx => checkedMedicines[idx]);

    if (indicesToProcess.length === 0) {
      setError("Please select at least one medicine to process");
      toast.warning("Select medicines using checkboxes");
      return;
    }

    setConfirmationLoading(true);
    setError(null);

    try {
      // Step 1: Fetch matching medicines for each checked medicine
      const matchingMap = {};
      for (let idx of indicesToProcess) {
        const extractedData = extractedFormData[idx];
        const matches = await fetchMatchingMedicines(
          extractedData.medicineName,
          extractedData.strength
        );
        matchingMap[idx] = matches || [];
      }
      setMatchingMedicinesMap(matchingMap);

      // Step 2: Auto-proceed to pharmacy check with selected medicines
      await handleProceedToPharmacyCheckAuto(indicesToProcess, matchingMap);
    } catch (err) {
      console.error("Error in extraction flow:", err);
      setError("Failed to process medicines");
      toast.error("Error processing medicines");
    } finally {
      setConfirmationLoading(false);
    }
  };

  const handleProceedToPharmacyCheckAuto = async (indicesToProcess, matchingMap) => {
    try {
      const results = {};
      const unselectedMedicines = [];

      for (const idx of indicesToProcess) {
        const idx_num = parseInt(idx);
        const selectedMedicineId = selectedMedicineIds[idx_num];
        const medicine = extractedMedicines[idx_num];

        // Check if user selected a medicine from dropdown
        if (!selectedMedicineId) {
          // User didn't select any medicine - add to unselected/failed list
          unselectedMedicines.push({
            extractedName: medicine.ocrExtracted?.name,
            extractedStrength: medicine.ocrExtracted?.strength,
            quantity: medicine.ocrExtracted?.quantity || 0,
            batchNumber: medicine.ocrExtracted?.batchNumber || null,
            expiryDate: medicine.ocrExtracted?.expiryDate || null,
            unitPrice: medicine.ocrExtracted?.unitPrice || null,
            totalPrice: medicine.ocrExtracted?.totalPrice || null,
            reason: "No medicine selected from matching list during review step",
            action: "Please select a matched medicine from the dropdown and try again",
          });
          continue;
        }

        // Find the medicine that user selected from dropdown
        let selectedMedicine = matchingMap[idx_num]?.find(
          m => (m._id || m.id) === selectedMedicineId
        );

        if (selectedMedicine) {
          const medicineId = selectedMedicine._id || selectedMedicine.id;

          // Calculate discounted purchase price (rounded to 2 decimal places)
          const unitPrice = parseFloat(medicine.ocrExtracted?.unitPrice) || 0;
          const discountedPrice = Math.round((unitPrice * (1 - (billDiscountPercentage / 100))) * 100) / 100;

          try {
            const checkResult = await checkExistingMedicineInPharmacy({
              medicineId: medicineId,
              centerId: centerId,
              batchNumber: medicine.ocrExtracted?.batchNumber,
              expiryDate: medicine.ocrExtracted?.expiryDate,
              purchasePrice: discountedPrice,
            });

            results[idx_num] = {
              medicineId: medicineId,
              selectedMedicine,
              extractedData: medicine.ocrExtracted,
              pharmacyStatus: { exists: checkResult.exists, data: checkResult.data },
            };
          } catch (err) {
            console.error(`Error checking medicine at index ${idx_num}:`, err);
            // Continue with other medicines even if one fails
          }
        }
      }

      // Add unselected medicines to error list
      if (unselectedMedicines.length > 0) {
        setErrorMedicines([...errorMedicines, ...unselectedMedicines]);

        // Update database with unselected medicines
        try {
          await updateBillErrors({
            billImportId,
            errors: unselectedMedicines,
          });
        } catch (updateErr) {
          console.error("Failed to update bill errors in database:", updateErr);
        }

        toast.warning(`${unselectedMedicines.length} medicine(s) not selected - moved to missing list`);
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

    // Use discount percentage if available, otherwise calculate from amount
    const discountPercentageToUse = billDiscountPercentage > 0
      ? billDiscountPercentage / 100
      : (billDiscountAmount > 0 && billGrossAmount > 0 ? billDiscountAmount / billGrossAmount : 0);

    console.log("\n💰 INITIALIZING MEDICINE FORM DATA WITH DISCOUNT:");
    console.log(`  Bill Discount Percentage: ${billDiscountPercentage}%`);
    console.log(`  Bill Discount Amount: ₹${billDiscountAmount}`);
    console.log(`  Bill Gross Amount: ₹${billGrossAmount}`);
    console.log(`  Effective Discount Rate: ${(discountPercentageToUse * 100).toFixed(2)}%`);

    Object.entries(results).forEach(([idx, result]) => {
      const { extractedData } = result;

      // Use extracted unit price as the MRP (this is the price from the bill)
      const basePrice = extractedData.unitPrice || 0;

      // Calculate purchase price by applying discount percentage to MRP
      const discountAmount = basePrice * discountPercentageToUse;
      const purchasePriceWithDiscount = basePrice > 0
        ? basePrice - discountAmount
        : 0;

      console.log(`\n  [{idx}] ${extractedData.medicineName} ${extractedData.strength || ""}`);
      console.log(`      MRP: ₹${basePrice.toFixed(2)}`);
      console.log(`      Discount (${(discountPercentageToUse * 100).toFixed(2)}%): - ₹${discountAmount.toFixed(2)}`);
      console.log(`      Purchase Price: ₹${purchasePriceWithDiscount.toFixed(2)}`);

      initialData[idx] = {
        medicineName: extractedData.medicineName,
        strength: extractedData.strength,
        quantity: extractedData.quantity,
        batchNumber: extractedData.batchNumber,
        expiryDate: extractedData.expiryDate,
        unitPrice: extractedData.unitPrice,
        totalCost: extractedData.totalCost,
        purchasePrice: purchasePriceWithDiscount > 0 ? Math.round(purchasePriceWithDiscount * 100) / 100 : basePrice,
        mrp: basePrice > 0 ? Math.round(basePrice * 100) / 100 : "",
        salePrice: "",
        company: billSupplier,
        manufacturer: "",
        rackNumber: "",
      };
    });
    console.log("\n");
    setMedicineFormData(initialData);
  };

  const handleFormChange = (idx, field, value) => {
    setMedicineFormData((prev) => {
      const updated = {
        ...prev,
        [idx]: {
          ...prev[idx],
          [field]: value,
        },
      };

      return updated;
    });
  };

  // ============================================
  // STEP 4: Summary and Confirmation
  // ============================================

  const validatePharmacyCheckData = () => {
    for (const [idx, data] of Object.entries(medicineFormData)) {
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
    setLoading(true);
    setError(null);

    try {
      // Build medicine confirmations from selected medicines
      const medicineConfirmations = [];

      Object.entries(pharmacyCheckResults).forEach(([idx, result]) => {
        const formData = medicineFormData[idx];
        medicineConfirmations.push({
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

      const response = await confirmOCRMedicines({
        billImportId,
        medicineConfirmations,
      });

      console.log("Confirm response:", response);

      const result = response.data || response;

      if (!result || !result.billImportId) {
        console.error("Invalid confirm response:", result);
        throw new Error("Invalid response: missing billImportId");
      }

      setSuccessResult(result);
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
      setErrorMedicines(billData.errors || []);

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

      // Transform medicines from flat structure to nested structure expected by component
      const transformedMedicines = (billData.extractedData?.medicines || []).map((med) => ({
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

      // Rebuild extractedFormData
      const initialData = {};
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
      });
      setExtractedFormData(initialData);

      // Fetch matching medicines
      const medicinesCount = billData.extractedData?.medicines?.length || 0;
      console.log(`  🔄 Fetching matches for ${medicinesCount} medicines...`);
      const matchingMap = {};

      for (let idx = 0; idx < medicinesCount; idx++) {
        const med = billData.extractedData?.medicines[idx];
        console.log(`    [${idx}] Fetching matches for "${med.name}" strength="${med.strength || ""}"`);
        try {
          const matches = await fetchMatchingMedicines(med.name, med.strength);
          console.log(`    [${idx}] Got ${matches ? matches.length : 0} matches`);
          matchingMap[idx] = matches || [];
        } catch (err) {
          console.error(`    [${idx}] ❌ Error fetching matches:`, err);
          matchingMap[idx] = [];
        }
      }
      console.log("  ✅ All medicines processed. Final matchingMap:", matchingMap);
      setMatchingMedicinesMap(matchingMap);
      setIsResuming(false);

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

      // Restore bill level information from extracted metadata
      const meta = billData.extractedData?.billMetadata || {};
      setBillSupplier(meta.supplier || "");
      setBillNumber(meta.billNumber || "");
      setBillGrossAmount(meta.grossAmount || 0);
      setBillDiscountPercentage(meta.discountPercentage || 0);
      setBillDiscountAmount(meta.discountAmount || 0);
      setBillTotal(meta.totalAmount || 0);

      // Filter out medicines that are already processed (added to inventory)
      const processedMedicineNames = (billData.processedItems || []).map(item => {
        // Get medicine name from the pharmacy record via billData
        return item.pharmacyId?.medicineName || "";
      }).filter(Boolean);

      let errorsToRetry = billData.errors || errorMedicines;

      // Remove medicines that are already processed
      const alreadyProcessed = errorsToRetry.filter(e =>
        processedMedicineNames.includes(e.extractedName)
      );

      errorsToRetry = errorsToRetry.filter(e =>
        !processedMedicineNames.includes(e.extractedName)
      );

      if (alreadyProcessed.length > 0) {
        console.log(`⏭️ Skipping ${alreadyProcessed.length} medicines already added to inventory:`, alreadyProcessed.map(m => m.extractedName));
        toast.info(`${alreadyProcessed.length} medicine(s) already added to inventory - skipping retry`);
      }

      if (errorsToRetry.length === 0) {
        setError("No medicines to retry. All errors are either already processed or no longer missing.");
        setIsResuming(false);
        return;
      }

      let newMatches = [];
      const newMatchingMap = { ...matchingMedicinesMap };

      // Re-search for each missing medicine
      console.log(`🔄 Retrying ${errorsToRetry.length} missing medicines...`);
      for (const error of errorsToRetry) {
        try {
          const matches = await fetchMatchingMedicines(error.extractedName, error.extractedStrength);
          if (matches && matches.length > 0) {
            // Found matches! Add to extracted medicines
            const nextIdx = Object.keys(matchingMedicinesMap).length + newMatches.length;
            newMatchingMap[nextIdx] = matches;
            newMatches.push({
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
        setError("No new matches found. Check if medicines have been added to master database.");
        setIsResuming(false);
        return;
      }

      // Build new extracted medicine entries from retried errors
      const updatedExtractedMedicines = [...extractedMedicines];
      const newFormDataEntries = { ...extractedFormData };
      const newCheckedMedicines = { ...checkedMedicines };
      const newSelectedMedicineIds = { ...selectedMedicineIds };

      let startIdx = extractedMedicines.length;

      for (const newMatch of newMatches) {
        // Find the original medicine from OCR extracted data
        // Try exact match first, then fuzzy match
        let originalMedicine = (billData.extractedData?.medicines || []).find(
          m => (m.name || "").toLowerCase().trim() === (newMatch.name || "").toLowerCase().trim()
            && (m.strength || "").toLowerCase().trim() === (newMatch.strength || "").toLowerCase().trim()
        );

        // Fallback: try matching just by name if strength doesn't match
        if (!originalMedicine) {
          originalMedicine = (billData.extractedData?.medicines || []).find(
            m => (m.name || "").toLowerCase().trim() === (newMatch.name || "").toLowerCase().trim()
          );
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
          updatedExtractedMedicines.push({
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

          // Mark as checked and auto-select first matching medicine if available
          newCheckedMedicines[startIdx] = false;
          if (newMatch.matches && newMatch.matches.length > 0) {
            newSelectedMedicineIds[startIdx] = newMatch.matches[0]._id;
          }

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
                maxWidth: "500px",
                textAlign: "center",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 15px 50px rgba(0,0,0,0.4)",
                backgroundColor: "#ffffff",
              }}
            >
              <CardBody className="p-5">
                <div className="mb-4">
                  <Spinner
                    color="primary"
                    style={{
                      width: "70px",
                      height: "70px",
                      marginBottom: "20px",
                    }}
                  />
                </div>

                {processingStatus === "uploading" && (
                  <>
                    <h4 className="font-weight-bold mb-3" style={{ color: "#333" }}>
                      📤 Uploading Bill
                    </h4>
                    <p className="text-muted" style={{ fontSize: "16px" }}>
                      Preparing your document for processing...
                    </p>
                  </>
                )}

                {processingStatus === "extracting" && (
                  <>
                    <div className="text-center mx-auto py-5" style={{ maxWidth: "420px" }}>

                      <h4 className="fw-semibold text-dark mb-3">
                        Extracting Medicine Details
                      </h4>
                      <p className="text-muted small mb-2">
                        This may take a minute or two
                      </p>

                      <small className="text-danger">
                        Please do not close or refresh the page
                      </small>
                    </div>
                  </>
                )}

                {processingStatus === "matching" && (
                  <>
                    <h4 className="font-weight-bold mb-3" style={{ color: "#333" }}>
                      Matching Medicines
                    </h4>
                    <p className="text-muted" style={{ fontSize: "16px" }}>
                      Finding matching medicines from your master database...
                    </p>
                  </>
                )}
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
                          disabled
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
                          disabled
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
                          type="text"
                          size="sm"
                          value={billGrossAmount > 0 ? `₹ ${billGrossAmount.toFixed(2)}` : "₹ 0.00"}
                          disabled
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>Discount %</strong>
                        </Label>
                        <Input
                          type="text"
                          size="sm"
                          value={billDiscountPercentage > 0 ? `${billDiscountPercentage.toFixed(2)}%` : "0%"}
                          disabled
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
                          type="text"
                          size="sm"
                          value={billDiscountAmount > 0 ? `— ₹ ${billDiscountAmount.toFixed(2)}` : "— ₹ 0.00"}
                          disabled
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup className="mb-2">
                        <Label className="small mb-1">
                          <strong>= Final Amount (After Discount)</strong>
                        </Label>
                        <Input
                          type="text"
                          size="sm"
                          value={billFinalAmount > 0 ? `= ₹ ${billFinalAmount.toFixed(2)}` : `= ₹ ${billGrossAmount.toFixed(2)}`}
                          disabled
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
                          type="text"
                          size="sm"
                          value={`= ₹ ${billTotal.toFixed(2)}`}
                          disabled
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          )}

          {errorMedicines.length > 0 && extractedMedicines.length > 0 && (
            <Card className="border-warning mb-4">
              <CardHeader className="bg-light border-warning">
                <Row className="align-items-center">
                  <Col>
                    <h6 className="mb-0 text-warning font-weight-bold">⚠️ Missing Medicines ({errorMedicines.length})</h6>
                    <small className="text-muted">Edit details • Move to extracted list to search & match</small>
                  </Col>
                  <Col xs="auto">
                    <Button
                      color="warning"
                      size="sm"
                      onClick={() => downloadMissingFieldsCSV(errorMedicines)}
                      outline
                    >
                      📥 Download Excel
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="p-0">
                <style>{`
                  .error-medicine-table td {
                    padding: 0.35rem 0.5rem !important;
                    vertical-align: middle;
                    height: 38px;
                  }
                  .error-medicine-table input {
                    font-size: 0.85rem;
                    padding: 0.25rem 0.4rem !important;
                    border: 1px solid #e0e0e0 !important;
                    border-radius: 3px;
                  }
                  .error-medicine-table input:focus {
                    border-color: #ffc107 !important;
                    background-color: #fffbf0;
                    box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.1) !important;
                  }
                  .error-medicine-table tbody tr:hover {
                    background-color: #fffbf0;
                  }
                  .error-medicine-table tbody tr:nth-child(even) {
                    background-color: #fffdf5;
                  }
                  .error-medicine-table th {
                    font-size: 0.85rem;
                    padding: 0.5rem 0.5rem !important;
                    font-weight: 600;
                    border-bottom: 2px solid #dee2e6;
                  }
                `}</style>
                <div className="table-responsive">
                  <table className="table table-sm mb-0 error-medicine-table">
                    <thead className="bg-light">
                      <tr>
                        <th style={{ width: "18%" }}>Medicine Name</th>
                        <th style={{ width: "12%" }}>Strength</th>
                        <th style={{ width: "10%" }}>Qty</th>
                        <th style={{ width: "15%" }}>Batch</th>
                        <th style={{ width: "15%" }}>Expiry</th>
                        <th style={{ width: "12%" }}>Unit Price</th>
                        <th style={{ width: "12%" }}>Total</th>
                        <th style={{ width: "6%" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorMedicines.map((med, idx) => {
                        // Initialize form data for this error medicine on first render
                        if (!errorMedicinesFormData[idx]) {
                          setErrorMedicinesFormData(prev => ({
                            ...prev,
                            [idx]: {
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
                          <tr key={idx}>
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
                              <Button
                                color="link"
                                size="sm"
                                onClick={() => {
                                  const updated = errorMedicines.filter((_, i) => i !== idx);
                                  setErrorMedicines(updated);
                                  const updatedFormData = { ...errorMedicinesFormData };
                                  delete updatedFormData[idx];
                                  setErrorMedicinesFormData(updatedFormData);
                                }}
                                title="Remove"
                              >
                                ✕
                              </Button>
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

          {extractedMedicines.length === 0 && (
            <div className="text-center py-5">
              <Alert color="warning" className="mb-4">
                <h5 className="font-weight-bold">No Medicines Extracted</h5>
                <p className="mb-0">
                  No medicines were found in the bill. Please try uploading a different bill.
                </p>
              </Alert>

              {errorMedicines.length > 0 && (
                <Card className="border-warning mt-4">
                  <CardHeader className="bg-light border-warning">
                    <Row className="align-items-center">
                      <Col>
                        <h6 className="mb-0 text-warning font-weight-bold">⚠️ Missing Medicines Found ({errorMedicines.length})</h6>
                        <small className="text-muted">Edit details • Move to extracted list to search & match</small>
                      </Col>
                      <Col xs="auto">
                        <Button
                          color="warning"
                          size="sm"
                          onClick={() => downloadMissingFieldsCSV(errorMedicines)}
                          outline
                        >
                          📥 Download Excel
                        </Button>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody className="p-0">
                    <style>{`
                      .error-medicine-table-no-extracted td {
                        padding: 0.35rem 0.5rem !important;
                        vertical-align: middle;
                        height: 38px;
                      }
                      .error-medicine-table-no-extracted input {
                        font-size: 0.85rem;
                        padding: 0.25rem 0.4rem !important;
                        border: 1px solid #e0e0e0 !important;
                        border-radius: 3px;
                      }
                      .error-medicine-table-no-extracted input:focus {
                        border-color: #ffc107 !important;
                        background-color: #fffbf0;
                        box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.1) !important;
                      }
                      .error-medicine-table-no-extracted tbody tr:hover {
                        background-color: #fffbf0;
                      }
                      .error-medicine-table-no-extracted tbody tr:nth-child(even) {
                        background-color: #fffdf5;
                      }
                      .error-medicine-table-no-extracted th {
                        font-size: 0.85rem;
                        padding: 0.5rem 0.5rem !important;
                        font-weight: 600;
                        border-bottom: 2px solid #dee2e6;
                      }
                    `}</style>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0 error-medicine-table-no-extracted">
                        <thead className="bg-light">
                          <tr>
                            <th style={{ width: "15%" }}>Medicine Name</th>
                            <th style={{ width: "10%" }}>Strength</th>
                            <th style={{ width: "8%" }}>Qty</th>
                            <th style={{ width: "12%" }}>Batch</th>
                            <th style={{ width: "12%" }}>Expiry</th>
                            <th style={{ width: "9%" }}>Unit Price</th>
                            <th style={{ width: "9%" }}>Total</th>
                            <th style={{ width: "20%" }}>Search & Match</th>
                            <th style={{ width: "5%" }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {errorMedicines.map((med, idx) => {
                            if (!errorMedicinesFormData[idx]) {
                              setErrorMedicinesFormData(prev => ({
                                ...prev,
                                [idx]: {
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

                            if (!errorMatchingMedicinesMap[idx] && med.extractedName) {
                              if (debounceTimersRef.current[`error-init-${idx}`]) {
                                clearTimeout(debounceTimersRef.current[`error-init-${idx}`]);
                              }
                              debounceTimersRef.current[`error-init-${idx}`] = setTimeout(async () => {
                                const matches = await fetchMatchingMedicines(med.extractedName, med.extractedStrength);
                                setErrorMatchingMedicinesMap(prevMap => ({
                                  ...prevMap,
                                  [idx]: matches,
                                }));
                              }, 300);
                            }

                            return (
                              <tr key={idx}>
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
                                <td style={{ minWidth: "280px" }}>
                                  {errorMatchingMedicinesMap[idx]?.length > 0 ? (
                                    <Row className="g-1">
                                      <Col xs="9">
                                        <Select
                                          options={errorMatchingMedicinesMap[idx]?.map((m) => ({
                                            value: m._id,
                                            label: `${m.id || m._id} | ${m.name} ${m.strength || ""}`.trim(),
                                            data: m,
                                          })) || []}
                                          value={
                                            selectedErrorMedicineIds[idx]
                                              ? {
                                                value: selectedErrorMedicineIds[idx],
                                                label: errorMatchingMedicinesMap[idx]?.find(
                                                  (m) => m._id === selectedErrorMedicineIds[idx]
                                                )?.id || selectedErrorMedicineIds[idx],
                                              }
                                              : null
                                          }
                                          onChange={(selected) => {
                                            if (selected) {
                                              setSelectedErrorMedicineIds({
                                                ...selectedErrorMedicineIds,
                                                [idx]: selected.value,
                                              });
                                            }
                                          }}
                                          isClearable
                                          isSearchable
                                          placeholder="Select..."
                                          onClearValue={() => {
                                            const updated = { ...selectedErrorMedicineIds };
                                            delete updated[idx];
                                            setSelectedErrorMedicineIds(updated);
                                          }}
                                          menuPortalTarget={document.body}
                                          menuPosition="fixed"
                                          styles={{
                                            control: (base) => ({
                                              ...base,
                                              minHeight: "36px",
                                              fontSize: "0.75rem",
                                              padding: "0 4px",
                                            }),
                                            option: (base, state) => ({
                                              ...base,
                                              fontSize: "0.75rem",
                                              padding: "6px 10px",
                                            }),
                                          }}
                                        />
                                      </Col>
                                      <Col xs="3">
                                        <Button
                                          color="success"
                                          size="sm"
                                          onClick={() => handleAddErrorMedicineToExtracted(idx)}
                                          disabled={!selectedErrorMedicineIds[idx]}
                                          className="w-100"
                                        >
                                          Add ✓
                                        </Button>
                                      </Col>
                                    </Row>
                                  ) : (
                                    <span className="text-muted small">Searching...</span>
                                  )}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <Button
                                    color="link"
                                    size="sm"
                                    onClick={() => {
                                      const updated = errorMedicines.filter((_, i) => i !== idx);
                                      setErrorMedicines(updated);
                                      const updatedFormData = { ...errorMedicinesFormData };
                                      delete updatedFormData[idx];
                                      setErrorMedicinesFormData(updatedFormData);
                                    }}
                                    title="Remove"
                                  >
                                    ✕
                                  </Button>
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
            </div>
          )}

          {/* Quick Summary Bar */}
          {extractedMedicines.length > 0 && (
            <Row className="mb-3 g-2">
              <Col xs="auto">
                <Badge color="secondary" className="px-3 py-2">
                  {extractedMedicines.length} medicines
                </Badge>
              </Col>
              <Col xs="auto">
                <Badge color="secondary" className="px-3 py-2">
                  {billTotal.toFixed(2)} total
                </Badge>
              </Col>
              {errorMedicines.length > 0 && (
                <Col xs="auto">
                  <Badge color="secondary" className="px-3 py-2">
                    {errorMedicines.length} missing from master
                  </Badge>
                </Col>
              )}
            </Row>
          )}

          {/* Compact Table View for Quick Bulk Entry */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-light border-0">
              <h6 className="mb-0 font-weight-bold">
                Extracted Medicines ({extractedMedicines.filter((_, idx) => matchingMedicinesMap[idx]?.length > 0).length} with matches)
              </h6>
              <small className="text-muted">Use Tab to move between cells • Type to edit inline</small>
            </CardHeader>
            <CardBody className="p-0">
              <style>{`
                .medicine-table td {
                  padding: 0.35rem 0.5rem !important;
                  vertical-align: middle;
                  height: 38px;
                }
                .medicine-table input {
                  font-size: 0.85rem;
                  padding: 0.25rem 0.4rem !important;
                  border: 1px solid #e0e0e0 !important;
                  border-radius: 3px;
                }
                .medicine-table input:focus {
                  border-color: #007bff !important;
                  background-color: #f0f7ff;
                  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1) !important;
                }
                .medicine-table tbody tr:hover {
                  background-color: #f9f9f9;
                }
                .medicine-table tbody tr:nth-child(even) {
                  background-color: #f5f5f5;
                }
                .medicine-table th {
                  font-size: 0.85rem;
                  padding: 0.5rem 0.5rem !important;
                  font-weight: 600;
                  border-bottom: 2px solid #dee2e6;
                }
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
                      <th style={{ width: "15%" }}>Matched Medicine</th>
                      <th style={{ width: "15%" }}>Medicine Name</th>
                      <th style={{ width: "10%" }}>Strength</th>
                      <th style={{ width: "8%" }}>Qty</th>
                      <th style={{ width: "12%" }}>Batch</th>
                      <th style={{ width: "12%" }}>Expiry</th>
                      <th style={{ width: "9%" }}>Unit Price</th>
                      <th style={{ width: "9%" }}>Total</th>
                      <th style={{ width: "5%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedMedicines.map((med, idx) => {
                      // Skip medicines with no matches - they should be in errors array
                      if (!matchingMedicinesMap[idx] || matchingMedicinesMap[idx].length === 0) {
                        return null;
                      }
                      return (
                      <tr key={idx}>
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
                                label: `${m.id || m._id} | ${m.name} ${m.strength || ""} | ${m.baseUnit || ""} | ${m.form || ""}`.trim(),
                                data: m,
                              })) || []}
                              value={
                                selectedMedicineIds[idx]
                                  ? {
                                    value: selectedMedicineIds[idx],
                                    label: matchingMedicinesMap[idx]?.find(
                                      (m) => m._id === selectedMedicineIds[idx]
                                    )?.id || selectedMedicineIds[idx],
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
                                }
                              }}
                              isClearable
                              isSearchable
                              placeholder="Select medicine..."
                              onClearValue={() => {
                                const updated = { ...selectedMedicineIds };
                                delete updated[idx];
                                setSelectedMedicineIds(updated);
                              }}
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
                          <Badge color="info" style={{ fontSize: "0.75rem" }} title="Extracted by OCR">
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
              disabled={confirmationLoading || extractedMedicines.length === 0}
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

              {extractedMedicines.map((med, idx) => {
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
                                  label: `${m.name}${m.strength ? ` - ${m.strength}` : ""} (${m.form}, ${m.baseUnit})`,
                                }))}
                                value={
                                  selectedMedicineIds[idx]
                                    ? {
                                      value: selectedMedicineIds[idx],
                                      label:
                                        matchingMedicinesMap[idx]?.find(
                                          (m) => m._id === selectedMedicineIds[idx]
                                        )?.name || "Selected",
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
          <h5 className="mb-1 text-primary text-uppercase font-weight-bold">
            Step 2 of 2: Confirm & Submit
          </h5>
          <small className="text-muted">
            Review pharmacy status • Fill inventory details • Submit
          </small>
        </div>
        <hr className="mb-4 border-secondary" />

        <div className="content-wrapper">
          {/* BILL SUMMARY */}
          <Card className="border-0 shadow-sm mb-4 bg-light">
            <CardHeader className="bg-light border-0 pb-2">
              <h6 className="mb-0 font-weight-bold">📄 Bill Summary</h6>
            </CardHeader>
            <CardBody className="p-3">
              <Row>
                {billNumber && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="text-muted d-block">
                      <strong>Bill #</strong>
                    </small>
                    <div className="font-weight-bold small">{billNumber}</div>
                  </Col>
                )}
                {billSupplier && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="text-muted d-block">
                      <strong>Supplier</strong>
                    </small>
                    <div className="font-weight-bold small">{billSupplier}</div>
                  </Col>
                )}
                {billGrossAmount > 0 && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="text-muted d-block">
                      <strong>Gross</strong>
                    </small>
                    <div className="font-weight-bold small">₹ {billGrossAmount.toFixed(2)}</div>
                  </Col>
                )}
                {billDiscountPercentage > 0 && (
                  <Col md="1" sm="6" className="mb-2">
                    <small className="text-muted d-block">
                      <strong>Disc %</strong>
                    </small>
                    <div className="font-weight-bold small">{billDiscountPercentage.toFixed(0)}%</div>
                  </Col>
                )}
                {billDiscountAmount > 0 && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="text-muted d-block">
                      <strong>Discount</strong>
                    </small>
                    <div className="font-weight-bold small">— ₹ {billDiscountAmount.toFixed(2)}</div>
                  </Col>
                )}
                {billFinalAmount > 0 && (
                  <Col md="2" sm="6" className="mb-2">
                    <small className="text-muted d-block">
                      <strong>After Disc</strong>
                    </small>
                    <div className="font-weight-bold text-info small">₹ {billFinalAmount.toFixed(2)}</div>
                  </Col>
                )}
                <Col md={billGrossAmount > 0 ? "2" : "3"} sm="6" className="mb-2">
                  <small className="text-muted d-block">
                    <strong>Total</strong>
                  </small>
                  <div className="font-weight-bold text-success small">₹ {billTotal.toFixed(2)}</div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <style>{`
            .react-data-table-component input {
              font-size: 0.85rem;
              padding: 0.25rem 0.4rem !important;
              border: 1px solid #e0e0e0 !important;
              border-radius: 3px;
              min-width: 80px;
            }
            .react-data-table-component input:focus {
              border-color: #007bff !important;
              background-color: #f0f7ff;
              box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1) !important;
            }
          `}</style>

          {/* SECTION 1: NEW MEDICINES TO ADD */}
          {newMedicines.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h6 className="mb-3 text-dark font-weight-bold">📝 New Medicines ({newMedicines.length})</h6>
              <Card className="border-0 shadow-sm">
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
                      table: { style: { fontSize: "0.85rem", minWidth: "1100px" } },
                      headRow: {
                        style: {
                          backgroundColor: "#f8f9fa",
                          fontWeight: 600,
                          padding: "8px 4px",
                          borderBottom: "2px solid #dee2e6",
                          fontSize: "0.8rem"
                        }
                      },
                      rows: {
                        style: {
                          minHeight: "40px",
                          padding: "6px 4px",
                          "&:hover": { backgroundColor: "#f8f9fa" }
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
              <h6 className="mb-3 text-dark font-weight-bold">📦 Existing Medicines ({existingMedicines.length})</h6>
              <Card className="border-0 shadow-sm">
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
                      table: { style: { fontSize: "0.85rem", minWidth: "1150px" } },
                      headRow: {
                        style: {
                          backgroundColor: "#f8f9fa",
                          fontWeight: 600,
                          padding: "8px 4px",
                          borderBottom: "2px solid #dee2e6",
                          fontSize: "0.8rem"
                        }
                      },
                      rows: {
                        style: {
                          minHeight: "40px",
                          padding: "6px 4px",
                          "&:hover": { backgroundColor: "#f8f9fa" }
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

          {error && <Alert color="danger">{error}</Alert>}

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

  // Summary consolidated into confirm step - this is kept for backward compatibility but should not render
  if (step === "summary" && false) {
    const summaryItems = Object.entries(pharmacyCheckResults).map(([idx, result]) => ({
      idx,
      ...result,
      formData: medicineFormData[idx],
    }));

    return (
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="px-3 pt-3">
          <h5 className="mb-1 text-primary text-uppercase font-weight-bold">
            Step 4: Summary
          </h5>
          <small className="text-muted">
            Review all details before final submission
          </small>
        </div>
        <hr className="mb-4 border-secondary" />

        <div className="content-wrapper">
          <Alert color="info">
            <h6>Final Review</h6>
            <p className="mb-0">
              You are about to import <strong>{summaryItems.length}</strong> medicines to your pharmacy inventory.
            </p>
            {billSupplier && (
              <p className="mb-0 mt-2">
                <strong>Bill Supplier:</strong> {billSupplier}
              </p>
            )}
          </Alert>

          {summaryItems.map((item) => (
            <Card key={item.idx} className="border-0 shadow-sm mb-3">
              <CardHeader className="bg-light border-0">
                <h6 className="mb-0">
                  {item.selectedMedicine?.name} {item.selectedMedicine?.strength}
                </h6>
                <small className="text-muted">
                  ID: {item.selectedMedicine?.id || item.selectedMedicine?._id}
                </small>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Batch & Expiry:</strong>
                      </small>
                      <div>{item.formData?.batchNumber}</div>
                      <div className="text-muted">{item.formData?.expiryDate}</div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Quantity:</strong>
                      </small>
                      <div>{item.formData?.quantity} units</div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Pharmacy ID:</strong>
                      </small>
                      <div>{centerId || "—"}</div>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Pricing:</strong>
                      </small>
                      <div>
                        P.Price: {item.formData?.purchasePrice || "—"}
                        {item.formData?.mrp && ` | MRP: ${item.formData?.mrp}`}
                        {item.formData?.salePrice && ` | S.Price: ${item.formData?.salePrice}`}
                      </div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Supplier:</strong>
                      </small>
                      <div>{item.formData?.company || item.formData?.manufacturer || "—"}</div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          ))}

          {error && <Alert color="danger">{error}</Alert>}

          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button
              color="secondary"
              onClick={() => setStep("pharmacyCheck")}
              outline
            >
              Back
            </Button>
            <Button
              color="success"
              onClick={handleFinalSubmission}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                "Submit & Import"
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
        <div className="px-3 pt-3">
          <h5 className="mb-1 text-success text-uppercase font-weight-bold">
            Bill Processing Complete!
          </h5>
          <small className="text-muted">
            Your pharmacy inventory has been updated successfully
          </small>
        </div>
        <hr className="mb-4 border-secondary" />

        <div className="content-wrapper">

          <Row className="mb-4">
            <Col md="6">
              <Card className="border-0 shadow-sm text-center">
                <CardBody>
                  <h5 className="text-primary">Medicines Processed</h5>
                  <h2 className="font-weight-bold text-primary">
                    {successResult?.updatedItems?.length || 0}
                  </h2>
                </CardBody>
              </Card>
            </Col>
            {successResult?.errors?.length > 0 && (
              <Col md="6">
                <Card className="border-0 shadow-sm text-center">
                  <CardBody>
                    <h5 className="text-danger">Errors</h5>
                    <h2 className="font-weight-bold text-danger">
                      {successResult.errors.length}
                    </h2>
                  </CardBody>
                </Card>
              </Col>
            )}
          </Row>

          {successResult.updatedItems.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="bg-light border-0">
                <h6 className="mb-0 font-weight-bold">Updated Medicines</h6>
              </CardHeader>
              <CardBody className="p-0">
                {successResult.updatedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-bottom p-3"
                    style={{
                      backgroundColor:
                        idx % 2 === 0 ? "#f8f9fa" : "transparent",
                    }}
                  >
                    <div className="mb-2">
                      <h6 className="mb-1 font-weight-bold">
                        {item.medicineName}
                      </h6>
                      <small className="text-muted">
                        Batch: {item.batchNumber} | Pharmacy ID: {item.pharmacyId}
                      </small>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Badge color="success">+{item.quantity} {item.baseUnit || "units"}</Badge>
                      <Badge color="info">{item.action}</Badge>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {successResult.errors?.length > 0 && (
            <Card className="border-0 shadow-sm mb-4 border-danger border-start border-5">
              <CardBody>
                <h6 className="mb-3 text-danger">Failed Medicines ({successResult.errors.length})</h6>
                <Alert color="danger" className="mb-3">
                  {successResult.errors.map((err, idx) => (
                    <div key={idx} className="mb-2">
                      {err.error}
                    </div>
                  ))}
                </Alert>
                {successResult.errors?.length > 0 && (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => downloadFailedMedicinesExcel(successResult.errors)}
                    outline
                  >
                    Download Failed Medicines Excel
                  </Button>
                )}
              </CardBody>
            </Card>
          )}

          <div className="d-flex gap-3 justify-content-center mt-4">
            <Button color="primary" onClick={handleStartNew} size="lg">
              ➕ Process Another Bill
            </Button>
          </div>
        </div>
      </CardBody>
    );
  }
};

export default OCRBillImport;
