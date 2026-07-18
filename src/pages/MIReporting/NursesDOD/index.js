import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col, Input } from "reactstrap";
import { CSVLink } from "react-csv";
import { fetchNursesDOD } from "../../../store/features/miReporting/miReportingSlice";
import Select from "react-select";

const NursesDOD = () => {
    const dispatch = useDispatch();
    const nursesDOD = useSelector((state) => state.MIReporting.nursesDOD);
    const loading = useSelector((state) => state.MIReporting.loading);
    const error = useSelector((state) => state.MIReporting.error);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [dataFormat, setDataFormat] = useState("percentage");
    const [countType, setCountType] = useState("completed");
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchNursesDOD({ centerAccess }));
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

    const data = useMemo(() => nursesDOD?.data || [], [nursesDOD]);

    const filteredData = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return data.filter((item) => {
            if (selectedCenter !== "ALL" && item?.center_name !== selectedCenter) return false;
            if (term) {
                const uid = (item?.patient_id || "").toLowerCase();
                const name = (item?.patient_name || "").toLowerCase();
                if (!uid.includes(term) && !name.includes(term)) return false;
            }
            return true;
        });
    }, [data, selectedCenter, searchTerm]);

    const labels = [
        "Patient UID",
        "Patient Name",
        "Center Name",
        "Ad. Date",
        "Last Outpass",
        "MTD",
        "Presc. Count",
    ];

    const fixedColWidths = [90, 180, 120, 90, 100, 55, 55];

    const labelsMapping = {
        "Patient UID": "patient_id",
        "Patient Name": "patient_name",
        "Center Name": "center_name",
        "Ad. Date": "admission_date",
        "Last Outpass": "last_outpass",
        "Presc. Count": "prescription_count",
        "MTD": "total_current_month",
    };

    const lastOutpassColIdx = labels.indexOf("Last Outpass");
    const mtdColIdx = labels.indexOf("MTD");
    const prescCountColIdx = labels.indexOf("Presc. Count");

    const last30Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).replace(/ /g, "-");
            days.push({ key, label });
        }
        return days;
    }, []);

    const dateTotals = useMemo(() => {
        const totals = {};
        last30Days.forEach(({ key }) => {
            totals[key] = filteredData.reduce((sum, row) => {
                const entry = row.dod_data?.[key];
                const val = countType === "missed"
                    ? Number(entry?.missed_count) || 0
                    : Number(entry?.result_count) || 0;
                return sum + val;
            }, 0);
        });
        return totals;
    }, [filteredData, last30Days, countType]);

    const dateShouldBeTotals = useMemo(() => {
        const totals = {};
        last30Days.forEach(({ key }) => {
            totals[key] = filteredData.reduce((sum, row) => sum + (Number(row.dod_data?.[key]?.should_be_count) || 0), 0);
        });
        return totals;
    }, [filteredData, last30Days]);

    const getDateTotalDisplay = (key) => {
        const count = dateTotals[key] || 0;
        if (dataFormat === "percentage") {
            const shouldBe = dateShouldBeTotals[key] || 0;
            if (!shouldBe) return "";
            return `${Math.round((count / shouldBe) * 100)}%`;
        }
        return count || "";
    };

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(data.map((item) => item.center_name))].filter(Boolean).map((center) => ({
            value: center,
            label: center,
        })),
    ], [data]);

    const getCellValue = (dodEntry) => {
        const completed = dodEntry?.result_count ?? null;
        const missed = dodEntry?.missed_count ?? null;
        const shouldBe = dodEntry?.should_be_count ?? null;
        const count = countType === "missed" ? missed : completed;
        if (count == null) return "";
        if (dataFormat === "percentage") {
            if (!shouldBe) return "";
            return `${Math.round((count / shouldBe) * 100)}%`;
        }
        return count;
    };

    const prepareCsvData = () => {
        setCsvLoading(true);

        const allHeaders = [...labels, ...last30Days.map(({ label }) => label)];
        const totalsRow = [
            "Total",
            ...Array(labels.length - 1).fill(""),
            ...last30Days.map(({ key }) => getDateTotalDisplay(key)),
        ];

        const rows = [
            totalsRow,
            allHeaders,
            ...filteredData.map((patient) => [
                ...labels.map((label) => patient[labelsMapping[label]] ?? ""),
                ...last30Days.map(({ key }) => getCellValue(patient.dod_data?.[key])),
            ]),
        ];

        setCsvData(rows);

        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    document.title = "Nurses DOD";

    return (
        <div className="w-100 mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
            <div className="row">
                <div className="col-12">
                    <div className="p-3 pb-0">
                        <div className="row align-items-center">
                            <div className="col-sm-6 col-8">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                                                <i className="bx bx-capsule fs-1"></i>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="text-truncate mb-0 fs-18">Nurses DOD</h6>
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
                                        disabled={csvLoading || loading || !nursesDOD || nursesDOD.length === 0}
                                        className="w-auto"
                                    >
                                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                                    </Button>
                                    <CSVLink
                                        data={csvData || []}
                                        filename={`nurses-dod-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
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
                                    value={{ value: dataFormat, label: dataFormat === "percentage" ? "Percentage" : "Number" }}
                                    onChange={(opt) => setDataFormat(opt.value)}
                                    options={[
                                        { value: "percentage", label: "Percentage" },
                                        { value: "number", label: "Number" },
                                    ]}
                                    placeholder="Data Format..."
                                />
                            </Col>
                            <Col md={2}>
                                <Select
                                    value={{ value: countType, label: countType === "completed" ? "Completed" : "Missed" }}
                                    onChange={(opt) => setCountType(opt.value)}
                                    options={[
                                        { value: "completed", label: "Completed" },
                                        { value: "missed", label: "Missed" },
                                    ]}
                                    placeholder="Count Type..."
                                />
                            </Col>
                            <Col md={2}>
                                <Input
                                    type="text"
                                    placeholder="Search UID or Name..."
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
                                        <div className="shadow-sm bg-white" style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "70vh", paddingBottom: 10 }}>
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
                                                                    background: "#004d00",
                                                                    color: "white",
                                                                    whiteSpace: "nowrap",
                                                                    minWidth: fixedColWidths[i],
                                                                    ...(i < 2 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 1 }),
                                                                }}
                                                            >
                                                                {i === prescCountColIdx ? "Total (Single Day)" : i === lastOutpassColIdx ? "Pt. Count" : i === mtdColIdx ? `${filteredData.length}` : ""}
                                                            </th>
                                                        ))}
                                                        {last30Days.map(({ key, label }) => (
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
                                                                {getDateTotalDisplay(key)}
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
                                                                    ...(i < 2 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 1 }),
                                                                }}
                                                            >
                                                                {label}
                                                            </th>
                                                        ))}
                                                        {last30Days.map(({ key, label }) => (
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
                                                                        minWidth: fixedColWidths[i],
                                                                        ...(i < 2 && { position: "sticky", left: fixedColWidths.slice(0, i).reduce((a, b) => a + b, 0), zIndex: 3 }),
                                                                    }}
                                                                >
                                                                    {(label === "Patient Name" || label === "Patient UID")
                                                        ? (
                                                            <Link to={`/nurse/p/${patient.patient_mongo_id}`} className="text-dark" target="_blank" rel="noopener noreferrer">
                                                                {patient[labelsMapping[label]]}
                                                            </Link>
                                                        )
                                                        : patient[labelsMapping[label]] ?? ""}
                                                                </td>
                                                            ))}
                                                            {last30Days.map(({ key }) => (
                                                                <td
                                                                    key={key}
                                                                    className="text-center px-1 py-1"
                                                                    style={{
                                                                        border: "1px solid #d6dde8",
                                                                        background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {getCellValue(patient.dod_data?.[key])}
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

export default NursesDOD;
