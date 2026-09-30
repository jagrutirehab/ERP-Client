import React from "react";
import { View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import { differenceInYears } from "date-fns";
// import { differenceInYears } from "date-fns";

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

const formatDate = (isoDateStr) => {
  if (!isoDateStr) return "N/A";
  const date = new Date(isoDateStr);

  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();
  // const hour = date.getHours();
  // const minute = date.getMinutes();

  return `${day} ${month} ${year}`;
};

const DetailInfo = ({ chart, patient, data, styles, admission }) => {
  // console.log(data)
  // const age = () =>
  //   differenceInYears(new Date(), new Date(patient?.dateOfBirth));

  const age = () => {
    if (patient?.age) return patient.age;

    if (patient?.dateOfBirth) {
      return differenceInYears(new Date(), new Date(patient.dateOfBirth));
    }

    return null;
  };


  const admissionDate =
    admission?.addmissionDate ||
    patient?.addmission?.addmissionDate;

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

  const formatDiagnosisValue = (value) => {
    if (!value) return "";

    // If array
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (!item) return "";

          // new format → object with code
          if (typeof item === "object" && item.code) {
            return item.code;
          }

          // weird old object like {0:"N",1:"A",2:"A"}
          if (typeof item === "object") {
            const chars = Object.keys(item)
              .filter((k) => !isNaN(k))
              .sort((a, b) => a - b)
              .map((k) => item[k]);

            return chars.length ? chars.join("") : "";
          }

          // pure string
          if (typeof item === "string") {
            return item;
          }

          return "";
        })
        .filter(Boolean)
        .join(", ");
    }

    // If already string
    if (typeof value === "string") {
      return value;
    }

    return "";
  };
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    }}>
      <View
        style={{ width: "60%", ...styles.column, ...styles.mrgnTop10, ...styles.mrgnBottom10 }}
      >
        {/* <Row
        label="age:"
        value={data.age.toUpperCase()}
      /> */}
        {admission?.Ipdnum ? <Row label="IPD Num:" value={admission?.Ipdnum} /> : ""}

        <Row
          label="doctor consultant:"
          value={data.doctorConsultant.toUpperCase() || ""}
        />
        <Row label="name:" value={patient?.name} />
        {data.religion && <Row label="religion:" value={data.religion} />}
        {age() !== null && (
          <Row label="age:" value={age()} />
        )}
        {/* {age() && <Row label="age:" value={age()} />} */}
        {patient.gender && (
          <Row label="gender:" value={patient.gender.toLowerCase()} />
        )}
        {data.maritalStatus && (
          <Row label="marital status:" value={data.maritalStatus} />
        )}
        {data.occupation && <Row label="occupation:" value={data.occupation} />}
        {data.education && <Row label="education:" value={data.education} />}
        {data.address && <Row label="address:" value={data.address} />}
        {data.referral && (
          <Row label="source of referral:" value={data.referral} />
        )}
        {data.provisionalDiagnosis && (
          <Row
            label="provisional diagnosis:"
            value={formatDiagnosisValue(data.provisionalDiagnosis)}
          />
        )}

        {data.revisedDiagnosis && (
          <Row
            label="revised diagnosis:"
            value={formatDiagnosisValue(data.revisedDiagnosis)}
          />
        )}
      </View>
      <View style={{ width: "35%", alignItems: "flex-end", ...styles.mrgnTop10 }}>
        {admissionDate && (
          <Text>
            Admission Date: {formatDate(admissionDate)}
          </Text>
        )}
      </View>
    </View>
  );
};

export default DetailInfo;
