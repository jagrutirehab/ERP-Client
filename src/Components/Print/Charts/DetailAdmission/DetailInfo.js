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

  const Row = ({ label, value }) => (
    <View style={{ flexDirection: "row", marginBottom: 6 }}>
      <Text
        style={{
          ...styles.fontMd,
          textTransform: "capitalize",
          width: 120,
        }}
      >
        {label}
      </Text>
      <Text style={{ ...styles.fontMd, flex: 1, textTransform: "capitalize" }}>
        {value}
      </Text>
    </View>
  );

  return (
    <View
      style={{ ...styles.column, ...styles.mrgnTop10, ...styles.mrgnBottom10 }}
    >
      <Row
        label="doctor consultant"
        value={data.doctorConsultant.toUpperCase()}
      />
      <Row label="name" value={patient?.name} />
      {data.religion && <Row label="religion" value={data.religion} />}
      {age() && <Row label="age" value={age()} />}
      {patient.gender && <Row label="gender" value={patient.gender.toLowerCase()} />}
      {data.maritalStatus && (
        <Row label="marital status" value={data.maritalStatus} />
      )}
      {data.occupation && <Row label="occupation" value={data.occupation} />}
      {data.education && <Row label="education" value={data.education} />}
      {data.address && <Row label="address" value={data.address} />}
      {data.referral && (
        <Row label="source of referral" value={data.referral} />
      )}
      {data.provisionalDiagnosis && (
        <Row label="provisional diagnosis" value={data.provisionalDiagnosis} />
      )}
      {data.revisedDiagnosis && (
        <Row label="revised diagnosis" value={data.revisedDiagnosis} />
      )}
    </View>
  );
};

export default DetailInfo;
