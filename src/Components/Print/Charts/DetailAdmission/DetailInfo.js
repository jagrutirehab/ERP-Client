import React from "react";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import { differenceInYears } from "date-fns";

//table
// import PrescriptionTable from "./Table";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const DetailInfo = ({ chart, patient, data, styles }) => {
  const age = () =>
    differenceInYears(new Date(), new Date(patient?.dateOfBirth));
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
            doctor consultant{" "}
          </Text>
          <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
            {data.doctorConsultant}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
            name{" "}
          </Text>
          <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
            {patient?.name}
          </Text>
        </View>
        {data.religion && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
              religion{" "}
            </Text>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              {data?.religion || ""}
            </Text>
          </View>
        )}
        <View
          style={{
            ...styles.row,
            ...styles.itemsCenter,
            ...styles.jusitfyBetween,
          }}
        >
          {age() && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
                age{" "}
              </Text>
              <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
                {age() || ""}
              </Text>
            </View>
          )}
          {patient.gender && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
                gender{" "}
              </Text>
              <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
                {patient.gender.toLowerCase() || ""}
              </Text>
            </View>
          )}
        </View>
        {data.maritalStatus && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
              marital status{" "}
            </Text>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              {data?.maritalStatus || ""}
            </Text>
          </View>
        )}
        {data.occupation && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
              occupation{" "}
            </Text>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              {data?.occupation || ""}
            </Text>
          </View>
        )}
        {data.education && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
              education{" "}
            </Text>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              {data?.education || ""}
            </Text>
          </View>
        )}
        {data.address && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
              address{" "}
            </Text>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              {data?.address || ""}
            </Text>
          </View>
        )}
        {data.referral && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
              source of referral{" "}
            </Text>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              {data?.referral || ""}
            </Text>
          </View>
        )}
        {data.provisionalDiagnosis && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
              provisional diagnosis{" "}
            </Text>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              {data?.provisionalDiagnosis || ""}
            </Text>
          </View>
        )}
        {data.revisedDiagnosis && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ ...styles.fontMd, textTransform: "uppercase" }}>
              revised diagnosis{" "}
            </Text>
            <Text style={{ ...styles.fontMd, textTransform: "capitalize" }}>
              {data?.revisedDiagnosis || ""}
            </Text>
          </View>
        )}
        revisedDiagnosis
      </View>
    </React.Fragment>
  );
};

export default DetailInfo;
