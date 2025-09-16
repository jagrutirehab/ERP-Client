import React from "react";
import { View, Text, StyleSheet, Font, Image } from "@react-pdf/renderer";
import Roboto from "../../../../../assets/fonts/Roboto-Bold.ttf";
import RXIcon from "../../../../../assets/images/small/rx.jpeg";

//table
import PrescriptionTable from "./Table";
import { format } from "date-fns";
import { safeText } from "../../../../../utils/safeText";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  instr: {
    fontFamily: "Roboto Italic",
    fontSize: "11px",
  },
  textGray: {
    color: "#36454F",
  },
  fontBold: {
    fontFamily: "Roboto Italic",
    // letterSpacing: '0.6px',
    fontSize: "12px",
    // fontStyle: 'italic',
  },
  fontNormal: {
    fontFamily: "Roboto",
    fontSize: "11px",
  },
  fontHeavy: {
    fontFamily: "Mukta Bold",
    fontSize: "15px",
  },
  fontMd: {
    fontSize: "11px",
    fontWeight: "normal",
  },
  fontItalic: {
    fontStyle: "italic",
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
  image: {
    width: "50px",
    // margin: "auto",
    // marginRight: "30px",
  },
});

const PrescriptionBody = ({ chart, doctor, author }) => {
  const renderImage = (src, width) => {
    if (!src) return null;
    return <Image src={src} style={styles.image} />;
  };
  return (
    <React.Fragment>
      <View style={{ ...styles.mrgnTop10, ...styles.mrgnBottom10 }}>
        {/* <View style={{ ...styles.mrgnBottom10 }}>
          <Text style={{ ...styles.fontBold, textDecoration: "underline" }}>
            Diagnosis: Seborrheic dermatitis
          </Text>
        </View> */}
        {/* {chart?.drNotes && (
          <View wrap={false}>
            <Text style={{ ...styles.instr, ...styles.textUnderline }}>
              Observations / Complaints:
            </Text>
            <Text style={{ ...styles.mrgnLeft10, ...styles.textWrap }}>
              {chart?.drNotes}
            </Text>
          </View>
        )} */}
        {chart?.diagnosis && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr }}>
              Diagnosis:{" "}
              <Text
                style={{
                  ...styles.textGray,
                  ...styles.fontNormal,
                  ...styles.mrgnLeft10,
                  ...styles.textWrap,
                }}
              >
                {chart?.diagnosis}
              </Text>
            </Text>
          </View>
        )}
        <Image src={RXIcon} style={{ width: "25px", ...styles.mrgnTop10 }} />
        {chart?.medicines?.length > 0 && (
          <View style={styles.mrgnTop10}>
            <PrescriptionTable medicines={chart.medicines} />
          </View>
        )}
        {chart?.notes && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr }}>
              Notes:{" "}
              <Text
                style={{
                  ...styles.textGray,
                  ...styles.fontNormal,
                  ...styles.mrgnLeft10,
                  ...styles.textWrap,
                }}
              >
                {chart?.notes}
              </Text>
            </Text>
          </View>
        )}
        {chart?.investigationPlan && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr }}>
              Investigation Plan:{" "}
              <Text
                style={{
                  ...styles.textGray,
                  ...styles.fontNormal,
                  ...styles.mrgnLeft10,
                  ...styles.textWrap,
                }}
              >
                {chart?.investigationPlan}
              </Text>
            </Text>
          </View>
        )}
        {chart?.complaints && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr }}>
              Complaints:{" "}
              <Text
                style={{
                  ...styles.textGray,
                  ...styles.fontNormal,
                  ...styles.mrgnLeft10,
                  ...styles.textWrap,
                }}
              >
                {chart?.complaints}
              </Text>
            </Text>
          </View>
        )}
        {chart?.observation && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr }}>
              Observations:{" "}
              <Text
                style={{
                  ...styles.textGray,
                  ...styles.fontNormal,
                  ...styles.mrgnLeft10,
                  ...styles.textWrap,
                }}
              >
                {chart?.observation}
              </Text>
            </Text>
          </View>
        )}
        {chart?.followUp && (
          <View wrap={false} style={{ ...styles.mrgnTop10 }}>
            <Text style={{ ...styles.instr }}>
              Next Visit:{" "}
              <Text
                style={{
                  ...styles.textGray,
                  ...styles.fontNormal,
                  ...styles.mrgnLeft10,
                  ...styles.textWrap,
                }}
              >
                {format(new Date(chart.followUp), "dd MMM yyyy")}
              </Text>
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
            ...styles.row,
            textAlign: "right",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {author?.signature && (
              <View
                style={{
                  width: "100%",
                  ...styles.row,
                  justifyContent: "center",
                }}
                wrap={false}
              >
                {renderImage(author.signature, 200)}
              </View>
            )}
            {author?.name && (
              <Text
                style={{
                  lineHeight: 1.2,
                  marginBottom: 3,
                  ...styles.textCapitalize,
                }}
              >
                {author?.name}
              </Text>
            )}
            {safeText(
              "",
              {
                lineHeight: 1.2,
                ...styles.fontNormal,
                ...styles.textCapitalize,
              },
              author?.degrees
            )}
            {safeText(
              "",
              {
                lineHeight: 1.2,
                ...styles.fontNormal,
                ...styles.textCapitalize,
              },
              author?.speciality
            )}
            {safeText(
              "Reg. No.",
              {
                lineHeight: 1.2,
                ...styles.fontNormal,
                ...styles.textCapitalize,
              },
              author?.registrationNo
            )}
          </View>
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
