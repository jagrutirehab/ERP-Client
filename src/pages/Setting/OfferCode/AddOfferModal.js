import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import CouponForm from "./AddCoupanForm";

const AddOfferModal = ({modal,toggle})=>{
    return(
         <React.Fragment>
              <CustomModal
                size={"xl"}
                isOpen={modal}
                toggle={toggle}
                centered
                title={"Add Offer"}
              >
              <CouponForm  toggle={toggle}/>
              </CustomModal>
            </React.Fragment>
    )
}

AddOfferModal.propTypes = {
  modal: PropTypes.bool,
  toggle: PropTypes.func,
};


export default AddOfferModal;