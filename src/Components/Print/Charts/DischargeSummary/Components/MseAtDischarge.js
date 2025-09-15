import React from "react";
import { View, Text } from "@react-pdf/renderer";

const MseAtDischarge = (props) => {
  return (
    <React.Fragment>
      {(props?.data.mseDischarge?.appearance ||
        props?.data.mseDischarge?.ecc ||
        props?.data.mseDischarge?.speech ||
        props?.data.mseDischarge?.mood ||
        props?.data.mseDischarge?.affect ||
        props?.data.mseDischarge?.thoughts ||
        props?.data.mseDischarge?.perception ||
        props?.data.mseDischarge?.memory ||
        props?.data.mseDischarge?.abstractThinking ||
        props?.data.mseDischarge?.socialJudgment ||
        props?.data.mseDischarge?.insight) && (
        <View style={props?.styles.marginBottom}>
          {/* wrap={false} */}
          <Text style={props?.styles.fontSize13}>
            Patient Condition on Discharge: (MSE at Discharge)
          </Text>
          {props?.data.mseDischarge?.appearance && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Appearance and Behavior-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.appearance || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.ecc && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>ECC / RAPPORT-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.ecc || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.speech && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Speech-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.speech || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.mood && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Mood-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.mood || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.affect && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Affect-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.affect || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.thoughts && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Thoughts-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.thoughts || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.perception && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Perception-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.perception || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.memory && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row, marginTop:2 }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Memory-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.memory || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.abstractThinking && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Abstract Thinking-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.abstractThinking || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.socialJudgment && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Social Judgment-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.socialJudgment || ""}
              </Text>
            </View>
          )}
          {props?.data.mseDischarge?.insight && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Insight-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseDischarge?.insight || ""}
              </Text>
            </View>
          )}
        </View>
      )}
    </React.Fragment>
  );
};

export default MseAtDischarge;
