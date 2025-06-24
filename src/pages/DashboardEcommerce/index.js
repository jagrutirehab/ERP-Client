import React, { useEffect, useState } from "react";
import { Container, Input } from "reactstrap";
import Placeholder from "../Patient/Views/Components/Placeholder";
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
  setTotalAmount,
  viewPatient,
} from "../../store/actions";
import { connect, useDispatch } from "react-redux";
import TimelineRight from "../Patient/Views/Components/Timeline/TimelineRight";
import Header from "../Report/Components/Header";
import { endOfDay, startOfDay } from "date-fns";
import { Link } from "react-router-dom";
import PatientFilter from "./PatientFilter";
import { TIMELINE_VIEW } from "../../Components/constants/patient";
// import PatientInfo from "./PatientInfo";
import TableData from "./Table/OpdTable";
import AdmitPatientsTable from "./Table/AdmitPatientsTable";
import Patient_MOM_Table from "./Table/Patient_MOM_Table";
import Opd_Ipd_analysis from "./Table/OPD_IPD_Analysis";
import DischargePatient from "./Table/DischargePatient";
import AdvanceAmount from "./Table/AdvanceAmount";
import InvoiceAmount from "./Table/InvoiceAmount";
import OccupiedBed from "./Table/Ocuupied_Bed_Table";

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
    console.log("Selected Center ID:", selectedId);
  };
  useEffect(() => {
    dispatch(fetchCenters(user?.centerAccess));
  }, [dispatch, user]);

  useEffect(() => {
    if (!patients.length) dispatch(fetchAllPatients());

    dispatch(fetchMedicines());
    dispatch(fetchBillItems(userCenters));
    dispatch(fetchPaymentAccounts(userCenters));
    dispatch(fetchBillNotification(userCenters));
  }, [dispatch, userCenters, patients]);

  useEffect(() => {

    dispatch(
      fetchUserLogs({
        ...date,
        centerAccess: JSON.stringify(userCenters),
        users: JSON.stringify(selectedOptions?.length && selectedOptions[0]),
      })
    );
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
        {/* {access && (
          <>
            <div className="d-flex align-items-center justify-content-end gap-4">
              <div className="w-25">
                <PatientFilter
                  selectedOptions={selectedOptions}
                  setSelectedOptions={setSelectedOptions}
                />
              </div>
              <Header reportDate={date} setReportDate={setDate} />
            </div>
            {loading ? (
              <Placeholder />
            ) : (
              <div>
                <div className="timeline">
                  {(logs || []).map((item, idx) => (
                    <React.Fragment key={idx}>
                      {item.patient ? (
                        <Link
                          onClick={() => {
                            dispatch(viewPatient(item.patient));
                            // dispatch(
                            //   setTotalAmount({
                            //     totalPayable: 0,
                            //     totalAdvance: 0,
                            //   })
                            // );
                          }}
                          to={`/patient/${item.patient?._id}`}
                        >
                          <TimelineRight data={item}>
                            <h6 className="display-6 fs-14 text-info">
                              {item.center?.map((cn) => cn?.title).join(", ") ||
                                ""}
                            </h6>
                            <h6 className="display-6 fs-14">
                              {item.patient?.name || ""}
                              <span className="text-success">
                                {` ${item.patient?.id?.prefix || ""}${
                                  item.patient?.id?.value || ""
                                }`}
                              </span>
                            </h6>
                          </TimelineRight>
                        </Link>
                      ) : (
                        <TimelineRight data={item}>
                          <h6 className="display-6 fs-14 text-info">
                            {item.center?.map((cn) => cn?.title).join(", ") ||
                              ""}
                          </h6>
                          <h6 className="display-6 fs-14">
                            {item.patient?.name || ""}
                            <span className="text-success">
                              {` ${item.patient?.id?.prefix || ""}${
                                item.patient?.id?.value || ""
                              }`}
                            </span>
                          </h6>
                        </TimelineRight>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </>
        )} */}
        {/* <PatientInfo />
         */}

        {/* category wise data table
 <div>
      <select onChange={handleSelectChange} value={selectedComponent}>
        <option value="">Select Component</option>
        <option value="tableData">OPD Data Table</option>
        <option value="admittedPatient">Admitted Patient Table</option>
        <option value="DischargePatient">Discharge Patient Table</option>
        <option value="InvoiceAmount">Invoice Amount</option>
        <option value="AdvanceAmount">Advance Amount</option>
        <option value="occupiedBed">Occupied Bed</option>
      </select>

      <div>
        {selectedComponent === 'tableData' && <TableData />}
        {selectedComponent === 'admittedPatient' && <AdmitPatientsTable />}
        {selectedComponent === 'DischargePatient' && <DischargePatient />}
        {selectedComponent === 'InvoiceAmount' && <InvoiceAmount />}
        {selectedComponent === 'AdvanceAmount' && <AdvanceAmount />}
        {selectedComponent === 'occupiedBed' && <OccupiedBed />}
      </div>
    </div> */}
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
  console.log("Redux State", state); // ✅ Valid here

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
