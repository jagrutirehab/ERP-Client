export const CallRecordingsOverviewColumns = (page, limit) => {
  return [
    {
      name: <div className="text-center">Index</div>,
      selector: (row, index) => (page - 1) * limit + index + 1,
      width: "100px",
    },
    {
      name: <div className="text-center">UCID</div>,
      selector: (row) => row?.UCID || "-",
      width: "200px",
    },
    {
      name: <div className="text-center">Agent</div>,
      selector: (row) => row?.Agent || "-",
      width: "180px",
    },
    {
      name: <div className="text-center">Call Date</div>,
      selector: (row) => row?.Call_Date || "-",
      width: "180px",
    },
    {
      name: <div className="text-center">Talk Time</div>,
      selector: (row) => row?.Talk_Time || "-",
      width: "150px",
    },
  ];
};