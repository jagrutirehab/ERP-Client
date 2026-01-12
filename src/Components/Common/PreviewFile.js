import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "./Modal";
import { Spinner } from "reactstrap";

const PreviewFile = ({ title = "Preview File", file, isOpen, toggle }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) setLoading(true);
  }, [file, isOpen]);

  if (!file) return null;

  const url = file.url;

  const isPdf =
    file.type === "application/pdf" ||
    url?.toLowerCase().endsWith(".pdf");

  const isImage =
    file.type?.startsWith("image/") ||
    /\.(png|jpg|jpeg|webp)$/i.test(url);

  return (
    <CustomModal
      size="xl"
      centered
      title={title}
      isOpen={isOpen}
      toggle={toggle}
    >
      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: 300 }}
        >
          <Spinner color="primary" />
        </div>
      )}
      {isPdf && (
        <iframe
          src={url}
          title={file?.originalName || "Attachment Preview"}
          width="100%"
          height="600"
          style={{
            display: loading ? "none" : "block",
            border: "none"
          }}
          onLoad={() => setLoading(false)}
        />
      )}

      {isImage && (
        <img
          src={url}
          alt="Preview"
          className="img-fluid mx-auto d-block"
          onLoad={() => setLoading(false)}
        />
      )}

      {!isPdf && !isImage && (
        <p className="text-center text-muted">
          Preview not supported for this file type
        </p>
      )}
    </CustomModal>
  );
};

PreviewFile.propTypes = {
  title: PropTypes.string,
  file: PropTypes.shape({
    url: PropTypes.string.isRequired,
    type: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default PreviewFile;
