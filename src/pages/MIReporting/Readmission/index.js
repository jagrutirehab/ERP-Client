import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { fetchReadmissionMonthly } from "../../../store/features/miReporting/miReportingSlice";

const BUCKET_FIELDS = [
    { key: "total_count", label: "Total Count" },
    { key: "0_7", label: "0-7 Days" },
    { key: "8_15", label: "8-15 Days" },
    { key: "16_30", label: "16-30 Days" },
    { key: "31_45", label: "31-45 Days" },
    { key: "46_60", label: "46-60 Days" },
    { key: "61_75", label: "61-75 Days" },
    { key: "76_90", label: "76-90 Days" },
    { key: "90_plus", label: "90+ Days" },
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

const Readmission = () => {
    const dispatch = useDispatch();
    const { readmissionMonthly, loading, error } = useSelector((state) => state.MIReporting);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchReadmissionMonthly({ centerAccess }));
    }, [dispatch, centerAccess]);

    const data = useMemo(() => readmissionMonthly?.data || [], [readmissionMonthly]);

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
                map[item.month] = { weightedAvgSum: 0 };
                BUCKET_FIELDS.forEach(({ key }) => { map[item.month][key] = 0; });
            }
            BUCKET_FIELDS.forEach(({ key }) => {
                map[item.month][key] += Number(item[key]) || 0;
            });
            map[item.month].weightedAvgSum += (Number(item.average_days) || 0) * (Number(item.total_count) || 0);
        });
        return map;
    }, [filteredData]);

    const getAverageDays = (month) => {
        const entry = pivot[month];
        if (!entry || !entry.total_count) return "0.00";
        return (entry.weightedAvgSum / entry.total_count).toFixed(2);
    };

    const prepareCsvData = () => {
        setCsvLoading(true);

        const csvHeaders = ["Month", ...months];
        const rows = BUCKET_FIELDS.map(({ key, label }) => [
            label,
            ...months.map((month) => pivot[month]?.[key] ?? 0),
        ]);
        const avgRow = ["Average Days", ...months.map((month) => getAverageDays(month))];

        setCsvData([csvHeaders, ...rows, avgRow]);

        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    document.title = "Readmission";

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
                                                <i className="bx bx-repost fs-1"></i>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="text-truncate mb-0 fs-18">Readmission</h6>
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
                                        filename={`readmission-monthly-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
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
                                                    <th className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 160, position: "sticky", left: 0, zIndex: 3 }}>
                                                        Month
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
                                                    <>
                                                        {BUCKET_FIELDS.map(({ key, label }, idx) => (
                                                            <tr key={key}>
                                                                <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}>
                                                                    {label}
                                                                </td>
                                                                {months.map((month) => (
                                                                    <td key={month} className="text-center px-1 py-1" style={cellStyle(idx)}>
                                                                        {pivot[month]?.[key] ?? 0}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(BUCKET_FIELDS.length), position: "sticky", left: 0, zIndex: 1 }}>
                                                                Average Days
                                                            </td>
                                                            {months.map((month) => (
                                                                <td key={month} className="text-center px-1 py-1" style={cellStyle(BUCKET_FIELDS.length)}>
                                                                    {getAverageDays(month)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    </>
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

export default Readmission;
