import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { connect, useDispatch } from "react-redux";
import {
  getRemovedPatients,
  removePatientPermanently,
} from "../../../store/actions";

//Import Scrollbar
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import Offcanvas from "./Offcanvas";
import List from "./List";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { Button, Spinner } from "reactstrap";

const Patient = ({ centerAccess, patients }) => {
  const dispatch = useDispatch();
  const [patient, setPatient] = useState({ data: null, isOpen: false });
  const [patnts, setPatients] = useState({ data: null, isOpen: false });
  const [deletePatient, setDeletePatient] = useState({
    data: null,
    isOpen: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     if (patients && patients.length > 0) return;
    const loadDeletedUser = async () => {
      try {
        setLoading(true);
        await dispatch(getRemovedPatients(centerAccess)).unwrap();
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    loadDeletedUser();
  }, [dispatch, centerAccess]);

  const onCloseClick = () => {
    setDeletePatient({ data: null, isOpen: false });
    setPatients({ data: null, isOpen: false });
  };

  const onDeleteClick = () => {
    dispatch(removePatientPermanently([deletePatient?.data]));
    onCloseClick();
  };

  const onPatientsDeleteClick = () => {
    dispatch(
      removePatientPermanently(patients.map((p) => p._id)) //JSON.stringify(bills.map((bl) => bl._id))
    );
    onCloseClick();
  };

  const renderPatients = useMemo(() => {
    if (loading) {
          return (
            <div className="d-flex justify-content-center align-items-center p-3">
              <Spinner color="primary" />
            </div>
          );
        }
    return (
      <div className="">
        <PerfectScrollbar className="chat-room-list">
          <List
            patients={patients}
            setPatient={setPatient}
            setDeletePatient={setDeletePatient}
          />
        </PerfectScrollbar>
      </div>
    );
  }, [patients, loading]);

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="p-4">
          <BreadCrumb title={"Deleted Patients"} />
        </div>
        <div className="px-2 mb-2 text-end">
          <Button
            onClick={() => setPatients({ data: null, isOpen: true })}
            className="text-white"
            size="sm"
            color="danger"
          >
            Clear bin
          </Button>
        </div>
        <Offcanvas patient={patient} setPatient={setPatient} />
        <DeleteModal
          show={patnts?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onPatientsDeleteClick}
        />
        <DeleteModal
          show={deletePatient?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onDeleteClick}
        />
        {renderPatients}
      </div>
    </React.Fragment>
  );
};

Patient.propTypes = {
  centerAccess: PropTypes.array.isRequired,
  patients: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  patients: state.Recyclebin.patients,
});

export default connect(mapStateToProps)(Patient);
