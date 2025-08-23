import React, { useEffect } from "react";
import { Row, Col, Badge } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import { useParams } from "react-router-dom";
import {
  getAlertsByPatientId,
  getClinicalTestSummaryById,
  getNextDayMedicineBoxFillingActivities,
  getPatientOverviewById,
} from "../../../store/features/nurse/nurseSlice";

const Overview = ({
  vitals,
  loading,
  testSummary,
  profile,
  testLoading,
  medicineBoxFillingActivities,
  medicineLoading,
}) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPatientOverview = () => {
      if (!id || id === "*") return;

      dispatch(getPatientOverviewById(id));
      dispatch(getClinicalTestSummaryById(id));
      dispatch(getAlertsByPatientId(id));
      dispatch(getNextDayMedicineBoxFillingActivities(id));
    };
    if (id !== profile?._id) {
      fetchPatientOverview();
    }
  }, [dispatch, id]);

  const highlightSeverity = (text) => {
    const keywords = [
      "extreme",
      "severe withdrawal risk",
      "high risk (Suicidal Behavior/Plan)",
      "obsessivecompulsive",
      "Severe mania with marked functional impairment",
      "Psychoticism",
      "Neuroticism",
      "Somatizationanxiety",
      "Hysteria",
      "Severe",
      "Depression",
    ];
    const parts = text.split(
      new RegExp(
        `(${keywords
          .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|")})`,
        "gi"
      )
    );

    return parts.map((part, idx) =>
      keywords.some((kw) => kw.toLowerCase() === part.toLowerCase()) ? (
        <span key={idx} className="bg-danger text-white px-1">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  console.log(medicineBoxFillingActivities);

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
                      <strong>{test.name}:</strong>{" "}
                      {highlightSeverity(test.severeReason)}
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
            <div className="pt-4 ps-3">
              <h5>Activity - Medicine Box Filing</h5>
              {medicineLoading ? (
                <Placeholder />
              ) : (
                medicineBoxFillingActivities?.medicines && (
                  <Row className="gap-3">
                    {Object.entries(medicineBoxFillingActivities.medicines).map(
                      ([timeSlot, meds]) => (
                        <div key={timeSlot}  style={{ flex: "1 1 30%", minWidth: "250px" }}>
                          <h6 className=" text-capitalize mb-3">
                            {timeSlot}
                          </h6>
                          <div className="d-flex flex-column gap-3">
                            {Array.isArray(meds) && meds.length > 0 ? (
                              meds.map((med) => (
                                <div
                                  key={med._id}
                                  className="border rounded-lg p-3 bg-white shadow-sm"
                                >
                                  <h6 className="fw-bold text-dark mb-1">
                                    {med.medicineName}
                                  </h6>
                                  <small className="text-muted d-flex flex-wrap align-items-center gap-2">
                                    <span>
                                      <strong>Dosage:</strong> x{med.dosage}
                                    </span>
                                    <span>
                                      <strong>Intake:</strong> {med.intake}
                                    </span>
                                    <span>
                                      <strong>Time:</strong>
                                      <Badge
                                        color="light"
                                        className="ms-1 border text-primary"
                                        style={{
                                          fontSize: "0.6rem",
                                          fontWeight: "600",
                                          padding: "0.15rem 0.4rem",
                                        }}
                                      >
                                        {timeSlot.toUpperCase()}
                                      </Badge>
                                    </span>
                                  </small>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted">
                                No medicines for {timeSlot}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </Row>
                )
              )}
            </div>
          </GeneralCard>{" "}
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
  medicineBoxFillingActivities: state.Nurse.medicines.nextDay,
  medicineLoading: state.Nurse.medicineLoading,
});

export default connect(mapStateToProps)(Overview);
