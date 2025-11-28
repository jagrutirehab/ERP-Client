import React, { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect/index";
import "flatpickr/dist/plugins/monthSelect/style.css";

import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert } from "reactstrap";
import { fetchOwnerQualityBreakdown } from "../../../store/features/miReporting/miReportingSlice";

const OwnerQuality = () => {
  const dispatch = useDispatch();
  const { ownerQuality, loading, error } = useSelector(
    (state) => state.MIReporting
  );

  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    dispatch(fetchOwnerQualityBreakdown({ date: selectedMonth }));
  }, [dispatch, selectedMonth]);

  console.log({ selectedMonth });

  return (
    <div className="w-100 overflow-hidden user-chat mt-4 mt-sm-0 ms-lg-1">
      <div className="chat-content d-lg-flex">
        <div className="w-100 overflow-hidden position-relative">
          <div className="position-relative">
            {/* 🔽 Flatpickr Month/Year Selector */}

            <div className="p-3 user-chat-topbar">
              <div className="row align-items-center">
                <div className="col-sm-6 col-8">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                          <i className="bx bx-user-check fs-1"></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className="text-truncate mb-0 fs-18">
                            Owner Quality Breakdown
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-4">
                  <div className="p-3 d-flex gap-2">
                    <Flatpickr
                      className="form-control w-auto"
                      options={{
                        plugins: [
                          monthSelectPlugin({
                            shorthand: true, // Jan, Feb, Mar
                            dateFormat: "Y-m", // 2025-11
                            altFormat: "F Y", // November 2025
                          }),
                        ],
                      }}
                      placeholder="Select Month & Year"
                      onChange={(date, str) => setSelectedMonth(str)}
                    />

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        dispatch(fetchOwnerQualityBreakdown(selectedMonth))
                      }
                      disabled={loading}
                    >
                      <i className="mdi mdi-filter me-1"></i>Apply
                    </button>
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
                              <th>Owner Name</th>
                              <th className="text-center">Hot</th>
                              <th className="text-center">Unrelated</th>
                              <th className="text-center">Normal</th>
                              <th className="text-center">Cold</th>
                              <th className="text-center">Blank</th>
                              <th className="text-center">
                                Total excluding Unrelated
                              </th>
                              <th className="text-center">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ownerQuality && ownerQuality.length > 0 ? (
                              <>
                                {ownerQuality.map((item, index) => (
                                  <tr key={index}>
                                    <td>
                                      <strong>
                                        {item.ownerName || "Not Assigned"}
                                      </strong>
                                    </td>
                                    <td className="text-center">
                                      {item.Hot || 0}
                                    </td>
                                    <td className="text-center">
                                      {item.Unrelated || 0}
                                    </td>
                                    <td className="text-center">
                                      {item.Normal || 0}
                                    </td>
                                    <td className="text-center">
                                      {item.Cold || 0}
                                    </td>
                                    <td className="text-center">
                                      {item.Blank || 0}
                                    </td>
                                    <td className="text-center">
                                      <strong className="text-primary">
                                        {item["Total excluding Unrelated"] || 0}
                                      </strong>
                                    </td>
                                    <td className="text-center">
                                      <strong>{item.overall || 0}</strong>
                                    </td>
                                  </tr>
                                ))}
                                {/* Totals Row */}
                                <tr className="table-light fw-bold">
                                  <td>Total</td>
                                  <td className="text-center">
                                    {ownerQuality.reduce(
                                      (sum, item) => sum + (item.Hot || 0),
                                      0
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {ownerQuality.reduce(
                                      (sum, item) =>
                                        sum + (item.Unrelated || 0),
                                      0
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {ownerQuality.reduce(
                                      (sum, item) => sum + (item.Normal || 0),
                                      0
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {ownerQuality.reduce(
                                      (sum, item) => sum + (item.Cold || 0),
                                      0
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {ownerQuality.reduce(
                                      (sum, item) => sum + (item.Blank || 0),
                                      0
                                    )}
                                  </td>
                                  <td className="text-center text-primary">
                                    {ownerQuality.reduce(
                                      (sum, item) =>
                                        sum +
                                        (item["Total excluding Unrelated"] ||
                                          0),
                                      0
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {ownerQuality.reduce(
                                      (sum, item) => sum + (item.overall || 0),
                                      0
                                    )}
                                  </td>
                                </tr>
                              </>
                            ) : (
                              <tr>
                                <td
                                  colSpan="8"
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

export default OwnerQuality;
