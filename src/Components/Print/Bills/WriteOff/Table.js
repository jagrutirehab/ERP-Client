import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  label: {
    fontWeight: "bold",
  },
});

const Table = ({ bill }) => {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>Write Off Amount:</Text>
        <Text>{bill?.writeOffInvoice?.amount || 0}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Reason:</Text>
        <Text>{bill?.writeOffInvoice?.reason || "-"}</Text>
      </View>
    </View>
  );
};

export default Table;