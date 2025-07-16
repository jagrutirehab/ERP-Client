import React from "react";
import { format } from "date-fns";
import {
  ADDMISSION_DATE,
  ADVANCE_PAYMENT,
  DISCHARGE_DATE,
  DISCHARGE_PATIENT,
  DUE_AMOUNT,
  INVOICE,
  OPD_BILL,
} from "./data";
import DataTable from "react-data-table-component";
import { DEPOSIT, OPD } from "../../../../Components/constants/patient";

const Table = ({
  data,
  billType,
  sortByDate,
  sortPatientStatus,
  patientsReferrel,
  diagnosisCol,
}) => {
  const date = (item) =>
    billType !== DUE_AMOUNT && item.date
      ? format(new Date(item?.date), "dd MMM yyyy")
      : sortByDate === ADDMISSION_DATE
      ? item.patient?.addmission?.addmissionDate &&
        format(new Date(item.patient.addmission.addmissionDate), "dd MMM yyyy")
      : sortByDate === DISCHARGE_DATE
      ? item.patient?.addmission?.dischargeDate &&
        format(new Date(item.patient.addmission.dischargeDate), "dd MMM yyyy")
      : "";

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
          selector: (row) => row.type,
          maxWidth: "100px",
          minWidth: "100px",
        }
      : null,
    {
      name: "Center",
      selector: (row) => row.center?.title || row.patient?.center?.title,
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
    sortByDate === ADDMISSION_DATE
      ? {
          name: "Addmission Date",
          selector: (row) =>
            row.patient?.addmission?.addmissionDate
              ? format(
                  new Date(row.patient?.addmission?.addmissionDate),
                  "dd MMM yyyy"
                )
              : "",
        }
      : null,
    billType !== DUE_AMOUNT &&
    billType !== OPD_BILL &&
    sortByDate === DISCHARGE_DATE
      ? {
          name: "Discharge Date",
          selector: (row) =>
            row.patient?.addmission?.dischargeDate
              ? format(
                  new Date(row.patient?.addmission?.dischargeDate),
                  "dd MMM yyyy"
                )
              : "",
        }
      : null,
    // billType === DUE_AMOUNT && sortPatientStatus === DISCHARGE_PATIENT
    //   ? {
    //       name: "Discharge Date",
    //       selector: (row) =>
    //         row?.addmission?.dischargeDate
    //           ? format(new Date(row.addmission.dischargeDate), "dd MMM yyyy")
    //           : "",
    //     }
    //   : null,
    {
      name: "Patient",
      selector: (row) => row.patient?.name,
      wrap: true,
      maxWidth: "150px",
      minWidth: "150px",
    },
    {
      name: "UID",
      selector: (row) => `${row.patient?.id?.prefix}${row.patient?.id?.value}`,
      wrap: true,
      maxWidth: "100px",
      minWidth: "100px",
    },
    patientsReferrel
      ? {
          name: "Referred By",
          selector: (row) => row.patient?.referredBy,
        }
      : null,
    billType !== DUE_AMOUNT
      ? {
          name: "Invoice No",
          selector: (row) =>
            `${row.key?.prefix}${row.key?.patientId}-${row.key?.value}`,
        }
      : null,

    //ALL TREANSACTIONS
    billType !== DUE_AMOUNT && billType !== ADVANCE_PAYMENT
      ? {
          name: "Invoiced Amount",
          selector: (row) =>
            row.invoice?.payable || row.receiptInvoice?.payable,
        }
      : null,
    billType !== DUE_AMOUNT && billType !== INVOICE
      ? {
          name: "Payment Modes",
          selector: (row) =>
            row.type === OPD
              ? row.receiptInvoice?.paymentModes?.map(
                  (payment) =>
                    `${payment?.type || ""} ${payment?.bankName || ""} ${
                      payment?.transactionId || ""
                    } ${payment?.chequeNumber || ""} ${
                      payment?.cardNumber || ""
                    } \n`
                )
              : row.deposit
              ? row.deposit?.paymentModes?.map(
                  (payment) =>
                    `${payment.paymentMode || ""} ${payment.bankName || ""} ${
                      payment.chequeNumber || ""
                    } ${payment.cardNumber || ""} \n`
                )
              : row.advancePayment?.paymentModes?.map(
                  (payment) =>
                    `${payment.paymentMode || ""} ${payment.bankName || ""} ${
                      payment.chequeNumber || ""
                    } ${payment.cardNumber || ""} \n`
                ),
        }
      : null,
    billType !== DUE_AMOUNT && billType !== INVOICE
      ? {
          name: "Paid Amount",
          selector: (row) =>
            row.type === OPD
              ? row.receiptInvoice?.payable
              : row.deposit
              ? row.deposit?.totalAmount
              : row.advancePayment?.totalAmount,
        }
      : null,

    //DUE AMOUNT (TOTAL CALCULATIONS)
    billType === DUE_AMOUNT
      ? {
          name: "Total Invoiced Amount",
          selector: (row) => row.totalPayable,
        }
      : null,
    billType === DUE_AMOUNT
      ? {
          name: "Total Paid Amount",
          selector: (row) => row.totalAdvancePayment,
        }
      : null,
    billType === DUE_AMOUNT
      ? {
          name: "Total Due Amount",
          selector: (row) => row.dueAmount,
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
