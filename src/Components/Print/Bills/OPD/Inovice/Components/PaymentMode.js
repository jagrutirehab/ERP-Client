import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import {
  BANK,
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../../../constants/patient";

const PaymentMode = ({ styles, bill }) => {
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.row,
          ...styles.primaryBackground,
          ...styles.paddingBottom5,
          ...styles.paddingTop5,
        }}
      >
        <Text
          style={{
            ...styles.col4,
            // ...styles.textCenter,
            ...styles.fontHeavy,
            ...styles.fontSm,
          }}
        >
          Date
        </Text>
        <Text
          style={{
            ...styles.col6,
            // ...styles.textCenter,
            ...styles.fontHeavy,
            ...styles.fontSm,
          }}
        >
          Mode Of Payment
        </Text>
        <Text
          style={{
            ...styles.col3,
            // ...styles.textCenter,
            // textAlign: "right",
            ...styles.fontHeavy,
            ...styles.fontSm,
          }}
        >
          Amount Paid INR
        </Text>
      </View>
      <View
        style={{
          ...styles.paddingBottom10,
          ...styles.paddingTop10,
          ...styles.fontSm,
        }}
      >
        <View style={styles.row}>
          <Text
            style={{
              ...styles.col4,
            }}
          >
            {bill.date && format(new Date(bill.date), "dd MMM yyyy")}
          </Text>
          {/* <Text style={{ ...styles.col4, ...styles.textCenter }}>
            {/* {item.dosageAndFrequency.morning}-
                {item.dosageAndFrequency.evening}-
                {item.dosageAndFrequency.night}
            {bill?.receiptNumber || ""}
          </Text> */}
          <View
            style={{
              ...styles.col8,
              paddingLeft: "10px",
            }}
          >
            {bill.receiptInvoice?.paymentModes?.map((vl) => (
              <View style={{ ...styles.row }}>
                <View
                  style={{ ...styles.col7, ...styles.row, marginBottom: "5px" }}
                >
                  {/* <Text
                    style={{
                      ...styles.col7,
                      // ...styles.textCenter,
                    }}
                  >
                    {vl?.type}
                  </Text> */}
                  <Text>{vl.type}&#160;</Text>
                  {vl.type === CARD && (
                    <Text className="ms-3">{vl.cardNumber}</Text>
                  )}
                  {vl.type === UPI && <Text>{vl.transactionId}</Text>}
                  {vl.type === CHEQUE && (
                    <>
                      <Text>{vl.bankName}&#160;</Text>
                      <Text className="ms-3">{vl.chequeNo}</Text>
                    </>
                  )}
                  {vl.type === CASH && <Text>A/C</Text>}
                </View>
                <Text style={{ ...styles.col5, textAlign: "right" }}>
                  {vl?.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

export default PaymentMode;
