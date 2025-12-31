import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOwnerVisitedDate } from "../../../store/features/miReporting/miReportingSlice";
import { Table, Card, CardBody, Button } from "reactstrap";
import { CSVLink } from "react-csv";
import Loader from "../../../Components/Common/Loader";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import "flatpickr/dist/plugins/monthSelect/style.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";

const OwnerVisitedDate = () => {
  const dispatch = useDispatch();
  const { ownerVisitedDate, loading } = useSelector(
    (state) => state.MIReporting
  );
  const [date, setDate] = useState(moment().format("YYYY-MM"));

  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchOwnerVisitedDate({ date }));
  }, [dispatch, date]);

  const handleDateChange = (selectedDates) => {
    if (selectedDates.length > 0) {
      const selectedDate = moment(selectedDates[0]).format("YYYY-MM");
      setDate(selectedDate);
    }
  };

  // Helper to get all unique dates from the data for column headers
  const getAllDates = () => {
    const dates = new Set();
    ownerVisitedDate.forEach((item) => {
      item.dates.forEach((d) => dates.add(d.date));
    });
    return Array.from(dates).sort();
  };

  const uniqueDates = getAllDates();

  // Prepare CSV data
  const prepareCsvData = () => {
    setCsvLoading(true);

    const formatted = ownerVisitedDate.map((item, idx) => {
      const row = {
        id: idx + 1,
        ownerName: item.ownerName,
      };

      // Add each date as a column
      uniqueDates.forEach((d) => {
        const dateData = item.dates.find((x) => x.date === d);
        row[d] = dateData ? dateData.count : 0;
      });

      row["Total"] = item.total;

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
      { label: "Owner Name", key: "ownerName" },
    ];

    uniqueDates.forEach((d) => {
      headers.push({
        label: d,
        key: d,
      });
    });

    headers.push({ label: "Total", key: "Total" });

    return headers;
  }, [uniqueDates]);

  return (
    <React.Fragment>
      <div className="w-100 chat-main-container-width mt-4 mt-sm-0">
        <div className="row p-3">
          <div className="col-12">
            <div className="p-3">
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
                            Owner Visited Date
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
                        defaultDate: [date],
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
                        !ownerVisitedDate ||
                        ownerVisitedDate.length === 0
                      }
                      className="w-auto"
                    >
                      {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                      data={csvData || []}
                      filename={`owner-visited-date-${date}.csv`}
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
                  {loading ? (
                    <Loader />
                  ) : (
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
                        <thead>
                          <tr>
                            <th className="text-center">Owner Name</th>
                            {uniqueDates.map((d) => (
                              <th key={d} className="text-center">
                                {d}
                              </th>
                            ))}
                            <th className="text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ownerVisitedDate.length > 0 ? (
                            ownerVisitedDate.map((item, index) => (
                              <tr key={index}>
                                <td className="text-center">
                                  {item.ownerName}
                                </td>
                                {uniqueDates.map((d) => {
                                  const dateData = item.dates.find(
                                    (x) => x.date === d
                                  );
                                  return (
                                    <td key={d} className="text-center">
                                      {dateData ? dateData.count : 0}
                                    </td>
                                  );
                                })}
                                <td className="text-center fw-bold">
                                  {item.total}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={uniqueDates.length + 2}
                                className="text-center"
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
    </React.Fragment>
  );
};

export default OwnerVisitedDate;
