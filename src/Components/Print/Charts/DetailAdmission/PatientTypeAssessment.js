import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const localStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: "13px",
    fontFamily: "Roboto",
    fontWeight: "heavy",
    marginBottom: 8,
    marginTop: 12,
  },
  groupTitle: {
    fontSize: "11px",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    textTransform: "capitalize",
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: "32%",
    fontSize: "10px",
    fontWeight: "bold",
    lineHeight: 1.3,
  },
  value: {
    width: "68%",
    fontSize: "10px",
    lineHeight: 1.3,
  },
  indent: {
    paddingLeft: 10,
  },
  gridRow: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  gridRowLabel: {
    fontSize: "10px",
    fontWeight: "bold",
    marginBottom: 3,
  },
  gridCellWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    fontSize: "9px",
    marginRight: 10,
    marginBottom: 3,
    lineHeight: 1.3,
  },
});

const PATIENT_TYPE_TITLES = {
  addiction: "Addiction Assessment",
  psychiatric: "Psychiatric Assessment",
  geriatric: "Geriatric / Dementia / Palliative Assessment",
};

const GRID_ROW_EXCLUDED_KEYS = ["_id"];

const toTitleCase = (str) =>
  str
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const hasContent = (val) => {
  if (val === null || val === undefined || val === "") return false;
  if (Array.isArray(val)) {
    if (val.length === 0) return false;
    if (typeof val[0] === "object" && val[0] !== null) {
      const labelKey = Object.keys(val[0])[0];
      return val.some((row) =>
        Object.entries(row).some(
          ([k, v]) =>
            k !== labelKey &&
            !GRID_ROW_EXCLUDED_KEYS.includes(k) &&
            hasContent(v),
        ),
      );
    }
    return val.some(hasContent);
  }
  if (typeof val === "object") {
    return Object.values(val).some(hasContent);
  }
  return true;
};

const formatLeafValue = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value);
};

const renderGroup = (obj, depth = 0) =>
  Object.entries(obj || {}).map(([key, value], i) => {
    if (!hasContent(value)) return null;

    if (Array.isArray(value) && typeof value[0] === "object") {
      const labelKey = Object.keys(value[0])[0];
      const filledRows = value.filter((row) =>
        Object.entries(row).some(
          ([k, v]) =>
            k !== labelKey &&
            !GRID_ROW_EXCLUDED_KEYS.includes(k) &&
            hasContent(v),
        ),
      );
      if (filledRows.length === 0) return null;
      return (
        <View key={key + i} style={depth ? localStyles.indent : undefined}>
          <Text style={localStyles.groupTitle}>{toTitleCase(key)}</Text>
          {filledRows.map((row, ri) => (
            <View key={ri} style={localStyles.gridRow}>
              <Text style={localStyles.gridRowLabel}>{row[labelKey]}</Text>
              <View style={localStyles.gridCellWrap}>
                {Object.entries(row)
                  .filter(
                    ([k, v]) =>
                      k !== labelKey &&
                      !GRID_ROW_EXCLUDED_KEYS.includes(k) &&
                      hasContent(v),
                  )
                  .map(([rk, rv], rj) => (
                    <Text key={rj} style={localStyles.gridCell}>
                      {toTitleCase(rk)}: {formatLeafValue(rv)}
                    </Text>
                  ))}
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return (
        <View key={key + i} style={depth ? localStyles.indent : undefined}>
          <Text style={localStyles.groupTitle}>{toTitleCase(key)}</Text>
          {renderGroup(value, depth + 1)}
        </View>
      );
    }

    return (
      <View
        key={key + i}
        style={[localStyles.fieldRow, depth ? localStyles.indent : undefined]}
      >
        <Text style={localStyles.label}>{toTitleCase(key)}:</Text>
        <Text style={localStyles.value}>{formatLeafValue(value)}</Text>
      </View>
    );
  });

const PatientTypeAssessment = ({ patientType, data, styles }) => {
  if (!patientType || !data || !hasContent(data)) return null;

  return (
    <View>
      <Text style={(styles && styles.fontSize13) || localStyles.sectionTitle}>
        {PATIENT_TYPE_TITLES[patientType] || "Assessment"}
      </Text>
      {renderGroup(data)}
    </View>
  );
};

export default PatientTypeAssessment;
