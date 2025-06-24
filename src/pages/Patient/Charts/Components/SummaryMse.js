import React from "react";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import Divider from "../../../../Components/Common/Divider";

const SummaryMse = ({ mse, title }) => {
  return (
    <React.Fragment>
      {mse && (
        <>
          <div className="d-block text-center mt-3 mb-3">
            <Divider />
          </div>
          <h6 className="fs-xs-12 fs-md-14 display-6">{title}</h6>
        </>
      )}

      {mse?.appearance && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Appearance and Behavior:-
              </span>
              {mse.appearance}
            </p>
          </div>
        </Col>
      )}
      {mse?.ecc && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                ECC / Rapport:-
              </span>
              {mse.ecc}
            </p>
          </div>
        </Col>
      )}
      {mse?.speech && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Speech:-
              </span>
              {mse.speech}
            </p>
          </div>
        </Col>
      )}
      {mse?.mood && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Mood:-
              </span>
              {mse.mood}
            </p>
          </div>
        </Col>
      )}
      {mse?.affect && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Affect:-
              </span>
              {mse.affect}
            </p>
          </div>
        </Col>
      )}
      {mse?.thoughts && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Thoughts:-
              </span>
              {mse.thoughts}
            </p>
          </div>
        </Col>
      )}
      {mse?.perception && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Perception:-
              </span>
              {mse.perception}
            </p>
          </div>
        </Col>
      )}
      {mse?.memory && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Memory:-
              </span>
              {mse.memory}
            </p>
          </div>
        </Col>
      )}
      {mse?.abstractThinking && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Abstract Thinking:-
              </span>
              {mse.abstractThinking}
            </p>
          </div>
        </Col>
      )}
      {mse?.socialJudgment && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Social Judgment:-
              </span>
              {mse.socialJudgment}
            </p>
          </div>
        </Col>
      )}
      {mse?.insight && (
        <Col xs={12} md={4} lg={3}>
          <div className="mt-1 mb-1">
            <p className="fs-xs-9 fs-md-11 mb-0">
              <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                Insight:-
              </span>
              {mse.insight}
            </p>
          </div>
        </Col>
      )}
    </React.Fragment>
  );
};

SummaryMse.propTypes = {
  mse: PropTypes.object,
  title: PropTypes.string,
};

export default SummaryMse;
