import React from "react";
import PropTypes from "prop-types";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import {
  CLINICAL_NOTE,
  COUNSELLING_NOTE,
  DETAIL_ADMISSION,
  DISCHARGE_SUMMARY,
  GENERAL,
  IPD,
  LAB_REPORT,
  MENTAL_EXAMINATION,
  PRESCRIPTION,
  RELATIVE_VISIT,
  VITAL_SIGN,
} from "../../constants/patient";

//charts
import OPDPrescription from "./OPD/Prescription/index";
import ClinicalNote from "./ClinicalNote";
import VitalSign from "./VitalSign";
import DischargeSummary from "./DischargeSummary";
import LabReport from "./LabReport";
import RenderWhen from "../../Common/RenderWhen";
import RelativeVisit from "./RelativeVisit";
import DetailAdmission from "./DetailAdmission";
import CounsellingNote from "./CounsellingNote";
import MentalExamination from "./MentalExamination";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    height: "100%",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: "column",
  },
});

const Charts = ({ charts, patient, doctor, admission }) => {
  return (
    <React.Fragment>
      <Document>
        {(charts || []).map((chart) => (
          <Page size="A4" style={styles.page} wrap={true}>
            <RenderWhen isTrue={chart?.chart === PRESCRIPTION}>
              {/* && chart.type === OPD */}
              <OPDPrescription
                chart={chart}
                center={chart.center}
                patient={patient}
                doctor={doctor}
                admission={admission}
              />
            </RenderWhen>

            {/* <RenderWhen
              isTrue={
                chart?.chart === PRESCRIPTION &&
                (chart.type === IPD || chart.type === GENERAL)
              }
            >
              <Prescription
                chart={chart}
                center={chart.center}
                patient={patient}
              />
            </RenderWhen> */}

            <RenderWhen isTrue={chart?.chart === CLINICAL_NOTE}>
              <ClinicalNote
                chart={chart}
                center={chart.center}
                patient={patient}
                admission={admission}
              />
            </RenderWhen>

            <RenderWhen
              isTrue={
                chart?.chart === LAB_REPORT &&
                (chart.type === IPD || chart.type === GENERAL)
              }
            >
              <LabReport
                chart={chart}
                center={chart.center}
                patient={patient}
                admission={admission}
              />
            </RenderWhen>

            <RenderWhen
              isTrue={
                chart?.chart === RELATIVE_VISIT &&
                (chart.type === IPD || chart.type === GENERAL)
              }
            >
              <RelativeVisit
                chart={chart}
                center={chart.center}
                patient={patient}
                admission={admission}
              />
            </RenderWhen>

            <RenderWhen
              isTrue={
                chart?.chart === VITAL_SIGN &&
                (chart.type === IPD || chart.type === GENERAL)
              }
            >
              <VitalSign
                chart={chart}
                center={chart.center}
                patient={patient}
                admission={admission}
              />
            </RenderWhen>

            <RenderWhen
              isTrue={
                chart?.chart === COUNSELLING_NOTE &&
                (chart.type === IPD || chart.type === GENERAL)
              }
            >
              <CounsellingNote
                chart={chart}
                center={chart.center}
                patient={patient}
                admission={admission}
              />
            </RenderWhen>

            <RenderWhen
              isTrue={chart?.chart === DISCHARGE_SUMMARY && chart.type === IPD}
            >
              {/* Discharge Summary is rendered through pdfmake in Print/index.js */}
              <DischargeSummary
                chart={chart}
                center={chart.center}
                patient={patient}
                admission={admission}
              />
            </RenderWhen>

            <RenderWhen
              isTrue={
                chart?.chart === DETAIL_ADMISSION &&
                (chart.type === IPD || chart.type === GENERAL)
              }
            >
              <DetailAdmission
                chart={chart}
                center={chart.center}
                patient={patient}
                admission={admission}
              />
            </RenderWhen>

            <RenderWhen isTrue={chart?.chart === MENTAL_EXAMINATION}>
              <MentalExamination
                chart={chart}
                center={chart.center}
                patient={patient}
                admission={admission} />
            </RenderWhen>
          </Page>
        ))}
      </Document>
    </React.Fragment>
  );
};

Charts.propTypes = {
  chart: PropTypes.object.isRequired,
};

export default Charts;
