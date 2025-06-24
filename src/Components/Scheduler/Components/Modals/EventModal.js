import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const EventModal = ({ toggleEventInfo, isOpen, data, EventInfoRenderer }) => {
  return (
    <React.Fragment>
      <Modal
        isOpen={isOpen}
        toggle={() => toggleEventInfo()}
        size={"md"}
        centered
      >
        <ModalHeader toggle={toggleEventInfo}>Appointment</ModalHeader>
        <ModalBody>{EventInfoRenderer(data)}</ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default EventModal;
