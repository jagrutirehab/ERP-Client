import React, { ReactNode, useEffect, useState } from "react";

//components
import Header from "./Components/Header";
import Main from "./Components/Main";
import FormModal from "./Components/Modals/FormModal";
import { getMonthDates, getWeekDates } from "./utils/schedular";
import { startOfMonth } from "date-fns";
import EventModal from "./Components/Modals/EventModal";
import { connect, useDispatch } from "react-redux";
import { setCurrentEvent } from "../../store/actions";

/**
 *
 * @param {Object} props - Object contains all the passed props according to user usage.
 * @param {String} props.startTime - Start time is used in day and week layout its the start time of schedular time (e.g startTime = 10:00 AM).
 * @param {String} props.endTime - End time is used in day and week layout its the end time of schedular time (e.g endTime = 8:00 PM).
 * @param {Array} props.timeDifference - Time difference is the difference between times of schedular in day & week layout (e.g timeDifference = ['1', 'hour / minutes']).
 * @param {String} props.fontSize - Font size is the adjustment of font user can do according to its own use case.
 * @param {String} props.colorTheme - Theme or Color theme user can pass custom color or can pass default bootstrap color themes. (e.g colorTheme = 'primary / info / '#1d1d1d').
 * @param {Array} props.layouts - Layout are the layouts (Day, Week, Month). User can decide how many layouts he want and have the freedom to select all or any one / two of them (e.g layouts = ['day', 'week', 'month']).
 * @param {Array} props.data - User should pass the data(appointments / events) that are used to shown on Scheduler.
 * @returns
 */
const Scheduler = (props) => {
  const dispatch = useDispatch();
  //dates ranging from current month 1st date to next 35th
  const [trackMonth, setTrackMonth] = useState(startOfMonth(new Date()));
  let [monthDates, setMonthDates] = useState([]);
  //week dates
  let [weekDates, setWeekDates] = useState([]);
  //day dates
  const [day, setDay] = useState(new Date());
  //current date
  const currentDate = new Date();

  //change layout
  const [layout, setLayout] = useState("day");

  /* Scheduler date time from selected box */
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: "",
  });

  //event modal
  // const [eventInfo, setEventInfo] = useState({
  //   isOpen: false,
  //   data: null,
  // });
  const toggleEventInfo = (data) => {
    dispatch(setCurrentEvent({ isOpen: !props.currentEvent?.isOpen, data }));
  };

  return (
    <React.Fragment>
      <div className="w-100">
        <Header
          setMonthDates={setMonthDates}
          setWeekDates={setWeekDates}
          setLayout={setLayout}
          layout={layout}
          weekDates={weekDates}
          day={day}
          setDay={setDay}
          trackMonth={trackMonth}
          setTrackMonth={setTrackMonth}
          {...props}
        />
        <Main
          day={day}
          monthDates={monthDates}
          weekDates={weekDates}
          currentDate={currentDate}
          layout={layout}
          toggleForm={props.toggleForm}
          // toggleEventInfo={toggleEventInfo}
          setDateTime={setDateTime}
          {...props}
        />
        <FormModal
          isOpen={props.openForm}
          toggle={props.toggleForm}
          day={day}
          dateTime={dateTime}
          EventFormContext={props.EventFormContext}
        />
        <EventModal
          toggleEventInfo={toggleEventInfo}
          data={props.currentEvent?.data}
          isOpen={props.currentEvent?.isOpen}
          EventInfoRenderer={props.EventInfoRenderer}
        />
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  currentEvent: state.Booking.event,
});

export default connect(mapStateToProps)(Scheduler);
