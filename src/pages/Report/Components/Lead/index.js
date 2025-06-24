import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { endOfDay, format, startOfDay } from "date-fns";
import { connect, useDispatch } from "react-redux";

//components
import Header from "../Header";
import Divider from "../../../../Components/Common/Divider";
import DataTable from "react-data-table-component";
import { fetchLeadAnalytics } from "../../../../store/actions";
import { CSVLink } from "react-csv";

const Lead = ({ data, centerAccess }) => {
  const dispatch = useDispatch();
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  //sort by date

  // toggle advance filter
  //   const [isOpen, setIsOpen] = useState(false);
  //   const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const startDate = startOfDay(reportDate.start);
    const endDate = endOfDay(reportDate.end);
    dispatch(fetchLeadAnalytics({ startDate, endDate, centerAccess }));
  }, [dispatch, reportDate, centerAccess]);

  const columns = [
    {
      name: "#",
      selector: (row, idx) => idx + 1,
    },
    {
      name: "Date",
      selector: (row) =>
        row.date ? format(new Date(row.date), "d MMM yyyy hh:mm a") : "",
    },
    {
      name: "Center",
      selector: (row) => row.location?.map((l) => l.title).join(", "),
    },
    {
      name: "Patient Name",
      selector: (row) => row.patient?.name,
    },
    {
      name: "Attended By",
      selector: (row) => row.attendedBy,
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

  const headers = [
    { label: "#", key: "id" },
    { label: "Date", key: "date" },
    { label: "Center", key: "location" },
    { label: "Patient Name", key: "patient.name" },
    { label: "Attended By", key: "attendedBy" },
    // { label: "", key: "" },
  ];

  const csvLeads = () => {
    return data?.map((d, i) => ({
      ...d,
      id: i + 1,
      date: d.date ? format(new Date(d.date), "d MMM yyyy hh:mm a") : "",
      location: d.location?.map((l) => l.title).join(", "),
    }));
  };

  return (
    <React.Fragment>
      <div className="pt-4">
        <div className="bg-white p-2 m-n3">
          <Header reportDate={reportDate} setReportDate={setReportDate} />
          <Divider />
          <div className="text-end mt-3">
            <CSVLink
              data={csvLeads() || []}
              title="CSV Download"
              filename={"reports.csv"}
              headers={headers}
              className="btn btn-info px-2 ms-3"
            >
              <i className="ri-file-paper-2-line text-light text-decoration-none"></i>
            </CSVLink>
          </div>
          <DataTable
            fixedHeader
            columns={columns}
            data={data?.map((d) => ({ ...d, id: d._id })) || []}
            highlightOnHover
          />
        </div>
      </div>
    </React.Fragment>
  );
};

Lead.propTypes = {
  data: PropTypes.array,
};

const mapStateToProps = (state) => ({
  data: state.Report.lead,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Lead);
