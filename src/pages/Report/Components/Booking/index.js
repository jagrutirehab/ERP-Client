import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  differenceInMinutes,
  differenceInYears,
  endOfDay,
  format,
  startOfDay,
} from "date-fns";
import { connect, useDispatch } from "react-redux";
import Header from "../Header";
import Divider from "../../../../Components/Common/Divider";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import { Button, Input } from "reactstrap";
import {
  GET_PATIENT_ANALYTICS,
  GET_PATIENT_ANALYTICS_WP,
} from "../../../../helpers/url_helper";
import axios from "axios";
import { fetchBookingAnalytics } from "../../../../store/actions";

const Booking = ({
  centerAccess,
  data,
  totalPages,
  currentPage,
  limit: limitProp,
  total,
}) => {
  const dispatch = useDispatch();

  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const [filter, setFilter] = useState("");
  const [val, setVal] = useState("");
  //   const [data, setData] = useState([]);
  const [page, setPage] = useState(currentPage || 1);
  // const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(limitProp || 10);

  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    setPage(currentPage || 1);
  }, [currentPage]);

  const fetchFullData = async () => {
    try {
      setCsvLoading(true);
      const res = await axios.get(GET_PATIENT_ANALYTICS_WP, {
        params: {
          startDate: reportDate.start.toISOString(),
          endDate: reportDate.end.toISOString(),
          filter,
          val,
          centerAccess,
        },
      });

      if (res.success) {
        const fullData = res.payload || [];
        const formatted = fullData.map((d, i) => ({
          ...d,
          id: i + 1,
          uid: `${d?.id?.prefix || d?.patient?.id?.prefix || ""}${
            d?.id?.value || d?.patient?.id?.value || ""
          }`,
          age: d?.dateOfBirth
            ? differenceInYears(new Date(), new Date(d?.dateOfBirth))
            : d?.patient?.dateOfBirth
            ? differenceInYears(new Date(), new Date(d.patient?.dateOfBirth))
            : "",
          doctor: d?.addmission?.doctors?.length
            ? d.addmission.doctors.map((doc) => doc?.name || "").pop() || ""
            : d?.doctor?.name || d?.addmission?.doctor?.name || "",
          psychologist: d?.addmission?.psychologists?.length
            ? d.addmission.psychologists.map((psy) => psy?.name || "").pop() ||
              ""
            : d?.psychologist?.name || d?.addmission?.psychologist?.name || "",
          addmissionDate: d?.addmission?.addmissionDate
            ? format(
                new Date(d.addmission.addmissionDate),
                "d MMM yyyy hh:mm a"
              )
            : d?.addmissionDate
            ? format(new Date(d.addmissionDate), "d MMM yyyy hh:mm a")
            : "",
          dischargeDate: d?.addmission?.dischargeDate
            ? format(new Date(d.addmission.dischargeDate), "d MMM yyyy hh:mm a")
            : d?.dischargeDate
            ? format(new Date(d.dischargeDate), "d MMM yyyy hh:mm a")
            : "",
          billCycleDate: d?.addmission?.addmissionDate
            ? format(new Date(d.addmission.addmissionDate), "d")
            : "",
        }));

        setCsvData(formatted);

        // trigger download
        setTimeout(() => {
          csvRef.current.link.click();
        }, 100);
      }
    } catch (err) {
      console.error("Failed to fetch full patient analytics", err);
    } finally {
      setCsvLoading(false);
    }
  };

  console.log(page, "page");

  const fetchData = async () => {
    dispatch(
      fetchBookingAnalytics({
        page,
        limit,
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        filter,
        val,
        centerAccess,
      })
    );
  };

  useEffect(() => {
    fetchData();
  }, [page, reportDate, filter, limit, centerAccess, val]);

  console.log(data, "data");

  const generalColumns = [
    {
      name: "#",
      selector: (row, idx) => idx + 1,
    },
    {
      name: "Center",
      selector: (row) => row.center?.title,
    },
    {
      name: "Patient",
      selector: (row) => row.patient?.name,
      wrap: true,
      style: {
        textTransform: "capitalize",
      },
    },
    {
      name: "UID",
      selector: (row) => `${row.patient?.id?.prefix}${row.patient?.id?.value}`,
    },
    {
      name: "Doctor",
      selector: (row) => row.doctor?.name,
      wrap: true,
    },
    {
      name: "Date",
      selector: (row) =>
        `${format(
          new Date(row.startDate),
          "d MMM yyyy hh:mm a"
        )} for ${differenceInMinutes(
          new Date(row.endDate),
          new Date(row.startDate)
        )} minutes`,
      wrap: true,
    },
    {
      name: "Gender",
      selector: (row) => row.patient?.gender,
    },
    {
      name: "Phone No",
      selector: (row) => row.patient?.dialCode + row.patient?.mobile || "",
    },
    {
      name: "Booking Price",
      selector: (row) =>
        row.transactionId?.booking_price ||
        row.bill?.receiptInvoice?.paymentModes
          ?.reduce((sum, m) => sum + (m.amount || 0), 0)
          .toFixed(2),
    },
    {
      name: "Payment Method",
      selector: (row) =>
        row.transactionId?.payment_method?.toUpperCase() ||
        row.bill?.receiptInvoice?.paymentModes?.map((m) => m.type).join(", "),
    },
    {
      name: "Payment Status",
      selector: (row) =>
        row.transactionId?.payment_Status || row.bill ? "Completed" : "Unpaid",
    },
  ];

  const patientRow = [
    {
      name: "#",
      selector: (row, idx) => idx + 1,
    },
    {
      name: "Center",
      selector: (row) => row.center?.title,
    },
    {
      name: "Patient",
      selector: (row) => row?.name,
      wrap: true,
    },
    {
      name: "UID",
      selector: (row) => `${row?.uid?.prefix}${row?.uid?.value}`,
    },
    {
      name: "Gender",
      selector: (row) => row?.gender,
    },
    {
      name: "Referred By",
      selector: (row) => row?.referredBy,
      wrap: true,
    },
    {
      name: "Doctor",
      selector: (row) =>
        row?.addmission?.doctors?.length > 0
          ? row.addmission.doctors
              .map((d) => d?.name || "")
              .filter(Boolean)
              .pop() || "—"
          : row?.addmission?.doctor?.name || row?.doctor?.name || "—",
      wrap: true,
    },
    {
      name: "Psychologist",
      selector: (row) =>
        row?.addmission?.psychologists?.length > 0
          ? row.addmission.psychologists
              .map((p) => p?.name || "")
              .filter(Boolean)
              .pop() || "—"
          : row?.addmission?.psychologist?.name ||
            row?.psychologist?.name ||
            "—",
      wrap: true,
    },

    {
      name: "Phone No",
      selector: (row) => row?.phoneNumber,
    },
    //
    {
      name: "Age",
      selector: (row) =>
        row?.dateOfBirth
          ? differenceInYears(new Date(), new Date(row?.dateOfBirth)) + " years"
          : "",
    },
    {
      name: "Guardian",
      selector: (row) => row?.guardianName,
      wrap: true,
    },
    {
      name: "Guardian Number",
      selector: (row) => row?.guardianPhoneNumber,
      wrap: true,
    },
    {
      name: "IPD File NUmber",
      selector: (row) => row.ipdFileNumber,
    },
  ];

  const admittedColumns = [...patientRow];
  const dischargeColumns = [...patientRow];

  const patientColumns = patientRow;

  const generalHeaders = [
    { label: "#", key: "id" },
    { label: "Center", key: "center.title" },
    { label: "Patient", key: "patient.name" },
    { label: "UID", key: "patient.id.value" },
    { label: "Gender", key: "patient.gender" },
    { label: "Referred By", key: "patient.referredBy" },
    { label: "Phone No", key: "patient.phoneNumber" },
    { label: "Doctor", key: "doctor" },
    { label: "Date", key: "date" },
  ];

  const admittedHeaders = [
    { label: "#", key: "id" },
    { label: "Center", key: "center.title" },
    { label: "Patient", key: "name" },
    { label: "UID", key: "uid" },
    { label: "Gender", key: "gender" },
    { label: "Referred By", key: "referredBy" },
    { label: "Phone No", key: "phoneNumber" },
    { label: "Doctor", key: "doctor" },
    { label: "Psychologist", key: "psychologist" },
    { label: "Age", key: "age" },
    { label: "Guardian", key: "guardianName" },
    { label: "Guardian Number", key: "guardianPhoneNumber" },
    { label: "IPD File No", key: "ipdFileNumber" },
    { label: "Addmission Date", key: "addmissionDate" },
    { label: "Bill Cycle Date", key: "billCycleDate" },
  ];

  const discahrgeHeaders = [
    { label: "#", key: "id" },
    { label: "Center", key: "center.title" },
    { label: "Patient", key: "name" },
    { label: "UID", key: "uid" },
    { label: "Gender", key: "gender" },
    { label: "Referred By", key: "referredBy" },
    { label: "Phone No", key: "phoneNumber" },
    { label: "Doctor", key: "doctor" },
    { label: "Psychologist", key: "psychologist" },
    { label: "Age", key: "age" },
    { label: "Guardian", key: "guardianName" },
    { label: "Guardian Number", key: "guardianPhoneNumber" },
    { label: "IPD File No", key: "ipdFileNumber" },
    { label: "Addmission Date", key: "addmissionDate" },
    { label: "Discharge Date", key: "dischargeDate" },
  ];

  return (
    <React.Fragment>
      <div className="pt-4">
        <div className="bg-white p-2 m-n3">
          <div className="">
            <h6 className="display-6 fs-6 my-3">
              Total Appointments:- {total}
            </h6>
          </div>
          <Header reportDate={reportDate} setReportDate={setReportDate} />
          <div className="d-flex justify-content-between mt-3">
            <div className="d-flex gap-2">
              <Input
                type="select"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                }}
              >
                <option value={""}>All Appointments</option>
                <option value={"PRESCRIBED_APPOINTMENTS"}>
                  Prescribed Appointments
                </option>
                <option value={"PAID_APPOINTMENTS"}>Paid Appointments</option>
                <option value={"CANCELLED_APPOINTMENTS"}>
                  Cancelled Appointments
                </option>
              </Input>

              <Input
                type="select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                style={{ width: "100px" }}
              >
                {[10, 20, 30, 40, 50].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Input>
            </div>
            <div>
              {/* {filter === "PRESCRIBED_APPOINTMENTS" &&
                (val === "ALL_PRESCRIBED" ? (
                  <Button
                    color="info"
                    onClick={() => setVal("")}
                    style={{ marginRight: "10px" }}
                  >
                    Back to dates
                  </Button>
                ) : (
                  <Button
                    color="info"
                    onClick={() => setVal("ALL_ADMITTED")}
                    style={{ marginRight: "10px" }}
                  >
                    Show All Admitted Patients
                  </Button>
                ))} */}

              <Button
                color="info"
                onClick={fetchFullData}
                disabled={csvLoading}
              >
                {csvLoading ? "Preparing CSV..." : "Export CSV"}
              </Button>

              <CSVLink
                data={csvData || []}
                filename="reports.csv"
                headers={
                  filter === "PRESCRIBED_APPOINTMENTS"
                    ? admittedHeaders
                    : filter === "CANCELLED_APPOINTMENTS"
                    ? discahrgeHeaders
                    : generalHeaders
                }
                className="d-none"
                ref={csvRef}
              />
            </div>
          </div>
          <Divider />
          <DataTable
            fixedHeader
            columns={
              // filter === "PRESCRIBED_APPOINTMENTS"
              //   ? admittedColumns
              //   : filter === "CANCELLED_APPOINTMENTS"
              //   ? patientColumns
              //   :
              generalColumns
            }
            data={
              data?.map((d) => ({
                ...d,
                id: d._id,
                date: `${format(
                  new Date(d.startDate),
                  "d MMM yyyy hh:mm a"
                )} for ${differenceInMinutes(
                  new Date(d.endDate),
                  new Date(d.startDate)
                )} minutes`,
              })) || []
            }
            highlightOnHover
          />
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

Booking.propTypes = {
  data: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centerAccess: state.User.centerAccess,
  data: state.Report.booking,
  totalPages: state.Report.totalPages,
  currentPage: state.Report.currentPage,
  limit: state.Report.limit,
  total: state.Report.total,
});

export default connect(mapStateToProps)(Booking);
