import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Loader from "../Components/Common/Loader";

const LoaderModule = ({
  userLoader,
  centerLoader,
  leadLoader,
  patientLoader,
  medicineLoader,
  chartLoader,
  generalChartLoader,
  billLoader,
  timelineLoader,
  recyclebinLoader,
  settingLoader,
  bookingLoader,
  reportLoader,
  notificationLoader,
  internLoader,
}) => {
  const isLoading =
    userLoader ||
    centerLoader ||
    leadLoader ||
    patientLoader ||
    // medicineLoader ||
    chartLoader ||
    // generalChartLoader ||
    billLoader ||
    timelineLoader ||
    recyclebinLoader ||
    // settingLoader ||
    bookingLoader ||
    reportLoader ||
    internLoader;
  // || notificationLoader;

  return <React.Fragment>{isLoading && <Loader />}</React.Fragment>;
};

const mapStateToProps = (state) => ({
  userLoader: state.User.profileLoading,
  centerLoader: state.Center.loading,
  leadLoader: state.Lead.loading,
  medicineLoader: state.Medicine.loading,
  patientLoader: state.Patient.loading,
  chartLoader: state.Chart.loading,
  generalChartLoader: state.Chart.generalChartLoading,
  billLoader: state.Bill.loading,
  timelineLoader: state.Timeline.loading,
  recyclebinLoader: state.Recyclebin.loading,
  settingLoader: state.Setting.loading,
  bookingLoader: state.Booking.loading,
  reportLoader: state.Report.loading,
  notificationLoader: state.Notification.loading,
  internLoader: state.Intern.loading,
});

LoaderModule.propTypes = {
  userLoader: PropTypes.bool,
  centerLoader: PropTypes.bool,
  leadLoader: PropTypes.bool,
  medicineLoader: PropTypes.bool,
  patientLoader: PropTypes.bool,
  chartLoader: PropTypes.bool,
  generalChartLoader: PropTypes.bool,
  billLoader: PropTypes.bool,
  timelineLoader: PropTypes.bool,
  recyclebinLoader: PropTypes.bool,
  settingLoader: PropTypes.bool,
  bookingLoader: PropTypes.bool,
  reportLoader: PropTypes.bool,
  notificationLoader: PropTypes.bool,
};

export default connect(mapStateToProps)(LoaderModule);
