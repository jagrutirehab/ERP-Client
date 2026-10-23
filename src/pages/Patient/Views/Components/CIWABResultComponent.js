// Result card for a saved CIWA-B test (testType 22). Same layout as
// COWSResultComponent, plus the Part A / Part B subtotals.
const SEVERITY_COLOR = {
  "No Withdrawal": "text-success",
  "Mild Withdrawal": "text-warning",
  "Moderate Withdrawal": "text-warning",
  "Severe Withdrawal": "text-danger",
  "Very Severe Withdrawal": "text-danger",
};

const CIWABResultComponent = ({ resultData }) => {
  const {
    systemTotalScore,
    systemPartAScore,
    systemPartBScore,
    systemInterpretation,
    systemRecommendation,
    observation,
    systemSeverity,
  } = resultData;

  // One bullet per sentence, keeping "e.g." intact.
  const formatRecommendations = (text) => {
    if (!text) return <li>No Recommendation</li>;
    const safe = text.replaceAll("e.g.", "___eg___");
    const parts = safe.match(/[^.!?]+[.!?]+(\s|$)/g) || [safe];
    return parts.map((line, index) => (
      <li key={index} className="mb-1">
        {line.replaceAll("___eg___", "e.g.").trim()}
      </li>
    ));
  };

  return (
    <div className="">
      <div className="p-4 bg-light border border-primary rounded shadow-lg">
        <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
          <i className="fas fa-chart-line me-2 text-primary"></i>
          Clinical Institute Withdrawal Assessment – Benzodiazepines (CIWA-B)
          Results
        </h2>

        <div className="mb-3">
          <p className="h6 fw-semibold text-indigo">
            CIWA-B Score:{" "}
            <span className="display-6 fw-bold">{systemTotalScore || 0}</span> /
            80
          </p>
        </div>

        <div className="mb-4 p-4 border border-primary-subtle rounded-3 bg-light shadow-sm">
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="bg-white border border-info-subtle rounded-3 p-3 shadow-sm h-100">
                <p className="mb-0 text-secondary fw-medium">
                  Withdrawal Level:{" "}
                  <span
                    className={`fw-bold ${
                      SEVERITY_COLOR[systemSeverity] || "text-primary"
                    }`}
                  >
                    {systemSeverity ?? "N/A"}
                  </span>
                </p>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="bg-white border border-info-subtle rounded-3 p-3 shadow-sm h-100">
                <p className="mb-0 text-secondary fw-medium">
                  Part A (patient-rated):{" "}
                  <span className="fw-bold text-dark">
                    {systemPartAScore ?? "–"} / 68
                  </span>
                </p>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="bg-white border border-info-subtle rounded-3 p-3 shadow-sm h-100">
                <p className="mb-0 text-secondary fw-medium">
                  Part B (clinician-observed):{" "}
                  <span className="fw-bold text-dark">
                    {systemPartBScore ?? "–"} / 12
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-dark fs-6 lh-lg mb-4">
          <span className="fw-bold text-primary">Interpretation:</span>{" "}
          {systemInterpretation || "No Interpretation"}
        </p>

        <div className="text-dark fs-6 lh-lg mb-4">
          <span className="fw-bold text-success">Recommendation:</span>
          <ul className="mt-2 ms-4">
            {formatRecommendations(systemRecommendation)}
          </ul>
        </div>

        <div className="mt-3 border border-secondary rounded p-3 bg-white">
          <p className="fw-semibold text-secondary mb-2">
            Clinician's Observations:
          </p>
          <p className="text-dark" style={{ whiteSpace: "pre-wrap" }}>
            {observation || "No observations recorded."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CIWABResultComponent;
