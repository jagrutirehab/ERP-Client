    import React, { useEffect, useMemo, useRef, useState } from "react";
    import { useDispatch, useSelector, shallowEqual } from "react-redux";
    import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
    import { CSVLink } from "react-csv";
    import { fetchClinicalNotesDOD } from "../../../store/features/miReporting/miReportingSlice";
    import Select from "react-select";
    import { startOfDay, endOfDay } from "date-fns";


    const ClinicalNotesDOD = () => {
    const dispatch = useDispatch();
    const clinicalNotesDOD = useSelector((state) => state.MIReporting.clinicalNotesDOD);
    const loading = useSelector((state) => state.MIReporting.loading);
    const error = useSelector((state) => state.MIReporting.error);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    // console.log(clinicalNotesDOD)
    
    useEffect(() => {
        dispatch(fetchClinicalNotesDOD({ centerAccess  }));
    }, [dispatch, centerAccess]);
    // console.log(clinicalNotesDOD)
    // Extract unique months and sort them descending

   
    const data = useMemo(() => clinicalNotesDOD?.data || [], [clinicalNotesDOD]);


    const filteredData = useMemo(() => {
        const from = dateFrom ? startOfDay(dateFrom) : null;
        const to = dateTo ? endOfDay(dateTo) : null;

        return data.filter(item => {
            if (selectedCenter !== "ALL" && item?.center_name !== selectedCenter) return false;
            if (selectedStatus !== "ALL" && item?.status !== selectedStatus) return false;
            if (item?.invoice_due_date) {
                const due = new Date(item.invoice_due_date);
                if (from && due < from) return false;
                if (to && due > to) return false;
            }
            return true;
        });
    }, [data, selectedCenter, selectedStatus, dateFrom, dateTo]);

    
    const prepareCsvData = () => {
        setCsvLoading(true);

        const allHeaders = [...labels, ...last30Days.map(({ label }) => label)];

        const totalsRow = [
            "Total",
            ...Array(labels.length - 1).fill(""),
            ...last30Days.map(({ key }) => dateTotals[key] || ""),
        ];

        const rows = [
            totalsRow,
            allHeaders,
            ...filteredData.map((patient) => [
                ...labels.map((label) => patient[labelsMapping[label]] ?? ""),
                ...last30Days.map(({ label }) => patient[label] ?? ""),
            ]),
        ];

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

    const monthOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), 1);
        const start = new Date(now.getFullYear() - 5, now.getMonth() + 1, 1);
        for (let d = new Date(end); d >= start; d.setMonth(d.getMonth() - 1)) {
            const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
            options.push({ value: label, label });
        }
        return options;
    }, []);





    const labels=[
            "Patient Name",
            "Center Name",
            "Psychologist Name",
            "Patient UID",
            "Assigned Patients",
            "Total (Current Month)"

            ]

    const fixedColWidths = [150, 120, 90, 100];

    const labelsMapping={
            "Psychologist Name":"psychologist_name",
            "Center Name":"center_name",
             "Patient Name":"patient",
             "Patient UID":"patient_id",
            "Assigned Patients":"assigned",
            "Total (Current Month)":"total",


    }

    const last30Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i =1; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key =d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
            const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
            days.push({ key, label });
        }
        return days;
    }, []);

    const dateTotals = useMemo(() => {
        const totals = {};
        last30Days.forEach(({ key }) => {
            totals[key] = filteredData.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
        });
        return totals;
    }, [filteredData, last30Days]);






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
                            Clnical Notes DOD
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
                        !clinicalNotesDOD ||
                        clinicalNotesDOD.length === 0
                        }
                        className="w-auto"
                    >
                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                        data={csvData || []}
                        filename={`counselling-sessions-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
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
                                    {labels.map((label, i) => (
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
                                                left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0),
                                                zIndex: 5,
                                                minWidth: fixedColWidths[i],
                                            }}
                                        >
                                            {i === 3 ? "Total (Single Day)" : ""}
                                        </th>
                                    ))}
                                    {last30Days.map(({ key ,label}) => (
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
                                            {dateTotals[label] || ""}
                                        </th>
                                    ))}
                                </tr>
                                <tr>
                                    {labels.map((label, i) => (
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
                                                left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0),
                                                zIndex: 4,
                                                minWidth: fixedColWidths[i],
                                            }}
                                        >
                                            {label}
                                        </th>
                                    ))}
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
                                {filteredData.map((psychologist, idx) => (
                                    <tr key={psychologist?.patient_uid ?? idx}>
                                        {labels.map((label, i) => (
                                            <td
                                                key={label}
                                                className="text-center px-1 py-2"
                                                style={{
                                                    border: "1px solid #d6dde8",
                                                    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                    whiteSpace: "nowrap",
                                                    position: "sticky",
                                                    left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0),
                                                    zIndex: 3,
                                                    minWidth: fixedColWidths[i],
                                                }}
                                            >
                                                {psychologist[labelsMapping[label]]}
                                            </td>
                                        ))}
                                        {last30Days.map(({ key,label }) => (
                                            <td
                                                key={key}
                                                className="text-center px-1 py-2"
                                                style={{
                                                    border: "1px solid #d6dde8",
                                                    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {psychologist[label] ?? 0}
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
