export const ALL_TRANSACTIONS = "ALL_TRANSACTIONS";
export const ADVANCE_PAYMENT = "ADVANCE_PAYMENT";
export const INVOICE = "INVOICE";
export const DUE_AMOUNT = "DUE_AMOUNT";
export const OPD_BILL = "OPD_BILL";
export const ALL_REFERRELS = "ALL_REFERRELS";
export const ADDMISSION_DATE = "ADDMISSION_DATE";
export const DISCHARGE_DATE = "DISCAHRGE_DATE";
export const ADMIT_PATIENT = "ADMIT_PATIENT";
export const DISCHARGE_PATIENT = "DISCHARGE_PATIENT";
export const INTERN  = "INTERN"

export const payments = [
  { label: "All Transactions", value: ALL_TRANSACTIONS },
  { label: "Advance Payment", value: ADVANCE_PAYMENT },
  { label: "Invoice", value: INVOICE },
  { label: "Due Amount", value: DUE_AMOUNT },
  { label: "OPD Bills", value: OPD_BILL },
  { label: "Interns", value: INTERN },
];

export const calendar = ["Daily", "Monthly", "Pre Doctor", "Pre Procedure"];

export const allTransactionHeaders = [
  { label: "Date", key: "date" },
  { label: "Patient Name", key: "patient.name" },
  { label: "UID", key: "uid" },
  { label: "Type", key: "type" },
  { label: "Center", key: "center.title" },
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Invoiced Amount (₹Dr)", key: "invoice.payable" },
  { label: "Payment Modes", key: "paymentModes" },
  { label: "Paid Amount (₹Cr)", key: "advancePayment.totalAmount" },
];

export const allTransactionHeadersAddmissionDischargeDate = [
  { label: "Date", key: "date" },
  { label: "Patient Name", key: "patient.name" },
  { label: "UID", key: "uid" },
  { label: "Type", key: "type" },
  { label: "Center", key: "center.title" },
  { label: "Date of Addmission", key: "dateOfAddmission" },
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Invoiced Amount (₹Dr)", key: "invoice.payable" },
  { label: "Payment Modes", key: "paymentModes" },
  { label: "Paid Amount (₹Cr)", key: "advancePayment.totalAmount" },
];

export const dueAmountHeaders = [
  { label: "Patient Name", key: "patient.name" },
  { label: "Center", key: "patient.center.title" },
  { label: "UID", key: "uid" },
  { label: "Date of Addmission", key: "dateOfAddmission" },
  // { label: "Date of Discharge", key: "dateOfDischarge" },
  { label: "Total Invoiced Amount (₹Dr)", key: "totalPayable" },
  { label: "Total Paid Amount (₹Cr)", key: "totalAdvancePayment" },
  { label: "Total Due Amount", key: "dueAmount" },
];

// const dueAmountHeadersDiagnosis = [
//   { label: "Patient Name", key: "patient.name"
// { label: "Type", key: "type" }, },
// { label: "Center", key: "center.title" }
//   { label: "Date of Addmission", key: "dateOfAddmission" },
//   { label: "Date of Discharge", key: "dateOfDischarge" },
//   { label: "Diagnosis", key: "dischargeSummary.diagnosis" },
//   { label: "Total Invoiced Amount (₹Dr)", key: "invoice.payable" },
//   { label: "Total Paid Amount (₹Cr)", key: "advancePayment.totalAmount" },
//   { label: "Total Due Amount", key: "dueAmount" },
// ];

export const advancePaymentHeaders = [
  { label: "Date", key: "date" },
  { label: "Patient Name", key: "patient.name" },
  { label: "UID", key: "uid" },
  { label: "Type", key: "type" },
  { label: "Center", key: "center.title" },
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Payment Modes", key: "paymentModes" },
  { label: "Paid Amount (₹Cr)", key: "advancePayment.totalAmount" },
];

export const advancePaymentHeadersAddmissionDischargeDate = [
  { label: "Date", key: "date" },
  { label: "Patient Name", key: "patient.name" },
  { label: "UID", key: "uid" },
  { label: "Type", key: "type" },
  { label: "Center", key: "center.title" },
  { label: "Date of Addmission", key: "dateOfAddmission" },
  // { label: "Date of Discharge", key: "dateOfDischarge" },
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Payment Modes", key: "paymentModes" },
  { label: "Paid Amount (₹Cr)", key: "advancePayment.totalAmount" },
];

export const payableAmountHeaders = [
  { label: "Date", key: "date" },
  { label: "Patient Name", key: "patient.name" },
  { label: "UID", key: "uid" },
  { label: "Type", key: "type" },
  { label: "Center", key: "center.title" },
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Invoiced Amount (₹Dr)", key: "invoice.payable" },
];

export const payableAmountHeadersAddmissionDischargeDate = [
  { label: "Date", key: "date" },
  { label: "Patient Name", key: "patient.name" },
  { label: "UID", key: "uid" },
  { label: "Type", key: "type" },
  { label: "Center", key: "center.title" },
  { label: "Date of Addmission", key: "dateOfAddmission" },
  // { label: "Date of Discharge", key: "dateOfDischarge" },
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Invoiced Amount (₹Dr)", key: "invoice.payable" },
];

export const opdBillHeaders = [
  { label: "Date", key: "date" },
  { label: "Patient Name", key: "patient.name" },
  { label: "UID", key: "uid" },
  { label: "Type", key: "type" },
  { label: "Center", key: "center.title" },
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Invoiced Amount (₹Dr)", key: "invoice.payable" },
];
