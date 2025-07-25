import "bootstrap/dist/css/bootstrap.min.css";

const MPQ9ResultComponent = ({ resultData }) => {
  const {
    systemTotalScore,
    systemInterpretation,
    systemRecommendation,
    observation,
    Psychoticism,
    Neuroticism,
    ObsessiveCompulsive,
    SomatizationAnxiety,
    Depression,
    Hysteria,
  } = resultData;

  const formatRecommendations = (text) => {
    if (!text) return <li>No Recommendation</li>;

    // Protect common abbreviations with a placeholder
    const placeholderMap = {
      "e.g.": "___eg___",
      "i.e.": "___ie___",
      "etc.": "___etc___",
      "vs.": "___vs___",
    };

    let safeText = text;
    for (const [abbr, placeholder] of Object.entries(placeholderMap)) {
      safeText = safeText.replaceAll(abbr, placeholder);
    }

    // First try numbered bullets (1., 2., etc.)
    let parts = safeText.split(/(?=\d+\.\s)/);

    // If no numbered items, try sentence-based split (ends with . ! or ?)
    if (parts.length === 1) {
      parts = safeText.match(/[^.!?]+[.!?]+(\s|$)/g) || [safeText];
    }

    return parts.map((line, index) => {
      // Restore abbreviations
      let restored = line.trim();
      for (const [abbr, placeholder] of Object.entries(placeholderMap)) {
        restored = restored.replaceAll(placeholder, abbr);
      }

      return (
        <li key={index} className="mb-1">
          {restored.replace(/^\d+\.\s*/, "").trim()}
        </li>
      );
    });
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

        <div className="mb-4 p-4 border border-primary-subtle rounded-3 bg-light shadow-sm">
          <div className="row g-3">
            {[
              { label: "Psychoticism", value: Psychoticism },
              { label: "Neuroticism", value: Neuroticism },
              { label: "Obsessive Compulsive", value: ObsessiveCompulsive },
              { label: "Somatization Anxiety", value: SomatizationAnxiety },
              { label: "Depression", value: Depression },
              { label: "Hysteria", value: Hysteria },
            ].map((item, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-4">
                <div className="bg-white border border-info-subtle rounded-3 p-3 shadow-sm h-100">
                  <p className="mb-0 text-secondary fw-medium">
                    {item.label}:{" "}
                    <span className="fw-bold text-primary">
                      {item.value ?? 0}
                    </span>
                  </p>
                </div>
              </div>
            ))}
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
