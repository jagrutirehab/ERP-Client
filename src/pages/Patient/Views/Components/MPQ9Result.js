import "bootstrap/dist/css/bootstrap.min.css";

const MPQ9ResultComponent = ({ resultData }) => {
  const {
    systemTotalScore,
    systemInterpretation,
    systemRecommendation,
    observation,
  } = resultData;

  const formatRecommendations = (text) => {
    if (!text) return <li>No Recommendation</li>;
    const parts = text.split(/(?=\d+\.\s)/);
    return parts.map((line, index) => (
      <li key={index} className="mb-1">
        {line.replace(/^\d+\.\s*/, "").trim()}
      </li>
    ));
  };

  return (
    <div className="">
      <div className="p-4 bg-light border border-primary rounded shadow-lg">
        <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
          <i className="fas fa-chart-line me-2 text-primary"></i>
          MPQ-9 Test Results shown
        </h2>

        <div className="mb-3">
          <p className="h6 fw-semibold text-indigo">
            Total MPQ-9 Score:{" "}
            <span className="display-6 fw-bold">{systemTotalScore || 0}</span> /
            24
          </p>
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
            Psychologist's Observations:
          </p>
          <p className="text-dark" style={{ whiteSpace: "pre-wrap" }}>
            {observation || "No observations recorded."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MPQ9ResultComponent;
