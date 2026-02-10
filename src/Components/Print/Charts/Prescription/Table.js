import { View, Text, StyleSheet } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  col4: {
    width: "24%",
  },
  col5: {
    width: "28%",
  },
  instr: {
    fontFamily: "Roboto",
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
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
});

const PrescriptionTable = ({ medicines }) => {
  const safe = (value) =>
    value === null || value === undefined ? "" : String(value);

  return (
    <React.Fragment>
      <View style={styles.fontSm}>
        <View
          style={{
            ...styles.row,
            ...styles.borderBottom,
            paddingBottom: 5,
          }}
        >
          <Text style={styles.col5}>DRUG NAME</Text>
          <Text style={styles.col4}>FREQUENCY</Text>
          <Text style={styles.col4}>DURATION</Text>
          <Text style={styles.col4}>INSTRUCTIONS</Text>
        </View>
        {(medicines || []).map((item, index) => {
          const medicine = item?.medicine || {};
          const freq = item?.dosageAndFrequency || {};
          const key = safe(item?._id?.$oid || item?._id || index);

          return (
          <View
            key={key}
            style={{
              ...styles.borderBottom,
              paddingTop: 5,
              paddingBottom: 5,
            }}
          >
            <View style={styles.row}>
              <Text style={{ ...styles.col5, textTransform: "capitalize" }}>
                <Text style={{ textTransform: "uppercase" }}>
                  {medicine?.type ? `${safe(medicine.type)} ` : ""}
                </Text>
                {safe(medicine?.name)} {safe(medicine?.strength)}{" "}
                <Text style={{ textTransform: "uppercase" }}>
                  {safe(medicine?.unit)}
                </Text>
              </Text>
              <Text style={styles.col4}>
                {safe(freq?.morning)}-{safe(freq?.evening)}-{safe(freq?.night)}
              </Text>
              <Text style={styles.col4}>
                {safe(item?.duration)} {safe(item?.unit)}
              </Text>
              <Text style={styles.col4}>{safe(item?.intake)}</Text>
            </View>
            <Text style={{ paddingTop: 5 }}>
              instructions: {safe(item?.instructions)}
            </Text>
          </View>
        );
        })}
      </View>
    </React.Fragment>
  );
};

export default PrescriptionTable;
