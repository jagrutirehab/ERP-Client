import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Header from "../Header";
import Footer from "../Footer";
import DoctorSignature from "../DoctorSignature";
import {
  admissionTypeLabel,
  getVisibleAdmissionTypeRows,
} from "../../../../utils/admissionType";

const styles = StyleSheet.create({
  title: { fontFamily: "Helvetica-Bold", fontSize: 13, marginBottom: 8 },
  // alignItems flex-start keeps a one-line label aligned with a wrapping value.
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
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
  // wraps inside its own row. flexShrink alone lets it keep its intrinsic width,
  // spill past the row and mis-measure the row height.
  value: { fontSize: 10, flexGrow: 1, flexBasis: 0, flexShrink: 1 },
});

const AdmissionType = ({ chart, center, patient, admission }) => {
  const data = chart?.admissionType || {};

  // Only the fields belonging to the recorded branch.
  const rows = getVisibleAdmissionTypeRows(data);

  return (
    <React.Fragment>
      <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
        admission={admission || {}}
      />

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

      <DoctorSignature doctor={chart?.author} />
      <Footer />
    </React.Fragment>
  );
};

export default AdmissionType;
