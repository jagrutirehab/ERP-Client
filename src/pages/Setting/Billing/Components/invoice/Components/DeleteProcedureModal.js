import React from "react";
import { Modal, ModalBody, Button } from "reactstrap";
import { deleteBillItem } from "../../../../../../helpers/backend_helper";



const DeleteProcedureModal = ({ isOpen, toggle, onDelete }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalBody className="text-center p-4">
        <h4 className="fw-bold mb-3">
          <span
            style={{
              backgroundColor: "#3b82f6",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: "4px",
            }}
          >
            Are you sure ?
          </span>
        </h4>

        <p className="text-muted mb-4">
          Are you sure you want to remove this <br /> record ?
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Button color="light" onClick={toggle}>
            Close
          </Button>
          <Button color="danger" onClick={onDelete}>
            Yes, Delete It!
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default DeleteProcedureModal;
