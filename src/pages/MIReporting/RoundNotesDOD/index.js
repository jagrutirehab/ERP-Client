    import React, { useEffect, useMemo, useRef, useState } from "react";
    import { useDispatch, useSelector, shallowEqual } from "react-redux";
    import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
    import { CSVLink } from "react-csv";
    import { fetchRoundNotesDOD } from "../../../store/features/miReporting/miReportingSlice";
    import Select from "react-select";


    const RoundNotesDOD = () => {
    const dispatch = useDispatch();
    const { roundNotesDOD, loading, error } = useSelector((state) => state.MIReporting);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchRoundNotesDOD({ centerAccess }));
    }, [dispatch, centerAccess]);

    const sessionOrder = ["Actual Rounds", "Morning", "Afternoon", "Evening", "Night", "Late Night"];

    const centerDodData = useMemo(() => roundNotesDOD?.center_dod_data || [], [roundNotesDOD]);
    const dod_data = useMemo(() => roundNotesDOD?.dod_data || [], [roundNotesDOD]);

    const dates = useMemo(() => {
        const totalData = centerDodData?.Total?.[0]?.data || {};
        return Object.keys(totalData).sort((a, b) => new Date(b) - new Date(a));
    }, [centerDodData]);

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");

    const currentMonthDates = useMemo(() => {
        const now = new Date();
        return dates.filter((date) => {
            const d = new Date(date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    }, [dates]);

    const selectedCenterKey = selectedCenter === "ALL" ? "Total" : selectedCenter;

    const filteredData = useMemo(() => centerDodData?.[selectedCenterKey] || [], [centerDodData, selectedCenterKey]);

    const sessionTotals = useMemo(() => {
        const totalObj = {};
        const actualRounds = filteredData.find((item) => item["Round Session"] === "Actual Rounds");
        dates.forEach((date) => {
            totalObj[date] = actualRounds?.data?.[date] ?? 0;
        });
        return totalObj;
    }, [filteredData, dates]);

    const dodRows = useMemo(() =>
        Object.entries(dod_data || {}).flatMap(([roundTakenBy, centers]) => {
            const role = centers?.role || "-";
            return Object.entries(centers || {})
                .filter(([centerName]) => {
                    if (centerName === "role") return false;
                    if (selectedCenter === "ALL") return true;
                    return centerName === selectedCenter;
                })
                .map(([centerName, row]) => ({ roundTakenBy, centerName, role, row }));
        }),
    [dod_data, selectedCenter]);

    const dodTotals = useMemo(() => {
        const totals = {};
        dates.forEach((date) => {
            totals[date] = dodRows.reduce((sum, { row }) => sum + (row?.[date] ?? 0), 0);
        });
        return totals;
    }, [dodRows, dates]);

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...Object.keys(centerDodData)
            .filter((center) => center !== "Total")
            .map((center) => ({ value: center, label: center })),
    ], [centerDodData]);

    const sessionList = [
        { label: "Full Day",    key: "Actual Rounds" },
        { label: "6AM-11AM",   key: "Morning" },
        { label: "11AM-3PM",   key: "Afternoon" },
        { label: "3PM-7PM",    key: "Evening" },
        { label: "7PM-11PM",   key: "Night" },
        { label: "11PM-6AM",   key: "Late Night" },
    ];

    const sessionFixedLabels = ["Round Session", "Total (Current Month)", "Session"];
    const dodFixedLabels = ["Round Taken By", "Center Name", "Role", "Total (Last 30 Days)", "Total (Current Month)"];

    const prepareCsvData = () => {
        setCsvLoading(true);

        // Sessions table
        const sessionHeaders = [...sessionFixedLabels, ...dates.map(formatDate)];
        const sessionTotalsRow = [
            "Total",
            ...Array(sessionFixedLabels.length - 1).fill(""),
            ...dates.map((date) => sessionTotals[date] || ""),
        ];
        const sessionDataRows = sessionList.map((session) => {
            const rowData = filteredData.find((item) => item["Round Session"] === session.key);
            const currentMonthTotal = currentMonthDates.reduce((sum, date) => sum + (rowData?.data?.[date] ?? 0), 0);
            return [
                session.key,
                currentMonthTotal,
                session.label,
                ...dates.map((date) => rowData?.data?.[date] ?? ""),
            ];
        });

        // DOD table
        const dodHeaders = [...dodFixedLabels, ...dates.map(formatDate)];
        const dodTotalsRow = [
            "Total",
            ...Array(dodFixedLabels.length - 1).fill(""),
            ...dates.map((date) => dodTotals[date] || ""),
        ];
        const dodDataRows = dodRows.map(({ roundTakenBy, centerName, role, row }) => {
            const currentMonthTotal = currentMonthDates.reduce((sum, date) => sum + (row?.[date] ?? 0), 0);
            const last30DaysTotal = dates.reduce((sum, date) => {
                const current = new Date();
                const rowDate = new Date(date);
                const diffInDays = (current.setHours(0,0,0,0) - rowDate.setHours(0,0,0,0)) / (1000*60*60*24);
                return diffInDays >= 0 && diffInDays <= 30 ? sum + (row?.[date] ?? 0) : sum;
            }, 0);
            return [
                roundTakenBy,
                centerName,
                role,
                last30DaysTotal,
                currentMonthTotal,
                ...dates.map((date) => row?.[date] ?? ""),
            ];
        });

        setCsvData([
            sessionTotalsRow,
            sessionHeaders,
            ...sessionDataRows,
            [],
            dodTotalsRow,
            dodHeaders,
            ...dodDataRows,
        ]);

        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    const sessionColWidths = [130, 100, 100];
    const dodColWidths = [150, 120, 100, 100, 100];

    const thStyle = (top, dark, left = null, width = null) => ({
        border: "1px solid #cfd8e3",
        background: dark ? "#004d00" : "green",
        color: "white",
        whiteSpace: "nowrap",
        position: "sticky",
        top,
        zIndex: left !== null ? (dark ? 5 : 4) : 2,
        ...(left !== null && { left }),
        ...(width !== null && { minWidth: width }),
    });

    const tdStyle = (idx, left = null, width = null) => ({
        border: "1px solid #d6dde8",
        background: idx % 2 === 0 ? "#f8fafc" : "#fff",
        whiteSpace: "nowrap",
        ...(left !== null && { position: "sticky", left, zIndex: 3 }),
        ...(width !== null && { minWidth: width }),
    });

    return (
        <div className="w-100 mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
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
                            <h6 className="text-truncate mb-0 fs-18">Round Notes DOD</h6>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="col-sm-6 col-4">
                    <div className="d-flex justify-content-end">
                    <Button
                        color="info"
                        onClick={prepareCsvData}
                        disabled={csvLoading || loading || !roundNotesDOD || roundNotesDOD.length === 0}
                        className="w-auto"
                    >
                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                        data={csvData || []}
                        filename={`round-notes-dod-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
                        className="d-none"
                        ref={csvRef}
                    />
                    </div>
                </div>
                </div>
            </div>

            <div className="p-3 p-lg-4">
                <Row className="g-2 align-items-center mb-4">
                    <Col md={2}>
                        <Select
                            value={centerOptions.find((o) => o.value === selectedCenter) || centerOptions[0]}
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
                        {/* Sessions table */}
                        <div className="shadow-sm bg-white mb-4" style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "70vh" }}>
                            <Table className="mb-0 w-100" style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.78rem" }}>
                                <thead>
                                    <tr>
                                        {sessionFixedLabels.map((label, i) => {
                                            const left = sessionColWidths.slice(0, i).reduce((a, b) => a + b, 0);
                                            return (
                                            <th key={label} className="text-center fw-bold px-1 py-2" style={thStyle(0, true, left, sessionColWidths[i])}>
                                                {i === 2 ? "Total (Single Day)" : ""}
                                            </th>
                                            );
                                        })}
                                        {dates.map((date) => (
                                            <th key={`tot-${date}`} className="text-center fw-bold px-1 py-2" style={thStyle(0, true)}>
                                                {sessionTotals[date] || ""}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {sessionFixedLabels.map((label, i) => {
                                            const left = sessionColWidths.slice(0, i).reduce((a, b) => a + b, 0);
                                            return (
                                            <th key={label} className="text-center fw-bold px-1 py-2" style={thStyle(37, false, left, sessionColWidths[i])}>
                                                {label}
                                            </th>
                                            );
                                        })}
                                        {dates.map((date) => (
                                            <th key={date} className="text-center fw-bold px-1 py-2" style={thStyle(37, false)}>
                                                {formatDate(date)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessionList.map((session, idx) => {
                                        const rowData = filteredData.find((item) => item["Round Session"] === session.key);
                                        const currentMonthTotal = currentMonthDates.reduce((sum, date) => sum + (rowData?.data?.[date] ?? 0), 0);
                                        return (
                                            <tr key={session.key}>
                                                <td className="text-center px-1 py-2" style={tdStyle(idx, 0, sessionColWidths[0])}>{session.key}</td>
                                                <td className="text-center px-1 py-2" style={tdStyle(idx, sessionColWidths[0], sessionColWidths[1])}>{currentMonthTotal}</td>
                                                <td className="text-center px-1 py-2" style={tdStyle(idx, sessionColWidths[0] + sessionColWidths[1], sessionColWidths[2])}>{session.label}</td>
                                                {dates.map((date) => (
                                                    <td key={date} className="text-center px-1 py-2" style={tdStyle(idx)}>
                                                        {rowData?.data?.[date] ?? ""}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>

                        {/* DOD table */}
                        <div className="shadow-sm bg-white" style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "70vh" }}>
                            <Table className="mb-0 w-100" style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.78rem" }}>
                                <thead>
                                    {/* <tr>
                                        {dodFixedLabels.map((label, i) => {
                                            const left = dodColWidths.slice(0, i).reduce((a, b) => a + b, 0);
                                            return (
                                            <th key={label} className="text-center fw-bold px-1 py-2" style={thStyle(0, true, left, dodColWidths[i])}>
                                                {i === 4 ? "Total (Single Day)" : ""}
                                            </th>
                                            );
                                        })}
                                        {dates  .map((date) => (
                                            <th key={`dtot-${date}`} className="text-center fw-bold px-1 py-2" style={thStyle(0, true)}>
                                                {dodTotals[date] || ""}
                                            </th>
                                        ))}
                                    </tr> */}
                                    <tr>
                                        {dodFixedLabels.map((label, i) => {
                                            const left = dodColWidths.slice(0, i).reduce((a, b) => a + b, 0);
                                            return (
                                            <th key={label} className="text-center fw-bold px-1 py-2" style={thStyle(37, false, left, dodColWidths[i])}>
                                                {label}
                                            </th>
                                            );
                                        })}
                                        {dates.map((date) => (
                                            <th key={date} className="text-center fw-bold px-1 py-2" style={thStyle(37, false)}>
                                                {formatDate(date)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dodRows.map(({ roundTakenBy, centerName, role, row }, idx) => {
                                        const currentMonthTotal = currentMonthDates.reduce((sum, date) => sum + (row?.[date] ?? 0), 0);
                                        const last30DaysTotal = dates.reduce((sum, date) => {
                                            const current = new Date();
                                            const rowDate = new Date(date);
                                            const diffInDays = (current.setHours(0,0,0,0) - rowDate.setHours(0,0,0,0)) / (1000*60*60*24);
                                            return diffInDays >= 0 && diffInDays <= 30 ? sum + (row?.[date] ?? 0) : sum;
                                        }, 0);

                                        return (
                                            <tr key={`${roundTakenBy}-${centerName}`}>
                                                <td className="text-center px-1 py-2" style={tdStyle(idx, 0, dodColWidths[0])}>{roundTakenBy}</td>
                                                <td className="text-center px-1 py-2" style={tdStyle(idx, dodColWidths[0], dodColWidths[1])}>{centerName}</td>
                                                <td className="text-center px-1 py-2" style={tdStyle(idx, dodColWidths[0]+dodColWidths[1], dodColWidths[2])}>{role}</td>
                                                <td className="text-center px-1 py-2" style={tdStyle(idx, dodColWidths[0]+dodColWidths[1]+dodColWidths[2], dodColWidths[3])}>{last30DaysTotal}</td>
                                                <td className="text-center px-1 py-2" style={tdStyle(idx, dodColWidths[0]+dodColWidths[1]+dodColWidths[2]+dodColWidths[3], dodColWidths[4])}>{currentMonthTotal}</td>
                                                {dates.map((date) => (
                                                    <td key={date} className="text-center px-1 py-2" style={tdStyle(idx)}>
                                                        {row?.[date] ?? ""}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
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
