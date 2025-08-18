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
            <div style={{ marginTop: "1rem" }}>
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

            <div className="d-flex flex-column gap-1 pt-4">
              <h5>Clinical Test Results</h5>
              {testLoading ? (
                <Placeholder />
              ) : Array.isArray(testSummary) && testSummary.length > 0 ? (
                testSummary.map((test) => (
                  <div
                    key={test._id}
                    className="p-3 bg-light border border-danger rounded shadow-sm bg-white mb-2"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h2 className="fs-6 fw-semibold text-danger mb-0">
                        {test.name} Test Result
                      </h2>
                      <small className="text-muted fst-italic">
                        {new Date(test.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <p
                      className="text-dark lh-sm mb-0 me-2"
                      style={{ fontSize: "15px" }}
                    >
                      <span className="fw-bold me-2">Condition:</span>{" "}
                      {test.severeReason}
                    </p>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "#888",
                    fontStyle: "italic",
                    margin: "1rem",
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
