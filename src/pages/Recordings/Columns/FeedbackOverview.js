import React from "react";

export const FeedbackRecordingsOverviewColumns = ({ page, limit }) => {

  // 🔹 Safe Parse
  const getSafeParsedData = (rawData) => {
    if (!rawData) return null;

    try {
      if (typeof rawData === "object") return rawData;

      const cleaned = rawData
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Parsing failed:", rawData);
      return null;
    }
  };

  // 🔥 FULL FLATTEN
  const getParsed = (row) => {
    if (!row._parsedGemini) {
      const d = getSafeParsedData(row?.Files?.geminiResponse);

      row._parsedGemini = {

        // onboarding
        reception: d?.onboarding_facilities?.reception_experience?.value,
        tour: d?.onboarding_facilities?.manager_provided_tour?.value,
        hygiene: d?.onboarding_facilities?.hygiene_satisfaction?.value,
        room: d?.onboarding_facilities?.room_satisfaction?.value,
        queries: d?.onboarding_facilities?.queries_resolved?.value,

        // clinical
        psych: d?.clinical_feedback?.psych_discussion_held?.value,
        psychRating: d?.clinical_feedback?.psych_experience_rating?.value,
        empathy: d?.clinical_feedback?.staff_empathy_professionalism?.value,
        treatment: d?.clinical_feedback?.treatment_plan_satisfaction?.value,
        family: d?.clinical_feedback?.family_involvement?.value,

        // outcomes
        status: d?.patient_outcomes?.status_vs_admission?.value,
        improvement: d?.patient_outcomes?.visible_improvement?.value,
        behavior: d?.patient_outcomes?.progress_areas?.behavior,
        mood: d?.patient_outcomes?.progress_areas?.mood,
        daily: d?.patient_outcomes?.progress_areas?.daily_functioning,
        sleep: d?.patient_outcomes?.progress_areas?.sleep,
        communication: d?.patient_outcomes?.progress_areas?.communication,

        // communication
        updates: d?.communication_support?.regular_updates_received?.value,
        clarity: d?.communication_support?.updates_clear_helpful?.value,
        frequency: d?.communication_support?.call_frequency?.value,
        support: d?.communication_support?.family_support_adequacy?.value,
        concerns: d?.communication_support?.concerns_addressed_promptly?.value,

        // discharge
        belongings: d?.discharge_loyalty?.belongings_returned?.value,
        nps: d?.discharge_loyalty?.nps_score?.value,
        suggestion: d?.discharge_loyalty?.improvement_suggestions,
        notes: d?.discharge_loyalty?.discharge_experience_notes,

        // audit (🔥 beech me use hoga)
        strengths: d?.audit_report?.strengths || [],
        weaknesses: d?.audit_report?.weaknesses || [],
        coaching: d?.audit_report?.coaching_points || "",
      };
    }

    return row._parsedGemini;
  };

  const columns = [


    {
      name: "Index",
      selector: (row, i) => (page - 1) * limit + i + 1,
      width: "70px",
    },
    {
      name: "UCID",
      selector: (row) => row?.UCID || "-",
      width: "180px",
    },
    {
      name: "Agent",
      selector: (row) => row?.Agent || "-",
      width: "140px",
    },

 {
      name: <div className="text-center font-bold">Recording Link</div>,
      cell: (row) => {
        const url = row?.Files?.recording_url;

        if (!url) return "-";

        const truncated =
          url.length > 25 ? url.slice(0, 25) + "..." : url;

        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={url}
            style={{
              color: "#007bff",
              textDecoration: "underline",
              display: "block",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {truncated}
          </a>
        );
      },
      width: "140px",
    },

    {
      name: "Call Date",
      selector: (row) => row?.Call_Date || "-",
      width: "130px",
    },



    {
      name: "Strengths",
      cell: (row) => {
        const d = getParsed(row);
        const content = d?.strengths?.length
          ? d.strengths.join(" | ")
          : "-";

        return (
          <div style={{ padding: "12px 0px" }}>
            {content}
          </div>
        );
      },
      width: "300px",
    },
    {
      name: "Weaknesses",
      cell: (row) => {
        const d = getParsed(row);
        const content = d?.weaknesses?.length
          ? d.weaknesses.join(" | ")
          : "-";

        return (
          <div style={{ padding: "12px 0px" }}>
            {content}
          </div>
        );
      },
      width: "300px",
    },
    {
      name: "Coaching",
      cell: (row) => {
        const d = getParsed(row);
        const content = d?.coaching || "-";

        return (
          <div style={{ padding: "12px 0px" }}>
            {content}
          </div>
        );
      },
      width: "300px",
    },


    { name: "Reception", selector: (r) => getParsed(r)?.reception || "-", width: "120px" },
    { name: "Tour", selector: (r) => getParsed(r)?.tour || "-", width: "120px" },
    { name: "Hygiene", selector: (r) => getParsed(r)?.hygiene || "-", width: "120px" },
    { name: "Room", selector: (r) => getParsed(r)?.room || "-", width: "120px" },
    { name: "Queries Resolved", selector: (r) => getParsed(r)?.queries || "-", width: "150px" },


    { name: "Psych", selector: (r) => getParsed(r)?.psych || "-", width: "120px" },
    { name: "Psych Rating", selector: (r) => getParsed(r)?.psychRating || "-", width: "140px" },
    { name: "Empathy", selector: (r) => getParsed(r)?.empathy || "-", width: "120px" },
    { name: "Treatment", selector: (r) => getParsed(r)?.treatment || "-", width: "130px" },
    { name: "Family", selector: (r) => getParsed(r)?.family || "-", width: "120px" },


    { name: "Status", selector: (r) => getParsed(r)?.status || "-", width: "120px" },
    { name: "Improvement", selector: (r) => getParsed(r)?.improvement || "-", width: "140px" },
    { name: "Behavior", selector: (r) => getParsed(r)?.behavior || "-", width: "120px" },
    { name: "Mood", selector: (r) => getParsed(r)?.mood || "-", width: "120px" },
    { name: "Daily", selector: (r) => getParsed(r)?.daily || "-", width: "120px" },
    { name: "Sleep", selector: (r) => getParsed(r)?.sleep || "-", width: "120px" },
    { name: "Communication", selector: (r) => getParsed(r)?.communication || "-", width: "150px" },


    { name: "Updates", selector: (r) => getParsed(r)?.updates || "-", width: "120px" },
    { name: "Clarity", selector: (r) => getParsed(r)?.clarity || "-", width: "120px" },
    { name: "Frequency", selector: (r) => getParsed(r)?.frequency || "-", width: "120px" },
    { name: "Support", selector: (r) => getParsed(r)?.support || "-", width: "120px" },
    { name: "Concerns", selector: (r) => getParsed(r)?.concerns || "-", width: "130px" },


    { name: "Belongings", selector: (r) => getParsed(r)?.belongings || "-", width: "120px" },
    { name: "NPS", selector: (r) => getParsed(r)?.nps || "-", width: "100px" },

    {
      name: "Suggestions",
      cell: (r) => {
        const content = getParsed(r)?.suggestion || "-";

        return (
          <div
            style={{
              whiteSpace: "pre-wrap",   // multiline allow
              wordBreak: "break-word",  // long text break
              padding: "12px 0px",
            }}
          >
            {content}
          </div>
        );
      },
      width: "300px",
    },

    {
      name: "Notes",
      cell: (r) => {
        const content = getParsed(r)?.notes || "-";

        return (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              padding: "12px 0px",
            }}
          >
            {content}
          </div>
        );
      },
      width: "300px",
    },
  ];

  return columns;
};