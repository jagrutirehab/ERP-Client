import React, { useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import FileCard from "../../../Components/Common/FileCard";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { convertSnakeToTitle } from "../../../utils/convertSnakeToTitle";
import {
  COUNSELLING_NOTE,
  mentalExaminationV2Fields,
} from "../../../Components/constants/patient";
import { SPECIAL_REQUIREMENT_LABELS } from "../../../utils/specialRequirements";

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

  const GRID_ROW_EXCLUDED_KEYS = ["_id"];

  const mentalExaminationV2FieldsMap = {};
  mentalExaminationV2Fields.forEach((f) => {
    if (f.name) {
      mentalExaminationV2FieldsMap[f.name] = f.label;
    }
  });

  // Recursively checks whether a value (leaf, nested object, or array of
  // grid rows) has any real content. For grid rows, the first key is
  // assumed to be the fixed row label (matches how the form seeds them),
  // so a row only counts as "filled" if something besides that label is set.
  const hasContent = (val) => {
    if (val === null || val === undefined || val === "") return false;
    if (Array.isArray(val)) {
      if (val.length === 0) return false;
      if (typeof val[0] === "object" && val[0] !== null) {
        const labelKey = Object.keys(val[0])[0];
        return val.some((row) =>
          Object.entries(row).some(
            ([k, v]) =>
              k !== labelKey &&
              !GRID_ROW_EXCLUDED_KEYS.includes(k) &&
              hasContent(v),
          ),
        );
      }
      return val.some(hasContent);
    }
    if (typeof val === "object") {
      return Object.values(val).some(hasContent);
    }
    return true; // non-empty string/number, or a boolean (true/false both meaningful)
  };

  const formatLeafValue = (value) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.filter(Boolean).join(", ");
    return String(value);
  };

  // Renders one field group (addictionFields / psychiatricFields / geriatricFields)
  // recursively — handles plain leaf fields, nested sub-groups, and grid arrays.
  const renderAssessmentGroup = (obj) =>
    Object.entries(obj || {}).map(([key, value], i) => {
      if (!hasContent(value)) return null;

      // Grid data (array of row objects) — e.g. substanceProfile, painAssessment.parameters
      if (Array.isArray(value) && typeof value[0] === "object") {
        const labelKey = Object.keys(value[0])[0];
        const filledRows = value.filter((row) =>
          Object.entries(row).some(
            ([k, v]) =>
              k !== labelKey &&
              !GRID_ROW_EXCLUDED_KEYS.includes(k) &&
              hasContent(v),
          ),
        );
        if (filledRows.length === 0) return null;
        return (
          <Col xs={12} key={key + i}>
            <p className="mb-1 fw-semibold">
              {convertCamelCaseToTitleCase(key)}:
            </p>
            {filledRows.map((row, ri) => (
              <p key={ri} className="mb-1 ms-3 fs-xs-9 fs-md-11">
                {Object.entries(row)
                  .filter(
                    ([k, v]) =>
                      !GRID_ROW_EXCLUDED_KEYS?.includes(k) && hasContent(v),
                  )
                  .map(([rk, rv], rj) => (
                    <span key={rj} className="me-3">
                      <span className="fw-semibold">
                        {convertCamelCaseToTitleCase(rk)}:
                      </span>{" "}
                      {formatLeafValue(rv)}
                    </span>
                  ))}
              </p>
            ))}
          </Col>
        );
      }

      // Nested sub-group (e.g. patternOfUse, dependenceFeatures)
      if (typeof value === "object" && !Array.isArray(value)) {
        return (
          <Col xs={12} key={key + i}>
            <h6 className="mt-2 mb-1 fs-xs-11 fs-md-13">
              {convertCamelCaseToTitleCase(key)}
            </h6>
            <Row>{renderAssessmentGroup(value)}</Row>
          </Col>
        );
      }

      // Plain leaf field
      return (
        <Col key={key + i} xs={12}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                {convertCamelCaseToTitleCase(key)}:-
              </span>
              {formatLeafValue(value)}
            </p>
          </div>
        </Col>
      );
    });

  const patientTypeLabels = {
    addiction: "Addiction Assessment",
    psychiatric: "Psychiatric Assessment",
    geriatric: "Geriatric / Dementia / Palliative Assessment",
  };

  console.log("data", data);

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
        {(() => {
          const groupKey = data?.patientType
            ? `${data.patientType}Fields`
            : null;
          const groupData = groupKey ? data?.[groupKey] : null;
          if (!groupData || !hasContent(groupData)) return null;
          return (
            <>
              <h6 className="fs-xs-12 fs-md-14 display-6">
                {patientTypeLabels[data.patientType]}
              </h6>
              <Row>{renderAssessmentGroup(groupData)}</Row>
              <Divider />
            </>
          );
        })()}
        {data?.detailHistory && (
          <h6 className="fs-xs-12 fs-md-14 display-6">Detail History</h6>
        )}

        {data?.detailHistory &&
          Object.entries(data.detailHistory)
            .filter(([key]) => key !== "pastHistory")
            .map((d, i) => (
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
        {data?.mentalExaminationV2 &&
          (() => {
            const v2 = data.mentalExaminationV2;

            const groupOrder = [
              "appearanceAndBehavior",
              "speech",
              "mood",
              "affect",
              "thought",
              "perception",
              "cognition",
              "insight",
              "judgment",
              "remarks",
            ];

            const mergedAffect = {
              ...(data.mood?.affect && { affect: data.mood.affect }),
              affectNotes: v2.mood?.affectNotes || "",
              ...(v2.affectV2 || {}),
            };

            return (
              <>
                {groupOrder.map((groupKey, index) => {
                  if (!v2[groupKey] && groupKey !== "affect") return null;

                  const groupValue = v2[groupKey];
                  const isObject =
                    typeof groupValue === "object" && groupValue !== null;

                  // MOOD + AFFECT
                  if (groupKey === "mood") {
                    const filteredMood = { ...groupValue };
                    delete filteredMood.affect;
                    delete filteredMood.affectNotes;

                    return (
                      <Col xs={12} key={index}>
                        <h6 className="mt-3 mb-2">Mood</h6>

                        {Object.entries(filteredMood).map(([k, v], j) => (
                          <p key={j} className="mb-1">
                            <span className="fw-semibold me-2">
                              {mentalExaminationV2FieldsMap[k] ??
                                convertCamelCaseToTitleCase(k)}
                              :
                            </span>
                            {convertSnakeToTitle(v)}
                          </p>
                        ))}

                        <h6 className="mt-3 mb-2">Affect</h6>

                        {Object.entries(mergedAffect).map(([k, v], j) => (
                          <p key={j} className="mb-1">
                            <span className="fw-semibold me-2">
                              {mentalExaminationV2FieldsMap[k] ??
                                convertCamelCaseToTitleCase(k)}
                              :
                            </span>
                            {convertSnakeToTitle(v)}
                          </p>
                        ))}
                      </Col>
                    );
                  }

                  // PERCEPTION
                  if (groupKey === "perception") {
                    const perceptionObj = {};

                    if (v2.perception && String(v2.perception).trim() !== "")
                      perceptionObj.perception = v2.perception;

                    if (
                      v2.perceptionNotes &&
                      String(v2.perceptionNotes).trim() !== ""
                    )
                      perceptionObj.perceptionNotes = v2.perceptionNotes;

                    if (Object.keys(perceptionObj).length === 0) return null;

                    return (
                      <Col xs={12} key={index}>
                        <h6 className="mt-3 mb-2">Perception</h6>

                        {Object.entries(perceptionObj).map(([k, v], j) => (
                          <p key={j} className="mb-1">
                            <span className="fw-semibold me-2">
                              {mentalExaminationV2FieldsMap[k] ??
                                convertCamelCaseToTitleCase(k)}
                              :
                            </span>
                            {convertSnakeToTitle(v)}
                          </p>
                        ))}
                      </Col>
                    );
                  }

                  // simple fields
                  if (["judgment", "remarks"].includes(groupKey)) {
                    if (!groupValue || String(groupValue).trim() === "")
                      return null;

                    return (
                      <Col xs={12} key={index}>
                        <h6 className="mt-3 mb-2">
                          {convertCamelCaseToTitleCase(groupKey)}
                        </h6>
                        <p className="mb-1">
                          {convertSnakeToTitle(groupValue)}
                        </p>
                      </Col>
                    );
                  }

                  // NORMAL OBJECT GROUPS
                  if (isObject) {
                    return (
                      <Col xs={12} key={index}>
                        <h6 className="mt-3 mb-2">
                          {convertCamelCaseToTitleCase(groupKey)}
                        </h6>

                        {Object.entries(groupValue).map(([k, v], j) => (
                          <p key={j} className="mb-1">
                            <span className="fw-semibold me-2">
                              {mentalExaminationV2FieldsMap[k] ??
                                convertCamelCaseToTitleCase(k)}
                              :
                            </span>
                            {convertSnakeToTitle(v)}
                          </p>
                        ))}
                      </Col>
                    );
                  }

                  return null;
                })}

                <Divider />
              </>
            );
          })()}

        {/* {data?.physicalExamination && (
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
        {data?.physicalExamination && <Divider />} */}

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
                    {Array.isArray(value)
                      ? value
                          .map((item) => {
                            if (!item) return "";

                            if (typeof item === "object" && item.code) {
                              return item.code;
                            }

                            if (typeof item === "object") {
                              const chars = Object.keys(item)
                                .filter((k) => !isNaN(k))
                                .sort((a, b) => a - b)
                                .map((k) => item[k]);

                              if (chars.length) {
                                return chars.join("");
                              }
                            }

                            // Case 3: pure string
                            if (typeof item === "string") {
                              return item;
                            }

                            return "";
                          })
                          .filter(Boolean)
                          .join(", ")
                      : typeof value === "string"
                        ? value
                        : ""}
                  </p>
                </div>
              </Col>
            );
          })}
        {data?.doctorSignature && <Divider />}
        {(() => {
          const sr = data?.specialRequirements;
          const order = Object.keys(SPECIAL_REQUIREMENT_LABELS);
          const answered = sr
            ? order.filter((k) => sr[k] === true || sr[k] === false)
            : [];
          if (answered.length === 0) return null;
          return (
            <>
              <h6 className="fs-xs-12 fs-md-14 display-6">
                Special Requirements
              </h6>
              {answered.map((k, i) => (
                <Col key={i} xs={12}>
                  <div className="mt-1 mb-1">
                    <p className="fs-xs-9 fs-md-11 mb-0">
                      <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                        {SPECIAL_REQUIREMENT_LABELS[k]}:-
                      </span>
                      {sr[k] === true ? "Yes" : "No"}
                    </p>
                  </div>
                </Col>
              ))}
            </>
          );
        })()}
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
