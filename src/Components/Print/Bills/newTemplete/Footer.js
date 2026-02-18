import React from "react";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import toWords from "../../../../utils/toWords";

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
    marginTop: 20,
    paddingHorizontal: 10,
    fontSize: 10,
    fontFamily: "Roboto",
  },
  amountPaid: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 15,
  },
  bold: {
    fontWeight: "bold",
  },
  bankSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  bankDetails: {
    fontSize: 9,
    // lineHeight: 1.4,
    width: "65%",
  },
  bankDetailsRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  w50: {
    width: "30%",
  },
  qrBoxLarge: {
    width: 120,
    height: 90,
    border: "1px solid white",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 10,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
    alignItems: "center",
  },
  signatureLabel: {
    fontWeight: "bold",
    fontSize: 10,
  },
  remarks: {
    marginTop: 30,
    fontSize: 9,
    fontWeight: "normal",
    // lineHeight: 1.3,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    fontSize: 8,
  },
});

const PrintFooter = ({ bill, amountInWords, generatedByName, generatedAt }) => {
  let invoice = bill?.invoice;
  console.log("invoice from charty", invoice);
  let amountChargable = invoice?.calculatedPayable ?? 0.0;

  // if (invoice?.refund > 0) amountChargable = invoice.refund;
  if (invoice?.calculatedPayable > 0)
    amountChargable = invoice.calculatedPayable;
  else amountChargable = 0;

  return (
    <View style={styles.container}>
      <Text style={styles.amountPaid}>
        Amount Paid:&nbsp;
        <Text style={{ fontWeight: "normal" }}>
          {parseInt(amountChargable) === 0
            ? "Zero"
            : toWords(amountChargable || 0)}{" "}
          Only
        </Text>
      </Text>

      {/* Bank Details Section */}
      <View style={styles.bankSection}>
        <View style={styles.bankDetails}>
          <Text style={{ ...styles.bold, fontSize: 12 }}>
            Company's Bank Details:
          </Text>
          <View style={styles.bankDetailsRow}>
            <Text style={{ ...styles.bold, ...styles.w50, fontSize: 10 }}>
              A/c Holder Name:
            </Text>
            <Text style={{ fontSize: 10, fontWeight: "normal" }}>
              {bill?.center?.accountHolderName || ""}
            </Text>
          </View>
          <View style={styles.bankDetailsRow}>
            <Text style={{ ...styles.bold, ...styles.w50, fontSize: 10 }}>
              Bank:
            </Text>
            <Text style={{ fontSize: 10, fontWeight: "normal" }}>
              {bill?.center?.bankName || ""}
            </Text>
          </View>
          <View style={styles.bankDetailsRow}>
            <Text style={{ ...styles.bold, ...styles.w50, fontSize: 10 }}>
              A/c No:
            </Text>
            <Text style={{ fontSize: 10, fontWeight: "normal" }}>
              {bill?.center?.accountNumber || ""}
            </Text>
          </View>
          <View style={styles.bankDetailsRow}>
            <Text style={{ ...styles.bold, ...styles.w50, fontSize: 10 }}>
              Branch & IFSC:
            </Text>
            <Text style={{ fontSize: 10, fontWeight: "normal" }}>
              {bill?.center?.branchName || ""}
            </Text>
          </View>
        </View>
        <View style={styles.qrBoxLarge}>{/* <Text>QR CODE</Text> */}</View>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureRow}>
        <Text style={styles.signatureLabel}>Customer Signature:</Text>
        <Text style={styles.signatureLabel}>Accountant Signature:</Text>
      </View>

      {/* Remarks */}
      <View style={styles.remarks}>
        <Text style={styles.bold}>Remarks:</Text>
        <Text>
          1. This invoice covers next month’s fixed charges and last month’s
          consumables charges
        </Text>
        <Text>
          2. In case of any refund, the amount will be refunded to the account
          within 7 working days
        </Text>
      </View>
    </View>
  );
};

export default PrintFooter;
