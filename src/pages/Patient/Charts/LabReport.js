import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import FileCard from "../../../Components/Common/FileCard";
import PreviewFile from "../../../Components/Common/PreviewFile";
import Divider from "../../../Components/Common/Divider";
import { isPreviewable } from "../../../utils/isPreviewable";
import { downloadFile } from "../../../Components/Common/downloadFile";

const LabReport = ({ data, date }) => {
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

  console.log("data", data);


  return (
    <React.Fragment>
      <div>
        <Row>
          {(data || []).map((report) => (
            <Col key={report._id} xs={12}>

              {/* TOP ROW */}
              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h6 className="display-6 text-nowrap fs-xs-10 fs-md-14">
                    {report.name}
                  </h6>

                  {report.description && (
                    <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
                     Description : {report.description}
                    </p>
                  )}
                </div>

                <FileCard onPreview={onPreview} file={report.file} />

              </div>

              {/* AI RESPONSE */}
              {report.aiResponse && (
                <div className="mt-2 p-2 border rounded" style={{ background: "#fafafa" }}>

                  <p className="mb-1">
                    <strong>Test:</strong> {report.aiResponse?.testName}
                  </p>

                  {report.aiResponse?.flaggedItems?.length > 0 && (
                    <>
                      <p className="mb-1"><strong>Flagged:</strong></p>

                      <ul style={{ paddingLeft: 0 }}>
                        {report.aiResponse.flaggedItems.map((item, i) => {

                          const getColor = (severity) => {
                            switch (severity) {
                              case "Very High":
                              case "High":
                                return "#dc3545";
                              case "Medium":
                                return "#ffc107";
                              case "Low":
                              case "Very Low":
                                return "#17a2b8";
                              default:
                                return "#28a745";
                            }
                          };

                          return (
                            <li
                              key={i}
                              style={{
                                listStyle: "none",
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "6px",
                                fontSize: "13px",
                              }}
                            >
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: getColor(item.severity),
                                  marginRight: "8px",
                                }}
                              />

                              <span>
                                {item.name}: {item.value}{" "}
                                <strong>({item.severity})</strong>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}

                  {report.aiResponse?.summary && (
                    <p className="mb-0" style={{ fontSize: "13px" }}>
                      <strong>Summary:</strong> {report.aiResponse.summary}
                    </p>
                  )}
                </div>
              )}

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
