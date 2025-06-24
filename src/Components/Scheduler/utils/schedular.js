import {
  format,
  addDays,
  subDays,
  startOfWeek,
  eachDayOfInterval,
  isEqual,
  isWithinInterval,
  addMinutes,
  areIntervalsOverlapping,
} from "date-fns";

/* LAYOUTS HELPERS */
const getMonthDates = (trackMonth, actionType) => {
  let getSunday = startOfWeek(trackMonth, { weekStartsOn: 0 });

  const dates =
    actionType === "init" || actionType === "next"
      ? eachDayOfInterval({ start: getSunday, end: addDays(getSunday, 41) })
      : eachDayOfInterval({ start: getSunday, end: addDays(getSunday, 41) });

  return dates;
};

const getWeekDates = (currentDate, actionType) => {
  let getSunday = startOfWeek(currentDate, { weekStartsOn: 0 });

  const dates =
    actionType === "init" || actionType === "next"
      ? eachDayOfInterval({ start: getSunday, end: addDays(getSunday, 6) })
      : eachDayOfInterval({ start: getSunday, end: addDays(getSunday, 6) });

  return dates;
};

const getDay = (currentDate, actionType) => {
  const date =
    actionType === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1);

  return date;
};
/* LAYOUTS HELPERS */

/* FIND CORSSING EVENTS */
const traverseCrossingEvents = (events, event) => {
  // { date, name }  [ { date, name } ]
  return (events || []).filter((e) => {
    // console.table(format(event.startDate, 'dd MMMM yyyy h:mm a'));
    // console.table(format(e.startDate, 'dd MMMM yyyy h:mm a'));

    return (
      // event.id !== e.id &&
      areIntervalsOverlapping(
        {
          start: new Date(event.startDate),
          end: new Date(event.endDate),
        },
        { start: new Date(e.startDate), end: new Date(e.endDate) }
      )
      // isWithinInterval(addMinutes(new Date(event.startDate), 1), {
      //   start: new Date(e.startDate),
      //   end: new Date(e.endDate),
      // }) ||
      // isWithinInterval(addMinutes(new Date(event.endDate), -1), {
      //   start: new Date(e.startDate),
      //   end: new Date(e.endDate),
      // }) ||
      // isWithinInterval(addMinutes(new Date(e.startDate), 1), {
      //   start: new Date(event.startDate),
      //   end: new Date(event.endDate),
      // }) ||
      // isWithinInterval(addMinutes(new Date(e.endDate), -1), {
      //   start: new Date(event.startDate),
      //   end: new Date(event.endDate),
      // })
    );
  });
};

/* COMPARE AND FIND EVENT CORSSING EVENTS WITH EACH OTHER */
const compareEventCrossingEvents = (events, event) => {
  const crossingEvents = [event];

  const newEvents = events.filter((e) => e.id !== event.id);

  newEvents.forEach((e, i) => {
    newEvents.slice(i + 1, newEvents.length).forEach((ev) => {
      const check = isWithinInterval(ev.startDate, {
        start: e.startDate,
        end: e.endDate,
      });

      const chkEvent1 = crossingEvents.find((val) => val.id === e.id);
      const chkEvent2 = crossingEvents.find((val) => val.id === ev.id);
      if (check) {
        if (chkEvent1 ? false : true) crossingEvents.push(e);
        if (chkEvent2 ? false : true) crossingEvents.push(ev);
      }
    });
  });

  return crossingEvents;
};

function stringToRgbaColor(str, alpha) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate RGB values
  const rgb = Math.abs((Math.sin(hash) * 10000) % 1) * 16777216;
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  // Return RGBA color
  return `rgba(${r},${g},${b},${alpha})`;
}

export {
  getMonthDates,
  getWeekDates,
  getDay,
  traverseCrossingEvents,
  compareEventCrossingEvents,
  stringToRgbaColor,
};
