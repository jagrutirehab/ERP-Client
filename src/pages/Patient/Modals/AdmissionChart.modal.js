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
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import CustomModal from "../../../Components/Common/Modal";
import { Forms } from "../../../Components/constants/patient";
import { connect, useDispatch } from "react-redux";
import { createEditChart, setChartDate } from "../../../store/actions";
import CapacityAssessmentModal from "./CapacityAssessmentModal";

const AdmissionChart = ({
  isOpen,
  toggle,
  type,
  chartDate,
  editChartData,
  patient,
}) => {
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle2 = () => setDropdownOpen((prevState) => !prevState);
  const [capacityModal, setCapacityModal] = useState(false);

  useEffect(() => {
    const d = new Date();
    dispatch(setChartDate(d.toISOString()));
  }, [dispatch]);

  // The Capacity Assessment must be completed before the Admission / Consent
  // forms can be added. `patient.addmission` is the populated current
  // admission; a saved assessment lands in `capacityAssessmentFormRaw` (in-app
  // form) or `capacityAssessmentFormURL` (signed upload). This refreshes
  // automatically — CapacityAssessmentModal dispatches fetchPatientById on save.
  const hasCapacityAssessment = Boolean(
    patient?.addmission?.capacityAssessmentFormRaw?.length ||
    patient?.addmission?.capacityAssessmentFormURL?.length,
  );

  // console.log("patient", patient);
  return (
    <React.Fragment>
      <CustomModal
        data-testid="chart-date-modal"
        title={"Select The Form Type"}
        isOpen={isOpen}
        toggle={() => {
          toggle();
          dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
        }}
      >
        <div>
          <Form>
            <p className="text-muted mt-0 mb-1">Date and Time</p>
            <div className="d-flex justify-content-center align-items-center">
              <span>
                <Flatpicker
                  name="dateOfAdmission"
                  disabled
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
                  id="dateOfAdmission"
                />
              </span>
              <span className="ms-3 me-3">at</span>
              <span>
                <Flatpicker
                  name="dateOfAdmission"
                  value={chartDate || ""}
                  disabled
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
                  id="dateOfAdmission"
                />
              </span>
            </div>
            <div className="d-flex align-items-center mt-3">
              <p className="text-muted d-block mb-0">Name:</p>
              <p className="text-primary ms-3 mb-0 font-semi-bold fs-6">
                {patient?.name}
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
              {(Forms || []).map((item, idx) => {
                // Admission & Consent forms are locked until a Capacity
                // Assessment exists for this admission.
                const gated =
                  !hasCapacityAssessment &&
                  (item.name === "Admission Form" ||
                    item.name === "Consent Form");
                return (
                  <DropdownItem
                    key={idx + item.category}
                    disabled={gated}
                    title={
                      gated
                        ? "Complete the Capacity Assessment Form first"
                        : undefined
                    }
                    onClick={() => {
                      if (gated) return;
                      if (item.name === "Capacity Assessment Form") {
                        setCapacityModal(true);
                      } else {
                        dispatch(
                          createEditChart({
                            ...editChartData,
                            chart: item.category,
                            patient,
                            isOpen: true,
                          }),
                        );
                      }

                      toggle();
                    }}
                  >
                    {item.name}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
          {/* {!hasCapacityAssessment && (
            <small className="text-muted d-block text-end mt-1">
              Add the Capacity Assessment Form first to enable the Admission &amp;
              Consent forms.
            </small>
          )} */}
        </div>
      </CustomModal>
      <CapacityAssessmentModal
        isOpen={capacityModal}
        toggle={() => setCapacityModal(false)}
        patient={patient}
        addmissionId={patient?.addmission?._id}
      />
    </React.Fragment>
  );
};

AdmissionChart.propTypes = {
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

export default connect(mapStateToProps)(AdmissionChart);
