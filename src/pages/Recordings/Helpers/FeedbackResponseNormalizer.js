export const FeedbackResponseRenderer = ({ response }) => {
  if (!response) return null;

  let data = response;

  if (typeof response === "string") {
    try {
      const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      data = JSON.parse(cleaned);
    } catch (err) {
      console.log("Parse failed:", err);
      return <div>{response}</div>;
    }
  }

  const formatSection = (title, obj) => {
    if (!obj) return null;

    return (
      <div style={{ marginBottom: "16px" }}>
        <h6>{title}</h6>

        {Object.entries(obj).map(([key, value], i) => (
          <div key={i} style={{ marginBottom: "6px" }}>
            <strong>• {key}:</strong> {value?.value}

            {value?.quote && value.quote !== "N/A" && (
              <div style={{ marginLeft: "15px" }}>
                <b>Quote/Reference:</b> "{value.quote}"
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
      {formatSection("Onboarding Facilities", data.onboarding_facilities)}
      {formatSection("Clinical Feedback", data.clinical_feedback)}
      {formatSection("Communication Support", data.communication_support)}

      {/* Patient Outcomes */}
      {/* Patient Outcomes */}
      {data?.patient_outcomes && (
        <div style={{ marginBottom: "16px" }}>
          <h6>Patient Outcomes</h6>

          {Object.entries(data.patient_outcomes).map(([key, val], i) => {

            // progress areas (nested object)
            if (key === "progress_areas") {
              return (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <strong>• Progress Areas:</strong>
                  {Object.entries(val || {}).map(([k, v]) => (
                    <div key={k} style={{ marginLeft: "15px" }}>
                      {k}: {v}
                    </div>
                  ))}
                </div>
              );
            }

            // normal object (value + quote)
            if (typeof val === "object") {
              return (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <strong>• {key}:</strong> {val?.value}

                  {val?.quote && val.quote !== "N/A" && (
                    <div style={{ marginLeft: "15px" }}>
                      <b>Quote/Reference:</b> "{val.quote}"
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Audit Report */}
      {data?.audit_report && (
        <div>
          <h6>Audit Report</h6>

          <strong>Strengths:</strong>
          {data.audit_report.strengths?.map((s, i) => (
            <div key={i}>• {s}</div>
          ))}

          <br />

          <strong>Weaknesses:</strong>
          {data.audit_report.weaknesses?.map((w, i) => (
            <div key={i}>• {w}</div>
          ))}

          <br />

          <strong>Coaching:</strong>
          <div>{data.audit_report.coaching_points}</div>
        </div>
      )}

      {/* Discharge & Loyalty */}
      {data?.discharge_loyalty && (
        <div style={{ marginTop: "16px" }}>
          <h6>Discharge & Loyalty</h6>

          {Object.entries(data.discharge_loyalty).map(([key, val], i) => {

            if (typeof val === "object") {
              return (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <strong>• {key}:</strong> {val?.value}

                  {val?.quote && val.quote !== "N/A" && (
                    <div style={{ marginLeft: "15px" }}>
                      <b>Quote/Reference:</b> "{val.quote}"
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={i} style={{ marginBottom: "6px" }}>
                <strong>• {key}:</strong> {val}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};