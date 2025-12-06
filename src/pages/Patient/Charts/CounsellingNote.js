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
        {data?.objective && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Objective of The session:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.objective}</p>
          </div>
        )}
        {data?.shortTermGoals && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Short term goals:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.shortTermGoals}</p>
          </div>
        )}
        {data?.longTermGoals && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Long term goals:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.longTermGoals}</p>
          </div>
        )}
        {data?.notes && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Notes:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.notes}</p>
          </div>
        )}
        {data?.homework && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Homework/Task assigned:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.homework}</p>
          </div>
        )}
        {data?.reviewPreviousTask && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Review of previous task:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">
              {data.reviewPreviousTask}
            </p>
          </div>
        )}
        {data?.conclusion && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Conclusion:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.conclusion}</p>
          </div>
        )}
        {data?.nextEndGoal && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Goal for next session:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.nextEndGoal}</p>
          </div>
        )}
        {/* Previos schema field for previos data */}
        {data?.endGoalAchieved && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">End goal achieved:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.endGoalAchieved}</p>
          </div>
        )}
        {/* Previos schema field for previos data */}
        {data?.nextSessionDate && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Next session date:-</h6>
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
