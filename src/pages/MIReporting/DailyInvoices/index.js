    import React, { useEffect, useMemo, useRef, useState } from "react";
    import { Link } from "react-router-dom";
    import { useDispatch, useSelector, shallowEqual } from "react-redux";
    import { Card, CardBody, Table, Spinner, Alert, Button, Badge, Row, Col } from "reactstrap";
    import { CSVLink } from "react-csv";
    import {  fetchDailyInvoices, fetchMissingInvoices } from "../../../store/features/miReporting/miReportingSlice";
    import Select from "react-select";
    import Flatpickr from "react-flatpickr";
    import "flatpickr/dist/themes/material_green.css";
    import { startOfDay, endOfDay, addDays } from "date-fns";


const STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "Overdue", label: "Overdue" },
    { value: "Due Today", label: "Due Today" },
    { value: "Upcoming", label: "Upcoming" }

];

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatMonthYear = (date) => `${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;

const formatMiDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
};

const MI_DATE_FIELDS = new Set(["Admission Date", "Discharge Date", "Invoice Due Date"]);

const DailyInvoices = () => {
    const dispatch = useDispatch();
    const dailyInvoices = useSelector((state) => state.MIReporting.dailyInvoices);
    const loading = useSelector((state) => state.MIReporting.loading);
    const error = useSelector((state) => state.MIReporting.error);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [dateFrom, setDateFrom] = useState(() => new Date());
    const [dateTo, setDateTo] = useState(() => addDays(new Date(), 2));
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    const missingInvoices = useSelector((state) => state.MIReporting.missingInvoices);
    const miMonthOptions = useMemo(() => {
        const opts = [];
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), 1);
        const start = new Date(2020, 0, 1);
        for (let d = new Date(end); d >= start; d.setMonth(d.getMonth() - 1)) {
            const label = formatMonthYear(d);
            opts.push({ value: label, label });
        }
        return opts;
    }, []);
    const [miSelectedMonth, setMiSelectedMonth] = useState(() => formatMonthYear(new Date()));
    const [miSelectedCenter, setMiSelectedCenter] = useState("ALL");
    const [miCsvData, setMiCsvData] = useState([]);
    const [miCsvLoading, setMiCsvLoading] = useState(false);
    const miCsvRef = useRef();

    useEffect(() => {

        dispatch(fetchDailyInvoices({ centerAccess ,selectedStatus }));
    }, [dispatch, centerAccess,selectedStatus]);

    useEffect(() => {
        dispatch(fetchMissingInvoices({ centerAccess, month: miSelectedMonth }));
    }, [dispatch, centerAccess, miSelectedMonth]);
    // Extract unique months and sort them descending

   
    const data = useMemo(() => dailyInvoices?.data || [], [dailyInvoices]);


    const filteredData = useMemo(() => {
        const from = dateFrom ? startOfDay(dateFrom) : null;
        const to = dateTo ? endOfDay(dateTo) : null;

        return data
            .filter(item => {
                if (selectedCenter !== "ALL" && item?.center_name !== selectedCenter) return false;
                if (selectedStatus !== "ALL" && item?.status !== selectedStatus) return false;
                if (item?.invoice_due_date) {
                    const due = new Date(item.invoice_due_date);
                    if (from && due < from) return false;
                    if (to && due > to) return false;
                }
                return true;
            })
            .sort((a, b) => {
                const dateA = a.invoice_due_date ? new Date(a.invoice_due_date) : Infinity;
                const dateB = b.invoice_due_date ? new Date(b.invoice_due_date) : Infinity;
                return dateA - dateB;
            });
    }, [data, selectedCenter, selectedStatus, dateFrom, dateTo]);

    
    const prepareCsvData = () => {
        setCsvLoading(true);

        const rows = filteredData.map((patient) =>
            labels.map((label) => {
                const val = patient[labelsMapping[label]] ?? "";
                if (label === "Admission Date" && val)
                    return new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
                return val;
            })
        );

        setCsvData(rows);

        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(data.map((item) => item.center_name))].map((center) => ({
            value: center,
            label: center,
        })),
    ], [data]);


    const miData = useMemo(() => missingInvoices?.data || [], [missingInvoices]);

    const miCenterTotals = useMemo(() => (
        [...(missingInvoices?.monthly_totals || [])].sort((a, b) => (a.center_name || "").localeCompare(b.center_name || ""))
    ), [missingInvoices]);

    const miAggregateTotals = useMemo(() => (
        miCenterTotals.reduce((acc, row) => ({
            should_be_count: acc.should_be_count + (Number(row.should_be_count) || 0),
            result_count: acc.result_count + (Number(row.result_count) || 0),
            missing_count: acc.missing_count + (Number(row.missing_count) || 0),
        }), { should_be_count: 0, result_count: 0, missing_count: 0 })
    ), [miCenterTotals]);

    const miCenterOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(miData.map((item) => item.center_name))].filter(Boolean).sort().map((center) => ({
            value: center,
            label: center,
        })),
    ], [miData]);

    const miFilteredData = useMemo(() => (
        miSelectedCenter === "ALL" ? miData : miData.filter((item) => item?.center_name === miSelectedCenter)
    ), [miData, miSelectedCenter]);

    const prepareMiCsvData = () => {
        setMiCsvLoading(true);
        const rows = miFilteredData.map((item) => miLabels.map((label) => item[miLabelsMapping[label]] ?? ""));
        setMiCsvData(rows);
        setTimeout(() => {
            miCsvRef.current.link.click();
            setMiCsvLoading(false);
        }, 100);
    };

    const miShouldBe = miAggregateTotals.should_be_count;
    const miResult = miAggregateTotals.result_count;
    const miMissingCount = miAggregateTotals.missing_count;
    const miCompliancePct = miShouldBe > 0 ? Math.round((miResult / miShouldBe) * 100) : 0;



    const labels=[
            "Patient UID",
            "Patient Name",
            "Center Name",
            "Admission Date",
            "Invoice Due Date",
            "Center Manager",
            "Status"
            ]

    const labelsMapping={

            "Patient UID":"patient_uid",
            "Patient Name":"patient_name",
            "Center Name":"center_name",
            "Admission Date":"admission_date",
            "Invoice Due Date":"invoice_due_date",
            "Center Manager":"cm",
            "Status":"status"

    }

    const miLabels = ["Patient UID", "Patient Name", "Center Name", "Admission Date", "Discharge Date", "Invoice Due Date", "CM", "Status"];

    const miLabelsMapping = {
        "Patient UID": "patient_uid",
        "Patient Name": "patient_name",
        "Center Name": "center_name",
        "Admission Date": "admission_date",
        "Discharge Date": "discharge_date",
        "Invoice Due Date": "invoice_due_date",
        "CM": "cm",
        "Status": "status",
    };




    document.title = "Daily Invoices";

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
            <div className="p-3">
                <div className="row align-items-center">
                <div className="col-sm-6 col-8" >
                    <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                        <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                            <i className="bx bx-bar-chart-alt-2 fs-1"></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                            <h6 className="text-truncate mb-0 fs-18">
                            Daily Invoices
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
                        !dailyInvoices ||
                        dailyInvoices.length === 0
                        }
                        className="w-auto"
                    >
                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                        data={csvData || []}
                        filename={`daily-invoices-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
                        headers={labels}
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
                    <Col md={2}>
                        <Select
                            value={STATUS_OPTIONS.find((o) => o.value === selectedStatus) || STATUS_OPTIONS[0]}
                            onChange={(opt) => setSelectedStatus(opt.value)}
                            options={STATUS_OPTIONS}
                            placeholder="Status..."
                        />
                    </Col>
                    <Col md="auto">
                        <div className="border border-dark d-flex align-items-center">
                            <Flatpickr
                                value={dateFrom || ""}
                                onChange={([date]) => setDateFrom(date)}
                                options={{
                                    dateFormat: "d M, Y",
                                    maxDate: dateTo || undefined,
                                    disableMobile: true,
                                }}
                                className="form-control shadow-none bg-light border-0"
                                placeholder="From date"
                            />
                            <div className="bg-light h-100 d-flex align-items-center px-1">-</div>
                            <Flatpickr
                                value={dateTo || ""}
                                onChange={([date]) => setDateTo(date)}
                                options={{
                                    dateFormat: "d M, Y",
                                    minDate: dateFrom || undefined,
                                    disableMobile: true,
                                }}
                                className="form-control shadow-none bg-light border-0 text-end"
                                placeholder="To date"
                            />
                        </div>
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
                    <div className="shadow-sm bg-white" style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "70vh", display: "inline-block", maxWidth: "100%" }}>
                        <Table
                            className="mb-0"
                            style={{
                                borderCollapse: "separate",
                                borderSpacing: 0,
                                fontSize: "0.78rem",
                                tableLayout: "auto",
                                width: "auto",
                            }}
                        >
                            <thead>
                                <tr>
                                    {labels.map((label) => (
                                        <th
                                            key={label}
                                            className="text-center fw-bold px-1 py-2"
                                            style={{
                                                border: "1px solid #cfd8e3",
                                                background: "green",
                                                color: "white",
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 2,
                                            }}
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredData.map((patient, idx) => (
                                    <tr key={patient?.patient_uid ?? idx}>
                                        {labels.map((label) => {
                                            const raw = patient[labelsMapping[label]];
                                            const isDate = label === "Admission Date" || label === "Invoice Due Date";
                                            const value = isDate && raw
                                                ? new Date(raw).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")
                                                : raw;
                                            const isStatus = label === "Status";
                                            const statusColors = {
                                                "Due Today": "#fff9c4",
                                                "Overdue": "#ffcdd2",
                                                "Upcoming": "#c8e6c9",
                                            };
                                            const cellBg = isStatus
                                                ? (statusColors[value] || (idx % 2 === 0 ? "#f8fafc" : "#fff"))
                                                : (idx % 2 === 0 ? "#f8fafc" : "#fff");
                                            return (
                                                <td
                                                    key={label}
                                                    className="text-center px-1 py-2"
                                                    style={{
                                                        border: "1px solid #d6dde8",
                                                        background: cellBg,
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {(label === "Patient UID" || label === "Patient Name")
                                                        ? (
                                                            <Link to={`/patient/${patient.patient_mongo_id}`} className="text-dark" target="_blank" rel="noopener noreferrer">
                                                                {value}
                                                            </Link>
                                                        )
                                                        : value}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                            </Table>
                        </div>
                    </>
                    )}
                </CardBody>
                </Card>

                <div className="mt-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="mb-0">Missing Invoices</h6>
                        <Button
                            color="info"
                            onClick={prepareMiCsvData}
                            disabled={miCsvLoading || loading || !miFilteredData.length}
                            className="w-auto"
                        >
                            {miCsvLoading ? "Preparing CSV..." : "Export CSV"}
                        </Button>
                        <CSVLink
                            data={miCsvData || []}
                            filename={`missing-invoices-${miSelectedMonth}.csv`}
                            headers={miLabels}
                            className="d-none"
                            ref={miCsvRef}
                        />
                    </div>

                    <Row className="g-2 align-items-center mb-3">
                        <Col md={2}>
                            <Select
                                value={miMonthOptions.find((o) => o.value === miSelectedMonth) || null}
                                onChange={(opt) => opt && setMiSelectedMonth(opt.value)}
                                options={miMonthOptions}
                                placeholder="Month..."
                            />
                        </Col>
                    </Row>

                    {loading && (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="mt-2 text-muted">Loading data...</p>
                        </div>
                    )}

                    {error && !loading && <Alert color="danger">{error}</Alert>}

                    {!loading && !error && (
                        <>
                            <Card className="mb-4">
                                <CardBody>
                                    <h6 className="mb-3">Totals — {miSelectedMonth}</h6>
                                    <div style={{ overflowX: "auto" }}>
                                        <Table className="mb-0 w-100" style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.78rem" }}>
                                            <thead>
                                                <tr>
                                                    {["Center", "Should Be Count", "Result Count", "Missing Count", "Compliance %"].map((label) => (
                                                        <th
                                                            key={label}
                                                            className="text-center fw-bold px-2 py-1"
                                                            style={{ border: "1px solid #cfd8e3", background: "green", color: "white", whiteSpace: "nowrap" }}
                                                        >
                                                            {label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {miCenterTotals.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center py-4 text-muted">No data available for {miSelectedMonth}</td>
                                                    </tr>
                                                ) : (
                                                    <>
                                                        <tr style={{ background: "#eef6ee" }}>
                                                            <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8", fontWeight: 700 }}>All Centers</td>
                                                            <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{miShouldBe}</td>
                                                            <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{miResult}</td>
                                                            <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8", color: miMissingCount > 0 ? "#dc3545" : "inherit", fontWeight: 600 }}>{miMissingCount}</td>
                                                            <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{miCompliancePct}%</td>
                                                        </tr>
                                                        {miCenterTotals.map((row, idx) => {
                                                            const rowShouldBe = Number(row.should_be_count) || 0;
                                                            const rowResult = Number(row.result_count) || 0;
                                                            const rowMissing = Number(row.missing_count) || 0;
                                                            const rowCompliancePct = rowShouldBe > 0 ? Math.round((rowResult / rowShouldBe) * 100) : 0;
                                                            return (
                                                                <tr key={row.center_name ?? idx} style={{ background: idx % 2 === 0 ? "#f8fafc" : "#fff" }}>
                                                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{row.center_name}</td>
                                                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{rowShouldBe}</td>
                                                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{rowResult}</td>
                                                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8", color: rowMissing > 0 ? "#dc3545" : "inherit", fontWeight: 600 }}>{rowMissing}</td>
                                                                    <td className="text-center px-2 py-1" style={{ border: "1px solid #d6dde8" }}>{rowCompliancePct}%</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Card>

                            <Row className="g-2 align-items-center mb-2">
                                <Col md={2}>
                                    <Select
                                        value={miCenterOptions.find((o) => o.value === miSelectedCenter) || miCenterOptions[0]}
                                        onChange={(opt) => setMiSelectedCenter(opt.value)}
                                        options={miCenterOptions}
                                        placeholder="Center..."
                                    />
                                </Col>
                            </Row>

                            <Card>
                                <CardBody>
                                    <h6 className="mb-3">Missing Invoices — {miSelectedMonth}</h6>
                                    <div
                                        className="shadow-sm bg-white"
                                        style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "calc(100vh - 420px)" }}
                                    >
                                        <Table className="mb-0 w-100" style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.72rem" }}>
                                            <thead>
                                                <tr>
                                                    {miLabels.map((label) => (
                                                        <th
                                                            key={label}
                                                            className="text-center fw-bold px-1 py-1"
                                                            style={{ border: "1px solid #cfd8e3", background: "green", color: "white", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 2 }}
                                                        >
                                                            {label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {miFilteredData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={miLabels.length} className="text-center py-4 text-muted">No missing invoices found</td>
                                                    </tr>
                                                ) : (
                                                    miFilteredData.map((item, idx) => (
                                                        <tr key={item.patient_mongo_id ?? idx}>
                                                            {miLabels.map((label) => (
                                                                <td
                                                                    key={label}
                                                                    className="text-center px-1 py-1"
                                                                    style={{ border: "1px solid #d6dde8", background: idx % 2 === 0 ? "#f8fafc" : "#fff", whiteSpace: "nowrap" }}
                                                                >
                                                                    {label === "Patient Name"
                                                                        ? (
                                                                            <Link to={`/patient/${item.patient_mongo_id}`} className="text-dark" target="_blank" rel="noopener noreferrer">
                                                                                {item[miLabelsMapping[label]]}
                                                                            </Link>
                                                                        )
                                                                        : label === "Status"
                                                                            ? <Badge color={item.status === "Missing" ? "danger" : "success"}>{item.status}</Badge>
                                                                            : MI_DATE_FIELDS.has(label)
                                                                                ? formatMiDate(item[miLabelsMapping[label]])
                                                                                : (item[miLabelsMapping[label]] ?? "")}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Card>
                        </>
                    )}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
    };

    export default DailyInvoices;
