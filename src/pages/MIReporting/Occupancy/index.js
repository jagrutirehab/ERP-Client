import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Row, Col } from "reactstrap";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import "flatpickr/dist/flatpickr.css";
import { fetchOccupancyMonthly, fetchAdmissionDischargeDaily } from "../../../store/features/miReporting/miReportingSlice";

const TABLES = [
  { key: "occupancy", label: "Occupancy", isPercentage: false },
  { key: "occupied_percentage", label: "Occupied %", isPercentage: true },
  { key: "unoccupied_percentage", label: "Unoccupied %", isPercentage: true },
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

const OccupancyTable = ({ title, fieldKey, isPercentage, centers, months, pivot }) => {
  const summary = React.useMemo(() => {
    const result = {};
    months.forEach((month) => {
      const values = centers
        .map((center) => pivot[center]?.[month]?.[fieldKey])
        .filter((v) => v !== undefined && v !== null);

      if (values.length === 0) {
        result[month] = 0;
        return;
      }

      const sum = values.reduce((acc, v) => acc + v, 0);
      result[month] = isPercentage ? sum / values.length : sum;
    });
    return result;
  }, [centers, months, pivot, fieldKey, isPercentage]);

  const formatValue = (value) =>
    isPercentage ? `${Number(value ?? 0).toFixed(2)}%` : value ?? 0;

  const totalBeds = centers.reduce(
    (sum, center) => sum + (Number(pivot[center]?.beds) || 0),
    0
  );

  return (
    <div className="mb-4">
      <h6 className="mb-2">{title}</h6>
      <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
        <CardBody className="p-0">
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
                  <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 70 }}>
                    Beds
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
                        <td className="text-center px-1 py-1" style={cellStyle(idx)}>
                          {pivot[center]?.beds ?? ""}
                        </td>
                        {months.map((month) => (
                          <td key={month} className="text-center px-1 py-1" style={cellStyle(idx)}>
                            {formatValue(pivot[center]?.[month]?.[fieldKey])}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", position: "sticky", left: 0, zIndex: 1 }}>
                        {isPercentage ? "Average" : "Total"}
                      </td>
                      <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>{totalBeds}</td>
                      {months.map((month) => (
                        <td key={month} className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
                          {formatValue(summary[month])}
                        </td>
                      ))}
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={months.length + 2} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const useAdmissionDischargeRange = (centerAccess, defaultStartDate, defaultEndDate) => {
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState(defaultStartDate || moment().startOf("month").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(defaultEndDate || moment().format("YYYY-MM-DD"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    dispatch(fetchAdmissionDischargeDaily({ centerAccess, startDate, endDate }))
      .unwrap()
      .then((res) => {
        if (!active) return;
        setData(res.payload?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err || "Failed to fetch data");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, centerAccess, startDate, endDate]);

  const pivot = React.useMemo(() => {
    const map = {};
    (data || []).forEach((item) => {
      map[item.center_name] = item;
    });
    return map;
  }, [data]);

  const centers = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return Array.from(new Set(data.map((item) => item.center_name))).sort();
  }, [data]);

  return { startDate, setStartDate, endDate, setEndDate, pivot, centers, loading, error };
};

const pctChange = (current, previous) => {
  const prev = Number(previous) || 0;
  const curr = Number(current) || 0;
  if (!prev) return null;
  return ((curr - prev) / prev) * 100;
};

const formatPct = (value) => (value === null ? "-" : `${value.toFixed(2)}%`);

const DatePickerField = ({ label, value, onChange }) => (
  <Col xs="auto">
    <div className="small text-muted mb-1">{label}</div>
    <Flatpickr
      className="form-control"
      value={value}
      options={{ dateFormat: "Y-m-d", maxDate: moment().subtract(1, "day").toDate() }}
      onChange={([date]) => date && onChange(moment(date).format("YYYY-MM-DD"))}
      placeholder="Select date..."
      style={{ width: 130 }}
    />
  </Col>
);

const AdmissionDischargeComparison = ({ centerAccess }) => {
  const period1 = useAdmissionDischargeRange(
    centerAccess,
    moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
    moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD")
  );
  const period2 = useAdmissionDischargeRange(
    centerAccess,
    undefined,
    moment().subtract(1, "day").format("YYYY-MM-DD")
  );

  const centers = React.useMemo(() => {
    return Array.from(new Set([...period1.centers, ...period2.centers])).sort();
  }, [period1.centers, period2.centers]);

  const loading = period1.loading || period2.loading;
  const error = period1.error || period2.error;

  const totals = React.useMemo(() => {
    const sum = (pivot, key) =>
      centers.reduce((acc, center) => acc + (Number(pivot[center]?.[key]) || 0), 0);
    return {
      admitted1: sum(period1.pivot, "admitted"),
      discharged1: sum(period1.pivot, "discharged"),
      admitted2: sum(period2.pivot, "admitted"),
      discharged2: sum(period2.pivot, "discharged"),
    };
  }, [centers, period1.pivot, period2.pivot]);

  return (
    <div className="mb-4">
      <Row className="g-4 mb-3">
        <Col xs="auto">
          <div className="fw-semibold mb-1">Period 1</div>
          <Row className="g-2">
            <DatePickerField label="Start Date" value={period1.startDate} onChange={period1.setStartDate} />
            <DatePickerField label="End Date" value={period1.endDate} onChange={period1.setEndDate} />
          </Row>
        </Col>
        <Col xs="auto">
          <div className="fw-semibold mb-1">Period 2</div>
          <Row className="g-2">
            <DatePickerField label="Start Date" value={period2.startDate} onChange={period2.setStartDate} />
            <DatePickerField label="End Date" value={period2.endDate} onChange={period2.setEndDate} />
          </Row>
        </Col>
      </Row>

      {loading && (
        <div className="text-center py-4">
          <Spinner color="primary" />
          <p className="mt-2 text-muted mb-0">Loading data...</p>
        </div>
      )}

      {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

      {!loading && !error && (
        <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
          <CardBody className="p-0">
            <div style={{ overflowX: "auto" }}>
              <Table
                className="mb-0"
                style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
              >
                <thead>
                  <tr>
                    <th rowSpan={2} className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 130, position: "sticky", left: 0, zIndex: 3 }}>
                      Center Name
                    </th>
                    <th colSpan={2} className="text-center fw-bold px-1 py-1" style={headerStyle}>Period 1</th>
                    <th colSpan={2} className="text-center fw-bold px-1 py-1" style={headerStyle}>Period 2</th>
                    <th colSpan={2} className="text-center fw-bold px-1 py-1" style={headerStyle}>Change</th>
                  </tr>
                  <tr>
                    <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>Admitted</th>
                    <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>Discharged</th>
                    <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>Admitted</th>
                    <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>Discharged</th>
                    <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>Admitted %</th>
                    <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>Discharged %</th>
                  </tr>
                </thead>
                <tbody>
                  {centers.length > 0 ? (
                    <>
                      {centers.map((center, idx) => {
                        const admitted1 = period1.pivot[center]?.admitted ?? 0;
                        const discharged1 = period1.pivot[center]?.discharged ?? 0;
                        const admitted2 = period2.pivot[center]?.admitted ?? 0;
                        const discharged2 = period2.pivot[center]?.discharged ?? 0;
                        return (
                          <tr key={center}>
                            <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}>
                              {center}
                            </td>
                            <td className="text-center px-1 py-1" style={cellStyle(idx)}>{admitted1}</td>
                            <td className="text-center px-1 py-1" style={cellStyle(idx)}>{discharged1}</td>
                            <td className="text-center px-1 py-1" style={cellStyle(idx)}>{admitted2}</td>
                            <td className="text-center px-1 py-1" style={cellStyle(idx)}>{discharged2}</td>
                            <td className="text-center px-1 py-1" style={cellStyle(idx)}>{formatPct(pctChange(admitted2, admitted1))}</td>
                            <td className="text-center px-1 py-1" style={cellStyle(idx)}>{formatPct(pctChange(discharged2, discharged1))}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", position: "sticky", left: 0, zIndex: 1 }}>
                          Total
                        </td>
                        <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>{totals.admitted1}</td>
                        <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>{totals.discharged1}</td>
                        <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>{totals.admitted2}</td>
                        <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>{totals.discharged2}</td>
                        <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>{formatPct(pctChange(totals.admitted2, totals.admitted1))}</td>
                        <td className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>{formatPct(pctChange(totals.discharged2, totals.discharged1))}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

const Occupancy = () => {
  const dispatch = useDispatch();
  const { occupancyMonthly, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const data = occupancyMonthly?.data;

  useEffect(() => {
    dispatch(fetchOccupancyMonthly({ centerAccess }));
  }, [dispatch, centerAccess]);

  const centers = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return Array.from(new Set(data.map((item) => item.center_name))).sort();
  }, [data]);

  const months = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const monthSet = new Set();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "center_name" && key !== "beds") monthSet.add(key);
      });
    });
    return Array.from(monthSet).sort((a, b) => new Date(b) - new Date(a));
  }, [data]);

  const pivot = React.useMemo(() => {
    const map = {};
    (data || []).forEach((item) => {
      map[item.center_name] = item;
    });
    return map;
  }, [data]);

  document.title = "Occupancy";

  return (
    <div className="mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <div className="p-3 d-flex align-items-center">
        <i className="bx bx-bed fs-1 me-3"></i>
        <h6 className="text-truncate mb-0 fs-18">Occupancy</h6>
      </div>

      <div className="px-3 pb-3">
        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <p className="mt-2 text-muted mb-0">Loading data...</p>
          </div>
        )}

        {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

        <AdmissionDischargeComparison centerAccess={centerAccess} />

        {!loading && !error && (
          <>
            {TABLES.map(({ key, label, isPercentage }) => (
              <OccupancyTable
                key={key}
                title={label}
                fieldKey={key}
                isPercentage={isPercentage}
                centers={centers}
                months={months}
                pivot={pivot}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Occupancy;
