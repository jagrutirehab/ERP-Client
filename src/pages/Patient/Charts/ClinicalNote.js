import React, { useState } from "react";
import PropTypes from "prop-types";
import FileCard from "../../../Components/Common/FileCard";
import { Col, Row } from "reactstrap";
import PreviewFile from "../../../Components/Common/PreviewFile";

const ClinicalNote = ({ data }) => {
  const [fileModal, setFileModal] = useState({
    img: null,
    isOpen: false,
  });

  const onPreview = (img) => {
    setFileModal({ img, isOpen: true });
  };

  return (
    <React.Fragment>
      <div>
        {data?.complaints && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Complaints:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.complaints}</p>
          </div>
        )}
        {data?.observations && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Observations:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.observations}</p>
          </div>
        )}
        {data?.diagnosis && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Diagnosis:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.diagnosis}</p>
          </div>
        )}
        {data?.notes && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Notes:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.notes}</p>
          </div>
        )}
        {data?.files?.length > 0 && (
          <div className="mt-3">
            <h6 className="display-6 fs-5 fs-xs-12">Files</h6>
            <Row className="row-gap-3">
              {(data?.files || []).map((file) => (
                <Col key={file._id} xs={12} md={4}>
                  <FileCard file={file} onPreview={onPreview} />
                </Col>
              ))}
            </Row>
          </div>
        )}
        <PreviewFile
          file={fileModal.img}
          isOpen={fileModal.isOpen}
          toggle={() => setFileModal({ img: null, isOpen: false })}
        />
      </div>
    </React.Fragment>
  );
};

ClinicalNote.propTypes = {
  data: PropTypes.object,
};

export default ClinicalNote;
