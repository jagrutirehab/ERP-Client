import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import {
  fetchCenterWiseMOM,
  fetchCenterWiseStatusMOM,
} from "../../../store/features/miReporting/miReportingSlice";

const AGENT_OPTIONS = [
  { value: "", label: "All Agents" },
  { value: "159341480", label: "Aparna Kushwah" },
  { value: "159359134", label: "Poonam Choughule" },
  { value: "159359136", label: "Kritika Kulkarni" },
  { value: "159359135", label: "Poulami Dutta" },
  { value: "159318121", label: "Agent Agent" },
  { value: "159391977", label: "Usaam Siddiqui" },
  { value: "159358705", label: "Sangeeta Yadav" },
  { value: "159360052", label: "Janvi Sharma" },
  { value: "160537948", label: "Sonakshi Sharma" },
  { value: "163632272", label: "Vrinda Dudeja" },
];

const LEAD_STATUS_OPTIONS = [
  { value: "", label: "All Lead Statuses" },
  { value: "Not Interested", label: "Not Interested" },
  { value: "No Response 1", label: "No Response 1" },
  { value: "OPD Done", label: "OPD Done" },
  { value: "Unrelated", label: "Unrelated" },
  { value: "Callback", label: "Callback" },
  { value: "Job Related", label: "Job Related" },
  { value: "Admitted", label: "Admitted" },
  { value: "No Response 3", label: "No Response 3" },
  { value: "Not Visited", label: "Not Visited" },
  { value: "Visited", label: "Visited" },
  { value: "Internship Related", label: "Internship Related" },
  { value: "Duplicate", label: "Duplicate" },
  { value: "Not Admitted", label: "Not Admitted" },
  { value: "No Response 2", label: "No Response 2" },
  { value: "Marketing Related", label: "Marketing Related" },
  { value: "Visit Planned", label: "Visit Planned" },
  { value: "UNQUALIFIED", label: "UNQUALIFIED" },
  { value: "Readmission", label: "Readmission" },
  { value: "New", label: "New" },
];

const CAMPAIGN_OPTIONS = [
  { value: "", label: "All Campaigns" },
  { value: "JustDial_917971142042", label: "JustDial_917971142042" },
  { value: "JH_Ads", label: "JH_Ads" },
  { value: "Jagruti_917971142045", label: "Jagruti_917971142045" },
  { value: "JustDial_Email", label: "JustDial_Email" },
  { value: "Olive_917971142044", label: "Olive_917971142044" },
  { value: "Jagruti_FB", label: "Jagruti_FB" },
  { value: "Whatsapp", label: "Whatsapp" },
  { value: "Olive_FB", label: "Olive_FB" },
  { value: "GoogleAds_917971142043", label: "GoogleAds_917971142043" },
  { value: "JRC_ContactUs", label: "JRC_ContactUs" },
  { value: "WA_Olive", label: "WA_Olive" },
  { value: "Olive_ContactUs", label: "Olive_ContactUs" },
  { value: "Aroha_917971142050", label: "Aroha_917971142050" },
  { value: "WA_Jagruti", label: "WA_Jagruti" },
  { value: "Rehabs.in", label: "Rehabs.in" },
  { value: "Alpha", label: "Alpha" },
  { value: "WA_Aroha", label: "WA_Aroha" },
  { value: "Olive_Ads", label: "Olive_Ads" },
  { value: "Aroha_Ads", label: "Aroha_Ads" },
  { value: "Recovery.com", label: "Recovery.com" },
  { value: "WA_JustDial", label: "WA_JustDial" },
  { value: "Jagruti_Wellness_Email", label: "Jagruti_Wellness_Email" },
  { value: "JH_ContactUs", label: "JH_ContactUs" },
  { value: "Email", label: "Email" },
  { value: "Jagruti_Consult_Email", label: "Jagruti_Consult_Email" },
  { value: "Recovery", label: "Recovery" },
  { value: "Print_1", label: "Print_1" },
  { value: "Campaign_1", label: "Campaign_1" },
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

const CenterWiseMOM = () => {
  const dispatch = useDispatch();
  const { centerWiseMOM, centerWiseStatusMOM, loading, error } = useSelector(
    (state) => state.MIReporting
  );

  const [filters, setFilters] = useState({
    hs_lead_status: "",
    hubspot_owner_id: "",
  });
  const [displayFormat, setDisplayFormat] = useState("number");
  const [campaign, setCampaign] = useState("");

  const csvRef = useRef();
  const [csvData, setCsvData] = useState([]);
  const matrixCsvRef = useRef();
  const [matrixCsvData, setMatrixCsvData] = useState([]);

  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(`${names[d.getMonth()]} ${d.getFullYear()}`);
    }
    return result;
  }, []);

  useEffect(() => {
    const params = {};
    if (filters.hs_lead_status) params.hs_lead_status = filters.hs_lead_status;
    if (filters.hubspot_owner_id) params.hubspot_owner_id = filters.hubspot_owner_id;
    if (campaign) params.lead_source = campaign;
    dispatch(fetchCenterWiseMOM(params));
    dispatch(fetchCenterWiseStatusMOM(params));
  }, [dispatch, filters, campaign]);

  const getCount = (item, month) => {
    const stat = item.stats?.find((s) => s.month === month);
    return stat ? stat.count : 0;
  };

  const sortedData = useMemo(() =>
    [...centerWiseMOM].sort((a, b) => (a.center || "").localeCompare(b.center || "")),
  [centerWiseMOM]);

  const totals = useMemo(() => {
    const result = {};
    months.forEach((month) => {
      result[month] = centerWiseMOM.reduce((sum, item) => sum + getCount(item, month), 0);
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerWiseMOM, months]);

  const csvHeaders = useMemo(() => {
    const headers = [{ label: "#", key: "id" }, { label: "Center", key: "name" }];
    months.forEach((month) => headers.push({ label: month, key: month }));
    return headers;
  }, [months]);

  // Center Status Matrix derived data
  // Response: [{ center, total, stats: [{ month, statusBreakdown: [{ status, count }] }] }]
  // Table: rows=centers, cols=lead statuses, + Center Total column

  const matrixStatuses = useMemo(() => {
    const set = new Set();
    centerWiseStatusMOM.forEach((item) => {
      item.stats?.forEach((stat) => {
        stat.statusBreakdown?.forEach((s) => set.add(s.status));
      });
    });
    return Array.from(set).sort();
  }, [centerWiseStatusMOM]);

  // pivot[center][status] = total count across all months
  const matrixPivot = useMemo(() => {
    const pivot = {};
    centerWiseStatusMOM.forEach((item) => {
      pivot[item.center] = {};
      item.stats?.forEach((stat) => {
        stat.statusBreakdown?.forEach((s) => {
          pivot[item.center][s.status] = (pivot[item.center][s.status] || 0) + s.count;
        });
      });
    });
    return pivot;
  }, [centerWiseStatusMOM]);

  const matrixSortedCenters = useMemo(() =>
    [...centerWiseStatusMOM].sort((a, b) => (a.center || "").localeCompare(b.center || "")),
  [centerWiseStatusMOM]);

  // Column totals (per status across all centers)
  const matrixStatusTotals = useMemo(() => {
    const result = {};
    matrixStatuses.forEach((status) => {
      result[status] = centerWiseStatusMOM.reduce(
        (sum, item) => sum + (matrixPivot[item.center]?.[status] || 0),
        0
      );
    });
    return result;
  }, [matrixPivot, matrixStatuses, centerWiseStatusMOM]);

  const matrixCsvHeaders = useMemo(() => {
    const headers = [{ label: "Center", key: "center" }, { label: "Center Total", key: "_total" }];
    matrixStatuses.forEach((s) => headers.push({ label: s, key: s }));
    return headers;
  }, [matrixStatuses]);

  const exportMatrixCsv = () => {
    const rows = matrixSortedCenters.map((item) => {
      const r = { center: item.center, _total: item.total || 0 };
      matrixStatuses.forEach((s) => { r[s] = matrixPivot[item.center]?.[s] || 0; });
      return r;
    });
    const grandTotal = centerWiseStatusMOM.reduce((s, item) => s + (item.total || 0), 0);
    const totalRow = { center: "Total", _total: grandTotal };
    matrixStatuses.forEach((s) => { totalRow[s] = matrixStatusTotals[s] || 0; });
    rows.push(totalRow);
    setMatrixCsvData(rows);
    setTimeout(() => matrixCsvRef.current.link.click(), 100);
  };

  const exportCsv = () => {
    const rows = sortedData.map((item, idx) => {
      const row = { id: idx + 1, name: item.center };
      months.forEach((month) => { row[month] = getCount(item, month); });
      return row;
    });
    const totalRow = { id: "", name: "Total" };
    months.forEach((month) => { totalRow[month] = totals[month] ?? 0; });
    rows.push(totalRow);
    setCsvData(rows);
    setTimeout(() => csvRef.current.link.click(), 100);
  };

  return (
    <div className="w-100 mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <div className="row">
        <div className="col-12">
          

          <div className="px-3 pb-3">
            {/* Sticky filter bar */}
            <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", paddingTop: 8, paddingBottom: 8, marginBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
              <Row className="g-2 align-items-center">
                <Col xs="auto">
                  <Select
                    value={AGENT_OPTIONS.find((o) => o.value === filters.hubspot_owner_id) || AGENT_OPTIONS[0]}
                    onChange={(opt) => setFilters((prev) => ({ ...prev, hubspot_owner_id: opt?.value || "" }))}
                    options={AGENT_OPTIONS}
                    placeholder="Select Agent..."
                    styles={{ container: (b) => ({ ...b, minWidth: 180 }) }}
                  />
                </Col>
                <Col xs="auto">
                  <Select
                    value={CAMPAIGN_OPTIONS.find((o) => o.value === campaign) || CAMPAIGN_OPTIONS[0]}
                    onChange={(opt) => setCampaign(opt?.value || "")}
                    options={CAMPAIGN_OPTIONS}
                    placeholder="Campaign..."
                    styles={{ container: (b) => ({ ...b, minWidth: 200 }) }}
                  />
                </Col>
                <Col xs="auto">
                  <Select
                    value={displayFormat === "percentage" ? { value: "percentage", label: "Percentage" } : { value: "number", label: "Number" }}
                    onChange={(opt) => setDisplayFormat(opt.value)}
                    options={[{ value: "number", label: "Number" }, { value: "percentage", label: "Percentage" }]}
                    styles={{ container: (b) => ({ ...b, minWidth: 140 }) }}
                  />
                </Col>
              </Row>
            </div>

            {/* ── Center × Lead Status Matrix ── */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2 gap-2">
                <h6 className="mb-0 fw-bold">Center × Lead Status</h6>
                <div className="d-flex align-items-center gap-2">
                  <Button color="info" size="sm" onClick={exportMatrixCsv} disabled={!centerWiseStatusMOM?.length}>
                    Export CSV
                  </Button>
                  <CSVLink data={matrixCsvData} filename="center-status-matrix.csv" headers={matrixCsvHeaders} className="d-none" ref={matrixCsvRef} />
                </div>
              </div>
              <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
                <CardBody className="p-0">
                  {loading && (
                    <div className="text-center py-4" style={{ minWidth: 200 }}>
                      <Spinner color="primary" />
                      <p className="mt-2 text-muted mb-0">Loading data...</p>
                    </div>
                  )}
                  {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}
                  {!loading && !error && (
                    <div style={{ overflowX: "auto", borderRadius: 10, overflow: "hidden" }}>
                      <Table className="mb-0" style={{ borderCollapse: "collapse", fontSize: "0.78rem", width: "max-content" }}>
                        <thead>
                          <tr>
                            <th className="text-center fw-bold px-2 py-1" style={headerStyle}>Center Name</th>
                            <th className="text-center fw-bold px-2 py-1" style={headerStyle}>Center Total</th>
                            {matrixStatuses.map((status) => (
                              <th key={status} className="text-center fw-bold px-2 py-1" style={headerStyle}>{status}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {matrixSortedCenters && matrixSortedCenters.length > 0 ? (
                            <>
                              {matrixSortedCenters.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-2 py-1 fw-semibold" style={cellStyle(idx)}>{item.center}</td>
                                  <td className="text-center px-2 py-1 fw-semibold" style={{ ...cellStyle(idx), color: (item.total || 0) > 0 ? "#1e293b" : "#94a3b8" }}>
                                    {item.total || 0}
                                  </td>
                                  {matrixStatuses.map((status) => {
                                    const value = matrixPivot[item.center]?.[status] || 0;
                                    return (
                                      <td key={status} className="text-center px-2 py-1" style={{ ...cellStyle(idx), color: value > 0 ? "#1e293b" : "#94a3b8" }}>
                                        {value}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                              <tr>
                                <td className="px-2 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", whiteSpace: "nowrap" }}>Total</td>
                                <td className="text-center px-2 py-1 fw-bold" style={totalCellStyle}>
                                  {centerWiseStatusMOM.reduce((s, item) => s + (item.total || 0), 0)}
                                </td>
                                {matrixStatuses.map((status) => (
                                  <td key={status} className="text-center px-2 py-1 fw-bold" style={totalCellStyle}>
                                    {matrixStatusTotals[status] || 0}
                                  </td>
                                ))}
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <td colSpan={matrixStatuses.length + 2} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
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

            {/* ── Center Wise MoM ── */}
            <div className="mb-2">
              <h6 className="fw-bold mb-2">Center Wise - Month on Month</h6>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Select
                  value={LEAD_STATUS_OPTIONS.find((o) => o.value === filters.hs_lead_status) || LEAD_STATUS_OPTIONS[0]}
                  onChange={(opt) => setFilters((prev) => ({ ...prev, hs_lead_status: opt?.value || "" }))}
                  options={LEAD_STATUS_OPTIONS}
                  placeholder="Lead Status..."
                  styles={{ container: (b) => ({ ...b, minWidth: 180 }) }}
                />
                <Button color="info" size="sm" onClick={exportCsv} disabled={!centerWiseMOM?.length}>
                  Export CSV
                </Button>
                <CSVLink data={csvData} filename="center-wise-mom.csv" headers={csvHeaders} className="d-none" ref={csvRef} />
              </div>
            </div>
            <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
              <CardBody className="p-0">
                {loading && (
                  <div className="text-center py-4" style={{ minWidth: 200 }}>
                    <Spinner color="primary" />
                    <p className="mt-2 text-muted mb-0">Loading data...</p>
                  </div>
                )}
                {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}
                {!loading && !error && (
                  <div style={{ overflowX: "auto", borderRadius: 10, overflow: "hidden" }}>
                    <Table className="mb-0" style={{ borderCollapse: "collapse", fontSize: "0.78rem", width: "max-content" }}>
                      <thead>
                        <tr>
                          <th className="text-center fw-bold px-2 py-1" style={headerStyle}>Center</th>
                          {months.map((month) => (
                            <th key={month} className="text-center fw-bold px-2 py-1" style={headerStyle}>{month}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData && sortedData.length > 0 ? (
                          <>
                            {sortedData.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-2 py-1 fw-semibold" style={cellStyle(idx)}>{item.center}</td>
                                {months.map((month) => {
                                  const value = getCount(item, month);
                                  const total = totals[month] || 0;
                                  const display =
                                    displayFormat === "percentage"
                                      ? total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0%"
                                      : value;
                                  return (
                                    <td key={month} className="text-center px-2 py-1" style={{ ...cellStyle(idx), color: value > 0 ? "#1e293b" : "#94a3b8" }}>
                                      {display}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            <tr>
                              <td className="px-2 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", whiteSpace: "nowrap" }}>Total</td>
                              {months.map((month) => (
                                <td key={month} className="text-center px-2 py-1 fw-bold" style={totalCellStyle}>
                                  {displayFormat === "percentage" ? "100%" : (totals[month] ?? 0)}
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
      </div>
    </div>
  );
};

export default CenterWiseMOM;
