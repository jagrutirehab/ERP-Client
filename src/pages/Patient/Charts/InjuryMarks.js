import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import FileCard from "../../../Components/Common/FileCard";
import PreviewFile from "../../../Components/Common/PreviewFile";
import Divider from "../../../Components/Common/Divider";
import { isPreviewable } from "../../../utils/isPreviewable";
import { downloadFile } from "../../../Components/Common/downloadFile";

const InjuryMarks = ({ data, date }) => {
  const [fileModal, setFileModal] = useState({
    img: null,
    isOpen: false,
  });

  const onPreview = (file) => {
    if (isPreviewable(file, date)) {
      setFileModal({ img: file, isOpen: true });
    } else {
      downloadFile(file);
      setFileModal({ img: null, isOpen: false });
    }
  };

  return (
    <React.Fragment>
      <div>
        <Row>
          {(data || []).map((mark) => (
            <Col key={mark._id} xs={12}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1 pe-3">
                  <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                    Description : {mark.description}
                  </p>
                </div>
                <FileCard onPreview={onPreview} file={mark.photo} />
              </div>
              <Divider />
            </Col>
          ))}
        </Row>
        <PreviewFile
          file={fileModal.img}
          toggle={() => setFileModal({ img: null, isOpen: false })}
          isOpen={fileModal.isOpen}
        />
      </div>
    </React.Fragment>
  );
};

InjuryMarks.propTypes = {
  data: PropTypes.array,
  date: PropTypes.any,
};

export default InjuryMarks;
