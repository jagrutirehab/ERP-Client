import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Modal,
  ModalHeader,
  ModalBody,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { set } from "date-fns";
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import CustomModal from "../../../Components/Common/Modal";
import { Forms } from "../../../Components/constants/patient";
import { connect, useDispatch } from "react-redux";
import { createEditChart, setChartDate } from "../../../store/actions";
import CapacityAssessmentModal from "./CapacityAssessmentModal";
import ECTConsentFormModal from "./ECTConsentFormModal";
import MHRBEmailUploadModal from "./MHRBEmailUploadModal";
import DnrConsentFormModal from "./DnrConsentFormModal";

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
  const [ectConsentModal, setEctConsentModal] = useState(false);
  const [mhrbEmailModal, setMhrbEmailModal] = useState(false);
  const [dnrModal, setDnrModal] = useState(false);
  const [mhrbSectionOpen, setMhrbSectionOpen] = useState(false);
  const [mhrbFlyoutOpen, setMhrbFlyoutOpen] = useState(false);

  // The 4 forms grouped under "MHRB Related Forms" in the Add Records dropdown.
  // Filtered by name rather than array position so this stays correct even
  // if Forms is reordered later.
  const MHRB_SECTION_NAMES = [
    "Capacity Assessment Form",
    "MHRB Admission",
    "MHRB Discharge Form",
    "MHRB Email Upload",
  ];
  const mhrbSectionForms = (Forms || []).filter((f) =>
    MHRB_SECTION_NAMES.includes(f.name),
  );
  const standaloneForms = (Forms || []).filter(
    (f) => !MHRB_SECTION_NAMES.includes(f.name),
  );

  // Same routing every form item has always used — shared by the main
  // dropdown's standalone items and the MHRB Related Forms sub-modal's items, so
  // both paths trigger the exact same action.
  const handleFormSelect = (item) => {
    if (item.name === "Capacity Assessment Form") {
      setCapacityModal(true);
    } else if (item.name === "ECT Consent Form") {
      setEctConsentModal(true);
    } else if (item.name === "MHRB Email Upload") {
      setMhrbEmailModal(true);
    } else if (item.name === "Do Not Resuscitate Form") {
      setDnrModal(true);
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
  };

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
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setMhrbFlyoutOpen(true)}
                onMouseLeave={() => setMhrbFlyoutOpen(false)}
              >
                <DropdownItem
                  id="mhrb-section-item"
                  onClick={() => {
                    setMhrbSectionOpen(true);
                    toggle();
                  }}
                >
                  MHRB Related Forms
                </DropdownItem>
                {mhrbFlyoutOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "100%",
                      paddingLeft: "10px",
                      marginLeft: "-10px",
                      zIndex: 1000,
                      pointerEvents: "auto",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "220px",
                        backgroundColor: "#fff",
                        border: "1px solid rgba(0, 0, 0, 0.15)",
                        borderRadius: "0.25rem",
                        boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.175)",
                        padding: "0.5rem 0",
                      }}
                    >
                      {mhrbSectionForms.map((item) => (
                        <div
                          key={item.category}
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFormSelect(item);
                            toggle();
                          }}
                          style={{
                            padding: "0.25rem 1.5rem",
                            fontSize: "1rem",
                            fontWeight: 400,
                            color: "#212529",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DropdownItem divider />
              {standaloneForms.map((item) => (
                <DropdownItem
                  key={item.category}
                  onClick={() => {
                    handleFormSelect(item);
                    toggle();
                  }}
                >
                  {item.name}
                </DropdownItem>
              ))}
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
      <ECTConsentFormModal
        isOpen={ectConsentModal}
        toggle={() => setEctConsentModal(false)}
        patient={patient}
        // ECTConsentForm reads admissions[0].doctor for its prefill.
        admissions={patient?.addmission ? [patient.addmission] : []}
        addmissionId={patient?.addmission?._id}
      />
      <CapacityAssessmentModal
        isOpen={capacityModal}
        toggle={() => setCapacityModal(false)}
        patient={patient}
        addmissionId={patient?.addmission?._id}
      />
      <MHRBEmailUploadModal
        isOpen={mhrbEmailModal}
        toggle={() => setMhrbEmailModal(false)}
        patient={patient}
        addmissionId={patient?.addmission?._id}
      />
      <DnrConsentFormModal
        isOpen={dnrModal}
        toggle={() => setDnrModal(false)}
        patient={patient}
        // DnrConsentForm reads admissions[0].doctor for its prefill.
        admissions={patient?.addmission ? [patient.addmission] : []}
        addmissionId={patient?.addmission?._id}
      />
      <Modal
        isOpen={mhrbSectionOpen}
        toggle={() => setMhrbSectionOpen(false)}
        centered
      >
        <ModalHeader toggle={() => setMhrbSectionOpen(false)}>
          MHRB Related Forms
        </ModalHeader>
        <ModalBody>
          <ListGroup>
            {mhrbSectionForms.map((item) => (
              <ListGroupItem
                key={item.category}
                action
                tag="button"
                onClick={() => {
                  handleFormSelect(item);
                  setMhrbSectionOpen(false);
                }}
              >
                {item.name}
              </ListGroupItem>
            ))}
          </ListGroup>
        </ModalBody>
      </Modal>
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
