import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { format } from "date-fns";
import RenderWhen from "./RenderWhen";
import {
  BILL,
  CHART,
  LEAD,
  PATIENT,
  PATIENT_BILL,
  PATIENT_CENTER,
  PATIENT_CHART,
  PATIENT_STATUS,
} from "../constants/log";

const Timeline = ({ displayDetails, data }) => {
  return (
    <React.Fragment>
      <div className="px-2 py-">
        <h5 className="">Timeline</h5>
        <div className="timeline-2">
          {/* <div className="timeline-year">
            <p>12 Dec 2021</p>
          </div> */}
          <div className="timeline-continue">
            {(data || []).map((item) => (
              <Row key={item._id} className="timeline-right">
                <Col xs={12}>
                  <div className="timeline-date fs-13 mb- ">
                    <div>
                      <h6 className="display-5 text-primary fs-12 mb-0">
                        {item.author?.name} ({item.author?.role})
                      </h6>
                    </div>
                    <div>
                      {format(new Date(item.createdAt), "dd MMMM yyyy hh:mm a")}
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="timeline-box">
                    <div className="timeline-text">
                      <div className="d-flex">
                        {/* <img src={avatar7} alt="" className="avatar-sm rounded" /> */}
                        <div className="flex-grow-1 ms-3">
                          <h5 className="mb-1 fs-15">{item.description}</h5>
                          {/* <RenderWhen isTrue={}>

                          </RenderWhen> */}
                          <p>{displayDetails(item)}</p>
                          {/* <p className="text-muted mb-0">
            It makes a statement, it’s impressive graphic design.
            Increase or decrease the letter spacing depending on
            the situation and try, try again until it looks right,
            and each letter has the perfect spot of its own.{" "}
          </p> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            ))}

            {/* <Row className="timeline-right">
              <Col xs={12}>
                <p className="timeline-date">02:35AM to 04:30PM</p>
              </Col>
              <Col xs={12}>
                <div className="timeline-box">
                  <div className="timeline-text">
                    <h5 className="fs-15">Trip planning</h5>
                    <p className="text-muted">
                      In the trip planner, keep only one or two activities in a
                      day if the purpose of the trip is to relax and take it
                      easy during the vacation :
                    </p>
                    <Row className="border border-dashed rounded gx-2 p-2">
                      <Col xs={3}>
                        <Link to="#">
                          <img
                            // src={small7}
                            alt=""
                            className="img-fluid rounded"
                          />
                        </Link>
                      </Col>
                      <Col xs={3}>
                        <Link to="#">
                          <img
                            // src={small3}
                            alt=""
                            className="img-fluid rounded"
                          />
                        </Link>
                      </Col>
                      <Col xs={3}>
                        <Link to="#">
                          <img
                            // src={small10}
                            alt=""
                            className="img-fluid rounded"
                          />
                        </Link>
                      </Col>
                      <Col xs={3}>
                        <Link to="#">
                          <img
                            // src={small9}
                            alt=""
                            className="img-fluid rounded"
                          />
                        </Link>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
            </Row> */}

            {/* <Row>
              <Col xs={12}>
                <div className="timeline-year">
                  <p>08 Dec 2021</p>
                </div>
              </Col>
            </Row> */}

            {/* <Row className="timeline-right">
              <Col xs={12}>
                <p className="timeline-date">02:35AM to 04:30PM</p>
              </Col>
              <Col xs={12}>
                <div className="timeline-box">
                  <div className="timeline-text">
                    <h5 className="fs-15">Velzon - Project Discussion</h5>
                    <p className="text-muted mb-0">
                      The purpose of the discussion is to interpret and describe
                      the significance of your findings in light of what was
                      already known about the research problem being
                      investigated, and to explain any new understanding or
                      fresh insights about the problem after you've taken the
                      findings into consideration.
                    </p>
                  </div>
                </div>
              </Col>
            </Row> */}

            {/* <Row className="timeline-right">
              <Col xs={12}>
                <p className="timeline-date">10:24AM to 11:15PM</p>
              </Col>
              <Col xs={12}>
                <div className="timeline-box">
                  <div className="timeline-text">
                    <h5 className="fs-15">Client Meeting (Nancy Martino)</h5>
                    <p className="text-muted mb-0">
                      A client meeting, meaning, direct collaboration and
                      communication with a customer, is the best way to
                      understand their needs and how you can help support them.
                    </p>
                  </div>
                </div>
              </Col>
            </Row> */}

            {/* <Row className="timeline-right">
              <Col xs={12}>
                <p className="timeline-date">9:20AM to 10:05PM</p>
              </Col>
              <Col xs={12}>
                <div className="timeline-box">
                  <div className="timeline-text">
                    <h5 className="fs-15">Designer & Developer Meeting</h5>
                    <ul className="mb-0 text-muted vstack gap-2">
                      <li>Last updates</li>
                      <li>Weekly Planning</li>
                      <li>Work Distribution</li>
                    </ul>
                  </div>
                </div>
              </Col>
            </Row> */}
          </div>

          {/* <div className="timeline-year">
            <p>
              <span>05 Dec 2021</span>
            </p>
          </div>
          <div className="timeline-launch">
            <div className="timeline-box">
              <div className="timeline-text">
                <h5 className="fs-15">Our Company Activity</h5>
                <p className="text-muted text-capitalize mb-0">
                  Wow...!!! What a Journey So Far...!!!
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </React.Fragment>
  );
};

Timeline.propTypes = {
  data: PropTypes.array.isRequired,
};

export default Timeline;
