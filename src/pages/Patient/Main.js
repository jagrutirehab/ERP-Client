import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

//components
import PatientTopbar from "./PatientTopbar";
import Views from "./Views";

//redux
import { connect, useDispatch } from "react-redux";
import {
  fetchBillsAddmissions,
  fetchChartsAddmissions,
  resetOpdPatientBills,
  resetOpdPatientCharts,
  fetchPatientById,
} from "../../store/actions";
import RenderWhen from "../../Components/Common/RenderWhen";

const Main = ({ patient, deletePatient, setDeletePatient }) => {
  const dispatch = useDispatch();
  const { id } = useParams(); // Get patient ID from URL
  const [loading, setLoading] = useState(true);

  // Fetch fresh patient data when component mounts or ID changes
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id || id === "*") return;

      try {
        // Fetch fresh patient data
        dispatch(fetchPatientById(id));
      } catch (err) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [dispatch, id]);

  // Claude changes starts

  // Keyed on the admission ids themselves (not the whole `patient` object)
  // so unrelated patient field updates don't re-trigger this fetch and race
  // with an in-flight one.
  const addmissionsKey = patient?.addmissions?.join(",") ?? "";

  useEffect(() => {
    if (!patient) return;

    if (patient.addmissions?.length) {
      dispatch(fetchChartsAddmissions(patient.addmissions));
      dispatch(fetchBillsAddmissions(patient.addmissions));
    } else {
      dispatch(resetOpdPatientCharts());
      dispatch(resetOpdPatientBills());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, patient?._id, addmissionsKey]);
  // Claude changes starts

  return (
    <React.Fragment>
      <RenderWhen isTrue={patient ? true : false}>
        <div className="w-100">
          <PatientTopbar
            deletePatient={deletePatient}
            setDeletePatient={setDeletePatient}
          />
          <Views />
        </div>
      </RenderWhen>
    </React.Fragment>
  );
};

Main.propTypes = {
  patient: PropTypes.object,
  deletePatient: PropTypes.object,
  setDeletePatient: PropTypes.func,
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(Main);
