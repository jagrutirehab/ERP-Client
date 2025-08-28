import React from "react";
import { format } from "date-fns";
import {
  ADDMISSION_DATE,
  ADVANCE_PAYMENT,
  DISCHARGE_DATE,
  DUE_AMOUNT,
  INVOICE,
  OPD_BILL,
  INTERN,
} from "./data";
import DataTable from "react-data-table-component";
import { OPD } from "../../../../Components/constants/patient";

const Table = ({ data, billType, sortByDate, patientsReferrel }) => {
  const date = (row) => {
    if (row.date) {
      return format(new Date(row.date), "dd MMM yyyy");
    }
    if (
      sortByDate === ADDMISSION_DATE &&
      row.patient?.addmission?.addmissionDate
    ) {
      return format(
        new Date(row.patient.addmission.addmissionDate),
        "dd MMM yyyy"
      );
    }
    if (
      sortByDate === DISCHARGE_DATE &&
      row.patient?.addmission?.dischargeDate
    ) {
      return format(
        new Date(row.patient.addmission.dischargeDate),
        "dd MMM yyyy"
      );
    }
    return "";
  };

  const columns = [
    {
      name: "#",
      selector: (row, idx) => idx + 1,
      maxWidth: "80px",
      minWidth: "80px",
    },
    billType !== DUE_AMOUNT
      ? {
          name: "Type",
          selector: (row) => row.bill || row.type || "",
          maxWidth: "100px",
          minWidth: "100px",
        }
      : null,
    {
      name: "Center",
      selector: (row) => row.center?.title || "",
      maxWidth: "130px",
      minWidth: "130px",
    },
    {
      name:
        billType === DUE_AMOUNT && sortByDate === ADDMISSION_DATE
          ? "Admission Date"
          : billType === DUE_AMOUNT && sortByDate === DISCHARGE_DATE
          ? "Discharge Date"
          : "Date",
      selector: (row) => date(row),
      maxWidth: "130px",
      minWidth: "130px",
    },
    billType !== DUE_AMOUNT &&
    billType !== OPD_BILL &&
    billType !== INTERN &&
    sortByDate === ADDMISSION_DATE
      ? {
          name: "Admission Date",
          selector: (row) =>
            row.patient?.addmission?.addmissionDate
              ? format(
                  new Date(row.patient.addmission.addmissionDate),
                  "dd MMM yyyy"
                )
              : "",
        }
      : null,
    billType !== DUE_AMOUNT &&
    billType !== OPD_BILL &&
    billType !== INTERN &&
    sortByDate === DISCHARGE_DATE
      ? {
          name: "Discharge Date",
          selector: (row) =>
            row.patient?.addmission?.dischargeDate
              ? format(
                  new Date(row.patient.addmission.dischargeDate),
                  "dd MMM yyyy"
                )
              : "",
        }
      : null,
    {
      name: "Patient/Intern",
      selector: (row) =>
        row.intern ? row.intern.name : row.patient?.name || "",
      wrap: true,
      maxWidth: "150px",
      minWidth: "150px",
    },
    {
      name: "UID",
      selector: (row) =>
        row.intern && row.id?.value
          ? row.id.value
          : row.patient?.id
          ? `${row.patient.id.prefix}${row.patient.id.value}`
          : "",
      wrap: true,
      maxWidth: "100px",
      minWidth: "100px",
    },
    patientsReferrel
      ? {
          name: "Referred By",
          selector: (row) => row.patient?.referredBy || "",
        }
      : null,
    billType !== DUE_AMOUNT
      ? {
          name: "Invoice No",
          selector: (row) =>
            row.key
              ? `${row.key.prefix}${row.key.patientId}-${row.key.value}`
              : "",
        }
      : null,
    billType !== DUE_AMOUNT && billType !== ADVANCE_PAYMENT
      ? {
          name: "Invoiced Amount",
          selector: (row) => {
            if (row.intern && row.receipt) {
              return (
                row.receipt.totalAmount ??
                row.invoice?.payable ??
                row.receiptInvoice?.payable ??
                ""
              );
            }
            return row.invoice?.payable ?? row.receiptInvoice?.payable ?? "";
          },
        }
      : null,
    billType !== DUE_AMOUNT && billType !== INVOICE
      ? {
          name: "Payment Modes",
          selector: (row) => {
            if (row.intern && row.receipt?.paymentModes) {
              return row.receipt.paymentModes
                .map((payment) =>
                  `${payment?.paymentMode || ""} ${payment?.bankName || ""} ${
                    payment?.transactionId || ""
                  } ${payment?.chequeNumber || ""} ${
                    payment?.cardNumber || ""
                  }`.trim()
                )
                .filter(Boolean)
                .join("\n");
            }
            if (row.type === OPD && row.receiptInvoice?.paymentModes) {
              return row.receiptInvoice.paymentModes
                .map((payment) =>
                  `${payment?.type || ""} ${payment?.bankName || ""} ${
                    payment?.transactionId || ""
                  } ${payment?.chequeNumber || ""} ${
                    payment?.cardNumber || ""
                  }`.trim()
                )
                .filter(Boolean)
                .join("\n");
            }
            if (row.deposit?.paymentModes) {
              return row.deposit.paymentModes
                .map((payment) =>
                  `${payment.paymentMode || ""} ${payment.bankName || ""} ${
                    payment.chequeNumber || ""
                  } ${payment.cardNumber || ""}`.trim()
                )
                .filter(Boolean)
                .join("\n");
            }
            if (row.advancePayment?.paymentModes) {
              return row.advancePayment.paymentModes
                .map((payment) =>
                  `${payment.paymentMode || ""} ${payment.bankName || ""} ${
                    payment.chequeNumber || ""
                  } ${payment.cardNumber || ""}`.trim()
                )
                .filter(Boolean)
                .join("\n");
            }
            return "";
          },
        }
      : null,
    billType !== DUE_AMOUNT && billType !== INVOICE
      ? {
          name: "Paid Amount",
          selector: (row) =>
            row.intern && row.receipt
              ? row.receipt.totalAmount
              : row.type === OPD
              ? row.receiptInvoice?.payable || ""
              : row.deposit
              ? row.deposit.totalAmount || ""
              : row.advancePayment
              ? row.advancePayment.totalAmount || ""
              : "",
        }
      : null,
    billType === DUE_AMOUNT
      ? {
          name: "Total Invoiced Amount",
          selector: (row) => row.totalPayable || "",
        }
      : null,
    billType === DUE_AMOUNT
      ? {
          name: "Total Paid Amount",
          selector: (row) => row.totalAdvancePayment || "",
        }
      : null,
    billType === DUE_AMOUNT
      ? {
          name: "Total Due Amount",
          selector: (row) => row.dueAmount || "",
          style: {
            color: "red",
            fontWeight: "bold",
          },
        }
      : null,
  ];

  return (
    <React.Fragment>
      <div>
        <div className="table-auto mt-5">
          <div className="table-responsive-sm h-auto table-card mt- mb-1 px-3 overflow-auto">
            <DataTable
              fixedHeader
              columns={columns.filter((c) => c !== null)}
              data={data?.map((d) => ({ ...d, id: d._id })) || []}
              highlightOnHover
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Table;
