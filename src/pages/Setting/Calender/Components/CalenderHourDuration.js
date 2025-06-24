import React from "react";
import PropTypes from "prop-types";
import { Col, Input, Label } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import {
  addCalenderDuration,
  updateCalenderDuration,
} from "../../../../store/actions";

const CalenderHourDuration = ({ calender }) => {
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const selectedOption = e.target.value;

    // Use regular expressions to extract the digit and unit
    const match = selectedOption.match(/(\d+) (\w+)/);

    if (match) {
      const duration = { value: parseInt(match[1], 10), unit: match[2] };

      if (calender)
        dispatch(updateCalenderDuration({ duration, id: calender._id }));
      else dispatch(addCalenderDuration({ duration }));
    }
  };

  const value = calender
    ? `${calender.duration.value} ${calender.duration.unit}`
    : "";

  return (
    <React.Fragment>
      <div className="">
        <Label>Default Calender Timing</Label>
        <Input
          onChange={handleChange}
          value={value}
          bsSize="sm"
          color="white"
          type="select"
        >
          <option>1 Hour</option>
          <option>30 Minutes</option>
          <option>15 Minutes</option>
        </Input>
      </div>
    </React.Fragment>
  );
};

CalenderHourDuration.propTypes = {
  calender: PropTypes.object,
};

const mapStateToProps = (state) => ({
  calender: state.Setting.calender,
});

export default connect(mapStateToProps)(CalenderHourDuration);
