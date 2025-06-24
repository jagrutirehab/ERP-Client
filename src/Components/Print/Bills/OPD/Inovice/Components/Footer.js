import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import PaymentMode from "./PaymentMode";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  alignCenter: {
    alignItems: "center",
  },
  col4: {
    width: "23%",
  },
  col5: {
    width: "26%",
  },
  col1: {
    width: "5%",
  },
  col6: {
    width: "50%",
  },
  col7: {
    width: "65%",
  },
  instr: {
    fontFamily: "Roboto",
    fontSize: "12px",
  },
  fontHeavy: {
    fontFamily: "Roboto",
    fontSize: "11px",
    fontWeight: "heavy",
  },
  fontMedium: {
    fontSize: "12px",
  },
  fontSm: {
    fontSize: "9px",
    color: "#1d1d1d",
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnLeft10: {
    marginLeft: 10,
  },
  paddingTop10: {
    paddingTop: 10,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  paddingBottom5: {
    paddingBottom: 5,
  },
  paddingTop5: {
    paddingTop: 5,
  },
  borderBottom: {
    borderBottom: "0.5px solid #1d1d1d",
  },
  primaryBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
});

const Footer = ({ bill }) => {
  return (
    <React.Fragment>
      <View
        style={{ ...styles.row, ...styles.paddingTop10, ...styles.alignCenter }}
      >
        <View style={{ ...styles.col7 }}>
          <Text
            style={{
              ...styles.fontHeavy,
              ...styles.fontMedium,
              ...styles.paddingTop10,
              ...styles.paddingBottom5,
            }}
          >
            Payment Details
          </Text>
          <PaymentMode styles={styles} bill={bill} />
        </View>
        <View
          style={{
            width: "35%",
            ...styles.textRight,
            ...styles.fontMedium,
            ...styles.mrgnTop10,
            paddingLeft: "8%",
          }}
        >
          <View>
            <Text
              style={{
                ...styles.paddingTop10,
                ...styles.paddingBottom10,
                ...styles.borderBottom,
              }}
            >
              Total Cost: {bill.receiptInvoice.grandTotal || "0"}
            </Text>
          </View>
          <View
          // style={{
          //   ...styles.borderBottom,
          // }}
          >
            <Text style={{ ...styles.paddingBottom5, ...styles.paddingTop5 }}>
              Grand Total: {bill.receiptInvoice?.grandTotal || "0"}
            </Text>
            <Text style={{ ...styles.paddingBottom5, ...styles.paddingTop5 }}>
              Amount Recieved: {bill.receiptInvoice?.payable || "0"}
            </Text>
          </View>
          {/* <View style={{ ...styles.paddingTop10 }}>
            <Text>Balance Amount: 0.00 INR</Text>
          </View> */}
        </View>
      </View>
    </React.Fragment>
  );
};

export default Footer;
