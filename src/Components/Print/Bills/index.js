import React from "react";
import PropTypes from "prop-types";
import {
  INVOICE,
  ADVANCE_PAYMENT,
  PROFORMA_INVOICE,
  REFUND,
  OPD,
  IPD,
  DEPOSIT,
} from "../../constants/patient";

//bills
import Invoice from "./Invoice";
import NewTemplete from "./newTemplete";
import OPDInvoice from "./OPD/Inovice";
import Receipt from "./Receipt";
import RenderWhen from "../../Common/RenderWhen";
import Deposit from "./Deposit";

const Bills = ({ bill, patient, center, doctor, admission }) => {
  return (
    <React.Fragment>
      <RenderWhen isTrue={bill.type === OPD}>
        <OPDInvoice
          bill={bill}
          patient={patient}
          center={center}
          doctor={doctor}
        />
      </RenderWhen>

      <RenderWhen
        isTrue={
          (bill.bill === PROFORMA_INVOICE || bill.bill === INVOICE || bill.bill === REFUND) && bill.type === IPD
        }
      >
        {bill.invoice?.invoiceList?.length > 0 &&
        bill.invoice?.invoiceList[0].category ? (
          <NewTemplete
            bill={bill}
            patient={patient}
            center={center}
            admission={admission}
          />
        ) : (
          <Invoice bill={bill} patient={patient} center={center} />
        )}
      </RenderWhen>

      <RenderWhen isTrue={bill.bill === ADVANCE_PAYMENT && bill.type === IPD}>
        <Receipt bill={bill} patient={patient} center={center} />
      </RenderWhen>
      <RenderWhen isTrue={bill.bill === DEPOSIT && bill.type === IPD}>
        <Deposit bill={bill} patient={patient} center={center} />
      </RenderWhen>
    </React.Fragment>
  );
};

Bills.propTypes = {
  bill: PropTypes.object.isRequired,
};

export default Bills;
