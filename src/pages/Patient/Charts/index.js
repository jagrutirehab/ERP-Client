import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Row } from "reactstrap";
import Wrapper from "../Components/Wrapper";
import {
  CLINICAL_NOTE,
  COUNSELLING_NOTE,
  DETAIL_ADMISSION,
  DISCHARGE_SUMMARY,
  LAB_REPORT,
  MENTAL_EXAMINATION,
  PRESCRIPTION,
  RELATIVE_VISIT,
  VITAL_SIGN,
} from "../../../Components/constants/patient";

//redux
import {
  createEditChart,
  fetchCharts,
  fetchChartsAddmissions,
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
import MentalExamination from "./MentalExamination";
import { io } from "socket.io-client";
import { getCharts } from "../../../helpers/backend_helper";
import { api } from "../../../config";

const Charts = ({ addmission, charts, toggleDateModal }) => {



  const dispatch = useDispatch();
  const [, forceUpdate] = useState(0);

  const [chart, setChart] = useState({
    chart: null,
    isOpen: false,
  });


  const socketRef = useRef(null);

  const addmissionRef = useRef(addmission);

  useEffect(() => {
    addmissionRef.current = addmission;
  }, [addmission]);

  // console.log("Admission ID:", addmissionRef.current._id);
  useEffect(() => {
    console.log("🚀 useEffect triggered");

    const SOCKET_BASE_URL = api.API_URL.replace("/api/v1", "");

    socketRef.current = io(SOCKET_BASE_URL, {
      path: "/socket/search",
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.log("❌ Socket error:", err.message);
    });

    socketRef.current.on("audioProcessingDone", (data) => {
      console.log("🔥 Processing Done:", data);

      setTimeout(() => {
        dispatch(fetchChartsAddmissions([addmissionRef.current._id]));
        dispatch(fetchCharts(addmissionRef.current._id));
        // getCharts(addmissionRef.current._id)
      }, 2000);
    });

    return () => {
      socketRef.current?.off("audioProcessingDone");
      socketRef.current?.disconnect();
    };
  }, []);

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

  console.log("CHARTING", charts);




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
                geminiResponseGeneratedBy={chart?.geminiResponseGeneratedBy}
                geminiResponseIsVerified={chart?.geminiResponseIsVerified}
                validatorId={chart?.validatorId}
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
                  <LabReport data={chart.labReport?.reports} date={chart.labReport?.updatedAt} />
                )}
                {chart.chart === DETAIL_ADMISSION && (
                  <DetailAdmission data={chart.detailAdmission} />
                )}
                {chart.chart === MENTAL_EXAMINATION && (
                  <MentalExamination data={chart.mentalExamination} />
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
