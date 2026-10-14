import { Modal, ModalHeader, ModalBody } from "reactstrap";

const DescriptionModal = ({ isOpen, toggle, description }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        Issue Description
      </ModalHeader>

      <ModalBody
        style={{
          whiteSpace: "pre-line",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {description || "No description available"}
      </ModalBody>
    </Modal>
  );
};

export default DescriptionModal;