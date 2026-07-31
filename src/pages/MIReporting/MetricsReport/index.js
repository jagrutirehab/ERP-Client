import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { fetchMetricsReport } from "../../../store/features/miReporting/miReportingSlice";

const METRIC_GROUPS = [
  {
    label: "Payable Amount",
    category: "payble_amount",
    fields: [
    //   { key: "count", label: "Count" },
      { key: "payable_amount", label: "Payable Amount" },
    //   { key: "count_mtd", label: "Count" },
      { key: "payable_amount_mtd", label: "Payable Amount" },
    ],
  },
  {
    label: "Advance Payment",
    category: "advance_payment",
    fields: [
    //   { key: "advance_amount", label: "Advance Amount" },
    //   { key: "refund_amount", label: "Refund Amount" },
      { key: "net_amount", label: "Net Amount" },
    //   { key: "advance_amount_mtd", label: "Advance Amount" },
    //   { key: "refund_amount_mtd", label: "Refund Amount" },
      { key: "net_amount_mtd", label: "Net Amount" },
    ],
  },
  {
    label: "OPD Payment",
    category: "opd_payment",
    fields: [
    //   { key: "count", label: "Count" },
      { key: "total_amount", label: "Total Amount" },
    //   { key: "count_mtd", label: "Count" },
      { key: "total_amount_mtd", label: "Total Amount" },
    ],
  },
  {
    label: "Admitted Patients",
    category: "admitted_patients",
    fields: [
      { key: "count", label: "Count" },
      { key: "count_mtd", label: "Count" },
    ],
  },
  {
    label: "Discharged Patients",
    category: "discharged_patients",
    fields: [
      { key: "count", label: "Count" },
      { key: "count_mtd", label: "Count" },
    ],
  },
  {
    label: "Repeat Patients",
    category: "repeat_patients",
    fields: [
      { key: "count", label: "Count" },
      { key: "count_mtd", label: "Count" },
    ],
  },
  {
    label: "Remaining Patients",
    category: "remaining_patients",
    fields: [
    //   { key: "admitted", label: "Admitted" },
    //   { key: "discharged", label: "Discharged" },
    //   { key: "opening_balance", label: "Opening Balance" },
      { key: "closing_balance", label: "Closing Balance" },
    //   { key: "admitted_mtd", label: "Admitted" },
    //   { key: "discharged_mtd", label: "Discharged" },
      { key: "closing_balance_mtd", label: "Closing Balance" },
    ],
  },
  {
    label: "New Patients",
    category: "new_patients",
    fields: [
      { key: "count" },
      { key: "count_mtd" },
    ],
  },
];

const BASE_OPTIONS = METRIC_GROUPS.flatMap((group) =>
  group.fields
    .filter((field) => !field.key.endsWith("_mtd"))
    .map((field) => ({
      value: `${group.category}.${field.key}`,
      label: `${group.label}`,
    }))
);

const toMtdPath = (path) => {
  const [category, field] = path.split(".");
  return `${category}.${field}_mtd`;
};

const headerStyle = {
  border: "1px solid #cfd8e3",
  background: "#004d00",
  color: "white",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  zIndex: 2,
};

const cellStyle = (idx) => ({
  border: "1px solid #d6dde8",
  background: idx % 2 === 0 ? "#f8fafc" : "#fff",
  whiteSpace: "nowrap",
});

const totalCellStyle = {
  border: "1px solid #9bbcf3",
  background: "#dbeafe",
  color: "#1d4ed8",
};

const readValue = (record, path) => {
  const [category, field] = path.split(".");
  return record?.[category]?.[field] ?? 0;
};

const ROUNDED_CATEGORIES = ["payble_amount", "advance_payment", "opd_payment"];

const MetricSection = ({ title, path, centers, months, pivot, loading, error }) => {
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  const shouldRound = ROUNDED_CATEGORIES.includes(path.split(".")[0]);
  const formatValue = (value) => (shouldRound ? Number(value ?? 0).toFixed(2) : value ?? 0);

  const getValue = (center, month) => readValue(pivot[center]?.[month], path);

  const totals = React.useMemo(() => {
    const totalObj = {};
    months.forEach((month) => {
      totalObj[month] = centers.reduce(
        (sum, center) => sum + readValue(pivot[center]?.[month], path),
        0
      );
    });
    return totalObj;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centers, months, pivot, path]);

  const prepareCsvData = () => {
    setCsvLoading(true);

    const csvHeaders = ["Center", ...months];
    const formatted = centers.map((center) => [
      center,
      ...months.map((month) => formatValue(getValue(center, month))),
    ]);
    const totalRow = ["Total", ...months.map((month) => formatValue(totals[month] ?? 0))];

    setCsvData([csvHeaders, ...formatted, totalRow]);

    setTimeout(() => {
      csvRef.current.link.click();
      setCsvLoading(false);
    }, 100);
  };

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0">{title}</h6>
        <Button
          color="info"
          size="sm"
          onClick={prepareCsvData}
          disabled={csvLoading || loading || centers.length === 0}
        >
          {csvLoading ? "Preparing CSV..." : "Export CSV"}
        </Button>
        <CSVLink
          data={csvData || []}
          filename={`metrics-report-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`}
          className="d-none"
          ref={csvRef}
        />
      </div>

      <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
        <CardBody className="p-0">
          {loading && (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2 text-muted mb-0">Loading data...</p>
            </div>
          )}

          {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

          {!loading && !error && (
            <div style={{ overflowX: "auto" }}>
              <Table
                className="mb-0"
                style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
              >
                <thead>
                  <tr>
                    <th className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 130, position: "sticky", left: 0, zIndex: 3 }}>
                      Center Name
                    </th>
                    {months.map((month) => (
                      <th key={month} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 85 }}>
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {centers.length > 0 ? (
                    <>
                      {centers.map((center, idx) => (
                        <tr key={center}>
                          <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}>
                            {center}
                          </td>
                          {months.map((month) => (
                            <td key={month} className="text-center px-1 py-1" style={cellStyle(idx)}>
                              {formatValue(getValue(center, month))}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", position: "sticky", left: 0, zIndex: 1 }}>
                          Total
                        </td>
                        {months.map((month) => (
                          <td key={month} className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
                            {formatValue(totals[month] ?? 0)}
                          </td>
                        ))}
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={months.length + 1} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const MODE_OPTIONS = [
  { value: "MOM", label: "MOM" },
  { value: "MTD", label: "MTD" },
];

const MetricsReport = () => {
  const dispatch = useDispatch();
  const { metricsReport, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const data = metricsReport?.data;

  const [mode, setMode] = useState("MOM");

  useEffect(() => {
    dispatch(fetchMetricsReport({ centerAccess }));
  }, [dispatch, centerAccess]);

  const months = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return Array.from(new Set(data.map((item) => item.month))).sort(
      (a, b) => new Date(b) - new Date(a)
    );
  }, [data]);

  const centers = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return Array.from(new Set(data.map((item) => item.center_name))).sort();
  }, [data]);

  const pivot = React.useMemo(() => {
    const map = {};
    (data || []).forEach((item) => {
      if (!map[item.center_name]) map[item.center_name] = {};
      map[item.center_name][item.month] = item;
    });
    return map;
  }, [data]);

  document.title = "Metrics Report";

  return (
    <div className="mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <div className="p-3 d-flex align-items-center">
        <i className="bx bx-line-chart fs-1 me-3"></i>
        <h6 className="text-truncate mb-0 fs-18">Metrics Report</h6>
      </div>

      <div className="px-3 pb-3">
        <Row className="g-2 align-items-center mb-3">
          <Col xs="auto">
            <Select
              value={MODE_OPTIONS.find((o) => o.value === mode)}
              onChange={(opt) => setMode(opt.value)}
              options={MODE_OPTIONS}
              placeholder="Select mode..."
              styles={{ container: (b) => ({ ...b, minWidth: 160 }) }}
            />
          </Col>
        </Row>

        {BASE_OPTIONS.map((option) => (
          <MetricSection
            key={option.value}
            title={option.label}
            path={mode === "MTD" ? toMtdPath(option.value) : option.value}
            centers={centers}
            months={months}
            pivot={pivot}
            loading={loading}
            error={error}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricsReport;
