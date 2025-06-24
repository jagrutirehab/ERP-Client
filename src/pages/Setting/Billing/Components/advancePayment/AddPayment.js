import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../../Components/Common/Modal";
import PaymentForm from "./PaymentForm";

const AddPayment = ({ modal, toggle, ...rest }) => {
  return (
    <React.Fragment>
      <CustomModal
        size={"xl"}
        isOpen={modal}
        toggle={toggle}
        centered
        title={"Add Bill Items"}
      >
        <PaymentForm toggle={toggle} {...rest} />
      </CustomModal>
    </React.Fragment>
  );
};

AddPayment.propTypes = {
  modal: PropTypes.bool,
  toggle: PropTypes.func,
};

export default AddPayment;
