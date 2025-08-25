import React, { useEffect, useState } from "react";
import { Row } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import Prescription from "../../Patient/Charts/Prescription";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import { getPatientPrescriptionById } from "../../../store/features/nurse/nurseSlice";
import { useParams } from "react-router-dom";

const Medications = ({ testLoading, prescription }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPatientPrescription = () => {
      if (!id || id === "*") return;
      dispatch(getPatientPrescriptionById(id));
    };
    fetchPatientPrescription();
  }, [dispatch, id]);

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
              {prescription && !prescription.deleted ? (
                <Prescription
                  data={prescription.prescription}
                  startDate={prescription.prescriptionStartDate}
                  endDate={prescription.prescriptionEndDate}
                />
              ) : prescription && prescription.deleted ? (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  Prescription Removed. No Prescription available
                </p>
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
  currentPatientIndex:state.Nurse.index
});

export default connect(mapStateToProps)(Medications);
