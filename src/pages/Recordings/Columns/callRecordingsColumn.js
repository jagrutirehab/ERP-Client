export const callRecordingsColumns = (
    page,
    limit,
    navigate,
    recordings,
    setSelectedRecording,
    setShowGenerateModal,

) => [
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
            name: <div className="text-center">Location</div>,
            selector: (row) => row?.Location || "-",
            width: "200px",
        },
        {
            name: <div className="text-center">Agent</div>,
            selector: (row) => row?.Agent || "-",
            width: "160px",
        },
        {
            name: <div className="text-center">Caller Number</div>,
            selector: (row) => row?.Caller_No || "-",
            width: "160px",
        },
        {
            name: <div className="text-center">Call Date</div>,
            selector: (row) => row?.Call_Date || "-",
            width: "160px",
        },
        {
            name: <div className="text-center">Status</div>,
            selector: (row) => row?.Status || "-",
            width: "160px",
        },
        {
            name: <div className="text-center">Talk Time</div>,
            selector: (row) => row?.Talk_Time || "-",
            width: "160px",
        },

        {
            name: <div className="text-center">Overview Generated</div>,
            cell: (row) => {
                const response = row?.Files?.geminiResponse;

                if (!response) {
                    return (
                        <span style={{ color: "red", fontWeight: 600 }}>
                            Not Generated
                        </span>
                    );
                }

                if (response?.startsWith("API Error")) {
                    return (
                        <span style={{ color: "orange", fontWeight: 600 }}>
                            Generated (API Error)
                        </span>
                    );
                }

                return (
                    <span style={{ color: "green", fontWeight: 600 }}>
                        Generated
                    </span>
                );
            },
            width: "180px",
        },



        {
            name: <div className="text-center">More details</div>,
            cell: (row, index) => (
                <div
                    className="text-primary text-center"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() =>
                        navigate(`/recordings/more/${row._id}`, {
                            state: {
                                recordings,
                                index,
                                limit,
                            }
                        })
                    }
                >
                    View
                </div>
            ),
            width: "200px",
        },
        {
            name: <div className="text-center">Generate</div>,
            cell: (row) => {
                const response = row?.Files?.geminiResponse;

                if (!response) {
                    return (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                setSelectedRecording(row);
                                setShowGenerateModal(true);
                            }}
                        >
                            Generate
                        </button>
                    );
                }

                if (response?.startsWith("API Error")) {
                    return (
                        <button
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                                setSelectedRecording(row);
                                setShowGenerateModal(true);
                            }}
                        >
                            Re-Generate
                        </button>
                    );
                }

                return null;
            },
            width: "180px",
        },
    ];