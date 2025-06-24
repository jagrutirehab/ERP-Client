import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import Divider from "./Divider";
import FileCard from "./FileCard";
import PreviewFile from "./PreviewFile";
import DeleteModal from "./DeleteModal";

const UploadedFiles = ({
  title,
  files,
  deleteFilePermanently,
  showDeleteButton = true,
}) => {
  //get file
  const [file, setFile] = useState({
    img: null,
    isOpen: false,
  });

  //delete file
  const [deleteFile, setDeleteFile] = useState({
    img: null,
    isOpen: false,
  });

  //delete file modal functions
  const deleteCloseFile = () => {
    deleteFilePermanently();
    setDeleteFile({ img: null, isOpen: false });
  };

  const onClose = () => {
    setDeleteFile({ img: null, isOpen: false });
  };

  //file card functions
  const getDeleteFile = (img) => {
    setDeleteFile({
      img: img,
      isOpen: true,
    });
  };
  const onPreview = (img) => {
    setFile({
      img,
      isOpen: true,
    });
  };

  return (
    <Row className="row-gap-3">
      <Col xs={12}>
        <div className="d-flex align-items-center gap-3">
          <h6 className="display-6 fs-5 text-nowrap">{title || ""}</h6>
          <Divider />
        </div>
      </Col>
      {(files || []).map((file) => (
        <Col xs={12} md={4}>
          <FileCard
            file={file}
            showDeleteButton={showDeleteButton}
            onDelete={getDeleteFile}
            onPreview={onPreview}
          />
        </Col>
      ))}
      <PreviewFile
        // title={}
        file={file.img}
        isOpen={file.isOpen}
        toggle={() => setFile({ img: null, isOpen: false })}
      />
      <DeleteModal
        onDeleteClick={deleteCloseFile}
        onCloseClick={onClose}
        show={deleteFile.isOpen}
      />
    </Row>
  );
};

UploadedFiles.propTypes = {
  title: PropTypes.string,
  files: PropTypes.array.isRequired,
  deleteFilePermanently: PropTypes.func,
};

export default UploadedFiles;
