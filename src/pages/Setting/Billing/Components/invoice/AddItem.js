import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../../Components/Common/Modal";
import ItemForm from "./ItemForm";

const AddItems = ({ modal, toggle, ...rest }) => {
  return (
    <React.Fragment>
      <CustomModal
        size={"xl"}
        isOpen={modal}
        toggle={toggle}
        centered
        title={"Add Bill Items"}
      >
        <ItemForm toggle={toggle} {...rest} />
      </CustomModal>
    </React.Fragment>
  );
};

AddItems.propTypes = {
  modal: PropTypes.bool,
  toggle: PropTypes.func,
};

export default AddItems;
