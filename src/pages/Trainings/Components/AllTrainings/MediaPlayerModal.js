import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const MediaPlayerModal = ({ media, isOpen, onClose }) => (
  <Modal isOpen={isOpen} toggle={onClose} size="lg" centered unmountOnClose>
    <ModalHeader toggle={onClose}>{media?.originalName}</ModalHeader>
    <ModalBody>
      {media?.kind === "video" && (
        <video
          src={media.url}
          controls
          autoPlay
          playsInline
          className="w-100"
          style={{ maxHeight: "70vh", background: "#000" }}
        />
      )}
      {media?.kind === "audio" && (
        <audio src={media.url} controls autoPlay className="w-100" />
      )}
    </ModalBody>
  </Modal>
);

export default MediaPlayerModal;
