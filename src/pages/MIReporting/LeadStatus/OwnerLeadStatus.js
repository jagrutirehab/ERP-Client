import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOwnerLeadStatus } from "../../../store/features/miReporting/miReportingSlice";
import { Table, Card, CardBody, Button } from "reactstrap";
import { CSVLink } from "react-csv";
import Loader from "../../../Components/Common/Loader";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import "flatpickr/dist/plugins/monthSelect/style.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";

const OwnerLeadStatus = () => {
  const dispatch = useDispatch();
  const { ownerLeadStatus, loading } = useSelector(
    (state) => state.MIReporting
  );
  const [date, setDate] = useState(moment().format("YYYY-MM"));

  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchOwnerLeadStatus({ date }));
  }, [dispatch, date]);

  const handleDateChange = (selectedDates) => {
    if (selectedDates.length > 0) {
      const selectedDate = moment(selectedDates[0]).format("YYYY-MM");
      setDate(selectedDate);
    }
  };

  // Helper to get all unique lead statuses for column headers
  const getAllStatuses = () => {
    const statuses = new Set();
    ownerLeadStatus.forEach((item) => {
      if (item.leadStatus) {
        Object.keys(item.leadStatus).forEach((s) => statuses.add(s));
      }
    });
    return Array.from(statuses).sort();
  };

  const uniqueStatuses = getAllStatuses();

  // Prepare CSV data
  const prepareCsvData = () => {
    setCsvLoading(true);

    const formatted = ownerLeadStatus.map((item, idx) => {
      const row = {
        id: idx + 1,
        ownerName: item.ownerName,
      };

      // Add each status as a column
      uniqueStatuses.forEach((status) => {
        row[status] =
          item.leadStatus && item.leadStatus[status]
            ? item.leadStatus[status]
            : 0;
      });

      row["Total excluding Unrelated"] = item["Total excluding Unrelated"];
      row["Total"] = item.overall;

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

    uniqueStatuses.forEach((status) => {
      headers.push({
        label: status,
        key: status,
      });
    });

    headers.push(
      { label: "Total excluding Unrelated", key: "Total excluding Unrelated" },
      { label: "Total", key: "Total" }
    );

    return headers;
  }, [uniqueStatuses]);

  return (
    <React.Fragment>
      <div className="w-100 chat-main-container-width mt-4 mt-sm-0">
        <div className="row p-3">
          <div className="col-12">
            <div
              // style={{
              //   maxWidth: "calc(100% - 280px)",
              // }}
              className="p-3"
            >
              <div className="row align-items-center">
                <div className="col-sm-8 col-8">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                          <i className="bx bx-user-check fs-1"></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className="text-truncate mb-0 fs-18">
                            Owner Lead Status
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4 col-4">
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
                        !ownerLeadStatus ||
                        ownerLeadStatus.length === 0
                      }
                      className="w-auto"
                    >
                      {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                      data={csvData || []}
                      filename={`owner-lead-status-${date}.csv`}
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
                      }}
                    >
                      <Table
                        className="table table-bordered table-hover mb-0 align-middle"
                        style={{ minWidth: "max-content" }}
                      >
                        <thead>
                          <tr>
                            <th className="text-center">Owner Name</th>
                            {uniqueStatuses.map((s) => (
                              <th key={s} className="text-center">
                                {s}
                              </th>
                            ))}
                            <th className="text-center">
                              Total excluding Unrelated
                            </th>
                            <th className="text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ownerLeadStatus.length > 0 ? (
                            ownerLeadStatus.map((item, index) => (
                              <tr key={index}>
                                <td className="text-center">
                                  {item.ownerName}
                                </td>
                                {uniqueStatuses.map((s) => (
                                  <td key={s} className="text-center">
                                    {item.leadStatus && item.leadStatus[s]
                                      ? item.leadStatus[s]
                                      : 0}
                                  </td>
                                ))}
                                <td className="text-center fw-bold">
                                  {item["Total excluding Unrelated"]}
                                </td>
                                <td className="text-center fw-bold">
                                  {item.overall}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={uniqueStatuses.length + 3}
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

export default OwnerLeadStatus;
