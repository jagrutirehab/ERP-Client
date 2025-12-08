import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Input, Row, Spinner, TabPane } from 'reactstrap'
import CenterDropdown from '../../Report/Components/Doctor/components/CenterDropDown';
import { endOfDay, format, startOfDay } from 'date-fns';
import { connect, useDispatch } from 'react-redux';
import { useAuthError } from '../../../Components/Hooks/useAuthError';
import PropTypes from 'prop-types';
import Header from '../../Report/Components/Header';
import { getDetailedReport } from '../../../store/features/centralPayment/centralPaymentSlice';
import { toast } from 'react-toastify';
import { capitalizeWords } from '../../../utils/toCapitalize';
import { ExpandableText } from '../../../Components/Common/ExpandableText';
import DataTable from 'react-data-table-component';
import { Check, Copy } from 'lucide-react';
import AttachmentCell from './AttachmentCell';

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
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [copyId, setCopiedId] = useState(false);

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
      selector: (row) => row.id,
      wrap: true
    },
    {
      name: <div>Date</div>,
      selector: (row) => format(new Date(row.date), "d MMM yyyy hh:mm a"),
      wrap: true,
      minWidth: "120px",
      maxWidth: "150px",
    },
    {
      name: <div>Center</div>,
      selector: (row) => capitalizeWords(row.center?.title || row.center || "-"),
      wrap: true,
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
      selector: (row) => capitalizeWords(row.name || "-"),
      wrap: true,
    },
    {
      name: <div>Items</div>,
      selector: (row) => row.items ?
        <ExpandableText text={capitalizeWords(row.items)} /> :
        "-",
      wrap: true,
    },
    {
      name: <div>Description</div>,
      selector: (row) => row.description ?
        <ExpandableText text={capitalizeWords(row.description)} limit={20} /> :
        "-",
      wrap: true,
      minWidth: "120px",
      maxWidth: "200px"
    },
    {
      name: <div>Vendor</div>,
      selector: (row) => capitalizeWords(row.vendor || "-"),
      wrap: true,
    },
    {
      name: <div>Invoice No</div>,
      selector: (row) => row.invoiceNo || "-",
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
      selector: (row) => row.transactionType || "-",
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
          {row.TDSRate || "-"}
        </span>
      ),
      wrap: true,
    },
    {
      name: <div>Account Holder Name</div>,
      cell: (row) => (
        <span>
          {capitalizeWords(row?.bankDetails?.accountHolderName) || "-"}
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
          {row?.bankDetails?.IFSCCode || "-"}
        </span>
      ),
      wrap: true,
      minWidth: "120px",
      maxWidth: "150px",
    },
    {
      name: <div>Initial Payment Status</div>,
      selector: (row) => {
        const status = row.initialPaymentStatus;
        const badgeStyle = { display: "inline-block", whiteSpace: "normal", wordBreak: "break-word" };

        if (status === "COMPLETED") return <span>Paid</span>;
        if (status === "PENDING") return <span>To Be Paid</span>;

        return <span style={badgeStyle}>{status || "-"}</span>;
      },
      wrap: true,
    },
    {
      name: <div>Current Payment Status</div>,
      selector: (row) => (
        <Badge
          color={getBadgeColor(row.currentPaymentStatus)}
          style={{
            display: "inline-block",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {capitalizeWords(row.currentPaymentStatus || "-")}
        </Badge>
      ),
      wrap: true,
    },
    {
      name: <div>Attachment Type</div>,
      selector: (row) => capitalizeWords(row.attachmentType) || "-",
      wrap: true,
    },
    {
      name: <div>Attachments</div>,
      cell: (row) => <AttachmentCell attachments={row.attachments || []} showAsButton={true} />,
      wrap: true,
      minWidth: "140px",

    },
    {
      name: <div>Approval Status</div>,
      selector: (row) => {
        const status = row.approvalStatus;
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
    }
  ];


  useEffect(() => {
    if (!hasUserPermission || activeTab !== "detail") return;

    const fetchDetailReport = async () => {
      try {
        await dispatch(
          getDetailedReport({
            page,
            limit,
            approvalStatus: selectedApprovalStatus,
            currentPaymentStatus: selectedPaymentStatus,
            centers: selectedCentersIds,
            startDate: reportDate.start.toISOString(),
            endDate: reportDate.end.toISOString(),
          })
        ).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to fetch detail report.");
        }
      }
    }

    fetchDetailReport();
  }, [
    page,
    limit,
    selectedCentersIds,
    selectedApprovalStatus,
    selectedPaymentStatus,
    reportDate,
    dispatch,
    activeTab, ,
    roles
  ]);

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
            <Header reportDate={reportDate} setReportDate={handleDateChange} />
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
})
export default connect(mapStateToProps)(DetailedReport);