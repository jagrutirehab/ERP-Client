import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import { fetchCenterLeadsMoM, fetchRefundAmountMOM } from "../../../store/features/miReporting/miReportingSlice";
import Select from "react-select";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const RefundAmountMOM = () => {
  const dispatch = useDispatch();
  const { refundAmountMOM, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const user = useSelector((state) => state.User);
  
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const navigate = useNavigate();

  const { hasPermission } = usePermissions(token);
  const hasReadPermission = hasPermission(
    "MIS_REPORTS",
    "REFUND_AMOUNT",
    "READ",
  );


  useEffect(() => {
    if (!hasReadPermission) {
      navigate("/unauthorized");
      return;
    }
    dispatch(fetchRefundAmountMOM({ centerAccess }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, centerAccess,hasReadPermission]);

  // Extract unique months and sort them descending
    const months = React.useMemo(() => {
    if (!refundAmountMOM || refundAmountMOM.length === 0) return [];

    const allMonths = new Set();

    refundAmountMOM.forEach((item) => {
        if (item.stats) {
        Object.keys(item.stats).forEach((month) => {
            allMonths.add(month);
        });
        }
    });

    // console.log(allMonths);
    return Array.from(allMonths).sort().reverse();
    }, [refundAmountMOM]);

    const totals = React.useMemo(() => {
      const totalObj = {};

      months.forEach((month) => {
        totalObj[month] = 0;
      });

      refundAmountMOM.forEach((item) => {
        months.forEach((month) => {
          totalObj[month] += item.stats?.[month] ?? 0;
        });
      });

      return totalObj;
    }, [refundAmountMOM, months]);

  // Helper to format month (e.g., "2025-11" -> "Nov 2025")
  const formatMonth = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  // Prepare CSV data
  

  // Generate CSV headers dynamically
  const csvHeaders = React.useMemo(() => {
    const headers = [
      { label: "#", key: "id" },
      { label: "Center", key: "center" },
    ];

    months.forEach((month) => {
      headers.push({
        label: formatMonth(month),
        key: month,
      });
    });

    return headers;
  }, [months]);



  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [{ value: "ALL", label: "All Centers" }]
      : []),
    ...(user?.centerAccess?.map((id) => ({
      value: id,
      label:
        user?.userCenters?.find((c) => c._id === id)?.title || "Unknown Center",
    })) || []),
  ];


  const filteredData = React.useMemo(() => {
  if (!refundAmountMOM) return [];

  if (selectedCenter === "ALL") return refundAmountMOM;

  return refundAmountMOM.filter(
    (item) => item.center === selectedCenter
  );
}, [refundAmountMOM, selectedCenter]);


const pieChartData = React.useMemo(() => {
  return filteredData.map((item) => ({
    name:
      user?.userCenters?.find((c) => c._id === item.center)?.title ||
      item.center,
    value: months.reduce(
      (sum, month) => sum + (item.stats?.[month] ?? 0),
      0
    ),
  }));
}, [filteredData, months, user]);

const monthWiseChartData = React.useMemo(() => {
  return months
    .slice()
    .reverse()
    .map((month) => {
      const row = {
        month: formatMonth(month),
      };

      filteredData.forEach((item) => {
        const centerName =
          user?.userCenters?.find((c) => c._id === item.center)?.title ||
          item.center;

        row[centerName] = item.stats?.[month] ?? 0;
      });

      row.Total = filteredData.reduce(
        (sum, item) => sum + (item.stats?.[month] ?? 0),
        0
      );

      return row;
    });
}, [filteredData, months, user]);

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#A4DE6C",
  "#D0ED57",
  "#FFC658",
];
const prepareCsvData = () => {
  setCsvLoading(true);

  const formatted = filteredData.map((item, idx) => {
    const centerName =
      user?.userCenters?.find((c) => c._id === item.center)?.title ||
      item.center;

    const row = {
      id: idx + 1,
      center: centerName,
    };

    months.forEach((month) => {
      row[month] = item.stats?.[month] ?? 0;
    });

    return row;
  });

  // Add total row
  const totalRow = {
    id: "",
    center: "Total",
  };

  months.forEach((month) => {
    totalRow[month] = filteredData.reduce(
      (sum, item) => sum + (item.stats?.[month] ?? 0),
      0
    );
  });

  if(selectedCenter==="ALL"){
  setCsvData([...formatted, totalRow]);

  }else{
    setCsvData([...formatted]);
  }

  setTimeout(() => {
    csvRef.current.link.click();
    setCsvLoading(false);
  }, 100);
};

  return (
    <div className="w-100 chat-main-container-width mt-4 mt-sm-0">
      <div className="row">
        <div className="col-12">
          <div className="p-3">
            <div className="row align-items-center">
              <div className="col-sm-6 col-8">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                        <i className="bx bx-bar-chart-alt-2 fs-1"></i>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <h6 className="text-truncate mb-0 fs-18">
                          Refund Amount - Month on Month
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-sm-6 col-4">
                <div className="d-flex justify-content-end">
                  <Button
                    color="info"
                    onClick={prepareCsvData}
                    disabled={
                      csvLoading ||
                      loading ||
                      !refundAmountMOM ||
                      refundAmountMOM.length === 0
                    }
                    className="w-auto"
                  >
                    {csvLoading ? "Preparing CSV..." : "Export CSV"}
                  </Button>
                  <CSVLink
                    data={csvData || []}
                    filename="refund-amount-mom.csv"
                    headers={csvHeaders}
                    className="d-none"
                    ref={csvRef}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 p-lg-4">
            <Row className="g-2 align-items-center mb-4">
                <Col md={2}>
                  <Select
                    value={
                      centerOptions.find((o) => o.label === selectedCenter) ||
                      centerOptions[0]
                    }
                    onChange={(opt) => {
                      if (opt.label==="All Centers"){
                        setSelectedCenter("ALL")
                      }else{
                      setSelectedCenter(opt.label);
                    }
                    }}
                    options={centerOptions}
                    placeholder="Center..."
                  />
                </Col>
              </Row>
            <Card>
              <CardBody>
                {loading && (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="mt-2 text-muted">Loading data...</p>
                  </div>
                )}

                {error && !loading && <Alert color="danger">{error}</Alert>}

                {!loading && !error && (
                  <div
                    className="table-responsive"
                    style={{
                      overflowX: "auto",
                      WebkitOverflowScrolling: "touch",
                      maxWidth: "100%",
                      display: "block",
                    }}
                  >
                    <Table
                      className="table table-bordered table-hover mb-0 align-middle"
                      style={{ minWidth: "max-content" }}
                    >
                      <thead className="table-light">
                        <tr>
                          <th className="text-center">#</th>
                          <th className="text-center">Center</th>
                          {months.map((month) => (
                            <th key={month} className="text-center">
                              {formatMonth(month)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                          {filteredData && filteredData.length > 0 ? (
                            <>
                              {filteredData.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="text-center">{idx + 1}</td>
                                  <td className="text-center">{item.center}</td>
                                  {months.map((month) => {
                                    const value = item.stats?.[month] ?? 0;

                                    return (
                                      <td key={month} className="text-center">
                                        <strong>{value}</strong>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                              {selectedCenter==="ALL"?<tr className="table-primary fw-bold">
                                <td className="text-center">-</td>
                                <td className="text-center">Total</td>
                                {months.map((month) => (
                                  <td key={month} className="text-center">
                                    <strong>{totals[month] ?? 0}</strong>
                                  </td>
                                ))}
                              </tr>:<></>}
                              
                            </>
                          ): (
                          <tr>
                            <td
                              colSpan={months.length + 2}
                              className="text-center text-muted"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>


                    <Row className="mb-4">
                                  <Col lg={6} className="mb-4 mb-lg-0">
                                    <Card>
                                      <CardBody>
                                        <h5 className="mb-3">Refund Distribution by Center</h5>

                                        <div style={{ width: "100%", height: 350 }}>
                                          <ResponsiveContainer>
                                            <PieChart>
                                              <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={110}
                                                dataKey="value"
                                                label={({ name, percent }) =>
                                                  `${name} (${(percent * 100).toFixed(0)}%)`
                                                }
                                              >
                                                {pieChartData.map((entry, index) => (
                                                  <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                  />
                                                ))}
                                              </Pie>
                                              <Tooltip />
                                              <Legend />
                                            </PieChart>
                                          </ResponsiveContainer>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  </Col>

                                  <Col lg={6}>
                                    <Card>
                                      <CardBody>
                                        <h5 className="mb-3">Monthly Refund Amount Trend</h5>

                                        <div style={{ width: "100%", height: 350 }}>
                                          <ResponsiveContainer>
                                            <BarChart data={monthWiseChartData}>
                                              <CartesianGrid strokeDasharray="3 3" />
                                              <XAxis dataKey="month" />
                                              <YAxis />
                                              <Tooltip />
                                              <Legend />
                                              <Bar dataKey={selectedCenter==="ALL"?"Total":selectedCenter} fill="#8884d8" />
                                            </BarChart>
                                          </ResponsiveContainer>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  </Col>
                                  {/* <Card>
                                  <CardBody>
                                    <h5 className="mb-3">Monthly Trend</h5>

                                    <div style={{ width: "100%", height: 350 }}>
                                      <ResponsiveContainer>
                                        <LineChart data={monthWiseChartData}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="month" />
                                          <YAxis />
                                          <Tooltip />
                                          <Legend />

                                          {filteredData.map((item, index) => {
                                            const centerName =
                                              user?.userCenters?.find((c) => c._id === item.center)?.title ||
                                              item.center;

                                            return (
                                              <Line
                                                key={centerName}
                                                type="monotone"
                                                dataKey={centerName}
                                                stroke={COLORS[index % COLORS.length]}
                                                strokeWidth={3}
                                              />
                                            );
                                          })}
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </CardBody>
                                </Card> */}
                                </Row>
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

export default RefundAmountMOM;
