import React, { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import { connect, useDispatch } from "react-redux";

//data
import {
  ADVANCE_PAYMENT,
  DEPOSIT,
  DRAFT_INVOICE,
  INVOICE,
} from "../../../Components/constants/patient";

//forms
import { createEditBill } from "../../../store/actions";
import DuePayment from "./DuePayment";
import AdvancePayment from "./AdvancePayment";
import RenderWhen from "../../../Components/Common/RenderWhen";
import InvoiceDraft from "./InvoiceDraft";
import Deposit from "./Deposit";

const BillForm = ({ bill, ...rest }) => {
  const dispatch = useDispatch();
  const toggleForm = () => {
    dispatch(createEditBill({ bill: null, isOpen: false }));
  };
  // Set by the form while a row holds an approved POS charge. The header ✕
  // must honour the same lock as the Cancel button, or the money is left
  // unrecorded by closing the modal instead.
  const [closeLocked, setCloseLocked] = useState(false);
  const formProps = { toggleForm, onCloseLockChange: setCloseLocked, ...rest };

  const isAdvancePayment = bill.bill === ADVANCE_PAYMENT;
  const isDeposit = bill.bill === DEPOSIT;
  const isInvoice = bill.bill === INVOICE;
  const isDraftInvoice = bill.bill === DRAFT_INVOICE;

  const title = isAdvancePayment
    ? "Advance Payment"
    : isDeposit
      ? "Deposit"
      : isDraftInvoice
        ? "Draft Invoice"
        : "Invoice";

  return (
    <React.Fragment>
      <CustomModal
        centered={true}
        title={title}
        size="xl"
        isOpen={bill.isOpen}
        toggle={closeLocked ? undefined : toggleForm}
      >
        <RenderWhen isTrue={isAdvancePayment}>
          <AdvancePayment {...formProps} />
        </RenderWhen>
        <RenderWhen isTrue={isDeposit}>
          <Deposit {...formProps} />
        </RenderWhen>
        <RenderWhen isTrue={isInvoice}>
          <DuePayment isLatest={bill.isLatest} {...formProps} />
        </RenderWhen>
        <RenderWhen isTrue={isDraftInvoice}>
          <InvoiceDraft toggleForm={toggleForm} {...rest} />
        </RenderWhen>
      </CustomModal>
    </React.Fragment>
  );
};

BillForm.propTypes = {
  bill: PropTypes.object,
  toggleDateModal: PropTypes.func,
};

const mapStateToProps = (state) => ({
  bill: state.Bill.billForm,
});

export default connect(mapStateToProps)(BillForm);
