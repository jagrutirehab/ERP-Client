import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect, useDispatch } from "react-redux";
import { fetchCenterBedsAnalytics } from "../../../../store/actions";

const getDisplayName = (center) =>
  center?.displayName || center?.title || center?.name || "Unnamed Center";

const CenterBedsAnalytics = ({ data, loading, centerAccess }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (centerAccess && centerAccess.length) {
      dispatch(fetchCenterBedsAnalytics());
    }
  }, [dispatch, centerAccess]);

  if (!centerAccess || !centerAccess.length) {
    return (
      <div className="pt-4">
        <div className="bg-white p-4 m-n3">
          <h4 className="mb-3">Center Beds Analytics</h4>
          <p className="text-muted mb-0">
            You currently do not have access to any centers. Please contact an
            administrator if this is unexpected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="bg-white p-4 m-n3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
          <div>
            <h4 className="mb-0">Center Beds Analytics</h4>
            <p className="text-muted mb-0">
              Overview of occupied and available beds at your centers.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Fetching center occupancy...</p>
          </div>
        ) : data && data.length ? (
          <div className="row g-4">
            {data.map((center) => {
              const { _id, totalBeds, occupiedBeds, availableBeds } = center;
              const safeTotalBeds = totalBeds || 0;
              const safeOccupiedBeds = occupiedBeds || 0;
              const safeAvailableBeds = availableBeds || 0;
              const occupancyPercent = safeTotalBeds
                ? Math.round((safeOccupiedBeds / safeTotalBeds) * 100)
                : 0;

              let progressClass = "bg-success";
              if (occupancyPercent >= 90) {
                progressClass = "bg-danger";
              } else if (occupancyPercent >= 75) {
                progressClass = "bg-warning";
              }

              return (
                <div className="col-12 col-md-6 col-xl-4" key={_id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="card-title color-primary mb-1">
                            {getDisplayName(center)}
                          </h5>
                          <span className="badge bg-light text-muted">
                            Total Beds: {safeTotalBeds}
                          </span>
                        </div>
                        <span className="badge bg-primary">
                          {occupancyPercent}% occupied
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted small">Occupied</span>
                          <span className="fw-semibold">
                            {safeOccupiedBeds} / {safeTotalBeds}
                          </span>
                        </div>
                        <div className="progress" style={{ height: 6 }}>
                          <div
                            className={`progress-bar ${progressClass}`}
                            role="progressbar"
                            style={{ width: `${occupancyPercent}%` }}
                            aria-valuenow={occupancyPercent}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <span className="text-muted small">
                            Available Beds
                          </span>
                          <div className="fs-5 fw-semibold text-success">
                            {safeAvailableBeds}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted small">
                            Occupied Beds
                          </span>
                          <div className="fs-5 fw-semibold text-primary">
                            {safeOccupiedBeds}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted mb-0">
              No bed occupancy data available for the selected centers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

CenterBedsAnalytics.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      displayName: PropTypes.string,
      name: PropTypes.string,
      totalBeds: PropTypes.number,
      occupiedBeds: PropTypes.number,
      availableBeds: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
  centerAccess: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  ),
};

CenterBedsAnalytics.defaultProps = {
  data: [],
  loading: false,
  centerAccess: [],
};

const mapStateToProps = (state) => ({
  data: state.Report?.centerBeds || [],
  loading: state.Report?.centerBedsLoading || false,
  centerAccess: state.User?.centerAccess || [],
});

export default connect(mapStateToProps)(CenterBedsAnalytics);
