import React from "react";
import PropTypes from "prop-types";
import CustomModal from "./Modal";

const PreviewFile = ({ title = "Preview File", file, isOpen, toggle }) => {
  return (
    <React.Fragment>
      <CustomModal
        size={"xl"}
        centered
        title={title}
        isOpen={isOpen}
        toggle={toggle}
      >
        {file?.type === "application/pdf" ? (
          <iframe
            src={file.url}
            frameBorder="0"
            scrolling="auto"
            height="100%"
            width="100%"
          ></iframe>
        ) : file?.type.includes("image/") ? (
          <img
            className="gallery-img img-fluid mx-auto"
            src={file?.url}
            alt=""
          />
        ) : null}
      </CustomModal>
    </React.Fragment>
  );
};

PreviewFile.propTypes = {
  img: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default PreviewFile;
