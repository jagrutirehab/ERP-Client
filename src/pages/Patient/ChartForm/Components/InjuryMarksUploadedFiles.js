import React, { useState } from "react";
import PropTypes from "prop-types";
import Divider from "../../../../Components/Common/Divider";
import { Col, Row } from "reactstrap";
import FileCard from "../../../../Components/Common/FileCard";
import PreviewFile from "../../../../Components/Common/PreviewFile";
import DeleteModal from "../../../../Components/Common/DeleteModal";
import { removeInjuryMarksFile } from "../../../../store/actions";
import { useDispatch } from "react-redux";

const InjuryMarksUploadedFiles = ({ id, chartId, marks }) => {
  const dispatch = useDispatch();

  //preview file
  const [file, setFile] = useState({
    img: null,
    isOpen: false,
  });

  //delete file
  const [deleteFile, setDeleteFile] = useState({
    img: null,
    isOpen: false,
  });

  const deleteFilePermanently = () => {
    dispatch(
      removeInjuryMarksFile({ id, chartId, fileId: deleteFile.img._id })
    );
    setDeleteFile({ img: null, isOpen: false });
  };
  const onClose = () => {
    setDeleteFile({ img: null, isOpen: false });
  };

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
          <h6 className="display-6 fs-5 text-nowrap">Uploaded Photos</h6>
          <Divider />
        </div>
      </Col>
      {(marks || []).map((mark) => (
        <Col key={mark._id} xs={12} md={4}>
          <FileCard
            file={{ ...mark.photo, _id: mark._id }}
            showDeleteButton
            onDelete={getDeleteFile}
            onPreview={onPreview}
          />
        </Col>
      ))}
      <PreviewFile
        file={file.img}
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

InjuryMarksUploadedFiles.propTypes = {
  id: PropTypes.string,
  chartId: PropTypes.string,
  marks: PropTypes.array,
};

export default InjuryMarksUploadedFiles;
