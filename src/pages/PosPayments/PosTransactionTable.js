import React from "react";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import { Badge, Button, Spinner } from "reactstrap";
import { format } from "date-fns";

const STATUS_COLOR = {
  APPROVED: "success",
  FAILED: "danger",
  CANCELLED: "secondary",
  TIMEOUT: "warning",
  UNKNOWN: "danger",
  INITIATED: "info",
  PENDING: "info",
};

// Shown under the status for anything that did not simply succeed — otherwise
// a decline and a timeout look identical in the list.
const SHOW_REASON_FOR = ["FAILED", "CANCELLED", "TIMEOUT", "UNKNOWN"];

const customStyles = {
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: "600",
      backgroundColor: "#f8f9fa",
      color: "#495057",
    },
  },
  cells: { style: { fontSize: "13px", paddingTop: "8px", paddingBottom: "8px" } },
};

const formatWhen = (value) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM, HH:mm");
  } catch {
    return "—";
  }
};

const isReversal = (row) => row.purpose === "REVERSAL";

// What the charge was collected on, as the cashier would name it.
const PURPOSE_LABEL = {
  DEPOSIT: "Deposit",
  ADVANCE_PAYMENT: "Advance Payment",
  INVOICE: "Invoice",
  REVERSAL: "Refund",
};

/**
 * The dashboard table.
 *
 * Paging is server-side: this never holds more than one page, so the row
 * count is whatever the API returned and `totalRows` comes from the query, not
 * from `rows.length`.
 */
const PosTransactionTable = ({
  rows,
  loading,
  emptyText,
  onRefund,
  showRefund,
  onCreateBill,
  totalRows,
  page,
  perPage,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const columns = [
    {
      name: "When",
      width: "120px",
      selector: (row) => row.createdAt,
      cell: (row) => formatWhen(row.createdAt),
    },
    {
      name: "Patient",
      wrap: true,
      selector: (row) => row.patient?.name || "—",
      cell: (row) => (
        <div>
          <div>{row.patient?.name || "—"}</div>
          {row.patient?.id?.value && (
            <div className="text-muted fs-11">
              {`${row.patient.id.prefix || ""}${row.patient.id.value}`}
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Centre / Terminal",
      wrap: true,
      cell: (row) => (
        <div>
          <div>{row.center?.name || row.center?.title || "—"}</div>
          {row.terminal?.label && (
            <div className="text-muted fs-11">{row.terminal.label}</div>
          )}
        </div>
      ),
    },
    {
      name: "For",
      minWidth: "150px",
      wrap: true,
      cell: (row) => (
        <div className="py-1">
          <div>{PURPOSE_LABEL[row.purpose] || row.purpose || "—"}</div>
          {row.paymentAgainstBillNo && (
            <div className="text-muted fs-11">
              vs {row.paymentAgainstBillNo}
            </div>
          )}
          {row.billType && (
            <div className="text-muted fs-11">{row.billType}</div>
          )}
        </div>
      ),
    },
    {
      name: "Mode",
      width: "90px",
      selector: (row) => row.result?.paymentMode || row.requestedMode || "—",
    },
    {
      name: "Amount",
      width: "110px",
      right: true,
      cell: (row) => (
        <span className="fw-semibold">
          {isReversal(row) ? (
            <span className="text-danger">−₹{row.amount}</span>
          ) : (
            <>₹{row.amount}</>
          )}
        </span>
      ),
    },
    {
      name: "Status",
      minWidth: "200px",
      wrap: true,
      cell: (row) => (
        <div className="py-1">
          <Badge color={STATUS_COLOR[row.status] || "secondary"}>
            {row.status}
          </Badge>
          {/* A stand-in charge took no money. Without saying so it reads
              exactly like a real one. */}
          {row.isMock && (
            <Badge color="warning" className="ms-1" title="Test charge — no money was taken">
              TEST
            </Badge>
          )}
          {isReversal(row) && (
            <Badge color="dark" className="ms-1">
              {row.reversalKind || "REFUND"}
            </Badge>
          )}
          {SHOW_REASON_FOR.includes(row.status) && row.responseMessage && (
            <div className="text-muted fs-11 mt-1" title={row.responseMessage}>
              {row.responseMessage}
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Billed",
      width: "110px",
      cell: (row) => {
        if (isReversal(row)) return <span className="text-muted">—</span>;
        return (
          <div className="py-1">
            {row.consumed ? (
              <Badge color="success">Yes</Badge>
            ) : row.status === "APPROVED" ? (
              <Badge color="danger">No</Badge>
            ) : (
              <span className="text-muted">—</span>
            )}
            {row.detachedFromBill?.at && (
              <div className="text-muted fs-11 mt-1">bill deleted</div>
            )}
          </div>
        );
      },
    },
    {
      name: "Reference",
      minWidth: "190px",
      wrap: true,
      cell: (row) => (
        <div className="py-1 fs-11">
          <div>{row.transactionNumber}</div>
          {row.result?.rrn && (
            <div className="text-muted">RRN {row.result.rrn}</div>
          )}
          {row.plutusTransactionReferenceId && (
            <div className="text-muted">
              PTRID {row.plutusTransactionReferenceId}
            </div>
          )}
        </div>
      ),
    },
    {
      name: "",
      width: "190px",
      right: true,
      cell: (row) => {
        if (row.reversedBy)
          return <span className="text-muted fs-11">Reversed</span>;
        if (row.status !== "APPROVED" || isReversal(row)) return null;

        return (
          <div className="d-flex gap-1 justify-content-end">
            {/* The terminal took this money and nothing recorded it — most
                often an ERP crash mid-transaction. Raising the deposit here
                is the recovery, and needs no re-charge. */}
            {!row.consumed && (
              <Button
                size="sm"
                color="primary"
                onClick={() => onCreateBill(row)}
                title="Open this patient's deposit form, pre-filled"
              >
                Bill it
              </Button>
            )}
            {showRefund && (
              <Button
                size="sm"
                outline
                color="danger"
                onClick={() => onRefund(row)}
              >
                Refund
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="border">
      <DataTable
        columns={columns}
        data={rows || []}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationDefaultPage={page}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 25, 50, 100, 200]}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        progressPending={loading}
        progressComponent={
          <div className="py-4">
            <Spinner color="primary" />
          </div>
        }
        noDataComponent={<div className="py-4 text-muted">{emptyText}</div>}
        highlightOnHover
        dense
        customStyles={customStyles}
      />
    </div>
  );
};

PosTransactionTable.propTypes = {
  rows: PropTypes.array,
  loading: PropTypes.bool,
  emptyText: PropTypes.string,
  onRefund: PropTypes.func,
  showRefund: PropTypes.bool,
  onCreateBill: PropTypes.func,
  totalRows: PropTypes.number,
  page: PropTypes.number,
  perPage: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
};

export default PosTransactionTable;
