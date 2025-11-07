import React from "react";
import { StyleSheet, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import DetailInfo from "./DetailInfo";
import DetailHistory from "./DetailHistory";
import MentalExamination from "./MentalExamination";
import PhysicalExamination from "./PhysicalExamination";
import Diagnosis from "./Diagnosis";
import DoctorSignature from "./DoctorSignature";
import CheifComplaint from "./ChiefComplaint";
import ProvisionalDiagnosis from "./ProvisionalDaignosis";

//table
// import PrescriptionTable from "./Table";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  itemsCenter: {
    alignItems: "center",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
    gap: 10,
  },
  w25: {
    width: "25%",
    marginBottom: 5,
  },
  w50: {
    width: "50%",
    marginBottom: 5,
  },
  w30: {
    width: "30%",
  },
  w5: {
    width: "5%",
    marginBottom: 5,
  },
  w70: {
    width: "70%",
    marginBottom: 5,
  },
  gap10: {
    gap: 10,
  },
  instr: {
    fontFamily: "Roboto",
    fontSize: "12px",
  },
  fontMd: {
    fontSize: "11px",
    fontWeight: "normal",
  },
  mrgnTop30: {
    marginTop: 30,
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnBottom10: {
    marginBottom: 20,
  },
  mrgnBottom5: {
    marginBottom: 10,
  },
  mrgnTop60: {
    marginTop: 200,
  },
  mrgnLeft10: {
    marginLeft: 10,
  },
  fontSize13: {
    fontSize: "13px",
    fontFamily: "Roboto",
    fontWeight: "heavy",
    paddingBottom: 7,
  },
  preText: {
    whiteSpace: "pre-line",
    lineHeight: 1.3,
    paddingLeft: 5,
  },
  col6: {
    width: "50%",
  },
  textRight: {
    textAlign: "right",
  },
  textUppercase: {
    textTransform: "uppercase",
  },
  textCapitalize: {
    textTransform: "capitalize",
  },
  textWrap: {
    whiteSpace: "wrap",
  },
});

const Body = ({ chart, patient }) => {
  const data = chart.detailAdmission;

  return (
    <React.Fragment>
      <DetailInfo
        chart={chart}
        patient={patient}
        data={data.detailAdmission}
        styles={styles}
      />
      <CheifComplaint data={data.ChiefComplaints} styles={styles} />
      <ProvisionalDiagnosis data={data.ProvisionalDiagnosis} styles={styles} />
      <DetailHistory data={data.detailHistory} styles={styles} />
      <MentalExamination data={data.mentalExamination} styles={styles} />
      <PhysicalExamination data={data.physicalExamination} styles={styles} />
      <Diagnosis data={data.doctorSignature} styles={styles} />
      <DoctorSignature doctor={patient}/>
      {/* <View style={{ ...styles.mrgnTop10, ...styles.mrgnBottom10 }}>
        {chart.drNotes && (
          <View>
            <Text style={styles.instr}>Observations / Complaints:-</Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.notes}
            </Text>
          </View>
        )}
        {chart.diagnosis && (
          <View style={{ ...styles.mrgnTop10 }}>
            <Text style={styles.instr}>Diagnosis:-</Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.diagnosis}
            </Text>
          </View>
        )}
        {chart.drNotes && (
          <View style={{ ...styles.mrgnTop10 }}>
            <Text style={styles.instr}>Notes:-</Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.drNotes}
            </Text>
          </View>
        )}
        {chart.investigationPlan && (
          <View style={{ ...styles.mrgnTop10 }}>
            <Text style={styles.instr}>Investigation Plan:-</Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.investigationPlan}
            </Text>
          </View>
        )}
        {doctor && (
          <View
            style={{
              ...styles.row,
              ...styles.mrgnTop60,
              ...styles.textRight,
            }}
          >
            <View style={styles.col6}></View>
            <View
              style={{
                ...styles.col6,
                textAlign: "center",
              }}
            >
              <Text style={{ ...styles.textCapitalize, ...styles.instr }}>
                Dr. {doctor?.name || ""}
              </Text>
              <Text>{doctor?.degrees || ""}</Text>
            </View>
          </View>
        )}
      </View> */}
    </React.Fragment>
  );
};

export default Body;
