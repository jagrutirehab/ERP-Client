import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

// logo
// import Logo from "../../../../assets/images/jagruti-logo.png";
import Logo from "../../../../assets/images/logo.png";
// import Logo from "../../../../assets/images/jagruti-logo.svg";
import { differenceInYears, format } from "date-fns";
import { INVOICE } from "../../../constants/patient";

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
  container: {
    border: "1px solid red",
    padding: 10,
    fontSize: 10,
    fontFamily: "Roboto",
  },
  mainSection: {
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontFamily: "Roboto",
    fontSize: 14,
    textDecoration: "underline",
    fontWeight: "heavy",
    marginBottom: 5,
  },
  halfWidth: {
    width: "50%",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 60,
    // border: 1,
    // borderColor: "#000",
  },
  clinicInfo: {
    flex: 1,
    textAlign: "center",
    marginLeft: -60,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  address: {
    fontSize: 10,
  },
  borderBox: {
    border: "1px solid black",
    padding: 6,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  label: {
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  item: {
    textTransform: "capitalize",
    paddingBottom: 5,
  },
});

const PrintHeader = ({ patient, center, bill, admission }) => {
  const renderImage = () => (
    <Image src={center?.logo ? center.logo?.url : Logo} style={styles.logo} />
  );
  const formatDateTime = (date) =>
    date ? format(new Date(date), "dd MMM yyyy hh:mm a") : "--";

  const formatDate = (date) =>
    date ? format(new Date(date), "dd MMM yyyy") : "--";

  const age = () =>
    differenceInYears(new Date(), new Date(patient?.dateOfBirth));

  return (
    <View>
      {/* Top Section */}
      <View
        style={{
          ...styles.mainSection,
          margin: "20px 0",
          borderBottom: 1,
          borderColor: "#000",
          paddingBottom: 0,
        }}
      >
        <View
          style={
            {
              // width: "50%",
              // border: 1,
              // borderColor: "#000",
            }
          }
        >
          {renderImage()}
        </View>
        <View
          style={{
            // display: "flex",
            flexDirection: "col",
            justifyContent: "center",
            alignItems: "center",
            // width: "50%",
            // border: 1,
            // borderColor: "#000",
            // textAlign: "center",
          }}
        >
          <Text
            style={{
              ...styles.heading,
              // textAlign: "center",
              // border: 1,
              // display: "flex",
              // justifyContent: "center",
            }}
          >
            {center?.name || "JAGRUTI REHABILITATION CENTRE"}
          </Text>
          {/* <Text>SIDDHIVINAYAK PLOT NO-37, SEC-5, TALOJA PHASE 1,</Text>
            <Text>NAVI MUMBAI-410208</Text>
            <Text>E-Mail : jagrutirehabmumbai@gmail.com</Text> */}
          <Text style={{ whiteSpace: "pre-line" }}>
            {center?.address || "center address goes here."}
          </Text>
        </View>
      </View>
      {/* <View style={styles.headerTop}>
        {renderImage()}
        <View style={styles.clinicInfo}>

          <Text style={styles.clinicName}>
            {center?.name || "Jagruti Rehabilitation Centre"}
          </Text>
          <Text style={styles.address}>
            {center?.address || "D 46, Block D, Sector 48, Noida, Uttar Pradesh - 201303"}
          </Text>
        </View>
      </View> */}

      {/* Details Section */}
      <View style={{ ...styles.borderBox, flexDirection: "row" }}>
        <View style={{ ...styles.halfWidth }}>
          <Text style={styles.item}>
            <Text style={styles.label}>UHID No.:</Text> {patient?.id?.prefix}
            {patient?.id?.value}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Patient Name:</Text> {patient?.name}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Age:</Text> {age() || "--"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Sex:</Text> {patient?.gender || "--"}
          </Text>
          <Text>
            <Text style={styles.label}>Psychologist Name:</Text>{" "}
            {admission?.psychologist?.name || patient?.psychologist?.name}
          </Text>
        </View>
        <View style={{ ...styles.halfWidth }}>
          <Text style={styles.item}>
            <Text style={styles.label}>Invoice Date:</Text>{" "}
            {formatDate(bill?.date)}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Invoice No.:</Text> {bill?.id?.prefix}
            {bill?.id?.patientId}-{bill?.id?.value}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Date of Admission:</Text>{" "}
            {formatDate(
              admission?.addmissionDate || patient?.addmission?.addmissionDate
            )}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Date of Discharge:</Text>{" "}
            {formatDate(
              admission?.dischargeDate || patient?.addmission?.dischargeDate
            )}
          </Text>
          <Text>
            <Text style={styles.label}>Diagnosed With:</Text>{" "}
            {admission?.provisionalDiagnosis || patient?.provisionalDiagnosis}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PrintHeader;
