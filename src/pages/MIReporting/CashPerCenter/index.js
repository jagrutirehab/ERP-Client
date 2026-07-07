import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { fetchCashPerCenter } from "../../../store/features/miReporting/miReportingSlice";

const INFLOW_FIELDS = [
  "advance_payment_cash",
  "opd_cash",
  "intern_cash",
  "ipd_deposit_cash",
];

const OUTFLOW_FIELDS = ["spending", "bank_deposit"];

const toLabel = (key) =>
  key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const ALL_REPORT_OPTIONS = [
  ...INFLOW_FIELDS.map((key) => ({ value: key, label: toLabel(key) })),
  ...OUTFLOW_FIELDS.map((key) => ({ value: key, label: toLabel(key) })),
  { value: "closing_balance", label: "Remaining Balance" },
];

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

const CashPerCenter = () => {
  const dispatch = useDispatch();
  const { cashPerCenter, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const data = cashPerCenter?.data;

  const [selectedReport, setSelectedReport] = useState("closing_balance");
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchCashPerCenter({ centerAccess }));
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

  const getValue = (center, month) =>
    pivot[center]?.[month]?.[selectedReport] ?? 0;

  const totals = React.useMemo(() => {
    const totalObj = {};
    months.forEach((month) => {
      totalObj[month] = centers.reduce(
        (sum, center) => sum + (pivot[center]?.[month]?.[selectedReport] ?? 0),
        0
      );
    });
    return totalObj;
  }, [centers, months, pivot, selectedReport]);

  const csvHeaders = React.useMemo(() => {
    const headers = [
      { label: "#", key: "id" },
      { label: "Center", key: "center" },
    ];

    months.forEach((month) => {
      headers.push({ label: month, key: month });
    });

    return headers;
  }, [months]);

  const prepareCsvData = () => {
    setCsvLoading(true);

    const formatted = centers.map((center, idx) => {
      const row = { id: idx + 1, center };
      months.forEach((month) => {
        row[month] = getValue(center, month);
      });
      return row;
    });

    const totalRow = { id: "", center: "Total" };
    months.forEach((month) => {
      totalRow[month] = totals[month] ?? 0;
    });

    setCsvData([...formatted, totalRow]);

    setTimeout(() => {
      csvRef.current.link.click();
      setCsvLoading(false);
    }, 100);
  };

  const selectedReportLabel =
    ALL_REPORT_OPTIONS.find((o) => o.value === selectedReport)?.label || "";

  return (
    <div className="mt-4 mt-sm-0">
      <div className="p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bx bx-wallet fs-1 me-3"></i>
          <h6 className="text-truncate mb-0 fs-18">
            Cash Per Center - {selectedReportLabel}
          </h6>
        </div>

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
          filename="cash-per-center.csv"
          headers={csvHeaders}
          className="d-none"
          ref={csvRef}
        />
      </div>

      <div className="px-3 pb-3">
        <Row className="g-2 align-items-center mb-3">
          <Col xs="auto">
            <Select
              value={ALL_REPORT_OPTIONS.find(
                (o) => o.value === selectedReport
              )}
              onChange={(opt) => setSelectedReport(opt.value)}
              options={ALL_REPORT_OPTIONS}
              placeholder="Select data..."
              styles={{ container: (b) => ({ ...b, minWidth: 200 }) }}
            />
          </Col>
        </Row>

        <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10 }}>
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
                  style={{ borderCollapse: "collapse", fontSize: "0.78rem", width: "100%" }}
                >
                  <thead>
                    <tr>
                      <th className="text-center fw-bold px-2 py-1" style={headerStyle}>
                        Center Name
                      </th>
                      {months.map((month) => (
                        <th key={month} className="text-center fw-bold px-2 py-1" style={headerStyle}>
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
                            <td className="px-2 py-1 fw-semibold" style={cellStyle(idx)}>
                              {center}
                            </td>
                            {months.map((month) => (
                              <td key={month} className="text-center px-2 py-1" style={cellStyle(idx)}>
                                {getValue(center, month)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr>
                          <td className="px-2 py-1 fw-bold" style={{ ...totalCellStyle, color: "black" }}>
                            Total
                          </td>
                          {months.map((month) => (
                            <td key={month} className="text-center px-2 py-1 fw-bold" style={totalCellStyle}>
                              {totals[month] ?? 0}
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
    </div>
  );
};

export default CashPerCenter;
