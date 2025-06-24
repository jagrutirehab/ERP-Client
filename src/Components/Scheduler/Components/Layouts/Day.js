import React, { useEffect } from "react";
import { getAppointmentsByDates, sortEvents } from "../data";

//redux
import { useDispatch } from "react-redux";

// import AppointmentWidget from './AppointmentWidget';
import {
  addMinutes,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachMinuteOfInterval,
  format,
  isWithinInterval,
} from "date-fns";
import AppointmentWidget from "../EventWidget";
import {
  stringToRgbaColor,
  traverseCrossingEvents,
} from "../../utils/schedular";
import {
  CELL_HEIGHT,
  DEFAULT_SHEDULAR_HEIGHT,
} from "../../helpers/constants/schedular";
import { enUS } from "date-fns/locale";
import { END_HOUR, START_HOUR, STEP } from "../../../constants/scheduler";
import { setCurrentEvent, setEventDate } from "../../../../store/actions";
import { UncontrolledTooltip } from "reactstrap";

const Day = ({
  // setIsAppointInfo,
  // isAppointInfo,
  day,
  toggleForm,
  toggleEventInfo,
  setDateTime,
  events,
  ...rest
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Get references to the content wrap and time cells wrap
    const contentWrap = document.querySelector(".e-content-wrap");
    const timeCellsWrap = document.querySelector(".e-time-cells-wrap");
    // Add a scroll event listener to the content wrap
    contentWrap?.addEventListener("scroll", function () {
      // Get the current scroll position of the content wrap
      const scrollTop = contentWrap.scrollTop;

      // Set the scroll position of the time cells wrap to match the content wrap
      timeCellsWrap?.scrollTo(0, scrollTop);
    });
  }, []);

  const todayEvents = getAppointmentsByDates(day, events);

  /* -------------------------------------------------------- */
  /* -------------------------------------------------------- */

  const hours = eachMinuteOfInterval(
    {
      start: new Date(day.setHours(START_HOUR)).setMinutes(0),
      end: new Date(day.setHours(END_HOUR)).setMinutes(0),
    },
    { step: STEP }
  );

  const INTERVAL = STEP;

  return (
    <React.Fragment>
      <div className="w-100">
        <div id="day-layout-table" className="mt-3">
          <table className="table table-bordered mb-0">
            <tbody style={{ height: "calc(100vh - 150px)", overflow: "auto" }}>
              <tr>
                <td className="fw-normal text-center align-middle day-time-w"></td>
                <td className="fw-normal text-center align-middle text-primary day-block-w">
                  {format(day, "EEEE")}
                </td>
              </tr>
              <tr className="fs-10">
                <td className="p-0">
                  <div
                    className="e-time-cells-wrap overflow-hidden"
                    style={{ height: DEFAULT_SHEDULAR_HEIGHT }}
                  >
                    <table className="table table-bordered mb-0">
                      <tbody>
                        {(hours || []).map((time, idx) => (
                          <tr key={`${time}-${idx}`}>
                            <td
                              key={time.toISOString() + idx}
                              className="calendar-td calendar-td-w day-time-w fs-10 align-middle py-0"
                              style={{ height: CELL_HEIGHT }}
                            >
                              <span className="my-auto">
                                {format(time, "h:mm a", { locale: enUS })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>

                <td
                  className="p-0"
                  // onClick={() => {
                  //   toggleForm();
                  //   setDateTime({
                  //     date: new Date(day),
                  //     time: time,
                  //   });
                  // }}
                  // className="calendar-td calendar-td-h calendar-td-w day-block-w"
                >
                  <div
                    className="e-content-wrap position-relative"
                    style={{ height: DEFAULT_SHEDULAR_HEIGHT }}
                  >
                    <table className="table table-bordered schedule-content-table">
                      <thead>
                        <tr>
                          <td
                            className="e-day-wrapper w-100 p-0"
                            data-date=""
                            data-group-index="0"
                          >
                            <div
                              className="e-appointment-wrapper"
                              id="e-appointment-wrapper-0"
                            >
                              {(todayEvents || []).map((event, idx) => {
                                const getHour = new Date(
                                  event.startDate
                                ).getHours();
                                const getMinutes = new Date(
                                  event.startDate
                                ).getMinutes();
                                const computeMinutePercentage =
                                  (getMinutes / 60) * CELL_HEIGHT;

                                //algorithm
                                const crossingEvents = traverseCrossingEvents(
                                  todayEvents,
                                  event
                                );

                                let width;
                                let left;

                                let checkBigger = 0;
                                let globalCrossingEvent = {};
                                crossingEvents.forEach((e, j) => {
                                  const cEvents = traverseCrossingEvents(
                                    todayEvents,
                                    e
                                  );

                                  if (cEvents.length > checkBigger) {
                                    globalCrossingEvent = {
                                      parent: event,
                                      subParent: e,
                                      children: cEvents,
                                    };

                                    checkBigger = cEvents.length;
                                  }
                                });

                                let widthFactor = [];
                                const totalEvents =
                                  globalCrossingEvent?.children || [];

                                totalEvents.forEach((e, i) => {
                                  let index = null;

                                  for (let i = 0; i < widthFactor.length; i++) {
                                    let col = widthFactor[i];
                                    let overlaps = false;

                                    for (
                                      let j = 0;
                                      j < col.events.length;
                                      j++
                                    ) {
                                      const event = col.events[j];

                                      if (
                                        areIntervalsOverlapping(
                                          {
                                            start: new Date(e.startDate),
                                            end: new Date(e.endDate),
                                          },
                                          {
                                            start: new Date(event.startDate),
                                            end: new Date(event.endDate),
                                          }
                                        )
                                      ) {
                                        overlaps = true;
                                        break;
                                      } else overlaps = false;
                                    }

                                    if (!overlaps) {
                                      index = i;
                                      break;
                                    }
                                  }

                                  if (index !== null) {
                                    widthFactor[index].events.push(e);
                                  } else {
                                    widthFactor.push({ events: [e] });
                                  }
                                });

                                const CELL_HEIGHT_INTERVAL =
                                  CELL_HEIGHT * (60 / INTERVAL);

                                const top =
                                  (getHour - START_HOUR) *
                                    CELL_HEIGHT_INTERVAL +
                                  computeMinutePercentage * (60 / INTERVAL);

                                const height =
                                  (differenceInMinutes(
                                    new Date(event.endDate),
                                    new Date(event.startDate)
                                  ) *
                                    CELL_HEIGHT_INTERVAL) /
                                  60;

                                width = (90 / widthFactor.length || 1) - 1;

                                let leftFactor = null;
                                let eventInColumn = null;
                                for (let i = 0; i < widthFactor.length; i++) {
                                  eventInColumn = widthFactor[i].events.find(
                                    (e) => e._id === event._id
                                  );

                                  if (eventInColumn) {
                                    leftFactor = i;
                                    break;
                                  }
                                }

                                left = (leftFactor ?? 0) * (width + 1);

                                const backgroundColor =
                                  event.doctor?._id &&
                                  stringToRgbaColor(event.doctor?._id, 0.7);
                                return (
                                  <div
                                    key={event._id}
                                    className="e-appointment p-1"
                                    style={{
                                      top: `${top}px`,
                                      left: `${left}%`, //computeLeft
                                      height: `${height}px`,
                                      width: `${width}%`,
                                      backgroundColor:
                                        event.isCancelled ||
                                        (event.chart && event.bill)
                                          ? "rgba(0, 0, 0, 0.3)"
                                          : event.chart
                                          ? ""
                                          : backgroundColor,
                                      ...(event.chart &&
                                        !event.bill && {
                                          background:
                                            "linear-gradient(to right, #bdc3c7, #2c3e50)",
                                        }),
                                    }}
                                    role="button"
                                    onClick={() =>
                                      dispatch(
                                        setCurrentEvent({
                                          isOpen: true,
                                          data: event,
                                        })
                                      )
                                    }
                                    data-id={`appointment-${idx}`}
                                    id={`appointment-${idx}`}
                                  >
                                    <div className="d-flex justify-content-between flex-wrap align-items-start">
                                      <div className="d-flex align-items-start">
                                        {event.chart && event.bill && (
                                          <span className="mt-n1">
                                            <i className="ri-checkbox-circle-line text-white fs-14"></i>
                                          </span>
                                        )}
                                        <h1
                                          className="fs-12 mb-0 text-dark fst-italic"
                                          style={{
                                            textDecoration: event.isCancelled
                                              ? "line-through"
                                              : "",
                                          }}
                                        >
                                          {event.patient?.name}{" "}
                                          {`${event?.patient?.id?.prefix}${event?.patient?.id?.value}`}
                                          <span className="text-i">
                                            - {event?.center?.title}
                                            {" - "}
                                          </span>
                                          <span className="text-i text-dark">
                                            {event?.consultationType}
                                            {(event.chart || event.bill) &&
                                              "- ("}
                                            {event.chart && "Prescribed"}
                                            {event.chart && event.bill && " , "}
                                            {event.bill && "Paid"}
                                            {(event.chart || event.bill) &&
                                              " )"}
                                          </span>
                                        </h1>
                                      </div>
                                      <div>
                                        <time
                                          className={`fs-12 d-block ${
                                            event.chart && event.bill
                                              ? "text-white"
                                              : event.chart
                                              ? "text-white"
                                              : "text-dark"
                                          } w-100`}
                                          style={{
                                            textDecoration: event.isCancelled
                                              ? "line-through"
                                              : "",
                                          }}
                                        >
                                          <span>
                                            {format(
                                              new Date(event.startDate),
                                              "hh:mm a"
                                            )}
                                          </span>
                                          <span className="mx-1">-</span>
                                          <span>
                                            {format(
                                              new Date(event.endDate),
                                              "hh:mm a"
                                            )}
                                          </span>
                                        </time>
                                      </div>
                                    </div>
                                    <UncontrolledTooltip
                                      target={`appointment-${idx}`}
                                    >
                                      <span className="fs-9">
                                        Appointment with {event?.doctor?.name}{" "}
                                        at{" "}
                                        {format(
                                          new Date(event.startDate),
                                          "d MMMM y hh:mm a"
                                        )}{" "}
                                        for{" "}
                                        {differenceInMinutes(
                                          new Date(event.endDate),
                                          new Date(event.startDate)
                                        )}
                                        {" Min "}
                                        in {event.center?.title} center
                                      </span>
                                    </UncontrolledTooltip>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {(hours || []).map((time, idx) => (
                          <tr
                            className="border-secondary"
                            key={`${time}-${idx}`}
                          >
                            <td
                              onClick={() => {
                                dispatch(setEventDate(time.toISOString()));
                                toggleForm();
                              }}
                              key={time.toISOString() + idx}
                              style={{ height: CELL_HEIGHT }}
                              className="calendar-td calendar-td-w day-time-w font-size-14"
                            ></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Day;
