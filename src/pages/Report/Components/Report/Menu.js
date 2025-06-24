import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Input, Row } from "reactstrap";
import { format } from "date-fns";

//csv file
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
  const documents = () =>
    data?.map((row) => ({
      ...row,
      date: row.date && format(new Date(row.date), "dd MMM yyyy"),
      uid: `${row.patient?.id?.prefix}${row.patient?.id?.value}`,
      invoiceNumber: `${row.key?.prefix}${row.key?.patientId}-${row.key?.value}`,
      dateOfAddmission: row.patient?.addmission?.addmissionDate
        ? format(
            new Date(row.patient?.addmission.addmissionDate),
            "dd MMM yyyy"
          )
        : "",
      dateOfDischarge: row.patient?.addmission?.dischargeDate
        ? format(new Date(row.patient?.addmission.dischargeDate), "dd MMM yyyy")
        : "",
      ...(row.type === "OPD" && {
        invoice: { payable: row.receiptInvoice?.payable },
        advancePayment: { totalAmount: row.receiptInvoice?.payable },
      }),
      paymentModes: (
        row.advancePayment?.paymentModes || row.receiptInvoice?.paymentModes
      )?.map((item, idx) => {
        if (item.paymentMode === CASH || item.type === CASH)
          return `${item.paymentMode || item.type} ₹${item.amount}`;
        if (item.paymentMode === CARD || item.type === CARD) {
          return row.advancePayment?.paymentModes[idx - 1] ||
            row.receiptInvoice?.paymentModes[idx - 1]
            ? `\n${item.paymentMode || item.type} ${item.cardNumber} ₹${
                item.amount
              }`
            : `${item.paymentMode || item.type} ${item.cardNumber} ₹${
                item.amount
              }`;
        }
        if (item.paymentMode === UPI || item.type === UPI) {
          return row.advancePayment?.paymentModes[idx - 1] ||
            row.receiptInvoice?.paymentModes[idx - 1]
            ? `\n${item.paymentMode || item.type} ${item.transactionId}`
            : `${item.paymentMode || item.type} ${item.transactionId}`;
        }
        if (item.paymentMode === CHEQUE || item.type === CHEQUE) {
          return row.advancePayment?.paymentModes[idx - 1] ||
            row.receiptInvoice?.paymentModes[idx - 1]
            ? `\n${item.paymentMode || item.type} ${item.bankName || ""} ${
                item.chequeNo || item.chequeNumber || ""
              } ₹${item.amount}`
            : `${item.paymentMode || item.type} ${item.bankName || ""} ${
                item.chequeNo || item.chequeNumber || ""
              } ₹${item.amount}`;
        }
        if (item.paymentMode === BANK || item.type === BANK) {
          return row.advancePayment?.paymentModes[idx - 1] ||
            row.receiptInvoice?.paymentModes[idx - 1]
            ? `\n${item.paymentMode || item.type} ${item.bankName || ""} ₹${
                item.amount
              }`
            : `${item.paymentMode || item.type} ${item.bankName || ""} ₹${
                item.amount
              }`;
        }
        return "";
      }),
    }));

  const headers = () => {
    let resultantHeaders = undefined;
    /* -------------------------First Condition Start------------------------ */
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
    } else if (
      /* -------------------------First Condition End------------------------ */
      /* -------------------------Second Condition Start------------------------ */
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
    } else if (diagnosisCol) {
      /* -------------------------Second Condition End------------------------ */
      /* -------------------------Third Condition Start------------------------ */
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
    } else if (billType === DUE_AMOUNT)
      /* -------------------------Third Condition End------------------------ */
      /* -------------------------Fourth Condition Start------------------------ */
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
    /* -------------------------Fourth Condition End------------------------ */
    /* -------------------------Fifth Condition Start------------------------ */ else if (
      billType === ADVANCE_PAYMENT
    )
      resultantHeaders = [
        ...advancePaymentHeaders,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    /* -------------------------Fifth Condition End------------------------ */
    /* -------------------------Sixth Condition Start------------------------ */ else if (
      billType === INVOICE
    )
      resultantHeaders = [
        ...payableAmountHeaders,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    /* -------------------------Sixth Condition End------------------------ */
    /* -------------------------Seventh Condition Start------------------------ */ else if (
      billType === ALL_TRANSACTIONS
    )
      resultantHeaders = [
        ...allTransactionHeaders,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    /* -------------------------Eighteth Condition End------------------------ */ if (
      billType === OPD_BILL
    )
      resultantHeaders = [
        ...opdBillHeaders,
        patientsReferrel
          ? { label: "Referred By", key: "patient.referredBy" }
          : null,
      ];
    /* -------------------------Eighteth Condition End------------------------ */

    return resultantHeaders;
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
                    {/* <option style={{ display: 'none' }} value=''></option> */}
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
                  {/* <Button
                    size="sm"
                    className="btn-info ms-3"
                    title="CSV Download"
                  > */}{" "}
                  <CSVLink
                    data={documents() || []}
                    title="CSV Download"
                    filename={"reports.csv"}
                    headers={headers()?.filter((header) => header !== null)}
                    className="btn btn-info px-2 ms-3"
                  >
                    <i className="ri-file-paper-2-line text-light text-decoration-none"></i>
                  </CSVLink>
                  {/* </Button> */}
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
