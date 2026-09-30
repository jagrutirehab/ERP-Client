import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  col: {
    width: "22%",
    paddingRight: 4,
  },
  colWide: {
    width: "34%",
    paddingRight: 4,
  },
  fontSm: {
    fontSize: "9px",
    color: "#1d1d1d",
  },
  mrgnTop10: {
    marginTop: 10,
  },
  mrgnBottom10: {
    marginBottom: 30,
  },
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
});

const InputOutputTable = ({ chart }) => {
  const rows = chart?.rows || [];
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.fontSm,
          ...styles.mrgnBottom10,
          ...styles.mrgnTop10,
        }}
      >
        <Text style={{ fontSize: "13px" }}>Input - Output</Text>
        <View
          style={{
            ...styles.row,
            ...styles.borderBottom,
            paddingBottom: 5,
            ...styles.mrgnTop10,
          }}
        >
          <Text style={styles.col}>INTAKE</Text>
          <Text style={styles.col}>OUTPUT</Text>
          <Text style={styles.col}>IV FLUID</Text>
          <Text style={styles.colWide}>REMARK</Text>
        </View>
        {rows.length ? (
          rows.map((row, idx) => (
            <View
              key={idx}
              style={{
                ...styles.row,
                ...styles.borderBottom,
                paddingTop: 5,
                paddingBottom: 5,
              }}
            >
              <Text style={styles.col}>{row.intake || "-"}</Text>
              <Text style={styles.col}>{row.output || "-"}</Text>
              <Text style={styles.col}>{row.ivFluid || "-"}</Text>
              <Text style={styles.colWide}>{row.remark || "-"}</Text>
            </View>
          ))
        ) : (
          <View style={{ paddingTop: 5 }}>
            <Text>No entries</Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default InputOutputTable;
