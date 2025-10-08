import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Input,
  Spinner,
  Button,
  Badge,
} from "reactstrap";
import { TabPane } from "reactstrap";
import DataTable from "react-data-table-component";
import { downloadFile } from "../../../Components/Common/downloadFile";
import { connect, useDispatch } from "react-redux";
import { endOfDay, format, startOfDay } from "date-fns";
import CenterDropdown from "../../Report/Components/Doctor/components/CenterDropDown";
import Header from "../../Report/Components/Header";
import { getDetailedReport } from "../../../store/features/cashManagement/cashSlice";
import { ExpandableText } from "../../../Components/Common/ExpandableText";
import { capitalizeWords } from "../../../utils/toCapitalize";
import PropTypes from "prop-types";

const DetailedReport = ({
  centers,
  centerAccess,
  detailedReport,
  loading,
  activeTab,
  hasUserPermission,
  roles,
}) => {
  const dispatch = useDispatch();

  const centerOptions = centers
    ?.filter((c) => centerAccess.includes(c._id))
    .map((c) => ({
      _id: c._id,
      title: c.title,
    }));

  const [selectedCentersIds, setSelectedCentersIds] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

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

  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const columns = [
    {
      name: "Date",
      selector: (row) => format(new Date(row.date), "d MMM yyyy hh:mm a"),
      wrap: true,
    },
    {
      name: "Center",
      selector: (row) =>
        capitalizeWords(row.center?.title || row.center || "-"),
      wrap: true,
    },
    {
      name: "Type",
      selector: (row) => {
        const badgeStyle = {
          display: "inline-block",
          whiteSpace: "normal",   
          wordBreak: "break-word", 
        };
        if (row.transactionCategory === "BASEBALANCE") {
          return (
            <Badge color="warning" className="text-dark" style={badgeStyle}>
              BASE BALANCE
            </Badge>
          );
        } else if (row.transactionCategory === "SPENDING" || row.transactionCategory === "BANKDEPOSIT") {
          return (
            <Badge color="danger" style={badgeStyle}>
              {row.transactionCategory}
            </Badge>
          )
        }
        else if (row.transactionCategory === "RECEIPT" && row.source === "INTERNBILL") {
          return (
            <Badge color="success" style={badgeStyle}>
              INTERN RECEIPT
            </Badge>
          );
        } else if (row.transactionCategory === "INVOICE" & row.transactionType === "OPD") {
          return (
            <Badge color="success" style={badgeStyle}>
              OPD
            </Badge>
          );
        } else if (row.transactionCategory === "ADVANCE_PAYMENT") {
          return (
            <Badge color="success" style={badgeStyle}>
              IPD
            </Badge>
          );
        } else if (row.transactionCategory === "DEPOSIT") {
          return (
            <Badge color="success" style={badgeStyle}>
              DEPOSIT-OLIVE
            </Badge>
          )
        }
        else {
          return "-";
        }
      },
      wrap: true,
    },
    {
      name: "Attachment",
      selector: (row) => row.attachment,
      cell: (row) =>
        row.attachment ? (
          <p
            onClick={() => downloadFile(row.attachment)}
            className="text-primary text-decoration-underline cursor-pointer"
          >
            {row.attachment.originalName}
          </p>
        ) : (
          "-"
        ),
      wrap: true,
    },
    {
      name: "Amount",

      cell: (row) => (
        <span>
          ₹
          {row.amount?.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}
        </span>
      ),
      wrap: true,
    },
    {
      name: "Summary",
      selector: (row) => <ExpandableText text={capitalizeWords(row.summary)} />,
      wrap: true,
    },
    {
      name: "Comments",
      selector: (row) => (
        <ExpandableText text={capitalizeWords(row.comments)} />
      ),
      wrap: true,
    },
  ];

  useEffect(() => {
    if (activeTab === "detail" && hasUserPermission) {
      dispatch(
        getDetailedReport({
          page,
          limit,
          transactionType: selectedTransactionType,
          centers: selectedCentersIds,
          startDate: reportDate.start.toISOString(),
          endDate: reportDate.end.toISOString(),
        })
      );
    }
  }, [
    page,
    limit,
    selectedCentersIds,
    selectedTransactionType,
    reportDate,
    dispatch,
    activeTab,
    roles,
  ]);

  const handleFilterChange = (filterType, value) => {
    setPage(1);
    if (filterType === "transactionType") {
      setSelectedTransactionType(value);
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
              value={selectedTransactionType}
              onChange={(e) =>
                handleFilterChange("transactionType", e.target.value)
              }
            >
              <option value="">All</option>
              <option value="BASEBALANCE">Base Balances</option>
              <option value="BANKDEPOSIT">Bank Deposits</option>
              <option value="SPENDING">Spendings</option>
              <option value="IPD">IPD Payments</option>
              <option value="DEPOSIT-OLIVE">Deposit-Olive payments</option>
              <option value="OPD">OPD Payments</option>
              <option value="INTERN">Intern Payments</option>
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

      <Card className="mt-4">
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
  );
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
  detailedReport: state.Cash.detailedReport,
  loading: state.Cash.loading,
});

export default connect(mapStateToProps)(DetailedReport);
