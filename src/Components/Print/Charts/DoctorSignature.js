import { View, StyleSheet, Image, Text } from "@react-pdf/renderer";
import { safeText } from "../../../utils/safeText";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  marginTop10: {
    marginTop: 10,
  },
  fontHeavy: {
    fontFamily: "Mukta Bold",
    fontSize: "15px",
  },
  image: {
    width: "50px",
  },
  textCapitalize:{
    textTransform:"capitalize"
  }
});

const DoctorSignature = ({ doctor }) => {
  const renderImage = (src, width) => {
    if (!src) return null;
    return <Image src={src} style={styles.image} />;
  };
  return (
    <View
      wrap={false}
      style={{
        ...styles.mrgnTop30,
        // ...styles.fontHeavy,
        ...styles.row,
        textAlign: "right",
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {doctor?.signature && (
          <View
            style={{
              width: "100%",
              ...styles.row,
              justifyContent: "center",
            }}
            wrap={false}
          >
            {renderImage(doctor.signature, 200)}
          </View>
        )}
        {doctor?.name && (
          <Text
            style={{
              lineHeight: 1.2,
              marginBottom: 3,
              ...styles.textCapitalize,
            }}
          >
            {doctor?.name}
          </Text>
        )}
        {safeText(
          "",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.degrees
        )}
        {safeText(
          "",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.speciality
        )}
        {safeText(
          "Reg. No.",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.registrationNo
        )}
      </View>
    </View>
  );
};

export default DoctorSignature;
