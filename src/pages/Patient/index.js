import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Container } from "reactstrap";

//redux
import { connect, useDispatch } from "react-redux";
import {
  fetchBillItems,
  fetchCenters,
  fetchMedicines,
  fetchPatients,
  deletePatient as removePatient,
} from "../../store/actions";
import { Route, Routes } from "react-router-dom";

//Print
import Print from "../../Components/Print";

//Main
import Sidebar from "./Sidebar";
import Main from "./Main";
import AdmitPatient from "./Modals/AdmitPatient";
import DischargePatient from "./Modals/DischargePatient";
import AddPatient from "../../Components/Patient/AddPatient";
import Offcanvas from "./Offcanvas";
import SwitchCenter from "./Modals/SwitchCenter";
import DeleteModal from "../../Components/Common/DeleteModal";
import { ALL_PATIENTS } from "../../Components/constants/patient";

const Patient = ({ centerAccess, patients, user }) => {
  const dispatch = useDispatch();
  const [deletePatient, setDeletePatient] = useState({
    data: null,
    isOpen: false,
  });

  //PATIENT TYPES
  const [customActiveTab, setcustomActiveTab] = useState(ALL_PATIENTS);
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };

  // Gender sub-filter for whichever tab is active. Sibling state to the tab so
  // the selection carries over when the tab changes, and — like the tab — it
  // resets only when you leave /patient entirely.
  const [gender, setGender] = useState(null);

  const onCloseClick = () => {
    setDeletePatient({ data: null, isOpen: false });
  };

  const onDeleteClick = () => {
    dispatch(removePatient(deletePatient?.data));
    onCloseClick();
  };

  //fetch patients
  useEffect(() => {
    dispatch(
      fetchPatients({
        type: customActiveTab,
        centerAccess,
        gender,
        // Always page 1. fetchPatients.fulfilled replaces state.data outright,
        // which is what resets the infinite scroll when the tab or gender changes.
        skip: 0,
      })
    );
  }, [dispatch, centerAccess, customActiveTab, gender]);

  useEffect(() => {
    dispatch(fetchBillItems(centerAccess));
    dispatch(fetchCenters({centerIds: user?.centerAccess}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    const checkMedicines = JSON.parse(localStorage.getItem("medicines"));
    if (!checkMedicines?.length) dispatch(fetchMedicines());
  }, [dispatch]);

  document.title = "Patient";

  return (
    <React.Fragment>
      <div className="page-conten overflow-hidden">
        <div className="patient-page">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <Sidebar
                customActiveTab={customActiveTab}
                toggleCustom={toggleCustom}
                gender={gender}
                setGender={setGender}
              />
              <Offcanvas />
              <AddPatient />
              <DischargePatient />
              <AdmitPatient />
              {/* <EditAdmission /> */}
              <SwitchCenter />
              <DeleteModal
                show={deletePatient?.isOpen}
                onCloseClick={onCloseClick}
                onDeleteClick={onDeleteClick}
              />
              <Print />
              <Routes>
                <Route
                  path={`/:id`}
                  element={
                    <Main
                      deletePatient={deletePatient}
                      setDeletePatient={setDeletePatient}
                    />
                  }
                />
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

Patient.propTypes = {
  centerAccess: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  centerAccess: state.User?.centerAccess,
  user: state.User.user,
  patients: state.Patient.data,
});

export default connect(mapStateToProps)(Patient);
