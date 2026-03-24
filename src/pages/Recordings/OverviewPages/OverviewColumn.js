export const overviewColumns = (
    page,
    limit
) => {

    const columns = [
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
            name: <div className="text-center">Agent Name</div>,
            selector: (row) => row?.Agent || "-",
            width: "200px",
        },
        {
            name: <div className="text-center">Call Date</div>,
            selector: (row) => {
                if (!row?.Call_Date) return "-";
                return new Date(row.Call_Date).toLocaleDateString("en-IN");
            },
            width: "180px",
        },
        {
            name: <div className="text-center">Talk Time</div>,
            selector: (row) => row?.Talk_Time || "-",
            width: "160px",
        },
    ];

    return columns;
};