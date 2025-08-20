import React, { useEffect, useState } from "react";
import { Row } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import Prescription from "../../Patient/Charts/Prescription";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import { getPatientPrescriptionById } from "../../../store/features/nurse/nurseSlice";
import { useParams } from "react-router-dom";

const Medications = ({ profile, testLoading, prescription }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPatientPrescription = () => {
      if (!id || id === "*") return;
      dispatch(getPatientPrescriptionById(id));
    };
    fetchPatientPrescription();
  }, [dispatch, id]);

  console.log(prescription);

  return (
    <div>
      <Row className="timeline-right" style={{ rowGap: "2rem" }}>
        <GeneralCard data="Medications">
          {testLoading ? (
            <Placeholder />
          ) : (
            <div
              style={{
                paddingTop: "2rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              {prescription ? (
                <Prescription data={prescription.prescription} date={prescription.date} />
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  No medication data available
                </p>
              )}
            </div>
          )}
        </GeneralCard>
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => ({
  prescription: state.Nurse.prescription,
  testLoading: state.Nurse.testLoading,
  profile: state.Nurse.profile,
});

export default connect(mapStateToProps)(Medications);
