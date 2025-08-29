import React, { useState } from "react";
import PropTypes from "prop-types";
import FileCard from "../../../Components/Common/FileCard";
import { Col, Row } from "reactstrap";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { format } from "date-fns";

const CounsellingNote = ({ data }) => {
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
        {data?.conclusion && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Conclusion:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.conclusion}</p>
          </div>
        )}
        {data?.endGoalAchieved && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">End Goal Achieved:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.endGoalAchieved}</p>
          </div>
        )}
        {data?.nextEndGoal && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Next End Goal:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.nextEndGoal}</p>
          </div>
        )}
        {data?.nextSessionDate && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Next Session Date:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">
              {format(new Date(data.nextSessionDate), "dd MMM yyyy")}
            </p>
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

CounsellingNote.propTypes = {
  data: PropTypes.object,
};

export default CounsellingNote;
