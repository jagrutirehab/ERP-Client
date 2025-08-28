import React from "react";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import { DUE_AMOUNT, INTERN, INVOICE, OPD_BILL } from "./data";

const Banner = ({ data, billType }) => {
  console.log(billType);
  const totalAdvancePayment = (dt) => {
    let amount = 0;
    dt?.forEach((item) => {
      if (item.intern && item.receipt?.totalAmount) {
        amount += item.receipt.totalAmount;
      } else if (billType === DUE_AMOUNT) {
        amount += item?.totalAdvancePayment || 0;
      } else if (billType === OPD_BILL) {
        amount += item?.receiptInvoice?.payable || 0;
      } else {
        amount +=
          item?.advancePayment?.totalAmount ||
          item?.receiptInvoice?.payable ||
          0;
      }
    });
    return amount;
  };

  const totalPayable = (dt) => {
    let amount = 0;
    dt?.forEach((item) => {
      if (billType === DUE_AMOUNT) {
        amount += item?.totalPayable || 0;
      } else {
        amount += item?.invoice?.payable || 0;
      }
      if (billType === OPD_BILL && !item.intern) {
        amount += item?.receiptInvoice?.payable || 0;
      }
    });
    return amount;
  };

  const dueAmount = (dt) => {
    const totalAdPayment = totalAdvancePayment(dt);
    const totalPay = totalPayable(dt);
    return totalPay > totalAdPayment ? totalPay - totalAdPayment : 0.0;
  };

  return (
    <React.Fragment>
      <div className="p-4 mt-3 shadow bg-body rounded">
        <div className="d-flex flex-wrap justify-content-between justify-content-md-around">
         {/* <RenderWhen isTrue={billType !== INTERN}> */}
            <div className="d-flex align-items-center">
              <h6 className="display-6 fs-6">TOTAL INVOICED AMOUNT (₹): </h6>
              <h5 className="display-5 ms-2 fs-17 font-semi-bold">
                {totalPayable(data) || totalAdvancePayment(data) || 0.0}
              </h5>
            </div>
          {/* </RenderWhen> */}
          <RenderWhen isTrue={billType !== INVOICE}>
            <div className="d-flex align-items-center">
              <h6 className="display-6 fs-6">TOTAL PAID AMOUNT (₹): </h6>
              <h5 className="display-5 ms-2 fs-17 font-semi-bold">
                {totalAdvancePayment(data) || 0.0}
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
