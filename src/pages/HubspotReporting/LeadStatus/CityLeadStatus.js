import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCityLeadStatus } from "../../../store/features/miReporting/miReportingSlice";
import { Table, Card, CardBody } from "reactstrap";
import Loader from "../../../Components/Common/Loader";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import "flatpickr/dist/plugins/monthSelect/style.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";

const CityLeadStatus = () => {
  const dispatch = useDispatch();
  const { cityLeadStatus, loading } = useSelector((state) => state.MIReporting);
  const [date, setDate] = useState(moment().format("YYYY-MM"));

  useEffect(() => {
    dispatch(fetchCityLeadStatus({ date }));
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
    cityLeadStatus.forEach((item) => {
      if (item.leadStatus) {
        Object.keys(item.leadStatus).forEach((s) => statuses.add(s));
      }
    });
    return Array.from(statuses).sort();
  };

  const uniqueStatuses = getAllStatuses();

  return (
    <React.Fragment>
      <div className="w-100 overflow-hidden user-chat mt-4 mt-sm-0 ms-lg-1">
        <div className="chat-content d-lg-flex">
          <div className="w-100 overflow-hidden position-relative">
            <div className="position-relative">
              <div className="p-3 user-chat-topbar">
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
                              City Lead Status Analytics
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
                          mode: "single",
                          dateFormat: "Y-m",
                          defaultDate: [date],
                          plugins: [
                            new monthSelectPlugin({
                              shorthand: true,
                              dateFormat: "Y-m",
                              altFormat: "F Y",
                              theme: "light",
                            }),
                          ],
                        }}
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="position-relative" id="users-chat">
                <div className="p-3 p-lg-4">
                  <Card>
                    <CardBody>
                      {loading ? (
                        <Loader />
                      ) : (
                        <div className="table-responsive">
                          <Table className="table-bordered table-nowrap table-hover">
                            <thead>
                              <tr>
                                <th>Center</th>
                                {uniqueStatuses.map((s) => (
                                  <th key={s}>{s}</th>
                                ))}
                                <th>Total excluding Unrelated</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cityLeadStatus.length > 0 ? (
                                cityLeadStatus.map((item, index) => (
                                  <tr key={index}>
                                    <td>{item.center}</td>
                                    {uniqueStatuses.map((s) => (
                                      <td key={s}>
                                        {item.leadStatus && item.leadStatus[s]
                                          ? item.leadStatus[s]
                                          : 0}
                                      </td>
                                    ))}
                                    <td className="fw-bold">
                                      {item["Total excluding Unrelated"]}
                                    </td>
                                    <td className="fw-bold">{item.overall}</td>
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
        </div>
      </div>
    </React.Fragment>
  );
};

export default CityLeadStatus;
