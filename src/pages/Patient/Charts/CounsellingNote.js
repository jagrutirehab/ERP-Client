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

  const normalizeGeminiResponse = (response) => {
    try {
      if (!response || typeof response !== "string") {
        return null;
      }

      let cleaned = response.trim();

      if (cleaned.toLowerCase().startsWith("api error")) {
        return null;
      }

      cleaned = cleaned
        .replace(/^#{1,6}\s?/gm, "")

        .replace(/^\s*[\*\-]\s+/gm, "• ")

        .replace(/\*\*/g, "")
        .replace(/\*/g, "")

        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      return cleaned;

    } catch (error) {
      console.error("Error normalizing Gemini response:", error);
      return null;
    }
  };

  console.log("data", data);


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
        {data?.audioFile?.map((audio, index) => {
          const cleaned = normalizeGeminiResponse(audio?.geminiResponse);

          return (
            <div key={audio._id || index} className="mb-3">
              <audio controls style={{ width: "100%" }}>
                <source src={audio.url} type={audio.type} />
              </audio>

              {cleaned && (
                <div className="mt-3">

                  {/* Label */}
                  <h6 className="fw-semibold mb-2">Detail Overview : </h6>

                  {/* Content */}
                  <div
                    className="text-muted"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {cleaned}
                  </div>

                </div>
              )}
            </div>
          );
        })}
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
