import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Input, Row, Spinner, TabPane } from 'reactstrap'
import CenterDropdown from '../../Report/Components/Doctor/components/CenterDropDown';
import { endOfDay, format, startOfDay } from 'date-fns';
import { connect, useDispatch } from 'react-redux';
import { useAuthError } from '../../../Components/Hooks/useAuthError';
import PropTypes from 'prop-types';
import Header from '../../Report/Components/Header';
import { getDetailedReport, updateCentralPayment } from '../../../store/features/centralPayment/centralPaymentSlice';
import { toast } from 'react-toastify';
import { capitalizeWords } from '../../../utils/toCapitalize';
import { ExpandableText } from '../../../Components/Common/ExpandableText';
import DataTable from 'react-data-table-component';
import { Check, Copy } from 'lucide-react';
import AttachmentCell from './AttachmentCell';
import UploadModal from './UploadModal';
import { downloadFile } from '../../../Components/Common/downloadFile';
import PreviewFile from '../../../Components/Common/PreviewFile';
import { isPreviewable } from '../../../utils/isPreviewable';
import { exportDetailedCentralReportXLSX } from '../../../helpers/backend_helper';
import { categoryOptions } from '../../../Components/constants/centralPayment';

const DetailedReport = ({
  centers,
  centerAccess,
  detailedReport,
  loading,
  activeTab,
  hasUserPermission,
  roles
}) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();

  const centerOptions = centers
    ?.filter((c) => centerAccess.includes(c._id))
    .map((c) => ({
      _id: c._id,
      title: c.title,
    }));

  const [selectedCentersIds, setSelectedCentersIds] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [copyId, setCopiedId] = useState(false);
  const [dateFilterEnabled, setDateFilterEnabled] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isExcelGenerating, setIsExcelGenerating] = useState(false);

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };


  useEffect(() => {
    if (centerOptions && centerOptions.length > 0 && !isInitialized) {
      const allCenterIds = centerOptions.map((c) => c._id);
      setSelectedCentersIds(allCenterIds);
      setSelectedCenters(centerOptions);
      setIsInitialized(true);
    }
  }, [centerOptions, isInitialized]);

  useEffect(() => {
    if (isInitialized && centerOptions) {
      const availableCenterIds = centerOptions.map((c) => c._id);

      const filteredCenterIds = selectedCentersIds.filter((id) =>
        availableCenterIds.includes(id)
      );

      if (filteredCenterIds.length !== selectedCentersIds.length) {
        setSelectedCentersIds(filteredCenterIds);
        setSelectedCenters(
          centerOptions.filter((c) => filteredCenterIds.includes(c._id))
        );
      }
    }
  }, [centerAccess, centers]);

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };


  const getBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "success";
      case "COMPLETED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "secondary";
    }
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => row?.id || "-",
      wrap: true
    },
    {
      name: <div>Date</div>,
      selector: (row) => format(new Date(row?.date), "d MMM yyyy hh:mm a"),
      wrap: true,
      minWidth: "120px",
      maxWidth: "150px",
    },
    {
      name: <div>Center</div>,
      selector: (row) => capitalizeWords(row.center?.title || row.center || "-"),
      wrap: true,
      minWidth: "120px"
    },
    {
      name: <div>Author</div>,
      selector: (row) => capitalizeWords(row.author?.name || "-"),
      wrap: true,
    },
    {
      name: <div>Approved By</div>,
      selector: (row) => capitalizeWords(row.approvedBy?.name || "-"),
      wrap: true,
    },
    {
      name: <div>Name</div>,
      selector: (row) => row.name?.toUpperCase() || "-",
      wrap: true,
    },
    {
      name: <div>Items</div>,
      selector: (row) => row.items ?
        <ExpandableText text={row.items?.toUpperCase()} /> :
        "-",
      wrap: true,
    },
    {
      name: <div>Item Category</div>,
      selector: (row) => categoryOptions.find(
        (option) => option.value === row?.category
      )?.label || "-",
      wrap: true,
      minWidth: "120px"
    },
    {
      name: <div>Other Category Details</div>,
      selector: (row) => <ExpandableText text={row?.otherCategory || "-"} />,
      wrap: true,
      minWidth:"120px"
    },
    {
      name: <div>Description</div>,
      selector: (row) => row.description ?
        <ExpandableText text={row.description?.toUpperCase()} limit={20} /> :
        "-",
      wrap: true,
      minWidth: "120px",
      maxWidth: "200px"
    },
    {
      name: <div>Vendor</div>,
      selector: (row) => row.vendor?.toUpperCase() || "-",
      wrap: true,
    },
    {
      name: <div>Invoice No</div>,
      selector: (row) => row.invoiceNo?.toUpperCase() || "-",
      wrap: true,
    },
    {
      name: <div>E-Net</div>,
      selector: (row) => (
        <div className="d-flex align-items-center gap-1">
          <span className="flex-grow-1">
            {row.eNet ? <ExpandableText text={row.eNet} limit={12} /> : "-"}
          </span>
          {row.eNet && (
            <Button
              color="link"
              size="sm"
              onClick={() => handleCopy(row.eNet, row._id)}
              className="p-0 text-muted"
              title="Copy to clipboard"
            >
              {copyId === row._id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </Button>
          )}
        </div>
      ),
      wrap: true,
      minWidth: "200px",
      maxWidth: "400px",
    },
    {
      name: <div>Transaction Type</div>,
      selector: (row) => row.transactionType?.toUpperCase() || "-",
      wrap: true
    },
    {
      name: <div>Total Amount</div>,
      cell: (row) => (
        <span>
          ₹
          {row.totalAmountWithGST?.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}
        </span>
      ),
      wrap: true,
    },
    {
      name: <div>GST Amount</div>,
      cell: (row) => (
        <span>
          ₹
          {row.GSTAmount?.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}
        </span>
      ),
      wrap: true,
    },
    {
      name: <div>TDS Rate</div>,
      cell: (row) => (
        <span>
          {row?.TDSRate || "-"}
        </span>
      ),
      wrap: true,
    },
    {
      name: <div>Account Holder Name</div>,
      cell: (row) => (
        <span>
          {row?.bankDetails?.accountHolderName?.toUpperCase() || "-"}
        </span>
      ),
      wrap: true,
    },
    {
      name: <div>Account Number</div>,
      cell: (row) => (
        <span>
          {row?.bankDetails?.accountNo || "-"}
        </span>
      ),
      wrap: true,
      minWidth: "120px",
      maxWidth: "150px",
    },
    {
      name: <div>IFSC Code</div>,
      cell: (row) => (
        <span>
          {row?.bankDetails?.IFSCCode?.toUpperCase() || "-"}
        </span>
      ),
      wrap: true,
      minWidth: "120px",
      maxWidth: "150px",
    },
    {
      name: <div>Transaction ID/UTR</div>,
      cell: (row) => (
        <span>
          {row?.transactionId?.toUpperCase() || "-"}
        </span>
      ),
      wrap: true,
      minWidth: "120px",
      maxWidth: "150px",
    },
    {
      name: <div>Initial Payment Status</div>,
      selector: (row) => {
        const status = row?.initialPaymentStatus;
        const badgeStyle = { display: "inline-block", whiteSpace: "normal", wordBreak: "break-word" };

        if (status === "COMPLETED") return <span>Paid</span>;
        if (status === "PENDING") return <span>To Be Paid</span>;

        return <span style={badgeStyle}>{status || "-"}</span>;
      },
      wrap: true,
    },
    {
      name: <div>Approval Status</div>,
      selector: (row) => {
        const status = row?.approvalStatus;
        return (
          <Badge
            color={getBadgeColor(status)}
            style={{
              display: "inline-block",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {capitalizeWords(status || "-")}
          </Badge>
        );
      },
      wrap: true,
    },
    {
      name: <div>Process Status</div>,
      selector: (row) => (
        <Badge
          color={getBadgeColor(row?.processStatus)}
          style={{
            display: "inline-block",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {capitalizeWords(row?.processStatus?.replace(/_/g, " ")) || "-"}
        </Badge>
      ),
      wrap: true,
      minWidth: "140px"
    },
    {
      name: <div>Current Payment Status</div>,
      selector: (row) => (
        <Badge
          color={getBadgeColor(row?.currentPaymentStatus)}
          style={{
            display: "inline-block",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {capitalizeWords(row?.currentPaymentStatus || "-")}
        </Badge>
      ),
      wrap: true,
    },
    {
      name: <div>Attachment Type</div>,
      selector: (row) => capitalizeWords(row?.attachmentType) || "-",
      wrap: true,
    },
    {
      name: <div>Attachments</div>,
      cell: (row) => {

        const handleAttachmentClick = (file) => {
          if (isPreviewable(file, row?.updatedAt)) {
            setPreviewFile(file);
            setPreviewOpen(true);
          } else {
            downloadFile(file);
            setPreviewOpen(false);
            setPreviewFile(null);
          }
        };

        return (
          <AttachmentCell
            attachments={row.attachments || []}
            showAsButton={true}
            onPreview={handleAttachmentClick}
          />
        )
      },
      wrap: true,
      minWidth: "140px",

    },
    {
      name: <div>Transaction Proof</div>,
      cell: (row) => {
        const status = row?.currentPaymentStatus;

        if (status === "PENDING" || status === "REJECTED") {
          return (
            <i className="text-muted small">
              Action not permitted
            </i>
          );
        }

        if (status === "COMPLETED") {
          return row?.transactionProof ? (
            <span
              className="text-primary text-decoration-underline cursor-pointer"
              onClick={() =>
                downloadFile({ url: row.transactionProof })
              }
            >
              Download
            </span>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setSelectedPaymentId(row._id);
                setIsUploadModalOpen(true);
              }}
            >
              Upload
            </Button>
          );
        }

        return (
          <i className="text-muted small">
            Action not permitted
          </i>
        );
      },
      wrap: true,
      minWidth: "160px",
    }
  ];

  useEffect(() => {
    if (search === "") return;

    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchDetailReport = async () => {
    try {
      await dispatch(
        getDetailedReport({
          page,
          limit,
          approvalStatus: selectedApprovalStatus,
          currentPaymentStatus: selectedPaymentStatus,
          centers: selectedCentersIds,
          ...(dateFilterEnabled && {
            startDate: reportDate.start.toISOString(),
            endDate: reportDate.end.toISOString()
          }),
          ...(search !== "" && { search: parseInt(debouncedSearch) }),
        })
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch detail report.");
      }
    }
  }

  useEffect(() => {
    if (hasUserPermission && activeTab === "detail") {
      fetchDetailReport();
    }
  }, [
    page,
    limit,
    selectedCentersIds,
    selectedApprovalStatus,
    selectedPaymentStatus,
    reportDate,
    dispatch,
    activeTab, ,
    roles,
    debouncedSearch,
    dateFilterEnabled
  ]);

  const handleExportXLSX = async () => {
    setIsExcelGenerating(true);
    try {
      const res = await exportDetailedCentralReportXLSX({
        page,
        limit,
        approvalStatus: selectedApprovalStatus,
        currentPaymentStatus: selectedPaymentStatus,
        centers: selectedCentersIds,
        ...(dateFilterEnabled && {
          startDate: reportDate.start.toISOString(),
          endDate: reportDate.end.toISOString()
        }),
        ...(search !== "" && { search: parseInt(debouncedSearch) }),
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `central-payment-detailed-report-${format(reportDate.start, "yyyy-MM-dd")}_to_${format(reportDate.end, "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("Something went wrong while generating xlsx file")
      }
    } finally {
      setIsExcelGenerating(false);
    }
  }

  const handleFilterChange = (filterType, value) => {
    setPage(1);
    if (filterType === "approvalStatus") {
      setSelectedApprovalStatus(value);
    } else if (filterType === "paymentStatus") {
      setSelectedPaymentStatus(value)
    } else if (filterType === "limit") {
      setLimit(value);
    }
  };

  const handleTransactionProofUpload = async (file) => {
    if (!selectedPaymentId) return;
    setUploading(true);


    try {
      const formData = new FormData();
      formData.append("transactionProof", file);

      await dispatch(updateCentralPayment({ id: selectedPaymentId, formData: formData, centers: centerAccess })).unwrap()
      toast.success("Transaction proof uploaded successfully");
      fetchDetailReport();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "something went wrong while uploading transaction proof");
      }
    } finally {
      setIsUploadModalOpen(false);
      setUploading(false);
    }
  };


  const handleDateChange = (newDate) => {
    setPage(1);
    setReportDate(newDate);
  };
  return (
    <TabPane tabId="detail" style={{ padding: 0 }}>
      <div className="mt-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div style={{ minWidth: "100px", maxWidth: "120px" }}>
            <Input
              type="select"
              value={limit}
              onChange={(e) => handleFilterChange("limit", Number(e.target.value))}
            >
              {[10, 20, 30, 40, 50].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Input>
          </div>
          <div style={{ minWidth: "150px", maxWidth: "200px" }}>
            <Input
              type="select"
              value={selectedApprovalStatus}
              onChange={(e) =>
                handleFilterChange("approvalStatus", e.target.value)
              }
            >
              <option value="">All Approval Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Input>
          </div>
          <div style={{ minWidth: "150px", maxWidth: "250px" }}>
            <Input
              type="select"
              value={selectedPaymentStatus}
              onChange={(e) =>
                handleFilterChange("paymentStatus", e.target.value)
              }
            >
              <option value="">All Current Payment Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </Input>
          </div>
          <div style={{ minWidth: "150px" }}>
            <Header reportDate={reportDate} setReportDate={handleDateChange} disabled={!dateFilterEnabled} />
          </div>
          <div style={{ minWidth: "200px", maxWidth: "250px" }}>
            <CenterDropdown
              options={centerOptions}
              value={selectedCentersIds}
              onChange={(ids) => {
                setPage(1);
                setSelectedCentersIds(ids);
                setSelectedCenters(
                  centerOptions.filter((c) => ids.includes(c._id))
                );
              }}
            />
          </div>
          <div className="d-flex align-items-center gap-2 flex-grow-1 mb-3" style={{ minWidth: "250px" }}>
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                const value = e.target.value.trim();
                setSearch(value);
                if (value === "") {
                  setDebouncedSearch("");
                  setDateFilterEnabled(true);
                } else {
                  setDateFilterEnabled(false);
                }
              }}
              className="form-control"
              placeholder="Search by ID..."
              style={{ flexGrow: 1 }}
            />

            {search.trim() !== "" && (
              <Button
                color="primary"
                size="sm"
                className="white-space-nowrap text-white py-2"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => setDateFilterEnabled(!dateFilterEnabled)}
              >
                {dateFilterEnabled ? "Disable Date Filter" : "Enable Date Filter"}
              </Button>
            )}
          </div>
          <div className="mb-3">
            <Button
              className="d-flex align-items-center gap-1"
              onClick={handleExportXLSX}
              disabled={isExcelGenerating || selectedCentersIds.length === 0}
            >
              {isExcelGenerating ? <Spinner size="sm" /> : <i className="ri-file-excel-2-line" />}
              Export Excel
            </Button>
          </div>
        </div>
      </div>
      <Card>
        <CardBody>
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : (
            <DataTable
              title="History"
              columns={columns}
              data={detailedReport?.data || []}
              highlightOnHover
              striped
              responsive
            />
          )}
          {!loading && detailedReport?.pagination?.totalPages > 1 && (
            <>
              {/* Mobile Layout */}
              <div className="d-block d-md-none text-center mt-3">
                <div className="text-muted mb-2">
                  Showing {(page - 1) * limit + 1}–
                  {Math.min(page * limit, detailedReport?.pagination?.totalDocs || 0)} of{" "}
                  {detailedReport?.pagination?.totalDocs || 0}
                </div>
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    color="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </Button>
                  <Button
                    color="secondary"
                    disabled={page === detailedReport?.pagination?.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </div>
              </div>

              {/* Desktop Layout */}
              <Row className="mt-4 justify-content-center align-items-center d-none d-md-flex">
                <Col xs="auto" className="d-flex justify-content-center">
                  <Button
                    color="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </Button>
                </Col>
                <Col xs="auto" className="text-center text-muted mx-3">
                  Showing {(page - 1) * limit + 1}–
                  {Math.min(page * limit, detailedReport?.pagination?.totalDocs || 0)} of{" "}
                  {detailedReport?.pagination?.totalDocs || 0}
                </Col>
                <Col xs="auto" className="d-flex justify-content-center">
                  <Button
                    color="secondary"
                    disabled={page === detailedReport?.pagination?.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </CardBody>
      </Card>

      <UploadModal
        isOpen={isUploadModalOpen}
        toggle={() => setIsUploadModalOpen(!isUploadModalOpen)}
        onUpload={handleTransactionProofUpload}
        loading={uploading}
      />

      <PreviewFile
        title="Attachment Preview"
        file={previewFile}
        isOpen={previewOpen}
        toggle={closePreview}
      />
    </TabPane>
  )
};

DetailedReport.prototype = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
  detailedReport: PropTypes.array,
  loading: PropTypes.bool,
  activeTab: PropTypes.string,
  hasUserPermission: PropTypes.bool,
  roles: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  detailedReport: state.CentralPayment.detailedReport,
  loading: state.CentralPayment.loading,
});

export default connect(mapStateToProps)(DetailedReport);