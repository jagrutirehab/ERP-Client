import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { connect, useDispatch } from "react-redux";
import { fetchCenterBedsAnalytics } from "../../../../store/actions";

const getDisplayName = (center) =>
  center?.displayName || center?.title || center?.name || "Unnamed Center";

const getProgressClass = (percentage) => {
  if (percentage > 100) {
    return "bg-danger";
  }
  if (percentage > 90) {
    return "bg-success";
  }
  if (percentage > 70) {
    return "bg-primary";
  }
  if (percentage > 50) {
    return "bg-warning";
  }
  return "bg-danger";
};

const CenterBedsAnalytics = ({ data, loading, centerAccess }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (centerAccess && centerAccess.length) {
      dispatch(fetchCenterBedsAnalytics(centerAccess));
    }
  }, [dispatch, centerAccess]);

  const overview = useMemo(() => {
    if (!data || !data.length) {
      return {
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        occupancyPercent: 0,
      };
    }

    const totals = data.reduce(
      (acc, center) => {
        const totalBeds = center.totalBeds || 0;
        const occupiedBeds = center.occupiedBeds || 0;
        const availableBeds = center.availableBeds || 0;

        acc.totalBeds += totalBeds;
        acc.occupiedBeds += occupiedBeds;
        acc.availableBeds += availableBeds;
        return acc;
      },
      { totalBeds: 0, occupiedBeds: 0, availableBeds: 0 }
    );

    return {
      ...totals,
      occupancyPercent: totals.totalBeds
        ? Math.round((totals.occupiedBeds / totals.totalBeds) * 100)
        : 0,
    };
  }, [data]);

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

        {!loading && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-3">
                <div>
                  <h5 className="mb-1">All Centers Overview</h5>
                  <p className="text-muted mb-0">
                    Combined bed capacity across the centers you can access.
                  </p>
                </div>
                <div className="d-flex flex-wrap text-center gap-4">
                  <div>
                    <span className="text-muted small d-block">Total Beds</span>
                    <span className="fs-4 fw-semibold">
                      {overview.totalBeds}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted small d-block">
                      Occupied Beds
                    </span>
                    <span className="fs-4 fw-semibold text-primary">
                      {overview.occupiedBeds}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted small d-block">
                      Available Beds
                    </span>
                    <span className="fs-4 fw-semibold text-success">
                      {overview.availableBeds}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Occupancy</span>
                  <span className="fw-semibold">
                    {overview.occupancyPercent}% occupied
                  </span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className={`progress-bar ${getProgressClass(
                      overview.occupancyPercent
                    )}`}
                    role="progressbar"
                    style={{
                      width: `${Math.min(overview.occupancyPercent, 100)}%`,
                    }}
                    aria-valuenow={overview.occupancyPercent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                {overview.occupancyPercent > 100 && (
                  <p className="text-danger small mt-2 mb-0">
                    Occupancy exceeds total capacity. Please review assigned
                    beds.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
                            className={`progress-bar ${getProgressClass(
                              occupancyPercent
                            )}`}
                            role="progressbar"
                            style={{
                              width: `${Math.min(occupancyPercent, 100)}%`,
                            }}
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
                      {occupancyPercent > 100 && (
                        <p className="text-danger small mt-3 mb-0">
                          Occupancy exceeds total capacity for this center.
                        </p>
                      )}
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
