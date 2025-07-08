import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import { connect, useDispatch } from "react-redux";
import InternReceipt from "./Receipt";
import { createEditInternBill } from "../../../store/actions";
const BillForm = ({ bill, ...rest }) => {
  const dispatch = useDispatch();
  const toggleForm = () => {
    dispatch(createEditInternBill({ bill: null, isOpen: false }));
  };

  return (
    <React.Fragment>
      <CustomModal
        centered={true}
        size="xl"
        isOpen={bill?.isOpen}
        toggle={toggleForm}
      >
        <InternReceipt toggleForm={toggleForm} {...rest} />
      </CustomModal>
    </React.Fragment>
  );
};

BillForm.propTypes = {
  bill: PropTypes.object,
  toggleDateModal: PropTypes.func,
};

const mapStateToProps = (state) => ({
  bill: state.Intern.billForm,
});

export default connect(mapStateToProps)(BillForm);
