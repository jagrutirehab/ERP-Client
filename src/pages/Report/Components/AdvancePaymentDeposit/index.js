import { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Spinner } from "reactstrap";
import {
  getAdvancePaymentDepositAnalytics,
  exportAdvancePaymentDepositCSV,
} from "../../../../helpers/backend_helper";
import Divider from "../../../../Components/Common/Divider";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { endOfDay, format, startOfDay } from "date-fns";
import Header from "./Header";
import { capitalizeWords } from "../../../../utils/toCapitalize";

const AdvancePaymentDeposit = ({ centers, centerAccess }) => {
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    if (centerOptions && centerOptions?.length > 0) {
      setSelectedCentersIds(centerOptions.map((c) => c._id));
    }
  }, [centerOptions]);

  const fetchData = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await getAdvancePaymentDepositAnalytics({
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        centerAccess: selectedCentersIds,
        page,
        limit,
      });

      setData(res?.payload || []);
      setTotalRows(res?.total || 0);
    } catch (err) {
      console.error("Failed to fetch advance payment data", err);
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, perPage);
  }, [currentPage, perPage]);

  // Manual trigger for View Report button - resets to page 1
  const handleViewReport = () => {
    setCurrentPage(1);
    fetchData(1, perPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  // CSV Export Handler
  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      const response = await exportAdvancePaymentDepositCSV({
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        centerAccess: selectedCentersIds,
      });

      // Create blob from response
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `advance_payment_deposit_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV", err);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, idx) => (currentPage - 1) * perPage + idx + 1,
      width: "60px",
      sortable: false,
    },
    {
      name: "Patient Name",
      selector: (row) => capitalizeWords(row.patient?.name) || "-",
      sortable: false,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: "UID",
      selector: (row) => row.patient?.id?.value || "-",
      sortable: false,
    },
    {
      name: "Center",
      selector: (row) =>
        capitalizeWords(row.center?.title || row.center) || "-",
      sortable: false,
      wrap: true,
    },
    {
      name: "Receipt No",
      selector: (row) =>
        row.id ? `${row.id.prefix}${row.id.patientId}-${row.id.value}` : "-",
      sortable: false,
      wrap: true,
    },
    {
      name: "Advance Payment Date",
      selector: (row) =>
        row.date ? format(new Date(row.date), "d MMM yyyy") : "-",
      sortable: false,
      wrap: true,
      minWidth: "180px",
    },
    {
      name: "Total Amount (INR)",
      selector: (row) =>
        row.advancePayment?.totalAmount
          ? `${row.advancePayment.totalAmount.toLocaleString()}`
          : "0",
      sortable: false,
      // right: true,
      minWidth: "160px",
    },
    {
      name: "Payment Modes",
      selector: (row) =>
        row.advancePayment?.paymentModes
          ? row.advancePayment.paymentModes.map((p) => p.paymentMode).join(", ")
          : "-",
      sortable: false,
      wrap: true,
      minWidth: "180px",
    },
    // {
    //   name: "Remarks",
    //   selector: (row) => row.advancePayment?.remarks || "-",
    //   sortable: false,
    //   wrap: true,
    //   minWidth: "150px",
    // },
  ];

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
                totalRows || 0
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
            onExportCSV={handleExportCSV}
            loading={loading || exportLoading}
          />

          <Divider />
          {loading && data.length === 0 ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : (
            <DataTable
              fixedHeader
              columns={columns}
              data={data || []}
              highlightOnHover
              noHeader
              pagination
              paginationServer
              paginationTotalRows={totalRows}
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

AdvancePaymentDeposit.propTypes = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(AdvancePaymentDeposit);
