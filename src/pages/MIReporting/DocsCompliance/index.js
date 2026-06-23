import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Row, Col } from "reactstrap";
import { fetchDocsCompliance } from "../../../store/features/miReporting/miReportingSlice";
import Select from "react-select";

const METRICS = [
    { label: "Admission Form",       key: "admission_form"       },
    { label: "Consent Form",         key: "consent_form"         },
    { label: "Bio Data",             key: "bio_data"             },
    { label: "Profile Photo",        key: "profile_photo"        },
    { label: "Prescription",         key: "prescription"         },
    { label: "History",              key: "history"              },
    { label: "Belongings Form",      key: "belongings_form"      },
    { label: "Lab Report",           key: "lab_report"           },
    { label: "Nurses DOD",           key: "nurses_dod"           },
    { label: "Daily Invoice",        key: "daily_invoice"        },
    { label: "Vital Signs",          key: "vital_signs"          },
    { label: "Clinical Notes",       key: "clinical_notes"       },
    { label: "Counselling Sessions", key: "counselling_sessions" },
    { label: "Round Notes",          key: "round_notes"          },
    { label: "Counselling Recording",key: "counselling_recording"},
    { label: "Due Amount",           key: "due_amount"           },
    { label: "Prescription Status",  key: "prescription_status"  },
];

const DocsCompliance = () => {
    const dispatch = useDispatch();
    const docsCompliance = useSelector((state) => state.MIReporting.docsCompliance);
    const loading = useSelector((state) => state.MIReporting.loading);
    const error = useSelector((state) => state.MIReporting.error);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("Total");
    const [compliance, setCompliance] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState(METRICS[0].key);
    const data = useMemo(() => docsCompliance?.data || [], [docsCompliance]);

    useEffect(() => {
        dispatch(fetchDocsCompliance({ centerAccess }));
    }, [dispatch, centerAccess]);

    const months = useMemo(() => {
        const result = [];
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            result.push(`${y}-${m}`);
        }
        return result;
    }, []);

    const formatMonth = (m) => {
        const [year, month] = m.split("-");
        const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return `${names[parseInt(month) - 1]} ${year}`;
    };

    const centerOptions = useMemo(() => {
        const names = new Set();
        data.forEach((item) => {
            (item.rows || []).forEach((row) => {
                if (row.center_name) names.add(row.center_name);
            });
        });
        return [
            { value: "Total", label: "All Centers" },
            ...[...names]
                .filter((n) => n !== "Total")
                .sort((a, b) => a.localeCompare(b))
                .map((n) => ({ value: n, label: n })),
        ];
    }, [data]);

    const getMonthData = (month) => {
        const rows = data.find((d) => d.month === month)?.rows || [];

        if (selectedCenter === "Total") {
            const aggregated = {};
            rows.forEach((row) => {
                METRICS.forEach(({ key }) => {
                    const entry = row[key] || {};
                    if (!aggregated[key]) aggregated[key] = { result_count: 0, should_be_count: 0 };
                    aggregated[key].result_count += entry.result_count ?? 0;
                    aggregated[key].should_be_count += entry.should_be_count ?? 0;
                });
            });
            return aggregated;
        }

        return rows.find((r) => r.center_name == selectedCenter) || {};
    };

    const getCellValue = (metricKey, month) => {
        const monthData = getMonthData(month);

        const entry = monthData[metricKey] || {};
        const actual = entry.result_count ?? null;
        const shouldBe = entry.should_be_count ?? null;
        if (actual == null) return "";
        if (compliance) {
            if (shouldBe == null || shouldBe === 0) return "";
            return `${Math.round((actual / shouldBe) * 100)}%`;
        }
        return actual;
    };

    const metricOptions = METRICS.map((m) => ({ value: m.key, label: m.label }));

const getCenterCellValue = (row, metricKey) => {
        const entry = row[metricKey] || {};
        const actual = entry.result_count ?? null;
        const shouldBe = entry.should_be_count ?? null;
        if (actual == null) return "";
        if (compliance) {
            if (shouldBe == null || shouldBe === 0) return "";
            return `${Math.round((actual / shouldBe) * 100)}%`;
        }
        return actual;
    };

    const centerNames = useMemo(() => {
        const names = new Set();
        data.forEach((item) => {
            (item.rows || []).forEach((row) => {
                if (row.center_name) names.add(row.center_name);
            });
        });
        return [...names].sort((a, b) => a.localeCompare(b));
    }, [data]);

    const getCenterMonthValue = (centerName, month) => {
        const rows = data.find((d) => d.month === month)?.rows || [];
        const row = rows.find((r) => r.center_name === centerName);
        if (!row) return "";
        return getCenterCellValue(row, selectedMetric);
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

    return (
        <div className="mt-4 mt-sm-0">
            <div className="p-3 d-flex align-items-center">
                <i className="bx bx-bar-chart-alt-2 fs-1 me-3"></i>
                <h6 className="text-truncate mb-0 fs-18">Docs Compliance</h6>
            </div>

            <div className="px-3 pb-3">
                <Row className="g-2 align-items-center mb-3">
                    <Col xs="auto">
                        <Select
                            value={centerOptions.find((o) => o.value === selectedCenter) || centerOptions[0]}
                            onChange={(opt) => setSelectedCenter(opt.value)}
                            options={centerOptions}
                            placeholder="Center..."
                            styles={{ container: (b) => ({ ...b, minWidth: 160 }) }}
                        />
                    </Col>
                    <Col xs="auto">
                        <Select
                            value={compliance ? { value: true, label: "Percentage" } : { value: false, label: "Number" }}
                            onChange={(opt) => setCompliance(opt.value)}
                            options={[
                                { value: true, label: "Percentage" },
                                { value: false, label: "Number" },
                            ]}
                            styles={{ container: (b) => ({ ...b, minWidth: 130 }) }}
                        />
                    </Col>
                </Row>

                <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10 }}>
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
                                    style={{ borderCollapse: "collapse", fontSize: "0.78rem", width: "100%" }}
                                >
                                    <thead>
                                        <tr>
                                            <th className="text-center fw-bold px-2 py-1" style={headerStyle}>
                                                Data
                                            </th>
                                            {months.map((month) => (
                                                <th key={month} className="text-center fw-bold px-2 py-1" style={headerStyle}>
                                                    {formatMonth(month)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody> 
                                        {METRICS.map(({ label, key }, idx) => (
                                            <tr key={key}>
                                                <td className="px-2 py-1 fw-semibold" style={cellStyle(idx)}>
                                                    {label}
                                                </td>
                                                {months.map((month) => (
                                                    <td key={month} className="text-center px-2 py-1" style={cellStyle(idx)}>
                                                        {getCellValue(key, formatMonth(month))}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Center breakdown table */}
                <Row className="g-2 align-items-center mb-3 mt-4">
                    <Col xs="auto">
                        <Select
                            value={metricOptions.find((o) => o.value === selectedMetric) || metricOptions[0]}
                            onChange={(opt) => setSelectedMetric(opt.value)}
                            options={metricOptions}
                            placeholder="Select data..."
                            styles={{ container: (b) => ({ ...b, minWidth: 200 }) }}
                        />
                    </Col>
                </Row>

                <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10 }}>
                    <CardBody className="p-0">
                        {!loading && !error && (
                            <div style={{ overflowX: "auto" }}>
                                <Table
                                    className="mb-0"
                                    style={{ borderCollapse: "collapse", fontSize: "0.78rem", width: "100%" }}
                                >
                                    <thead>
                                        <tr>
                                            <th className="text-center fw-bold px-2 py-1" style={headerStyle}>
                                                Center Name
                                            </th>
                                            {months.map((month) => (
                                                <th key={month} className="text-center fw-bold px-2 py-1" style={headerStyle}>
                                                    {formatMonth(month)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {centerNames.map((name, idx) => (
                                            <tr key={name}>
                                                <td className="px-2 py-1 fw-semibold" style={cellStyle(idx)}>
                                                    {name}
                                                </td>
                                                {months.map((month) => (
                                                    <td key={month} className="text-center px-2 py-1" style={cellStyle(idx)}>
                                                        {getCenterMonthValue(name, formatMonth(month))}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default DocsCompliance;
