// import React from "react";
// import { View, Text, Font, StyleSheet } from "@react-pdf/renderer";
// import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

// Font.register({
//   family: "Roboto",
//   fonts: [
//     {
//       src: Roboto,
//       fontWeight: "bold",
//     },
//   ],
// });

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

// const PrintHeader = ({ patient }) => {
//   return (
//     <View style={styles.container}>
//       <div style={{ display: "flex",width:"100%" }}>
//         <div style={{width:"46%", textAlign:"left"}}>
//           <Text style={styles.orgName}>
//             {patient?.center?.name || "JAGRUTII REHAB CENTRE PRIVATE LIMITED"}
//           </Text>
//         </div>
//         <div style={{width:"50%", display:"flex", flexDirection:"column", alignItems:"end"}}>
//           <Text style={styles.address}>
//             {patient?.center?.address ||
//               "Sirohi, Sohana Highway, District Faridabad, 121004"}
//           </Text>
//           <Text style={styles.phone}>
//             {patient?.center?.numbers || "+91 77458 80088 / 98222 07761"}
//           </Text>
//           <Text style={styles.website}>
//             {patient?.center?.website || "www.jagrutirehab.org"}
//           </Text>
//         </div>
//       </div>
//     </View>
//   );
// };

// export default PrintHeader;

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

// Responsive styles generator
const getResponsiveStyles = (pageWidth) =>
  StyleSheet.create({
    container: {
      textAlign: "center",
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    leftCol: {
      width: "46%",
      textAlign: "left",
    },
    rightCol: {
      width: "50%",
      flexDirection: "column",
      alignItems: "flex-end",
    },
    orgName: {
      fontFamily: "Roboto",
      fontWeight: "bold",
      fontSize: pageWidth <= 600 ? 10 : 30, // responsive font size
      textTransform: "uppercase",
      marginBottom: 2,
    },
    address: {
      fontSize: pageWidth <= 600 ? 7 : 20,
      marginBottom: 1,
    },
    phone: {
      fontSize: pageWidth <= 600 ? 7 : 20,
      marginBottom: 1,
    },
    website: {
      fontSize: pageWidth <= 600 ? 7 : 20,
    },
  });

const PrintHeader = ({ patient, pageWidth = 800 }) => {
  const styles = getResponsiveStyles(pageWidth);

  return (
    <View style={styles.container}>
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: "46%", textAlign: "left" }}>
          <Text style={styles.orgName}>
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
          <Text style={styles.address}>
            {patient?.center?.address ||
              "Sirohi, Sohana Highway, District Faridabad, 121004"}
          </Text>
          <Text style={styles.phone}>
            {patient?.center?.numbers || "+91 77458 80088 / 98222 07761"}
          </Text>
          <Text style={styles.website}>
            {patient?.center?.website || "www.jagrutirehab.org"}
          </Text>
        </div>
      </div>
    </View>
  );
};

export default PrintHeader;
