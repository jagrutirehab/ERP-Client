import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import { fetchMIAttendance } from "../../../store/features/miReporting/miReportingSlice";
import Select from "react-select";

const Attendance = () => {
    const dispatch = useDispatch();
    const miAttendance = useSelector((state) => state.MIReporting.miAttendance);
    const loading = useSelector((state) => state.MIReporting.loading);
    const error = useSelector((state) => state.MIReporting.error);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchMIAttendance({ centerAccess }));
    }, [dispatch, centerAccess]);

    const data = useMemo(() => miAttendance?.data || miAttendance || [], [miAttendance]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // console.log(item)
            if (selectedCenter !== "ALL" && item?.center_name !== selectedCenter) return false;
            return true;
        });
    }, [data, selectedCenter]);

    const last60Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 1; i <= 60; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
            const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).replace(/ /g, "-");
            days.push({ key, label });
        }
        return days;
    }, []);

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(data.map((item) => item.center_name))].filter(Boolean).map((center) => ({
            value: center,
            label: center,
        })),
    ], [data]);

    const labels = ["Ecode", "Employee Name", "Center Name", "Designation","MTD", "Actual Attendance",];
    const fixedColWidths = [90, 180, 120, 220, 55, 120];
    const labelsMapping = {
        "Ecode": "ecode",
        "Employee Name": "employee_name",
        "Center Name": "center_name",
        "Designation": "designation",
        "Actual Attendance": "actual_attendance",
        "MTD": "att_till_date",
    };

    const dateTotals = useMemo(() => {
        const totals = {};
        last60Days.forEach(({ key }) => {
            
            totals[key] = filteredData.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
        });
        return totals;
    }, [filteredData, last60Days]);

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
            ...filteredData.map((emp) => [
                ...labels.map((label) => emp[labelsMapping[label]] ?? ""),
                ...last60Days.map(({ key }) => emp[key] ?? ""),
            ]),
        ];

        setCsvData(rows);

        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

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
                                                <i className="bx bx-user-check fs-1"></i>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="text-truncate mb-0 fs-18">Attendance</h6>
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
                                        disabled={csvLoading || loading || !data || data.length === 0}
                                        className="w-auto"
                                    >
                                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                                    </Button>
                                    <CSVLink
                                        data={csvData || []}
                                        filename={`attendance-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
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
                                    <div className="shadow-sm bg-white" style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "70vh" }}>
                                        <Table
                                            className="mb-0 w-100"
                                            style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.68rem" }}
                                        >
                                            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                                <tr>
                                                    {labels.map((label, i) => (
                                                        <th
                                                            key={label}
                                                            className="text-center fw-bold px-1 py-1"
                                                            style={{
                                                                border: "1px solid #cfd8e3",
                                                                background: "#002a00",
                                                                color: "white",
                                                                whiteSpace: "nowrap",
                                                                minWidth: fixedColWidths[i],
                                                                ...(i < 2 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 11 }),
                                                            }}
                                                        >
                                                            {i === labels.length - 1 ? "Total Employees" : ""}
                                                        </th>
                                                    ))}
                                                    {last60Days.map(({ key }) => (
                                                        <th
                                                            key={key}
                                                            className="text-center fw-bold px-1 py-1"
                                                            style={{
                                                                border: "1px solid #cfd8e3",
                                                                background: "#002a00",
                                                                color: "white",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {filteredData.length}
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
                                                                background: "#004d00",
                                                                color: "white",
                                                                whiteSpace: "nowrap",
                                                                minWidth: fixedColWidths[i],
                                                                ...(i < 2 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 11 }),
                                                            }}
                                                        >
                                                            {i === labels.length - 1 ? "Actual Present" : ""}
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
                                                            {dateTotals[key] ?? ""}
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
                                                                whiteSpace: "nowrap",
                                                                minWidth: fixedColWidths[i],
                                                                ...(i < 2 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 11 }),
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
                                                {filteredData.map((emp, idx) => (
                                                    <tr key={emp?.ecode ?? idx}>
                                                        {labels.map((label, i) => (
                                                            <td
                                                                key={label}
                                                                className="text-center px-1 py-1"
                                                                style={{
                                                                    border: "1px solid #d6dde8",
                                                                    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                                    whiteSpace: "nowrap",
                                                                    minWidth: fixedColWidths[i],
                                                                    ...(i < 2 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 3 }),
                                                                }}
                                                            >
                                                                {label === "Designation"
                                                                    ? (emp[labelsMapping[label]] ?? "").slice(0, 25)
                                                                    : emp[labelsMapping[label]] ?? ""}
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
                                                                {emp[key] ?? ""}
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
            </div>
        </div>
    );
};

export default Attendance;
