import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { fetchAttritionMonthly } from "../../../store/features/miReporting/miReportingSlice";

const METRICS = [
    { key: "start_employee_count", label: "Start Employee Count" },
    { key: "ending_employee_count", label: "Ending Employee Count" },
    { key: "left", label: "Left" },
    { key: "attrition_pct", label: "Attrition %", isPercent: true },
    { key: "joined", label: "Joined" },
];

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

const AttritionData = () => {
    const dispatch = useDispatch();
    const { attritionMonthly, loading, error } = useSelector((state) => state.MIReporting);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchAttritionMonthly({ centerAccess }));
    }, [dispatch, centerAccess]);

    const data = useMemo(() => attritionMonthly?.data || [], [attritionMonthly]);

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(data.map((item) => item.center_name))].filter(Boolean).sort().map((center) => ({
            value: center,
            label: center,
        })),
    ], [data]);

    const filteredData = useMemo(() => {
        if (selectedCenter === "ALL") return data;
        return data.filter((item) => item?.center_name === selectedCenter);
    }, [data, selectedCenter]);

    const months = useMemo(() => (
        [...new Set(filteredData.map((item) => item.month))]
            .filter(Boolean)
            .sort((a, b) => new Date(b) - new Date(a))
    ), [filteredData]);

    const pivot = useMemo(() => {
        const map = {};
        filteredData.forEach((item) => {
            if (!map[item.month]) {
                map[item.month] = { start_employee_count: 0, ending_employee_count: 0, left: 0, joined: 0 };
            }
            map[item.month].start_employee_count += Number(item.start_employee_count) || 0;
            map[item.month].ending_employee_count += Number(item.ending_employee_count) || 0;
            map[item.month].left += Number(item.left) || 0;
            map[item.month].joined += Number(item.joined) || 0;
        });
        return map;
    }, [filteredData]);

    const getAttritionPct = (month) => {
        const entry = pivot[month];
        if (!entry || !entry.start_employee_count) return 0;
        return (entry.left / entry.start_employee_count) * 100;
    };

    const getMetricValue = (metric, month) => {
        if (metric.isPercent) return `${Math.round(getAttritionPct(month))}%`;
        return pivot[month]?.[metric.key] ?? 0;
    };

    const prepareCsvData = () => {
        setCsvLoading(true);

        const csvHeaders = ["Metric", ...months];
        const rows = METRICS.map((metric) => [
            metric.label,
            ...months.map((month) => getMetricValue(metric, month)),
        ]);

        setCsvData([csvHeaders, ...rows]);

        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    document.title = "Attrition Data";

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
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                                                <i className="bx bx-user-minus fs-1"></i>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="text-truncate mb-0 fs-18">Attrition Data</h6>
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
                                        disabled={csvLoading || loading || months.length === 0}
                                        className="w-auto"
                                    >
                                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                                    </Button>
                                    <CSVLink
                                        data={csvData || []}
                                        filename={`attrition-data-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
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
                        </Row>

                        <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
                            <CardBody className="p-0">
                                {loading && (
                                    <div className="text-center py-4">
                                        <Spinner color="primary" />
                                        <p className="mt-2 text-muted mb-0">Loading data...</p>
                                    </div>
                                )}

                                {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

                                {!loading && !error && (
                                    <div style={{ overflowX: "auto" }}>
                                        <Table
                                            className="mb-0"
                                            style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 180, position: "sticky", left: 0, zIndex: 3 }}>
                                                        {selectedCenter === "ALL" ? "Total" : selectedCenter}
                                                    </th>
                                                    {months.map((month) => (
                                                        <th key={month} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>
                                                            {month}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {months.length > 0 ? (
                                                    METRICS.map((metric, idx) => (
                                                        <tr key={metric.key}>
                                                            <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}>
                                                                {metric.label}
                                                            </td>
                                                            {months.map((month) => (
                                                                <td key={month} className="text-center px-1 py-1" style={cellStyle(idx)}>
                                                                    {getMetricValue(metric, month)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={1} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
                                                            No data available
                                                        </td>
                                                    </tr>
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

export default AttritionData;
