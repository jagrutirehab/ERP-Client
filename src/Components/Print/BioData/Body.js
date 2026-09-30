import { Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import PropTypes from "prop-types";
import React from "react";
import { capitalizeWords } from "../../../utils/toCapitalize";
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";

Font.register({
  family: "Roboto",
  fonts: [{ src: Roboto, fontWeight: "heavy" }],
});

const styles = StyleSheet.create({
  pageTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    textDecoration: "underline",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#e8e8e8",
    padding: 4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  item: {
    width: "50%",
    marginBottom: 6,
    paddingRight: 8,
  },
  label: {
    fontSize: 9,
    color: "#555",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontFamily: "Roboto",
  },
  divider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: "#000",
  },
});

const InfoItem = ({ label, value }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

InfoItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const Body = ({ patient, addmission }) => {
  if (!patient) return null;

  const fullAddress = [
    patient.houseNo,
    patient.streetName,
    patient.city,
    patient.state,
    patient.country,
    patient.pinCode,
  ]
    .filter(Boolean)
    .join(", ");

  const dob = patient.dateOfBirth
    ? new Date(patient.dateOfBirth).toLocaleDateString()
    : "";

  return (
    <React.Fragment>
      <View>
        <Text style={styles.pageTitle}>PATIENT BIO DATA</Text>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          <View style={styles.row}>
            <InfoItem label="Name" value={capitalizeWords(patient.name)} />
            <InfoItem label="Gender" value={patient.gender} />
            <InfoItem label="Date of Birth" value={dob} />
            <InfoItem label="Age" value={patient.age} />
            <InfoItem label="Marital Status" value={patient.maritalstatus} />
            <InfoItem label="Religion" value={patient.religion} />
            {/* <InfoItem label="Nationality" value={patient.nationality} /> */}
            <InfoItem
              label="Aadhaar Card Number"
              value={patient.aadhaarCardNumber}
            />
          </View>
          <View style={styles.divider} />
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>
          <View style={styles.row}>
            <InfoItem label="Phone Number" value={patient.phoneNumber} />
            <InfoItem label="Email" value={patient.email} />
            <InfoItem
              label="Address"
              value={capitalizeWords(patient.address)}
            />
            {/* <InfoItem
              label="Full Address"
              value={capitalizeWords(fullAddress)}
            /> */}
          </View>
          <View style={styles.divider} />
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>GUARDIAN INFORMATION</Text>
          <View style={styles.row}>
            <InfoItem
              label="Guardian Name"
              value={capitalizeWords(patient.guardianName)}
            />
            <InfoItem
              label="Guardian Relation"
              value={patient.guardianRelation}
            />
            <InfoItem
              label="Guardian Phone Number"
              value={patient.guardianPhoneNumber}
            />
          </View>
          <View style={styles.divider} />
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            EDUCATION, OCCUPATION &amp; LANGUAGE
          </Text>
          <View style={styles.row}>
            <InfoItem
              label="Education / Qualification"
              value={patient.education}
            />
            <InfoItem label="Occupation" value={patient.occupation} />
            <InfoItem
              label="Occupation Detail"
              value={patient.occupationDetail}
            />
            <InfoItem
              label="Languages Known"
              value={patient.languagesKnown?.join(", ")}
            />
          </View>
          <View style={styles.divider} />
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>OTHER DETAILS</Text>
          <View style={styles.row}>
            <InfoItem
              label="Socioeconomic Status"
              value={patient.socioeconomicstatus}
            />
            <InfoItem label="Area Type" value={patient.areatype} />
            <InfoItem label="IPD Number" value={addmission?.[0]?.Ipdnum} />
            <InfoItem
              label="Provisional Diagnosis"
              value={addmission?.[0]?.provisional_diagnosis
                ?.map((p) => p.code)
                .join(", ")}
            />
            <InfoItem
              label="Referred By"
              value={patient.referredBy?.doctorName}
            />
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

Body.propTypes = {
  patient: PropTypes.object,
};

export default Body;
