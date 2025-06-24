import React, { useState } from "react";
import PropTypes from "prop-types";
import Divider from "../../../../Components/Common/Divider";
import { Col, Row } from "reactstrap";
import FileCard from "../../../../Components/Common/FileCard";
import PreviewFile from "../../../../Components/Common/PreviewFile";
import DeleteModal from "../../../../Components/Common/DeleteModal";
import { removeLabReportFile } from "../../../../store/actions";
import { useDispatch } from "react-redux";

const UploadedFiles = ({ id, chartId, files }) => {
  const dispatch = useDispatch();

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
  const deleteFilePermanently = () => {
    dispatch(removeLabReportFile({ id, chartId, fileId: deleteFile.img._id }));
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
          <h6 className="display-6 fs-5 text-nowrap">Uploaded Files</h6>
          <Divider />
        </div>
      </Col>
      {(files || []).map((file) => (
        <Col xs={12} md={4}>
          <FileCard
            file={{ ...file.file, _id: file._id }}
            showDeleteButton
            onDelete={getDeleteFile}
            onPreview={onPreview}
          />
        </Col>
      ))}
      <PreviewFile
        img={file.img}
        isOpen={file.isOpen}
        toggle={() => setFile({ img: null, isOpen: false })}
      />
      <DeleteModal
        onDeleteClick={deleteFilePermanently}
        onCloseClick={onClose}
        show={deleteFile.isOpen}
      />
    </Row>
  );
};
UploadedFiles.propTypes = {
  id: PropTypes.string,
  chartId: PropTypes.string,
  files: PropTypes.array,
};

export default UploadedFiles;
