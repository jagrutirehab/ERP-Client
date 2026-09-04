import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import {
  getMedicineFrequencyLabel,
  formatDosage,
} from "../../../../../helpers/prescriptionFrequency";
import { getMedicineEndDate } from "../../../../../helpers/currentMedicines";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 6,
  },
  tableBody: {
    backgroundColor: "rgba(150, 150, 150, 0.1)",
  },
  col1: { flex: 0.5, paddingLeft: 6 },
  col3: { flex: 1.2 },
  col5: { flex: 3 },
  col6: { flex: 2.2 },
  colPrescriber: { flex: 1.3, textAlign: "center" },
  fontBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: "10px",
    letterSpacing: "0.6px",
  },
  fontMd: {
    fontFamily: "Helvetica",
    fontSize: "9px",
  },
  fontItalic: {
    fontFamily: "Helvetica-Oblique",
  },
  instr: {
    fontFamily: "Helvetica-Bold",
    fontSize: "10px",
    letterSpacing: "0.6px",
  },
  fontSm: {
    fontSize: "9px",
    color: "#1d1d1d",
  },
  paddingTop5: {
    paddingTop: 5,
  },
  mrgnLeft10: {
    marginLeft: 10,
  },
  borderBottom: {
    borderBottom: "1px solid #1d1d1d",
  },
});

const formatDate = (d) => {
  if (!d) return null;
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? null : format(parsed, "dd MMM yy");
};

const CurrentMedicinesTable = ({ medicines, baseDate }) => {
  const getDateRange = (item) => {
    const from = item?.startDate || baseDate;
    const to = item?.endDate || (from ? getMedicineEndDate(from, item) : null);
    return { from: formatDate(from) || "-", to: formatDate(to) || "Ongoing" };
  };

  const getPrescriberName = (item) =>
    (item?.prescribedBy && typeof item.prescribedBy === "object"
      ? item.prescribedBy.name
      : item?.prescribedByUser?.name) || "-";

  return (
    <React.Fragment>
      <View style={{ ...styles.fontSm, width: "100%" }}>
        <View
          style={{
            ...styles.row,
            ...styles.borderBottom,
            ...styles.tableHeader,
            ...styles.instr,
          }}
        >
          <Text style={styles.col1}></Text>
          <Text style={styles.col5}>Medicine</Text>
          <View style={{ ...styles.col3, flexDirection: "column", alignItems: "center" }}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>Dose</Text>
            <View style={{ flexDirection: "row", width: "100%" }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text>Mor</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text>Aft</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text>Eve</Text>
              </View>
            </View>
          </View>
          <View style={{ ...styles.col6, alignItems: "flex-end" }}>
            <Text style={{ textAlign: "right" }}>Timing - Freq. - Duration</Text>
            <Text style={{ textAlign: "right", fontSize: "8px", marginTop: 2, fontFamily: "Helvetica-Oblique" }}>
              From - To
            </Text>
          </View>
          <View style={{ ...styles.colPrescriber, alignItems: "center" }}>
            <Text style={{ textAlign: "center" }}>Prescribed</Text>
            <Text style={{ textAlign: "center" }}>By</Text>
          </View>
        </View>
        <View style={{ ...styles.tableBody }}>
          {(medicines || []).map((item, idx) => {
            const { from, to } = getDateRange(item);
            const prescriber = getPrescriberName(item);
            return (
              <View
                key={item._id || idx}
                style={{
                  ...styles.borderBottom,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
              >
                <View style={styles.row}>
                  <Text style={{ ...styles.col1, ...styles.fontBold }}>
                    {idx + 1}
                  </Text>
                  <Text style={{ ...styles.col5, ...styles.fontBold }}>
                    <Text style={{ textTransform: "uppercase" }}>
                      {item.medicine?.type ? `${item.medicine.type} ` : ""}
                    </Text>{" "}
                    {item.medicine?.name} {item.medicine?.strength || ""}
                  </Text>
                  <View style={{ ...styles.col3, flexDirection: "row" }}>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text>
                        {formatDosage(item.dosageAndFrequency?.morning, item.dosageAndFrequency?.unit) || "-"}
                      </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text>
                        {formatDosage(item.dosageAndFrequency?.evening, item.dosageAndFrequency?.unit) || "-"}
                      </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text>
                        {formatDosage(item.dosageAndFrequency?.night, item.dosageAndFrequency?.unit) || "-"}
                      </Text>
                    </View>
                  </View>
                  <View style={{ ...styles.col6, alignItems: "flex-end", marginRight: "10px" }}>
                    <Text style={styles.fontMd}>
                      {item.intake}{" - "}{getMedicineFrequencyLabel(item)}{" - "}{item.duration} {item.unit}
                    </Text>
                    <Text style={{ fontFamily: "Helvetica-Oblique", fontSize: "8px", marginTop: 2 }}>
                      {from} - {to}
                    </Text>
                  </View>
                  <Text style={{ ...styles.colPrescriber, textTransform: "capitalize" }}>
                    {prescriber}
                  </Text>
                </View>
                {item.instructions && (
                  <View
                    style={{
                      ...styles.row,
                      ...styles.paddingTop5,
                      ...styles.mrgnLeft10,
                    }}
                  >
                    <Text style={styles.fontItalic}>Instruction: </Text>
                    <Text>{item.instructions}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </React.Fragment>
  );
};

export default CurrentMedicinesTable;
