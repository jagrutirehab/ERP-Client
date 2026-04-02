import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Button,
  Input,
  Label,
  Badge,
  Spinner,
  Collapse,
  Card,
  CardBody,
} from "reactstrap";
import DataTable from "react-data-table-component";
import { format } from "date-fns";
import { getTallyPendingUpdates } from "../../helpers/backend_helper";

const VOUCHER_TYPE_CONFIG = {
  INVOICE: { label: "Invoice", color: "primary", icon: "bx-receipt" },
  REFUND: { label: "Refund", color: "warning", icon: "bx-undo" },
  ADVANCE_PAYMENT: {
    label: "Advance Payment",
    color: "info",
    icon: "bx-wallet",
  },
  DEPOSIT: { label: "Deposit", color: "success", icon: "bx-money" },
  CENTRAL_PAYMENT: {
    label: "Central Payment",
    color: "danger",
    icon: "bx-building",
  },
  CASH: { label: "Cash", color: "secondary", icon: "bx-coin" },
};

const TallyPendingUpdates = ({ centerOptions, initialCenters }) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [centerId, setCenterId] = useState("all");
  const [expandedTypes, setExpandedTypes] = useState({});

  const fetchPendingUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (centerId !== "all") params.centerId = centerId;
      const response = await getTallyPendingUpdates(params);
      if (response.success) {
        setData(response.data || []);
        setTotal(response.total || 0);
        // Auto-expand all types
        const expanded = {};
        (response.data || []).forEach((group) => {
          expanded[group.type] = true;
        });
        setExpandedTypes(expanded);
      }
    } catch (error) {
      console.error("Failed to fetch pending updates:", error);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchPendingUpdates();
  }, [fetchPendingUpdates]);

  const toggleType = (type) => {
    setExpandedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Extract unique dates hint per group
  const getDateHint = (records) => {
    const dateSet = new Set();
    const centerSet = new Set();
    records.forEach((r) => {
      if (r.sourceDate) {
        dateSet.add(format(new Date(r.sourceDate), "dd MMM yyyy"));
      }
      if (r.centerTitle && r.centerTitle !== "N/A") {
        centerSet.add(r.centerTitle);
      }
    });
    const dates = [...dateSet].sort().join(", ");
    const centers = [...centerSet].sort().join(", ");
    return { dates, centers };
  };

  const columns = [
    {
      name: "Invoice / Voucher No",
      selector: (row) => row.invoiceNo,
      sortable: false,
      style: { fontWeight: "600" },
    },
    {
      name: "Party / Identifier",
      selector: (row) => row.partyIdentifier || "N/A",
      sortable: false,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: false,
      cell: (row) => (
        <span className="fw-semibold">
          {"\u20B9"}
          {row.amount?.toLocaleString()}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Bill Date",
      selector: (row) => row.sourceDate,
      sortable: false,
      width: "130px",
      cell: (row) =>
        row.sourceDate
          ? format(new Date(row.sourceDate), "dd MMM yyyy")
          : row.entryDate || "N/A",
    },
    {
      name: "Center",
      selector: (row) => row.centerTitle,
      sortable: false,
    },
    {
      name: "Last Synced",
      selector: (row) => row.lastSyncedAt,
      sortable: false,
      width: "160px",
      cell: (row) => (
        <div>
          <div className="font-size-12">
            {format(new Date(row.lastSyncedAt), "dd MMM yyyy")}
          </div>
          <small className="text-muted">
            {format(new Date(row.lastSyncedAt), "hh:mm a")}
          </small>
        </div>
      ),
    },
    {
      name: "Last updated at",
      selector: (row) => row.previousUpdatedAt,
      sortable: false,
      width: "160px",
      cell: (row) => (
        <div>
          <div className="font-size-12">
            {format(new Date(row.previousUpdatedAt), "dd MMM yyyy")}
          </div>
          <small className="text-muted">
            {format(new Date(row.previousUpdatedAt), "hh:mm a")}
          </small>
        </div>
      ),
    },
    {
      name: "Modified",
      selector: (row) => row.sourceUpdatedAt,
      sortable: false,
      width: "160px",
      cell: (row) => (
        <div>
          <div className="font-size-12 text-danger">
            {format(new Date(row.sourceUpdatedAt), "dd MMM yyyy")}
          </div>
          <small className="text-muted">
            {format(new Date(row.sourceUpdatedAt), "hh:mm a")}
          </small>
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: "600",
        backgroundColor: "#f8f9fa",
        color: "#495057",
      },
    },
    cells: {
      style: { fontSize: "13px" },
    },
  };

  return (
    <div className="mt-4">
      {/* Filters */}
      <Row className="mb-3 align-items-end g-2">
        <Col md={3}>
          <Label className="form-label fw-semibold">Center</Label>
          <Input
            type="select"
            value={centerId}
            onChange={(e) => setCenterId(e.target.value)}
          >
            <option value="all">All Centers</option>
            {centerOptions?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Input>
        </Col>
        <Col md={2}>
          <Button
            color="light"
            onClick={fetchPendingUpdates}
            disabled={loading}
            className="w-100"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <i className="bx bx-refresh me-1"></i>
            )}
            Refresh
          </Button>
        </Col>
        <Col className="text-end">
          {!loading && (
            <span className="text-muted font-size-13">
              {total} record{total !== 1 ? "s" : ""} pending update
            </span>
          )}
        </Col>
      </Row>

      {/* Summary Cards */}
      {!loading && data.length > 0 && (
        <Row className="mb-3 g-3">
          {data.map((group) => {
            const config = VOUCHER_TYPE_CONFIG[group.type] || {
              label: group.type,
              color: "dark",
              icon: "bx-file",
            };
            return (
              <Col key={group.type} xs={6} md={4} lg={2}>
                <Card
                  className="border mb-0 shadow-none cursor-pointer"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleType(group.type)}
                >
                  <CardBody className="p-3 text-center">
                    <i
                      className={`bx ${config.icon} font-size-20 text-${config.color}`}
                    ></i>
                    <h5 className="mb-1 mt-1">{group.count}</h5>
                    <p className="text-muted mb-0 font-size-12">
                      {config.label}
                    </p>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* No data state */}
      {!loading && data.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bx bx-check-circle font-size-48 d-block mb-2 text-success"></i>
          <h6>All synced records are up to date</h6>
          <p className="font-size-13 mb-0">
            No bills or payments have been modified since their last Tally sync.
          </p>
        </div>
      )}

      {/* Expandable sections per type */}
      {data.map((group) => {
        const config = VOUCHER_TYPE_CONFIG[group.type] || {
          label: group.type,
          color: "dark",
          icon: "bx-file",
        };
        const isOpen = expandedTypes[group.type];
        const hint = getDateHint(group.records);

        return (
          <div key={group.type} className="mb-3">
            <div
              className="d-flex align-items-center justify-content-between p-2 rounded"
              style={{
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
                border: "1px solid #e9ecef",
              }}
              onClick={() => toggleType(group.type)}
            >
              <div className="d-flex align-items-center">
                <i
                  className={`bx ${isOpen ? "bx-chevron-down" : "bx-chevron-right"} font-size-18 me-2`}
                ></i>
                <i
                  className={`bx ${config.icon} me-2 text-${config.color}`}
                ></i>
                <span className="fw-semibold font-size-14">{config.label}</span>
                <Badge color={config.color} className="ms-2">
                  {group.count}
                </Badge>
              </div>
            </div>

            <Collapse isOpen={isOpen}>
              <div className="border border-top-0">
                <DataTable
                  columns={columns}
                  data={group.records}
                  noHeader
                  dense
                  highlightOnHover
                  customStyles={customStyles}
                  noDataComponent={
                    <div className="py-3 text-muted">No records</div>
                  }
                />
              </div>
              {/* Date hint */}
              {/* {hint.dates && (
                <div
                  className="px-3 py-2 font-size-12"
                  style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderTop: "none",
                    borderRadius: "0 0 4px 4px",
                  }}
                >
                  <i className="bx bx-info-circle me-1"></i>
                  <strong>Run Update for:</strong> {hint.dates}
                  {hint.centers ? ` (${hint.centers})` : ""}
                </div>
              )} */}
            </Collapse>
          </div>
        );
      })}
    </div>
  );
};

export default TallyPendingUpdates;
