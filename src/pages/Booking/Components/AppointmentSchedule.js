"use client";
import React, { useState } from "react";
import { Button, Col, Input, Label, Row } from "reactstrap";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { connect } from "react-redux";

const AppointmentSchedule = ({ userCenters }) => {
  const [workingSchedule, setWorkingSchedule] = useState([]);

  const removeSchedule = (idx) => {
    const list = [...workingSchedule];
    list.splice(idx, 1);
    setWorkingSchedule(list);
  };

  return (
    <React.Fragment>
      <div>
        <Row className="mt-2">
          {(workingSchedule || []).map((item, idx) => (
            <React.Fragment key={idx}>
              <Col xs={2}>
                <div className="mb-3">
                  <Label size="sm">Type</Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    required
                    value={item.type}
                    onChange={(e) => {
                      //   const id =
                      //     e.target.options[e.target.selectedIndex].getAttribute(
                      //       "id"
                      //     );
                      const value = e.target.value;
                      const schedules = [...workingSchedule];
                      schedules[idx] = {
                        ...schedules[idx],
                        type: value,
                      };
                      setWorkingSchedule(schedules);
                    }}
                  >
                    <option value="" selected disabled hidden>
                      Choose here
                    </option>
                    {(["ONLINE", "OFFLINE"] || []).map((option, idx) => (
                      <option key={idx} id={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Input>
                </div>
              </Col>
              <Col xs={4}>
                <div className="mb-3">
                  <Label htmlFor="startDate" className="form-label">
                    Start Date
                    <span className="text-danger">*</span>
                  </Label>
                  <Flatpicker
                    name="startDate"
                    value={""}
                    onChange={([e]) => {
                      const schedules = [...workingSchedule];
                      schedules[idx]["startDate"] = e;
                      setWorkingSchedule(schedules);
                    }}
                    options={{
                      enableTime: true,
                      dateFormat: "d M, Y G:i:S K",
                      time_24hr: false,
                    }}
                    className="form-control py-1 shadow-none bg-light"
                    id="startDate"
                  />
                </div>
              </Col>
              <Col xs={4}>
                <div className="mb-3">
                  <Label htmlFor="endDate" className="form-label">
                    End Date
                    <span className="text-danger">*</span>
                  </Label>
                  <Flatpicker
                    name="endDate"
                    value={""}
                    onChange={([e]) => {
                      const schedules = [...workingSchedule];
                      schedules[idx]["endDate"] = e;
                      setWorkingSchedule(schedules);
                    }}
                    options={{
                      enableTime: true,
                      dateFormat: "d M, Y G:i:S K",
                      time_24hr: false,
                    }}
                    className="form-control py-1 shadow-none bg-light"
                    id="endDate"
                  />
                </div>
              </Col>

              <Col xs={2}>
                <div className="mb-3">
                  <Label size="sm">Centers</Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    required
                    value={item.center?.title}
                    onChange={(e) => {
                      const id =
                        e.target.options[e.target.selectedIndex].getAttribute(
                          "id"
                        );
                      const schedules = [...workingSchedule];
                      schedules[idx]["center"] = {
                        _id: id,
                        title: e.target.value,
                      };
                      setWorkingSchedule(schedules);
                    }}
                  >
                    <option value="" selected disabled hidden>
                      Choose here
                    </option>
                    {(userCenters || []).map((option, idx) => (
                      <option key={idx} id={option._id} value={option.title}>
                        {option.title}
                      </option>
                    ))}
                  </Input>
                </div>
              </Col>

              <Col xs={2} className="d-flex ">
                <Button
                  size="sm"
                  onClick={() => removeSchedule(idx)}
                  color="danger"
                  outline
                >
                  <i className="ri-close-circle-line font-size-20 mt-auto"></i>
                </Button>
              </Col>

              {/* <RenderWhen isTrue={item?.days?.length > 0}>
                      {(item.sessions || []).map((sess, i) => (
                        <Col key={i} md={6}>
                          <Label>Session {i + 1}</Label>
                          <div className="mb-3">
                            <InputGroup>
                              <InputGroupText className="py-0">
                                <Label
                                  htmlFor="start"
                                  className="form-label mb-0 fs-9"
                                >
                                  Start Time
                                </Label>
                              </InputGroupText>
                              <Input
                                bsSize="sm"
                                type="select"
                                name="start"
                                required
                                disabled={
                                  i === 1 &&
                                  !item.sessions[0].start &&
                                  !item.sessions[0].start
                                }
                                onChange={(e) => handleTime(e, idx, i)}
                                value={
                                  sess.start
                                    ? format(new Date(sess.start), "HH:mm")
                                    : ""
                                }
                                className="form-control"
                                placeholder=""
                                id="start"
                              >
                                <option value="" selected disabled hidden>
                                  Choose here
                                </option>
                                {(hours || []).map((hour, idx) => (
                                  <option
                                    value={format(new Date(hour), "HH:mm")}
                                    key={idx}
                                    id={hour}
                                  >
                                    {format(hour, "hh:mm a")}
                                  </option>
                                ))}
                              </Input>

                              <InputGroupText className="p-">
                                <Label
                                  htmlFor="start"
                                  className="form-label mb-0 fs-7"
                                >
                                  End Time
                                </Label>
                              </InputGroupText>
                              <Input
                                bsSize="sm"
                                type="select"
                                name="end"
                                required
                                // required={i === 1 && item.sessions[1].start}
                                disabled={
                                  i === 1 &&
                                  !item.sessions[0].start &&
                                  !item.sessions[0].end
                                }
                                onChange={(e) => handleTime(e, idx, i)}
                                value={
                                  sess.end
                                    ? format(new Date(sess.end), "HH:mm")
                                    : ""
                                }
                                className="form-control"
                                placeholder=""
                                id="end"
                              >
                                <option value="" selected disabled hidden>
                                  Choose here
                                </option>
                                {(hours || []).map((hour, idx) => (
                                  <option
                                    id={hour}
                                    value={format(new Date(hour), "HH:mm")}
                                    key={idx}
                                  >
                                    {format(hour, "hh:mm a")}
                                  </option>
                                ))}
                              </Input>
                            </InputGroup>
                          </div>
                        </Col>
                      ))}
                    </RenderWhen> */}
            </React.Fragment>
          ))}

          <Col xs={12}>
            <div className="text-start my-2">
              <button
                onClick={() => {
                  setWorkingSchedule([
                    ...workingSchedule,
                    {
                      center: null,
                      days: [],
                      sessions: [
                        { start: "", end: "" },
                        // { start: "", end: "" },
                      ],
                    },
                  ]);
                }}
                type="button"
                className="btn btn-primary btn-sm btn-outline ms-auto"
              >
                Add more timings
              </button>
            </div>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  userCenters: state.User.userCenters,
});

export default connect(mapStateToProps)(AppointmentSchedule);
