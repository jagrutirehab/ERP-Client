import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

//components
import MseAtDischarge from "./Components/MseAtDischarge";
import MseAtAddmission from "./Components/MseAtAddmission";

//medicines table
import PrescriptionTable from "../Prescription/Table";
import DoctorSignature from "../DoctorSignature";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const styles = StyleSheet.create({
  body: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
    // borderTop: '1px solid black',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  blackCircle: {
    height: "5px",
    width: "5px",
    backgroundColor: "black",
    borderRadius: "3px",
    marginRight: 5,
  },
  preText: {
    whiteSpace: "pre-line",
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
    fontWeight: "heavy",
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
  marginBottom5: {
    marginBottom: 5,
  },
  textCenter: {
    textAlign: "center",
  },
});

const SummaryBody = ({ chart }) => {
  const data = chart.dischargeSummary;
  const splitTextIntoLines = (text) => {
    if (typeof text !== "string" || !text.trim()) return [];
    return text
      .trim()
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line);
  };
  return (
    <React.Fragment>
      <View style={styles.body}>
        <Text
          style={{
            ...styles.fontSize13,
            ...styles.marginBottom5,
            ...styles.textCenter,
          }}
        >
          Discharge Summary
        </Text>
        {data?.diagnosis && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>Diagnosis:</Text>
            <Text style={styles.preText}>{data?.diagnosis?.trim() || ""}</Text>
          </View>
        )}
        {data?.presentingSymptoms && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>Presenting Symptoms:</Text>
            <Text style={styles.preText}>{data?.presentingSymptoms || ""}</Text>
          </View>
        )}{" "}
        {/* MSE AT ADDMISSION {" "} */}
        <MseAtAddmission data={data} styles={styles} />
        {data?.pastHistory && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>PAST HISTORY:</Text>
            <Text style={styles.preText}>{data?.pastHistory || ""}</Text>
          </View>
        )}
        {data?.medicalHistory && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>MEDICAL HISTORY:</Text>
            <Text style={styles.preText}>{data?.medicalHistory || ""}</Text>
          </View>
        )}
        {data?.familyHistory && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>RELEVANT FAMILY HISTORY :</Text>
            <Text style={styles.preText}>{data?.familyHistory || ""}</Text>
          </View>
        )}
        {(data.personalHistory?.smoking ||
          data.personalHistory?.chewingTobacco ||
          data.personalHistory?.alcohol) && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>PERSONAL HISTORY:</Text>
            {data.personalHistory?.smoking && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Smoking</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.personalHistory?.smoking || ""}
                </Text>
              </View>
            )}
            {data.personalHistory?.chewingTobacco && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Chewing Tobacco</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.personalHistory?.chewingTobacco || ""}
                </Text>
              </View>
            )}
            {data.personalHistory?.alcohol && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Alcohol</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.personalHistory?.alcohol || ""}
                </Text>
              </View>
            )}
          </View>
        )}
        {(data.physicalExamination?.temprature ||
          data.physicalExamination?.pulse ||
          data.physicalExamination?.bp ||
          data.physicalExamination?.cvs ||
          data.physicalExamination?.rs ||
          data.physicalExamination?.abdomen ||
          data.physicalExamination?.cns ||
          data.physicalExamination?.others) && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>PHYSICAL EXAMINATION:</Text>
            {data.physicalExamination?.temprature && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Temprature</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.physicalExamination?.temprature || ""}
                </Text>
              </View>
            )}
            {data.physicalExamination?.pulse && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>pulse</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.physicalExamination?.pulse || ""}
                </Text>
              </View>
            )}
            {data.physicalExamination?.bp && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>B.P</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.physicalExamination?.bp || ""}
                </Text>
              </View>
            )}
            {data.physicalExamination?.cvs && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>CVS</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.physicalExamination?.cvs || ""}
                </Text>
              </View>
            )}
            {data.physicalExamination?.rs && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>RS</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.physicalExamination?.rs || ""}
                </Text>
              </View>
            )}
            {data.physicalExamination?.abdomen && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Abdomen</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.physicalExamination?.abdomen || ""}
                </Text>
              </View>
            )}
            {data.physicalExamination?.cns && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>CNS</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.physicalExamination?.cns || ""}
                </Text>
              </View>
            )}
            {data.physicalExamination?.others && (
              <View style={{ ...styles.checkBlock, ...styles.paddingLeft5 }}>
                <Text style={styles.w25}>Others</Text>
                <Text style={styles.w5}>:</Text>
                <Text style={{ ...styles.w70 }}>
                  {data.physicalExamination?.others || ""}
                </Text>
              </View>
            )}
          </View>
        )}
        {data?.investigation && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>
              INVESTIGATIONS : (all reports attached with Discharge Card)
            </Text>
            <Text style={styles.preText}>{data?.investigation || ""}</Text>
          </View>
        )}
        {data?.discussion && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>DISCUSSION / WARD MANAGEMENT:</Text>
            <Text style={styles.preText}>{data?.discussion || ""}</Text>
          </View>
        )}
        {data?.treatment?.length && data.treatment instanceof Array ? (
          <>
            <View>
              <Text style={styles.fontSize13}>GIVEN TREATMENTS:</Text>
            </View>
            <View style={{ marginTop: 10, marginBottom: 15 }}>
              <PrescriptionTable medicines={data.treatment} />
            </View>
          </>
        ) : data?.treatment ? (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>GIVEN TREATMENTS:</Text>
            <Text style={styles.preText}>{data?.treatment || ""}</Text>
          </View>
        ) : (
          ""
        )}
        {data?.refernces && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>References:</Text>
            <Text style={styles.preText}>{data?.refernces || ""}</Text>
          </View>
        )}
        {data?.modifiedTreatment && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>
              Modified ECTs / Ketamine / Other Treatment:
            </Text>
            <Text style={styles.preText}>{data?.modifiedTreatment || ""}</Text>
          </View>
        )}
        {data?.deportAdministered && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>LA / Depot Administered:</Text>
            <Text style={styles.preText}>{data?.deportAdministered || ""}</Text>
          </View>
        )}
        <MseAtDischarge data={data} styles={styles} />
        {data?.patientStatus && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>
              PATIENT CONDITION / STATUS AT THE TIME OF DISCHARGE:
            </Text>
            <Text wrap={true} style={styles.preText}>
              {data?.patientStatus || ""}
            </Text>
          </View>
        )}
        {(data?.medicine?.length || data?.followUp || data?.note) && (
          <View>
            <Text style={styles.fontSize13}>ADVISE ON DISCHARGE:</Text>
          </View>
        )}
        {data?.medicine?.length && (
          <View style={{ marginTop: 10, marginBottom: 15 }}>
            <PrescriptionTable medicines={data.medicine} />{" "}
          </View>
        )}
        {/* {typeof data?.followUp === "string" && data?.followUp.trim() && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>Follow-Up:</Text>
            <Text style={styles.preText}>
              {data.followUp
                .trim()
                .split(/\r?\n|(?<=\.)\s+/)
                .map((line, idx) => (
                  <Text key={idx}>{line.trim() + "\n"}</Text>
                ))}
            </Text>
          </View>
        )} */}
        {typeof data?.followUp === "string" && data?.followUp.trim() && (
          <View style={styles.marginBottom}>
            <Text style={styles.fontSize13}>Follow-Up:</Text>
            <View style={styles.paddingLeft5}>
              {data.followUp
                .trim()
                .split(/\r?\n|(?<=\.)\s+/)
                .map((line, idx) => (
                  <Text key={idx} style={styles.preText}>
                    {line.trim()}
                  </Text>
                ))}
            </View>
          </View>
        )}
        {/* {typeof data?.note === "string" && data?.note.trim() && (
          <View style={styles.marginBottom} wrap={false}>
            <Text style={styles.fontSize13}>Note:</Text>
            <Text style={styles.preText}>
              {data.note
                .trim()
                .split(/\r?\n|(?<=\.)\s+/)
                .map((line, idx) => (
                  <Text key={idx}>{line.trim() + "\n"}</Text>
                ))}
            </Text>
          </View>
        )} */}
        {typeof data?.note === "string" && data?.note.trim() && (
          <View style={styles.marginBottom} wrap={false}>
            <Text style={styles.fontSize13}>Note:</Text>
            <Text style={styles.preText}>{data.note.trim()}</Text>
          </View>
        )}
      </View>
      <DoctorSignature doctor={chart?.author} />
    </React.Fragment>
  );
};

export default SummaryBody;
