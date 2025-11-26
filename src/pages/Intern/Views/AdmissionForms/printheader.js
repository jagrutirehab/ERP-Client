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

// const styles = StyleSheet.create({
//   container: {
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   orgName: {
//     fontFamily: "Roboto",
//     fontWeight: "bold",
//     fontSize: 30,
//     textTransform: "uppercase",
//     marginBottom: 2,
//   },
//   address: {
//     fontSize: 20,
//     marginBottom: 1,
//   },
//   phone: {
//     fontSize: 20,
//     marginBottom: 1,
//   },
//   website: {
//     fontSize: 20,
//   },
// });

const getResponsiveStyles = (pageWidth) =>
  StyleSheet.create({
    container: {
      textAlign: "center",
      marginBottom: 8,
      flexDirection: pageWidth <= 600 ? "column" : "row",
      justifyContent: "space-between",
      alignItems: pageWidth <= 600 ? "flex-start" : "center",
      width: "100%",
      marginBottom: 8,
    },
    leftCol: {
      width: pageWidth <= 600 ? "100%" : "46%",
      textAlign: pageWidth <= 600 ? "center" : "left",
      marginBottom: pageWidth <= 600 ? 4 : 0,
    },
    rightCol: {
      width: pageWidth <= 600 ? "100%" : "50%",
      flexDirection: "column",
      alignItems: pageWidth <= 600 ? "center" : "flex-end",
    },
    orgName: {
      fontFamily: "Roboto",
      fontWeight: "bold",
      fontSize: pageWidth <= 600 ? 14 : 30, // responsive font size
      textTransform: "uppercase",
      marginBottom: 2,
    },
    address: {
      fontSize: pageWidth <= 600 ? 8 : 20,
      marginBottom: 1,
    },
    phone: {
      fontSize: pageWidth <= 600 ? 8 : 20,
      marginBottom: 1,
    },
    website: {
      fontSize: pageWidth <= 600 ? 8 : 20,
    },
  });

const PrintHeader = ({ intern, pageWidth = 800 }) => {
  const styles = getResponsiveStyles(pageWidth);
  return (
    <View style={styles.container}>
      <View style={{ display: "flex", width: "100%" }}>
        <View style={{ width: "46%", textAlign: "left" }}>
          <Text style={styles.orgName}>
            {intern?.center?.title || "JAGRUTII REHAB CENTRE PRIVATE LIMITED"}
          </Text>
        </View>
        <View
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "end",
          }}
        >
          <Text style={styles.address}>
            {intern?.center?.address ||
              "Sirohi, Sohana Highway, District Faridabad, 121004"}
          </Text>
          <Text style={styles.phone}>
            {intern?.center?.numbers || "+91 77458 80088 / 98222 07761"}
          </Text>
          <Text style={styles.website}>
            {intern?.center?.website || "www.jagrutirehab.org"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PrintHeader;
