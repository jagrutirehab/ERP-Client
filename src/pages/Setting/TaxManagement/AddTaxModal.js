import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import TaxForm from "./AddTaxForm";

const AddTaxModal = ({modal,toggle,apiFlag, setApiFlag})=>{
    return(
         <React.Fragment>
              <CustomModal
                size={"xl"}
                isOpen={modal}
                toggle={toggle}
                centered
                title={"Add Tax"}
              >
              <TaxForm toggle={toggle} apiFlag={apiFlag} setApiFlag={setApiFlag}/>
              </CustomModal>
            </React.Fragment>
    )
}

AddTaxModal.propTypes = {
  modal: PropTypes.bool,
  toggle: PropTypes.func,
  setApiFlag:PropTypes.func,
  apiFlag:PropTypes.bool
};


export default AddTaxModal;