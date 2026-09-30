import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button } from "reactstrap";
import { CSVLink } from "react-csv";
import { fetchCenterLeadsMoM } from "../../../store/features/miReporting/miReportingSlice";

const CenterLeadsMoM = () => {
  const dispatch = useDispatch();
  const { centerLeadsMoM, loading, error } = useSelector(
    (state) => state.MIReporting
  );

  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchCenterLeadsMoM());
  }, [dispatch]);

  // Extract unique months and sort them descending
  const months = React.useMemo(() => {
    if (!centerLeadsMoM || centerLeadsMoM.length === 0) return [];
    const allMonths = new Set();
    centerLeadsMoM.forEach((item) => {
      if (item.stats) {
        item.stats.forEach((stat) => allMonths.add(stat.month));
      }
    });
    return Array.from(allMonths).sort().reverse();
  }, [centerLeadsMoM]);

  // Helper to format month (e.g., "2025-11" -> "Nov 2025")
  const formatMonth = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  // Prepare CSV data
  const prepareCsvData = () => {
    setCsvLoading(true);

    const formatted = centerLeadsMoM.map((item, idx) => {
      const row = {
        id: idx + 1,
        center: item.center,
      };

      // Add each month's count as a column
      months.forEach((month) => {
        const stat = item.stats?.find((s) => s.month === month);
        row[month] = stat ? stat.count : 0;
      });

      return row;
    });

    setCsvData(formatted);

    // Trigger download
    setTimeout(() => {
      csvRef.current.link.click();
      setCsvLoading(false);
    }, 100);
  };

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
                          Center Leads - Month on Month
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
                      !centerLeadsMoM ||
                      centerLeadsMoM.length === 0
                    }
                    className="w-auto"
                  >
                    {csvLoading ? "Preparing CSV..." : "Export CSV"}
                  </Button>
                  <CSVLink
                    data={csvData || []}
                    filename="center-leads-mom.csv"
                    headers={csvHeaders}
                    className="d-none"
                    ref={csvRef}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 p-lg-4">
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
                        {centerLeadsMoM && centerLeadsMoM.length > 0 ? (
                          centerLeadsMoM.map((item, idx) => (
                            <tr key={idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td className="text-center">{item.center}</td>
                              {months.map((month) => {
                                const stat = item.stats?.find(
                                  (s) => s.month === month
                                );
                                return (
                                  <td key={month} className="text-center">
                                    <strong>{stat ? stat.count : 0}</strong>
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        ) : (
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

export default CenterLeadsMoM;
