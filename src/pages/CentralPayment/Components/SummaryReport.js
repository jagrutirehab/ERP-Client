import { useEffect, useRef } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Card,
  CardBody,
  CardTitle,
  Col,
  Row,
  TabPane,
  Spinner,
  UncontrolledTooltip,
  Button,
  ListGroupItem,
  ListGroup,
} from "reactstrap";
import PropTypes from "prop-types";
import { RotateCw } from "lucide-react";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { getSummaryReport } from "../../../store/features/centralPayment/centralPaymentSlice";
import { formatCurrency } from "../../../utils/formatCurrency";


const AmountRow = ({ label, total, payable }) => (
  <ListGroupItem className="bg-white py-1">
    <div className="fw-medium mb-2">{label}:</div>

    <div className="d-flex justify-content-between align-items-end">
      <div>
        <div className="fw-semibold">
          {formatCurrency(total)}
        </div>
        <i className="text-muted">Total</i>
      </div>

      <div className="text-end">
        <div className="fw-semibold">
          {formatCurrency(payable)}
        </div>
        <i className="text-muted">
          Payable (TDS deducted)
        </i>
      </div>
    </div>
  </ListGroupItem>
);

const SummaryReport = ({
  centerAccess,
  summaryReport,
  loading,
  activeTab,
  hasUserPermission,
  roles,
}) => {
  const dispatch = useDispatch();
  const lastSummaryCacheKeyRef = useRef("");
  const handleAuthError = useAuthError();

  useEffect(() => {
    if (!hasUserPermission || activeTab !== "summary") return;

    const cacheKey = [...centerAccess].sort().join(",");
    if (lastSummaryCacheKeyRef.current !== cacheKey) {
      const fetchSummary = async () => {
        try {
          await dispatch(getSummaryReport({ centers: centerAccess })).unwrap();
          lastSummaryCacheKeyRef.current = cacheKey;
        } catch (error) {
          if (!handleAuthError(error)) {
            toast.error(error.message || "Failed to fetch summary report.");
          }
        }
      };
      fetchSummary();
    }
  }, [activeTab, centerAccess, dispatch, roles]);

  const handleRefresh = async () => {
    try {
      await dispatch(
        getSummaryReport({ centers: centerAccess, refetch: true })
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch summary report.");
      }
    }
  };

  return (
    <TabPane tabId="summary">
      <Col className="mb-2">
        <div className="d-flex justify-content-end ms-auto">
          <Button
            id="refresh-summary-btn"
            color="outline-secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="d-flex align-items-center justify-content-center rounded-circle p-0"
            style={{
              width: "36px",
              height: "36px",
            }}
          >
            <RotateCw
              size={16}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
          </Button>
          <UncontrolledTooltip target="refresh-summary-btn" placement="top">
            Refresh
          </UncontrolledTooltip>
        </div>
      </Col>
      <Row>
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : !summaryReport?.data ||
          !Array.isArray(summaryReport.data) ||
          summaryReport.data.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No spending data available for your centers.
          </div>
        ) : (
          summaryReport?.data?.map((data) => (
            <Col key={data._id} xs="12" md="6" xl="4" className="mb-4">
              <Card className="shadow-sm h-100">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    {data.title}
                  </CardTitle>

                  <ListGroup flush>
                    <AmountRow
                      label="Approved & Paid"
                      total={data.approvedAndPaid_total}
                      payable={data.approvedAndPaid_final}
                    />

                    <AmountRow
                      label="Approved, Payment Pending"
                      total={data.approvedAwaitingPayment_total}
                      payable={data.approvedAwaitingPayment_final}
                    />

                    <AmountRow
                      label="Awaiting Approval"
                      total={data.awaitingApproval_total}
                      payable={data.awaitingApproval_final}
                    />
                  </ListGroup>
                </CardBody>
              </Card>

            </Col>
          ))
        )}
      </Row>
      <style>
        {`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        `}
      </style>
    </TabPane>
  );
};

SummaryReport.prototype = {
  centerAccess: PropTypes.array,
  summaryReport: PropTypes.object,
  loading: PropTypes.bool,
  activeTab: PropTypes.string,
  hasUserPermission: PropTypes.bool,
  roles: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centerAccess: state.User?.centerAccess,
  summaryReport: state.CentralPayment.summaryReport,
  loading: state.CentralPayment.loading,
});

export default connect(mapStateToProps)(SummaryReport);
