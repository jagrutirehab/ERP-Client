import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
import toWords from "../../../../utils/toWords";

import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import { OPD, REFUND } from "../../../constants/patient";

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
  footer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "space-between",
    flexShrink: 1,
  },
  amountContainer: {
    width: "50%",
    textOverflow: "ellipsis",
    marginRight: 8,
  },
  bankContainer: {
    width: "50%",
    textOverflow: "ellipsis",
    marginLeft: 8,
  },
  note: {
    textAlign: "center",
  },
  costInWords: {
    textTransform: "uppercase",
  },
  margin: {
    marginTop: 5,
    marginBottom: 5,
  },
  marginTop: {
    marginBottom: 5,
  },
  marginBottom: {
    marginBottom: 5,
  },
  fontRoboto: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
});

const printFooter = ({ center, bill }) => {
  let invoice = bill?.invoice;
  let amountChargable = invoice?.calculatedPayable ?? 0.0;

  if (bill.invoice.refund > 0) amountChargable = invoice.refund;
  else if (bill.invoice.calculatedPayable > 0)
    amountChargable = invoice.calculatedPayable;
  else amountChargable = 0;

  return (
    <React.Fragment>
      <View style={styles.footer} wrap={false}>
        <View style={styles.amountContainer}>
          <View style={styles.marginBottom}>
            <Text style={styles.marginBottom}>
              Amount Chargeable (in words)
            </Text>
            <Text style={{ ...styles.costInWords, ...styles.fontRoboto }}>
              INR&#160;&#160;
              {parseInt(amountChargable) === 0
                ? "Zero"
                : toWords(amountChargable || 0)}
              &#160;ONLY
            </Text>
          </View>
          <View>
            <Text>Remarks:</Text>
            <Text>
              BEING BILL BOOKED FIXED CHARGES FOR NEW MONTH AND CONSUMABLE
              CHARGES FOR PAST MONTH
            </Text>
          </View>
        </View>
        <View style={styles.bankContainer}>
          <Text style={styles.marginBottom}>Company&#39;s Bank Details:</Text>
          <Text style={styles.marginBottom}>
            A/c Holder&#39;s Name&#160;&#160;:&#160;&#160;
            <Text style={styles.fontRoboto}>
              {bill?.center?.accountHolderName ||
                "account holder name goes here"}
            </Text>
          </Text>
          <Text style={styles.marginBottom}>
            Bank Name&#160;&#160;:&#160;&#160;
            <Text style={styles.fontRoboto}>
              {bill?.center?.bankName || "bank name goes here"}
            </Text>
          </Text>
          <Text style={styles.marginBottom}>
            A/c No.&#160;&#160;:&#160;&#160;
            <Text style={styles.fontRoboto}>
              {bill?.center?.accountNumber || "account number goes here"}
            </Text>
          </Text>
          <Text style={styles.marginBottom}>
            Branch & IFS Code&#160;&#160;:&#160;&#160;
            <Text style={styles.fontRoboto}>
              {bill?.center?.branchName || "branch name goes here"}
            </Text>
          </Text>
          <Text style={{ ...styles.marginBottom, ...styles.fontRoboto }}>
            for JAGRUTI REHABILITATION CENTRE
          </Text>
          <Text style={{ ...styles.margin, padding: "20px 0" }}>
            Authorised Signatory
          </Text>
        </View>
      </View>
      <View style={styles.note}>
        <Text>This is a Computer Generated Invoice</Text>
      </View>
    </React.Fragment>
  );
};

export default printFooter;
