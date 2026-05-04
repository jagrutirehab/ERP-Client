    import React, { useEffect, useMemo, useRef, useState } from "react";
    import { useDispatch, useSelector, shallowEqual } from "react-redux";
    import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
    import { CSVLink } from "react-csv";
    import { fetchClinicalNotesDOD } from "../../../store/features/miReporting/miReportingSlice";
    import Select from "react-select";


    const ClinicalNotesDOD = () => {
    const dispatch = useDispatch();
    const { clinicalNotesDOD, loading, error } = useSelector((state) => state.MIReporting);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchClinicalNotesDOD({ centerAccess }));
    }, [dispatch, centerAccess]);

    const data = useMemo(() => clinicalNotesDOD?.data || [], [clinicalNotesDOD]);

    const last30Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 1; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
            days.push({ key, label });
        }
        return days;
    }, []);

    const filteredData = useMemo(() =>
        selectedCenter === "ALL" ? data : data.filter((item) => item?.center_name === selectedCenter),
    [data, selectedCenter]);

    const dateTotals = useMemo(() => {
        const totals = {};
        last30Days.forEach(({ key }) => {
            totals[key] = filteredData.reduce((sum, row) => sum + (row?.dod_data?.[key] ?? 0), 0);
        });
        return totals;
    }, [filteredData, last30Days]);

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(data.map((item) => item.center_name))].map((center) => ({
            value: center,
            label: center,
        })),
    ], [data]);

    const fixedLabels = ["Patient Name", "Center Name", "Psychologist Name", "Patient UID", "Assigned Patients", "Total (Current Month)"];
    const fixedColWidths = [150, 120, 150, 80, 90, 100];

    const prepareCsvData = () => {
        setCsvLoading(true);

        const allHeaders = [...fixedLabels, ...last30Days.map(({ label }) => label)];

        const totalsRow = [
            "Total",
            ...Array(fixedLabels.length - 1).fill(""),
            ...last30Days.map(({ key }) => dateTotals[key] || ""),
        ];

        const rows = [
            totalsRow,
            allHeaders,
            ...filteredData.map((patient) => [
                patient?.patient_name ?? "",
                patient?.center_name ?? "",
                patient?.psychologist_name ?? "",
                patient?.patient_id ?? "",
                patient?.patient_count ?? "",
                patient?.current_month_total ?? "",
                ...last30Days.map(({ key }) => patient?.dod_data?.[key] ?? ""),
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
                            <h6 className="text-truncate mb-0 fs-18">Clinical Notes DOD</h6>
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
                        disabled={csvLoading || loading || !clinicalNotesDOD || clinicalNotesDOD.length === 0}
                        className="w-auto"
                    >
                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                        data={csvData || []}
                        filename={`clinical-notes-dod-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
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
                    <div className="shadow-sm bg-white" style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "70vh" }}>
                        <Table
                            className="mb-0 w-100"
                            style={{
                                borderCollapse: "separate",
                                borderSpacing: 0,
                                fontSize: "0.78rem",
                            }}
                        >
                            <thead>
                                <tr>
                                    {fixedLabels.map((label, i) => {
                                        const left = fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0);
                                        return (
                                        <th
                                            key={label}
                                            className="text-center fw-bold px-1 py-2"
                                            style={{
                                                border: "1px solid #cfd8e3",
                                                background: "#004d00",
                                                color: "white",
                                                whiteSpace: "nowrap",
                                                position: "sticky",
                                                top: 0,
                                                left,
                                                zIndex: 5,
                                                minWidth: fixedColWidths[i],
                                            }}
                                        >
                                            {i === 5 ? "Total (Single Day)" : ""}
                                        </th>
                                        );
                                    })}
                                    {last30Days.map(({ key }) => (
                                        <th
                                            key={key}
                                            className="text-center fw-bold px-1 py-2"
                                            style={{
                                                border: "1px solid #cfd8e3",
                                                background: "#004d00",
                                                color: "white",
                                                whiteSpace: "nowrap",
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 2,
                                            }}
                                        >
                                            {dateTotals[key] || ""}
                                        </th>
                                    ))}
                                </tr>
                                <tr>
                                    {fixedLabels.map((label, i) => {
                                        const left = fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0);
                                        return (
                                        <th
                                            key={label}
                                            className="text-center fw-bold px-1 py-2"
                                            style={{
                                                border: "1px solid #cfd8e3",
                                                background: "green",
                                                color: "white",
                                                whiteSpace: "nowrap",
                                                position: "sticky",
                                                top: 37,
                                                left,
                                                zIndex: 4,
                                                minWidth: fixedColWidths[i],
                                            }}
                                        >
                                            {label}
                                        </th>
                                        );
                                    })}
                                    {last30Days.map(({ key, label }) => (
                                        <th
                                            key={key}
                                            className="text-center fw-bold px-1 py-2"
                                            style={{
                                                border: "1px solid #cfd8e3",
                                                background: "green",
                                                color: "white",
                                                whiteSpace: "nowrap",
                                                position: "sticky",
                                                top: 37,
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
                                    <tr key={patient?.patient_id ?? idx}>
                                        <td className="text-center px-1 py-2" style={{ border: "1px solid #d6dde8", background: idx % 2 === 0 ? "#f8fafc" : "#fff", whiteSpace: "nowrap", position: "sticky", left: 0, zIndex: 3, minWidth: 150 }}>
                                            {patient?.patient_name ?? ""}
                                        </td>
                                        <td className="text-center px-1 py-2" style={{ border: "1px solid #d6dde8", background: idx % 2 === 0 ? "#f8fafc" : "#fff", whiteSpace: "nowrap", position: "sticky", left: 150, zIndex: 3, minWidth: 120 }}>
                                            {patient?.center_name ?? ""}
                                        </td>
                                        <td className="text-center px-1 py-2" style={{ border: "1px solid #d6dde8", background: idx % 2 === 0 ? "#f8fafc" : "#fff", whiteSpace: "nowrap", position: "sticky", left: 270, zIndex: 3, minWidth: 150 }}>
                                            {patient?.psychologist_name ?? "-"}
                                        </td>
                                        <td className="text-center px-1 py-2" style={{ border: "1px solid #d6dde8", background: idx % 2 === 0 ? "#f8fafc" : "#fff", whiteSpace: "nowrap", position: "sticky", left: 420, zIndex: 3, minWidth: 80 }}>
                                            {"UID" + (patient?.patient_id ?? "")}
                                        </td>
                                        <td className="text-center px-1 py-2" style={{ border: "1px solid #d6dde8", background: idx % 2 === 0 ? "#f8fafc" : "#fff", whiteSpace: "nowrap", position: "sticky", left: 500, zIndex: 3, minWidth: 90 }}>
                                            {patient?.patient_count ?? ""}
                                        </td>
                                        <td className="text-center px-1 py-2" style={{ border: "1px solid #d6dde8", background: idx % 2 === 0 ? "#f8fafc" : "#fff", whiteSpace: "nowrap", position: "sticky", left: 590, zIndex: 3, minWidth: 100 }}>
                                            {patient?.current_month_total ?? ""}
                                        </td>
                                        {last30Days.map(({ key }) => (
                                            <td
                                                key={key}
                                                className="text-center px-1 py-2"
                                                style={{
                                                    border: "1px solid #d6dde8",
                                                    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {patient?.dod_data?.[key] ?? ""}
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

    export default ClinicalNotesDOD;
