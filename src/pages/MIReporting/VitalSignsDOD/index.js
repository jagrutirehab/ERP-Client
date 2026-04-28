    import React, { useEffect, useRef, useState } from "react";
    import { useDispatch, useSelector } from "react-redux";
    import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
    import { CSVLink } from "react-csv";
    import { fetchClinicalNotesDOD, fetchVitalSignsDOD } from "../../../store/features/miReporting/miReportingSlice";
    import Select from "react-select";


    const VitalSignsDOD = () => {
    const dispatch = useDispatch();
    const { vitalSignsDOD, loading, error } = useSelector(
        (state) => state.MIReporting
    );
    const centerAccess = useSelector((state) => state.User?.centerAccess || []);
    const user = useSelector((state) => state.User);
    
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [csvData, setCsvData] = useState([]);
    const [csvLoading, setCsvLoading] = useState(false);
    const csvRef = useRef();

    // console.log(vitalSignsDOD)
    
    useEffect(() => {

        dispatch(fetchVitalSignsDOD({ centerAccess }));
    }, [dispatch, centerAccess]);
    // console.log(vitalSignsDOD)
    // Extract unique months and sort them descending

   
    const data = vitalSignsDOD?.data || [];



    const dates = Array.from({ length: 30 }, (_, index) => {
        const date = new Date();
        date.setDate((date.getDate()-1) - (29 - index));

        return date.toISOString().split("T")[0]; // YYYY-MM-DD
    }).reverse();

 
    const filteredData = selectedCenter==="ALL"?data:data.filter(
        (item) =>item?.center_name===selectedCenter
    );

    
    const csvHeaders = [
            "Patient Name",
            "Center Name",
            "Psychologist Name",
            "Patient UID",
            "Total(Current Month)",
            ...dates.map((date) =>
            new Date(date)
                .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                })
                .replace(/ /g, "-")
            ),
        ];
   
    const prepareCsvData = () => {
    setCsvLoading(true);
        

        const rows = filteredData.map((patient) => {

            return [
            patient?.patient_name ?? "",
            patient?.center_name ?? "",
            patient?.psychologist_name ?? "",
            `UID${patient?.patient_id ?? ""}`,
            patient?.current_month_total ?? 0,
            ...dates.map((date) => patient?.dod_data?.[date] ?? 0),
            ];
        });;

            setCsvData(rows);

    setTimeout(() => {
        csvRef.current.link.click();
        setCsvLoading(false);
    }, 100);
    };

    const centerOptions = [
    { value: "ALL", label: "All Centers" },
    ...[...new Set(data.map((item) => item.center_name))].map((center) => ({
        value: center,
        label: center,
    })),
    ];

    const dailyTotals = dates.reduce((acc, date) => {
    acc[date] = filteredData.reduce(
        (sum, patient) => sum + (patient?.dod_data?.[date] ?? 0),
        0
    );
    return acc;
}, {});

 
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
                            Vital Signs DOD
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
                        !vitalSignsDOD ||
                        vitalSignsDOD.length === 0
                        }
                        className="w-auto"
                    >
                        {csvLoading ? "Preparing CSV..." : "Export CSV"}
                    </Button>
                    <CSVLink
                        data={csvData || []}
                        filename="vital-signs-dod.csv"
                        headers={csvHeaders}
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
                        value={
                            centerOptions.find((o) => o.value === selectedCenter) || centerOptions[0]
                        }
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
                    <div
                        className="table-responsive"
                        style={{
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                        maxWidth: "100%",
                        display: "block",
                        }}
                    >
                        <div className="table-responsive rounded-4 shadow-sm border bg-white overflow-scroll">
                            <Table
                                className="mb-0"
                                style={{
                                minWidth: "max-content",
                                borderCollapse: "collapse",
                                fontSize: "0.88rem",
                                }}
                            >
                                <thead
                                style={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 2,
                                    background: "#f3f6fb",
                                }}
                                >
                                    <tr>
                                        <th
                                            colSpan={3}
                                            className="text-center fw-bold px-2 py-2"
                                            style={{
                                                border: "1px solid #cfd8e3",
                                                background: "#14532d",
                                                color: "white",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 20,
                                            }}
                                        >
                                        </th>
                                        <th
                                            colSpan={2}
                                            className="text-center fw-bold px-2 py-2"
                                            style={{
                                                border: "1px solid #cfd8e3",
                                                background: "#14532d",
                                                color: "white",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 20,
                                            }}
                                        >
                                            Total (Single Day)
                                        </th>
                                        

                                        {dates.map((date) => (
                                            <th
                                                key={`total-${date}`}
                                                className="text-center fw-bold px-2 py-2"
                                                style={{
                                                    minWidth: 95,
                                                    border: "1px solid #cfd8e3",
                                                    background: "#14532d",
                                                    color: "white",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {dailyTotals[date]}
                                            </th>
                                        ))}
                                    </tr>
                                <tr>
                                    <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 0,
                                            zIndex: 12,
                                        }}
                                        >
                                        Patient Name
                                        </th>

                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            // maxWidth: 140,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 180,
                                            zIndex: 11,
                                        }}
                                        >
                                        Center Name
                                        </th>

                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 360,
                                            zIndex: 10,
                                        }}
                                        >
                                        Psychologist Name
                                        </th>
                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 360,
                                            zIndex: 10,
                                        }}
                                        >
                                        Pateint UID
                                        </th>
                                        
                                        <th
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                            minWidth: 180,
                                            maxWidth: 180,
                                            border: "1px solid #cfd8e3",
                                            background: "green",
                                            color: "white",
                                            position: "sticky",
                                            left: 360,
                                            zIndex: 10,
                                        }}
                                        >
                                        Total(Current Month)
                                        </th>

                                    {dates.map((date) => (
                                    <th
                                        key={date}
                                        className="text-center fw-bold px-2 py-2"
                                        style={{
                                        minWidth: 95,
                                        border: "1px solid #cfd8e3",
                                        background: "green",
                                        color: "white",
                                        whiteSpace: "nowrap",
                                        }}
                                    >
                                        {new Date(date).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        }).replace(/ /g, "-")}
                                    </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                    {filteredData.map((patient, idx) => {
                                        
                                        
                                        return (
                                        <tr key={idx}>
                                            <td
                                            className="text-center fw-bold px-2 py-2"
                                            style={{
                                                border: "1px solid #d6dde8",
                                                 minWidth: 180,
                                                maxWidth: 180,
                                                background: idx === 0 ? "#dbeafe" : "#fff",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 12,
                                            }}
                                            >
                                            {patient?.patient_name }
                                            </td>
                                            <td
                                            className="text-center fw-bold px-2 py-2"
                                            style={{
                                                minWidth: 180,
                                                border: "1px solid #d6dde8",
                                                background: idx === 0 ? "#dbeafe" : "#fff",
                                                position: "sticky",
                                                left: 180,
                                                zIndex: 11
                                            }}
                                            >
                                            {patient?.center_name}
                                            </td>

                                            <td
                                            className="text-center fw-semibold px-2 py-2"
                                            style={{
                                                minWidth: 180,
                                                maxWidth: 180,
                                                border: "1px solid #d6dde8",
                                                background: idx === 0 ? "#dbeafe" : "#fff",
                                                position: "sticky",
                                                left: 360,
                                                zIndex: 10,
                                            }}
                                            >
                                            {patient?.psychologist_name|| "-"}
                                            </td>
                                            <td
                                            className="text-center fw-semibold px-2 py-2"
                                            style={{
                                                minWidth: 180,
                                                maxWidth: 180,
                                                border: "1px solid #d6dde8",
                                                background: idx === 0 ? "#dbeafe" : "#fff",
                                                position: "sticky",
                                                left: 360,
                                                zIndex: 10,
                                            }}
                                            >
                                            {patient?.patient_id}
                                            </td>
                                            
                                            <td
                                            className="text-center fw-semibold px-2 py-2"
                                            style={{
                                                minWidth: 180,
                                                maxWidth: 180,
                                                border: "1px solid #d6dde8",
                                                background: idx === 0 ? "#dbeafe" : "#fff",
                                                position: "sticky",
                                                left: 360,
                                                zIndex: 10,
                                            }}
                                            >
                                            {patient?.current_month_total}
                                            </td>

                                            {dates.map((date) => {
                                            const value = patient?.dod_data?.[date] ?? 0;

                                            return (
                                                <td
                                                key={date}
                                                className="text-center px-2 py-2"
                                                style={{
                                                    border: "1px solid #d6dde8",
                                                    background: idx === 0 ? "#dbeafe" : "#fff",
                                                    color: value > 0 ? "#111827" : "#9ca3af",
                                                    fontWeight: idx === 0 ? 700 : 500,
                                                }}
                                                >
                                                {value}
                                                </td>
                                            );
                                            })}
                                        </tr>
                                        );
                                    })}
                                    </tbody>
                            </Table>
                            </div>
                                                
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

    export default VitalSignsDOD;
