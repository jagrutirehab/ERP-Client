// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { differenceInMinutes, endOfDay, format, startOfDay } from "date-fns";
// import { connect, useDispatch } from "react-redux";

// //components
// import Header from "../Header";
// import Divider from "../../../../Components/Common/Divider";
// import DataTable from "react-data-table-component";
// import { fetchOPDAnalytics } from "../../../../store/actions";
// import { CSVLink } from "react-csv";

// const OPDAnalytics = ({ data, centerAccess }) => {
//   const dispatch = useDispatch();
//   const [reportDate, setReportDate] = useState({
//     start: startOfDay(new Date()),
//     end: endOfDay(new Date()),
//   });
//   //sort by date

//   // toggle advance filter
//   //   const [isOpen, setIsOpen] = useState(false);
//   //   const toggle = () => setIsOpen(!isOpen);

//   useEffect(() => {
//     const startDate = startOfDay(reportDate.start);
//     const endDate = endOfDay(reportDate.end);
//     dispatch(fetchOPDAnalytics({ startDate, endDate, centerAccess }));
//   }, [dispatch, reportDate, centerAccess]);

//   const columns = [
//     {
//       name: "#",
//       selector: (row, idx) => idx + 1,
//     },
//     {
//       name: <div>Patient Name</div>,
//       selector: (row) => row.patient?.name,
//       wrap: true,
//       minWidth: "120px"
//     },
//     {
//       name: <div>UID</div>,
//       selector: (row) => `${row.patient?.id?.prefix}${row.patient?.id?.value}`,
//       wrap: true
//     },
//     {
//       name: <div>Doctor</div>,
//       selector: (row) => row.doctor?.name,
//       wrap: true,
//       minWidth: "120px"
//     },
//     {
//       name: <div>Date</div>,
//       selector: (row) =>
//         `On ${format(new Date(row.startDate), "dd MMM yyyy")} at \n ${format(
//           new Date(row.startDate),
//           "hh:mm a"
//         )} for ${differenceInMinutes(
//           new Date(row?.endDate),
//           new Date(row?.startDate)
//         )} mins`,
//       wrap: true,
//       minWidth: "120px"
//     },
//     {
//       name: <div>Center</div>,
//       selector: (row) => row.center?.title,
//       wrap: true
//     },
//     {
//       name: <div>Appointment Type</div>,
//       selector: (row) => row.consultationType,
//       wrap: true
//     },
//     // {
//     //   name: <div>Patient Phone Number</div>,
//     //   selector: (row) => row.patient?.phoneNumber,
//     //   wrap: true,
//     //   minWidth: "125px"
//     // },
//     {
//       name: <div>No Show</div>,
//       selector: (row) => row?.isCancelled ? "Yes" : "No",

//     },
//     {
//       name: <div>Prescribed</div>,
//       selector: (row) => (row?.chart?.chart === "PRESCRIPTION" ? "Yes" : "No"),
//     },
//     {
//       name: <div>Clinical Note</div>,
//       selector: (row) => (row?.chart?.chart === "CLINICAL_NOTE" ? "Yes" : "No"),
//     },
//     {
//       name: <div>OPD Charges</div>,
//       selector: (row) => row?.opdCharges,
//       wrap: true
//     },
//     {
//       name: <div>Paid Amount</div>,
//       selector: (row) => row.bill?.receiptInvoice?.payable,
//       wrap: true
//     },
//     {
//       name: <div>Payment Mode</div>,
//       selector: (row) =>
//         row.bill?.receiptInvoice?.paymentModes
//           ?.map(
//             (pm) =>
//               `${pm.amount} - ${pm.type} ${pm.transactionId || ""} ${pm.bank || ""
//               } ${pm.chequeNumber || ""} ${pm.cardNumber || ""}`
//           )
//           .join(", "),
//       wrap: true,
//     },
//     // {
//     //   name: "#",
//     //   selector: (row) => row.,
//     // },
//     // {
//     //   name: "#",
//     //   selector: (row) => row.,
//     // },
//   ];

//   const opdChargesLabels = [
//     "doctor consultation charges",
//     "general physician consultation",
//     "ortho consultation",
//     "physician consultation",
//     "opd charges",
//   ];

//   const csvOPD = () => {
//     return data?.map((d, i) => {
//       console.log({ opd: d });

//       const opdCharges = d.bill?.receiptInvoice?.invoiceList?.find((inv) =>
//         opdChargesLabels.includes(inv.slot)
//       );

//       console.log({ opdCharges });

//       return {
//         ...d,
//         id: i + 1,
//         uid: `${d.patient?.id?.prefix}${d.patient?.id?.value}`,
//         paymentMode: d.bill?.receiptInvoice?.paymentModes
//           ?.map(
//             (pm) =>
//               `${pm.amount} - ${pm.type} ${pm.transactionId || ""} ${pm.bank || ""
//               } ${pm.chequeNumber || ""} ${pm.cardNumber || ""}`
//           )
//           .join(", "),
//         opdCharges: (opdCharges?.unit || 0) * (opdCharges?.cost || 0) || "",
//         isNoShow: d?.isCancelled ? "Yes" : "No",
//         prescribed: d?.chart?.chart === "PRESCRIPTION" ? "Yes" : "No",
//         isClinicalNoteCreated: d?.chart?.chart === "CLINICAL_NOTE" ? "Yes" : "No",
//         paidAmount: d.bill?.receiptInvoice?.payable,
//         date: `On ${format(
//           new Date(d.startDate),
//           "dd MMM yyyy"
//         )} at \n ${format(
//           new Date(d.startDate),
//           "hh:mm a"
//         )} for ${differenceInMinutes(
//           new Date(d?.endDate),
//           new Date(d?.startDate)
//         )} mins`,
//       };
//     });
//   };

//   const headers = [
//     { label: "#", key: "id" },
//     { label: "Patient", key: "patient.name" },
//     { label: "UID", key: "uid" },
//     { label: "Doctor", key: "doctor.name" },
//     { label: "Date", key: "date" },
//     { label: "Center", key: "center.title" },
//     { label: "Appointment Type", key: "consultationType" },
//     // { label: "Patient Phone No", key: "patient.phoneNumber" },
//     { label: "No Show", key: "isNoShow" },
//     { label: "Prescribed", key: "prescribed" },
//     { label: "Clinical Note", key: "isClinicalNoteCreated" },
//     { label: "OPD Charges", key: "opdCharges" },
//     { label: "Paid Amount", key: "paidAmount" },
//     { label: "Payment Mode", key: "paymentMode" },
//   ];

//   return (
//     <React.Fragment>
//       <div className="pt-4">
//         <div className="bg-white p-2 m-n3">
//           <Header reportDate={reportDate} setReportDate={setReportDate} />
//           <Divider />
//           <div className="text-end mt-3">
//             <CSVLink
//               data={csvOPD() || []}
//               title="CSV Download"
//               filename={"reports.csv"}
//               headers={headers}
//               className="btn btn-info px-2 ms-3"
//             >
//               <i className="ri-file-paper-2-line text-light text-decoration-none"></i>
//             </CSVLink>
//           </div>
//           <DataTable
//             fixedHeader
//             columns={columns}
//             data={
//               data?.map((d) => {
//                 const opdCharges = d.bill?.receiptInvoice?.invoiceList?.find(
//                   (inv) => opdChargesLabels.includes(inv.slot)
//                 );

//                 return {
//                   ...d,
//                   id: d._id,
//                   opdCharges:
//                     (opdCharges?.unit || 0) * (opdCharges?.cost || 0) || "",
//                 };
//               }) || []
//             }
//             highlightOnHover
//           />
//         </div>
//       </div>
//     </React.Fragment>
//   );
// };

// OPDAnalytics.propTypes = {
//   data: PropTypes.array,
// };

// const mapStateToProps = (state) => ({
//   data: state.Report.opd,
//   centerAccess: state.User?.centerAccess,
// });

// export default connect(mapStateToProps)(OPDAnalytics);

import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { differenceInMinutes, endOfDay, format, startOfDay } from "date-fns";
import { connect, useDispatch, useSelector } from "react-redux";

// components
import Header from "../Header";
import Divider from "../../../../Components/Common/Divider";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { fetchOPDAnalytics } from "../../../../store/actions";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { Input, Row, Col, Button } from "reactstrap";
import DataTable from "react-data-table-component";
import { columns } from "./Columns";

const OPDAnalytics = ({ data, centerAccess, total }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const loading = useSelector((state) => state.Report.loading);

  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });

  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedDoctor, setDebouncedDoctor] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);

  const activeDateRef = useRef(reportDate);

  // console.log("total", total);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedDoctor(doctorSearch);
      setPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [searchTerm, doctorSearch]);

  const fetchReport = useCallback(
    (isManual = false) => {
      if (isManual) {
        activeDateRef.current = reportDate;
      }

      const centersToSend =
        selectedCenter === "ALL" ? centerAccess : [selectedCenter];
      const safeSearch = debouncedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      dispatch(
        fetchOPDAnalytics({
          startDate: startOfDay(activeDateRef.current.start),
          endDate: endOfDay(activeDateRef.current.end),
          centerAccess: centersToSend,
          // page,
          // limit,
          search: safeSearch,
          doctorSearch: debouncedDoctor,
        }),
      );
    },
    [
      dispatch,
      reportDate,
      selectedCenter,
      centerAccess,
      page,
      limit,
      debouncedSearch,
      debouncedDoctor,
    ],
  );

  useEffect(() => {
    fetchReport(false);
  }, [
    selectedCenter,
    page,
    limit,
    debouncedSearch,
    debouncedDoctor,
    centerAccess,
  ]);

  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [{ value: "ALL", label: "All Centers" }]
      : []),
    ...(user?.centerAccess?.map((id) => ({
      value: id,
      label:
        user?.userCenters?.find((c) => c._id === id)?.title || "Unknown Center",
    })) || []),
  ];

  const opdChargesLabels = [
    "doctor consultation charges",
    "general physician consultation",
    "ortho consultation",
    "physician consultation",
    "opd charges",
  ];

  const headers = [
    { label: "#", key: "id" },
    { label: "Patient", key: "patient.name" },
    { label: "UID", key: "uid" },
    { label: "Doctor", key: "doctor.name" },
    { label: "Date", key: "date" },
    { label: "Center", key: "center.title" },
    { label: "Appointment Type", key: "consultationType" },
    // { label: "Patient Phone No", key: "patient.phoneNumber" },
    { label: "No Show", key: "isNoShow" },
    { label: "Prescribed", key: "prescribed" },
    { label: "Clinical Note", key: "isClinicalNoteCreated" },
    { label: "OPD Charges", key: "opdCharges" },
    { label: "Paid Amount", key: "paidAmount" },
    { label: "Payment Mode", key: "paymentMode" },
  ];

  const csvOPD = () => {
    return data?.map((d, i) => {
      console.log({ opd: d });

      const opdCharges = d.bill?.receiptInvoice?.invoiceList?.find((inv) =>
        opdChargesLabels.includes(inv.slot),
      );

      console.log({ opdCharges });

      return {
        ...d,
        id: i + 1,
        uid: `${d.patient?.id?.prefix}${d.patient?.id?.value}`,
        paymentMode: d.bill?.receiptInvoice?.paymentModes
          ?.map(
            (pm) =>
              `${pm.amount} - ${pm.type} ${pm.transactionId || ""} ${
                pm.bank || ""
              } ${pm.chequeNumber || ""} ${pm.cardNumber || ""}`,
          )
          .join(", "),
        opdCharges: (opdCharges?.unit || 0) * (opdCharges?.cost || 0) || "",
        isNoShow: d?.isCancelled ? "Yes" : "No",
        prescribed: d?.chart?.chart === "PRESCRIPTION" ? "Yes" : "No",
        isClinicalNoteCreated:
          d?.chart?.chart === "CLINICAL_NOTE" ? "Yes" : "No",
        paidAmount: d.bill?.receiptInvoice?.payable,
        date: `On ${format(
          new Date(d.startDate),
          "dd MMM yyyy",
        )} at \n ${format(
          new Date(d.startDate),
          "hh:mm a",
        )} for ${differenceInMinutes(
          new Date(d?.endDate),
          new Date(d?.startDate),
        )} mins`,
      };
    });
  };

  const mappedData =
    data?.map((d) => {
      const opdChargesItem = d.bill?.receiptInvoice?.invoiceList?.find((inv) =>
        opdChargesLabels.includes(inv.slot?.toLowerCase()),
      );
      return {
        ...d,
        id: d._id,
        calculatedOpdCharges:
          (opdChargesItem?.unit || 0) * (opdChargesItem?.cost || 0) || 0,
      };
    }) || [];

  console.log("mappedData", mappedData);

  const opds = mappedData.filter((d) => Number(d?.calculatedOpdCharges) > 0);

  return (
    <React.Fragment>
      <div className="pt-4 px-2">
        <div className="bg-white p-3 rounded shadow-sm">
          <Row className="g-2 align-items-center mb-4">
            <Col md={2}>
              <Select
                value={
                  centerOptions.find((o) => o.value === selectedCenter) ||
                  centerOptions[0]
                }
                onChange={(opt) => {
                  setSelectedCenter(opt.value);
                  setPage(1);
                }}
                options={centerOptions}
                placeholder="Center..."
              />
            </Col>
            <Col md={2}>
              <Input
                placeholder="Patient Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Input
                placeholder="Doctor Name..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
              />
            </Col>
            <Col md="auto">
              <Header reportDate={reportDate} setReportDate={setReportDate} />
            </Col>
            <Col md="auto">
              <Button
                color="primary"
                onClick={() => {
                  setPage(1);
                  fetchReport(true);
                }}
              >
                View Report
              </Button>
            </Col>
            <Col className="text-end">
              <CSVLink
                data={csvOPD() || []}
                title="CSV Download"
                filename={"reports.csv"}
                headers={headers}
                className="btn btn-info px-2 ms-3"
              >
                <i className="ri-file-paper-2-line text-light text-decoration-none"></i>
              </CSVLink>
            </Col>
          </Row>

          <Divider />

          <div className="row g-3 my-3">
            <div className="col-md-12">
              <div className="d-flex justify-content-around align-items-center p-3 bg-light rounded border">
                <div className="text-center">
                  <span className="text-muted text-uppercase fw-bold fs-11">
                    Total OPD Count
                  </span>
                  <h4 className="mb-0 mt-1 text-primary">
                    {mappedData?.length || 0}
                  </h4>
                </div>
                <div className="text-center border-start ps-5">
                  <span className="text-muted text-uppercase fw-bold fs-11">
                    Total OPD Charges (₹)
                  </span>
                  <h4 className="mb-0 mt-1 text-success">
                    {mappedData
                      .reduce((a, b) => a + b.calculatedOpdCharges, 0)
                      .toLocaleString()}
                  </h4>
                </div>
                <div className="text-center border-start ps-5">
                  <span className="text-muted text-uppercase fw-bold fs-11">
                    Total Paid Amount (₹)
                  </span>
                  <h4 className="mb-0 mt-1 text-success">
                    {mappedData
                      .reduce(
                        (a, b) =>
                          a + (Number(b.bill?.receiptInvoice?.payable) || 0),
                        0,
                      )
                      .toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          <DataTable
            fixedHeader
            columns={columns}
            data={mappedData}
            highlightOnHover
          />
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  data: state.Report.opd,
  total: state.Report.opdTotal,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(OPDAnalytics);
