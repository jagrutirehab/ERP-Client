import React, { useEffect } from "react";
import { Row, Col } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import { useParams } from "react-router-dom";
import {
  getAlertsByPatientId,
  getClinicalTestSummaryById,
  getPatientOverviewById,
} from "../../../store/features/nurse/nurseSlice";

const Overview = ({ vitals, loading, testSummary, profile, testLoading }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPatientOverview = () => {
      if (!id || id === "*") return;

      dispatch(getPatientOverviewById(id));
      dispatch(getClinicalTestSummaryById(id));
      dispatch(getAlertsByPatientId(id));
    };
    if (id !== profile?._id) {
      fetchPatientOverview();
    }
  }, [dispatch, id]);

  return (
    <React.Fragment>
      <div>
        <Row className="timeline-right" style={{ rowGap: "2rem" }}>
          <GeneralCard data="Overview">
            <div style={{ marginTop: "1rem", marginLeft: "1rem" }}>
              <h5 className="mb-2">Vital Signs</h5>
              {loading ? (
                <Placeholder />
              ) : vitals ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    alignItems: "center",
                    fontSize: "15px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "5px" }}>•</span>
                    <strong>Weight:</strong>&nbsp;{vitals.weight || "N/A"} kg
                  </span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "5px" }}>•</span>
                    <strong>BP:</strong>&nbsp;
                    {vitals.bloodPressure?.systolic || "N/A"}/
                    {vitals.bloodPressure?.diastolic || "N/A"} mmHg
                  </span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "5px" }}>•</span>
                    <strong>Pulse:</strong>&nbsp;{vitals.pulse || "N/A"} bpm
                  </span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "5px" }}>•</span>
                    <strong>Temp:</strong>&nbsp;{vitals.temprature || "N/A"}°C
                  </span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "5px" }}>•</span>
                    <strong>RR:</strong>&nbsp;{vitals.respirationRate || "N/A"}
                    /min
                  </span>
                </div>
              ) : (
                <p
                  style={{ color: "#888", fontStyle: "italic", margin: "1rem" }}
                >
                  No vital signs available
                </p>
              )}
            </div>

            <div className="pt-4 ps-3">
              <h5>Clinical Test Results</h5>
              {testLoading ? (
                <Placeholder />
              ) : Array.isArray(testSummary) && testSummary.length > 0 ? (
                <ul style={{ paddingLeft: "1rem", margin: "0" }}>
                  {testSummary.map((test) => (
                    <li
                      key={test._id}
                      style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}
                    >
                      <strong>{test.name}:</strong> {test.severeReason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  style={{
                    color: "#888",
                    fontStyle: "italic",
                    margin: "1rem 0",
                    fontSize: "0.85rem",
                  }}
                >
                  No clinical tests available
                </p>
              )}
            </div>
          </GeneralCard>
        </Row>
      </div>

      <style jsx>{`
        .vital-sign-item {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
        .vital-sign-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  vitals: state.Nurse.vitals,
  loading: state.Nurse.loading,
  testLoading: state.Nurse.testLoading,
  testSummary: state.Nurse.testSummary,
  profile: state.Nurse.profile,
});

export default connect(mapStateToProps)(Overview);
