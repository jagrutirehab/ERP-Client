import React from "react";
import { View, Text, StyleSheet, Font, Image } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import RXIcon from "../../../../assets/images/small/rx.jpeg";

//table
import PrescriptionTable from "./Table";

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
  instr: {
    fontFamily: "Roboto",
    fontSize: "12px",
  },
  fontBold: {
    fontFamily: "Roboto Italic",
    // letterSpacing: '0.6px',
    fontSize: "12px",
    // fontStyle: 'italic',
  },
  fontNormal: {
    fontFamily: "Roboto",
    fontSize: "10px",
  },
  fontHeavy: {
    fontFamily: "Mukta Bold",
    fontSize: "15px",
  },
  fontMd: {
    fontSize: "11px",
    fontWeight: "normal",
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnBottom10: {
    marginBottom: 20,
  },
  mrgnTop30: {
    marginTop: 30,
  },
  mrgnTop60: {
    marginTop: 200,
  },
  mrgnLeft10: {
    marginLeft: 10,
  },
  col6: {
    width: "50%",
  },
  textRight: {
    textAlign: "right",
  },
  textCapitalize: {
    textTransform: "capitalize",
  },
  textWrap: {
    whiteSpace: "wrap",
  },
  textUnderline: {
    textDecoration: "underline",
  },
});

const PrescriptionBody = ({ printData, doctor }) => {
  return (
    <React.Fragment>
      <View style={{ ...styles.mrgnTop10, ...styles.mrgnBottom10 }}>
        {/* <View style={{ ...styles.mrgnBottom10 }}>
          <Text style={{ ...styles.fontBold, textDecoration: "underline" }}>
            Diagnosis: Seborrheic dermatitis
          </Text>
        </View> */}
        {/* {printData?.observations && (
          <View wrap={false}>
            <Text style={{ ...styles.instr, ...styles.textUnderline }}>
              Observations / Complaints:-
            </Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {printData?.observations}
            </Text>
          </View>
        )} */}
        {printData?.diagnosis && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr, ...styles.textUnderline }}>
              Diagnosis:-
            </Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {printData?.diagnosis}
            </Text>
          </View>
        )}
        <Image src={RXIcon} style={{ width: "25px", ...styles.mrgnTop10 }} />
        {printData?.drugs?.length > 0 && (
          <View style={styles.mrgnTop10}>
            <PrescriptionTable medicines={printData.drugs} />
          </View>
        )}
        {printData?.notes && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr, ...styles.textUnderline }}>
              Notes:-
            </Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {printData?.notes}
            </Text>
          </View>
        )}
        {printData?.investigationPlan && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr, ...styles.textUnderline }}>
              Investigation Plan:-
            </Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {printData?.investigationPlan}
            </Text>
          </View>
        )}
        {/* <View style={{ ...styles.mrgnTop10 }}>
          <Text style={{ ...styles.fontBold }}>
            Next Visit:{" "}
            <Text style={{ ...styles.fontNormal }}>27 April, 2023</Text>
          </Text>
        </View> */}
        <View
          wrap={false}
          style={{
            ...styles.mrgnTop30,
            ...styles.fontHeavy,
            textAlign: "right",
          }}
        >
          {doctor?.name && (
            <Text style={{ lineHeight: 1.2 }}>{doctor.name}</Text>
          )}
          {doctor?.degrees && (
            <Text style={{ lineHeight: 1.2 }}>{doctor.degrees}</Text>
          )}
          {doctor?.specializations && (
            <Text style={{ lineHeight: 1.2 }}>{doctor.specializations}</Text>
          )}
          {doctor?.regNumber && (
            <Text style={{ lineHeight: 1.2 }}>
              Reg. No. -{doctor.regNumber}
            </Text>
          )}
        </View>
        {/* {doctor && (
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
        )} */}
      </View>
    </React.Fragment>
  );
};

export default PrescriptionBody;
