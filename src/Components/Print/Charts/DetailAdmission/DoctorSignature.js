import { View, StyleSheet, Image, Text } from "@react-pdf/renderer";
import { safeText } from "../../../../utils/safeText";

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
  textCapitalize: {
    textTransform: "capitalize",
  },
});

const DoctorSignature = ({ doctor }) => {
  console.log(doctor);
  const renderImage = (src, width) => {
    if (!src) return null;
    return <Image src={src} style={styles.image} />;
  };
  return (
    <View
      wrap={false}
      style={{
        ...styles.mrgnTop30,
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
        {doctor?.doctorData?.signature && (
          <View
            style={{
              width: "100%",
              ...styles.row,
              justifyContent: "center",
            }}
            wrap={false}
          >
            {renderImage(doctor?.doctorData?.signature, 200)}
          </View>
        )}
        {doctor?.doctorData?.name && (
          <Text
            style={{
              lineHeight: 1.2,
              marginBottom: 3,
              ...styles.textCapitalize,
            }}
          >
            {doctor?.doctorData?.name}
          </Text>
        )}
        {safeText(
          "",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.doctorData?.degrees
        )}
        {safeText(
          "",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.doctorData?.speciality
        )}
        {safeText(
          "Reg. No.",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.doctorData?.registrationNo
        )}
      </View>

      <View
        style={{
          marginLeft: "50px",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {doctor?.psychologistData?.signature && (
          <View
            style={{
              width: "100%",
              ...styles.row,
              justifyContent: "center",
            }}
            wrap={false}
          >
            {renderImage(doctor?.psychologistData?.signature, 200)}
          </View>
        )}
        {doctor?.psychologistData?.name && (
          <Text
            style={{
              lineHeight: 1.2,
              marginBottom: 3,
              ...styles.textCapitalize,
            }}
          >
            {doctor?.psychologistData?.name}
          </Text>
        )}
        {safeText(
          "",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.psychologistData?.degrees
        )}
        {safeText(
          "",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.psychologistData?.speciality
        )}
        {safeText(
          "Reg. No.",
          {
            lineHeight: 1.2,
            ...styles.fontNormal,
            ...styles.textCapitalize,
          },
          doctor?.psychologistData?.registrationNo
        )}
      </View>
    </View>
  );
};

export default DoctorSignature;
