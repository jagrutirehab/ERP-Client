import React from "react";
import { View, Text, Font, StyleSheet, Image } from "@react-pdf/renderer";
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";
import BrandLogo from "../../../assets/images/jagruti-logo.png";
import DoctorLogo from "../../../assets/images/doctor-logo.jpg";
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

const lineColor1 = "#E06469";
const lineColor2 = "#4E31AA";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    // alignItems: "center",
    // textTransform: "capitalize",
  },
  col3: {
    width: "25%",
  },
  col1: {
    width: "10%",
  },
  col2: {
    width: "15%",
  },
  col6: {
    width: "65%",
  },
  col8: {
    width: "80%",
  },
  col9: {
    width: "85%",
  },
  itemsCenter: {
    alignItems: "center",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  padding5: {
    padding: 5,
  },
  paddingBottom3: {
    paddingTop: 3,
  },
  paddingTop3: {
    paddingTop: 3,
  },
  marginTop10: {
    marginTop: 10,
  },
  marginLeft3: {
    marginLeft: 3,
  },
  marginRight3: {
    marginRight: 3,
  },
  paddingTop1: {
    paddingTop: 1,
  },
  paddingTop10: {
    paddingTop: 10,
  },
  paddingRight5: {
    paddingRight: 5,
  },
  paddingLeft5: {
    paddingLeft: 5,
  },
  paddingLeft10: {
    paddingLeft: 10,
  },
  paddingRight10: {
    paddingRight: 10,
  },
  borderBottom: {
    borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
  },
  fontHeavy: {
    fontFamily: "Roboto Heavy",
  },
  fontThin: {
    fontFamily: "Helvetica Narrow",
  },
  fontSize20: {
    fontSize: "20px",
  },
  fontMd: {
    fontSize: "10px",
  },
  fontLarge: {
    fontSize: "13px",
  },
  textRight: {
    textAlign: "right",
  },
  fontSm: {
    fontSize: "9px",
  },
  hrRule: {
    height: "3px",
  },
});

// const border = "1px solid #000";
const Header = ({ chart, center, patient, doctor }) => {
  const age = () =>
    patient?.dateOfBirth
      ? `${differenceInYears(new Date(), new Date(patient.dateOfBirth))} Years,`
      : patient?.age
      ? `${patient.age} Years`
      : "";

  const gender = (str) => {
    if (str) return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    else return "";
  };
  return (
    <React.Fragment>
      <View>
        <View
          style={{
            ...styles.row,
            ...styles.justifyBetween,
            ...styles.paddingLeft10,
            ...styles.paddingRight10,
          }}
        >
          <View style={{ width: "60%" }}>
            <Text
              style={{
                ...styles.fontHeavy,
                ...styles.fontSize20,
                color: lineColor1,
              }}
            >
              {center.name}
            </Text>
            <Text style={{ ...styles.fontSm, ...styles.paddingTop1 }}>
              {center.numbers || "77458 80088 / 98222 07761"}
            </Text>
            <Text style={{ ...styles.fontSm, ...styles.paddingTop1 }}>
              info@jagrutirehab.org
            </Text>
            <Text style={{ ...styles.fontSm, ...styles.paddingTop1 }}>
              www.jagrutirehab.org
            </Text>
            {/* <Image src={BrandLogo} style={{ width: "150px" }} /> */}
            {/* <View style={styles.paddingTop3}>
              <Text style={{ ...styles.fontSm, ...styles.paddingTop1 }}>
                77458 80088 / 98222 07761
              </Text>
              <Text style={{ ...styles.fontSm, ...styles.paddingTop1 }}>
                info@jagrutirehab.org
              </Text>
              <Text style={{ ...styles.fontSm, ...styles.paddingTop1 }}>
                www.jagrutirehab.org
              </Text>
            </View> */}
          </View>
          {/* <View>
            <Image src={DoctorLogo} style={{ width: '20px' }} />
          </View> */}
          <View style={{ width: "40%" }}>
            {doctor?.name ? (
              <Text
                style={{
                  ...styles.fontHeavy,
                  ...styles.fontSize20,
                  color: lineColor1,
                  textTransform: "capitalize",
                }}
              >
                {doctor.name}
              </Text>
            ) : (
              <Text
                style={{
                  ...styles.fontHeavy,
                  ...styles.fontSize20,
                  color: lineColor1,
                  textTransform: "capitalize",
                }}
              >
                {chart?.author?.name}
              </Text>
            )}
            {/* {doctor?.degrees && (
              <Text
                style={{
                  ...styles.fontSm,
                  ...styles.paddingTop1,
                  whiteSpace: "pre-line",
                }}
              >
                {doctor?.degrees}
              </Text>
            )}
            {doctor?.speciality && (
              <Text
                style={{
                  ...styles.fontSm,
                  ...styles.paddingTop1,
                  whiteSpace: "pre-line",
                }}
              >
                {doctor?.speciality}
              </Text>
            )} */}
            {/* {doctor?.education?.regNumber && (
              <Text style={{ ...styles.fontSm, ...styles.paddingTop1 }}>
                {doctor.education?.registrationNo}
              </Text>
            )} */}
            {/* <Text style={{ ...styles.fontSm, ...styles.paddingTop1 }}>
              Sexologist lorem ipsum lorem ipsum
            </Text> */}
          </View>
        </View>
        <View style={{ ...styles.row, ...styles.paddingTop10 }}>
          <View
            style={{
              ...styles.col3,
              ...styles.hrRule,
              backgroundColor: lineColor1,
            }}
          />
          <View
            style={{
              ...styles.col1,
              ...styles.hrRule,
              ...styles.marginLeft3,
              ...styles.marginRight3,
              backgroundColor: lineColor2,
            }}
          />
          <View
            style={{
              ...styles.col6,
              ...styles.hrRule,
              backgroundColor: lineColor1,
            }}
          />
        </View>
        <View
          style={{
            ...styles.paddingLeft10,
            ...styles.paddingRight10,
            ...styles.paddingTop10,
          }}
        >
          <Text style={{ ...styles.fontMd, textAlign: "center" }}>
            {center?.address?.replace(/\n/g, "") || "center address goes here"}
          </Text>
        </View>
        <View
          style={{
            ...styles.marginTop10,
            ...styles.padding5,
            ...styles.fontLarge,
            ...styles.borderBottom,
            ...styles.fontHeavy,
            backgroundColor: "rgba(150, 150, 150, 0.1)",
          }}
        >
          <View style={{ ...styles.row }}>
            <Text style={{ ...styles.col2 }}>Name:</Text>

            <View
              style={{
                ...styles.col9,
                ...styles.row,
                ...styles.justifyBetween,
              }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text>
                  {`${patient?.name} - ${patient?.id?.prefix}${patient?.id?.value}` ||
                    ""}
                  {" - "}
                  {(patient?.age || patient.gender) &&
                    `(${age()} ${gender(patient?.gender) || ""})`}
                </Text>
              </View>
              <View style={{ flexShrink: 0 }}>
                <Text style={styles.fontThin}>{patient?.phoneNumber}</Text>
              </View>
            </View>
          </View>

          <View style={{ ...styles.row }}>
            <Text style={{ ...styles.col2 }}>Date:</Text>
            <Text style={{ ...styles.col9 }}>
              {chart?.date && format(new Date(chart?.date), "d MMM y")}
            </Text>
          </View>
          {patient.address && (
            <View style={{ ...styles.row, ...styles.itemsCenter }}>
              <Text style={{ ...styles.col2 }}>Address:</Text>
              <Text
                style={{ ...styles.col9, ...styles.fontThin, ...styles.fontMd }}
              >
                {patient.address}
              </Text>
            </View>
          )}
        </View>
      </View>
    </React.Fragment>
  );
};

export default Header;
