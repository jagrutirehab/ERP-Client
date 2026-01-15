import React, { useState } from "react";
import {
  Col,
  Row,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Button,
} from "reactstrap";

import "flatpickr/dist/themes/material_green.css";
// Month Select Plugin Imports
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/plugins/monthSelect/style.css";

import Flatpickr from "react-flatpickr";
import { endOfDay, startOfDay, startOfMonth, endOfMonth } from "date-fns";
import CenterDropdown from "../Doctor/components/CenterDropDown";

const Header = ({
  reportDate,
  setReportDate,
  disabled = false,
  centerOptions,
  selectedCentersIds,
  setSelectedCentersIds,
  onViewReport,
  onExportCSV,
  loading,
}) => {
  // mode can be 'range' or 'month'
  const [mode, setMode] = useState("range");

  const changeDate = (days) => {
    setMode("range");
    const today = new Date();
    const start = days
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)
      : today;
    setReportDate({ start: startOfDay(start), end: endOfDay(today) });
  };

  const switchToMonthMode = () => {
    setMode("month");
    const date = new Date();
    setReportDate({
      start: startOfMonth(date),
      end: endOfMonth(date),
    });
  };

  return (
    <React.Fragment>
      <Row className="justify-content-end">
        <Col xs={12}>
          <div className="d-flex justify-content-md-end mt-4 mt-md-0 gap-2 flex-wrap align-items-center">
            {/* Center Filter */}
            <CenterDropdown
              options={centerOptions}
              value={selectedCentersIds}
              onChange={setSelectedCentersIds}
            />

            {/* Date Selection UI */}
            <div
              className="border border-dark d-flex align-items-center bg-light"
              style={{ borderRadius: "4px" }}
            >
              {/* Conditional Rendering based on Mode */}
              {mode === "range" ? (
                <div className="d-flex align-items-center">
                  <Flatpickr
                    key="start-range" // Key forces re-render when switching modes
                    value={reportDate.start}
                    onChange={([date]) =>
                      setReportDate({ ...reportDate, start: startOfDay(date) })
                    }
                    options={{
                      dateFormat: "d M, Y",
                      disableMobile: true,
                      maxDate: reportDate.end,
                    }}
                    className="form-control shadow-none bg-light border-0"
                    disabled={disabled}
                  />
                  <span className="px-2">-</span>
                  <Flatpickr
                    key="end-range"
                    value={reportDate.end}
                    onChange={([date]) =>
                      setReportDate({ ...reportDate, end: endOfDay(date) })
                    }
                    options={{
                      dateFormat: "d M, Y",
                      disableMobile: true,
                      minDate: reportDate.start,
                    }}
                    className="form-control shadow-none bg-light border-0 text-end"
                    disabled={disabled}
                  />
                </div>
              ) : (
                <div
                  className="d-flex align-items-center"
                  style={{ minWidth: "300px" }}
                >
                  <Flatpickr
                    key="month-picker"
                    value={reportDate.start}
                    onChange={([date]) => {
                      setReportDate({
                        start: startOfMonth(date),
                        end: endOfMonth(date),
                      });
                    }}
                    options={{
                      disableMobile: true,
                      plugins: [
                        new monthSelectPlugin({
                          shorthand: true,
                          dateFormat: "F Y",
                          altFormat: "F Y",
                        }),
                      ],
                    }}
                    className="form-control shadow-none bg-light border-0 text-center"
                    disabled={disabled}
                  />
                </div>
              )}

              {/* Selection Dropdown */}
              <div
                className={`border-start border-dark ${
                  disabled ? "opacity-50" : ""
                }`}
              >
                <UncontrolledDropdown>
                  <DropdownToggle
                    caret
                    color="light"
                    className="pe-3 border-0"
                  ></DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem header>Range Selection</DropdownItem>
                    <DropdownItem onClick={() => changeDate(0)}>
                      Today
                    </DropdownItem>
                    <DropdownItem onClick={() => changeDate(7)}>
                      Last 7 days
                    </DropdownItem>
                    <DropdownItem onClick={() => changeDate(30)}>
                      Last 30 days
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem header>Monthly Selection</DropdownItem>
                    <DropdownItem onClick={switchToMonthMode}>
                      Pick a Month {mode === "month" && "✓"}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </div>

            {/* View Report Button */}
            <Button
              color="primary"
              onClick={onViewReport}
              disabled={loading || disabled || selectedCentersIds.length === 0}
            >
              {loading ? "Loading..." : "View Report"}
            </Button>

            {/* Export CSV Button */}
            <Button
              color="success"
              onClick={onExportCSV}
              disabled={loading || disabled || selectedCentersIds.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Header;
