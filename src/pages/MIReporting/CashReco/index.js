import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { fetchCashRecoCompliance } from "../../../store/features/miReporting/miReportingSlice";

const TYPE_OPTIONS = [
    { value: "OPENING", label: "Opening" },
    { value: "CLOSING", label: "Closing" },
];

const COLUMNS = [
    { label: "System Cash", fieldSuffix: "system_cash" },
    { label: "Updated Cash", fieldSuffix: "cash_entered" },
    { label: "Difference", fieldSuffix: "difference" },
];

const getFieldKey = (type, suffix) => `${type.toLowerCase()}_${suffix}`;

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad2 = (n) => String(n).padStart(2, "0");

const toIsoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const formatDateLabel = (d) => `${pad2(d.getDate())}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;

const formatNumber = (val) => {
    if (val === "" || val === null || val === undefined) return "";
    return Number(val).toLocaleString("en-IN");
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

const CashReco = () => {
    const dispatch = useDispatch();
    const { cashRecoCompliance, loading, error } = useSelector((state) => state.MIReporting);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const dateOptions = useMemo(() => {
        const today = new Date();
        const opts = [];
        for (let i = 0; i < 60; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            opts.push({ value: toIsoDate(d), label: formatDateLabel(d) });
        }
        return opts;
    }, []);

    const dateBounds = useMemo(() => {
        const max = new Date();
        const min = new Date();
        min.setDate(max.getDate() - 59);
        return { minDate: min, maxDate: max };
    }, []);

    const [selectedType, setSelectedType] = useState("OPENING");
    const [selectedDate, setSelectedDate] = useState(dateOptions[0].value);
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    useEffect(() => {
        dispatch(fetchCashRecoCompliance({ centerAccess }));
    }, [dispatch, centerAccess]);

    const data = useMemo(() => cashRecoCompliance?.data || [], [cashRecoCompliance]);

    const filteredData = useMemo(() => (
        data.filter((item) => item?.date === selectedDate)
    ), [data, selectedDate]);

    const getCellValue = (item, col) => {
        const raw = item[getFieldKey(selectedType, col.fieldSuffix)];
        return formatNumber(raw);
    };

    const centers = useMemo(() => (
        [...new Set(data.map((item) => item.center_name))].filter(Boolean).sort()
    ), [data]);

    const calendarPivot = useMemo(() => {
        const map = {};
        data.forEach((item) => {
            if (!map[item.center_name]) map[item.center_name] = {};
            map[item.center_name][item.date] = item;
        });
        return map;
    }, [data]);

    const filledFieldKey = getFieldKey(selectedType, "filled");

    const getFilledValue = (center, dateValue) => {
        const raw = calendarPivot[center]?.[dateValue]?.[filledFieldKey];
        return (raw || "No").toUpperCase();
    };

    const differenceFieldKey = getFieldKey(selectedType, "difference");

    const getDifferenceValue = (center, dateValue) => {
        const raw = calendarPivot[center]?.[dateValue]?.[differenceFieldKey];
        return raw === "" || raw === null || raw === undefined ? 0 : Number(raw);
    };

    const prepareCsvData = () => {
        setCsvLoading(true);
        const csvHeaders = ["Centre Name", ...COLUMNS.map((c) => c.label)];
        const rows = filteredData.map((item) => [
            item.center_name,
            ...COLUMNS.map((c) => getCellValue(item, c)),
        ]);
        setCsvData([csvHeaders, ...rows]);
        setTimeout(() => {
            csvRef.current.link.click();
            setCsvLoading(false);
        }, 100);
    };

    document.title = "Cash Reco Compliance";

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
                                        <i className="bx bx-wallet-alt fs-1"></i>
                                    </div>
                                    <h6 className="text-truncate mb-0 fs-18">Cash Reco Compliance</h6>
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
                                        filename={`cash-reco-compliance-${selectedDate}.csv`}
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
                                <Flatpickr
                                    className="form-control"
                                    value={selectedDate}
                                    options={{
                                        dateFormat: "d-M-Y",
                                        maxDate: dateBounds.maxDate,
                                        minDate: dateBounds.minDate,
                                    }}
                                    onChange={([date]) => date && setSelectedDate(toIsoDate(date))}
                                    placeholder="Select date..."
                                />
                            </Col>
                            <Col md={2}>
                                <Select
                                    value={TYPE_OPTIONS.find((o) => o.value === selectedType) || TYPE_OPTIONS[0]}
                                    onChange={(opt) => setSelectedType(opt.value)}
                                    options={TYPE_OPTIONS}
                                    placeholder="Type..."
                                />
                            </Col>
                        </Row>

                        <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
                            <CardBody className="p-0">
                                {loading && (
                                    <div className="text-center py-5">
                                        <Spinner color="primary" />
                                        <p className="mt-2 text-muted">Loading data...</p>
                                    </div>
                                )}
                                {error && !loading && <Alert color="danger">{error}</Alert>}
                                {!loading && !error && (
                                    <div style={{ overflowX: "auto" }}>
                                        <Table
                                            className="mb-0"
                                            style={{ borderCollapse: "collapse", fontSize: "0.72rem", width: "max-content" }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th className="text-center fw-bold px-1 py-1" style={headerStyle}>
                                                        Centre Name
                                                    </th>
                                                    {COLUMNS.map((col) => (
                                                        <th key={col.fieldSuffix} className="text-center fw-bold px-1 py-1" style={headerStyle}>
                                                            {col.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={COLUMNS.length + 1} className="text-center py-4 text-muted">
                                                            No data found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredData.map((item, idx) => (
                                                        <tr key={item.center_name ?? idx}>
                                                            <td className="text-center px-1 py-1 fw-semibold" style={cellStyle(idx)}>
                                                                {item.center_name}
                                                            </td>
                                                            {COLUMNS.map((col) => {
                                                                const isDifferenceCol = col.fieldSuffix === "difference";
                                                                const raw = item[getFieldKey(selectedType, col.fieldSuffix)];
                                                                const value = getCellValue(item, col);
                                                                return (
                                                                    <td
                                                                        key={col.fieldSuffix}
                                                                        className="text-center px-1 py-1"
                                                                        style={{
                                                                            ...cellStyle(idx),
                                                                            color: isDifferenceCol && Number(raw) !== 0 ? "#dc3545" : "inherit",
                                                                            fontWeight: isDifferenceCol && Number(raw) !== 0 ? 600 : "normal",
                                                                        }}
                                                                    >
                                                                        {value}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        <div className="mt-4">
                            <h6 className="mb-2">Compliance Calendar</h6>
                            <Card>
                                <CardBody>
                                    {!loading && !error && (
                                        <div
                                            className="shadow-sm bg-white"
                                            style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "calc(100vh - 290px)" }}
                                        >
                                            <Table
                                                className="mb-0"
                                                style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.72rem", width: "max-content" }}
                                            >
                                                <thead>
                                                    <tr>
                                                        <th
                                                            className="text-center fw-bold px-1 py-1"
                                                            style={{ ...headerStyle, minWidth: 140, position: "sticky", left: 0, zIndex: 3 }}
                                                        >
                                                            Centre Name
                                                        </th>
                                                        {dateOptions.map((opt) => (
                                                            <th key={opt.value} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>
                                                                {opt.label}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {centers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={dateOptions.length + 1} className="text-center py-4 text-muted">
                                                                No data found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        centers.map((center, idx) => (
                                                            <tr key={center}>
                                                                <td
                                                                    className="text-center px-1 py-1 fw-semibold"
                                                                    style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}
                                                                >
                                                                    {center}
                                                                </td>
                                                                {dateOptions.map((opt) => {
                                                                    const value = getFilledValue(center, opt.value);
                                                                    return (
                                                                        <td
                                                                            key={opt.value}
                                                                            className="text-center px-1 py-1 fw-semibold"
                                                                            style={{
                                                                                ...cellStyle(idx),
                                                                                color: value === "YES" ? "#198754" : "#dc3545",
                                                                            }}
                                                                        >
                                                                            {value}
                                                                        </td>
                                                                    );
                                                                })}
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

                        <div className="mt-4">
                            <h6 className="mb-2">Daily Differences</h6>
                            <Card>
                                <CardBody>
                                    {!loading && !error && (
                                        <div
                                            className="shadow-sm bg-white"
                                            style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "calc(100vh - 290px)" }}
                                        >
                                            <Table
                                                className="mb-0"
                                                style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.72rem", width: "max-content" }}
                                            >
                                                <thead>
                                                    <tr>
                                                        <th
                                                            className="text-center fw-bold px-1 py-1"
                                                            style={{ ...headerStyle, minWidth: 140, position: "sticky", left: 0, zIndex: 3 }}
                                                        >
                                                            Centre Name
                                                        </th>
                                                        {dateOptions.map((opt) => (
                                                            <th key={opt.value} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 90 }}>
                                                                {opt.label}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {centers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={dateOptions.length + 1} className="text-center py-4 text-muted">
                                                                No data found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        centers.map((center, idx) => (
                                                            <tr key={center}>
                                                                <td
                                                                    className="text-center px-1 py-1 fw-semibold"
                                                                    style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}
                                                                >
                                                                    {center}
                                                                </td>
                                                                {dateOptions.map((opt) => {
                                                                    const rawValue = getDifferenceValue(center, opt.value);
                                                                    return (
                                                                        <td
                                                                            key={opt.value}
                                                                            className="text-center px-1 py-1"
                                                                            style={{
                                                                                ...cellStyle(idx),
                                                                                color: rawValue !== 0 ? "#dc3545" : "inherit",
                                                                                fontWeight: rawValue !== 0 ? 600 : "normal",
                                                                            }}
                                                                        >
                                                                            {formatNumber(rawValue)}
                                                                        </td>
                                                                    );
                                                                })}
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
        </div>
    );
};

export default CashReco;
