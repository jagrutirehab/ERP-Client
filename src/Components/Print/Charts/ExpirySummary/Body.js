import React from "react";
import { StyleSheet, View, Text, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import MseAtAddmission from "../DischargeSummary/Components/MseAtAddmission";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  body: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  preText: {
    lineHeight: 1.3,
    paddingLeft: 5,
  },
  marginBottom: {
    marginBottom: 20,
  },
  paddingLeft5: {
    paddingLeft: 5,
  },
  fontSize13: {
    fontSize: "13px",
    fontFamily: "Roboto",
    fontWeight: "bold",
    paddingBottom: 7,
  },
  checkBlock: {
    width: "100%",
    flexDirection: "row",
  },
  w25: {
    width: "25%",
    marginBottom: 5,
  },
  w30: {
    width: "30%",
  },
  w5: {
    width: "5%",
    marginBottom: 5,
  },
  w70: {
    width: "70%",
    marginBottom: 5,
  },
  blackCircle: {
    height: "5px",
    width: "5px",
    backgroundColor: "black",
    borderRadius: "3px",
    marginRight: 5,
  },
  marginBottom5: {
    marginBottom: 5,
  },
  textCenter: {
    textAlign: "center",
  },
});

const clean = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[​-‍﻿]/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\x7Fऀ-ॿ]/g, "")
    .trim();
};

const formatExpiryDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return clean(value);
  return format(d, "dd MMM yyyy, hh:mm a");
};

const ExpirySummaryBody = ({ chart }) => {
  const data = chart?.expirySummary ?? {};
  return (
    <React.Fragment>
      <View style={styles.body} wrap>
        <Text
          style={{
            ...styles.fontSize13,
            ...styles.marginBottom5,
            ...styles.textCenter,
          }}
        >
          Expiry Summary
        </Text>
        {data?.expiryDateTime && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>Date and Time of Expiry:</Text>
            <Text style={styles.preText}>
              {formatExpiryDateTime(data?.expiryDateTime)}
            </Text>
          </View>
        )}
        {data?.expiryCause && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>Cause of Expiry:</Text>
            <Text style={styles.preText}>{clean(data?.expiryCause) || ""}</Text>
          </View>
        )}
        {data?.diagnosis && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>Diagnosis:</Text>
            <Text style={styles.preText}>{clean(data?.diagnosis) || ""}</Text>
          </View>
        )}
        {data?.presentingSymptoms && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>Presenting Symptoms:</Text>
            <Text style={styles.preText}>
              {clean(data?.presentingSymptoms) || ""}
            </Text>
          </View>
        )}
        <MseAtAddmission data={data} styles={styles} />
        {data?.pastHistory && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>PAST HISTORY:</Text>
            <Text style={styles.preText}>{clean(data?.pastHistory) || ""}</Text>
          </View>
        )}
        {data?.medicalHistory && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>MEDICAL HISTORY:</Text>
            <Text style={styles.preText}>
              {clean(data?.medicalHistory) || ""}
            </Text>
          </View>
        )}
        {data?.familyHistory && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>RELEVANT FAMILY HISTORY :</Text>
            <Text style={styles.preText}>
              {clean(data?.familyHistory) || ""}
            </Text>
          </View>
        )}
        {(data?.personalHistory?.smoking ||
          data?.personalHistory?.chewingTobacco ||
          data?.personalHistory?.alcohol) && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>PERSONAL HISTORY:</Text>
            {data?.personalHistory?.smoking && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Smoking</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.personalHistory?.smoking) || ""}
                </Text>
              </View>
            )}
            {data?.personalHistory?.chewingTobacco && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Chewing Tobacco</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.personalHistory?.chewingTobacco) || ""}
                </Text>
              </View>
            )}
            {data?.personalHistory?.alcohol && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Alcohol</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.personalHistory?.alcohol) || ""}
                </Text>
              </View>
            )}
          </View>
        )}
        {!!(data?.physicalExamination?.temprature ||
          data?.physicalExamination?.pulse ||
          data?.physicalExamination?.bp ||
          data?.physicalExamination?.cvs ||
          data?.physicalExamination?.rs ||
          data?.physicalExamination?.abdomen ||
          data?.physicalExamination?.cns ||
          data?.physicalExamination?.others) && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>PHYSICAL EXAMINATION:</Text>
            {!!data?.physicalExamination?.temprature && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Temprature</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.physicalExamination?.temprature) || ""}
                </Text>
              </View>
            )}
            {!!data?.physicalExamination?.pulse && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Pulse</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.physicalExamination?.pulse) || ""}
                </Text>
              </View>
            )}
            {!!data?.physicalExamination?.bp && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>B.P</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.physicalExamination?.bp) || ""}
                </Text>
              </View>
            )}
            {!!data?.physicalExamination?.cvs && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>CVS</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.physicalExamination?.cvs) || ""}
                </Text>
              </View>
            )}
            {!!data?.physicalExamination?.rs && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>RS</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.physicalExamination?.rs) || ""}
                </Text>
              </View>
            )}
            {!!data?.physicalExamination?.abdomen && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Abdomen</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.physicalExamination?.abdomen) || ""}
                </Text>
              </View>
            )}
            {!!data?.physicalExamination?.cns && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>CNS</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.physicalExamination?.cns) || ""}
                </Text>
              </View>
            )}
            {!!data?.physicalExamination?.others && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Others</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {clean(data?.physicalExamination?.others) || ""}
                </Text>
              </View>
            )}
          </View>
        )}
        {!!data?.investigation && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>INVESTIGATIONS :</Text>
            <Text style={styles.preText}>
              {clean(data?.investigation) || ""}
            </Text>
          </View>
        )}
        {!!data?.discussion && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>DISCUSSION / WARD MANAGEMENT:</Text>
            <Text style={styles.preText}>{clean(data?.discussion) || ""}</Text>
          </View>
        )}
        {!!data?.treatment && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>TREATMENT GIVEN:</Text>
            <Text style={styles.preText}>{clean(data?.treatment) || ""}</Text>
          </View>
        )}
        {!!data?.refernces && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>References:</Text>
            <Text style={styles.preText}>{clean(data?.refernces) || ""}</Text>
          </View>
        )}
        {!!data?.modifiedTreatment && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>
              Modified ECTs / Ketamine / Other Treatment:
            </Text>
            <Text style={styles.preText}>
              {clean(data?.modifiedTreatment) || ""}
            </Text>
          </View>
        )}
        {!!data?.deportAdministered && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>LA / Depot Administered:</Text>
            <Text style={styles.preText}>
              {clean(data?.deportAdministered) || ""}
            </Text>
          </View>
        )}
        {!!data?.patientStatus && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>
              PATIENT CONDITION / STATUS AT THE TIME OF EXPIRY:
            </Text>
            <Text wrap={true} style={styles.preText}>
              {clean(data?.patientStatus) || ""}
            </Text>
          </View>
        )}
        {typeof data?.note === "string" && data?.note.trim() && (
          <View style={styles.marginBottom} wrap={false}>
            <Text style={styles.fontSize13}>Note:</Text>
            <Text style={styles.preText}>{clean(data.note)?.trim()}</Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default ExpirySummaryBody;
