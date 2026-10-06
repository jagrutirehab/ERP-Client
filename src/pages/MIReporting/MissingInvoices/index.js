import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Badge, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { fetchMissingInvoices } from "../../../store/features/miReporting/miReportingSlice";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatMonthYear = (date) => `${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;

const formatDate = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
};

const labels = ["Patient UID", "Patient Name", "Center Name", "Admission Date", "Discharge Date", "Invoice Due Date", "CM", "Status"];

const labelsMapping = {
  "Patient UID": "patient_uid",
  "Patient Name": "patient_name",
  "Center Name": "center_name",
  "Admission Date": "admission_date",
  "Discharge Date": "discharge_date",
  "Invoice Due Date": "invoice_due_date",
  "CM": "cm",
  "Status": "status",
};

const DATE_FIELDS = new Set(["Admission Date", "Discharge Date", "Invoice Due Date"]);

const MissingInvoices = () => {
  const dispatch = useDispatch();
  const missingInvoices = useSelector((state) => state.MIReporting.missingInvoices);
  const loading = useSelector((state) => state.MIReporting.loading);
  const error = useSelector((state) => state.MIReporting.error);
  const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = new Date(2020, 0, 1);
    for (let d = new Date(end); d >= start; d.setMonth(d.getMonth() - 1)) {
      const label = formatMonthYear(d);
      opts.push({ value: label, label });
    }
    return opts;
  }, []);

  const currentMonthLabel = useMemo(() => formatMonthYear(new Date()), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthLabel);
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchMissingInvoices({ centerAccess, month: selectedMonth }));
  }, [dispatch, centerAccess, selectedMonth]);

  const data = useMemo(() => missingInvoices?.data || [], [missingInvoices]);

  const centerTotals = useMemo(() => (
    [...(missingInvoices?.monthly_totals || [])].sort((a, b) => (a.center_name || "").localeCompare(b.center_name || ""))
  ), [missingInvoices]);

  const aggregateTotals = useMemo(() => (
    centerTotals.reduce((acc, row) => ({
      should_be_count: acc.should_be_count + (Number(row.should_be_count) || 0),
      result_count: acc.result_count + (Number(row.result_count) || 0),
      missing_count: acc.missing_count + (Number(row.missing_count) || 0),
    }), { should_be_count: 0, result_count: 0, missing_count: 0 })
  ), [centerTotals]);

  const centerOptions = useMemo(() => [
    { value: "ALL", label: "All Centers" },
    ...[...new Set(data.map((item) => item.center_name))].filter(Boolean).sort().map((center) => ({
      value: center,
      label: center,
    })),
  ], [data]);

  const filteredData = useMemo(() => (
    selectedCenter === "ALL" ? data : data.filter((item) => item?.center_name === selectedCenter)
  ), [data, selectedCenter]);

  const prepareCsvData = () => {
    setCsvLoading(true);
    const rows = filteredData.map((item) => labels.map((label) => item[labelsMapping[label]] ?? ""));
    setCsvData(rows);
    setTimeout(() => {
      csvRef.current.link.click();
      setCsvLoading(false);
    }, 100);
  };

  const shouldBe = aggregateTotals.should_be_count;
  const result = aggregateTotals.result_count;
  const missingCount = aggregateTotals.missing_count;
  const compliancePct = shouldBe > 0 ? Math.round((result / shouldBe) * 100) : 0;

  document.title = "Missing Invoices";

  return (
    <div
      className="w-100 mt-4 mt-sm-0"
      style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}
    >
      <div className="row">
        <div className="col-12">
          <div className="px-3 py-1">
            <div className="row align-items-center">
              <div className="col-sm-6 col-8">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                    <i className="bx bx-receipt fs-1"></i>
                  </div>
                  <h6 className="text-truncate mb-0 fs-18">Missing Invoices</h6>
                </div>
              </div>
              <div className="col-sm-6 col-4">
                <div className="d-flex justify-content-end">
                  <Button
                    color="info"
                    onClick={prepareCsvData}
                    disabled={csvLoading || loading || !filteredData.length}
                    className="w-auto"
                  >
                    {csvLoading ? "Preparing CSV..." : "Export CSV"}
                  </Button>
                  <CSVLink
                    data={csvData || []}
                    filename={`missing-invoices-${selectedMonth}.csv`}
                    headers={labels}
                    className="d-none"
                    ref={csvRef}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 p-lg-4">
            <Row className="g-2 align-items-center mb-3">
              <Col md={2}>
                <Select
                  value={monthOptions.find((o) => o.value === selectedMonth) || null}
                  onChange={(opt) => opt && setSelectedMonth(opt.value)}
                  options={monthOptions}
                  placeholder="Month..."
                />
              </Col>
              <Col md={2}>
                <Select
                  value={centerOptions.find((o) => o.value === selectedCenter) || centerOptions[0]}
                  onChange={(opt) => setSelectedCenter(opt.value)}
                  options={centerOptions}
                  placeholder="Center..."
                />
              </Col>
            </Row>

            {loading && (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2 text-muted">Loading data...</p>
              </div>
            )}

            {error && !loading && <Alert color="danger">{error}</Alert>}

            {!loading && !error && (
              <>
                <Card className="mb-4">
                  <CardBody>
                    <h6 className="mb-3">Totals — {selectedMonth}</h6>
                    <div style={{ overflowX: "auto" }}>
                      <Table className="mb-0 w-100" style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.78rem" }}>
                        <thead>
                          <tr>
                            {["Center", "Should Be Count", "Result Count", "Missing Count", "Compliance %"].map((label) => (
                              <th
                                key={label}
                                className="text-center fw-bold px-2 py-1"
                                style={{ border: "1px solid #cfd8e3", background: "green", color: "white", whiteSpace: "nowrap" }}
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {centerTotals.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-4 text-muted">No data available for {selectedMonth}</td>
                            </tr>
                          ) : (
                            <>
                              <tr style={{ background: "#eef6ee" }}>
                                <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8", fontWeight: 700 }}>All Centers</td>
                                <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{shouldBe}</td>
                                <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{result}</td>
                                <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8", color: missingCount > 0 ? "#dc3545" : "inherit", fontWeight: 600 }}>{missingCount}</td>
                                <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{compliancePct}%</td>
                              </tr>
                              {centerTotals.map((row, idx) => {
                                const rowShouldBe = Number(row.should_be_count) || 0;
                                const rowResult = Number(row.result_count) || 0;
                                const rowMissing = Number(row.missing_count) || 0;
                                const rowCompliancePct = rowShouldBe > 0 ? Math.round((rowResult / rowShouldBe) * 100) : 0;
                                return (
                                  <tr key={row.center_name ?? idx} style={{ background: idx % 2 === 0 ? "#f8fafc" : "#fff" }}>
                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{row.center_name}</td>
                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{rowShouldBe}</td>
                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{rowResult}</td>
                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8", color: rowMissing > 0 ? "#dc3545" : "inherit", fontWeight: 600 }}>{rowMissing}</td>
                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{rowCompliancePct}%</td>
                                  </tr>
                                );
                              })}
                            </>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h6 className="mb-3">Missing Invoices — {selectedMonth}</h6>
                    <div
                      className="shadow-sm bg-white"
                      style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "calc(100vh - 420px)" }}
                    >
                      <Table className="mb-0 w-100" style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.72rem" }}>
                        <thead>
                          <tr>
                            {labels.map((label) => (
                              <th
                                key={label}
                                className="text-center fw-bold px-1 py-1"
                                style={{ border: "1px solid #cfd8e3", background: "green", color: "white", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 2 }}
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.length === 0 ? (
                            <tr>
                              <td colSpan={labels.length} className="text-center py-4 text-muted">No missing invoices found</td>
                            </tr>
                          ) : (
                            filteredData.map((item, idx) => (
                              <tr key={item.patient_mongo_id ?? idx}>
                                {labels.map((label) => (
                                  <td
                                    key={label}
                                    className="text-center px-1 py-1"
                                    style={{ border: "1px solid #d6dde8", background: idx % 2 === 0 ? "#f8fafc" : "#fff", whiteSpace: "nowrap" }}
                                  >
                                    {label === "Patient Name"
                                      ? (
                                        <Link to={`/patient/${item.patient_mongo_id}`} className="text-dark" target="_blank" rel="noopener noreferrer">
                                          {item[labelsMapping[label]]}
                                        </Link>
                                      )
                                      : label === "Status"
                                        ? <Badge color={item.status === "Missing" ? "danger" : "success"}>{item.status}</Badge>
                                        : DATE_FIELDS.has(label)
                                          ? formatDate(item[labelsMapping[label]])
                                          : (item[labelsMapping[label]] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissingInvoices;
