import React from "react";
import { View, Text, Font, StyleSheet } from "@react-pdf/renderer";
// import Roboto from "../../assets/fonts/Roboto-Bold.ttf";
import Roboto from "../../../../../../assets/fonts/Roboto-Bold.ttf";
import { format } from "date-fns";
// import moment from "moment";

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
  justifyBetween: {
    justifyContent: "space-between",
  },
  padding5: {
    paddingTop: 5,
  },
  padding10: {
    paddingTop: 10,
  },
  fontHeavy: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
    fontSize: "12px",
  },
  fontMedium: {
    fontSize: "12px",
  },
  alignCenter: {
    alignItems: "center",
  },
  textRight: {
    textAlign: "right",
  },
});

const border = "1px solid #000";
const Header = ({ bill, center, patient }) => {
  //   const age = () => moment(patient?.dateOfBirth).fromNow(true);
  return (
    <React.Fragment>
      <View>
        {/* <View style={{ textAlign: 'center', marginTop: 20 }}>
          <Text>Phone: +917977232565</Text>
        </View> */}
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 10,
            paddingTop: 5,
            borderBottom: border,
            borderTop: border,
            marginBottom: 10,
          }}
        >
          <View style={{ width: "60%" }}>
            <Text style={{ fontSize: "10px" }}>
              Patient:
              {`${patient?.name} - ${patient?.id?.prefix}${patient?.id?.value}` ||
                ""}
            </Text>
            <Text style={{ fontSize: "10px", ...styles.padding5 }}>
              {patient?.phoneNumber && <>Ph: {patient?.phoneNumber}</>}
            </Text>
            <Text>{patient?.email && <>Email: {patient?.email}</>}</Text>
            <Text style={{ fontSize: "10px", ...styles.padding5 }}>
              {(patient.address && <>Address: {patient.address}</>) || ""}
            </Text>
            {/* )} */}
          </View>
          {/* <View style={{ width: "40%" }}>
            <View style={{ flexDirection: "row", fontSize: "10px" }}>
              <Text>
                {/* {patient.gender},
                gender
                </Text>
              <Text style={{ marginLeft: 5, marginRight: 5 }}>
                {/* {age()},
                age
                </Text>
              <Text>O+</Text>
            </View>
          </View> */}
        </View>
        <View style={{ ...styles.row, ...styles.justifyBetween }}>
          <Text>Created By: {bill.author?.name || ""}</Text>
          <Text>
            On:{" "}
            {bill.date
              ? format(new Date(bill.date), "dd MMM yyyy hh:mm a")
              : ""}
          </Text>
        </View>
        {/* <View>
          <Text>
            By: <Text style={styles.fontHeavy}>{bill.author.name || ""}</Text>
          </Text>
        </View> */}
        <View
          style={{
            ...styles.row,
            ...styles.justifyBetween,
            ...styles.padding10,
            ...styles.alignCenter,
          }}
        >
          <View>
            <Text style={{ ...styles.fontHeavy, fontSize: "15px" }}>
              Invoices
            </Text>
          </View>
          <View style={{ ...styles.textRight, ...styles.fontMedium }}>
            <Text>
              Date:
              {bill.date && format(new Date(bill.date), "dd MMM yyyy")}
            </Text>
            <Text style={styles.padding5}>
              Invoice Number:{" "}
              {`${bill?.id?.prefix}${bill?.id?.patientId}-${bill?.id?.value}`}
            </Text>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

export default Header;
