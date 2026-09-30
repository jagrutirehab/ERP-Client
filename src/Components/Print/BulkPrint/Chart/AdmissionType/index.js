import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  admissionTypeLabel,
  getVisibleAdmissionTypeRows,
} from "../../../../../utils/admissionType";

const styles = StyleSheet.create({
  title: { fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 6 },
  // alignItems flex-start keeps a one-line label aligned with a wrapping value.
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    paddingRight: 8,
  },
  label: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginRight: 4,
    flexShrink: 0,
    maxWidth: "50%",
  },
  // flexBasis 0 + flexGrow 1 constrains the text to the leftover width so it
  // wraps inside its own row rather than spilling and mis-measuring the height.
  value: { fontSize: 10, flexGrow: 1, flexBasis: 0, flexShrink: 1 },
});

const AdmissionType = ({ chart }) => {
  const data = chart?.admissionType || {};

  const rows = getVisibleAdmissionTypeRows(data);

  return (
    <View style={{ marginTop: 4 }}>
      <Text style={styles.title}>Admission Type</Text>

      {rows.length === 0 ? (
        <Text style={{ fontSize: 10 }}>No admission type recorded.</Text>
      ) : (
        rows.map((field) => (
          <View key={field.name} style={styles.row}>
            <Text style={styles.label}>{field.label}:</Text>
            <Text style={styles.value}>
              {admissionTypeLabel(field.name, data[field.name])}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

export default AdmissionType;
