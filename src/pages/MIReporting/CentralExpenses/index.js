import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Row, Col } from "reactstrap";
import Select from "react-select";
import { fetchCentralExpensesMonthly } from "../../../store/features/miReporting/miReportingSlice";

const headerStyle = {
  border: "1px solid #cfd8e3",
  background: "#004d00",
  color: "white",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  zIndex: 2,
  padding: "2px 4px",
};

const cellStyle = (idx) => ({
  border: "1px solid #d6dde8",
  background: idx % 2 === 0 ? "#f8fafc" : "#fff",
  whiteSpace: "nowrap",
  padding: "1px 4px",
});

const totalCellStyle = {
  border: "1px solid #9bbcf3",
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "1px 4px",
};

const CentralExpensesTable = ({ title, totalKey, paybleKey, data, loading, error }) => {
  const [selectedCenter, setSelectedCenter] = useState("ALL");

  const centerOptions = useMemo(() => [
    { value: "ALL", label: "All Centers" },
    ...[...new Set(data.map((item) => item.center_name))].filter(Boolean).sort().map((center) => ({
      value: center,
      label: center,
    })),
  ], [data]);

  const filteredData = useMemo(() => {
    if (selectedCenter === "ALL") return data;
    return data.filter((item) => item.center_name === selectedCenter);
  }, [data, selectedCenter]);

  const months = useMemo(() => {
    return Array.from(new Set(filteredData.map((item) => item.month))).sort(
      (a, b) => new Date(b) - new Date(a)
    );
  }, [filteredData]);

  const categories = useMemo(() => {
    return Array.from(new Set(filteredData.map((item) => item.category))).sort();
  }, [filteredData]);

  const pivot = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      if (!map[item.category]) map[item.category] = {};
      if (!map[item.category][item.month]) {
        map[item.category][item.month] = {
          total_amount: 0,
          payble_amount: 0,
          total_amount_mtd: 0,
          payble_amount_mtd: 0,
        };
      }
      const entry = map[item.category][item.month];
      entry.total_amount += item.total_amount ?? 0;
      entry.payble_amount += item.payble_amount ?? 0;
      entry.total_amount_mtd += item.total_amount_mtd ?? 0;
      entry.payble_amount_mtd += item.payble_amount_mtd ?? 0;
    });
    return map;
  }, [filteredData]);

  const getValue = (category, month, key) => pivot[category]?.[month]?.[key] ?? 0;

  const totals = useMemo(() => {
    const result = {};
    months.forEach((month) => {
      result[month] = {
        [totalKey]: categories.reduce((sum, category) => sum + getValue(category, month, totalKey), 0),
        [paybleKey]: categories.reduce((sum, category) => sum + getValue(category, month, paybleKey), 0),
      };
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, months, pivot, totalKey, paybleKey]);

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0">{title}</h6>
      </div>

      <Row className="g-2 align-items-center mb-3">
        <Col xs="auto">
          <Select
            value={centerOptions.find((o) => o.value === selectedCenter) || centerOptions[0]}
            onChange={(opt) => setSelectedCenter(opt.value)}
            options={centerOptions}
            placeholder="Center..."
            styles={{ container: (b) => ({ ...b, minWidth: 200 }) }}
          />
        </Col>
      </Row>

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
                style={{ borderCollapse: "collapse", fontSize: "0.62rem", width: "max-content" }}
              >
                <thead>
                  <tr>
                    <th rowSpan={2} className="text-start fw-bold" style={{ ...headerStyle, minWidth: 120, position: "sticky", left: 0, zIndex: 3 }}>
                      Category
                    </th>
                    {months.map((month) => (
                      <th key={month} colSpan={2} className="text-center fw-bold" style={headerStyle}>
                        {month}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {months.map((month) => (
                      <React.Fragment key={month}>
                        <th className="text-center fw-bold" style={{ ...headerStyle, minWidth: 65 }}>
                          Total Amount
                        </th>
                        <th className="text-center fw-bold" style={{ ...headerStyle, minWidth: 65 }}>
                          Payble Amount
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    <>
                      {categories.map((category, idx) => (
                        <tr key={category}>
                          <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}>
                            {category}
                          </td>
                          {months.map((month) => (
                            <React.Fragment key={month}>
                              <td className="text-center px-1 py-1" style={cellStyle(idx)}>
                                {getValue(category, month, totalKey)}
                              </td>
                              <td className="text-center px-1 py-1" style={cellStyle(idx)}>
                                {getValue(category, month, paybleKey)}
                              </td>
                            </React.Fragment>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", position: "sticky", left: 0, zIndex: 1 }}>
                          Total
                        </td>
                        {months.map((month) => (
                          <React.Fragment key={month}>
                            <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
                              {totals[month]?.[totalKey] ?? 0}
                            </td>
                            <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
                              {totals[month]?.[paybleKey] ?? 0}
                            </td>
                          </React.Fragment>
                        ))}
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={months.length * 2 + 1} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
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

const CentralExpenses = () => {
  const dispatch = useDispatch();
  const { centralExpensesMonthly, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const data = useMemo(() => centralExpensesMonthly?.data || [], [centralExpensesMonthly]);

  useEffect(() => {
    dispatch(fetchCentralExpensesMonthly({ centerAccess }));
  }, [dispatch, centerAccess]);

  document.title = "Central Expenses";

  return (
    <div className="mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <div className="p-3 d-flex align-items-center">
        <i className="bx bx-money fs-1 me-3"></i>
        <h6 className="text-truncate mb-0 fs-18">Central Expenses</h6>
      </div>

      <div className="px-3 pb-3">
        <CentralExpensesTable
          title="MOM"
          totalKey="total_amount"
          paybleKey="payble_amount"
          data={data}
          loading={loading}
          error={error}
        />
        <CentralExpensesTable
          title="MTD"
          totalKey="total_amount_mtd"
          paybleKey="payble_amount_mtd"
          data={data}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default CentralExpenses;
