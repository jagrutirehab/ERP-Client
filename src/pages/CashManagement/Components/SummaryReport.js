import { useEffect } from "react";
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
} from "reactstrap";
import { getSummaryReport } from "../../../store/features/cashManagement/cashSlice";
import PropTypes from "prop-types";

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

  useEffect(() => {
    if (activeTab === "summary" && hasUserPermission) {
      dispatch(getSummaryReport({ centers: centerAccess }));
    }
  }, [centerAccess, dispatch, activeTab, roles]);

  if (loading) {
    return (
      <TabPane tabId="summary" className="text-center py-5">
        <Spinner color="primary" />
      </TabPane>
    );
  }

  if (!summaryReport || summaryReport?.length === 0) {
    return (
      <TabPane tabId="summary" className="text-center py-5">
        <p className="text-muted">
          No summary data available for your centers.
        </p>
      </TabPane>
    );
  }

  return (
    <TabPane tabId="summary">
      <Row>
        {summaryReport?.map((data) => (
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
    </TabPane>
  );
};

SummaryReport.prototype = {
  centerAccess: PropTypes.array,
  summaryReport: PropTypes.array,
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
