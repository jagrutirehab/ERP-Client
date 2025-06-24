import React from "react";
import { View, Text } from "@react-pdf/renderer";

const MseAtAddmission = (props) => {
  return (
    <React.Fragment>
      {(props?.data.mseAddmission?.appearance ||
        props?.data.mseAddmission?.ecc ||
        props?.data.mseAddmission?.speech ||
        props?.data.mseAddmission?.mood ||
        props?.data.mseAddmission?.affect ||
        props?.data.mseAddmission?.thoughts ||
        props?.data.mseAddmission?.perception ||
        props?.data.mseAddmission?.memory ||
        props?.data.mseAddmission?.abstractThinking ||
        props?.data.mseAddmission?.socialJudgment ||
        props?.data.mseAddmission?.insight) && (
        <View style={props?.styles.marginBottom}>
          {/* wrap={false} */}
          <Text style={props?.styles.fontSize13}>MSE at Addmission</Text>
          {props?.data.mseAddmission?.appearance && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Appearance and Behavior-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.appearance || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.ecc && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>ECC / RAPPORT-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.ecc || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.speech && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Speech-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.speech || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.mood && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Mood-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.mood || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.affect && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Affect-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.affect || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.thoughts && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Thoughts-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.thoughts || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.perception && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Perception-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.perception || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.memory && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Memory-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.memory || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.abstractThinking && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Abstract Thinking-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.abstractThinking || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.socialJudgment && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Social Judgment-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.socialJudgment || ""}
              </Text>
            </View>
          )}
          {props?.data.mseAddmission?.insight && (
            <View
              style={{
                ...props?.styles.checkBlock,
                ...props?.styles.paddingLeft5,
              }}
              wrap={false}
            >
              <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
                <Text style={props?.styles.blackCircle}></Text>
                <Text>Insight-</Text>
              </View>
              <Text style={{ ...props?.styles.w70 }}>
                {props?.data.mseAddmission?.insight || ""}
              </Text>
            </View>
          )}
        </View>
      )}
    </React.Fragment>
  );
};

export default MseAtAddmission;
