import React, { useRef, useEffect } from "react";
import {
  Col,
  Row,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from "reactstrap";

import "flatpickr/dist/themes/material_green.css";
import Flatpickr from "react-flatpickr";
import { endOfDay, startOfDay } from "date-fns";

const Header = ({ reportDate, setReportDate }) => {
  const changeDate = (days) => {
    const date = new Date();
    if (days) date.setDate(date.getDate() - days);
    setReportDate({ start: startOfDay(date), end: endOfDay(date) });
  };

  const changeToMonth = () => {
    const date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    setReportDate({ start: startOfDay(firstDay), end: endOfDay(new Date()) });
  };

  // const ref = useRef();
  // useEffect(() => {
  //   import('flatpickr').then((flatpickr) => {
  //     const fp = flatpickr(ref);
  //     return () => fp.destroy();
  //   });
  // }, [ref]);

  return (
    <React.Fragment>
      <div>
        <div>
          <Row className="justify-content-end">
            {/* <Col xs={12} md={6}>
              <div className="d-flex align-items-end">
                <h5 className="display-5 mb-0 font-size-25 font-semi-bold">
                  Reports
                </h5>
                <h6 className="display-6 font-size-20 mb-0 ms-3">
                  Jagruti Rehabilitation Center
                </h6>
              </div>
            </Col> */}
            <Col xs={12}>
              <div className="d-flex justify-content-md-end mt-4 mt-md-0">
                <div className="border border-dark d-flex align-items-center">
                  <div>
                    <Flatpickr
                      // ref={ref}
                      name="dateOfAdmission"
                      value={reportDate.start || ""}
                      onChange={([e]) => {
                        setReportDate({
                          ...reportDate,
                          start: e,
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
                  <div>
                    <Flatpickr
                      // ref={ref}
                      name="dateOfAdmission"
                      value={reportDate.end || ""}
                      onChange={([e]) => {
                        setReportDate({
                          ...reportDate,
                          end: e,
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
                  <div className="border-start border-dark">
                    <UncontrolledDropdown>
                      <DropdownToggle
                        caret
                        color="light"
                        className="pe-3"
                      ></DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>
                          <div onClick={() => changeDate()}>Today</div>
                        </DropdownItem>
                        <DropdownItem>
                          <div onClick={() => changeDate(7)}>Last 7 days</div>
                        </DropdownItem>
                        <DropdownItem>
                          <div onClick={() => changeDate(30)}>Last 30 days</div>
                        </DropdownItem>
                        <DropdownItem>
                          <div onClick={changeToMonth}>This month</div>
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </div>
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
