import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  Font,
  Document,
  Page,
} from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import toWords from "../../../../utils/toWords";
import addComma from "../../../../utils/addComma";

//logo
import Logo from "../../../../assets/images/jagruti-logo.png";
import { format } from "date-fns";
import { BANK, CARD, CASH, CHEQUE, UPI } from "../../../constants/patient";

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
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    // paddingBottom: 30,
    flexDirection: "column",
  },
  tableHeader: {
    width: "100%",
  },
  logo: {
    width: 100,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  justifyContent: {
    justifyContent: "space-between",
  },
  border: {
    borderColor: "gray",
    borderWidth: 1,
  },
  slot: {
    width: "70%",
    display: "block",
    borderColor: "gray",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    textAlign: "left",
    padding: 10,
  },
  amount: {
    width: "20%",
    borderColor: "gray",
    textAlign: "center",
    paddingRight: 8,
  },
  marginLeft20: {
    marginLeft: 20,
  },
  marginTop10: {
    marginTop: 10,
  },
  paddingLeft10: {
    paddingLeft: 10,
  },
});

const Receipt = ({ bill, center, patient }) => {
  const renderImage = () => {
    return (
      <Image src={center?.logo ? center.logo?.url : Logo} style={styles.logo} />
    );
  };

  const advancePayment = bill.advancePayment;
  const advance = parseFloat(advancePayment?.totalAmount);

  return (
    <React.Fragment>
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <View style={{ ...styles.row, marginTop: "20px" }}>
              <Text style={{ ...styles.slot, border: "none", width: "65%" }}>
                No.&#160;
                {`${bill?.id?.prefix}${bill?.id?.patientId}-${bill?.id?.value}`}
              </Text>
              <Text style={{ ...styles.amount, width: "25%" }}>
                Dated:&#160;
                {format(new Date(bill.date), "d MMM y")}
              </Text>
            </View>
            <View style={{ ...styles.mainSection, margin: "20px 0" }}>
              <View style={{ width: "50%" }}>{renderImage()}</View>
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "50%",
                }}
              >
                <Text style={styles.heading}>
                  {center?.name || "JAGRUTI REHABILITATION CENTRE"}
                </Text>
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
            <View style={{ ...styles.patientSection, marginBottom: 30 }}>
              <Text style={{ ...styles.heading, fontSize: "15px" }}>
                RECEIPT VOUCHER
              </Text>
              <Text>
                <Text>Party:&#160;&#160;</Text>
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
            <View style={{ ...styles.row, ...styles.border }}>
              <Text style={styles.slot}>Particulars</Text>
              <Text style={styles.amount}>Amount</Text>
            </View>
            <View
              style={{
                ...styles.row,
                ...styles.border,
                borderBottom: "none",
              }}
            >
              <View style={{ ...styles.slot, paddingBottom: "50px" }}>
                {/* {'\n'} */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    ...styles.marginLeft10,
                    ...styles.marginTop10,
                  }}
                >
                  <Text>Account:</Text>
                  <Text>{addComma(advance.toFixed(2)) || 0}&#160;Cr</Text>
                </View>
                {advancePayment.paymentAgainstBillNo && (
                  <Text
                    style={{ ...styles.marginLeft20, ...styles.marginTop10 }}
                  >
                    Payment Against Bill No :&#160;
                    {advancePayment.paymentAgainstBillNo || ""}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  ...styles.heading,
                  width: "20%",
                  textAlign: "center",
                  display: "flex",
                  objectPosition: "top",
                  height: "100%",
                  padding: 10,
                }}
              >
                {addComma(advance.toFixed(2)) || 0}
              </Text>
            </View>
            <View
              style={{
                ...styles.row,
                ...styles.border,
                borderBottom: "none",
                borderTop: "none",
              }}
            >
              <View style={styles.slot}>
                <Text>Through:{"\n"}</Text>
                {(advancePayment?.paymentModes || []).map((item) => {
                  const amount = parseFloat(item.amount);
                  return (
                    <View
                      key={item._id}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginLeft: 20,
                        marginTop: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>{item.paymentMode}&#160;</Text>
                        {item.paymentMode === CARD && (
                          <Text className="ms-3">{item.cardNumber}</Text>
                        )}
                        {item.paymentMode === BANK && (
                          <Text>{item.bankAccount}</Text>
                        )}
                        {item.paymentMode === UPI && (
                          <Text>{item.transactionId}</Text>
                        )}
                        {item.paymentMode === CHEQUE && (
                          <>
                            <Text>{item.bankName}&#160;</Text>
                            <Text className="ms-3">{item.chequeNo}</Text>
                          </>
                        )}
                        {item.paymentMode === CASH && <Text>A/C</Text>}
                      </View>
                      <Text>{addComma(amount.toFixed(2)) || 0}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.amount}></Text>
            </View>
            <View
              style={{
                ...styles.row,
                ...styles.border,
                borderBottom: "none",
                borderTop: "none",
              }}
            >
              <View style={styles.slot}>
                <Text>On Account Of:{"\n"}</Text>
                <Text style={{ marginLeft: 20, marginTop: 10 }}>
                  Remarks: {advancePayment?.remarks}
                </Text>
              </View>
              <Text style={styles.amount}></Text>
            </View>
            <View
              style={{ ...styles.row, ...styles.border, borderTop: "none" }}
            >
              <View style={styles.slot}>
                <Text>Amount in Words:{"\n"}</Text>
                <Text
                  style={{
                    ...styles.heading,
                    marginLeft: 20,
                    marginTop: 10,
                    textTransform: "uppercase",
                  }}
                >
                  INR&#160;{toWords(parseInt(advancePayment.totalAmount || 0))}
                  &#160;ONLY
                </Text>
              </View>
              <Text style={styles.amount}></Text>
            </View>
            <View
              style={{ ...styles.row, ...styles.border, borderTop: "none" }}
            >
              <Text style={styles.slot}></Text>
              <Text style={{ ...styles.amount, ...styles.heading }}>
                ₹&#160;{addComma(advance.toFixed(2)) || 0}
              </Text>
            </View>
            <View style={{ textAlign: "right", padding: 30 }}>
              <Text>Authorised Signatory</Text>
            </View>
          </View>
        </Page>
      </Document>
    </React.Fragment>
  );
};

export default Receipt;
