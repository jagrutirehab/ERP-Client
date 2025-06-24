import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const FormModal = ({
  isOpen,
  toggle,
  EventFormContext,
  // children,
  ...rest
}) => {
  // const [title, setTitle] = useState('');

  // const handleClick = () => {
  //   const dropdown = document.getElementById("search-dropdown");
  //   // if (searchedPatients.length === 0)
  //   dropdown.classList.remove("show");
  // };

  return (
    <React.Fragment>
      <div>
        <Modal isOpen={isOpen} size={"lg"} centered>
          <ModalHeader>Add Appointment</ModalHeader>
          <ModalBody>{EventFormContext}</ModalBody>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default FormModal;
