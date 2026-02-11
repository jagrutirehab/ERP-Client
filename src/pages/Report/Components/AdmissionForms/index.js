import { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Spinner } from "reactstrap";
import Divider from "../../../../Components/Common/Divider";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { endOfDay, format, startOfDay } from "date-fns";
import Header from "./Header";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { fetchAdmissionForms } from "../../../../store/actions";

const AdmissionForms = ({
  centers,
  centerAccess,
  admissionForms,
  loading,
  total,
  totalPages,
  currentPage,
  limit,
  dispatch,
}) => {
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // Center selection state
  const [centerOptions, setCenterOptions] = useState(
    centers
      ?.filter((c) => centerAccess.includes(c._id))
      .map((c) => ({
        _id: c._id,
        title: c.title,
      })),
  );
  const [selectedCentersIds, setSelectedCentersIds] = useState(
    centerOptions?.map((c) => c._id) || [],
  );

  useEffect(() => {
    setCenterOptions(
      centers
        ?.filter((c) => centerAccess.includes(c._id))
        .map((c) => ({
          _id: c._id,
          title: c.title,
        })),
    );
  }, [centerAccess, centers]);

  // Update selected centers when centerOptions change
  useEffect(() => {
    if (centerOptions && centerOptions?.length > 0) {
      setSelectedCentersIds(centerOptions.map((c) => c._id));
    }
  }, [centerOptions]);

  const fetchData = (pageNum = 1, limitNum = 10) => {
    console.log({ selectedCentersIds });

    dispatch(
      fetchAdmissionForms({
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        centerAccess: selectedCentersIds,
        page: pageNum,
        limit: limitNum,
      }),
    );
  };

  useEffect(() => {
    fetchData(page, perPage);
  }, [page, perPage]);

  // Manual trigger for View Report button - resets to page 1
  const handleViewReport = () => {
    setPage(1);
    fetchData(1, perPage);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const columns = [
    {
      name: "#",
      selector: (row, idx) => (page - 1) * perPage + idx + 1,
      width: "60px",
      sortable: false,
    },
    {
      name: "Patient Name",
      selector: (row) => capitalizeWords(row.patientName) || "-",
      sortable: false,
      wrap: true,
      maxWidth: "150px",
      minWidth: "150px",
    },
    {
      name: "UID",
      selector: (row) => row.uid || "-",
      sortable: false,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Admission Date",
      selector: (row) =>
        row.admissionDate
          ? format(new Date(row.admissionDate), "d MMM yyyy")
          : "-",
      sortable: false,
      wrap: true,
      maxWidth: "140px",
      minWidth: "140px",
    },
    {
      name: "Discharge Date",
      selector: (row) =>
        row.dischargeDate
          ? format(new Date(row.dischargeDate), "d MMM yyyy")
          : "-",
      sortable: false,
      wrap: true,
      maxWidth: "140px",
      minWidth: "140px",
    },
    {
      name: "Admission Form",
      selector: (row) => (row.admissionFormUploaded ? "Yes" : "No"),
      sortable: false,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Consent Form",
      selector: (row) => (row.consentFormUploaded ? "Yes" : "No"),
      sortable: false,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Discharge Form",
      selector: (row) => (row.dischargeFormUploaded ? "Yes" : "No"),
      sortable: false,
      wrap: true,
      maxWidth: "140px",
      minWidth: "140px",
    },
    {
      name: "Undertaking Discharge Form",
      selector: (row) => (row.undertakingDischargeFormUploaded ? "Yes" : "No"),
      sortable: false,
      wrap: true,
      maxWidth: "200px",
      minWidth: "200px",
    },
    {
      name: "Room Type",
      selector: (row) => row.roomType || "-",
      sortable: false,
      wrap: true,
      maxWidth: "120px",
      minWidth: "120px",
    },
    {
      name: "Price (Monthly)",
      selector: (row) =>
        row.priceForSelectedRoomMonthly
          ? `${row.priceForSelectedRoomMonthly.toLocaleString()}`
          : "0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "150px",
      minWidth: "150px",
    },
    {
      name: "Price (Daily)",
      selector: (row) =>
        row.priceForSelectedRoomDaily
          ? `${row.priceForSelectedRoomDaily.toLocaleString()}`
          : "0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Refundable Advance Deposit",
      selector: (row) =>
        row.willingToPayRefundableAdvanceDeposit
          ? `${row.willingToPayRefundableAdvanceDeposit.toLocaleString()}`
          : "0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "200px",
      minWidth: "200px",
    },
  ];

  console.log({ admissionForms });

  return (
    <>
      <div className="pt-4">
        <div className="bg-white p-2 m-n3">
          <div className="">
            <h6 className="display-6 fs-6 my-3">
              Total Records:{" "}
              {loading ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "18px",
                    borderRadius: "4px",
                    background:
                      "linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "skeletonShimmer 1.2s infinite",
                    verticalAlign: "middle",
                  }}
                ></span>
              ) : (
                total || 0
              )}
              <style>
                {`
                 @keyframes skeletonShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
               `}
              </style>
            </h6>
          </div>
          <Header
            reportDate={reportDate}
            setReportDate={setReportDate}
            centerOptions={centerOptions}
            selectedCentersIds={selectedCentersIds}
            setSelectedCentersIds={setSelectedCentersIds}
            onViewReport={handleViewReport}
            loading={loading}
          />

          <Divider />
          {loading && (!admissionForms || admissionForms.length === 0) ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : (
            <DataTable
              fixedHeader
              columns={columns}
              data={admissionForms || []}
              highlightOnHover
              noHeader
              pagination
              paginationServer
              paginationTotalRows={total}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              paginationPerPage={perPage}
              paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
              progressPending={loading}
              progressComponent={
                <div className="text-center py-4">
                  <Spinner color="primary" />
                </div>
              }
            />
          )}
        </div>
      </div>
    </>
  );
};

AdmissionForms.propTypes = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
  admissionForms: PropTypes.array,
  loading: PropTypes.bool,
  total: PropTypes.number,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  limit: PropTypes.number,
  dispatch: PropTypes.func,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  admissionForms: state.Report.admissionForms,
  loading: state.Report.loading,
  total: state.Report.total,
  totalPages: state.Report.totalPages,
  currentPage: state.Report.currentPage,
  limit: state.Report.limit,
});

export default connect(mapStateToProps)(AdmissionForms);
