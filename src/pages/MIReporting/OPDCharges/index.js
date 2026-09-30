import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { fetchOpdChargesMonthly, fetchDoctorOpdChargesMonthly } from "../../../store/features/miReporting/miReportingSlice";

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

const DoctorOpdChargesTable = ({ data, loading, error }) => {
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();
  const [selectedCenter, setSelectedCenter] = useState("ALL");

  const centerOptions = React.useMemo(() => [
    { value: "ALL", label: "All Centers" },
    ...[...new Set((data || []).map((item) => item.center_name))].filter(Boolean).sort().map((center) => ({
      value: center,
      label: center,
    })),
  ], [data]);

  const filteredData = React.useMemo(() => {
    if (selectedCenter === "ALL") return data || [];
    return (data || []).filter((item) => item.center_name === selectedCenter);
  }, [data, selectedCenter]);

  const months = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    return Array.from(new Set(filteredData.map((item) => item.month))).sort(
      (a, b) => new Date(b) - new Date(a)
    );
  }, [filteredData]);

  const doctors = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    return Array.from(new Set(filteredData.map((item) => item.doctor_name))).sort();
  }, [filteredData]);

  const pivot = React.useMemo(() => {
    const map = {};
    (filteredData || []).forEach((item) => {
      if (!map[item.doctor_name]) map[item.doctor_name] = {};
      map[item.doctor_name][item.month] = item;
    });
    return map;
  }, [filteredData]);

  const getValue = (doctor, month) =>
    pivot[doctor]?.[month]?.opd_charges ?? 0;

  const getCurrentCenter = (doctor) => {
    const latestMonth = months.find((month) => pivot[doctor]?.[month]);
    return latestMonth ? pivot[doctor][latestMonth]?.center_name ?? "" : "";
  };

  const totals = React.useMemo(() => {
    const totalObj = {};
    months.forEach((month) => {
      totalObj[month] = doctors.reduce(
        (sum, doctor) => sum + (pivot[doctor]?.[month]?.opd_charges ?? 0),
        0
      );
    });
    return totalObj;
  }, [doctors, months, pivot]);

  const csvHeaders = React.useMemo(() => {
    const headers = [
      { label: "Doctor Name", key: "doctor" },
      { label: "Current Center", key: "currentCenter" },
    ];

    months.forEach((month) => {
      headers.push({ label: month, key: month });
    });

    return headers;
  }, [months]);

  const prepareCsvData = () => {
    setCsvLoading(true);

    const formatted = doctors.map((doctor) => {
      const row = { doctor, currentCenter: getCurrentCenter(doctor) };
      months.forEach((month) => {
        row[month] = getValue(doctor, month);
      });
      return row;
    });

    const totalRow = { doctor: "Total", currentCenter: "" };
    months.forEach((month) => {
      totalRow[month] = totals[month] ?? 0;
    });

    setCsvData([...formatted, totalRow]);

    setTimeout(() => {
      csvRef.current.link.click();
      setCsvLoading(false);
    }, 100);
  };

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0">Doctor OPD Charges</h6>
        <Button
          color="info"
          size="sm"
          onClick={prepareCsvData}
          disabled={csvLoading || loading || doctors.length === 0}
        >
          {csvLoading ? "Preparing CSV..." : "Export CSV"}
        </Button>
        <CSVLink
          data={csvData || []}
          filename="doctor-opd-charges-monthly.csv"
          headers={csvHeaders}
          className="d-none"
          ref={csvRef}
        />
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
                style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
              >
                <thead>
                  <tr>
                    <th className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 160, position: "sticky", left: 0, zIndex: 3 }}>
                      Doctor Name
                    </th>
                    <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 110, position: "sticky", left: 160, zIndex: 3 }}>
                      Current Center
                    </th>
                    {months.map((month) => (
                      <th key={month} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doctors.length > 0 ? (
                    <>
                      {doctors.map((doctor, idx) => (
                        <tr key={doctor}>
                          <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}>
                            {doctor}
                          </td>
                          <td className="text-center px-1 py-1" style={{ ...cellStyle(idx), position: "sticky", left: 160, zIndex: 1 }}>
                            {getCurrentCenter(doctor)}
                          </td>
                          {months.map((month) => (
                            <td key={month} className="text-center px-1 py-1" style={cellStyle(idx)}>
                              {getValue(doctor, month)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", position: "sticky", left: 0, zIndex: 1 }}>
                          Total
                        </td>
                        <td className="text-center px-1 py-1 fw-bold" style={{ ...totalCellStyle, position: "sticky", left: 160, zIndex: 1 }}></td>
                        {months.map((month) => (
                          <td key={month} className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
                            {totals[month] ?? 0}
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
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const formatColumnLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatCellValue = (key, value) => {
  if (value === null || value === undefined) return "";
  if (/date/i.test(key)) {
    const d = new Date(value);
    if (!isNaN(d)) {
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
    }
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const currentMonthLabel = new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" });

const DoctorOpdChargesDetailTable = ({ data, optionsData, loading, error }) => {
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthLabel);
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");

  const rows = React.useMemo(() => data || [], [data]);
  const optionRows = React.useMemo(() => optionsData || [], [optionsData]);

  const columns = React.useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).filter((k) => !k.startsWith("_"));
  }, [rows]);

  const centerOptions = React.useMemo(() => [
    { value: "ALL", label: "All Centers" },
    ...[...new Set(optionRows.map((item) => item.center_name))].filter(Boolean).sort().map((center) => ({
      value: center,
      label: center,
    })),
  ], [optionRows]);

  const monthOptions = React.useMemo(() => [
    { value: "ALL", label: "All Months" },
    ...[...new Set(optionRows.map((item) => item.month))].filter(Boolean).sort(
      (a, b) => new Date(b) - new Date(a)
    ).map((month) => ({ value: month, label: month })),
  ], [optionRows]);

  const doctorOptions = React.useMemo(() => [
    { value: "ALL", label: "All Doctors" },
    ...[...new Set(
      optionRows
        .filter((item) => selectedCenter === "ALL" || item.center_name === selectedCenter)
        .map((item) => item.doctor_name)
    )].filter(Boolean).sort().map((doctor) => ({
      value: doctor,
      label: doctor,
    })),
  ], [optionRows, selectedCenter]);

  useEffect(() => {
    if (selectedDoctor === "ALL") return;
    if (!doctorOptions.some((o) => o.value === selectedDoctor)) {
      setSelectedDoctor("ALL");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorOptions]);

  const filteredRows = React.useMemo(() => {
    return rows.filter((item) => {
      if (selectedCenter !== "ALL" && item.center_name !== selectedCenter) return false;
      if (selectedMonth !== "ALL" && item.month !== selectedMonth) return false;
      if (selectedDoctor !== "ALL" && item.doctor_name !== selectedDoctor) return false;
      return true;
    });
  }, [rows, selectedCenter, selectedMonth, selectedDoctor]);

  const csvHeaders = React.useMemo(
    () => columns.map((key) => ({ label: formatColumnLabel(key), key })),
    [columns]
  );

  const prepareCsvData = () => {
    setCsvLoading(true);
    setCsvData(filteredRows);
    setTimeout(() => {
      csvRef.current.link.click();
      setCsvLoading(false);
    }, 100);
  };

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0">Doctor OPD Charges Detail</h6>
        <Button
          color="info"
          size="sm"
          onClick={prepareCsvData}
          disabled={csvLoading || loading || filteredRows.length === 0}
        >
          {csvLoading ? "Preparing CSV..." : "Export CSV"}
        </Button>
        <CSVLink
          data={csvData || []}
          filename="doctor-opd-charges-detail.csv"
          headers={csvHeaders}
          className="d-none"
          ref={csvRef}
        />
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
        <Col xs="auto">
          <Select
            value={monthOptions.find((o) => o.value === selectedMonth) || monthOptions[0]}
            onChange={(opt) => setSelectedMonth(opt.value)}
            options={monthOptions}
            placeholder="Month..."
            styles={{ container: (b) => ({ ...b, minWidth: 160 }) }}
          />
        </Col>
        <Col xs="auto">
          <Select
            value={doctorOptions.find((o) => o.value === selectedDoctor) || doctorOptions[0]}
            onChange={(opt) => setSelectedDoctor(opt.value)}
            options={doctorOptions}
            placeholder="Doctor..."
            styles={{ container: (b) => ({ ...b, minWidth: 200 }) }}
          />
        </Col>
      </Row>

      <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, width: "100%" }}>
        <CardBody className="p-0">
          {loading && (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2 text-muted mb-0">Loading data...</p>
            </div>
          )}

          {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

          {!loading && !error && (
            <div className="shadow-sm bg-white" style={{ borderRadius: 10, overflow: "auto", maxHeight: "70vh" }}>
              <Table
                className="mb-0"
                style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
              >
                <thead>
                  <tr>
                    {columns.map((key) => (
                      <th key={key} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 110 }}>
                        {formatColumnLabel(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length > 0 ? (
                    filteredRows.map((row, idx) => (
                      <tr key={row._id ?? idx}>
                        {columns.map((key) => (
                          <td key={key} className="text-center px-1 py-1" style={cellStyle(idx)}>
                            {formatCellValue(key, row[key])}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length || 1} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
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

const OPDCharges = () => {
  const dispatch = useDispatch();
  const { opdChargesMonthly, doctorOpdChargesMonthly, doctorOpdChargesDetail, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const data = opdChargesMonthly?.data;
  const doctorData = doctorOpdChargesMonthly?.data;
  const doctorDetailData = doctorOpdChargesDetail?.data;

  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchOpdChargesMonthly({ centerAccess }));
    dispatch(fetchDoctorOpdChargesMonthly({ centerAccess }));
    // TODO: will ask devender
    // dispatch(fetchDoctorOpdChargesDetail({ centerAccess }));
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
    pivot[center]?.[month]?.opd_charges ?? 0;

  const totals = React.useMemo(() => {
    const totalObj = {};
    months.forEach((month) => {
      totalObj[month] = centers.reduce(
        (sum, center) => sum + (pivot[center]?.[month]?.opd_charges ?? 0),
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

  document.title = "OPD Charges";

  return (
    <div className="mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <div className="p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bx bx-money fs-1 me-3"></i>
          <h6 className="text-truncate mb-0 fs-18">OPD Charges</h6>
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
          filename="opd-charges-monthly.csv"
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
            <Col lg={12}>
              <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
                <CardBody className="p-0">
                  <div style={{ overflowX: "auto" }}>
                    <Table
                      className="mb-0"
                      style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
                    >
                      <thead>
                        <tr>
                          <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 110 }}>
                            Center Name
                          </th>
                          {months.map((month) => (
                            <th key={month} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>
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
            </Col>
          </Row>
        )}

        <DoctorOpdChargesTable data={doctorData} loading={loading} error={error} />

        <DoctorOpdChargesDetailTable data={doctorDetailData} optionsData={doctorData} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default OPDCharges;
    