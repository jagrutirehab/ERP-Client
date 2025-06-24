import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from "reactstrap";
import { set } from "date-fns";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

import CustomModal from "../../../Components/Common/Modal";

//data
import {
  DISCHARGE_SUMMARY,
  PRESCRIPTION,
  records,
} from "../../../Components/constants/patient";

//redux
import { connect, useDispatch } from "react-redux";
import { editInternBill, setChartDate } from "../../../store/actions";

const ChartDate = ({
  isOpen,
  toggle,
  type,
  chartDate,
  editChartData,
  patient,
}) => {
  const dispatch = useDispatch();
  //popover dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle2 = () => setDropdownOpen((prevState) => !prevState);

  useEffect(() => {
    const d = new Date();
    dispatch(setChartDate(d.toISOString()));
  }, [dispatch]);

  return (
    <React.Fragment>
      <CustomModal
        data-testid="chart-date-modal"
        title={"When did the Patient visit happen?"}
        isOpen={isOpen}
        toggle={() => {
          toggle();
          dispatch(editInternBill({ data: null, chart: null, isOpen: false }));
        }}
      >
        <div>
          <Form>
            <p className="text-muted mt-0 mb-1">Chart date and time</p>
            <div className="d-flex justify-content-center align-items-center">
              <span>
                <Flatpicker
                  name="dateOfAdmission"
                  value={chartDate || ""}
                  onChange={([e]) => {
                    const concat = set(new Date(chartDate), {
                      year: e.getFullYear(),
                      month: e.getMonth(),
                      date: e.getDate(),
                    });
                    dispatch(setChartDate(concat.toISOString()));
                  }}
                  options={{
                    dateFormat: "d M, Y",
                    // enable: [
                    //   function (date) {
                    //     return date.getDate() === new Date().getDate();
                    //   },
                    // ],
                  }}
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
              </span>
              <span className="ms-3 me-3">at</span>
              <span>
                <Flatpicker
                  name="dateOfAdmission"
                  value={chartDate || ""}
                  onChange={([e]) => {
                    const concat = set(new Date(chartDate), {
                      hours: e.getHours(),
                      minutes: e.getMinutes(),
                      seconds: e.getSeconds(),
                      milliseconds: e.getMilliseconds(),
                    });
                    dispatch(setChartDate(concat.toISOString()));
                  }}
                  options={{
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: "G:i:S K",
                    time_24hr: false,
                    // defaultDate: moment().format('LT'),
                  }}
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
              </span>
            </div>
            <div className="d-flex align-items-center mt-3">
              <p className="text-muted d-block mb-0">Name:</p>
              <p className="text-primary ms-3 mb-0 font-semi-bold fs-6">
                {/* {user?.name} */}
                Doctor Name
              </p>
            </div>
          </Form>
        </div>
        <div>
          <Dropdown
            className="text-end border-top pt-2 mt-2"
            size="sm"
            isOpen={dropdownOpen}
            toggle={toggle2}
            direction={"down"}
          >
            <DropdownToggle caret={true} outline color="primary">
              Add Records
            </DropdownToggle>
            <DropdownMenu flip={false} color="warning">
              {(records || []).map((item, idx) => {
                return (
                  <DropdownItem
                    disabled={
                      editChartData.data &&
                      editChartData.data.chart !== item.category
                        ? true
                        : type === "GENERAL" &&
                          item.category === DISCHARGE_SUMMARY
                        ? true
                        : false
                    }
                    key={idx + item.category}
                    onClick={() => {
                      dispatch(
                        editInternBill({
                          ...editChartData,
                          chart: item.category,
                          patient,
                          isOpen: true,
                          ...(item.category === PRESCRIPTION && {
                            populatePreviousAppointment: true,
                          }),
                        })
                      );
                      toggle();
                    }}
                  >
                    {item.name}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
        </div>
      </CustomModal>
    </React.Fragment>
  );
};

ChartDate.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  chartDate: PropTypes.string,
  editChartData: PropTypes.object,
  patient: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(ChartDate);
