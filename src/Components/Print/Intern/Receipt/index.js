import React from "react";
import {
  Page,
  Document,
  StyleSheet,
  View,
  Text,
  Image,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import Logo from "../../../../assets/images/jagruti-logo.png";
import addComma from "../../../../utils/addComma";
import toWords from "../../../../utils/toWords";
import { BANK, CARD, CASH, CHEQUE } from "../../../constants/patient";

Font.register({
  family: "Roboto",
  fonts: [{ src: Roboto, fontWeight: "heavy" }],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    padding: 30,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
  },
  header: {
    borderBottom: "1 solid #000",
    paddingBottom: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 100,
  },
  centerDetails: {
    width: "70%",
    textAlign: "right",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    borderTop: "1 solid #000",
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
  },
  colLeft: {
    width: "70%",
    paddingLeft: 5,
  },
  colRight: {
    width: "30%",
    textAlign: "right",
    paddingRight: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
    paddingVertical: 4,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bankDetails: {
    width: "60%",
    fontSize: 10,
  },
  signBox: {
    width: "35%",
    fontSize: 10,
    textAlign: "right",
    marginTop: 60,
  },
  bottomNote: {
    textAlign: "center",
    fontSize: 9,
    marginTop: 20,
  },
});

const Receipt = ({ bill, center, intern }) => {
  const receipt = bill.receipt;
  const amount = parseFloat(receipt?.totalAmount || 0);
  const paymentModes = receipt?.paymentModes || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Info */}
        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Receipt No:</Text> {bill?.id?.prefix}
            {bill?.id?.internId}-{bill?.id?.value}
          </Text>
          <Text>
            <Text style={styles.label}>Date:</Text>{" "}
            {format(new Date(bill.date), "d MMM yyyy")}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            {center?.name || "JAGRUTI REHABILITATION CENTRE"}
          </Text>
          <View style={{ width: "55%", textAlign: "right", fontSize: 10 }}>
            <Text>{center?.address || "Center address goes here"}</Text>
            <Text>
              OPD Appointment 9820805898 | Admission Inquiry 9822207761
            </Text>
          </View>
        </View>

        {/* Website and underline */}
        <View
          style={{
            borderBottom: "1 solid #000",
            marginBottom: 10,
            paddingBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              textAlign: "right",
              textDecoration: "underline",
            }}
          >
            www.jagrutirehab.org
          </Text>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Created By:</Text>{" "}
            {bill.author?.name || "-"}
          </Text>
          <Text>
            <Text style={styles.label}>On:</Text>{" "}
            {format(new Date(bill.date), "dd MMM yyyy hh:mm a")}
          </Text>
        </View>

        <Text style={styles.title}>RECEIPT VOUCHER</Text>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Party:</Text> {intern?.name} -{" "}
            {intern?.id?.prefix}
            {intern?.id?.value}
          </Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.colLeft}>Particulars</Text>
          <Text style={styles.colRight}>Amount</Text>
        </View>

        {/* Account Row */}
        <View style={styles.tableRow}>
          <View style={styles.colLeft}>
            <Text>Account: {addComma(amount.toFixed(2))} Cr</Text>
            {receipt.paymentAgainstBillNo && (
              <Text>
                Payment Against Bill No: {receipt.paymentAgainstBillNo}
              </Text>
            )}
          </View>
          <Text style={styles.colRight}>{addComma(amount.toFixed(2))}</Text>
        </View>

        {/* Payment Modes */}
        <View style={styles.tableRow}>
          <View style={styles.colLeft}>
            <Text>Through:</Text>
            {paymentModes.map((item) => {
              const amt = parseFloat(item.amount);
              let info = "";
              if (item.paymentMode === CARD) info = item.cardNumber;
              if (item.paymentMode === BANK) info = item.bankAccount;
              if (item.paymentMode === CHEQUE)
                info = `${item.bankName} ${item.chequeNo}`;
              if (item.paymentMode === CASH) info = "A/C";
              return (
                <View key={item._id} style={styles.paymentRow}>
                  <Text>
                    {item.paymentMode} {info}
                  </Text>
                  <Text>{addComma(amt.toFixed(2))}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.colRight}></Text>
        </View>

        {/* Remarks */}
        <View style={styles.tableRow}>
          <View style={styles.colLeft}>
            <Text>On Account Of:</Text>
            <Text>{receipt?.remarks || "-"}</Text>
          </View>
          <Text style={styles.colRight}></Text>
        </View>

        {/* Amount in Words */}
        <View style={styles.tableRow}>
          <View style={styles.colLeft}>
            <Text>Amount in Words:</Text>
            <Text style={{ fontWeight: "bold" }}>
              INR {toWords(parseInt(amount)).toUpperCase()} ONLY
            </Text>
          </View>
          <Text style={styles.colRight}></Text>
        </View>

        {/* Final Total */}
        <View style={styles.tableRow}>
          <Text style={styles.colLeft}></Text>
          <Text
            style={{
              ...styles.colRight,
              fontSize: 13,
              fontFamily: "Roboto",
            }}
          >
            ₹ {addComma(amount.toFixed(2))}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.bankDetails}>
            <Text style={{ fontWeight: "bold" }}>Company’s Bank Details:</Text>
            <Text>
              A/c Holder’s Name:{" "}
              <Text style={styles.label}>
                {center?.accountHolderName || "Account Holder"}
              </Text>
            </Text>
            <Text>
              Bank Name:{" "}
              <Text style={styles.label}>
                {center?.bankName || "Bank Name"}
              </Text>
            </Text>
            <Text>
              A/c No.:{" "}
              <Text style={styles.label}>
                {center?.accountNumber || "0000000000"}
              </Text>
            </Text>
            <Text>
              Branch & IFS Code:{" "}
              <Text style={styles.label}>
                {center?.branchName || "Branch-IFSC"}
              </Text>
            </Text>
            <Text style={{ fontWeight: "bold", marginTop: 6 }}>
              for {center?.name || "JAGRUTI REHABILITATION CENTRE"}
            </Text>
          </View>

          <View style={styles.signBox}>
            <Text>Authorised Signatory</Text>
          </View>
        </View>

        {/* Bottom Note */}
        <View
          fixed
          style={{
            position: "absolute",
            bottom: 10,
            left: 30,
            right: 30,
            fontSize: 9,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text>Generated On: {format(new Date(), "d MMM yyyy")}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text>Powered by Jagruti</Text>
        </View>
      </Page>
    </Document>
  );
};

export default Receipt;
