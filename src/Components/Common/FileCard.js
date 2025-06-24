import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";

const DeletButton = ({ onDelete, file }) => (
  <div>
    <Button
      onClick={() => onDelete(file)}
      size="sm"
      color="danger"
      type="button"
    >
      <i className="text-white ri-delete-bin-6-line fs-10"></i>
    </Button>
  </div>
);

const FileCard = ({ showDeleteButton = false, onDelete, onPreview, file }) => {
  return (
    <React.Fragment>
      <div className="bg-white p-3 border">
        <div className="d-flex justify-content-between">
          <div className="w-100">
            <h6 className="display-6 fs-10 text-wrap">{file.originalName}</h6>
          </div>
          {showDeleteButton && <DeletButton onDelete={onDelete} file={file} />}
        </div>
        <div className="mt-3">
          <Button
            type="button"
            onClick={() => onPreview(file)}
            size="sm"
            color="primary"
            outline
            className="fs-10"
          >
            Preview
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

FileCard.propTypes = {
  showDeleteButton: PropTypes.bool,
  onDelete: PropTypes.func,
  onPreview: PropTypes.func,
  file: PropTypes.object,
};

export default FileCard;
