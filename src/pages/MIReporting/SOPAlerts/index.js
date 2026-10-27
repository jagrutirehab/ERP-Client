import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { fetchSopAlertsMonthly } from "../../../store/features/miReporting/miReportingSlice";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parseMonthYear = (str) => {
    if (!str) return new Date(0);
    const [mon, year] = str.split(" ");
    const monthIdx = MONTH_ABBR.indexOf(mon);
    return new Date(parseInt(year, 10), monthIdx, 1);
};
const pad2 = (n) => String(n).padStart(2, "0");
const toIsoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fromIsoDate = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
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

const thCompact = { ...headerStyle, padding: "3px 6px" };
const tdCompact = (idx) => ({ ...cellStyle(idx), padding: "2px 6px" });

const sumCenterCounts = (rows, allCenters = []) => {
    const byCenter = new Map();
    allCenters.forEach((center) => {
        byCenter.set(center, {
            center,
            total_alerts: 0,
            unresolved_alerts: 0,
            resolved_alerts: 0,
            resolved_with_notes: 0,
            tat_hours_weighted_sum: 0,
            tat_resolved_count: 0,
        });
    });
    rows.forEach((row) => {
        const agg = byCenter.get(row.center) || {
            center: row.center,
            total_alerts: 0,
            unresolved_alerts: 0,
            resolved_alerts: 0,
            resolved_with_notes: 0,
            tat_hours_weighted_sum: 0,
            tat_resolved_count: 0,
        };
        agg.total_alerts += Number(row.total_alerts) || 0;
        agg.unresolved_alerts += Number(row.unresolved_alerts) || 0;
        agg.resolved_alerts += Number(row.resolved_alerts) || 0;
        agg.resolved_with_notes += Number(row.resolved_with_notes) || 0;
        const rowTat = Number(row.resolution_tat_hours);
        const rowResolved = Number(row.resolved_alerts) || 0;
        if (Number.isFinite(rowTat) && rowResolved > 0) {
            agg.tat_hours_weighted_sum += rowTat * rowResolved;
            agg.tat_resolved_count += rowResolved;
        }
        byCenter.set(row.center, agg);
    });

    return [...byCenter.values()]
        .map((agg) => ({
            ...agg,
            resolution_tat_hours: agg.tat_resolved_count > 0 ? agg.tat_hours_weighted_sum / agg.tat_resolved_count : null,
            compliance_pct: agg.total_alerts > 0 ? (agg.resolved_alerts / agg.total_alerts) * 100 : null,
        }))
        .sort((a, b) => {
            if (a.center === "All Centers") return -1;
            if (b.center === "All Centers") return 1;
            return (a.center || "").localeCompare(b.center || "");
        });
};

const getTatDays = (row) => {
    const hours = Number(row.resolution_tat_hours);
    if (!Number.isFinite(hours)) return "-";
    return (hours / 24).toFixed(1);
};

const getCompliancePct = (row) => {
    const pct = Number(row.compliance_pct);
    if (!Number.isFinite(pct)) return "-";
    return `${pct.toFixed(2)}%`;
};

const SOPAlerts = () => {
    const dispatch = useDispatch();
    const { sopAlertsMonthly, loading, error } = useSelector((state) => state.MIReporting);

    const [selectedSeverity, setSelectedSeverity] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    const [selectedRole, setSelectedRole] = useState("ALL");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [selectedSeverity2, setSelectedSeverity2] = useState("ALL");
    const [selectedDate, setSelectedDate] = useState(null);
    const [csvData2, setCsvData2] = useState([]);
    const [csvLoading2, setCsvLoading2] = useState(false);
    const csvRef2 = useRef();

    useEffect(() => {
        dispatch(fetchSopAlertsMonthly({}));
    }, [dispatch]);

    const data = useMemo(() => sopAlertsMonthly?.data || [], [sopAlertsMonthly]);
    const monthData = useMemo(() => data.filter((d) => d.period_type === "month"), [data]);
    const dayData = useMemo(() => data.filter((d) => d.period_type === "day"), [data]);

    // Every center that appears anywhere in the data, so a center with zero
    // matching alerts for the current filters still shows up with 0s instead
    // of silently disappearing from the table.
    const allCenters = useMemo(() => (
        [...new Set(data.map((d) => d.center))].filter(Boolean).sort((a, b) => {
            if (a === "All Centers") return -1;
            if (b === "All Centers") return 1;
            return a.localeCompare(b);
        })
    ), [data]);

    // ── Table 1: Severity + Month ────────────────────────────────────────────
    const severityOptions = useMemo(() => [
        { value: "ALL", label: "All Severities" },
        ...[...new Set(monthData.map((d) => d.severity))].filter(Boolean).sort().map((v) => ({ value: v, label: v })),
    ], [monthData]);

    useEffect(() => {
        if (!severityOptions.some((o) => o.value === selectedSeverity)) {
            setSelectedSeverity(severityOptions[0]?.value || null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [severityOptions]);

    const monthOptions = useMemo(() => (
        [...new Set(monthData.map((d) => d.period))]
            .filter(Boolean)
            .sort((a, b) => parseMonthYear(b) - parseMonthYear(a))
            .map((m) => ({ value: m, label: m }))
    ), [monthData]);

    useEffect(() => {
        if (!selectedMonth && monthOptions.length > 0) {
            setSelectedMonth(monthOptions[0].value);
        }
    }, [monthOptions, selectedMonth]);

    // Rows are keyed by (center, severity, category, period) — several rows
    // can share the same center/period, one per category, and "All Severities"
    // spans every severity too. Collapse them down to one row per center by
    // summing counts and recomputing the TAT/compliance averages from those
    // summed counts.
    const filteredRows = useMemo(() => {
        const matching = monthData.filter((d) => (
            (selectedSeverity === "ALL" || d.severity === selectedSeverity) && d.period === selectedMonth
        ));
        return sumCenterCounts(matching, allCenters);
    }, [monthData, selectedSeverity, selectedMonth, allCenters]);

    const prepareCsvData = () => {
        setCsvLoading(true);
        const headers = ["Center Name", "Total Alerts", "Unresolved Alerts", "Resolved Alerts", "Resolved with Notes", "Resol TAT (In Days)", "Compliance %"];
        const rows = filteredRows.map((row) => [
            row.center,
            row.total_alerts ?? "",
            row.unresolved_alerts ?? "",
            row.resolved_alerts ?? "",
            row.resolved_with_notes ?? "",
            getTatDays(row),
            getCompliancePct(row),
        ]);
        setCsvData([headers, ...rows]);
        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    // ── Table 2: Role + Category + Severity + Date ──────────────────────────
    const roleOptions = useMemo(() => [
        { value: "ALL", label: "All Roles" },
        ...[...new Set(dayData.flatMap((d) => d.role || []))].filter(Boolean).sort().map((v) => ({ value: v, label: v })),
    ], [dayData]);

    const categoryOptions = useMemo(() => [
        { value: "ALL", label: "All Categories" },
        ...[...new Set(dayData.map((d) => d.category))].filter(Boolean).sort().map((v) => ({ value: v, label: v })),
    ], [dayData]);

    const severityOptions2 = useMemo(() => [
        { value: "ALL", label: "All Severities" },
        ...[...new Set(dayData.map((d) => d.severity))].filter(Boolean).sort().map((v) => ({ value: v, label: v })),
    ], [dayData]);

    const dateBounds = useMemo(() => {
        const dates = [...new Set(dayData.map((d) => d.period))].filter(Boolean).map((p) => fromIsoDate(p));
        if (dates.length === 0) return { minDate: undefined, maxDate: undefined };
        return {
            minDate: new Date(Math.min(...dates)),
            maxDate: new Date(Math.max(...dates)),
        };
    }, [dayData]);

    useEffect(() => {
        if (!selectedDate && dateBounds.maxDate) {
            setSelectedDate(toIsoDate(dateBounds.maxDate));
        }
    }, [dateBounds, selectedDate]);

    const filteredRows2 = useMemo(() => {
        const matching = dayData.filter((d) => (
            d.period === selectedDate
            && (selectedSeverity2 === "ALL" || d.severity === selectedSeverity2)
            && (selectedCategory === "ALL" || d.category === selectedCategory)
            && (selectedRole === "ALL" || (d.role || []).includes(selectedRole))
        ));
        return sumCenterCounts(matching, allCenters);
    }, [dayData, selectedDate, selectedSeverity2, selectedCategory, selectedRole, allCenters]);

    const prepareCsvData2 = () => {
        setCsvLoading2(true);
        const headers = ["Center Name", "Total Alerts", "Unresolved Alerts", "Resolved Alerts", "Resolved with Notes", "Compliance %"];
        const rows = filteredRows2.map((row) => [
            row.center,
            row.total_alerts ?? "",
            row.unresolved_alerts ?? "",
            row.resolved_alerts ?? "",
            row.resolved_with_notes ?? "",
            getCompliancePct(row),
        ]);
        setCsvData2([headers, ...rows]);
        setTimeout(() => {
            csvRef2.current.link.click();
            setCsvLoading2(false);
        }, 100);
    };

    document.title = "SOP Alerts";

    return (
        <div
            className="w-100 mt-4 mt-sm-0"
            style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}
        >
            <div className="row">
                <div className="col-12">
                    <div className="p-3 pb-0">
                        <div className="row align-items-center">
                            <div className="col-sm-6 col-8">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                                        <i className="bx bx-bell fs-1"></i>
                                    </div>
                                    <h6 className="text-truncate mb-0 fs-18">SOP Alerts</h6>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 p-lg-4">
                        <Row className="g-2 align-items-center mb-2">
                            <Col md={2}>
                                <Select
                                    value={severityOptions.find((o) => o.value === selectedSeverity) || null}
                                    onChange={(opt) => opt && setSelectedSeverity(opt.value)}
                                    options={severityOptions}
                                    placeholder="Severity..."
                                />
                            </Col>
                            <Col md={2}>
                                <Select
                                    value={monthOptions.find((o) => o.value === selectedMonth) || null}
                                    onChange={(opt) => opt && setSelectedMonth(opt.value)}
                                    options={monthOptions}
                                    placeholder="Month..."
                                />
                            </Col>
                            <Col xs="auto" className="ms-auto">
                                <Button
                                    color="info"
                                    onClick={prepareCsvData}
                                    disabled={csvLoading || loading || !filteredRows.length}
                                    className="w-auto"
                                >
                                    {csvLoading ? "Preparing CSV..." : "Export CSV"}
                                </Button>
                                <CSVLink
                                    data={csvData || []}
                                    filename={`sop-alerts-${selectedMonth || "monthly"}.csv`}
                                    className="d-none"
                                    ref={csvRef}
                                />
                            </Col>
                        </Row>

                        <Card className="mb-4">
                            <CardBody>
                                {loading && (
                                    <div className="text-center py-5">
                                        <Spinner color="primary" />
                                        <p className="mt-2 text-muted">Loading data...</p>
                                    </div>
                                )}
                                {error && !loading && <Alert color="danger">{error}</Alert>}
                                {!loading && !error && (
                                    <div
                                        className="shadow-sm bg-white"
                                        style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "calc(100vh - 290px)", display: "inline-block", maxWidth: "100%" }}
                                    >
                                        <Table
                                            className="mb-0"
                                            style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.68rem", tableLayout: "auto", width: "auto" }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th className="text-center fw-bold" style={thCompact}>Center Name</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Total Alerts</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Unresolved Alerts</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Resolved Alerts</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Resolved with Notes</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Resol TAT (In Days)</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Compliance %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRows.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="text-center py-4 text-muted">No data found</td>
                                                    </tr>
                                                ) : (
                                                    filteredRows.map((row, idx) => {
                                                        const isAllCenters = row.center === "All Centers";
                                                        return (
                                                            <tr key={`${row.center}-${idx}`} style={isAllCenters ? { background: "#eef6ee" } : undefined}>
                                                                <td className="fw-semibold" style={isAllCenters ? { ...tdCompact(idx), fontWeight: 700 } : tdCompact(idx)}>{row.center}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{row.total_alerts ?? ""}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{row.unresolved_alerts ?? ""}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{row.resolved_alerts ?? ""}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{row.resolved_with_notes ?? ""}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{getTatDays(row)}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{getCompliancePct(row)}</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        <Row className="g-2 align-items-center mb-2">
                            <Col md={2}>
                                <Select
                                    value={roleOptions.find((o) => o.value === selectedRole) || roleOptions[0]}
                                    onChange={(opt) => setSelectedRole(opt.value)}
                                    options={roleOptions}
                                    placeholder="Role..."
                                />
                            </Col>
                            <Col md={2}>
                                <Select
                                    value={categoryOptions.find((o) => o.value === selectedCategory) || categoryOptions[0]}
                                    onChange={(opt) => setSelectedCategory(opt.value)}
                                    options={categoryOptions}
                                    placeholder="Category..."
                                />
                            </Col>
                            <Col md={2}>
                                <Select
                                    value={severityOptions2.find((o) => o.value === selectedSeverity2) || severityOptions2[0]}
                                    onChange={(opt) => setSelectedSeverity2(opt.value)}
                                    options={severityOptions2}
                                    placeholder="Severity..."
                                />
                            </Col>
                            <Col md={2}>
                                <Flatpickr
                                    className="form-control"
                                    value={fromIsoDate(selectedDate)}
                                    options={{
                                        dateFormat: "d-M-Y",
                                        minDate: dateBounds.minDate,
                                        maxDate: dateBounds.maxDate,
                                    }}
                                    onChange={([date]) => date && setSelectedDate(toIsoDate(date))}
                                    placeholder="Select date..."
                                />
                            </Col>
                            <Col xs="auto" className="ms-auto">
                                <Button
                                    color="info"
                                    onClick={prepareCsvData2}
                                    disabled={csvLoading2 || loading || !filteredRows2.length}
                                    className="w-auto"
                                >
                                    {csvLoading2 ? "Preparing CSV..." : "Export CSV"}
                                </Button>
                                <CSVLink
                                    data={csvData2 || []}
                                    filename={`sop-alerts-daily-${selectedDate || "day"}.csv`}
                                    className="d-none"
                                    ref={csvRef2}
                                />
                            </Col>
                        </Row>

                        <Card>
                            <CardBody>
                                {!loading && !error && (
                                    <div
                                        className="shadow-sm bg-white"
                                        style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "calc(100vh - 290px)", display: "inline-block", maxWidth: "100%" }}
                                    >
                                        <Table
                                            className="mb-0"
                                            style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.68rem", tableLayout: "auto", width: "auto" }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th className="text-center fw-bold" style={thCompact}>Center Name</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Total Alerts</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Unresolved Alerts</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Resolved Alerts</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Resolved with Notes</th>
                                                    <th className="text-center fw-bold" style={thCompact}>Compliance %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRows2.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center py-4 text-muted">No data found</td>
                                                    </tr>
                                                ) : (
                                                    filteredRows2.map((row, idx) => {
                                                        const isAllCenters = row.center === "All Centers";
                                                        return (
                                                            <tr key={`${row.center}-${idx}`} style={isAllCenters ? { background: "#eef6ee" } : undefined}>
                                                                <td className="fw-semibold" style={isAllCenters ? { ...tdCompact(idx), fontWeight: 700 } : tdCompact(idx)}>{row.center}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{row.total_alerts ?? ""}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{row.unresolved_alerts ?? ""}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{row.resolved_alerts ?? ""}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{row.resolved_with_notes ?? ""}</td>
                                                                <td className="text-center" style={tdCompact(idx)}>{getCompliancePct(row)}</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SOPAlerts;
