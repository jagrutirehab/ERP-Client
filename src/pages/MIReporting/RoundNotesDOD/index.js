    import React, { useEffect, useRef, useState } from "react";
    import { useDispatch, useSelector } from "react-redux";
    import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
    import { CSVLink } from "react-csv";
    import { fetchRoundNotesDOD } from "../../../store/features/miReporting/miReportingSlice";
    import Select from "react-select";


    const RoundNotesDOD = () => {
    const dispatch = useDispatch();
    const { roundNotesDOD, loading, error } = useSelector(
        (state) => state.MIReporting
    );
    const centerAccess = useSelector((state) => state.User?.centerAccess || []);
    const user = useSelector((state) => state.User);
    
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();


    
    useEffect(() => {

        dispatch(fetchRoundNotesDOD({ centerAccess }));
    }, [dispatch, centerAccess]);
    // console.log(roundNotesDOD)
    // Extract unique months and sort them descending

    const sessionOrder = [
    "Actual Rounds",
    "Morning",
    "Afternoon",
    "Evening",
    "Night",
    "Late Night",
    ];

    const centerDodData = roundNotesDOD?.center_dod_data || [];
    const dod_data = roundNotesDOD?.dod_data || [];
    const dates = React.useMemo(() => {
        const totalData = centerDodData?.Total?.[0]?.data || {};

        return Object.keys(totalData).sort((a, b) => {
            return new Date(b) - new Date(a);
        });
        }, [centerDodData]);

    const selectedCenterKey =
    selectedCenter === "ALL" ? "Total" : selectedCenter;

    const filteredData = React.useMemo(() => {
    return centerDodData?.[selectedCenterKey] || [];
    }, [centerDodData, selectedCenterKey]);

    const totals = React.useMemo(() => {
    const totalObj = {};

    dates.forEach((date) => {
        const actualRounds = filteredData.find(
        (item) => item["Round Session"] === "Actual Rounds"
        );

        totalObj[date] = actualRounds?.data?.[date] ?? 0;
    });

    return totalObj;
    }, [filteredData, dates]);

    const csvHeaders = React.useMemo(() => {
    const headers = [
        { label: "Round Session", key: "session" },
    ];

    dates.forEach((date) => {
        headers.push({
        label: date,
        key: date,
        });
    });

    return headers;
    }, [dates]);

    const prepareCsvData = () => {
    setCsvLoading(true);

    const formatted = sessionOrder.map((session) => {
        const sessionData = filteredData.find(
        (item) => item["Round Session"] === session
        );

        const row = {
        session,
        };

        dates.forEach((date) => {
        row[date] = sessionData?.data?.[date] ?? 0;
        });

        return row;
    });

    setCsvData(formatted);

    setTimeout(() => {
        csvRef.current.link.click();
        setCsvLoading(false);
    }, 100);
    };

    // Helper to format month (e.g., "2025-11" -> "Nov 2025")
    const formatMonth = (monthStr) => {
        if (!monthStr) return "";
        const [year, month] = monthStr.split("-");
        const date = new Date(year, month - 1);
        return date.toLocaleString("default", { month: "short", year: "numeric" });
    };

    // Prepare CSV data
    

    // Generate CSV headers dynamically
   


    const centerOptions = [
    { value: "ALL", label: "All Centers" },
        ...Object.keys(centerDodData)
        .filter((center) => center !== "Total")
        .map((center) => ({
        value: center,
        label: center,
        })),
    ];

 
    const sessionList = [
    {
        label: "Full Day",
        key: "Actual Rounds",
    },
    {
        label: "6AM-11AM",
        key: "Morning",
    },
    {
        label: "11AM-3PM",
        key: "Afternoon",
    },
    {
        label: "3PM-7PM",
        key: "Evening",
    },
    {
        label: "7PM-11PM",
        key: "Night",
    },
    {
        label: "11PM-6AM",
        key: "Late Night",
    },
    ];

    const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#A4DE6C",
    "#D0ED57",
    "#FFC658",
    ];
    

    // Add total row
    const totalRow = {
        id: "",
        center: "Total",
    };
    

   const currentMonthDates = dates.filter((date) => {
        const d = new Date(date);
        const now = new Date();

        return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
        );
        });

    return (
        <div className="w-100 chat-main-container-width mt-4 mt-sm-0">
        <div className="row">
            <div className="col-12">
            <div className="p-3">
                <div className="row align-items-center">
                <div className="col-sm-6 col-8">
                    <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                        <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                            <i className="bx bx-bar-chart-alt-2 fs-1"></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                            <h6 className="text-truncate mb-0 fs-18">
                            Refund Amount - Month on Month
                            </h6>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                
                {/* <div className="col-sm-6 col-4">
                    <div className="d-flex justify-content-end">
                    <Button
                        color="info"
                        onClick={prepareCsvData}
                        disabled={
                        csvLoading ||
                        loading ||
                        !roundNotesDOD ||
                        roundNotesDOD.length === 0
                        }
                        className="w-auto"
                    >
                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                        data={csvData || []}
                        filename="refund-amount-mom.csv"
                        headers={csvHeaders}
                        className="d-none"
                        ref={csvRef}
                    />
                    </div>
                </div> */}
                </div>
            </div>

            <div className="p-3 p-lg-4">
                <Row className="g-2 align-items-center mb-4">
                    <Col md={2}>
                    <Select
                        value={
                            centerOptions.find((o) => o.value === selectedCenter) || centerOptions[0]
                        }
                        onChange={(opt) => setSelectedCenter(opt.value)}
                        options={centerOptions}
                        placeholder="Center..."
                        />
                    </Col>
                </Row>
                <Card>
                <CardBody>
                    {loading && (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                        <p className="mt-2 text-muted">Loading data...</p>
                    </div>
                    )}

                    {error && !loading && <Alert color="danger">{error}</Alert>}

                    {!loading && !error && (
                        <>
                    <div
                        className="table-responsive"
                        style={{
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                        maxWidth: "100%",
                        display: "block",
                        }}
                    >
                        <div className="table-responsive rounded-4 shadow-sm border bg-white overflow-scroll">
                            <Table
                                className="mb-0"
                                style={{
                                minWidth: "max-content",
                                borderCollapse: "collapse",
                                fontSize: "0.88rem",
                                }}
                            >
                                <thead
                                style={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 2,
                                    background: "#f3f6fb",
                                }}
                                >
                                <tr>
                                    <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 0,
                                            zIndex: 12,
                                        }}
                                        >
                                        Round Session
                                        </th>

                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            // maxWidth: 140,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 180,
                                            zIndex: 11,
                                        }}
                                        >
                                        Total(Current Month)
                                        </th>

                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 360,
                                            zIndex: 10,
                                        }}
                                        >
                                        Session
                                        </th>

                                    {dates.map((date) => (
                                    <th
                                        key={date}
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                        minWidth: 95,
                                        border: "1px solid #cfd8e3",
                                        background: "green",
                                        color: "white",
                                        whiteSpace: "nowrap",
                                        }}
                                    >
                                        {date}
                                    </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                    {sessionList.map((session, idx) => {
                                        const rowData = filteredData.find(
                                        (item) => item["Round Session"] === session.key
                                        );

                                        const currentMonthTotal = dates
                                        .filter((date) => {
                                            const d = new Date(date);
                                            const now = new Date();

                                            return (
                                            d.getMonth() === now.getMonth() &&
                                            d.getFullYear() === now.getFullYear()
                                            );
                                        })
                                        .reduce((sum, date) => sum + (rowData?.data?.[date] ?? 0), 0);

                                        return (
                                        <tr key={session.key}>
                                            <td
                                            className="text-center fw-bold px-2 py-2"
                                            style={{
                                                border: "1px solid #d6dde8",
                                                 minWidth: 180,
                                                maxWidth: 180,
                                                background: idx === 0 ? "#dbeafe" : "#fff",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 12,
                                            }}
                                            >
                                            {session.key}
                                            </td>
                                            <td
                                            className="text-center fw-bold px-2 py-2"
                                            style={{
                                                minWidth: 180,
                                                border: "1px solid #d6dde8",
                                                background: idx === 0 ? "#dbeafe" : "#fff",
                                                position: "sticky",
                                                left: 180,
                                                zIndex: 11
                                            }}
                                            >
                                            {currentMonthTotal}
                                            </td>

                                            <td
                                            className="text-center fw-semibold px-2 py-2"
                                            style={{
                                                minWidth: 180,
                                                maxWidth: 180,
                                                border: "1px solid #d6dde8",
                                                background: idx === 0 ? "#dbeafe" : "#fff",
                                                position: "sticky",
                                                left: 360,
                                                zIndex: 10,
                                            }}
                                            >
                                            {session.label}
                                            </td>

                                            {dates.map((date) => {
                                            const value = rowData?.data?.[date] ?? 0;

                                            return (
                                                <td
                                                key={date}
                                                className="text-center px-2 py-2"
                                                style={{
                                                    border: "1px solid #d6dde8",
                                                    background: idx === 0 ? "#dbeafe" : "#fff",
                                                    color: value > 0 ? "#111827" : "#9ca3af",
                                                    fontWeight: idx === 0 ? 700 : 500,
                                                }}
                                                >
                                                {value}
                                                </td>
                                            );
                                            })}
                                        </tr>
                                        );
                                    })}
                                    </tbody>
                            </Table>
                            </div>
                                                
                    </div>


                    <div
                        className="table-responsive"
                        style={{
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                        maxWidth: "100%",
                        display: "block",
                        }}
                    >
                        <div className="table-responsive rounded-4 shadow-sm border bg-white overflow-scroll">
                            <Table
                                className="mb-0"
                                style={{
                                minWidth: "max-content",
                                borderCollapse: "collapse",
                                fontSize: "0.88rem",
                                }}
                            >
                                <thead
                                style={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 2,
                                    background: "#f3f6fb",
                                }}
                                >
                                <tr>
                                    <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 0,
                                            zIndex: 12,
                                        }}
                                        >
                                        Round Taken By
                                        </th>

                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            // maxWidth: 140,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 220,
                                            zIndex: 11,
                                        }}
                                        >
                                        Center Name
                                        </th>

                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 400,
                                            zIndex: 10,
                                        }}
                                        >
                                        Role
                                        </th>
                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 540,
                                            zIndex: 10,
                                        }}
                                        >
                                        Total(Last 30 Days)
                                        </th>
                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 720,
                                            zIndex: 10,
                                        }}
                                        >
                                        Total(Current Month)
                                        </th>

                                    {dates.map((date) => (
                                    <th
                                        key={date}
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                        minWidth: 95,
                                        border: "1px solid #cfd8e3",
                                        background: "green",
                                        color: "white",
                                        whiteSpace: "nowrap",
                                        }}
                                    >
                                        {date}
                                    </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                    {Object.entries(dod_data || {}).flatMap(([roundTakenBy, centers]) => {
                                        const role = centers?.role || "-";


                                        return Object.entries(centers || {}).filter(([centerName]) => {
                                            if (centerName === "role") return false;
                                            if (selectedCenter === "ALL") return true;
                                            return centerName === selectedCenter ;
                                        }).map(([centerName, row], idx) => {
                                        const currentMonthTotal = currentMonthDates.reduce(
                                            (sum, date) => sum + (row?.[date] ?? 0),
                                            0   
                                        );

                                       const last30DaysTotal = dates.reduce((sum, date) => {
                                        const current = new Date();
                                        const rowDate = new Date(date);

                                        const diffInDays =
                                            (current.setHours(0, 0, 0, 0) - rowDate.setHours(0, 0, 0, 0)) /
                                            (1000 * 60 * 60 * 24);

                                        return diffInDays >= 0 && diffInDays <= 30
                                            ? sum + (row?.[date] ?? 0)
                                            : sum;
                                        }, 0);
                                        

                                        return (
                                            <tr key={`${roundTakenBy}-${centerName}`}>
                                            <td
                                                className="text-center fw-semibold px-2 py-2"
                                                style={{
                                                border: "1px solid #d6dde8",
                                                background: "#fff",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 14,
                                                minWidth: 220,
                                                maxWidth: 220,
                                                whiteSpace: "nowrap",
                                                }}
                                            >
                                                {roundTakenBy}
                                            </td>

                                            <td
                                                className="text-center fw-semibold px-2 py-2"
                                                style={{
                                                border: "1px solid #d6dde8",
                                                background: "#fff",
                                                position: "sticky",
                                                left: 220,
                                                zIndex: 13,
                                                minWidth: 180,
                                                maxWidth: 180,
                                                whiteSpace: "nowrap",
                                                }}
                                            >
                                                {centerName}
                                            </td>

                                            <td
                                                className="text-center fw-semibold px-2 py-2"
                                                style={{
                                                border: "1px solid #d6dde8",
                                                background: "#fff",
                                                position: "sticky",
                                                left: 400,
                                                zIndex: 12,
                                                minWidth: 140,
                                                maxWidth: 140,
                                                whiteSpace: "nowrap",
                                                }}
                                            >
                                                {role || "-"}
                                            </td>

                                            <td
                                                className="text-center fw-bold px-2 py-2"
                                                style={{
                                                border: "1px solid #d6dde8",
                                                background: "#fff",
                                                position: "sticky",
                                                left: 540,
                                                zIndex: 11,
                                                minWidth: 180,
                                                maxWidth: 180,
                                                }}
                                            >
                                                {last30DaysTotal}
                                            </td>

                                            <td
                                                className="text-center fw-bold px-2 py-2"
                                                style={{
                                                border: "1px solid #d6dde8",
                                                background: "#fff",
                                                position: "sticky",
                                                left: 720,
                                                zIndex: 10,
                                                minWidth: 160,
                                                maxWidth: 160,
                                                }}
                                            >
                                                {currentMonthTotal}
                                            </td>

                                            {dates.map((date) => {
                                                const value = row?.[date] ?? 0;

                                                return (
                                                <td
                                                    key={date}
                                                    className="text-center px-2 py-2"
                                                    style={{
                                                    border: "1px solid #d6dde8",
                                                    background: "#fff",
                                                    color: value > 0 ? "#111827" : "#9ca3af",
                                                    fontWeight: 500,
                                                    }}
                                                >
                                                    {value}
                                                </td>
                                                );
                                            })}
                                            </tr>
                                        );
                                        });
                                    })}
                                    </tbody>
                            </Table>
                            </div>
                                                
                    </div>

                    </>
                    )}
                </CardBody>
                </Card>
            </div>
            </div>
        </div>
        </div>
    );
    };

    export default RoundNotesDOD;
