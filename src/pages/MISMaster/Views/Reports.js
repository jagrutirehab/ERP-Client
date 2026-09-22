import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { getActiveReports, runReport } from "../../../helpers/reportsMakerApiHelper";

const formatColumnLabel = (key) =>
    key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

const formatCellValue = (key, value) => {
    if (value === null || value === undefined) return "";
    if (/date/i.test(key)) {
        const d = new Date(value);
        if (!isNaN(d)) {
            return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
        }
    }
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

const normalizeRows = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.payload)) return response.payload;
    if (Array.isArray(response?.payload?.data)) return response.payload.data;
    return null;
};

const headerStyle = {
    border: "1px solid #cfd8e3",
    background: "#004d00",
    color: "white",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 2,
};

const cellStyle = (idx) => ({
    border: "1px solid #d6dde8",
    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
    whiteSpace: "nowrap",
});

const Reports = () => {
    const [categories, setCategories] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [reportsError, setReportsError] = useState(null);

    const [selectedReportKey, setSelectedReportKey] = useState(null);
    const [runLoading, setRunLoading] = useState(false);
    const [runError, setRunError] = useState(null);
    const [rawResult, setRawResult] = useState(null);

    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        setReportsLoading(true);
        getActiveReports()
            .then((res) => {
                setCategories(res?.categories || []);
                setReportsError(null);
            })
            .catch((err) => {
                setReportsError(err?.message || "Failed to load reports list");
            })
            .finally(() => setReportsLoading(false));
    }, []);

    const reportOptions = useMemo(() => (
        categories.map((cat) => ({
            label: cat.category,
            options: (cat.reports || []).map((r) => ({ value: r.key, label: r.name })),
        }))
    ), [categories]);

    const flatReports = useMemo(() => (
        categories.flatMap((cat) => cat.reports || [])
    ), [categories]);

    const selectedReport = flatReports.find((r) => r.key === selectedReportKey) || null;

    const handleRun = () => {
        if (!selectedReportKey) return;
        setRunLoading(true);
        setRunError(null);
        setRawResult(null);
        runReport(selectedReportKey)
            .then((res) => {
                setRawResult(res);
            })
            .catch((err) => {
                setRunError(err?.message || "Failed to run report");
            })
            .finally(() => setRunLoading(false));
    };

    const rows = useMemo(() => normalizeRows(rawResult), [rawResult]);

    const columns = useMemo(() => {
        if (!rows || rows.length === 0) return [];
        return Object.keys(rows[0]).filter((k) => !k.startsWith("_"));
    }, [rows]);

    const prepareCsvData = () => {
        if (!rows || rows.length === 0) return;
        setCsvLoading(true);
        const csvHeaders = columns.map((key) => formatColumnLabel(key));
        const csvRows = rows.map((row) => columns.map((key) => formatCellValue(key, row[key])));
        setCsvData([csvHeaders, ...csvRows]);
        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    return (
        <>
            <Row className="g-2 align-items-center mb-3">
                <Col md={4}>
                    <Select
                        value={selectedReport ? { value: selectedReport.key, label: selectedReport.name } : null}
                        onChange={(opt) => setSelectedReportKey(opt?.value || null)}
                        options={reportOptions}
                        placeholder={reportsLoading ? "Loading reports..." : "Select a report..."}
                        isLoading={reportsLoading}
                        isDisabled={reportsLoading || !!reportsError}
                        isClearable
                    />
                </Col>
                <Col xs="auto">
                    <Button
                        color="success"
                        onClick={handleRun}
                        disabled={!selectedReportKey || runLoading}
                    >
                        {runLoading ? "Running..." : "Run Report"}
                    </Button>
                </Col>
                {rows && rows.length > 0 && (
                    <Col xs="auto">
                        <Button color="info" onClick={prepareCsvData} disabled={csvLoading}>
                            {csvLoading ? "Preparing CSV..." : "Export CSV"}
                        </Button>
                        <CSVLink
                            data={csvData || []}
                            filename={`${selectedReportKey || "report"}.csv`}
                            className="d-none"
                            ref={csvRef}
                        />
                    </Col>
                )}
            </Row>

            {reportsError && <Alert color="danger">{reportsError}</Alert>}

            <Card>
                <CardBody>
                    {runLoading && (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="mt-2 text-muted">Running report...</p>
                        </div>
                    )}

                    {runError && !runLoading && <Alert color="danger">{runError}</Alert>}

                    {!runLoading && !runError && rawResult && rows && (
                        <div style={{ overflowX: "auto" }}>
                            <Table
                                className="mb-0"
                                style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
                            >
                                <thead>
                                    <tr>
                                        {columns.map((key) => (
                                            <th key={key} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 110 }}>
                                                {formatColumnLabel(key)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length > 0 ? (
                                        rows.map((row, idx) => (
                                            <tr key={row._id ?? idx}>
                                                {columns.map((key) => (
                                                    <td key={key} className="text-center px-1 py-1" style={cellStyle(idx)}>
                                                        {formatCellValue(key, row[key])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length || 1} className="text-center text-muted py-4">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {!runLoading && !runError && rawResult && !rows && (
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.75rem" }}>
                            {JSON.stringify(rawResult, null, 2)}
                        </pre>
                    )}

                    {!runLoading && !runError && !rawResult && (
                        <div className="text-center text-muted py-4">
                            Select a report and click "Run Report" to see results.
                        </div>
                    )}
                </CardBody>
            </Card>
        </>
    );
};

export default Reports;
