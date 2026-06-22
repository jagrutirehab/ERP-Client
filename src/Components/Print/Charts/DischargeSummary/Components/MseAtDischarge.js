// import React from "react";
// import { View, Text } from "@react-pdf/renderer";

// const MseAtDischarge = (props) => {
//   const data = props?.data ?? {};
//   return (
//     <React.Fragment>
//       {(data?.mseDischarge?.appearance ||
//         data?.mseDischarge?.ecc ||
//         data?.mseDischarge?.speech ||
//         data?.mseDischarge?.mood ||
//         data?.mseDischarge?.affect ||
//         data?.mseDischarge?.thoughts ||
//         data?.mseDischarge?.perception ||
//         data?.mseDischarge?.memory ||
//         data?.mseDischarge?.abstractThinking ||
//         data?.mseDischarge?.socialJudgment ||
//         data?.mseDischarge?.insight) && (
//         <View style={props?.styles.marginBottom}>
//           {/* wrap={false} */}
//           <Text style={props?.styles.fontSize13}>
//             Patient Condition on Discharge: (MSE at Discharge)
//           </Text>
//           {data?.mseDischarge?.appearance && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Appearance and Behavior-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.appearance || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.ecc && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>ECC / RAPPORT-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.ecc || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.speech && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Speech-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.speech || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.mood && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Mood-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.mood || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.affect && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Affect-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.affect || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.thoughts && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Thoughts-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.thoughts || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.perception && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Perception-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.perception || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.memory && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row, marginTop:2 }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Memory-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.memory || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.abstractThinking && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Abstract Thinking-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.abstractThinking || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.socialJudgment && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Social Judgment-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.socialJudgment || ""}
//               </Text>
//             </View>
//           )}
//           {data?.mseDischarge?.insight && (
//             <View
//               style={{
//                 ...props?.styles.checkBlock,
//                 ...props?.styles.paddingLeft5,
//               }}
//             >
//               <View style={{ ...props?.styles.w30, ...props?.styles.row }}>
//                 <Text style={props?.styles.blackCircle}></Text>
//                 <Text>Insight-</Text>
//               </View>
//               <Text style={{ ...props?.styles.w70 }}>
//                 {data?.mseDischarge?.insight || ""}
//               </Text>
//             </View>
//           )}
//         </View>
//       )}
//     </React.Fragment>
//   );
// };

// export default MseAtDischarge;

import React from "react";
import { View, Text } from "@react-pdf/renderer";

const MSE_FIELDS = [
  { key: "appearance", label: "Appearance and Behavior" },
  { key: "ecc", label: "ECC / RAPPORT" },
  { key: "speech", label: "Speech" },
  { key: "mood", label: "Mood" },
  { key: "affect", label: "Affect" },
  { key: "thoughts", label: "Thoughts" },
  { key: "perception", label: "Perception" },
  { key: "memory", label: "Memory" },
  { key: "abstractThinking", label: "Abstract Thinking" },
  { key: "socialJudgment", label: "Social Judgment" },
  { key: "insight", label: "Insight" },
];

const MseAtDischarge = ({ data, styles }) => {
  const mse = data?.mseDischarge ?? {};

  const hasAnyData = MSE_FIELDS.some((field) => mse[field.key]);

  if (!hasAnyData) return null;

  return (
    <React.Fragment>
      <View style={styles.marginBottom}>
        <Text style={styles.fontSize13}>
          Patient Condition on Discharge: (MSE at Discharge)
        </Text>

        {MSE_FIELDS.map(({ key, label }) =>
          mse[key] ? (
            <View
              key={key}
              style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}
            >
              <View style={{ ...styles.w30, ...styles.row }}>
                <View style={styles.blackCircle} />
                <Text>{label}-</Text>
              </View>
              <Text style={styles.w70}>{mse[key]}</Text>
            </View>
          ) : null,
        )}
      </View>
    </React.Fragment>
  );
};

export default MseAtDischarge;
