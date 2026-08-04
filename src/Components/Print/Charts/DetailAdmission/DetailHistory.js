import React from "react";
import { View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const DetailHistory = ({ data, styles }) => {
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
      >
        {/* old field — show if present */}
        {data?.history && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              History / Onset Duration & Progress:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.history || ""}
            </Text>
          </View>
        )}

        {/* new — array format */}
        {Array.isArray(data?.negativeHistory) &&
          data.negativeHistory.length > 0 && (
            <View style={styles.mrgnBottom10} wrap={false}>
              <Text style={styles.fontSize13}>Negative History:</Text>
              <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
                {data.negativeHistory.filter(Boolean).join(", ")}
              </Text>
            </View>
          )}

        {/* old — string format */}
        {typeof data?.negativeHistory === "string" && data.negativeHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Negative History:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data.negativeHistory}
            </Text>
          </View>
        )}

        {data?.negativeHistoryOther && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Negative History — Other:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.negativeHistoryOther || ""}
            </Text>
          </View>
        )}

        {data?.developmentDelay && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Development Delay:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.developmentDelay || ""}
            </Text>
          </View>
        )}

        {Array.isArray(data?.developmentDelayDetails) &&
          data.developmentDelayDetails.length > 0 && (
            <View style={styles.mrgnBottom10} wrap={false}>
              <Text style={styles.fontSize13}>Development Delay Details:</Text>
              <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
                {data.developmentDelayDetails.filter(Boolean).join(", ")}
              </Text>
            </View>
          )}

        {/* old field — show if present */}
        {data?.developmentHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              Development History & Childhood/Adolescence:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.developmentHistory || ""}
            </Text>
          </View>
        )}

        {data?.pastHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Past History:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.pastHistory || ""}
            </Text>
          </View>
        )}

        {data?.familyHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Family History:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.familyHistory || ""}
            </Text>
          </View>
        )}

        {data?.personalHistory && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>
              Personal / Sexual / Marital History:
            </Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.personalHistory || ""}
            </Text>
          </View>
        )}

        {data?.personality && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Personality:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.personality || ""}
            </Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default DetailHistory;
