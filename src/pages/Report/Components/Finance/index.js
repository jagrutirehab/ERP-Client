import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Spinner } from "reactstrap";
import {
  getFinanceAnalytics,
  exportFinanceAnalyticsCSV,
} from "../../../../helpers/backend_helper";
import Divider from "../../../../Components/Common/Divider";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { endOfDay, format, startOfDay } from "date-fns";
import Header from "./Header";
import { capitalizeWords } from "../../../../utils/toCapitalize";

const Finance = ({ centers, centerAccess }) => {
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
  const centerOptions = centers
    ?.filter((c) => centerAccess.includes(c._id))
    .map((c) => ({
      _id: c._id,
      title: c.title,
    }));

  const [selectedCentersIds, setSelectedCentersIds] = useState(
    centerOptions?.map((c) => c._id) || []
  );

  // Update selected centers when centerOptions change
  useEffect(() => {
    if (
      centerOptions &&
      centerOptions.length > 0 &&
      selectedCentersIds.length === 0
    ) {
      setSelectedCentersIds(centerOptions.map((c) => c._id));
    }
  }, [centerOptions]);

  const fetchData = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await getFinanceAnalytics({
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        centerAccess: selectedCentersIds,
        page,
        limit,
      });

      // Backend returns { success: true, payload: [...], total, totalPages, currentPage, limit }
      setData(res?.payload || []);
      setTotalRows(res?.total || 0);
    } catch (err) {
      console.error("Failed to fetch finance analytics", err);
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
    // When changing rows per page, it's safer to reset to page 1 or keep current if logic allows,
    // but typically we might just fetch the new page.
    // DataTable's behavior usually prefers keeping the offset but simpler to just reload.
    // The `page` argument here is the new page (usually the current one or adjusted).
    setCurrentPage(page);
  };

  // CSV Export Handler
  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      const response = await exportFinanceAnalyticsCSV({
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        centerAccess: selectedCentersIds,
      });

      console.log({ response });

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
        `financial-report-${new Date().toISOString().split("T")[0]}.csv`
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
      sortable: false, // Server-side sorting not fully implemented for all columns yet
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Center",
      selector: (row) => capitalizeWords(row.center) || "-",
      sortable: false,
      wrap: true,
    },
    {
      name: "UID",
      selector: (row) => row.patient?.id?.value || "-",
      sortable: false,
    },
    {
      name: "Admission Date",
      selector: (row) =>
        row.addmissionDate
          ? format(new Date(row.addmissionDate), "d MMM yyyy")
          : "-",
      sortable: false,
      wrap: true,
      maxWidth: "150px",
      minWidth: "150px",
    },
    {
      name: "Discharge Date",
      selector: (row) =>
        row.dischargeDate
          ? format(new Date(row.dischargeDate), "d MMM yyyy")
          : "-",
      sortable: false,
      wrap: true,
      maxWidth: "150px",
      minWidth: "150px",
    },
    {
      name: "Total Invoiced",
      selector: (row) =>
        row.totalInvoicedAmount
          ? `₹${row.totalInvoicedAmount.toLocaleString()}`
          : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Total Paid",
      selector: (row) =>
        row.totalPaidAmount ? `₹${row.totalPaidAmount.toLocaleString()}` : "₹0",
      sortable: false,
      right: true,
      wrap: true,
    },
    {
      name: "Total Deposit",
      selector: (row) =>
        row.totalDeposit ? `₹${row.totalDeposit.toLocaleString()}` : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Total Draft",
      selector: (row) =>
        row.totalDraftAmount && row.totalDraftAmount !== "0"
          ? `₹${row.totalDraftAmount.toLocaleString()}`
          : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Total Refund",
      selector: (row) =>
        row.totalRefundAmount
          ? `₹${row.totalRefundAmount.toLocaleString()}`
          : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Total Discount",
      selector: (row) =>
        row.totalDiscountAmount
          ? `₹${row.totalDiscountAmount.toLocaleString()}`
          : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "150px",
      minWidth: "150px",
    },
    {
      name: "Room Price (Monthly)",
      selector: (row) =>
        row.priceForSelectedRoomMonthly &&
        row.priceForSelectedRoomMonthly !== "0"
          ? `₹${row.priceForSelectedRoomMonthly.toLocaleString()}`
          : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "180px",
      minWidth: "180px",
    },
    {
      name: "Room Price (Daily)",
      selector: (row) =>
        row.priceForSelectedRoomDaily && row.priceForSelectedRoomDaily !== "0"
          ? `₹${row.priceForSelectedRoomDaily.toLocaleString()}`
          : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "180px",
      minWidth: "180px",
    },
    {
      name: "Invoice (Date Range)",
      selector: (row) =>
        row.invoiceAmountInDateRange
          ? `₹${row.invoiceAmountInDateRange.toLocaleString()}`
          : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "170px",
      minWidth: "170px",
    },
    {
      name: "Paid (Date Range)",
      selector: (row) =>
        row.paidAmountInDateRange
          ? `₹${row.paidAmountInDateRange.toLocaleString()}`
          : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "150px",
      minWidth: "150px",
    },
    {
      name: "Due Amount",
      selector: (row) =>
        row.dueAmount ? `₹${row.dueAmount.toLocaleString()}` : "₹0",
      sortable: false,
      right: true,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name: "Bill Cycle Date",
      selector: (row) =>
        row.billCycleDate
          ? format(new Date(row.billCycleDate), "d MMM yyyy")
          : "-",
      sortable: false,
      wrap: true,
      maxWidth: "130px",
      minWidth: "130px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
    header: {
      style: {
        minHeight: "56px",
      },
    },
    headRow: {
      style: {
        // Allows the header row to expand vertically
        height: "auto",
        minHeight: "56px",
      },
    },
    cells: {
      style: {
        // Optional: wrap cell content too
        whiteSpace: "normal",
      },
    },
  };

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
              // customStyles={customStyles}
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

Finance.propTypes = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Finance);
