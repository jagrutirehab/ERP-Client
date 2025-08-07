import { differenceInMinutes, format } from "date-fns";
import React from "react";
import { UncontrolledTooltip } from "reactstrap";

const DetailEventItem = ({ event }) => {
  return (
    <>
      <div
        // onClick={(e) => e.stopPropagation()}
        id={`appointment-${event._id}`}
        className="d-flex justify-content-between flex-wrap align-items-start"
      >
        <div className="d-flex align-items-start">
          {event.chart && (event.bill || event.transactionId) && (
            <span className="mt-n1">
              <i className="ri-checkbox-circle-line text-white fs-14"></i>
            </span>
          )}
          <h1
            className="fs-12 mb-0 text-dark fst-italic"
            style={{
              textDecoration: event.isCancelled ? "line-through" : "",
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
              {(event.chart || event.bill) && "- ("}
              {event.chart && "Prescribed"}
              {event.chart && (event.bill || event.transactionId) && " , "}
              {(event.bill || event.transactionId) && "Paid"}
              {(event.chart || event.bill) && " )"}
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
              textDecoration: event.isCancelled ? "line-through" : "",
            }}
          >
            <span>{format(new Date(event.startDate), "hh:mm a")}</span>
            <span className="mx-1">-</span>
            <span>{format(new Date(event.endDate), "hh:mm a")}</span>
          </time>
        </div>
      </div>
      <UncontrolledTooltip target={`appointment-${event._id}`}>
        <span className="fs-9">
          Appointment with {event?.doctor?.name} at{" "}
          {format(new Date(event.startDate), "d MMMM y hh:mm a")} for{" "}
          {differenceInMinutes(
            new Date(event.endDate),
            new Date(event.startDate)
          )}
          {" Min "}
          in {event.center?.title} center
        </span>
      </UncontrolledTooltip>
    </>
  );
};

const EventItem = ({ event }) => {
  return (
    <>
      <div
        id={`appointment-${event._id}`}
        className="d-flex justify-content-between flex-wrap align-items-start"
      >
        <div className="d-flex align-items-start">
          {event.chart && event.bill && (
            <span className="mt-n1">
              <i className="ri-checkbox-circle-line text-white fs-14"></i>
            </span>
          )}
          <h1
            className="fs-12 mb-0 text-dark fst-italic"
            style={{
              textDecoration: event.isCancelled ? "line-through" : "",
            }}
          >
            {event.patient?.name}{" "}
          </h1>
        </div>
      </div>
      <UncontrolledTooltip target={`appointment-${event._id}`}>
        <span className="fs-9">
          Appointment with {event?.doctor?.name} at{" "}
          {format(new Date(event.startDate), "d MMMM y hh:mm a")} for{" "}
          {differenceInMinutes(
            new Date(event.endDate),
            new Date(event.startDate)
          )}
          {" Min "}
          in {event.center?.title} center
        </span>
      </UncontrolledTooltip>
    </>
  );
};

export { DetailEventItem, EventItem };
