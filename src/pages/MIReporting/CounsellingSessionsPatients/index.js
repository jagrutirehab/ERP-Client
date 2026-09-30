import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col, Input } from "reactstrap";
import { CSVLink } from "react-csv";
import { fetchCounsellingSessionsPatientsDOD } from "../../../store/features/miReporting/miReportingSlice";
import Select from "react-select";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parseWeekEndDate = (weekStr) => {
    if (!weekStr) return new Date(0);
    const parts = weekStr.split(" - ");
    if (parts.length < 2) return new Date(0);
    const [day, month, year] = parts[1].trim().split(" ");
    const monthIdx = MONTHS.indexOf(month);
    return new Date(parseInt(year, 10), monthIdx, parseInt(day, 10));
};

const formatWeekLabel = (weekStr) => (weekStr || "").replace(/\s+\d{4}$/, "");

const CounsellingSessionsPatients = () => {
    const dispatch = useDispatch();
    const counsellingSessionsPatientsDOD = useSelector((state) => state.MIReporting.counsellingSessionsPatientsDOD);
    const loading = useSelector((state) => state.MIReporting.loading);
    const error = useSelector((state) => state.MIReporting.error);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [selectedPsychologist, setSelectedPsychologist] = useState("ALL");
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchCounsellingSessionsPatientsDOD({ centerAccess }));
    }, [dispatch, centerAccess]);

    useEffect(() => {
        if (searchInput === searchTerm) return;
        setIsSearching(true);
        const timeout = setTimeout(() => {
            setSearchTerm(searchInput);
            setIsSearching(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, [searchInput, searchTerm]);

    const data = useMemo(() => counsellingSessionsPatientsDOD?.data || [], [counsellingSessionsPatientsDOD]);

    const filteredData = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return data.filter(item => {
            if (selectedCenter !== "ALL" && item?.center_name !== selectedCenter) return false;
            if (selectedPsychologist !== "ALL" && item?.psychologist_name !== selectedPsychologist) return false;
            if (term && !(item?.patient_name || "").toLowerCase().includes(term) && !(item?.patient_id || "").toLowerCase().includes(term)) return false;
            return true;
        });
    }, [data, selectedCenter, selectedPsychologist, searchTerm]);

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(data.map((item) => item.center_name))].map((center) => ({
            value: center,
            label: center,
        })),
    ], [data]);

    const psychologistOptions = useMemo(() => [
        { value: "ALL", label: "All Psychologists" },
        ...[...new Set(
            data
                .filter((item) => selectedCenter === "ALL" || item?.center_name === selectedCenter)
                .map((item) => item.psychologist_name)
        )].filter(Boolean).sort().map((psychologist) => ({
            value: psychologist,
            label: psychologist,
        })),
    ], [data, selectedCenter]);

    useEffect(() => {
        if (selectedPsychologist === "ALL") return;
        if (!psychologistOptions.some((o) => o.value === selectedPsychologist)) {
            setSelectedPsychologist("ALL");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [psychologistOptions]);

    const labels = [
        "Patient UID",
        "Patient Name",
        "MTD",
        "Center Name",
        "Ad. Date",
        "Psychologist Name",
        "Last Outpass",
    ];

    const fixedColWidths = [80, 130, 55, 90, 90, 60];

    const labelsMapping = {
        "Patient UID": "patient_id",
        "Patient Name": "patient_name",
        "MTD": "current_month_total",
        "Center Name": "center_name",
        "Ad. Date": "admission_date",
        "Psychologist Name": "psychologist_name",
        "Last Outpass": "last_outpass",
    };

    const adDateColIdx = labels.indexOf("Ad. Date");
    const psychologistNameColIdx = labels.indexOf("Psychologist Name");

    const weeks = useMemo(() => {
        const weekSet = new Set();
        data.forEach((item) => {
            Object.keys(item?.wow_data || {}).forEach((week) => weekSet.add(week));
        });
        return Array.from(weekSet).sort((a, b) => parseWeekEndDate(b) - parseWeekEndDate(a));
    }, [data]);

    const weekTotals = useMemo(() => {
        const totals = {};
        weeks.forEach((week) => {
            totals[week] = filteredData.reduce((sum, row) => sum + (Number(row?.wow_data?.[week]) || 0), 0);
        });
        return totals;
    }, [filteredData, weeks]);

    const prepareCsvData = () => {
        setCsvLoading(true);

        const allHeaders = [...labels, ...weeks.map(formatWeekLabel)];

        const totalsRow = [
            "Total",
            ...Array(labels.length - 1).fill(""),
            ...weeks.map((week) => weekTotals[week] || ""),
        ];

        const rows = [
            totalsRow,
            allHeaders,
            ...filteredData.map((patient) => [
                ...labels.map((label) => patient[labelsMapping[label]] ?? ""),
                ...weeks.map((week) => patient?.wow_data?.[week] ?? ""),
            ]),
        ];

        setCsvData(rows);

        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    document.title = "Counselling Sessions Patients";

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
                                                    Counselling Sessions Patients
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
                                            !counsellingSessionsPatientsDOD ||
                                            counsellingSessionsPatientsDOD.length === 0
                                        }
                                        className="w-auto"
                                    >
                                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                                    </Button>
                                    <CSVLink
                                        data={csvData || []}
                                        filename={`counselling-sessions-patients-dod-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
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
                                    value={psychologistOptions.find((o) => o.value === selectedPsychologist) || psychologistOptions[0]}
                                    onChange={(opt) => setSelectedPsychologist(opt.value)}
                                    options={psychologistOptions}
                                    placeholder="Psychologist..."
                                />
                            </Col>
                            <Col md={2}>
                                <Input
                                    type="text"
                                    placeholder="Search Patient Name or UID..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Card>
                            <CardBody>
                                {(loading || isSearching) && (
                                    <div className="text-center py-5">
                                        <Spinner color="primary" />
                                        <p className="mt-2 text-muted">{isSearching ? "Searching..." : "Loading data..."}</p>
                                    </div>
                                )}

                                {error && !loading && !isSearching && <Alert color="danger">{error}</Alert>}

                                {!loading && !isSearching && !error && (
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
                                                                {i === labels.length - 1 ? "Total (Single Week)" : i === adDateColIdx ? "Pt. Count" : i === psychologistNameColIdx ? `${filteredData.length}` : ""}
                                                            </th>
                                                        ))}
                                                        {weeks.map((week) => (
                                                            <th
                                                                key={week}
                                                                className="text-center fw-bold px-1 py-1"
                                                                style={{
                                                                    border: "1px solid #cfd8e3",
                                                                    background: "#004d00",
                                                                    color: "white",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {weekTotals[week] || ""}
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
                                                        {weeks.map((week) => (
                                                            <th
                                                                key={week}
                                                                className="text-center fw-bold px-1 py-1"
                                                                style={{
                                                                    border: "1px solid #cfd8e3",
                                                                    background: "green",
                                                                    color: "white",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {formatWeekLabel(week)}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {filteredData.map((patient, idx) => (
                                                        <tr key={patient?.patient_id ?? idx}>
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
                                                                    {(label === "Patient Name" || label === "Patient UID")
                                                                        ? (
                                                                            <Link to={`/patient/${patient.patient_mongo_id}`} className="text-dark" target="_blank" rel="noopener noreferrer">
                                                                                {label === "Patient Name"
                                                                                    ? (patient[labelsMapping[label]] ?? "").slice(0, 20)
                                                                                    : patient[labelsMapping[label]]}
                                                                            </Link>
                                                                        )
                                                                        : label === "Psychologist Name"
                                                                            ? (patient[labelsMapping[label]] ?? "").slice(0, 20)
                                                                            : patient[labelsMapping[label]]}
                                                                </td>
                                                            ))}
                                                            {weeks.map((week) => (
                                                                <td
                                                                    key={week}
                                                                    className="text-center px-1 py-1"
                                                                    style={{
                                                                        border: "1px solid #d6dde8",
                                                                        background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {patient?.wow_data?.[week] ?? 0}
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

export default CounsellingSessionsPatients;
