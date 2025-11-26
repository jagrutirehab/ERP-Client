import { useEffect, useRef } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Badge,
  Card,
  CardBody,
  CardTitle,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
  TabPane,
  Spinner,
  UncontrolledTooltip,
  Button,
} from "reactstrap";
import { getSummaryReport } from "../../../store/features/cashManagement/cashSlice";
import PropTypes from "prop-types";
import { RotateCw } from "lucide-react";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";

const formatCurrency = (amount) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

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
  }, [activeTab, centerAccess, roles, dispatch]);

  const handleRefresh = async () => {
    try {
      await dispatch(getSummaryReport({ centers: centerAccess, refetch: true })).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch summary report.");
      }
    }
  }

  return (
    <TabPane tabId="summary">
      <Col className="mb-2">
        {/* <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-2"
        > */}
        {/* <span
            className="fw-bold fs-6 fs-md-5"
            style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}
          >
            Total Ending Balance:
            {loading ? (
              <span
                style={{
                  display: "inline-block",
                  width: "140px",
                  height: "1em",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite",
                  position: "relative",
                  top: "2px",
                }}
              />
            ) : (
              <span>{formatCurrency(summaryReport?.data?.totalCurrentBalance || 0)}</span>
            )}
          </span> */}

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

        {/* </div> */}

      </Col>
      <Row>
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : !summaryReport?.data || !Array.isArray(summaryReport.data) || summaryReport.data.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No summary data available for your centers.
          </div>
        ) : summaryReport?.data?.map((data) => (
          <Col key={data.center._id} xs="12" md="6" xl="3" className="mb-4">
            <Card className="shadow-sm h-100 hover-shadow bg-white">
              <CardBody>
                <CardTitle tag="h5" className="fw-bold mb-3">
                  {data.center.title}
                </CardTitle>
                <ListGroup flush>
                  <ListGroupItem className="d-flex justify-content-between align-items-center bg-white">
                    <span className="fw-medium text-muted">Base Balance:</span>
                    <span>{formatCurrency(data.baseBalanceAmount)}</span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center text-danger bg-white">
                    <span className="fw-medium">Total Bank Deposits:</span>
                    <span className="fw-semibold">
                      - {formatCurrency(data.totalDeposits)}
                    </span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center text-danger bg-white">
                    <span className="fw-medium">Total Spending:</span>
                    <span className="fw-semibold">
                      - {formatCurrency(data.totalSpending)}
                    </span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center text-success bg-white">
                    <span className="fw-medium">Total IPD Payments:</span>
                    <span className="fw-semibold">
                      + {formatCurrency(data.totalAdvancePayments)}
                    </span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center text-success bg-white">
                    <span className="fw-medium">Total OPD Payments:</span>
                    <span className="fw-semibold">
                      + {formatCurrency(data.totalOPDPayments)}
                    </span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center text-success bg-white">
                    <span className="fw-medium">Total Intern Payments:</span>
                    <span className="fw-semibold">
                      + {formatCurrency(data.totalInternPayments)}
                    </span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center text-success bg-white">
                    <span className="fw-medium">Total Deposit - Olive:</span>
                    <span className="fw-semibold">
                      + {formatCurrency(data.totalIPDDeposits)}
                    </span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center bg-white">
                    <span className="fw-bold">Ending Balance:</span>
                    <h6>
                      <Badge
                        color={data.currentBalance >= 0 ? "success" : "danger"}
                        pill
                      >
                        {formatCurrency(data.currentBalance)}
                      </Badge>
                    </h6>
                  </ListGroupItem>
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
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
  summaryReport: state.Cash.summaryReport,
  loading: state.Cash.loading,
});

export default connect(mapStateToProps)(SummaryReport);
