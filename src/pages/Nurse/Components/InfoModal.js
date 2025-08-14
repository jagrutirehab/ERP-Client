import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody } from "reactstrap";

const InfoModal = ({ title, show, onCloseClick, content }) => {
  return (
    <Modal
      isOpen={show}
      toggle={onCloseClick}
      centered
      contentClassName="border-0 shadow-lg rounded-2"
    >
      <ModalBody className="p-4 position-relative">
        <div className="text-center mb-4">
          {title && (
            <h4
              className="fw-bold mb-0"
              style={{ fontSize: "1.4rem", position: "relative" }}
            >
              {title}
              <button
                type="button"
                onClick={onCloseClick}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  lineHeight: "1",
                  color: "#999",
                }}
                aria-label="Close"
              >
                ×
              </button>
            </h4>
          )}
        </div>

        <div className="mt-2 pt-1 fs-6 text-start">
          {Array.isArray(content) && content.length > 0 ? (
            content.map((text, index) => (
              <div key={index} className="mb-3">
                <p className="mb-2">
                  <span style={{ color: "#555", marginRight: "6px" }}>•</span>
                  {text}
                </p>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #e9ecef",
                    margin: "0",
                  }}
                />
              </div>
            ))
          ) : (
            <p className="text-muted text-center mb-0">
              No messages to display.
            </p>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

InfoModal.propTypes = {
  title: PropTypes.string,
  show: PropTypes.bool.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  content: PropTypes.arrayOf(PropTypes.string),
};

export default InfoModal;
