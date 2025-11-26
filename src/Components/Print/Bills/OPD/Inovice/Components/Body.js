import { View, Text, StyleSheet } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
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
    width: "60%",
  },
  col8: {
    width: "70%",
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
  fontSm: {
    fontSize: "9px",
    color: "#1d1d1d",
  },
  textCenter: {
    textAlign: "center",
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
});

const Body = ({ bill }) => {
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.fontSm,
          ...styles.mrgnTop10,
          ...styles.paddingTop10,
        }}
      >
        <View>
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
                ...styles.col1,
                ...styles.textCenter,
                ...styles.fontHeavy,
              }}
            >
              #
            </Text>
            <Text
              style={{
                ...styles.col5,
                ...styles.textCenter,
                ...styles.fontHeavy,
              }}
            >
              Treatments & Products
            </Text>
            <Text
              style={{
                ...styles.col4,
                ...styles.textCenter,
                ...styles.fontHeavy,
              }}
            >
              Unit Cost INR
            </Text>
            <Text
              style={{
                ...styles.col4,
                ...styles.textCenter,
                ...styles.fontHeavy,
              }}
            >
              Qty
            </Text>
            <Text
              style={{
                ...styles.col4,
                ...styles.textCenter,
                ...styles.fontHeavy,
              }}
            >
              Total Cost INR
            </Text>
          </View>
          {(bill.invoiceList || []).map((item, idx) => (
            <View
              key={item._id}
              style={{
                ...styles.borderBottom,
                ...styles.paddingBottom10,
                ...styles.paddingTop10,
              }}
            >
              <View style={styles.row}>
                <Text style={{ ...styles.col1, ...styles.textCenter }}>
                  {idx + 1}
                </Text>
                <View style={{ ...styles.col5, ...styles.textCenter }}>
                  <Text style={styles.paddingBottom5}>{item.slot}</Text>
                  <Text style={{ whiteSpace: "pre-line" }}>{item.comments}</Text>
                  {/* <Text>Date 05 Mar, 2023</Text> */}
                </View>
                <Text style={{ ...styles.col4, ...styles.textCenter }}>
                  {parseFloat(item.unit) * parseFloat(item.cost) || "0"}
                </Text>
                <Text style={{ ...styles.col4, ...styles.textCenter }}>
                  {item.unit}
                </Text>
                <Text style={{ ...styles.col4, ...styles.textCenter }}>
                  {parseFloat(item.unit) * parseFloat(item.cost) || "0"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </React.Fragment>
  );
};

export default Body;
