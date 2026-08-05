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
  // fetchChartsAddmissions,
  resetOpdPatientBills,
  // resetOpdPatientCharts,
  fetchPatientById,
} from "../../store/actions";
import { clearCharts } from "../../store/features/chart/chartSlice";
import RenderWhen from "../../Components/Common/RenderWhen";
import { getChartsAddmissions } from "../../helpers/backend_helper";

const Main = ({ patient, deletePatient, setDeletePatient }) => {
  const dispatch = useDispatch();
  const { id } = useParams(); // Get patient ID from URL
  const [loading, setLoading] = useState(true);

  // Fetch fresh patient data when component mounts or ID changes
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id || id === "*") return;

      try {
        // state.Chart.data is a shared slice that many screens (IPD, BioData,
        // AdmissionSummary, Print, AdmissionForms, and others) read admissions
        // from, several by index (e.g. addmissionsCharts[0]). It's populated
        // by upserting, never by removing, so without this it would keep
        // every admission from every patient viewed this session, and those
        // index-based reads would silently pick up a stale, wrong patient's
        // admission. Clearing here, before any fetch for the new patient
        // starts, keeps it scoped to whichever patient is currently open.
        dispatch(clearCharts());
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

  console.log("addmissionsKey:", addmissionsKey);
  console.log("patient.addmissions:", patient?.addmissions);
  useEffect(() => {
    if (!patient) return;
    if (patient.addmissions?.length) {
      dispatch(fetchBillsAddmissions(patient.addmissions));
    } else {
      dispatch(resetOpdPatientBills());
    }
  }, [patient?._id]);

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
