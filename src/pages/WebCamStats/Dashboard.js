import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Spinner,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
} from "reactstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Filter, Calendar, Camera, Activity, RefreshCw } from "lucide-react";
import axios from "axios";
import { api } from "../../config";
import { useSelector } from "react-redux";
import Select from "react-select";

// --- Utility: distinct colors for alert types ---
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#d0ed57",
  "#a4de6c",
];

const Dashboard = () => {
  const user = useSelector((state) => state.User);
  // --- State ---
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCenter, setSelectedCenter] = useState("ALL");

  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [{ value: "ALL", label: "All Centers" }]
      : []),
    ...(user?.centerAccess?.map((id) => {
      const center = user?.userCenters?.find((c) => c._id === id);
      return {
        value: id,
        label: center?.title || "Unknown Center",
      };
    }) || []),
  ];

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) ||
    centerOptions[0];

  // --- Filter State ---
  const [filters, setFilters] = useState({
    camId: "",
    from: "",
    to: "",
    groupBy: "day", // Default to daily view
  });

  // --- Fetch Data ---
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      // Construct Query Params
      const params = new URLSearchParams();
      if (selectedCenter) params.append("centerId", selectedCenter);
      if (filters.camId) params.append("camId", filters.camId);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.groupBy) params.append("groupBy", filters.groupBy);

      const res = await axios.get(`${api.CCTV_SERVICE_URL}/alerts/stats`, {
        params: params, // Axios handles the query string construction
        headers: {
          "x-api-key":
            "48dd6cc2f04685a14c6a7320b87097b23bd9a2979edfa8d0818902a8659313b0",
        },
      });

      // Handle the nested response structure (res.data.stats)
      setStats(res?.stats || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.message || err?.message || "Failed to fetch data",
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCenter, filters]);
  const chartData = useMemo(() => {
    if (!stats?.length || !filters.groupBy) return [];

    const dataMap = {};
    const alertTypes = new Set();

    stats.forEach((item) => {
      const dateKey = item._id.date; // x-axis value
      const type = item._id.alertType; // data key
      alertTypes.add(type);

      if (!dataMap[dateKey]) {
        dataMap[dateKey] = { name: dateKey };
      }
      dataMap[dateKey][type] = item.count;
    });

    // Convert map to array and sort by date
    return {
      data: Object.values(dataMap).sort(
        (a, b) => new Date(a.name) - new Date(b.name),
      ),
      keys: Array.from(alertTypes),
    };
  }, [stats, filters.groupBy]);

  // Calculate Totals per Alert Type (for Summary Cards)
  const totalStats = useMemo(() => {
    const totals = {};
    let grandTotal = 0;
    stats.forEach((s) => {
      const type = s._id.alertType;
      totals[type] = (totals[type] || 0) + s.count;
      grandTotal += s.count;
    });
    return { totals, grandTotal };
  }, [stats]);

  // --- Event Handlers ---
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchStats();
  };

  const handleReset = () => {
    setFilters({ centerId: "", camId: "", from: "", to: "", groupBy: "day" });
    setFilters((prev) => {
      const reset = {
        centerId: "",
        camId: "",
        from: "",
        to: "",
        groupBy: "day",
      };
      return reset;
    });
  };

  return (
    <React.Fragment>
      <div className="page-content overflow-hidden">
        <Container fluid>
          <div className="chat-wrapper d-flex row gap-1 mx-n4 my-n4 mb-n5 p-1">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold text-dark mb-1">Analytics Dashboard</h2>
                <p className="text-muted mb-0">
                  Monitor camera alerts and trends
                </p>
              </div>
              <Button
                color="primary"
                onClick={fetchStats}
                disabled={loading}
                className="d-flex align-items-center gap-2"
              >
                <RefreshCw size={18} className={loading ? "spin-anim" : ""} />
                Refresh Data
              </Button>
            </div>

            {/* FILTERS CARD */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <Filter size={18} className="text-primary me-2" />
                  <h6 className="fw-bold mb-0">Filters</h6>
                </div>

                <Form onSubmit={handleApplyFilters}>
                  <Row className="g-3">
                    <Col md={2}>
                      <Label className="small text-muted">Group By</Label>
                      <Input
                        type="select"
                        name="groupBy"
                        value={filters.groupBy}
                        onChange={handleFilterChange}
                        className="form-select-sm"
                      >
                        <option value="day">Day</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Label className="small text-muted">Center</Label>
                      <Select
                        value={selectedCenterOption}
                        onChange={(opt) => setSelectedCenter(opt.value)}
                        options={centerOptions}
                        placeholder="Select Center"
                      />
                    </Col>
                    <Col md={2}>
                      <Label className="small text-muted">Camera ID</Label>
                      <Input
                        placeholder="Cam-01..."
                        name="camId"
                        value={filters.camId}
                        onChange={handleFilterChange}
                        bsSize="sm"
                      />
                    </Col>
                    <Col md={2}>
                      <Label className="small text-muted">From Date</Label>
                      <Input
                        type="date"
                        name="from"
                        value={filters.from}
                        onChange={handleFilterChange}
                        bsSize="sm"
                      />
                    </Col>
                    <Col md={2}>
                      <Label className="small text-muted">To Date</Label>
                      <Input
                        type="date"
                        name="to"
                        value={filters.to}
                        onChange={handleFilterChange}
                        bsSize="sm"
                      />
                    </Col>
                    <Col md={2} className="d-flex align-items-end gap-2">
                      <Button
                        color="primary"
                        size="sm"
                        type="submit"
                        className="flex-grow-1"
                      >
                        Apply
                      </Button>
                      <Button
                        color="light"
                        size="sm"
                        type="button"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>

            {error && (
              <div className="alert alert-danger rounded-3">{error}</div>
            )}

            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner color="primary" />
              </div>
            ) : (
              <>
                {/* SUMMARY STATS */}
                <Row className="g-3 mb-4">
                  <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1 opacity-75">Total Alerts</p>
                            <h2 className="fw-bold mb-0">
                              {totalStats.grandTotal}
                            </h2>
                          </div>
                          <Activity size={24} className="opacity-75" />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Dynamic Summary Cards for Top 3 Alert Types */}
                  {Object.entries(totalStats.totals)
                    .slice(0, 3)
                    .map(([type, count], index) => (
                      <Col xl={3} md={6} key={type}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                          <CardBody>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <p className="text-uppercase text-muted small mb-1">
                                  {type}
                                </p>
                                <h3 className="fw-bold mb-0 text-dark">
                                  {count}
                                </h3>
                              </div>
                              <Badge color="light" className="text-dark p-2">
                                Type {index + 1}
                              </Badge>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                </Row>

                {/* MAIN CHART SECTION */}
                <Row>
                  <Col lg={12}>
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                      <CardBody className="p-4">
                        <h5 className="fw-bold mb-4">
                          Alert Trends ({filters.groupBy})
                        </h5>

                        <div style={{ width: "100%", height: 400 }}>
                          {chartData?.data?.length > 0 ? (
                            <ResponsiveContainer>
                              <BarChart
                                data={chartData.data}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke="#eee"
                                />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                  contentStyle={{
                                    borderRadius: "8px",
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <Legend />
                                {chartData.keys.map((key, index) => (
                                  <Bar
                                    key={key}
                                    dataKey={key}
                                    stackId="a"
                                    fill={COLORS[index % COLORS?.length]}
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                  />
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                              No data available for current filters
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </Container>
      </div>

      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </React.Fragment>
  );
};

export default Dashboard;
