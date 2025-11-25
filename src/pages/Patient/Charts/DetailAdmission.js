import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import FileCard from "../../../Components/Common/FileCard";
import PreviewFile from "../../../Components/Common/PreviewFile";

const DetailAdmission = ({ data }) => {
  const [fileModal, setFileModal] = useState({
    img: null,
    isOpen: false,
  });

  const onPreview = (img) => {
    setFileModal({ img, isOpen: true });
  };

  function convertCamelCaseToTitleCase(str) {
    return (
      str
        // Split the string at each uppercase letter
        .split(/(?=[A-Z])/)
        // Capitalize the first letter of each word
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        // Join the words with a space
        .join(" ")
    );
  }

  return (
    <React.Fragment>
      <Row>
        {/* {data?.detailAdmission && (
          <h6 className="fs-xs-12 fs-md-14 display-6">Detail Admission</h6>
        )}
        {data?.detailAdmission &&
          Object.entries(data.detailAdmission).map((d, i) => (
            <Col key={i} xs={12}>
              <div className="mt-1 mb-1">
                <p className="fs-xs-9 fs-md-11 mb-0">
                  <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                    {convertCamelCaseToTitleCase(d[0])}:-
                  </span>
                  {i === 0 ? d[1].toUpperCase() : d[1]}
                </p>
              </div>
            </Col>
          ))}
        {data?.detailAdmission && <Divider />} */}
        {data?.ChiefComplaints && (
          <h6 className="fs-xs-12 fs-md-14 display-6">Chief Complaints</h6>
        )}
        {data?.ChiefComplaints &&
          Object.entries(data.ChiefComplaints).map((d, i) => (
            <Col key={i} xs={12}>
              <div className="mt-1 mb-1">
                <p className="fs-xs-9 fs-md-11 mb-0">
                  <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                    Chief Complaint {i + 1}:-
                  </span>
                  {d[1]}
                </p>
              </div>
            </Col>
          ))}
        {data?.ChiefComplaints && <Divider />}
        {/* {data?.ProvisionalDiagnosis && (
          <h6 className="fs-xs-12 fs-md-14 display-6">Provisional Daignosis</h6>
        )}
        {data?.ProvisionalDiagnosis &&
          Object.entries(data.ProvisionalDiagnosis).map((d, i) => (
            <Col key={i} xs={12}>
              <div className="mt-1 mb-1">
                <p className="fs-xs-9 fs-md-11 mb-0">
                  <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                    Diagnosis{i + 1}:-
                  </span>
                  {d[1]}
                </p>
              </div>
            </Col>
          ))}
        {data?.ProvisionalDiagnosis && <Divider />} */}
        {data?.detailHistory && (
          <h6 className="fs-xs-12 fs-md-14 display-6">Detail History</h6>
        )}
        {data?.detailHistory &&
          Object.entries(data.detailHistory).map((d, i) => (
            <Col key={i} xs={12}>
              <div className="mt-1 mb-1">
                <p className="fs-xs-9 fs-md-11 mb-0">
                  <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                    {convertCamelCaseToTitleCase(d[0])}:-
                  </span>
                  {d[1]}
                </p>
              </div>
            </Col>
          ))}
        {data?.detailHistory && <Divider />}
        {(data?.mentalExamination || data?.mentalExaminationV2) && (
          <h6 className="fs-xs-12 fs-md-14 display-6">
            Mental Status Examination
          </h6>
        )}
        {/* {data?.mentalExamination &&
          Object.entries(data.mentalExamination).map((d, i) => (
            <Col key={i} xs={12}>
              <div className="mt-1 mb-1">
                <p className="fs-xs-9 fs-md-11 mb-0">
                  <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                    {d[0] === "effect"
                      ? "Affect"
                      : convertCamelCaseToTitleCase(d[0])}
                    :-
                  </span>
                  {d[1]}
                </p>
              </div>
            </Col>
          ))} */}
        {data?.mentalExamination &&
          Object.entries(data.mentalExamination).map(([key, value], i) => {
            // Define rename rules
            const renameMap = {
              ecc: "Eye to Eye contact and Rapport",
            };

            // Normalize the key for case-insensitive comparison
            const normalizedKey = key.toLowerCase();

            // Choose renamed field or convert normally
            const formattedKey =
              renameMap[normalizedKey] || convertCamelCaseToTitleCase(key);

            return (
              <Col key={i} xs={12}>
                <div className="mt-1 mb-1">
                  <p className="fs-xs-9 fs-md-11 mb-0">
                    <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                      {formattedKey}:-
                    </span>
                    {value}
                  </p>
                </div>
              </Col>
            );
          })}
        {data?.mentalExamination && <Divider />}
        {data?.mentalExaminationV2 && (
          <>
            {Object.entries(data.mentalExaminationV2).map(([groupKey, groupValue], i) => {
              const isObject = typeof groupValue === "object" && groupValue !== null;

              const singleFieldSections = ["judgment", "remarks", "perception"];

              if (isObject) {
                return (
                  <Col xs={12} key={i}>
                    <h6 className="mt-3 mb-2 fs-xs-12 fs-md-14 display-7">
                      {convertCamelCaseToTitleCase(groupKey)}
                    </h6>

                    {Object.entries(groupValue).map(([subKey, subValue], j) => (
                      <div className="mt-1 mb-1" key={j}>
                        <p className="fs-xs-9 fs-md-11 mb-0">
                          <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                            {convertCamelCaseToTitleCase(subKey)}:-
                          </span>
                          {subValue || ""}
                        </p>
                      </div>
                    ))}
                  </Col>
                );
              }

              if (singleFieldSections.includes(groupKey)) {
                return (
                  <Col xs={12} key={i}>
                    <h6 className="mt-3 mb-2 fs-xs-12 fs-md-14 display-7">
                      {convertCamelCaseToTitleCase(groupKey)}
                    </h6>

                    <div className="mt-1 mb-1">
                      <p className="fs-xs-9 fs-md-11 mb-0">
                        {groupValue || ""}
                      </p>
                    </div>
                  </Col>
                );
              }

              return (
                <Col xs={12} key={i}>
                  <div className="mt-1 mb-1">
                    <p className="fs-xs-9 fs-md-11 mb-0">
                      <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                        {convertCamelCaseToTitleCase(groupKey)}:
                      </span>
                      {groupValue}
                    </p>
                  </div>
                </Col>
              );
            })}

            <Divider />
          </>
        )}



        {data?.mentalExaminationV2 && <Divider />}

        {data?.physicalExamination && (
          <h6 className="fs-xs-12 fs-md-14 display-6">Physical Examination</h6>
        )}
        {data?.physicalExamination &&
          Object.entries(data.physicalExamination).map((d, i) => (
            <Col key={i} xs={12}>
              <div className="mt-1 mb-1">
                <p className="fs-xs-9 fs-md-11 mb-0">
                  <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                    {convertCamelCaseToTitleCase(d[0])}:-
                  </span>
                  {d[1]}
                </p>
              </div>
            </Col>
          ))}
        {data?.physicalExamination && <Divider />}

        {data?.doctorSignature && (
          <h6 className="fs-xs-12 fs-md-14 display-6">Daignosis Plan</h6>
        )}
        {/* {data?.doctorSignature &&
          Object.entries(data.doctorSignature).map((d, i) => (
            <Col key={i} xs={12}>
              <div className="mt-1 mb-1">
                <p className="fs-xs-9 fs-md-11 mb-0">
                  <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                    {convertCamelCaseToTitleCase(d[0])}:-
                  </span>
                  {d[1]}
                </p>
              </div>
            </Col>
          ))} */}

        {data?.doctorSignature &&
          Object.entries(data.doctorSignature).map(([key, value], i) => {
            // Define all your rename rules here
            const renameMap = {
              diagnosis: "Final Diagnosis",
              treatment: "Psychological Testing",
              provisionaldiagnosis: "Provisional Diagnosis",
            };

            // Normalize key for comparison
            const normalizedKey = key.toLowerCase();

            // Use mapped name if available, else convert normally
            const formattedKey =
              renameMap[normalizedKey] || convertCamelCaseToTitleCase(key);

            return (
              <Col key={i} xs={12}>
                <div className="mt-1 mb-1">
                  <p className="fs-xs-9 fs-md-11 mb-0">
                    <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                      {formattedKey}:-
                    </span>
                    {value}
                  </p>
                </div>
              </Col>
            );
          })}
        {data?.consentFiles?.length > 0 && <Divider />}

        {data?.consentFiles?.length > 0 && (
          <div className="mt-3">
            <h6 className="display-6 fs-5 fs-xs-12">Consent Files</h6>
            <Row className="row-gap-3">
              {(data?.consentFiles || []).map((file) => (
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
      </Row>
    </React.Fragment>
  );
};

DetailAdmission.propTypes = {
  data: PropTypes.object,
};

export default DetailAdmission;
