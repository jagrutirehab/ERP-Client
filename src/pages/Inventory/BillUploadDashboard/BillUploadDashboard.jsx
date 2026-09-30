import  { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Plus, X } from "lucide-react";
import { CardBody, Input, Button, Modal, ModalBody, ModalHeader, Badge, Row, Col } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import { useSelector } from "react-redux";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { getBillUploadRecords, exportConsolidatedReport } from "../../../helpers/backend_helper";
import PreviewFile from "../../../Components/Common/PreviewFile";

import { billUploadDashboardColumns } from "../Columns/Pharmacy/BillUploadDashboardColumns";

export const statiusOptions = [
    { value: "", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PARTIALLY_COMPLETED", label: "Partially Completed" },
    { value: "FAILED", label: "Failed" },
];

const BillUploadDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.User);
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);
  const hasUserPermission = hasPermission("PHARMACY", "BILL_UPLOAD_DASHBOARD", "READ");
  const hasWritePermission = hasPermission("PHARMACY", "BILL_UPLOAD_DASHBOARD", "WRITE") || hasPermission("PHARMACY", "BILL_UPLOAD_DASHBOARD", "DELETE");
  const handleAuthError = useAuthError();

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState({ value: "", label: "All Centers" });
  const [selectedStatus, setSelectedStatus] = useState(statiusOptions[0]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const togglePreview = () => {
    if (previewOpen && previewFile?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewOpen(!previewOpen);
  };

  const showBillDetails = (bill) => {
    setSelectedBill(bill);
    setDetailsOpen(true);
  };

  const toggleDetails = () => {
    setDetailsOpen(!detailsOpen);
    if (detailsOpen) {
      setSelectedBill(null);
    }
  };

  const handleDownloadConsolidatedReport = useCallback(async (billImportId, billNumber) => {
    try {
      const response = await exportConsolidatedReport(billImportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Consolidated-Report-${billNumber || billImportId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Consolidated report downloaded successfully");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("Failed to download consolidated report");
      }
    }
  }, [handleAuthError]);

  const centerOptions = useMemo(() => {
    const baseOptions = [{ value: "", label: "All Centers" }];
    if (!user?.userCenters) return baseOptions;
    const options = user.userCenters.map((center) => ({
      value: center._id || center.id,
      label: center.title || "Unknown Center",
    }));
    return [...baseOptions, ...options];
  }, [user?.userCenters]);


  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchBillUploads = async () => {
    if (!hasUserPermission) return;

    setLoading(true);
    try {
      let centers = [];
      if (selectedCenter && selectedCenter.value !== "") {
        centers = [selectedCenter.value];
      } else {
        centers = user?.centerAccess || [];
      }

      const params = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        centers,
      };

      if (selectedStatus && selectedStatus.value !== "") {
        params.status = selectedStatus.value;
      }

      const response = await getBillUploadRecords(params);
      setRecords(response.data || []);
      setTotalItems(response.pagination?.total || response.pagination?.totalDocs || 0);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err.message || "Failed to fetch bill uploads");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillUploads();
  }, [currentPage, pageSize, debouncedSearch, selectedCenter, selectedStatus, user?.centerAccess]);

  useEffect(() => {
    setSelectedCenter({ value: "", label: "All Centers" });
    setCurrentPage(1);
  }, [user?.centerAccess]);

  const columns = useMemo(() => billUploadDashboardColumns({
    navigate,
    hasWritePermission,
    handleDownloadConsolidatedReport,
    setPreviewFile,
    setPreviewOpen,
    showBillDetails
  }), [navigate, hasWritePermission, handleDownloadConsolidatedReport, setPreviewFile, setPreviewOpen, showBillDetails]);

  if (!hasUserPermission && !permissionLoader) {
    navigate("/unauthorized");
  }

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="content-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h4 className="font-weight-bold text-primary text-uppercase mb-0">
            Bill Upload History
          </h4>
          {hasWritePermission && (
            <Button
              color="primary"
              onClick={() => navigate("/pharmacy/ocr-bill-import")}
              className="d-flex align-items-center gap-1"
            >
              <Plus size={16} />
              Upload New Bill
            </Button>
          )}
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
          <div className="d-flex flex-wrap gap-3 align-items-center flex-grow-1">

            <div className="w-90 w-md-auto" style={{ maxWidth: "290px" }}>
              <div className="position-relative w-100">
                <Search
                  className="position-absolute"
                  style={{
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "16px",
                    height: "16px",
                  }}
                />
                <Input
                  type="text"
                  placeholder="Search Bill # or Supplier..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="ps-5"
                  style={{ height: "38px" }}
                />
              </div>
            </div>

            <div style={{ minWidth: "200px" }}>
              <Select
                options={centerOptions}
                value={selectedCenter}
                onChange={(selected) => {
                  setSelectedCenter(selected);
                  setCurrentPage(1);
                }}
                placeholder="Filter Centers..."
                classNamePrefix="react-select"
              />
            </div>

            <div style={{ minWidth: "200px" }}>
              <Select
                options={statiusOptions}
                value={selectedStatus}
                onChange={(selected) => {
                  setSelectedStatus(selected);
                  setCurrentPage(1);
                }}
                placeholder="Filter Status..."
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <RefreshButton
            onRefresh={() => {
              setCurrentPage(1);
              fetchBillUploads();
            }}
            loading={loading}
          />
        </div>

        <DataTable
          columns={columns}
          data={records}
          loading={loading}
          pagination={{
            totalDocs: totalItems,
          }}
          page={currentPage}
          setPage={setCurrentPage}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>

      <PreviewFile
        isOpen={previewOpen}
        toggle={togglePreview}
        file={previewFile}
        title="Bill Preview"
        allowDownload={true}
      />

      {/* Bill Details Modal */}
      <Modal isOpen={detailsOpen} toggle={toggleDetails} size="lg" centered>
        <ModalHeader toggle={toggleDetails} className="bg-light">
          <span className="text-primary font-weight-bold">📋 Bill Details</span>
        </ModalHeader>
        <ModalBody className="p-4">
          {selectedBill && (
            <div>
              {/* Header Section */}
              <div className="mb-4 pb-3 border-bottom">
                <Row className="mb-3">
                  <Col md="6">
                    <h6 className="text-muted small mb-1">Bill Number</h6>
                    <p className="font-weight-bold mb-0">{selectedBill.billNumber || "-"}</p>
                  </Col>
                  <Col md="6" className="text-end">
                    <h6 className="text-muted small mb-1">Status</h6>
                    <Badge color={
                      selectedBill.status === "COMPLETED" ? "success" :
                      selectedBill.status === "PENDING" ? "warning" :
                      selectedBill.status === "PARTIALLY_COMPLETED" ? "info" :
                      "danger"
                    }>
                      {selectedBill.status || "-"}
                    </Badge>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <h6 className="text-muted small mb-1">Supplier</h6>
                    <p className="mb-0">{selectedBill.supplier || "-"}</p>
                  </Col>
                  <Col md="6">
                    <h6 className="text-muted small mb-1">Center</h6>
                    <p className="mb-0">{selectedBill.center?.title || "-"}</p>
                  </Col>
                </Row>
              </div>

              {/* Financial Section */}
              <div className="mb-4 pb-3 border-bottom">
                <h6 className="font-weight-bold text-dark mb-3">Financial Details</h6>
                <Row>
                  <Col md="6" className="mb-2">
                    <small className="text-muted">Gross Amount</small>
                    <p className="font-weight-bold mb-0">₹{Number(selectedBill.extractedData?.billMetadata?.grossAmount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                  </Col>
                  <Col md="6" className="mb-2">
                    <small className="text-muted">Discount</small>
                    <p className="font-weight-bold mb-0">₹{Number(selectedBill.extractedData?.billMetadata?.discountAmount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                  </Col>
                  <Col md="6" className="mb-2">
                    <small className="text-muted">Final Amount</small>
                    <p className="font-weight-bold mb-0">₹{Number(selectedBill.extractedData?.billMetadata?.finalAmount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                  </Col>
                  <Col md="6" className="mb-2">
                    <small className="text-muted">Total Amount</small>
                    <p className="font-weight-bold mb-0">₹{Number(selectedBill.extractedData?.billMetadata?.totalAmount || selectedBill.billAmount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                  </Col>
                </Row>
              </div>

              {/* Medicines Summary */}
              <div className="mb-4 pb-3 border-bottom">
                <h6 className="font-weight-bold text-dark mb-3">Medicines Summary</h6>
                <Row>
                  <Col sm="6" md="3" className="mb-2">
                    <div className="bg-light p-3 rounded text-center">
                      <h5 className="text-primary font-weight-bold mb-0">{selectedBill.extractedData?.medicines?.length || 0}</h5>
                      <small className="text-muted">Total Extracted</small>
                    </div>
                  </Col>
                  <Col sm="6" md="3" className="mb-2">
                    <div className="bg-light p-3 rounded text-center">
                      <h5 className="text-success font-weight-bold mb-0">{(selectedBill.extractedData?.medicines?.length || 0) - (selectedBill.errors?.length || 0)}</h5>
                      <small className="text-muted">Found in Master</small>
                    </div>
                  </Col>
                  <Col sm="6" md="3" className="mb-2">
                    <div className="bg-light p-3 rounded text-center">
                      <h5 className="text-warning font-weight-bold mb-0">{selectedBill.errors?.length || 0}</h5>
                      <small className="text-muted">Missing</small>
                    </div>
                  </Col>
                  <Col sm="6" md="3" className="mb-2">
                    <div className="bg-light p-3 rounded text-center">
                      <h5 className="text-info font-weight-bold mb-0">{selectedBill.processedItems?.length || 0}</h5>
                      <small className="text-muted">Processed</small>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Metadata */}
              <div className="mb-0">
                <h6 className="font-weight-bold text-dark mb-3">Metadata</h6>
                <Row>
                  <Col md="6">
                    <small className="text-muted">Uploaded By</small>
                    <p className="mb-2">{selectedBill.uploadedBy?.name || "-"} ({selectedBill.uploadedBy?.email || "-"})</p>
                  </Col>
                  <Col md="6">
                    <small className="text-muted">Uploaded On</small>
                    <p className="mb-2">{selectedBill.createdAt ? new Date(selectedBill.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</p>
                  </Col>
                </Row>
              </div>

              {/* Missing Medicines List */}
              {selectedBill.errors?.length > 0 && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="font-weight-bold mb-3">Missing Medicines ({selectedBill.errors.length})</h6>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    <table className="table table-sm table-bordered mb-0">
                      <thead>
                        <tr className="bg-light">
                          <th className="p-2">Medicine</th>
                          <th className="p-2">Strength</th>
                          <th className="p-2">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.errors.map((err, idx) => (
                          <tr key={idx}>
                            <td className="p-2">{err.extractedName || "-"}</td>
                            <td className="p-2">{err.extractedStrength || "-"}</td>
                            <td className="p-2"><small>{err.reason || "-"}</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
      </Modal>
    </CardBody>
  );
};

export default BillUploadDashboard;
