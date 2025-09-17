import React from "react";
import { View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import { differenceInYears, format } from "date-fns";

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
    alignItems: "center",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  col6: {
    width: "50%",
  },
  padding5: {
    paddingTop: 5,
  },
  paddingBottom3: {
    paddingTop: 3,
  },
  paddingTop3: {
    paddingTop: 3,
  },
  padding10: {
    paddingTop: 10,
  },
  paddingRight5: {
    paddingRight: 5,
  },
  fontHeavy: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
    fontSize: "12px",
  },
  textRight: {
    textAlign: "right",
  },
  fontMd: {
    fontSize: "10px",
  },
  paddingBottom5: {
    marginBottom: 5,
  },
});

const border = "1px solid #000";
const Header = ({ chart, center, patient }) => {
  const age = () =>
    differenceInYears(new Date(), new Date(patient?.dateOfBirth));
  return (
    <React.Fragment>
      <View fixed style={{ height: 80 }}>
        <View
          style={{
            ...styles.row,
            ...styles.justifyBetween,
            alignItems: "center",
          }}
        >
          <View style={styles.col6}>
            <Text style={{ fontFamily: "Roboto", fontSize: "15px" }}>
              {center.name || "JAGRUTI REHABILITATION CENTRE"}
            </Text>
          </View>
          <View style={styles.col6}>
            <Text style={{ whiteSpace: "pre-line" }}>
              {center?.address || "center address goes here"}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 5,
            paddingBottom: 5,
            paddingTop: 5,
            borderBottom: border,
            borderTop: border,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              Patient:{" "}
              {`${patient?.name} - ${patient?.id?.prefix}${patient?.id?.value}` ||
                ""}
            </Text>
          </View>
          <View style={{ flexShrink: 0, textAlign: "right" }}>
            {patient?.addmission?.addmissionDate && (
              <Text>
                DOA:{" "}
                {format(
                  new Date(patient?.addmission?.addmissionDate),
                  "d MMM y"
                )}
              </Text>
            )}

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              {patient.gender && (
                <Text style={{ textTransform: "capitalize" }}>
                  Gender: {patient.gender.toLowerCase()}
                </Text>
              )}
              {patient.dateOfBirth && (
                <Text style={{ marginLeft: 6 }}>Age: {age()}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

export default Header;
