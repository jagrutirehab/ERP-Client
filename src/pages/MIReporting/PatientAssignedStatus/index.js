import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { fetchAssignedData } from "../../../store/features/miReporting/miReportingSlice";

const MISSING_OPTIONS = [
    { value: "ALL", label: "All Patients" },
    { value: "PSYCHOLOGIST_MISSING", label: "Psychologist Missing" },
    { value: "DOCTOR_MISSING", label: "Doctor Missing" },
];

const labels = ["Patient UID", "Patient Name", "Doctor Name", "Psychologist Name", "Center Name", "Admission Date"];

const labelsMapping = {
    "Patient UID": "patient_uid",
    "Patient Name": "patient_name",
    "Doctor Name": "doctor_name",
    "Psychologist Name": "psychologist_name",
    "Center Name": "center_name",
    "Admission Date": "admission_date",
};

const formatDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
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

const PatientAssignedStatus = () => {
    const dispatch = useDispatch();
    const { assignedData, loading, error } = useSelector((state) => state.MIReporting);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [selectedMissing, setSelectedMissing] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchAssignedData({ centerAccess }));
    }, [dispatch, centerAccess]);

    const data = useMemo(() => assignedData?.data || [], [assignedData]);

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...[...new Set(data.map((item) => item.center_name))].filter(Boolean).sort().map((center) => ({
            value: center,
            label: center,
        })),
    ], [data]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            if (selectedCenter !== "ALL" && item?.center_name !== selectedCenter) return false;
            if (selectedMissing === "PSYCHOLOGIST_MISSING" && item?.psychologist_name) return false;
            if (selectedMissing === "DOCTOR_MISSING" && item?.doctor_name) return false;
            return true;
        });
    }, [data, selectedCenter, selectedMissing]);

    const getCellValue = (item, label) => {
        const raw = item[labelsMapping[label]];
        if (label === "Admission Date") return formatDate(raw);
        return raw || "";
    };

    const prepareCsvData = () => {
        setCsvLoading(true);
        const rows = filteredData.map((item) => labels.map((label) => getCellValue(item, label)));
        setCsvData(rows);
        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    document.title = "Patient Assigned Status";

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
                                        <i className="bx bx-user-x fs-1"></i>
                                    </div>
                                    <h6 className="text-truncate mb-0 fs-18">Patient Assigned Status</h6>
                                </div>
                            </div>

                            <div className="col-sm-6 col-4">
                                <div className="d-flex justify-content-end">
                                    <Button
                                        color="info"
                                        onClick={prepareCsvData}
                                        disabled={csvLoading || loading || !filteredData.length}
                                        className="w-auto"
                                    >
                                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                                    </Button>
                                    <CSVLink
                                        data={csvData || []}
                                        filename={`patient-assigned-status-${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}.csv`}
                                        headers={labels}
                                        className="d-none"
                                        ref={csvRef}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 p-lg-4">
                        <Row className="g-2 align-items-center mb-3">
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
                                    value={MISSING_OPTIONS.find((o) => o.value === selectedMissing) || MISSING_OPTIONS[0]}
                                    onChange={(opt) => setSelectedMissing(opt.value)}
                                    options={MISSING_OPTIONS}
                                    placeholder="Missing..."
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
                                    <div
                                        className="shadow-sm bg-white"
                                        style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "calc(100vh - 290px)" }}
                                    >
                                        <Table
                                            className="mb-0 w-100"
                                            style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.72rem" }}
                                        >
                                            <thead>
                                                <tr>
                                                    {labels.map((label) => (
                                                        <th key={label} className="text-center fw-bold px-1 py-1" style={headerStyle}>
                                                            {label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={labels.length} className="text-center py-4 text-muted">
                                                            No data found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredData.map((item, idx) => (
                                                        <tr key={item.patient_mongo_id ?? idx}>
                                                            {labels.map((label) => (
                                                                <td key={label} className="text-center px-1 py-1" style={cellStyle(idx)}>
                                                                    {(label === "Patient UID" || label === "Patient Name") ? (
                                                                        <Link to={`/patient/${item.patient_mongo_id}`} className="text-dark" target="_blank" rel="noopener noreferrer">
                                                                            {getCellValue(item, label)}
                                                                        </Link>
                                                                    ) : (
                                                                        getCellValue(item, label)
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))
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

export default PatientAssignedStatus;
