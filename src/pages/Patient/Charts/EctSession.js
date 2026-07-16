import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import { ectSessionSections } from "../../../Components/constants/patient";

const isEmpty = (v) =>
  v == null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === "");

const formatValue = (v) =>
  Array.isArray(v) ? v.filter(Boolean).join(", ") : String(v);

const EctSession = ({ data }) => {
  if (!data) return null;

  // Keep only sections (and rows) that actually have recorded values.
  const sections = ectSessionSections
    .map((section) => ({
      key: section.key,
      title: section.title,
      rows: section.fields
        .map((f) => ({
          label: f.label,
          unit: f.unit,
          value: data?.[section.key]?.[f.name],
        }))
        .filter((r) => !isEmpty(r.value)),
    }))
    .filter((section) => section.rows.length > 0);

  if (sections.length === 0)
    return <p className="text-muted mb-0">No ECT session details recorded.</p>;

  return (
    <React.Fragment>
      <Row>
        {sections.map((section, si) => (
          <React.Fragment key={section.key}>
            <h6 className="fs-xs-12 fs-md-14 display-6">{section.title}</h6>
            {section.rows.map((row, ri) => (
              <Col key={ri} xs={12} md={6}>
                <div className="mt-1 mb-1">
                  <p className="fs-xs-9 fs-md-11 mb-0">
                    <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                      {row.label}
                      {row.unit ? ` (${row.unit})` : ""}:-
                    </span>
                    {formatValue(row.value)}
                  </p>
                </div>
              </Col>
            ))}
            {si < sections.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Row>
    </React.Fragment>
  );
};

EctSession.propTypes = {
  data: PropTypes.object,
};

export default EctSession;
