import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import PropTypes from "prop-types";
// import DashBoardTable from './DashBoardTable/DashBoard'
import DashBoardTable from "./DashBoardTable/MonthOnMonth";
import MonthOnMonthTable from "./DashBoardTable/MonthTillDate";
import {
  fetchAllPatients,
  fetchBillItems,
  fetchBillNotification,
  fetchCenters,
  fetchMedicines,
  fetchPaymentAccounts,
  fetchUserLogs,
} from "../../store/actions";
import { connect, useDispatch } from "react-redux";
import store from "../../store/store";
import { endOfDay, startOfDay } from "date-fns";
import { TIMELINE_VIEW } from "../../Components/constants/patient";
import axios from "axios";

const DashboardEcommerce = ({
  user,
  users,
  pageAccess,
  userCenters,
  centers,
  logs,
  patients,
  loading,
}) => {
  const dispatch = useDispatch();
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [selectedCenterId, setSelectedCenterId] = useState(null);

  const [date, setDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const access = pageAccess
    ?.find((pg) => pg.name === "Patient")
    ?.subAccess?.find((sub) => sub.name.toUpperCase() === TIMELINE_VIEW);
  const handleSelectCenter = (e) => {
    const selectedId = e.target.value;
    setSelectedCenterId(selectedId);
  };
  useEffect(() => {
     const authUser = localStorage.getItem("authUser");
    const token = authUser ? JSON.parse(authUser).token : null;
    const headerSet =
      axios.defaults.headers.common["Authorization"] === `Bearer ${token}`;

    if (token && headerSet && user) {
      dispatch(fetchCenters(user?.centerAccess));
    }
  }, [dispatch, user]);

  useEffect(() => {
   const authUser = store.getState().User.user;
    const token = authUser ? authUser.token : null;
    const headerSet =
      axios.defaults.headers.common["Authorization"] === `Bearer ${token}`;

    if (token && headerSet) {
      if (!patients.length) dispatch(fetchAllPatients());
      dispatch(fetchMedicines());

      if (userCenters) {
        dispatch(fetchBillItems(userCenters));
        dispatch(fetchPaymentAccounts(userCenters));
        dispatch(fetchBillNotification(userCenters));
      }
    }
  }, [dispatch, userCenters, patients]);

  useEffect(() => {
    const authUser = store.getState().User.user;
    const token = authUser ? authUser.token : null;
    const headerSet =
      axios.defaults.headers.common["Authorization"] === `Bearer ${token}`;

    if (token && headerSet && access && userCenters) {
      dispatch(
        fetchUserLogs({
          ...date,
          centerAccess: JSON.stringify(userCenters),
          users: JSON.stringify(selectedOptions?.length && selectedOptions[0]),
        })
      );
    }
  }, [dispatch, access, date, userCenters, selectedOptions]);

  document.title = "Dashboard";

  const [selectedComponent, setSelectedComponent] = useState("");

  const handleSelectChange = (e) => {
    setSelectedComponent(e.target.value);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid></Container>
        <label htmlFor="centerSelect" className="form-label fw-semibold">
          Select a Center
        </label>
        <select
          id="centerSelect"
          className="form-select"
          onChange={handleSelectCenter}
          value={selectedCenterId}
        >
          <option value="">Select a Center</option>
          {centers.map((center) => (
            <option key={center._id} value={center._id}>
              {center.title}
            </option>
          ))}
        </select>

        {/* Render table only if a center is selected */}
        {selectedCenterId && (
          <div className="row">
            <div className="col-md-12 mb-3">
              <DashBoardTable centerId={selectedCenterId} />
            </div>
            <div className="col-md-12">
              <MonthOnMonthTable centerId={selectedCenterId} />
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

DashboardEcommerce.prototype = {
  user: PropTypes.object,
  users: PropTypes.array,
  centers: PropTypes.array,
  isFormOpen: PropTypes.bool,
};
const mapStateToProps = (state) => {
  return {
    user: state.User.user,
    pageAccess: state.User.user.pageAccess.pages,
    users: state.User.data,
    userCenters: state.User.centerAccess,
    logs: state.Log.user,
    patients: state.Patient.allPatients,
    loading: state.Log.loading,
    centers: state.Center.data.map((center) => ({
      title: center.title,
      _id: center._id,
    })),
  };
};

export default connect(mapStateToProps)(DashboardEcommerce);
