import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import Logo from "../../../../assets/images/jagruti-logo.png";
import { format } from "date-fns";
import { INVOICE, WRITE_OFF, REFUND } from "../../../constants/patient";

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
  justifyContent: {
    justifyContent: "space-between",
  },
  logo: {
    width: 150,
  },
  logoSection: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainSection: {
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  patientSection: {
    marginTop: 20,
    textAlign: "center",
  },
});

const Header = ({ patient, center, bill }) => {
  const renderImage = () => (
    <Image src={center?.logo ? center.logo?.url : Logo} style={styles.logo} />
  );

  const getTitle = () => {
    if (bill.bill === WRITE_OFF) return "WRITE OFF";
    if (bill.bill === REFUND) return "REFUND RECEIPT";
    return "BILL";
  };

  const dateOfAdmission = () =>
    patient?.addmission?.addmissionDate
      ? format(new Date(patient.addmission.addmissionDate), "d MMM y")
      : "";

  return (
    <View>
      {/* Top Invoice Info */}
      <View>
        <View style={styles.logoSection}>
          <Text>
            Invoice Number:&nbsp;&nbsp;
            <Text style={styles.heading}>
              {`${bill?.id?.prefix}${bill?.id?.patientId}-${bill?.id?.value}`}
            </Text>
          </Text>
          <Text>
            Dated:&nbsp;&nbsp;
            {bill?.date ? format(new Date(bill.date), "d MMM y") : ""}
          </Text>
        </View>

        <View style={styles.logoSection}>
          <Text></Text>
          {patient?.addmission?.addmissionDate && (
            <Text>
              Date Of Admission:&nbsp;&nbsp;
              {dateOfAdmission()}
            </Text>
          )}
        </View>
      </View>

      {/* Center Info */}
      <View style={{ ...styles.mainSection, margin: "20px 0" }}>
        <View style={{ width: "50%" }}>{renderImage()}</View>
        <View style={{ width: "50%" }}>
          <Text style={styles.heading}>
            {center?.name || "JAGRUTI REHABILITATION CENTRE"}
          </Text>
          <Text>
            {center?.address || "center address goes here."}
          </Text>
        </View>
      </View>

      {/* Created By */}
      <View style={{ ...styles.row, ...styles.justifyContent }}>
        <Text>Created By: {bill?.author?.name || ""}</Text>
        <Text>
          On:{" "}
          {bill?.date
            ? format(new Date(bill.date), "dd MMM yyyy")
            : ""}
        </Text>
      </View>

      {/* Title + Party */}
      <View style={styles.patientSection}>
        <Text style={{ ...styles.heading, fontSize: "15px" }}>
          {getTitle()}
        </Text>

        <Text>
          Party:&nbsp;&nbsp;
          <Text
            style={{
              ...styles.heading,
              fontSize: "15px",
              textTransform: "capitalize",
            }}
          >
            {`${patient?.name} - ${patient?.id?.prefix}${patient?.id?.value}`}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Header;