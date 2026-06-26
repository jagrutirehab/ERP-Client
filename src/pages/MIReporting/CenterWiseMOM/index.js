import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import {
  fetchCenterWiseMOM,
  fetchCampaignWiseMOM,
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

const CENTER_OPTIONS = [
  { value: "", label: "All Centers" },
  { value: "J-Pune", label: "J-Pune" },
  { value: "NA", label: "NA" },
  { value: "J-Noida", label: "J-Noida" },
  { value: "J-Malad West", label: "J-Malad West" },
  { value: "J-Chennai", label: "J-Chennai" },
  { value: "J-Ahmedabad", label: "J-Ahmedabad" },
  { value: "J-Malad", label: "J-Malad" },
  { value: "J-Thane", label: "J-Thane" },
  { value: "J-Gurgaon", label: "J-Gurgaon" },
  { value: "Olive-Navi Mumbai (Kopar)", label: "Olive-Navi Mumbai (Kopar)" },
  { value: "J-Bangalore", label: "J-Bangalore" },
  { value: "J-Navi Mumbai (Taloja)", label: "J-Navi Mumbai (Taloja)" },
  { value: "Olive-Noida", label: "Olive-Noida" },
  { value: "J-Hyderabad", label: "J-Hyderabad" },
  { value: "Nashik", label: "Nashik" },
  { value: "Aroha-Noida", label: "Aroha-Noida" },
  { value: "Olive - Baner", label: "Olive - Baner" },
  { value: "Aroha-Faridabad", label: "Aroha-Faridabad" },
  { value: "J - Chennai T Nagar", label: "J - Chennai T Nagar" },
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

// Reusable compact MOM table
const MOMTable = ({ data, months, getCount, totals, displayFormat, loading, error, getName }) => (
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
                <th className="text-center fw-bold px-2 py-1" style={headerStyle}>Name</th>
                {months.map((month) => (
                  <th key={month} className="text-center fw-bold px-2 py-1" style={headerStyle}>{month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                <>
                  {data.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1 fw-semibold" style={cellStyle(idx)}>{getName(item)}</td>
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
);

const CenterWiseMOM = () => {
  const dispatch = useDispatch();
  const { centerWiseMOM, campaignWiseMOM, loading, error } = useSelector(
    (state) => state.MIReporting
  );

  // Common filters (shared between both tables)
  const [commonFilters, setCommonFilters] = useState({
    hs_lead_status: "",
    hubspot_owner_id: "",
  });

  const [displayFormat, setDisplayFormat] = useState("number");

  // Per-table filters
  const [centerWiseCampaign, setCenterWiseCampaign] = useState("");
  const [campaignWiseCenter, setCampaignWiseCenter] = useState("");

  // CSV refs
  const centerCsvRef = useRef();
  const campaignCsvRef = useRef();
  const [centerCsvData, setCenterCsvData] = useState([]);
  const [campaignCsvData, setCampaignCsvData] = useState([]);

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

  // Fetch center-wise data
  useEffect(() => {
    const params = {};
    if (commonFilters.hs_lead_status) params.hs_lead_status = commonFilters.hs_lead_status;
    if (commonFilters.hubspot_owner_id) params.hubspot_owner_id = commonFilters.hubspot_owner_id;
    if (centerWiseCampaign) params.leadSource = centerWiseCampaign;
    dispatch(fetchCenterWiseMOM(params));
  }, [dispatch, commonFilters, centerWiseCampaign]);

  // Fetch campaign-wise data
  useEffect(() => {
    const params = {};
    if (commonFilters.hs_lead_status) params.hs_lead_status = commonFilters.hs_lead_status;
    if (commonFilters.hubspot_owner_id) params.hubspot_owner_id = commonFilters.hubspot_owner_id;
    if (campaignWiseCenter) params.center = campaignWiseCenter;
    dispatch(fetchCampaignWiseMOM(params));
  }, [dispatch, commonFilters, campaignWiseCenter]);

  const getCount = (item, month) => {
    const stat = item.stats?.find((s) => s.month === month);
    return stat ? stat.count : 0;
  };

  const sortedCenterData = useMemo(() =>
    [...centerWiseMOM].sort((a, b) => (a.center || "").localeCompare(b.center || "")),
  [centerWiseMOM]);

  const sortedCampaignData = useMemo(() =>
    [...campaignWiseMOM].sort((a, b) =>
      (a.leadSource || a.campaign || a.name || "").localeCompare(b.leadSource || b.campaign || b.name || "")
    ),
  [campaignWiseMOM]);

  const centerTotals = useMemo(() => {
    const result = {};
    months.forEach((month) => {
      result[month] = centerWiseMOM.reduce((sum, item) => sum + getCount(item, month), 0);
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerWiseMOM, months]);

  const campaignTotals = useMemo(() => {
    const result = {};
    months.forEach((month) => {
      result[month] = campaignWiseMOM.reduce((sum, item) => sum + getCount(item, month), 0);
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignWiseMOM, months]);

  const csvHeaders = useMemo(() => {
    const headers = [{ label: "#", key: "id" }, { label: "Name", key: "name" }];
    months.forEach((month) => headers.push({ label: month, key: month }));
    return headers;
  }, [months]);

  const buildCsvRows = (data, nameKey) => {
    const rows = data.map((item, idx) => {
      const row = { id: idx + 1, name: item[nameKey] };
      months.forEach((month) => { row[month] = getCount(item, month); });
      return row;
    });
    const totalRow = { id: "", name: "Total" };
    months.forEach((month) => { totalRow[month] = (month in centerTotals ? centerTotals[month] : 0); });
    rows.push(totalRow);
    return rows;
  };

  const exportCenterCsv = () => {
    setCenterCsvData(buildCsvRows(sortedCenterData, "center"));
    setTimeout(() => centerCsvRef.current.link.click(), 100);
  };

  const exportCampaignCsv = () => {
    const rows = sortedCampaignData.map((item, idx) => {
      const row = { id: idx + 1, name: item.leadSource || item.campaign || item.name };
      months.forEach((month) => { row[month] = getCount(item, month); });
      return row;
    });
    const totalRow = { id: "", name: "Total" };
    months.forEach((month) => { totalRow[month] = campaignTotals[month] ?? 0; });
    rows.push(totalRow);
    setCampaignCsvData(rows);
    setTimeout(() => campaignCsvRef.current.link.click(), 100);
  };

  return (
    <div className="w-100 mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="p-3">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                <i className="bx bx-bar-chart-alt-2 fs-1"></i>
              </div>
              <h6 className="text-truncate mb-0 fs-18">Center Wise - Month on Month</h6>
            </div>
          </div>

          <div className="px-3 pb-3">
            {/* Common filters */}
            <Row className="g-2 align-items-center mb-4">
              <Col xs="auto">
                <Select
                  value={LEAD_STATUS_OPTIONS.find((o) => o.value === commonFilters.hs_lead_status) || LEAD_STATUS_OPTIONS[0]}
                  onChange={(opt) => setCommonFilters((prev) => ({ ...prev, hs_lead_status: opt?.value || "" }))}
                  options={LEAD_STATUS_OPTIONS}
                  placeholder="Lead Status..."
                  styles={{ container: (b) => ({ ...b, minWidth: 180 }) }}
                />
              </Col>
              <Col xs="auto">
                <Select
                  value={AGENT_OPTIONS.find((o) => o.value === commonFilters.hubspot_owner_id) || AGENT_OPTIONS[0]}
                  onChange={(opt) => setCommonFilters((prev) => ({ ...prev, hubspot_owner_id: opt?.value || "" }))}
                  options={AGENT_OPTIONS}
                  placeholder="Select Agent..."
                  styles={{ container: (b) => ({ ...b, minWidth: 180 }) }}
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

            {/* ── Both tables side by side ── */}
            <div className="d-flex gap-4 align-items-start flex-wrap">

            {/* ── Center Wise ── */}
            <div style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
                <h6 className="mb-0 fw-bold">Center Wise</h6>
                <div className="d-flex align-items-center gap-2">
                  <Select
                    value={CAMPAIGN_OPTIONS.find((o) => o.value === centerWiseCampaign) || CAMPAIGN_OPTIONS[0]}
                    onChange={(opt) => setCenterWiseCampaign(opt?.value || "")}
                    options={CAMPAIGN_OPTIONS}
                    placeholder="Campaign..."
                    styles={{ container: (b) => ({ ...b, minWidth: 200 }) }}
                  />
                  <Button color="info" size="sm" onClick={exportCenterCsv} disabled={!centerWiseMOM?.length}>
                    Export CSV
                  </Button>
                  <CSVLink data={centerCsvData} filename="center-wise-mom.csv" headers={csvHeaders} className="d-none" ref={centerCsvRef} />
                </div>
              </div>
              <MOMTable
                data={sortedCenterData}
                months={months}
                getCount={getCount}
                totals={centerTotals}
                displayFormat={displayFormat}
                loading={loading}
                error={error}
                getName={(item) => item.center}
              />
            </div>

            {/* ── Campaign Wise ── */}
            <div style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
                <h6 className="mb-0 fw-bold">Campaign Wise</h6>
                <div className="d-flex align-items-center gap-2">
                  <Select
                    value={CENTER_OPTIONS.find((o) => o.value === campaignWiseCenter) || CENTER_OPTIONS[0]}
                    onChange={(opt) => setCampaignWiseCenter(opt?.value || "")}
                    options={CENTER_OPTIONS}
                    placeholder="Center..."
                    styles={{ container: (b) => ({ ...b, minWidth: 200 }) }}
                  />
                  <Button color="info" size="sm" onClick={exportCampaignCsv} disabled={!campaignWiseMOM?.length}>
                    Export CSV
                  </Button>
                  <CSVLink data={campaignCsvData} filename="campaign-wise-mom.csv" headers={csvHeaders} className="d-none" ref={campaignCsvRef} />
                </div>
              </div>
              <MOMTable
                data={sortedCampaignData}
                months={months}
                getCount={getCount}
                totals={campaignTotals}
                displayFormat={displayFormat}
                loading={loading}
                error={error}
                getName={(item) => item.leadSource || item.campaign || item.name}
              />
            </div>

            </div>{/* end side-by-side wrapper */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterWiseMOM;
