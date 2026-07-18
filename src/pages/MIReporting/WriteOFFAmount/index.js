import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import { fetchWriteOffAmount } from "../../../store/features/miReporting/miReportingSlice";

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

const WriteOffTable = ({ title, months, centers, getValue, totals }) => (
  <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10 }}>
    <CardBody className="p-0">
      <h6 className="px-2 pt-2 mb-2">{title}</h6>
      <div style={{ overflowX: "auto" }}>
        <Table
          className="mb-0"
          style={{ borderCollapse: "collapse", fontSize: "0.8rem", width: "100%" }}
        >
          <thead>
            <tr>
              <th className="text-center fw-bold px-1 py-1" style={headerStyle}>
                Center Name
              </th>
              {months.map((month) => (
                <th key={month} className="text-center fw-bold px-1 py-1" style={headerStyle}>
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
                    <td className="px-1 py-1 fw-semibold" style={cellStyle(idx)}>
                      {center}
                    </td>
                    {months.map((month) => (
                      <td key={month} className="text-center px-1 py-1" style={cellStyle(idx)}>
                        {getValue(center, month)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black" }}>
                    Total
                  </td>
                  {months.map((month) => (
                    <td key={month} className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
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
    </CardBody>
  </Card>
);

const WriteOFFAmount = () => {
  const dispatch = useDispatch();
  const { writeOffAmount, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const data = writeOffAmount?.data;

  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchWriteOffAmount({ centerAccess }));
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
    pivot[center]?.[month]?.write_off_amount ?? 0;

  const getMtdValue = (center, month) =>
    pivot[center]?.[month]?.write_off_amount_mtd ?? 0;

  const totals = React.useMemo(() => {
    const totalObj = {};
    months.forEach((month) => {
      totalObj[month] = centers.reduce(
        (sum, center) => sum + (pivot[center]?.[month]?.write_off_amount ?? 0),
        0
      );
    });
    return totalObj;
  }, [centers, months, pivot]);

  const mtdTotals = React.useMemo(() => {
    const totalObj = {};
    months.forEach((month) => {
      totalObj[month] = centers.reduce(
        (sum, center) => sum + (pivot[center]?.[month]?.write_off_amount_mtd ?? 0),
        0
      );
    });
    return totalObj;
  }, [centers, months, pivot]);

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

  document.title = "Write Off Amount";

  return (
    <div className="mt-4 mt-sm-0">
      <div className="p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bx bx-money fs-1 me-3"></i>
          <h6 className="text-truncate mb-0 fs-18">Write Off Amount</h6>
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
          filename="write-off-amount.csv"
          headers={csvHeaders}
          className="d-none"
          ref={csvRef}
        />
      </div>

      <div className="px-3 pb-3">
        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <p className="mt-2 text-muted mb-0">Loading data...</p>
          </div>
        )}

        {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

        {!loading && !error && (
          <Row className="g-3">
            <Col lg={6}>
              <WriteOffTable
                title="Write Off Amount"
                months={months}
                centers={centers}
                getValue={getValue}
                totals={totals}
              />
            </Col>
            <Col lg={6}>
              <WriteOffTable
                title="Write Off Amount - MTD"
                months={months}
                centers={centers}
                getValue={getMtdValue}
                totals={mtdTotals}
              />
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default WriteOFFAmount;
