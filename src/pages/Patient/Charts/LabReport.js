import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import FileCard from "../../../Components/Common/FileCard";
import PreviewFile from "../../../Components/Common/PreviewFile";
import Divider from "../../../Components/Common/Divider";

const LabReport = ({ data }) => {
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
        <Row>
          {(data || []).map((report) => (
            <Col key={report._id} xs={12}>
              <div className="d-flex justify-content-between gap-2 align-items-center">
                <div>
                  <h6 className="display-6 text-nowrap fs-xs-10 fs-md-14">
                    {report.name}
                  </h6>
                </div>
                <div>
                  <FileCard onPreview={onPreview} file={report.file} />
                </div>
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

LabReport.propTypes = {
  data: PropTypes.array,
};

export default LabReport;
