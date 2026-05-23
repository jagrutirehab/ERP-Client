import React from "react";
import PropTypes from "prop-types";
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { endOfDay, startOfDay } from "date-fns";
import "flatpickr/dist/themes/material_green.css";

/**
 * Reusable date range filter with a flatpickr date picker and quick-select dropdown.
 *
 * Props:
 *   reportDate  - { start: Date, end: Date }
 *   setReportDate - setter for reportDate
 *   disabled    - optional bool
 */
const DateRangeFilter = ({ reportDate, setReportDate, disabled = false }) => {
  const changeDate = (days) => {
    const today = new Date();

    if (!days) {
      setReportDate({ start: startOfDay(today), end: endOfDay(today) });
      return;
    }

    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - (days - 1)
    );

    setReportDate({ start: startOfDay(start), end: endOfDay(today) });
  };

  const changeToMonth = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    setReportDate({ start: startOfDay(firstDay), end: endOfDay(new Date()) });
  };

  const changeToLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    setReportDate({ start: startOfDay(firstDay), end: endOfDay(lastDay) });
  };

  return (
    <div className="border border-dark d-flex align-items-center">
      {/* Start Date */}
      <div style={{ position: "relative" }}>
        {disabled && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.6)",
              cursor: "not-allowed",
              zIndex: 10,
              borderRadius: 6,
            }}
          />
        )}
        <Flatpickr
          disabled={disabled}
          value={reportDate.start || ""}
          onChange={([e]) =>
            setReportDate({ ...reportDate, start: startOfDay(e) })
          }
          options={{
            dateFormat: "d M, Y",
            maxDate: new Date(reportDate.end),
            disableMobile: true,
          }}
          className="form-control shadow-none bg-light border-0"
        />
      </div>

      {/* Separator */}
      <div className="bg-light h-100 d-flex align-items-center px-1">-</div>

      {/* End Date */}
      <div style={{ position: "relative" }}>
        {disabled && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.6)",
              cursor: "not-allowed",
              zIndex: 10,
              borderRadius: 6,
            }}
          />
        )}
        <Flatpickr
          disabled={disabled}
          value={reportDate.end || ""}
          onChange={([e]) =>
            setReportDate({ ...reportDate, end: endOfDay(e) })
          }
          options={{
            dateFormat: "d M, Y",
            minDate: new Date(reportDate.start),
            disableMobile: true,
          }}
          className="form-control shadow-none bg-light border-0 text-end"
        />
      </div>

      {/* Quick Select Dropdown */}
      <div
        className={`border-start border-dark ${disabled ? "opacity-50" : ""}`}
        style={{ pointerEvents: disabled ? "none" : "auto" }}
      >
        <UncontrolledDropdown>
          <DropdownToggle caret color="light" className="pe-3 border-0" />
          <DropdownMenu end>
            <DropdownItem onClick={() => changeDate()}>Today</DropdownItem>
            <DropdownItem onClick={() => changeDate(7)}>Last 7 days</DropdownItem>
            <DropdownItem onClick={() => changeDate(30)}>Last 30 days</DropdownItem>
            <DropdownItem onClick={changeToMonth}>This month</DropdownItem>
            <DropdownItem onClick={changeToLastMonth}>Last Month</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    </div>
  );
};

DateRangeFilter.propTypes = {
  reportDate: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
  }).isRequired,
  setReportDate: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default DateRangeFilter;
