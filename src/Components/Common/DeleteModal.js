import PropTypes from "prop-types";
import React from "react";
import { Button, Modal, ModalBody } from "reactstrap";
// import lottie from "lottie-web";
// import { defineElement } from "lord-icon-element";

// defineElement(lottie.loadAnimation);
const DeleteModal = ({
  show,
  onDeleteClick,
  onCloseClick,
  messsage,
  buttonMessage,
}) => {
  return (
    <Modal isOpen={show} toggle={onCloseClick} centered={true}>
      <ModalBody className="py-3 px-5">
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
              {messsage || "Are you sure you want to remove this record ?"}
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <button
            type="button"
            className="btn w-sm btn-light"
            data-bs-dismiss="modal"
            onClick={onCloseClick}
          >
            Close
          </button>
          <Button
            type="button"
            color="danger"
            // className="btn btn-danger text-danger"
            id="delete-record"
            onClick={onDeleteClick}
          >
            {buttonMessage || "Yes, Delete It!"}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

DeleteModal.propTypes = {
  onCloseClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  show: PropTypes.any,
};

export default DeleteModal;
