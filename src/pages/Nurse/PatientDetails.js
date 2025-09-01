import React, { useEffect } from "react";
import PatientTopBar from "./Views/Components/PatientTopBar";
import Views from "./Views";
import { connect, useDispatch } from "react-redux";
import { getPatientDetailsById } from "../../store/features/nurse/nurseSlice";
import { useParams } from "react-router-dom";

const PatientDetails = ({ currentPatientIndex }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getPatientDetailsById(id));
  }, [dispatch, id]);
  
  return (
    <React.Fragment>
      <div
        className="w-100"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "82vh",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "white",
          }}
        >
          <PatientTopBar />
        </div>
        <Views />
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  currentPatientIndex: state.Nurse.index,
});

export default connect(mapStateToProps)(PatientDetails);
