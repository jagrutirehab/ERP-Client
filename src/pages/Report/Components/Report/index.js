import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Container } from "reactstrap";
import { endOfDay, startOfDay } from "date-fns";
import { connect, useDispatch } from "react-redux";
import {
  fetchReport,
  fetchReportUpdated,
  fetchTransactionsAnalytics,
} from "../../../../store/actions";
import { REPORT_UPDATED } from "../../../../Components/constants/report";
import { exportTransactionsAnalyticsCSV } from "../../../../helpers/backend_helper";

//components
import Header from "../Header";
import Divider from "../../../../Components/Common/Divider";
import Menu from "./Menu";
import Banner from "./Banner";
import AdvanceFilter from "./AdvanceFilter";
import Table from "./Table";
import TransactionsTable from "./TransactionsTable";
import {
  ADDMISSION_DATE,
  ALL_TRANSACTIONS,
  DUE_AMOUNT,
  ONLINE_OPD,
} from "./data";

const Report = ({
  data,
  centerAccess,
  loading,
  view,
  transactions,
  total,
  grandTotal,
  refundTotal,
  totalPages,
}) => {
  const dispatch = useDispatch();
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  // Online OPD (transactions) pagination + export
  const [page, setPage] = useState(1);
  const limit = 10;
  const [exportLoading, setExportLoading] = useState(false);
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

  const fetchTransactions = (nextPage) => {
    dispatch(
      fetchTransactionsAnalytics({
        page: nextPage,
        limit,
        startDate: startOfDay(reportDate.start).toISOString(),
        endDate: endOfDay(reportDate.end).toISOString(),
        centerAccess,
      }),
    );
  };

  // Backend CSV export — streams the full filtered set (all pages)
  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      const response = await exportTransactionsAnalyticsCSV({
        startDate: startOfDay(reportDate.start).toISOString(),
        endDate: endOfDay(reportDate.end).toISOString(),
        centerAccess,
      });
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `online_opd_transactions_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV", err);
    } finally {
      setExportLoading(false);
    }
  };

  // Manual trigger for View Report button
  const handleViewReport = () => {
    if (billType === ONLINE_OPD) {
      setPage(1);
      fetchTransactions(1);
      return;
    }
    const startDate = startOfDay(reportDate.start);
    const endDate = endOfDay(reportDate.end);
    const payload = {
      startDate,
      endDate,
      patient: patient?._id || "",
      billType,
      patientsReferrel: patientsReferrel.trim(),
      sortPatientStatus,
      centerAccess,
    };
    if (view === REPORT_UPDATED) {
      dispatch(fetchReportUpdated(payload));
    } else {
      dispatch(fetchReport(payload));
    }
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
          {billType === ONLINE_OPD ? (
            <TransactionsTable
              data={transactions}
              total={total}
              grandTotal={grandTotal}
              refundTotal={refundTotal}
              totalPages={totalPages}
              page={page}
              onPageChange={(p) => {
                setPage(p);
                fetchTransactions(p);
              }}
              onExportCSV={handleExportCSV}
              exportLoading={exportLoading}
            />
          ) : (
            <>
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
            </>
          )}
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
  transactions: state.Report.transactions,
  total: state.Report.total,
  grandTotal: state.Report.grandTotal,
  refundTotal: state.Report.refundTotal,
  totalPages: state.Report.totalPages,
  currentPage: state.Report.currentPage,
  limit: state.Report.limit,
});

export default connect(mapStateToProps)(Report);
