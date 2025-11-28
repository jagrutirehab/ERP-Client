import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert } from "reactstrap";
import { fetchCenterLeadsMoM } from "../../../store/features/miReporting/miReportingSlice";

const CenterLeadsMoM = () => {
  const dispatch = useDispatch();
  const { centerLeadsMoM, loading, error } = useSelector(
    (state) => state.MIReporting
  );

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

  return (
    <div className="w-100 overflow-hidden user-chat mt-4 mt-sm-0 ms-lg-1">
      <div className="chat-content d-lg-flex">
        <div className="w-100 overflow-hidden position-relative">
          <div className="position-relative">
            <div className="p-3 user-chat-topbar">
              <div className="row align-items-center">
                <div className="col-sm-4 col-8">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                          <i className="bx bx-bar-chart-alt-2 fs-1"></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className="mb-0 fs-18">
                            Center Leads - Month on Month
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="position-relative" id="users-chat">
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
                      <div className="table-responsive">
                        <Table className="table table-bordered table-hover mb-0 align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Center</th>
                              {months.map((month) => (
                                <th key={month} className="text-end">
                                  {formatMonth(month)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {centerLeadsMoM && centerLeadsMoM.length > 0 ? (
                              centerLeadsMoM.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{item.center}</td>
                                  {months.map((month) => {
                                    const stat = item.stats?.find(
                                      (s) => s.month === month
                                    );
                                    return (
                                      <td key={month} className="text-end">
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
      </div>
    </div>
  );
};

export default CenterLeadsMoM;
