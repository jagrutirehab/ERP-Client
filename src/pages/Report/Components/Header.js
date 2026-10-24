import React from "react";
import {
  Col,
  Row,
  Input,
  Button,
} from "reactstrap";

import "flatpickr/dist/themes/material_green.css";
import SearchPatient from "./Report/SeachPatient";
import { payments } from "./Report/data";
import DateRangeFilter from "../../../Components/Common/DateRangeFilter";

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
  // const changeDate = (days) => {
  //   const today = new Date();
  //   const start = days
  //     ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)
  //     : today;
  //   setReportDate({ start: startOfDay(start), end: endOfDay(today) });
  // };




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
                    <div style={{ minWidth: "100px" }}>
                      <SearchPatient
                        setPatient={setPatient}
                        patient={patient}
                      />
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  {/* Date Range Filter */}
                  <DateRangeFilter
                    reportDate={reportDate}
                    setReportDate={setReportDate}
                    disabled={disabled}
                  />

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
