import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button } from "reactstrap";
import { set } from "date-fns";
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import CustomModal from "../../../Components/Common/Modal";
import { connect, useDispatch } from "react-redux";
import { createEditChart, setChartDate } from "../../../store/actions";

const BelongingsDate = ({
  isOpen,
  toggle,
  chartDate,
  editChartData,
  patient,
  onStartForm,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      const d = new Date();
      dispatch(setChartDate(d.toISOString()));
    }
  }, [dispatch, isOpen]);

  return (
    <React.Fragment>
      <CustomModal
        data-testid="belongings-date-modal"
        title={"When were the belongings collected?"}
        isOpen={isOpen}
        toggle={() => {
          toggle();
          dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
        }}
      >
        <div>
          <Form>
            <p className="text-muted mt-0 mb-1">Chart date and time</p>
            <div className="d-flex justify-content-center align-items-center">
              <span>
                <Flatpicker
                  name="dateOfBelongings"
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
                  }}
                  className="form-control shadow-none bg-light "
                  id="dateOfBelongings"
                />
              </span>
              <span className="ms-3 me-3">at</span>
              <span>
                <Flatpicker
                  name="timeOfBelongings"
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
                  }}
                  className="form-control shadow-none bg-light"
                  id="timeOfBelongings"
                />
              </span>
            </div>
          </Form>
        </div>
        <div className="text-end mt-4 border-top pt-3">
            <Button
              color="primary"
              className="text-white"
              onClick={() => {
                if (onStartForm) {
                    onStartForm(chartDate);
                } else {
                    dispatch(
                      createEditChart({
                        ...editChartData,
                        chart: "BELONGINGS",
                        patient,
                        isOpen: true,
                      })
                    );
                }
                toggle();
              }}
            >
              Start Form
            </Button>
        </div>
      </CustomModal>
    </React.Fragment>
  );
};

BelongingsDate.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  chartDate: PropTypes.string,
  editChartData: PropTypes.object,
  patient: PropTypes.object,
  onStartForm: PropTypes.func,
};

const mapStateToProps = (state) => ({
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(BelongingsDate);
