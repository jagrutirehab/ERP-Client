import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import Header from "../Header";
import Footer from "../Footer";
import DoctorSignature from "../DoctorSignature";
import { elderlyFunctionalChecklistFields } from "../../../constants/patient";
import { convertSnakeToTitle } from "../../../../utils/convertSnakeToTitle";

const styles = StyleSheet.create({
  title: { fontFamily: "Helvetica-Bold", fontSize: 13, marginBottom: 8 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginTop: 10,
    marginBottom: 6,
  },
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
  value: { fontSize: 10, flexGrow: 1, flexBasis: 0, flexShrink: 1 },
});

const buildSections = () => {
  const sections = [];
  let current = null;

  elderlyFunctionalChecklistFields.forEach((field) => {
    if (field.type === "header") {
      current = { label: field.label, fields: [] };
      sections.push(current);
      return;
    }
    if (current) current.fields.push(field);
  });

  return sections;
};

const visibleRows = (fields, data) =>
  fields.filter((field) => {
    if (field.showIf) {
      const { field: conditionField, value } = field.showIf;
      if (value !== undefined && data[conditionField] !== value) return false;
    }
    const value = data[field.name];
    return (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    );
  });

const ElderlyFunctionalChecklist = ({ chart, center, patient, admission }) => {
  const data = chart?.elderlyFunctionalChecklist || {};
  const sections = buildSections();
  const informationSection = sections.find((s) => s.label === "Information");
  const otherSections = sections.filter((s) => s.label !== "Information");
  const informationRows = informationSection
    ? visibleRows(informationSection.fields, data)
    : [];

  return (
    <React.Fragment>
      <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
        admission={admission || {}}
      />

      <View style={{ marginTop: 4 }}>
        <Text style={styles.title}>
          Jagruti EMR — Elderly Functional and Daily Living Checklist
        </Text>

        {informationRows.map((field) => (
          <View key={field.name} style={styles.row}>
            <Text style={styles.label}>{field.label}:</Text>
            <Text style={styles.value}>
              {convertSnakeToTitle(data[field.name])}
            </Text>
          </View>
        ))}

        {otherSections.map((section) => {
          const rows = visibleRows(section.fields, data);
          if (!rows.length) return null;

          return (
            <View key={section.label} wrap={false}>
              <Text style={styles.sectionTitle}>{section.label}</Text>
              {rows.map((field) => (
                <View key={field.name} style={styles.row}>
                  <Text style={styles.label}>{field.label}:</Text>
                  <Text style={styles.value}>
                    {convertSnakeToTitle(data[field.name])}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>

      <DoctorSignature doctor={chart?.author} />
      <Footer />
    </React.Fragment>
  );
};

export default ElderlyFunctionalChecklist;
