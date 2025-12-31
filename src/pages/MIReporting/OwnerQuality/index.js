import React, { useEffect, useRef, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect/index";
import "flatpickr/dist/plugins/monthSelect/style.css";
import moment from "moment";

import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button } from "reactstrap";
import { CSVLink } from "react-csv";
import { fetchOwnerQualityBreakdown } from "../../../store/features/miReporting/miReportingSlice";

const OwnerQuality = () => {
  const dispatch = useDispatch();
  const { ownerQuality, loading, error } = useSelector(
    (state) => state.MIReporting
  );

  const [selectedMonth, setSelectedMonth] = useState(
    moment().format("YYYY-MM")
  );

  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchOwnerQualityBreakdown({ date: selectedMonth }));
  }, [dispatch, selectedMonth]);

  console.log({ selectedMonth });

  const handleDateChange = (selectedDates) => {
    if (selectedDates.length > 0) {
      const selectedDate = moment(selectedDates[0]).format("YYYY-MM");
      setSelectedMonth(selectedDate);
    }
  };

  // Prepare CSV data
  const prepareCsvData = () => {
    setCsvLoading(true);

    const formatted = ownerQuality.map((item, idx) => ({
      id: idx + 1,
      ownerName: item.ownerName || "Not Assigned",
      Hot: item.Hot || 0,
      Unrelated: item.Unrelated || 0,
      Normal: item.Normal || 0,
      Cold: item.Cold || 0,
      Blank: item.Blank || 0,
      "Total excluding Unrelated": item["Total excluding Unrelated"] || 0,
      Overall: item.overall || 0,
    }));

    // Add totals row
    const totalsRow = {
      id: "",
      ownerName: "Total",
      Hot: ownerQuality.reduce((sum, item) => sum + (item.Hot || 0), 0),
      Unrelated: ownerQuality.reduce(
        (sum, item) => sum + (item.Unrelated || 0),
        0
      ),
      Normal: ownerQuality.reduce((sum, item) => sum + (item.Normal || 0), 0),
      Cold: ownerQuality.reduce((sum, item) => sum + (item.Cold || 0), 0),
      Blank: ownerQuality.reduce((sum, item) => sum + (item.Blank || 0), 0),
      "Total excluding Unrelated": ownerQuality.reduce(
        (sum, item) => sum + (item["Total excluding Unrelated"] || 0),
        0
      ),
      Overall: ownerQuality.reduce((sum, item) => sum + (item.overall || 0), 0),
    };

    setCsvData([...formatted, totalsRow]);

    // Trigger download
    setTimeout(() => {
      csvRef.current.link.click();
      setCsvLoading(false);
    }, 100);
  };

  // Generate CSV headers
  const csvHeaders = [
    { label: "#", key: "id" },
    { label: "Owner Name", key: "ownerName" },
    { label: "Hot", key: "Hot" },
    { label: "Unrelated", key: "Unrelated" },
    { label: "Normal", key: "Normal" },
    { label: "Cold", key: "Cold" },
    { label: "Blank", key: "Blank" },
    { label: "Total excluding Unrelated", key: "Total excluding Unrelated" },
    { label: "Overall", key: "Overall" },
  ];

  return (
    <div className="w-100 chat-main-container-width mt-4 mt-sm-0">
      <div className="row">
        <div className="col-12">
          <div className="p-3">
            {/* 🔽 Flatpickr Month/Year Selector */}

            {/* <div className="p-3 user-chat-topbar">
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
                        disableMobile: true,
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
                  </div>
                </div>
              </div>
            </div> */}

            <div className="p-3">
              <div className="row align-items-center">
                <div className="col-sm-6 col-8">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                          <i className="bx bx-map fs-1"></i>
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
                  <div className="d-flex gap-2 justify-content-end">
                    <Flatpickr
                      className="form-control"
                      options={{
                        disableMobile: true,
                        mode: "single",
                        dateFormat: "Y-m",
                        defaultDate: [selectedMonth],
                        plugins: [
                          monthSelectPlugin({
                            shorthand: true,
                            dateFormat: "Y-m",
                            altFormat: "F Y",
                            theme: "light",
                          }),
                        ],
                      }}
                      onChange={handleDateChange}
                    />
                    <Button
                      color="info"
                      onClick={prepareCsvData}
                      disabled={
                        csvLoading ||
                        loading ||
                        !ownerQuality ||
                        ownerQuality.length === 0
                      }
                      className="w-auto"
                    >
                      {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                      data={csvData || []}
                      filename={`owner-quality-${selectedMonth}.csv`}
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
                                    (sum, item) => sum + (item.Unrelated || 0),
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
                                      (item["Total excluding Unrelated"] || 0),
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
  );
};

export default OwnerQuality;
