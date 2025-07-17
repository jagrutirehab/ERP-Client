import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

//logo
import Logo from "../../../../assets/images/jagruti-logo.png";
import { format } from "date-fns";
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
  tableHeader: {
    width: "100%",
  },
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

const PrintHeader = ({ patient, center, bill }) => {
  const renderImage = () => (
    <Image src={center?.logo ? center.logo?.url : Logo} style={styles.logo} />
  );
  const dateOfAdmission = () => {
    return patient.addmission.addmissionDate
      ? format(new Date(patient.addmission.addmissionDate), "d MMM y")
      : "";
  };

  return (
    <React.Fragment>
      <View>
        <View>
          <View style={styles.logoSection}>
            <Text>
              Invoice Number:&#160;&#160;
              <Text
                style={styles.heading}
              >{`${bill?.id?.prefix}${bill?.id?.patientId}-${bill?.id?.value}`}</Text>
            </Text>
            <Text>
              Dated:&#160;&#160;{format(new Date(bill.date), "d MMM y")}
            </Text>
          </View>
          <View style={styles.logoSection}>
            <Text>
              {/* Ref No:&#160;&#160;
              <Text style={styles.heading}>DOA&#160;{bill.refDate}</Text> */}
            </Text>
            {patient?.addmission?.addmissionDate && (
              <Text>
                Date Of Admission:&#160;&#160;
                {dateOfAdmission()}
              </Text>
            )}
          </View>
        </View>
        <View style={{ ...styles.mainSection, margin: "20px 0" }}>
          <View style={{ width: "50%" }}>{renderImage()}</View>
          <View
            style={{ display: "flex", justifyContent: "center", width: "50%" }}
          >
            <Text style={styles.heading}>
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
        <View style={{ ...styles.row, ...styles.justifyContent }}>
          <Text>Created By: {bill.author?.name || ""}</Text>
          <Text>
            On:{" "}
            {bill.date
              ? format(new Date(bill.date), "dd MMM yyyy")
              : ""}
          </Text>
        </View>
        <View style={styles.patientSection}>
          <Text style={{ ...styles.heading, fontSize: "15px" }}>
            {bill.bill === INVOICE ? "BILL" : "REFUND RECEIPT"}
          </Text>
          <Text>
            Party:&#160;&#160;
            <Text
              style={{
                ...styles.heading,
                fontSize: "15px",
                textTransform: "capitalize",
              }}
            >
              {`${patient?.name} - ${patient?.id?.prefix}${patient?.id?.value}` ||
                ""}
            </Text>
          </Text>
        </View>
      </View>
    </React.Fragment>
  );
};

export default PrintHeader;
