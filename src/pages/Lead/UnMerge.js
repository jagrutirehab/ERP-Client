import React, { useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../Components/Common/Modal";
import { connect, useDispatch } from "react-redux";
import { unMergeLead } from "../../store/actions";

const UnMerge = ({ lead, setUnMergeLead, centerAccess, date }) => {
  const dispatch = useDispatch();

  const toggle = () => {
    setUnMergeLead(null);
  };

  const unMerge = () => {
    dispatch(unMergeLead({ lead, centerAccess, ...date }));
    toggle();
  };

  return (
    <React.Fragment>
      <CustomModal
        size={"md"}
        centered
        title={"Unmerge Lead"}
        isOpen={Boolean(lead)}
        toggle={toggle}
      >
        <div className="mt-2 text-center">
          {/* <lord-icon
            src="https://cdn.lordicon.com/gsqxdxog.json"
            trigger="loop"
            colors="primary:#405189,secondary:#f06548"
            style={{ width: "100px", height: "100px" }}
          ></lord-icon> */}
          <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
            <h4>Are you sure ?</h4>
            <p className="text-muted mx-4 mb-0">
              Are you sure you want to Un merge this record ?
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <button
            type="button"
            className="btn w-sm btn-light"
            data-bs-dismiss="modal"
            onClick={toggle}
          >
            Close
          </button>
          <button
            type="button"
            className="btn w-sm btn-danger text-white"
            id="delete-record"
            onClick={unMerge}
          >
            Yes, Unmerge It!
          </button>
        </div>
      </CustomModal>
    </React.Fragment>
  );
};

UnMerge.propTypes = {};

const mapStateToProps = (state) => ({
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(UnMerge);
