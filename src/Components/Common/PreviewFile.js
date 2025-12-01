import React from "react";
import PropTypes from "prop-types";
import CustomModal from "./Modal";

const PreviewFile = ({ title = "Preview File", file, isOpen, toggle }) => {
  const isS3 = file?.url?.includes("amazonaws.com");

  const pdfSrc = isS3
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(file?.url)}`
    : file?.url;

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
            src={pdfSrc}
            frameBorder="0"
            scrolling="auto"
            style={{ width: "100%", minHeight: "500px" }}
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
