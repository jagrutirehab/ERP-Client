import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import MedicineForm from "./MedicineForm";

const AddMedicines = ({ modal, toggle, ...rest }) => {
  return (
    <React.Fragment>
      <CustomModal
        size={"xl"}
        isOpen={modal}
        toggle={toggle}
        centered
        title={"Add Medicine"}
      >
        <MedicineForm toggle={toggle} {...rest} />
      </CustomModal>
    </React.Fragment>
  );
};

AddMedicines.propTypes = {
  modal: PropTypes.bool,
  toggle: PropTypes.func,
};

export default AddMedicines;
