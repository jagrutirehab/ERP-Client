import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { differenceInYears, endOfDay, format, startOfDay } from "date-fns";
import { connect, useDispatch } from "react-redux";

//components
import Header from "../Header";
import Divider from "../../../../Components/Common/Divider";
import { fetchPatientAnalytics } from "../../../../store/actions";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import { Input } from "reactstrap";
import RenderWhen from "../../../../Components/Common/RenderWhen";

const Patient = ({ data, centerAccess }) => {
  const dispatch = useDispatch();
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const [filter, setFilter] = useState("");
  //sort by date

  // toggle advance filter
  //   const [isOpen, setIsOpen] = useState(false);
  //   const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const startDate = startOfDay(reportDate.start);
    const endDate = endOfDay(reportDate.end);
    dispatch(
      fetchPatientAnalytics({ startDate, endDate, centerAccess, filter })
    );
  }, [dispatch, reportDate, centerAccess, filter]);

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
    },
    {
      name: "UID",
      selector: (row) => `${row.patient?.id?.prefix}${row.patient?.id?.value}`,
    },
    {
      name: "Doctor",
      selector: (row) => row.patient?.doctor?.name,
      wrap: true,
    },
    {
      name: "Psychologist",
      selector: (row) => row.patient?.psychologist?.name,
      wrap: true,
    },
    {
      name: "Gender",
      selector: (row) => row.patient?.gender,
    },
    {
      name: "Referred By",
      selector: (row) => row.patient?.referredBy,
      wrap: true,
    },
    {
      name: "Phone No",
      selector: (row) => row.patient?.phoneNumber,
    },
    //
    {
      name: "Age",
      selector: (row) =>
        differenceInYears(new Date(), new Date(row.patient?.dateOfBirth)) +
        " years",
    },
    {
      name: "Admission Date",
      selector: (row) =>
        row.addmissionDate
          ? format(new Date(row.addmissionDate), "d MMM yyyy hh:mm a")
          : "",
      wrap: true,
    },
    {
      name: "Discharge Date",
      selector: (row) =>
        row.dischargeDate
          ? format(new Date(row.dischargeDate), "d MMM yyyy hh:mm a")
          : "",
      wrap: true,
    },
    // {
    //   name: "#",
    //   selector: (row) => row.,
    // },
    // {
    //   name: "#",
    //   selector: (row) => row.,
    // },
  ];

  const billCycleDate = {
    name: "Bill Cycle Date",
    selector: (row) =>
      row.addmission?.addmissionDate
        ? format(new Date(row.addmission.addmissionDate), "d")
        : "",
    wrap: true,
  };

  const addmissionDate = {
    name: "Admission Date",
    selector: (row) =>
      row.addmission?.addmissionDate
        ? format(new Date(row.addmission.addmissionDate), "d MMM yyyy hh:mm a")
        : "",
    wrap: true,
  };

  const dischargeDate = {
    name: "Discharge Date",
    selector: (row) =>
      row.addmission?.dischargeDate
        ? format(new Date(row.addmission.dischargeDate), "d MMM yyyy hh:mm a")
        : "",
    wrap: true,
  };

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
      name: "IPD File NUmber",
      selector: (row) => row.ipdFileNumber,
    },
  ];

  const admittedColumns = [...patientRow, addmissionDate, billCycleDate];
  const dischargeColumns = [...patientRow, addmissionDate, dischargeDate];

  const patientColumns = patientRow;

  const generalHeaders = [
    { label: "#", key: "id" },
    { label: "Center", key: "center.title" },
    { label: "Patient", key: "patient.name" },
    { label: "UID", key: "uid" },
    { label: "Gender", key: "patient.gender" },
    { label: "Referred By", key: "patient.referredBy" },
    { label: "Phone No", key: "patient.phoneNumber" },
    { label: "Doctor", key: "doctor" },
    { label: "Psychologist", key: "psychologist" },
    { label: "Age", key: "age" },
    { label: "Addmission Date", key: "addmissionDate" },
    { label: "Discharge Date", key: "dischargeDate" },
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
    { label: "IPD File No", key: "ipdFileNumber" },
    { label: "Addmission Date", key: "addmissionDate" },
    { label: "Discharge Date", key: "dischargeDate" },
  ];

  const patientHeaders = [
    { label: "#", key: "id" },
    { label: "Center", key: "center.title" },
    { label: "Patient", key: "name" },
    { label: "UID", key: "uid" },
    { label: "Gender", key: "gender" },
    { label: "Phone No", key: "phoneNumber" },
    { label: "Doctor", key: "doctor" },
    { label: "Psychologist", key: "psychologist" },
    { label: "Age", key: "age" },
    { label: "Referred By", key: "referredBy" },
    { label: "IPD File No", key: "ipdFileNumber" },
  ];

  const csvPatients = () => {
    return filter === "ADMITTED_PATIENTS" ||
      filter === "DISCHARGED_PATIENTS" ||
      filter === "ALL_PATIENTS"
      ? data?.map((d, i) => {
          return {
            ...d,
            id: i + 1,
            uid: `${d?.id?.prefix}${d?.id?.value}`,
            age: d.dateOfBirth
              ? differenceInYears(new Date(), new Date(d?.dateOfBirth))
              : "",
            doctor: d?.addmission?.doctors?.length
              ? d.addmission.doctors
                  .map((doc) => doc?.name || "")
                  .filter(Boolean)
                  .pop() || ""
              : d?.doctor?.name || d?.addmission?.doctor?.name || "",

            psychologist: d?.addmission?.psychologists?.length
              ? d.addmission.psychologists
                  .map((psy) => psy?.name || "")
                  .filter(Boolean)
                  .pop() || ""
              : d?.psychologist?.name ||
                d?.addmission?.psychologist?.name ||
                "",
            addmissionDate: d?.addmission?.addmissionDate
              ? format(
                  new Date(d.addmission.addmissionDate),
                  "d MMM yyyy hh:mm a"
                )
              : "",
            dischargeDate: d?.addmission?.dischargeDate
              ? format(
                  new Date(d.addmission.dischargeDate),
                  "d MMM yyyy hh:mm a"
                )
              : "",
            billCycleDate: d?.addmission?.addmissionDate
              ? format(new Date(d.addmission.addmissionDate), "d")
              : "",
          };
        })
      : data?.map((d, i) => {
          return {
            ...d,
            id: i + 1,
            uid: `${d?.patient?.id?.prefix}${d?.patient?.id?.value}`,
            doctor: d.patient?.doctor?.name || "",
            psychologist: d.patient?.psychologist?.name || "",
            age: d.patient?.dateOfBirth
              ? differenceInYears(new Date(), new Date(d.patient?.dateOfBirth))
              : "",
            addmissionDate: d?.addmissionDate
              ? format(new Date(d.addmissionDate), "d MMM yyyy hh:mm a")
              : "",
            dischargeDate: d?.dischargeDate
              ? format(new Date(d.dischargeDate), "d MMM yyyy hh:mm a")
              : "",
          };
        });
  };

  return (
    <React.Fragment>
      <div className="pt-4">
        <div className="bg-white p-2 m-n3">
          <div className="">
            <RenderWhen
              isTrue={
                filter === "ADMITTED_PATIENTS" || filter === "ALL_PATIENTS"
              }
            >
              <h6 className="display-6 fs-6 my-3">
                Total Patients {data?.length}
              </h6>
            </RenderWhen>
          </div>
          <Header reportDate={reportDate} setReportDate={setReportDate} />
          <div className="d-flex justify-content-between mt-3">
            <div>
              <Input
                type="select"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                }}
              >
                {/* <option value="" selected disabled hidden>
                  Choose here
                </option> */}
                <option value={""}>General</option>
                <option value={"ADMITTED_PATIENTS"}>Admitted Patients</option>
                <option value={"DISCHARGED_PATIENTS"}>
                  Discharged Patients
                </option>
                <option value={"ALL_PATIENTS"}>All Patients</option>
              </Input>
            </div>
            <div>
              <CSVLink
                data={csvPatients() || []}
                title="CSV Download"
                filename={"reports.csv"}
                headers={
                  filter === "ADMITTED_PATIENTS"
                    ? admittedHeaders
                    : filter === "DISCHARGED_PATIENTS"
                    ? discahrgeHeaders
                    : filter === "ALL_PATIENTS"
                    ? patientHeaders
                    : generalHeaders
                }
                className="btn btn-info px-2 ms-3"
              >
                <i className="ri-file-paper-2-line text-light text-decoration-none"></i>
              </CSVLink>
            </div>
          </div>
          <Divider />
          <DataTable
            fixedHeader
            columns={
              filter === "ADMITTED_PATIENTS"
                ? admittedColumns
                : filter === "ALL_PATIENTS"
                ? patientColumns
                : filter === "DISCHARGED_PATIENTS"
                ? dischargeColumns
                : generalColumns
            }
            data={data?.map((d) => ({ ...d, uid: d.id, id: d._id })) || []}
            highlightOnHover
          />
        </div>
      </div>
    </React.Fragment>
  );
};

Patient.propTypes = {
  data: PropTypes.array,
};

const mapStateToProps = (state) => ({
  data: state.Report.patient,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Patient);
