import React, { useState } from "react";
import PropTypes from "prop-types";
import { Row } from "reactstrap";
import Wrapper from "../Components/Wrapper";
import {
  CLINICAL_NOTE,
  COUNSELLING_NOTE,
  DETAIL_ADMISSION,
  DISCHARGE_SUMMARY,
  LAB_REPORT,
  PRESCRIPTION,
  RELATIVE_VISIT,
  VITAL_SIGN,
} from "../../../Components/constants/patient";

//redux
import {
  createEditChart,
  removeChart,
  togglePrint,
} from "../../../store/actions";
import { connect, useDispatch } from "react-redux";

import DischargeSummary from "./DischargeSummary";
import Prescription from "./Prescription";
import VitalSign from "./VitalSign";
import ClinicalNote from "./ClinicalNote";
import DeleteModal from "../../../Components/Common/DeleteModal";
import LabReport from "./LabReport";
import RelativeVisit from "./RelativeVisit";
import DetailAdmission from "./DetailAdmission";
import CounsellingNote from "./CounsellingNote";

const Charts = ({ addmission, charts, toggleDateModal }) => {

  const dispatch = useDispatch();

  const [chart, setChart] = useState({
    chart: null,
    isOpen: false,
  });

  const editChart = (chart) => {
    toggleDateModal();
    dispatch(createEditChart({ data: chart, chart: null, isOpen: false }));
  };

  const getChart = (chart) => {
    setChart({
      chart,
      isOpen: true,
    });
  };

  const cancelDelete = () => {
    setChart({
      chart: null,
      isOpen: false,
    });
  };

  const deleteChart = () => {
    dispatch(removeChart(chart.chart._id));
    setChart({
      chart: null,
      isOpen: false,
    });
  };

  const printChart = (chart, patient) => {
    dispatch(
      togglePrint({
        data: chart,
        admission: addmission,
        modal: true,
        patient,
        doctor: addmission?.doctor,
      })
    );
  };

  return (
    <React.Fragment>
      <div className="timeline-2">
        <div className="timeline-continue">
          <Row className="timeline-right">
            {(charts || []).map((chart) => (
              <Wrapper
                key={chart._id}
                item={chart}
                name="Charting"
                editItem={editChart}
                deleteItem={getChart}
                printItem={printChart}
                // disableEdit={addmission?.dischargeDate ? true : false}
                disableDelete={addmission?.dischargeDate ? true : false}
                itemId={`${chart?.id?.prefix}${chart?.id?.patientId}-${chart?.id?.value}`}
              >
                {chart.chart === PRESCRIPTION && (
                  <Prescription data={chart?.prescription} />
                )}
                {chart.chart === RELATIVE_VISIT && (
                  <RelativeVisit data={chart?.relativeVisit} />
                )}
                {chart.chart === DISCHARGE_SUMMARY && (
                  <DischargeSummary data={chart?.dischargeSummary} />
                )}
                {chart.chart === VITAL_SIGN && (
                  <VitalSign data={chart.vitalSign} />
                )}
                {chart.chart === CLINICAL_NOTE && (
                  <ClinicalNote data={chart.clinicalNote} />
                )}
                {chart.chart === COUNSELLING_NOTE && (
                  <CounsellingNote data={chart.counsellingNote} />
                )}
                {chart.chart === LAB_REPORT && (
                  <LabReport data={chart.labReport?.reports} />
                )}
                {chart.chart === DETAIL_ADMISSION && (
                  <DetailAdmission data={chart.detailAdmission} />
                )}
              </Wrapper>
            ))}
          </Row>
        </div>
      </div>
      <DeleteModal
        onCloseClick={cancelDelete}
        onDeleteClick={deleteChart}
        show={chart.isOpen}
      />
    </React.Fragment>
  );
};

Charts.propTypes = {
  charts: PropTypes.array,
  toggleDateModal: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  // charts: state.Chart.data,
});

export default connect(mapStateToProps)(Charts);
