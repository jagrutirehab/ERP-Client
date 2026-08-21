import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import { fetchNursesDailyActivity } from "../../../store/features/miReporting/miReportingSlice";
import Select from "react-select";

const METRIC_OPTIONS = [
    { value: "VITAL_SIGNS", label: "Vital Signs" },
    { value: "MEDICINES", label: "Medicines Marked" },
];

const NursesDashboardDOD = () => {
    const dispatch = useDispatch();
    const nursesDailyActivity = useSelector((state) => state.MIReporting.nursesDailyActivity);
    const loading = useSelector((state) => state.MIReporting.loading);
    const error = useSelector((state) => state.MIReporting.error);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [selectedMetric, setSelectedMetric] = useState("VITAL_SIGNS");
    const [selectedNurse, setSelectedNurse] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchNursesDailyActivity({ centerAccess }));
    }, [dispatch, centerAccess]);

    const data = useMemo(() => nursesDailyActivity?.data || [], [nursesDailyActivity]);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            if (selectedCenter !== "ALL" && item?.center_name !== selectedCenter) return false;
            if (selectedNurse !== "ALL" && item?.nurse_name !== selectedNurse) return false;
            return true;
        });
    }, [data, selectedCenter, selectedNurse]);

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(data.map((item) => item.center_name))].filter(Boolean).map((center) => ({
            value: center,
            label: center,
        })),
    ], [data]);

    const nurseOptions = useMemo(() => [
        { value: "ALL", label: "All Nurses" },
        ...[...new Set(
            data
                .filter((item) => selectedCenter === "ALL" || item?.center_name === selectedCenter)
                .map((item) => item.nurse_name)
        )].filter(Boolean).sort().map((nurse) => ({
            value: nurse,
            label: nurse,
        })),
    ], [data, selectedCenter]);

    useEffect(() => {
        if (selectedNurse === "ALL") return;
        if (!nurseOptions.some((o) => o.value === selectedNurse)) {
            setSelectedNurse("ALL");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nurseOptions]);

    const dayKeyField = selectedMetric === "MEDICINES" ? "medicines_marked_dod" : "vital_signs_dod";
    const mtdField = selectedMetric === "MEDICINES" ? "current_month_medicines_marked_total" : "current_month_vital_signs_total";

    const labels = [
        "Nurse Name",
        "Center Name",
        "MTD",
    ];

    const fixedColWidths = [140, 100, 60];

    const labelsMapping = {
        "Nurse Name": "nurse_name",
        "Center Name": "center_name",
        "MTD": mtdField,
    };

    const last60Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 1; i < 60; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
            const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).replace(/ /g, "-");
            days.push({ key, label });
        }
        return days;
    }, []);

    const dateTotals = useMemo(() => {
        const totals = {};
        last60Days.forEach(({ key }) => {
            totals[key] = filteredData.reduce((sum, row) => sum + (Number(row?.[dayKeyField]?.[key]) || 0), 0);
        });
        return totals;
    }, [filteredData, last60Days, dayKeyField]);

    const prepareCsvData = () => {
        setCsvLoading(true);

        const allHeaders = [...labels, ...last60Days.map(({ label }) => label)];

        const totalsRow = [
            "Total",
            ...Array(labels.length - 1).fill(""),
            ...last60Days.map(({ key }) => dateTotals[key] || ""),
        ];

        const rows = [
            totalsRow,
            allHeaders,
            ...filteredData.map((nurse) => [
                ...labels.map((label) => nurse[labelsMapping[label]] ?? ""),
                ...last60Days.map(({ key }) => nurse?.[dayKeyField]?.[key] ?? ""),
            ]),
        ];

        setCsvData(rows);

        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    document.title = "Nurses Dashboard DOD";

    return (
        <div
            className="w-100 mt-4 mt-sm-0"
            style={{
                flex: 1,
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
            }}
        >
            <div className="row">
                <div className="col-12">
                    <div className="p-3 pb-0">
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
                                                    Nurses Dashboard DOD
                                                </h6>
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
                                        disabled={
                                            csvLoading ||
                                            loading ||
                                            !nursesDailyActivity ||
                                            nursesDailyActivity.length === 0
                                        }
                                        className="w-auto"
                                    >
                                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                                    </Button>
                                    <CSVLink
                                        data={csvData || []}
                                        filename={`nurses-daily-activity-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
                                        className="d-none"
                                        ref={csvRef}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 p-lg-4 pt-1">
                        <Row className="g-2 align-items-center mb-4">
                            <Col md={2}>
                                <Select
                                    value={centerOptions.find((o) => o.value === selectedCenter) || centerOptions[0]}
                                    onChange={(opt) => setSelectedCenter(opt.value)}
                                    options={centerOptions}
                                    placeholder="Center..."
                                />
                            </Col>
                            <Col md={2}>
                                <Select
                                    value={METRIC_OPTIONS.find((o) => o.value === selectedMetric) || METRIC_OPTIONS[0]}
                                    onChange={(opt) => setSelectedMetric(opt.value)}
                                    options={METRIC_OPTIONS}
                                    placeholder="Data..."
                                />
                            </Col>
                            <Col md={2}>
                                <Select
                                    value={nurseOptions.find((o) => o.value === selectedNurse) || nurseOptions[0]}
                                    onChange={(opt) => setSelectedNurse(opt.value)}
                                    options={nurseOptions}
                                    placeholder="Nurse..."
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
                                        <div className="shadow-sm bg-white" style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "70vh" }}>
                                            <Table
                                                className="mb-0 w-100"
                                                style={{
                                                    borderCollapse: "separate",
                                                    borderSpacing: 0,
                                                    fontSize: "0.68rem",
                                                }}
                                            >
                                                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                                    <tr>
                                                        {labels.map((label, i) => (
                                                            <th
                                                                key={label}
                                                                className="text-center fw-bold px-1 py-1"
                                                                style={{
                                                                    border: "1px solid #cfd8e3",
                                                                    background: "#004d00",
                                                                    color: "white",
                                                                    whiteSpace: "nowrap",
                                                                    minWidth: fixedColWidths[i],
                                                                    ...(i < 3 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 1 }),
                                                                }}
                                                            >
                                                                {i === labels.length - 1 ? "Total (Single Day)" : i === 0 ? "Nurses" : i === 1 ? `${filteredData.length}` : ""}
                                                            </th>
                                                        ))}
                                                        {last60Days.map(({ key }) => (
                                                            <th
                                                                key={key}
                                                                className="text-center fw-bold px-1 py-1"
                                                                style={{
                                                                    border: "1px solid #cfd8e3",
                                                                    background: "#004d00",
                                                                    color: "white",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {dateTotals[key] || ""}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                    <tr>
                                                        {labels.map((label, i) => (
                                                            <th
                                                                key={label}
                                                                className="text-center fw-bold px-1 py-1"
                                                                style={{
                                                                    border: "1px solid #cfd8e3",
                                                                    background: "green",
                                                                    color: "white",
                                                                    whiteSpace: label === "Center Name" ? "wrap" : "nowrap",
                                                                    minWidth: fixedColWidths[i],
                                                                    ...(i < 3 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 1 }),
                                                                }}
                                                            >
                                                                {label}
                                                            </th>
                                                        ))}
                                                        {last60Days.map(({ key, label }) => (
                                                            <th
                                                                key={key}
                                                                className="text-center fw-bold px-1 py-1"
                                                                style={{
                                                                    border: "1px solid #cfd8e3",
                                                                    background: "green",
                                                                    color: "white",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {label}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {filteredData.map((nurse, idx) => (
                                                        <tr key={nurse?.nurse_id ?? idx}>
                                                            {labels.map((label, i) => (
                                                                <td
                                                                    key={label}
                                                                    className="text-center px-1 py-1"
                                                                    style={{
                                                                        border: "1px solid #d6dde8",
                                                                        background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                                        whiteSpace: "nowrap",
                                                                        ...(i < 3 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 3 }),
                                                                        minWidth: fixedColWidths[i],
                                                                    }}
                                                                >
                                                                    {label === "Nurse Name"
                                                                        ? (
                                                                            <Link to={`/nurse/p/${nurse.nurse_id}`} className="text-dark" target="_blank" rel="noopener noreferrer">
                                                                                {(nurse[labelsMapping[label]] ?? "").slice(0, 20)}
                                                                            </Link>
                                                                        )
                                                                        : nurse[labelsMapping[label]] ?? ""}
                                                                </td>
                                                            ))}
                                                            {last60Days.map(({ key }) => (
                                                                <td
                                                                    key={key}
                                                                    className="text-center px-1 py-1"
                                                                    style={{
                                                                        border: "1px solid #d6dde8",
                                                                        background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {nurse?.[dayKeyField]?.[key] ?? 0}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
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

export default NursesDashboardDOD;