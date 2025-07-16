import React, { useEffect, useState, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { useDispatch, connect } from "react-redux";
import { fetchDashboardAnalytics } from "../../store/actions";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css"; // You can choose different themes

const PatientInfo = ({ data, loading, centerAccess }) => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const flatpickrRef = useRef(null);

  useEffect(() => {
    // Initial fetch with current date range
    if (dateRange[0] && dateRange[1]) {

      dispatch(
        fetchDashboardAnalytics({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          centerAccess: JSON.stringify(centerAccess),
        })
      );
    }
  }, [dispatch, dateRange, centerAccess]);

  const handleDateRangeChange = (selectedDates) => {
    if (selectedDates && selectedDates.length === 2) {
      setDateRange(selectedDates);
    }
  };

  return (
    <React.Fragment>
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Dashboard</h5>
                <div className="d-flex align-items-center">
                  {/* <label className="me-2 mb-0">Date Range:</label> */}
                  <Flatpickr
                    ref={flatpickrRef}
                    value={dateRange}
                    options={{
                      mode: "range",
                      dateFormat: "Y-m-d",
                      enableTime: false,
                      maxDate: "today",
                      defaultDate: dateRange,
                      onChange: handleDateRangeChange,
                    }}
                    className="form-control"
                    placeholder="Select date range"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Patient Analytics</h5>
              <ReactECharts
                loading={loading}
                option={{
                  title: {
                    // text: "Patient Analytics",
                  },
                  tooltip: {
                    trigger: "axis",
                  },
                  legend: {
                    data: [
                      "Admissions",
                      "Discharges",
                      "Total Patients",
                      "New Patients",
                      "Repeat Patients",
                      "Total OPD Patients",
                      "New OPD Patients",
                      "Repeat OPD Patients",
                    ],
                  },
                  grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true,
                  },
                  xAxis: {
                    type: "category",
                    boundaryGap: false,
                    data:
                      data?.timeSeries?.admissions?.map(
                        (item) => item._id.date
                      ) || [],
                  },
                  yAxis: {
                    type: "value",
                  },
                  series: [
                    {
                      name: "Admissions",
                      type: "line",
                      data:
                        data?.timeSeries?.admissions?.map(
                          (item) => item.count
                        ) || [],
                    },
                    {
                      name: "Discharges",
                      type: "line",
                      data:
                        data?.timeSeries?.discharges?.map(
                          (item) => item.count
                        ) || [],
                    },
                    {
                      name: "Total Patients",
                      type: "line",
                      data:
                        data?.timeSeries?.repeatCustomers?.map(
                          (item) => item.totalPatients
                        ) || [],
                    },
                    {
                      name: "New Patients",
                      type: "line",
                      data:
                        data?.timeSeries?.repeatCustomers?.map(
                          (item) => item.newPatients
                        ) || [],
                    },
                    {
                      name: "Repeat Patients",
                      type: "line",
                      data:
                        data?.timeSeries?.repeatCustomers?.map(
                          (item) => item.repeatPatients
                        ) || [],
                    },
                    {
                      name: "Total OPD Patients",
                      type: "line",
                      data:
                        data?.timeSeries?.opdPatients?.map(
                          (item) => item.totalOPDPatients
                        ) || [],
                    },
                    {
                      name: "New OPD Patients",
                      type: "line",
                      data:
                        data?.timeSeries?.opdPatients?.map(
                          (item) => item.newOPDPatients
                        ) || [],
                    },
                    {
                      name: "Repeat OPD Patients",
                      type: "line",
                      data:
                        data?.timeSeries?.opdPatients?.map(
                          (item) => item.repeatOPDPatients
                        ) || [],
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">ECharts Example</h5>
              <ReactECharts
                option={{
                  title: {
                    text: "Bar Chart",
                  },
                  tooltip: {},
                  xAxis: {
                    data: [
                      "Shirts",
                      "Cardigans",
                      "Chiffons",
                      "Pants",
                      "Heels",
                      "Socks",
                    ],
                  },
                  yAxis: {},
                  series: [
                    {
                      name: "Sales",
                      type: "bar",
                      data: [5, 20, 36, 10, 10, 20],
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  centerAccess: state.User.centerAccess,
  data: state.Dashboard.data,
  loading: state.Dashboard.loading,
});

export default connect(mapStateToProps)(PatientInfo);
