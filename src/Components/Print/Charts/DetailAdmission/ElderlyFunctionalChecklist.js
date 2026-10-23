import React from "react";
import PropTypes from "prop-types";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { elderlyFunctionalChecklistFields } from "../../../constants/patient";
import { convertSnakeToTitle } from "../../../../utils/convertSnakeToTitle";

const localStyles = StyleSheet.create({
  sectionHeader: {
    fontSize: 13,
    fontFamily: "Roboto",
    fontWeight: "heavy",
    marginBottom: 8,
    marginTop: 10,
  },
  subHeader: {
    fontSize: 11,
    fontFamily: "Roboto",
    fontWeight: "heavy",
    marginTop: 8,
    marginBottom: 4,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingRight: 8,
  },
  label: {
    fontFamily: "Roboto",
    fontSize: 10,
    fontWeight: "heavy",
    marginRight: 4,
    width: "35%",
  },
  value: {
    fontSize: 10,
    width: "65%",
  },
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

const ElderlyFunctionalChecklist = ({ data, styles }) => {
  if (!data) return null;
  const sections = buildSections();

  return (
    <View
      style={{
        ...styles?.column,
        ...styles?.mrgnTop10,
        ...styles?.mrgnBottom10,
      }}
    >
      <Text style={styles?.fontSize13 || localStyles.sectionHeader}>
        Elderly Functional and Daily Living Checklist
      </Text>

      {sections.map((section, sIdx) => {
        const rows = visibleRows(section.fields, data);
        if (!rows.length) return null;

        return (
          <View key={sIdx} wrap={false} style={{ marginBottom: 6 }}>
            <Text style={localStyles.subHeader}>{section.label}</Text>
            {rows.map((field) => (
              <View key={field.name} style={localStyles.row}>
                <Text style={localStyles.label}>{field.label}:</Text>
                <Text style={localStyles.value}>
                  {convertSnakeToTitle(data[field.name])}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

ElderlyFunctionalChecklist.propTypes = {
  data: PropTypes.object,
  styles: PropTypes.object,
};

export default ElderlyFunctionalChecklist;
