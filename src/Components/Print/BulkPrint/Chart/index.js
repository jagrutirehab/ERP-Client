import React from "react";
import PropTypes from "prop-types";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import {
  CLINICAL_NOTE,
  DISCHARGE_SUMMARY,
  GENERAL,
  IPD,
  LAB_REPORT,
  PRESCRIPTION,
  RELATIVE_VISIT,
  VITAL_SIGN,
} from "../../../constants/patient";
import _ from "lodash";

//charts
import Prescription from "./Prescription";
import ClinicalNote from "./ClinicalNote";
import VitalSign from "./VitalSign";
import DischargeSummary from "./DischargeSummary";
import LabReport from "./LabReport";
import RenderWhen from "../../../Common/RenderWhen";
import RelativeVisit from "./RelativeVisit";
import Header from "./Header";
import Footer from "./Footer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    height: "100%",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    // paddingBottom: 30,
    flexDirection: "column",
  },
});

const Charts = ({ charts, patient, doctor, admission }) => {

  const chartChunks = _.chunk(charts || [], 5);
  
  return (
    <React.Fragment>
    <Document>
      {chartChunks.map((chunk, index) => (
        <Page key={index} size="A4" style={styles.page} wrap={true}>
          {index === 0 && charts?.length > 0 && patient && (
            <Header
              chart={charts[0]}
              center={charts[0]?.center}
              patient={patient}
              admission={admission}
            />
          )}
          {chunk.map((chart) => (
            <React.Fragment key={chart._id}>
              <RenderWhen isTrue={chart?.chart === PRESCRIPTION}>
                <Prescription
                  chart={chart}
                  center={chart.center}
                  patient={patient}
                  doctor={doctor}
                />
              </RenderWhen>

              <RenderWhen isTrue={chart?.chart === CLINICAL_NOTE}>
                <ClinicalNote
                  chart={chart}
                  center={chart.center}
                  patient={patient}
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
                />
              </RenderWhen>

              <RenderWhen
                isTrue={
                  chart?.chart === DISCHARGE_SUMMARY && chart.type === IPD
                }
              >
                <DischargeSummary
                  chart={chart}
                  center={chart.center}
                  patient={patient}
                />
              </RenderWhen>
            </React.Fragment>
          ))}

            {/* {(charts || []).slice(20, 40).map((chart) => (
              <React.Fragment key={chart._id}>
                <RenderWhen isTrue={chart?.chart === PRESCRIPTION}>
                  <Prescription
                    chart={chart}
                    center={chart.center}
                    patient={patient}
                    doctor={doctor}
                  />
                </RenderWhen>

                <RenderWhen isTrue={chart?.chart === CLINICAL_NOTE}>
                  <ClinicalNote
                    chart={chart}
                    center={chart.center}
                    patient={patient}
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
                  />
                </RenderWhen>

                <RenderWhen
                  isTrue={
                    chart?.chart === DISCHARGE_SUMMARY && chart.type === IPD
                  }
                >
                  <DischargeSummary
                    chart={chart}
                    center={chart.center}
                    patient={patient}
                  />
                </RenderWhen>
              </React.Fragment>
            ))}

            {(charts || []).slice(40, 60).map((chart) => (
              <React.Fragment key={chart._id}>
                <RenderWhen isTrue={chart?.chart === PRESCRIPTION}>
                  <Prescription
                    chart={chart}
                    center={chart.center}
                    patient={patient}
                    doctor={doctor}
                  />
                </RenderWhen>

                <RenderWhen isTrue={chart?.chart === CLINICAL_NOTE}>
                  <ClinicalNote
                    chart={chart}
                    center={chart.center}
                    patient={patient}
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
                  />
                </RenderWhen>

                <RenderWhen
                  isTrue={
                    chart?.chart === DISCHARGE_SUMMARY && chart.type === IPD
                  }
                >
                  <DischargeSummary
                    chart={chart}
                    center={chart.center}
                    patient={patient}
                  />
                </RenderWhen>
              </React.Fragment>
            ))}

            {(charts || []).slice(60, 80).map((chart) => (
              <React.Fragment key={chart._id}>
                <RenderWhen isTrue={chart?.chart === PRESCRIPTION}>
                  <Prescription
                    chart={chart}
                    center={chart.center}
                    patient={patient}
                    doctor={doctor}
                  />
                </RenderWhen>

                <RenderWhen isTrue={chart?.chart === CLINICAL_NOTE}>
                  <ClinicalNote
                    chart={chart}
                    center={chart.center}
                    patient={patient}
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
                  />
                </RenderWhen>

                <RenderWhen
                  isTrue={
                    chart?.chart === DISCHARGE_SUMMARY && chart.type === IPD
                  }
                >
                  <DischargeSummary
                    chart={chart}
                    center={chart.center}
                    patient={patient}
                  />
                </RenderWhen>
              </React.Fragment>
            ))} */}
          <Footer />
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
