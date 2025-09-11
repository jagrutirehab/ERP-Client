import React from "react";
import { View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  container: {
    textAlign: "center",
    marginBottom: 8,
  },
  orgName: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 30, // default
    textTransform: "uppercase",
    marginBottom: 2,
  },
  address: {
    fontSize: 20,
    marginBottom: 1,
  },
  phone: {
    fontSize: 20,
    marginBottom: 1,
  },
  website: {
    fontSize: 20,
  },
});

const getResponsiveStyles = (pageWidth) => {
  // if (pageWidth <= 400) {
  //   return {
  //     orgName: { fontSize: 15 },
  //     text: { fontSize: 8 },
  //   };
  // } else
  if (pageWidth <= 600) {
    return {
      orgName: { fontSize: 15 },
      text: { fontSize: 10 },
    };
  } else {
    return {
      orgName: { fontSize: 30 },
      text: { fontSize: 20 },
    };
  }
};

const PrintHeader = ({ patient, pageWidth = 595 }) => {
  const responsive = getResponsiveStyles(pageWidth);

  return (
    <View style={styles.container}>
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: "46%", textAlign: "left" }}>
          <Text style={{ ...styles.orgName, ...responsive.orgName }}>
            {patient?.center?.name || "JAGRUTII REHAB CENTRE PRIVATE LIMITED"}
          </Text>
        </div>
        <div
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "end",
          }}
        >
          <Text style={{ ...styles.address, ...responsive.text }}>
            {patient?.center?.address ||
              "Sirohi, Sohana Highway, District Faridabad, 121004"}
          </Text>
          <Text style={{ ...styles.phone, ...responsive.text }}>
            {patient?.center?.numbers || "+91 77458 80088 / 98222 07761"}
          </Text>
          <Text style={{ ...styles.website, ...responsive.text }}>
            {patient?.center?.website || "www.jagrutirehab.org"}
          </Text>
        </div>
      </div>
    </View>
  );
};

export default PrintHeader;
