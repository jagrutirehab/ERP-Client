import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
import { format } from "date-fns";

import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import { getValidLogoSrc } from "../../constants/jagrutiLogo";

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
  logoSection: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoWrapper: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logo: {
    width: 120,
    height: 44,
    objectFit: "contain",
  },
  clinicBlock: {
    width: "55%",
    textAlign: "right",
  },
  heading: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  title: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  patientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1pt solid black",
    paddingBottom: 8,
    marginBottom: 6,
  },
});

const formatDateSafe = (dateStr, formatStr = "d MMM y") => {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "--" : format(d, formatStr);
};

const Header = ({ patient, admission, center }) => {
  const resolveCenter = () => {
    if (admission?.center && typeof admission.center === "object" && admission.center.name) {
      return admission.center;
    }
    if (center && typeof center === "object" && center.name) {
      return center;
    }
    if (patient?.center && typeof patient.center === "object" && patient.center.name) {
      return patient.center;
    }
    return null;
  };

  const activeCenter = resolveCenter();
  const admissionDate =
    admission?.addmissionDate ||
    admission?.dateOfAddmission ||
    patient?.addmission?.addmissionDate ||
    patient?.dateOfAddmission;

  const logoSrc = getValidLogoSrc(activeCenter);
  const centerName = activeCenter?.name || "JAGRUTI REHABILITATION CENTRE";
  const centerAddress = activeCenter?.address || "center address goes here.";

  return (
    <React.Fragment>
      <View style={styles.logoSection}>
        <View style={styles.logoWrapper}>
          <Image src={logoSrc} style={styles.logo} />
        </View>
        <View style={styles.clinicBlock}>
          <Text style={styles.heading}>
            {centerName}
          </Text>
          <Text style={{ whiteSpace: "pre-line" }}>
            {centerAddress}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>INVOICE HISTORY STATEMENT</Text>

      <View style={styles.patientRow}>
        <Text>
          <Text style={styles.heading}>Patient Name: </Text>
          {patient?.name || "--"}
        </Text>
        <Text>
          <Text style={styles.heading}>UHID: </Text>
          {patient?.id ? `${patient.id.prefix || ""}${patient.id.value ?? ""}` : "--"}
        </Text>
        <Text>
          <Text style={styles.heading}>Admitted: </Text>
          {formatDateSafe(admissionDate)}
        </Text>
      </View>
    </React.Fragment>
  );
};

export default Header;
