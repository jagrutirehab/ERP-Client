import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import DataTable from "react-data-table-component";
import { Button } from "reactstrap";

const TransactionsTable = ({
  data,
  total,
  grandTotal,
  refundTotal,
  totalPages,
  page,
  onPageChange,
  onExportCSV,
  exportLoading,
}) => {
  const columns = [
    {
      name: "#",
      selector: (row, idx) => idx + 1,
      maxWidth: "70px",
      minWidth: "70px",
    },
    {
      name: "Date",
      selector: (row) =>
        row.startDate ? format(new Date(row.startDate), "d MMM yyyy hh:mm a") : "",
      wrap: true,
      minWidth: "170px",
    },
    {
      name: "Patient",
      selector: (row) => row.patient?.name || "",
      wrap: true,
      style: { textTransform: "capitalize" },
    },
    {
      name: "UID",
      selector: (row) =>
        row.patient?.id
          ? `${row.patient.id.prefix}${row.patient.id.value}`
          : "",
    },
    {
      name: "Doctor",
      selector: (row) => row.doctor?.name || "",
      wrap: true,
      style: { textTransform: "capitalize" },
    },
    {
      name: "Center",
      selector: (row) => row.center?.title || "",
      wrap: true,
    },
    {
      name: "Amount",
      selector: (row) => row.transactionId?.booking_price ?? "",
    },
    {
      name: "Payment Method",
      selector: (row) => row.transactionId?.payment_method?.toUpperCase() || "",
    },
    {
      name: "Payment Status",
      selector: (row) => row.transactionId?.payment_Status || "",
    },
    {
      name: "Payment ID",
      selector: (row) => row.transactionId?.razorpay_payment_id || "",
      wrap: true,
    },
  ];

  return (
    <React.Fragment>
      <div className="p-4 mt-3 shadow bg-body rounded">
        <div className="d-flex flex-wrap justify-content-between justify-content-md-around">
          <div className="d-flex align-items-center">
            <h6 className="display-6 fs-6">TOTAL TRANSACTIONS: </h6>
            <h5 className="display-5 ms-2 fs-17 font-semi-bold">{total || 0}</h5>
          </div>
          <div className="d-flex align-items-center">
            <h6 className="display-6 fs-6">TOTAL AMOUNT (₹): </h6>
            <h5 className="display-5 ms-2 fs-17 font-semi-bold">
              {grandTotal || 0}
            </h5>
          </div>
          <div className="d-flex align-items-center">
            <h6 className="display-6 fs-6">TOTAL REFUND AMOUNT (₹): </h6>
            <h5 className="display-5 ms-2 fs-17 font-semi-bold text-danger">
              {refundTotal || 0}
            </h5>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <Button color="info" onClick={onExportCSV} disabled={exportLoading}>
          {exportLoading ? "Preparing CSV..." : <i className="ri-file-paper-2-line text-light text-decoration-none"></i>}
        </Button>
      </div>

      <div className="table-responsive-sm h-auto table-card mt-3 mb-1 px-3 overflow-auto">
        <DataTable
          fixedHeader
          columns={columns}
          data={data?.map((d) => ({ ...d, id: d._id })) || []}
          highlightOnHover
        />
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button disabled={page <= 1} onClick={() => onPageChange(Math.max(page - 1, 1))}>
          Prev
        </Button>
        <span>
          Page {page} of {totalPages || 1}
        </span>
        <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </React.Fragment>
  );
};

TransactionsTable.propTypes = {
  data: PropTypes.array,
  total: PropTypes.number,
  grandTotal: PropTypes.number,
  refundTotal: PropTypes.number,
  totalPages: PropTypes.number,
  page: PropTypes.number,
  onPageChange: PropTypes.func,
  onExportCSV: PropTypes.func,
  exportLoading: PropTypes.bool,
};

export default TransactionsTable;
