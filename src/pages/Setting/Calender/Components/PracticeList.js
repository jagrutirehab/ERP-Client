import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Row } from "reactstrap";
import { connect } from "react-redux";
import { daysInNumeric } from "../../../../Components/constants/scheduler";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import lodash from "lodash";

const PracticeList = ({ doctors, toggleForm }) => {
  return (
    <React.Fragment>
      <div>
        <Row>
          <Col className="bg-white p-3" xs={12}>
            <Row>
              <Col xs={1}>#</Col>
              <Col xs={2}>Practice & Doctors</Col>
              <Col xs={3}>Days</Col>
              <Col xs={3}>Working Times</Col>
              <Col xs={2}>Type</Col>
              <Col xs={1}></Col>
            </Row>
          </Col>

          {(doctors || []).map((_, idx) => (
            <Row className="align-items-center px-3 py-2" key={_._id}>
              <Col xs={1}>{idx + 1}</Col>
              <Col xs={2}>{_?.name}</Col>
              <Col
                xs={3}
                // className={
                //   _.workingSchedule?.workingSchedule?.length > 1 &&
                //   "border-bottom"
                // }
              >
                {/* {(_.workingSchedule?.workingSchedule || []).map((_, index) => (
                  <div
                    // className={
                    //   _.calenderSetting.workingSchedule?.length > 1 &&
                    //   "border-bottom"
                    // }
                    className="d-flex flex-wrap"
                    key={index}
                  >
                    {(lodash.cloneDeep(_.days) || []).sort().map((day, id) => {
                      const findDay = daysInNumeric.find(
                        (d) => d.value === day
                      );

                      return (
                        <span
                          className="me-1 fs-8"
                          key={uuid()}
                        >{`${findDay?.name?.substring(0, 3)},`}</span>
                      );
                    })}
                  </div>
                ))} */}
              </Col>
              <Col
                xs={3}
                className="ps-4"
                // className={
                //   _.workingSchedule?.workingSchedule?.length > 1 &&
                //   "border-bottom"
                // }
              >
                {/* {(_.workingSchedule?.workingSchedule || []).map((_, index) => (
                  <div key={index}>
                    {(_.sessions || []).map((sess, i) => (
                      <div key={_._id + i} className="fs-8">
                        {`${format(new Date(sess.start), "hh:mm a")} - ${format(
                          new Date(sess.end),
                          "hh:mm a"
                        )}`}
                      </div>
                    ))}
                  </div>
                ))} */}
              </Col>
              <Col xs={2}>In-clinic Appointment</Col>
              <Col xs={1}>
                <Button
                  size="sm"
                  onClick={() => toggleForm({ doc: _ })}
                  color="light"
                >
                  <i className="ri-arrow-right-s-line font-size-20"></i>
                </Button>
              </Col>
            </Row>
          ))}
        </Row>
      </div>
    </React.Fragment>
  );
};

PracticeList.propTypes = {
  doctors: PropTypes.array,
};

const mapStateToProps = (state) => ({
  doctors: state.Setting.doctorSchedule,
});

export default connect(mapStateToProps)(PracticeList);
