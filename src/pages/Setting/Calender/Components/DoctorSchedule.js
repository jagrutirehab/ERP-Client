import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../Components/Common/Modal";
import {
  Row,
  Col,
  Input,
  Label,
  Button,
  Form,
  InputGroup,
  InputGroupText,
  FormGroup,
} from "reactstrap";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import _ from "lodash";
import { eachMinuteOfInterval, format } from "date-fns";
import { useDispatch } from "react-redux";
import {
  addUserWeeklySchedule,
  updateUserWeeklySchedule,
} from "../../../../store/actions";
import Select, { components } from "react-select";
import { setSeconds, setMilliseconds } from "date-fns";
import { generateTimes } from "../../../Booking/Components/Schedule";

// Custom Option component for react-select
const Option = (props) => {
  const { isSelected, innerRef, innerProps, children } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`p-2 ${
        isSelected ? "bg-primary text-white" : "hover:bg-light"
      }`}
    >
      {children}
    </div>
  );
};

// TimeSelect component
const TimeSelect = ({
  value,
  onChange,
  options,
  label,
  required,
  disabled,
  placeholder = "Choose time",
}) => {
  return (
    <div className="position-relative">
      <Label className="form-label mb-1 fw-medium">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Label>
      <Select
        required={required}
        isDisabled={disabled}
        components={{ Option }}
        value={value}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: "36px",
            height: "36px",
            fontSize: "0.875rem",
            borderColor: state.isFocused ? "#0d6efd" : "#dee2e6",
            boxShadow: state.isFocused
              ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
              : "none",
            "&:hover": {
              borderColor: state.isFocused ? "#0d6efd" : "#dee2e6",
            },
            backgroundColor: disabled ? "#e9ecef" : "white",
            borderRadius: "0.375rem",
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          option: (base, state) => ({
            ...base,
            padding: "8px 12px",
            backgroundColor: state.isSelected
              ? "#0d6efd"
              : state.isFocused
              ? "#f8f9fa"
              : "white",
            color: state.isSelected ? "white" : "#212529",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: state.isSelected ? "#0d6efd" : "#f8f9fa",
            },
          }),
          singleValue: (base) => ({
            ...base,
            color: "#212529",
          }),
          placeholder: (base) => ({
            ...base,
            color: "#6c757d",
          }),
        }}
        menuShouldScrollIntoView
        menuPortalTarget={document.body}
        menuPosition="fixed"
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        isClearable={false}
        classNamePrefix="time-select"
      />
    </div>
  );
};

// Update the SessionTypeSelect component to receive setSessionErrors and validateSessionOverlap as props
const SessionTypeSelect = ({
  value,
  onChange,
  sessions,
  disabled,
  currentIndex,
  setSessionErrors,
  validateSessionOverlap,
}) => {
  const options = [
    { value: "OFFLINE", label: "Offline" },
    { value: "ONLINE", label: "Online" },
  ];

  const handleTypeChange = (newType) => {
    // Clear previous error
    // setSessionErrors((prev) => {
    //   const { [currentIndex]: _, ...rest } = prev;
    //   return rest;
    // });

    // Check for overlaps with the new type
    const currentSession = sessions[currentIndex];
    if (currentSession.startTime && currentSession.endTime) {
      const hasOverlap = validateSessionOverlap(
        sessions,
        currentIndex,
        currentSession.startTime,
        currentSession.endTime,
        newType
      );

      // console.log(hasOverlap, "hasOverlap");

      if (hasOverlap) {
        // setSessionErrors((prev) => ({
        //   ...prev,
        //   [`${currentIndex}`]: `This time slot overlaps with another ${newType.toLowerCase()} session`,
        // }));
        return;
      }
    }

    onChange(newType);
  };

  return (
    <div className="position-relative">
      <Label className="form-label mb-1 fw-medium">
        Session Type
        <span className="text-danger ms-1">*</span>
      </Label>
      <Select
        isDisabled={disabled}
        value={options.find((option) => option.value === value)}
        onChange={(e) => handleTypeChange(e.value)}
        options={options}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: "36px",
            height: "36px",
            fontSize: "0.875rem",
            borderColor: state.isFocused ? "#0d6efd" : "#dee2e6",
            boxShadow: state.isFocused
              ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
              : "none",
            "&:hover": {
              borderColor: state.isFocused ? "#0d6efd" : "#dee2e6",
            },
            backgroundColor: disabled ? "#e9ecef" : "white",
            borderRadius: "0.375rem",
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          option: (base, state) => ({
            ...base,
            padding: "8px 12px",
            backgroundColor: state.isSelected
              ? "#0d6efd"
              : state.isFocused
              ? "#f8f9fa"
              : "white",
            color: state.isSelected ? "white" : "#212529",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: state.isSelected ? "#0d6efd" : "#f8f9fa",
            },
          }),
        }}
        menuShouldScrollIntoView
        menuPortalTarget={document.body}
        menuPosition="fixed"
        placeholder="Select type"
        isClearable={false}
        classNamePrefix="session-type-select"
      />
    </div>
  );
};

const DoctorSchedule = ({ weeklySchedule, doctor, userCenters, toggle }) => {
  const dispatch = useDispatch();
  const [workingSchedule, setWorkingSchedule] = useState(() => {
    if (weeklySchedule?.workingSchedule?.length > 0) {
      return _.cloneDeep(weeklySchedule.workingSchedule);
    }
    return [];
  });
  const [sessionErrors, setSessionErrors] = useState({});
  const [error, setError] = useState("");

  console.log(weeklySchedule, "weekly schedule");

  // console.log(sessionErrors, "session errors");

  const handleChange = (e, idx) => {
    let list = [...workingSchedule];
    const prop = e.target.name;
    const value = parseInt(e.target.value);

    if (prop === "days") {
      list.forEach((schedule, otherIdx) => {
        if (
          otherIdx !== idx &&
          schedule.center?._id === list[idx]?.center?._id &&
          schedule.days.includes(value)
        ) {
          const filteredDays = schedule.days.filter((day) => day !== value);
          list[otherIdx].days = filteredDays;
        }
      });
      if (list[idx][prop].includes(value)) {
        // Update the days in the current schedule
        const newDays = list[idx][prop].includes(value)
          ? list[idx][prop].filter((item) => item !== value)
          : [...(list[idx][prop] || []), value];
        list[idx][prop] = newDays;
      } else if (!list[idx][prop].includes(value)) {
        list[idx][prop] = [...(list[idx][prop] || []), value];
      }
    } //else if (prop !== "days") list[idx][prop] = value;
    setWorkingSchedule(list);
  };

  useEffect(() => {
    if (doctor?.data?.workingSchedule) {
      const clonedWorkingSchedule = _.cloneDeep(
        doctor.data.workingSchedule.workingSchedule
      );
      setWorkingSchedule(clonedWorkingSchedule);
    }
  }, [doctor]);

  // Add this validation function
  const validateSessionOverlap = (
    sessions,
    currentIndex,
    newStart,
    newEnd,
    newType
  ) => {
    for (let i = 0; i < sessions.length; i++) {
      if (i === currentIndex) continue;

      const session = sessions[i];
      if (!session.startTime || !session.endTime) continue;

      // If both sessions are of the same type, check for overlap
      if (session.type === newType) {
        const existingStart = new Date(session.startTime);
        const existingEnd = new Date(session.endTime);
        const newStartTime = new Date(newStart);
        const newEndTime = new Date(newEnd);

        if (
          (newStartTime >= existingStart && newStartTime < existingEnd) ||
          (newEndTime > existingStart && newEndTime <= existingEnd) ||
          (newStartTime <= existingStart && newEndTime >= existingEnd)
        ) {
          return true; // Overlap found
        }
      }
    }
    return false; // No overlap
  };

  // Update the handleTime function
  const handleTime = (e, idx, i) => {
    let list = [...workingSchedule];
    const prop = e.target.name;
    const value = e.target.value;

    // Validate time overlap before updating
    if (prop === "startTime" || prop === "endTime") {
      const newStart =
        prop === "startTime" ? value : list[idx].sessions[i].startTime;
      const newEnd = prop === "endTime" ? value : list[idx].sessions[i].endTime;
      const sessionType = list[idx].sessions[i].type;
    }

    list[idx].sessions[i][prop] = value;
    setWorkingSchedule(list);
  };

  const removeSchedule = (idx) => {
    const list = [...workingSchedule];
    list.splice(idx, 1);
    setWorkingSchedule(list);
  };

  const hours = eachMinuteOfInterval(
    {
      start: new Date(new Date().setHours(0)).setMinutes(0),
      end: new Date(new Date().setHours(23)).setMinutes(0),
    },
    { step: 15 }
  );

  // Update the handleSubmit function to validate session types
  const handleSubmit = () => {
    const checkDays = workingSchedule.find((sch) => sch?.days?.length === 0);
    const checkSessions = workingSchedule.some((sch) =>
      sch.sessions.some(
        (session) => !session.type || !session.startTime || !session.endTime
      )
    );

    if (checkSessions) {
      setError(
        "Please fill in all session details including type, start time, and end time"
      );
      return;
    }

    console.log(workingSchedule, "working schedule");

    if (!checkDays) {
      // if (weeklySchedule?.length > 0)
      //   dispatch(
      //     updateUserWeeklySchedule({ workingSchedule, user: doctor?._id })
      //   );
      // else
      dispatch(addUserWeeklySchedule({ workingSchedule, user: doctor?._id }));
      // setWorkingSchedule([]);
      // toggle();
    }
  };

  // console.log(weeklySchedule, "working schedule");

  // console.log(workingSchedule, "working schedule");

  return (
    <React.Fragment>
      {/* <CustomModal
        size={"xl"}
        isOpen={doctor.isOpen}
        // toggle={toggle}
        title={"Doctor Schedule"}
      > */}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
          return false;
        }}
        className="needs-validation"
        action="#"
      >
        <Row>
          {(workingSchedule || []).map((item, idx) => (
            <React.Fragment key={idx}>
              <Col xs={12}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between flex-wrap align-items-center mb-n4 mt-2">
                    {" "}
                    <Label className="form-label">
                      Days <span className="text-danger">*</span>
                    </Label>
                    <Button
                      onClick={() => removeSchedule(idx)}
                      color="danger"
                      size="sm"
                    >
                      <i className="ri-close-circle-line fs-9 text-white"></i>
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap">
                    <div className="d-flex me-3 align-items-center mt-2">
                      <Input
                        className="me-2 mt-0"
                        type="checkbox"
                        name="days"
                        value={1}
                        onChange={(e) => handleChange(e, idx)}
                        checked={item.days?.includes(1)}
                      />
                      <Label className="form-label fs-9 text-black mb-0">
                        Monday
                      </Label>
                    </div>
                    <div className="d-flex me-3 align-items-center mt-2">
                      <Input
                        className="me-2 mt-0"
                        type="checkbox"
                        name="days"
                        value={2}
                        onChange={(e) => handleChange(e, idx)}
                        checked={item.days?.includes(2)}
                      />
                      <Label className="form-label fs-9 text-black mb-0">
                        Tuesday
                      </Label>
                    </div>
                    <div className="d-flex me-3 align-items-center mt-2">
                      <Input
                        className="me-2 mt-0"
                        type="checkbox"
                        name="days"
                        value={3}
                        onChange={(e) => handleChange(e, idx)}
                        checked={item.days?.includes(3)}
                      />
                      <Label className="form-label fs-9 text-black mb-0">
                        Wednesday
                      </Label>
                    </div>
                    <div className="d-flex me-3 align-items-center mt-2">
                      <Input
                        className="me-2 mt-0"
                        type="checkbox"
                        name="days"
                        value={4}
                        onChange={(e) => handleChange(e, idx)}
                        checked={item.days?.includes(4)}
                      />
                      <Label className="form-label fs-9 text-black mb-0">
                        Thursday
                      </Label>
                    </div>
                    <div className="d-flex me-3 align-items-center mt-2">
                      <Input
                        className="me-2 mt-0"
                        type="checkbox"
                        name="days"
                        value={5}
                        onChange={(e) => handleChange(e, idx)}
                        checked={item.days?.includes(5)}
                      />
                      <Label className="form-label fs-9 text-black mb-0">
                        Friday
                      </Label>
                    </div>
                    <div className="d-flex me-3 align-items-center mt-2">
                      <Input
                        className="me-2 mt-0"
                        type="checkbox"
                        name="days"
                        value={6}
                        onChange={(e) => handleChange(e, idx)}
                        checked={item.days?.includes(6)}
                      />
                      <Label className="form-label fs-9 text-black mb-0">
                        Saturday
                      </Label>
                    </div>
                    <div className="d-flex me-3 align-items-center mt-2">
                      <Input
                        className="me-2 mt-0"
                        type="checkbox"
                        name="days"
                        value={0}
                        onChange={(e) => handleChange(e, idx)}
                        checked={item.days?.includes(0)}
                      />
                      <Label className="form-label fs-9 text-black mb-0">
                        Sunday
                      </Label>
                    </div>

                    <div className="mb-3 ms-md-3">
                      <Label size="sm">Centers</Label>
                      <Input
                        bsSize="sm"
                        type="select"
                        required
                        value={item.center}
                        onChange={(e) => {
                          const schedules = [...workingSchedule];
                          schedules[idx]["center"] = e.target.value;
                          setWorkingSchedule(schedules);
                        }}
                      >
                        <option value="" selected disabled hidden>
                          Choose here
                        </option>
                        {(userCenters || []).map((option, idx) => (
                          <option key={idx} value={option._id}>
                            {option.title}
                          </option>
                        ))}
                      </Input>
                    </div>
                  </div>
                </div>
              </Col>
              <RenderWhen isTrue={item?.days?.length > 0}>
                <Col xs={12}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 text-primary">Sessions</h6>
                    <Button
                      color="light"
                      size="sm"
                      className="d-flex align-items-center"
                      onClick={() => {
                        const list = [...workingSchedule];
                        list[idx].sessions.push({
                          startTime: "",
                          endTime: "",
                          type: "",
                        });
                        setWorkingSchedule(list);
                      }}
                    >
                      <i className="ri-add-line me-1"></i> Add Session
                    </Button>
                  </div>
                </Col>
                {(item.sessions || []).map((sess, i) => (
                  <Col key={i} md={6}>
                    <div className="card shadow-sm mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                              style={{ width: "28px", height: "28px" }}
                            >
                              {i + 1}
                            </div>
                            <h6 className="mb-0 text-primary fw-semibold">
                              Session {i + 1}
                            </h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <SessionTypeSelect
                              value={sess.type}
                              onChange={(value) => {
                                const list = [...workingSchedule];
                                list[idx].sessions[i].type = value;
                                setWorkingSchedule(list);
                              }}
                              sessions={item.sessions}
                              currentIndex={i}
                              setSessionErrors={setSessionErrors}
                              validateSessionOverlap={validateSessionOverlap}
                            />
                            {i > 0 && (
                              <Button
                                color="link"
                                className="p-0 text-danger opacity-75 hover-opacity-100 ms-2"
                                onClick={() => {
                                  const updatedSessions = [...item.sessions];
                                  updatedSessions.splice(i, 1);
                                  const updatedSchedule = [...workingSchedule];
                                  updatedSchedule[idx].sessions =
                                    updatedSessions;
                                  setWorkingSchedule(updatedSchedule);
                                  // Clear error when session is removed
                                  // setSessionErrors((prev) => {
                                  //   const newErrors = { ...prev };
                                  //   delete newErrors[`${i}`];
                                  //   return newErrors;
                                  // });
                                }}
                              >
                                <i className="ri-close-circle-line fs-5"></i>
                              </Button>
                            )}
                          </div>
                        </div>
                        <Row className="g-3">
                          <Col xs={6}>
                            <TimeSelect
                              value={
                                sess.startTime
                                  ? {
                                      label: format(
                                        new Date(sess.startTime),
                                        "hh:mm a"
                                      ),
                                      value: setSeconds(
                                        setMilliseconds(
                                          new Date(sess.startTime),
                                          0
                                        ),
                                        0
                                      ).toISOString(),
                                    }
                                  : null
                              }
                              onChange={(e) => {
                                if (e) {
                                  const dt = new Date(e.value);
                                  const startTime = format(dt, "HH:mm");

                                  if (sess.endTime) {
                                    const endTime = format(
                                      new Date(sess.endTime),
                                      "HH:mm"
                                    );
                                    if (startTime >= endTime) {
                                      return;
                                    }
                                  }

                                  handleTime(
                                    {
                                      target: {
                                        name: "startTime",
                                        value: dt,
                                      },
                                    },
                                    idx,
                                    i
                                  );
                                }
                              }}
                              options={generateTimes({
                                date: sess.endTime || new Date(),
                                endHour: sess.endTime
                                  ? new Date(sess.endTime).getHours()
                                  : 0,
                                endMinutes: sess.endTime
                                  ? new Date(sess.endTime).getMinutes()
                                  : 0,
                              })}
                              label="Start Time"
                              required
                              disabled={!sess.type}
                              placeholder="start time"
                            />
                          </Col>
                          <Col xs={6}>
                            <TimeSelect
                              value={
                                sess.endTime
                                  ? {
                                      label: format(
                                        new Date(sess.endTime),
                                        "hh:mm a"
                                      ),
                                      value: setSeconds(
                                        setMilliseconds(
                                          new Date(sess.endTime),
                                          0
                                        ),
                                        0
                                      ).toISOString(),
                                    }
                                  : null
                              }
                              onChange={(e) => {
                                if (e) {
                                  const dt = new Date(e.value);
                                  const endTime = format(dt, "HH:mm");

                                  if (sess.startTime) {
                                    const startTime = format(
                                      new Date(sess.startTime),
                                      "HH:mm"
                                    );
                                    if (endTime <= startTime) {
                                      return;
                                    }
                                  }

                                  handleTime(
                                    {
                                      target: {
                                        name: "endTime",
                                        value: dt,
                                      },
                                    },
                                    idx,
                                    i
                                  );
                                }
                              }}
                              options={generateTimes({
                                date: sess.startTime || new Date(),
                                startHour: sess.startTime
                                  ? new Date(sess.startTime).getHours()
                                  : 0,
                                startMinutes: sess.startTime
                                  ? new Date(sess.startTime).getMinutes()
                                  : 0,
                              })}
                              label="End Time"
                              required
                              disabled={!sess.type}
                              placeholder="End time"
                            />
                          </Col>
                        </Row>
                        {/* {sessionErrors[`${i}`] && (
                          <div className="mt-2">
                            <small className="text-danger d-flex align-items-center">
                              <i className="ri-error-warning-line me-1"></i>
                              {sessionErrors[`${i}`]}
                            </small>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </Col>
                ))}
              </RenderWhen>
            </React.Fragment>
          ))}
          {error && (
            <div className="mt-2">
              <small className="text-danger d-flex align-items-center">
                <i className="ri-error-warning-line me-1"></i>
                {error}
              </small>
            </div>
          )}
          <Col xs={12}>
            <div className="text-end my-3">
              <button
                onClick={() => {
                  setWorkingSchedule([
                    ...workingSchedule,
                    {
                      center: null,
                      days: [],
                      sessions: [{ startTime: "", endTime: "", type: "" }],
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
          <Col xs={12}>
            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-primary btn-sm">
                Save
              </button>
            </div>
          </Col>
        </Row>
      </Form>
      {/* </CustomModal> */}
    </React.Fragment>
  );
};

DoctorSchedule.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default DoctorSchedule;
