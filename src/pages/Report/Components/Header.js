import React, { useRef, useEffect } from "react";
import {
  Col,
  Row,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Input,
  Button,
} from "reactstrap";

import "flatpickr/dist/themes/material_green.css";
import Flatpickr from "react-flatpickr";
import { endOfDay, startOfDay } from "date-fns";
import SearchPatient from "./Report/SeachPatient";
import { payments } from "./Report/data";

const Header = ({
  reportDate,
  setReportDate,
  disabled = false,
  billType,
  setBillType,
  patient,
  setPatient,
  onViewReport,
  loading = false,
}) => {
  const changeDate = (days) => {
    const today = new Date();
    const start = days
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)
      : today;
    setReportDate({ start: startOfDay(start), end: endOfDay(today) });
  };

  const changeToMonth = () => {
    const date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    setReportDate({ start: startOfDay(firstDay), end: endOfDay(new Date()) });
  };

  const handleChange = (e) => {
    if (e) setBillType(e.target.value);
  };

  return (
    <React.Fragment>
      <div>
        <div>
          <Row className="justify-content-end">
            <Col xs={12}>
              <div className="d-flex justify-content-md-between mt-4 mt-md-0 gap-2 flex-wrap align-items-center">
                <div className="d-flex gap-2">
                  {/* Transaction Filter */}
                  {billType && setBillType && (
                    <div style={{ minWidth: "200px" }}>
                      <Input
                        id="selectfilter"
                        name="billType"
                        type="select"
                        onChange={handleChange}
                        value={billType || ""}
                        className="form-control form-control-sm"
                        disabled={disabled}
                      >
                        {(payments || []).map((item, idx) => (
                          <option
                            value={item.value}
                            className="text-muted"
                            key={item + idx}
                          >
                            {item.label}
                          </option>
                        ))}
                      </Input>
                    </div>
                  )}

                  {/* Patient Search */}
                  {patient !== undefined && setPatient && (
                    <div style={{ minWidth: "200px" }}>
                      <SearchPatient
                        setPatient={setPatient}
                        patient={patient}
                      />
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  {/* Date Selection UI */}
                  <div className="border border-dark d-flex align-items-center">
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
                        name="dateOfAdmission"
                        value={reportDate.start || ""}
                        onChange={([e]) => {
                          setReportDate({
                            ...reportDate,
                            start: startOfDay(e),
                          });
                        }}
                        options={{
                          dateFormat: "d M, Y",
                          maxDate: new Date(reportDate.end),
                          disableMobile: true,
                        }}
                        className="form-control shadow-none bg-light border-0"
                        id="dateOfAdmission"
                      />
                    </div>
                    <div className="bg-light h-100 d-flex align-items-center">
                      -
                    </div>
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
                        name="dateOfAdmission"
                        disabled={disabled}
                        value={reportDate.end || ""}
                        onChange={([e]) => {
                          setReportDate({
                            ...reportDate,
                            end: endOfDay(e),
                          });
                        }}
                        options={{
                          dateFormat: "d M, Y",
                          minDate: new Date(reportDate.start),
                          disableMobile: true,
                        }}
                        className="form-control shadow-none bg-light border-0 text-end"
                        id="dateOfAdmission"
                      />
                    </div>
                    <div
                      className={`border-start border-dark ${disabled ? "opacity-50" : ""}`}
                      style={{ pointerEvents: disabled ? "none" : "auto" }}
                    >
                      <UncontrolledDropdown>
                        <DropdownToggle
                          caret
                          color="light"
                          className="pe-3 border-0"
                        ></DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem>
                            <div onClick={() => changeDate()}>Today</div>
                          </DropdownItem>
                          <DropdownItem>
                            <div onClick={() => changeDate(7)}>Last 7 days</div>
                          </DropdownItem>
                          <DropdownItem>
                            <div onClick={() => changeDate(31)}>
                              Last Month
                            </div>
                          </DropdownItem>
                          <DropdownItem>
                            <div onClick={changeToMonth}>This month</div>
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                  </div>

                  {/* View Report Button */}
                  {onViewReport && (
                    <Button
                      color="primary"
                      onClick={onViewReport}
                      disabled={loading || disabled}
                    >
                      {loading ? "Loading..." : "View Report"}
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Header;
