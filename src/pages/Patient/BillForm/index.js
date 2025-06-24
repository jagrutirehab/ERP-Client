import React from "react";
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
        toggle={toggleForm}
      >
        <RenderWhen isTrue={isAdvancePayment}>
          <AdvancePayment toggleForm={toggleForm} {...rest} />
        </RenderWhen>
        <RenderWhen isTrue={isDeposit}>
          <Deposit toggleForm={toggleForm} {...rest} />
        </RenderWhen>
        <RenderWhen isTrue={isInvoice}>
          <DuePayment toggleForm={toggleForm} {...rest} />
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
