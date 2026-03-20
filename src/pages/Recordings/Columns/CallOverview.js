import React from 'react';

export const CallRecordingsOverviewColumns = ({ page, limit }) => {


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


  const getParsed = (row) => {
    if (!row._parsedGemini) {
      row._parsedGemini = getSafeParsedData(row?.Files?.geminiResponse);
    }
    return row._parsedGemini;
  };

  const baseColumns = [
    {
      name: <div className="text-center font-bold">Index</div>,
      selector: (row, index) => (page - 1) * limit + index + 1,
      width: "70px",
    },
    {
      name: <div className="text-center font-bold">UCID</div>,
      selector: (row) => row?.UCID || "-",
      width: "180px",
    },
    {
      name: <div className="text-center font-bold">Agent</div>,
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
      name: <div className="text-center font-bold">Call Date</div>,
      selector: (row) => row?.Call_Date || "-",
      width: "130px",
    },
    {
      name: <div className="text-center font-bold">Talk Time</div>,
      selector: (row) => row?.Talk_Time || "-",
      width: "100px",
    },

    // Strengths
    {
      name: <div className="text-center font-bold">Strengths</div>,
      cell: (row) => {
        const data = getParsed(row);
        const content = Array.isArray(data?.strengths)
          ? data.strengths.join(" | ")
          : data?.strengths || "-";

        return (
          <div
            style={{
              padding: "12px 0px"
            }}
          >
            {content}
          </div>
        );
      },
      width: "300px",
    },
    // Weaknesses
    {
      name: <div className="text-center font-bold">Weaknesses</div>,
      cell: (row) => {
        const data = getParsed(row);
        const content = Array.isArray(data?.weaknesses)
          ? data.weaknesses.join(" | ")
          : data?.weaknesses || "-";

        return (
          <div
            style={{
              padding: "12px 0px"
            }}
          >
            {content}
          </div>
        );
      },
      width: "300px",
    },

    // Coaching
    {
      name: <div className="text-center font-bold">Coaching</div>,
      cell: (row) => {
        const data = getParsed(row);

        return (
          <div
            style={{
              padding: "12px 0px"
            }}
          >
            {data?.coaching || "-"}
          </div>
        );
      },
      width: "300px",
    },
  ];

  const scoreLabels = {
    C1: "Pro greeting (Org/Name)",
    C2: "Calm/Empathetic tone",
    C3: "No interruptions/Active listening",
    C4: "Relevant probing questions",
    C5: "No repetitive questions",
    C6: "Accurate service info (IPD/OPD/Psych/Elder)",
    C7: "Tailored response to needs",
    C8: "Correct location/charges info",
    C9: "No price/discount talk before understanding issue",
    C10: "Explored room/budget before discount",
    C11: "Pitched OPD only if IPD unaffordable/unsuitable",
    C12: "No treatment guarantees",
    C13: "Asked visit timeline",
    C14: "Offered visit/CM escalation",
    C15: "Asked for more queries",
    C16: "Positive close + Next steps",
    C17: "Not rushed",
    C18: "Overall Experience",
  };

  const scoreColumns = Array.from({ length: 18 }, (_, i) => {
    const scoreId = `C${i + 1}`;

    return {
      name: (
        <div
          className="text-center"
          style={{
            padding: "6px 4px",
            lineHeight: "1.2",
          }}
        >
          <div style={{ fontWeight: "600", fontSize: "12px" }}>
            {scoreId}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#555",
              marginTop: "2px",
              whiteSpace: "normal",
            }}
          >
            {scoreLabels[scoreId]}
          </div>
        </div>
      ),
      selector: (row) => {
        const data = getParsed(row);
        const score = data?.scores?.[scoreId];
        return score !== undefined && score !== null ? score : "-";
      },
      width: "180px",
      center: true,
    };
  });

  return [...baseColumns, ...scoreColumns];
};