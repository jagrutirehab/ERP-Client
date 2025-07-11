import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { connect, useDispatch } from "react-redux";
import { fetchDashboardAnalytics } from "../../../../store/actions";
import MonthTillDate from "../../../DashboardEcommerce/DashBoardTable/MonthTillDate";
import MonthOnMonthTable from "../../../DashboardEcommerce/DashBoardTable/MonthOnMonth";
import PropTypes from "prop-types";

const Dashboard = ({ centers, data, loading }) => {
  const dispatch = useDispatch();
  const [selectedCenterId, setSelectedCenterId] = useState("");

  useEffect(() => {
    if (selectedCenterId) {
      dispatch(fetchDashboardAnalytics(selectedCenterId));
    }
  }, [selectedCenterId, dispatch]);

  const handleSelectCenter = (event) => {
    const centerId = event.target.value;
    setSelectedCenterId(centerId);
  };

  console.log(data, "data");

  return (
    <React.Fragment>
      <div className="mt-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                <h4 className="mb-sm-0 font-size-18">Dashboard</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="mb-3">
                  <label
                    htmlFor="centerSelect"
                    className="form-label fw-semibold"
                  >
                    Select a Center
                  </label>
                  <select
                    id="centerSelect"
                    className="form-select"
                    onChange={handleSelectCenter}
                    value={selectedCenterId}
                  >
                    <option value="">Select a Center</option>
                    {centers &&
                      centers.map((center) => (
                        <option key={center._id} value={center._id}>
                          {center.title}
                        </option>
                      ))}
                  </select>
                </div>

                {loading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading dashboard data...</p>
                  </div>
                )}

                {!loading && !selectedCenterId && (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      Please select a center to view dashboard analytics.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {!loading && data && (
          <div className="row">
            <div className="col-md-12 mb-3">
              <MonthTillDate
                centerId={selectedCenterId}
                data={data?.monthTillDate}
              />
            </div>
            <div className="col-md-12">
              <MonthOnMonthTable
                centerId={selectedCenterId}
                data={data?.monthOnMonth}
              />
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  data: PropTypes.any,
  loading: PropTypes.bool,
  centers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ),
};

Dashboard.defaultProps = {
  data: null,
  loading: false,
  centers: [],
};

const mapStateToProps = (state) => ({
  data: state.Dashboard?.data || null,
  loading: state.Dashboard?.loading || false,
  centers:
    state.Center?.data?.map((center) => ({
      title: center.title,
      _id: center._id,
    })) || [],
});

export default connect(mapStateToProps)(Dashboard);
