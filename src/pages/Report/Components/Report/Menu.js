import React from "react";
import { Button, Col, Input, Row } from "reactstrap";
import { format } from "date-fns";
import { CSVLink } from "react-csv";
import SearchPatient from "./SeachPatient";
import {
  BANK,
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../../Components/constants/patient";
import {
  ADDMISSION_DATE,
  ADVANCE_PAYMENT,
  ALL_TRANSACTIONS,
  DISCHARGE_DATE,
  DISCHARGE_PATIENT,
  DUE_AMOUNT,
  INVOICE,
  OPD_BILL,
  INTERN,
  advancePaymentHeaders,
  advancePaymentHeadersAddmissionDischargeDate,
  allTransactionHeaders,
  allTransactionHeadersAddmissionDischargeDate,
  dueAmountHeaders,
  opdBillHeaders,
  payableAmountHeaders,
  payableAmountHeadersAddmissionDischargeDate,
  payments,
} from "./data";

const Menu = ({
  data,
  billType,
  setBillType,
  patient,
  setPatient,
  sortByDate,
  setSortByDate,
  setSortPatientStatus,
  sortPatientStatus,
  patientsReferrel,
  setPatientsReferrel,
  diagnosisCol,
  toggle,
  ...rest
}) => {
  const documents = () => {
    const filteredData =
      billType === INTERN ? data?.filter((row) => row.intern) : data;
    return filteredData?.map((row) => ({
      ...row,
      patient: {
        ...row.patient,
        referredBy:
          row.patient?.referredBy?.doctorName || row.patient?.referredBy,
      },
      name: row.intern ? row.intern.name : row.patient?.name || "",
      date: row.date ? format(new Date(row.date), "dd MMM yyyy") : "",
      uid: row.patient?.id
        ? `${row.patient.id.prefix}${row.patient.id.value}`
        : "",
      invoiceNumber: row.key
        ? `${row.key.prefix}${row.key.patientId}-${row.key.value}`
        : "",
      dateOfAddmission: row.patient?.addmission?.addmissionDate
        ? format(new Date(row.patient.addmission.addmissionDate), "dd MMM yyyy")
        : "",
      dateOfDischarge: row.patient?.addmission?.dischargeDate
        ? format(new Date(row.patient.addmission.dischargeDate), "dd MMM yyyy")
        : "",
      type:
        billType === ALL_TRANSACTIONS
          ? row.type && row.type.trim() !== ""
            ? row.type
            : "INTERN"
          : row.type || "",
      invoice: {
        payable:
          row.intern && row.receipt
            ? row.receipt.totalAmount || 0
            : row.invoice?.payable || row.receiptInvoice?.payable || 0,
        refund: row.invoice?.refund || 0,
      },
      advancePayment: {
        totalAmount:
          row.intern && row.receipt
            ? row.receipt.totalAmount || 0
            : row.advancePayment?.totalAmount ||
            row.receiptInvoice?.payable ||
            0,
      },
      paymentModes: (row.intern
        ? row.receipt?.paymentModes
        : row.advancePayment?.paymentModes || row.receiptInvoice?.paymentModes
      )
        ?.map((item, idx, arr) => {
          const prevItem = arr[idx - 1];
          const prefix = prevItem ? "\n" : "";
          if (item.paymentMode === CASH || item.type === CASH) {
            return `${prefix}${item.paymentMode || item.type} ₹${item.amount}`;
          }
          if (item.paymentMode === CARD || item.type === CARD) {
            return `${prefix}${item.paymentMode || item.type} ${item.cardNumber || ""
              } ₹${item.amount}`;
          }
          if (item.paymentMode === UPI || item.type === UPI) {
            return `${prefix}${item.paymentMode || item.type} ${item.transactionId || ""
              }`;
          }
          if (item.paymentMode === CHEQUE || item.type === CHEQUE) {
            return `${prefix}${item.paymentMode || item.type} ${item.bankName || ""
              } ${item.chequeNo || item.chequeNumber || ""} ₹${item.amount}`;
          }
          if (item.paymentMode === BANK || item.type === BANK) {
            return `${prefix}${item.paymentMode || item.type} ${item.bankName || ""
              } ₹${item.amount}`;
          }
          return "";
        })
        .filter(Boolean)
        .join(""),
    }));
  };

  const headers = () => {
    let resultantHeaders = [];
    if (
      (sortByDate === ADDMISSION_DATE || sortByDate === DISCHARGE_DATE) &&
      diagnosisCol
    ) {
      if (billType === ADVANCE_PAYMENT)
        resultantHeaders = [
          ...advancePaymentHeadersAddmissionDischargeDate,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
          {
            label: "Diagnosis",
            key: "dischargeSummary.diagnosis",
          },
        ];
      else if (billType === INVOICE)
        resultantHeaders = [
          ...payableAmountHeadersAddmissionDischargeDate,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
          {
            label: "Diagnosis",
            key: "dischargeSummary.diagnosis",
          },
        ];
      else if (billType === DUE_AMOUNT)
        resultantHeaders = [
          ...dueAmountHeaders,
          sortPatientStatus === DISCHARGE_PATIENT
            ? {
              label: "Date of Discharge",
              key: "dateOfDischarge",
            }
            : null,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
          {
            label: "Diagnosis",
            key: "dischargeSummary.diagnosis",
          },
        ];
      else if (billType === ALL_TRANSACTIONS)
        resultantHeaders = [
          ...allTransactionHeadersAddmissionDischargeDate,

          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
        ];
      else if (billType === INTERN)
        resultantHeaders = [
          { label: "Patient/Intern", key: "name" },
          { label: "Center", key: "center.title" },
          { label: "Date", key: "date" },
          { label: "UID", key: "uid" },
          { label: "Invoice No", key: "invoiceNumber" },
          { label: "Invoiced Amount", key: "invoice.payable" },
          { label: "Payment Modes", key: "paymentModes" },
          { label: "Paid Amount", key: "advancePayment.totalAmount" },
        ];
    } else if (
      sortByDate === ADDMISSION_DATE ||
      sortByDate === DISCHARGE_DATE
    ) {
      if (billType === ADVANCE_PAYMENT)
        resultantHeaders = [
          ...advancePaymentHeadersAddmissionDischargeDate,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
        ];
      else if (billType === INVOICE)
        resultantHeaders = [
          ...payableAmountHeadersAddmissionDischargeDate,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
        ];
      else if (billType === DUE_AMOUNT)
        resultantHeaders = [
          ...dueAmountHeaders,
          sortPatientStatus === DISCHARGE_PATIENT
            ? {
              label: "Date of Discharge",
              key: "dateOfDischarge",
            }
            : null,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
        ];
      else if (billType === ALL_TRANSACTIONS)
        resultantHeaders = [
          ...allTransactionHeadersAddmissionDischargeDate,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
        ];
      else if (billType === INTERN)
        resultantHeaders = [
          { label: "Patient/Intern", key: "name" },
          { label: "Center", key: "center.title" },
          { label: "Date", key: "date" },
          { label: "UID", key: "uid" },
          { label: "Invoice No", key: "invoiceNumber" },
          { label: "Invoiced Amount", key: "invoice.payable" },
          { label: "Payment Modes", key: "paymentModes" },
          { label: "Paid Amount", key: "advancePayment.totalAmount" },
        ];
    } else if (diagnosisCol) {
      if (billType === DUE_AMOUNT) {
        resultantHeaders = [
          ...dueAmountHeaders,
          sortPatientStatus === DISCHARGE_PATIENT
            ? {
              label: "Date of Discharge",
              key: "dateOfDischarge",
            }
            : null,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
          {
            label: "Diagnosis",
            key: "dischargeSummary.diagnosis",
          },
        ];
      } else if (billType === ADVANCE_PAYMENT)
        resultantHeaders = [
          ...advancePaymentHeaders,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
          {
            label: "Diagnosis",
            key: "dischargeSummary.diagnosis",
          },
        ];
      else if (billType === INVOICE)
        resultantHeaders = [
          ...payableAmountHeaders,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
          {
            label: "Diagnosis",
            key: "dischargeSummary.diagnosis",
          },
        ];
      else if (billType === ALL_TRANSACTIONS)
        resultantHeaders = [
          ...allTransactionHeaders,
          patientsReferrel
            ? { label: "Referred By", key: "patient.referredBy" }
            : null,
          {
            label: "Diagnosis",
            key: "dischargeSummary.diagnosis",
          },
        ];
      else if (billType === INTERN)
        resultantHeaders = [
          { label: "Patient/Intern", key: "name" },
          { label: "Center", key: "center.title" },
          { label: "Date", key: "date" },
          { label: "UID", key: "uid" },
          { label: "Invoice No", key: "invoiceNumber" },
          { label: "Invoiced Amount", key: "invoice.payable" },
          { label: "Payment Modes", key: "paymentModes" },
          { label: "Paid Amount", key: "advancePayment.totalAmount" },
        ];
    } else if (billType === DUE_AMOUNT)
      resultantHeaders = [
        ...dueAmountHeaders,
        sortPatientStatus === DISCHARGE_PATIENT
          ? {
            label: "Date of Discharge",
            key: "dateOfDischarge",
          }
          : null,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    else if (billType === ADVANCE_PAYMENT)
      resultantHeaders = [
        ...advancePaymentHeaders,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    else if (billType === INVOICE)
      resultantHeaders = [
        ...payableAmountHeaders,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    else if (billType === ALL_TRANSACTIONS)
      resultantHeaders = [
        ...allTransactionHeaders,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    else if (billType === OPD_BILL)
      resultantHeaders = [
        ...opdBillHeaders,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    else if (billType === INTERN)
      resultantHeaders = [
        { label: "Patient/Intern", key: "name" },
        { label: "Center", key: "center.title" },
        { label: "Date", key: "date" },
        // { label: "UID", key: "uid" },
        // { label: "Invoice No", key: "invoiceNumber" },
        // { label: "Invoiced Amount", key: "invoice.payable" },
        { label: "Payment Modes", key: "paymentModes" },
        { label: "Paid Amount", key: "advancePayment.totalAmount" },
      ];

    return resultantHeaders.filter((header) => header !== null);
  };

  const handleChange = (e) => {
    if (e) setBillType(e.target.value);
  };

  const reset = () => {
    setPatient("");
    setBillType(ALL_TRANSACTIONS);
    setSortPatientStatus("");
    setSortByDate("");
    setPatientsReferrel("");
  };

  return (
    <React.Fragment>
      <div>
        <div>
          <form>
            <Row>
              <Col xs={12} md={3} className="mb-3 mb-md-0">
                <div className="d-flex">
                  <Input
                    id="selectfilter"
                    name="address"
                    type="select"
                    onChange={handleChange}
                    value={billType || ""}
                    className="form-control form-control-sm"
                  >
                    {(payments || []).map((item, idx) => (
                      <option
                        value={item.value}
                        className="text-muted"
                        key={item + idx}
                      >
                        {item.label}
                      </option>
                    ))}
                  </Input>
                </div>
              </Col>
              <Col xs={12} md={3}>
                <SearchPatient setPatient={setPatient} patient={patient} />
              </Col>
              <Col xs={12} md={6}>
                <div className="d-flex justify-content-start justify-content-md-end mt-3 mt-md-0">
                  <Button
                    size="sm"
                    color="danger"
                    title="Reset"
                    onClick={reset}
                  >
                    <i className="ri-arrow-go-back-line text-white"></i>
                  </Button>
                  <Button
                    size="sm"
                    color="light"
                    className="ms-3"
                    title="Print"
                  >
                    <i className="ri-printer-line"></i>
                  </Button>
                  <CSVLink
                    // data={(documents() || [])}
                    data={(() => {
                      console.log(documents());
                      return documents() || [];
                    })()}
                    title="CSV Download"
                    filename={"reports.csv"}
                    // headers={headers()}
                    headers={(() => {
                      console.log(headers());
                      return headers();
                    })()}
                    className="btn btn-info px-2 ms-3"
                  >
                    <i className="ri-file-paper-2-line text-light text-decoration-none"></i>
                  </CSVLink>
                  <Button
                    size="sm"
                    color="secondary"
                    className="ms-3"
                    title="Filters"
                    onClick={toggle}
                  >
                    <i className="ri-filter-2-line"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
};

Menu.propTypes = {};

export default Menu;
