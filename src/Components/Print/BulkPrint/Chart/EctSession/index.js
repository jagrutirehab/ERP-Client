import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import ChartHeader from "../ChartHeader";
import { ectSessionSections } from "../../../../constants/patient";

const styles = StyleSheet.create({
  section: { marginTop: 8, marginBottom: 4 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottom: "1px solid #999",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  field: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 8,
  },
  fieldFull: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 8,
  },
  label: { fontFamily: "Helvetica-Bold", fontSize: 10, marginRight: 4 },
  value: { fontSize: 10, flexShrink: 1 },
});

const isEmpty = (v) =>
  v == null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === "");

const formatValue = (v) =>
  Array.isArray(v) ? v.filter(Boolean).join(", ") : String(v);

const EctSession = ({ chart }) => {
  const data = chart?.ectSession || {};

  const sections = ectSessionSections
    .map((section) => ({
      key: section.key,
      title: section.title,
      rows: section.fields
        .map((f) => ({
          label: f.label,
          unit: f.unit,
          value: data?.[section.key]?.[f.name],
          full: f.type === "textarea",
        }))
        .filter((r) => !isEmpty(r.value)),
    }))
    .filter((section) => section.rows.length > 0);

  return (
    <React.Fragment>
      <ChartHeader chart={chart} />
      <View style={{ marginTop: 4 }}>
        <Text
          style={{ fontFamily: "Helvetica-Bold", fontSize: 13, marginBottom: 6 }}
        >
          ECT Session Record
        </Text>
        {sections.map((section) => (
          <View key={section.key} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.grid}>
              {section.rows.map((row, ri) => (
                <View key={ri} style={row.full ? styles.fieldFull : styles.field}>
                  <Text style={styles.label}>
                    {row.label}
                    {row.unit ? ` (${row.unit})` : ""}:
                  </Text>
                  <Text style={styles.value}>{formatValue(row.value)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </React.Fragment>
  );
};

export default EctSession;
