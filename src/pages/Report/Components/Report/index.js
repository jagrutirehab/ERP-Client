import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Container } from "reactstrap";
import { endOfDay, startOfDay } from "date-fns";
import { connect, useDispatch } from "react-redux";
import { fetchReport } from "../../../../store/actions";

//components
import Header from "../Header";
import Divider from "../../../../Components/Common/Divider";
import Menu from "./Menu";
import Banner from "./Banner";
import AdvanceFilter from "./AdvanceFilter";
import Table from "./Table";
import { ADDMISSION_DATE, ALL_TRANSACTIONS, DUE_AMOUNT } from "./data";

const Report = ({ data, centerAccess, loading }) => {
  const dispatch = useDispatch();
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  //sort by date
  const [sortByDate, setSortByDate] = useState("");
  const [patient, setPatient] = useState("");
  const [billType, setBillType] = useState(ALL_TRANSACTIONS);
  const [sortPatientStatus, setSortPatientStatus] = useState("");
  //add diagnosis column
  const [diagnosisCol, setDiagnosisCol] = useState(false);
  //get patient by referral name
  const [patientsReferrel, setPatientsReferrel] = useState("");

  // toggle advance filter
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (billType === DUE_AMOUNT) setSortByDate(ADDMISSION_DATE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billType]);

  // Manual trigger for View Report button
  const handleViewReport = () => {
    const startDate = startOfDay(reportDate.start);
    const endDate = endOfDay(reportDate.end);
    dispatch(
      fetchReport({
        startDate,
        endDate,
        patient: patient?._id || "",
        billType,
        patientsReferrel: patientsReferrel.trim(),
        sortPatientStatus,
        centerAccess,
      }),
    );
  };

  useEffect(() => {
    handleViewReport();
  }, []);

  return (
    <React.Fragment>
      <div className="pt-4">
        <div className="bg-white p-2 m-n3">
          <Header
            reportDate={reportDate}
            setReportDate={setReportDate}
            billType={billType}
            setBillType={setBillType}
            patient={patient}
            setPatient={setPatient}
            onViewReport={handleViewReport}
            loading={loading}
          />
          <Divider />
          <Menu
            data={data}
            billType={billType}
            setBillType={setBillType}
            patient={patient}
            setPatient={setPatient}
            toggle={toggle}
            sortByDate={sortByDate}
            setSortByDate={setSortByDate}
            sortPatientStatus={sortPatientStatus}
            diagnosisCol={diagnosisCol}
            setDiagnosisCol={setDiagnosisCol}
            patientsReferrel={patientsReferrel}
            setSortPatientStatus={setSortPatientStatus}
            setPatientsReferrel={setPatientsReferrel}
          />
          <AdvanceFilter
            sortPatientStatus={sortPatientStatus}
            setSortPatientStatus={setSortPatientStatus}
            sortByDate={sortByDate}
            setSortByDate={setSortByDate}
            diagnosisCol={diagnosisCol}
            setDiagnosisCol={setDiagnosisCol}
            isOpen={isOpen}
            patientsReferrel={patientsReferrel}
            setPatientsReferrel={setPatientsReferrel}
            setPatient={setPatient}
          />
          <Banner billType={billType} data={data} />
          <Table
            data={data}
            sortPatientStatus={sortPatientStatus}
            sortByDate={sortByDate}
            billType={billType}
            diagnosisCol={diagnosisCol}
            patientsReferrel={patientsReferrel}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

Report.propTypes = {
  data: PropTypes.array,
};

const mapStateToProps = (state) => ({
  data: state.Report.data,
  centerAccess: state.User?.centerAccess,
  loading: state.Report.loading,
});

export default connect(mapStateToProps)(Report);
