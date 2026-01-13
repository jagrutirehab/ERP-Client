import React from "react";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import { ADVANCE_PAYMENT, ALL_TRANSACTIONS, DUE_AMOUNT, INVOICE, OPD_BILL } from "./data";

const Banner = ({ data, billType }) => {
  // console.log(billType);
  const totalAdvancePayment = (dt) => {
    let amount = 0;
    dt?.forEach((item) => {
      let baseAmount = 0;

      if (item.intern && item.receipt?.totalAmount) {
        baseAmount += item.receipt.totalAmount;
      } else if (billType === DUE_AMOUNT) {
        baseAmount += item?.totalAdvancePayment ?? 0;

      } else if (billType === OPD_BILL) {
        baseAmount += item?.receiptInvoice?.payable ?? 0;
      } else {
        baseAmount +=
          item?.advancePayment?.totalAmount ??
          item?.receiptInvoice?.payable ??
          0;
      }
      if (billType === ALL_TRANSACTIONS || billType === ADVANCE_PAYMENT) {
        let refund = item?.invoice?.refund ?? 0;
        amount += baseAmount - refund;
      } else {
        amount += baseAmount;
      }
    });
    return amount;
  };

  const totalPayable = (dt) => {
    let amount = 0;
    dt?.forEach((item) => {
      if (billType === DUE_AMOUNT) {
        amount += item?.totalPayable || 0;
      } else if (billType === OPD_BILL) {
        if (item.intern && item.receipt) {
          amount += item?.receipt?.totalAmount || 0;
        } else {
          amount +=
            (item?.invoice?.payable || 0) +
            (item?.receiptInvoice?.payable || 0);
        }
      } else {
        amount +=
          (item?.invoice?.payable || 0) + (item?.receiptInvoice?.payable || 0);
        // Only add receipt.totalAmount if intern is truthy and receipt exists
        if (item.intern && item.receipt) {
          amount += item?.receipt?.totalAmount || 0;
        }
      }
    });
    return amount;
  };

  const totalRefundAmount = (dt) => {
    let refundTotal = 0;

    dt?.forEach((item) => {
      refundTotal += item?.invoice?.refund ?? 0;
    });

    return refundTotal;
  };

  // console.log(
  //   data?.reduce((total, item) => total + (item.invoice?.payable || 0), 0),
  //   "data",
  //   data
  // );

  const dueAmount = (dt) => {
    const totalAdPayment = totalAdvancePayment(dt);
    const totalPay = totalPayable(dt);
    return totalPay > totalAdPayment ? totalPay - totalAdPayment : 0.0;
  };

  return (
    <React.Fragment>
      <div className="p-4 mt-3 shadow bg-body rounded">
        <div className="d-flex flex-wrap justify-content-between justify-content-md-around">
          <RenderWhen isTrue={billType !== ADVANCE_PAYMENT}>
            <div className="d-flex align-items-center">
              <h6 className="display-6 fs-6">TOTAL INVOICED AMOUNT (₹): </h6>
              <h5 className="display-5 ms-2 fs-17 font-semi-bold">
                {totalPayable(data) || totalAdvancePayment(data) || 0.0}
              </h5>
            </div>
          </RenderWhen>
          <RenderWhen isTrue={billType !== INVOICE}>
            <div className="d-flex align-items-center">
              <h6 className="display-6 fs-6">TOTAL PAID AMOUNT (₹): </h6>
              <h5 className="display-5 ms-2 fs-17 font-semi-bold">
                {totalAdvancePayment(data) || 0.0}
              </h5>
            </div>
          </RenderWhen>
          <RenderWhen isTrue={billType === ALL_TRANSACTIONS || billType === ADVANCE_PAYMENT}>
            <div className="d-flex align-items-center">
              <h6 className="display-6 fs-6">TOTAL REFUND AMOUNT (₹): </h6>
              <h5 className="display-5 ms-2 fs-17 font-semi-bold">
                {totalRefundAmount(data) || 0.0}
              </h5>
            </div>
          </RenderWhen>
          <RenderWhen isTrue={billType === DUE_AMOUNT}>
            <div className="d-flex align-items-center">
              <h6 className="display-6 fs-6">TOTAL DUE AMOUNT (₹): </h6>
              <h5 className="display-5 ms-2 fs-17 font-semi-bold">
                {dueAmount(data) || 0.0}
              </h5>
            </div>
          </RenderWhen>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Banner;
