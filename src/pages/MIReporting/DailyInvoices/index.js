    import React, { useEffect, useMemo, useRef, useState } from "react";
    import { useDispatch, useSelector, shallowEqual } from "react-redux";
    import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
    import { CSVLink } from "react-csv";
    import {  fetchDailyInvoices, fetchOpdPatientDocs } from "../../../store/features/miReporting/miReportingSlice";
    import Select from "react-select";
    import Flatpickr from "react-flatpickr";
    import "flatpickr/dist/themes/material_green.css";
    import { startOfDay, endOfDay } from "date-fns";


const STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "Overdue", label: "Overdue" },
    { value: "Due Today", label: "Due Today" },
    { value: "Upcoming", label: "Upcoming" }

];

const DailyInvoices = () => {
    const dispatch = useDispatch();
    const dailyInvoices = useSelector((state) => state.MIReporting.dailyInvoices);
    const loading = useSelector((state) => state.MIReporting.loading);
    const error = useSelector((state) => state.MIReporting.error);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);
    const [selectedMonth, setSelectedMonth]=useState(
        new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    )
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    // console.log(dailyInvoices)
    
    useEffect(() => {

        dispatch(fetchDailyInvoices({ centerAccess ,selectedStatus }));
    }, [dispatch, centerAccess,selectedStatus]);
    // console.log(dailyInvoices)
    // Extract unique months and sort them descending

   
    const data = useMemo(() => dailyInvoices?.data || [], [dailyInvoices]);


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
                    <div className="shadow-sm bg-white" style={{ borderRadius: 12, border: "1px solid #cfd8e3", overflow: "auto", maxHeight: "70vh" }}>
                        <Table
                            className="mb-0 w-100"
                            style={{
                                borderCollapse: "separate",
                                borderSpacing: 0,
                                fontSize: "0.78rem",
                                tableLayout: "fixed",
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
                                        {labels.map((label) => (
                                            <td
                                                key={label}
                                                className="text-center px-1 py-2"
                                                style={{
                                                    border: "1px solid #d6dde8",
                                                    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                                    whiteSpace: "normal",
                                                    wordBreak: "break-word",
                                                   
                                                }}
                                            >
                                                {patient[labelsMapping[label]]}
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

    export default DailyInvoices;
