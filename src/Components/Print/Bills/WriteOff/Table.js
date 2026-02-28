import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 20,
  },
  label: {
    fontWeight: "bold",
    width: 120, // fixed width for alignment
  },
  value: {
    flex: 1,
    flexWrap: "wrap",
  },
});

const Table = ({ bill }) => {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>Write Off Amount:</Text>
        <Text style={styles.value}>
          {bill?.writeOffInvoice?.amount || 0}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Reason:</Text>
        <Text style={styles.value}>
          {bill?.writeOffInvoice?.reason || "-"}
        </Text>
      </View>
    </View>
  );
};

export default Table;