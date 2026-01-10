import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Spinner } from "reactstrap";
import { getFinanceAnalytics } from "../../../../helpers/backend_helper";
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getFinanceAnalytics({
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        centerAccess: selectedCentersIds,
      });

      // Backend returns { success: true, payload: [...] }
      setData(res?.payload || []);
    } catch (err) {
      console.error("Failed to fetch finance analytics", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Manual trigger for View Report button
  const handleViewReport = () => {
    fetchData();
  };

  const columns = [
    {
      name: "#",
      selector: (row, idx) => idx + 1,
      width: "60px",
      sortable: false,
    },
    {
      name: "Patient Name",
      selector: (row) => capitalizeWords(row.patient?.name) || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Center",
      selector: (row) => capitalizeWords(row.center) || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "UID",
      selector: (row) => row.patient?.id?.value || "-",
      sortable: true,
    },
    {
      name: "Admission Date",
      selector: (row) =>
        row.addmissionDate
          ? format(new Date(row.addmissionDate), "d MMM yyyy")
          : "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Discharge Date",
      selector: (row) =>
        row.dischargeDate
          ? format(new Date(row.dischargeDate), "d MMM yyyy")
          : "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Total Invoiced",
      selector: (row) =>
        row.totalInvoicedAmount
          ? `₹${row.totalInvoicedAmount.toLocaleString()}`
          : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Total Paid",
      selector: (row) =>
        row.totalPaidAmount ? `₹${row.totalPaidAmount.toLocaleString()}` : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Total Deposit",
      selector: (row) =>
        row.totalDeposit ? `₹${row.totalDeposit.toLocaleString()}` : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Total Draft",
      selector: (row) =>
        row.totalDraftAmount && row.totalDraftAmount !== "0"
          ? `₹${row.totalDraftAmount.toLocaleString()}`
          : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Total Refund",
      selector: (row) =>
        row.totalRefundAmount
          ? `₹${row.totalRefundAmount.toLocaleString()}`
          : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Total Discount",
      selector: (row) =>
        row.totalDiscountAmount
          ? `₹${row.totalDiscountAmount.toLocaleString()}`
          : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Room Price (Monthly)",
      selector: (row) =>
        row.priceForSelectedRoomMonthly &&
        row.priceForSelectedRoomMonthly !== "0"
          ? `₹${row.priceForSelectedRoomMonthly.toLocaleString()}`
          : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Room Price (Daily)",
      selector: (row) =>
        row.priceForSelectedRoomDaily && row.priceForSelectedRoomDaily !== "0"
          ? `₹${row.priceForSelectedRoomDaily.toLocaleString()}`
          : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Invoice (Date Range)",
      selector: (row) =>
        row.invoiceAmountInDateRange
          ? `₹${row.invoiceAmountInDateRange.toLocaleString()}`
          : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Paid (Date Range)",
      selector: (row) =>
        row.paidAmountInDateRange
          ? `₹${row.paidAmountInDateRange.toLocaleString()}`
          : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Due Amount",
      selector: (row) =>
        row.dueAmount ? `₹${row.dueAmount.toLocaleString()}` : "₹0",
      sortable: true,
      right: true,
    },
    {
      name: "Bill Cycle Date",
      selector: (row) =>
        row.billCycleDate
          ? format(new Date(row.billCycleDate), "d MMM yyyy")
          : "-",
      sortable: true,
      wrap: true,
    },
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
                data?.length || 0
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
          {loading ? (
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
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
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
