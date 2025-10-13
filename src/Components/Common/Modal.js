import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const CustomModal = ({
  className,
  centered = false,
  size,
  isOpen,
  title,
  toggle,
  children,
  ...rest
}) => {
  return (
    <React.Fragment>

      <Modal centered={centered} size={size} isOpen={isOpen} {...rest}>
        <ModalHeader className="text-break" style={{
          whiteSpace: "normal",
          wordBreak: "break-word",
          lineHeight: "1.4",
        }} toggle={toggle}>{title}</ModalHeader>
        <ModalBody className={className}>{children}</ModalBody>
      </Modal>
    </React.Fragment>
  );
};

CustomModal.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  toggle: PropTypes.func,
  children: PropTypes.node,
};

export default CustomModal;
