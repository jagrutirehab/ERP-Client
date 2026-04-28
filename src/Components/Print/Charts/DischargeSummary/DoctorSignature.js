import { View, StyleSheet, Image, Text } from "@react-pdf/renderer";
import { safeText } from "../../../../utils/safeText";
import React from "react";

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
  const [doctorSig, setDoctorSig] = React.useState(null);
  const [psychSig, setPsychSig] = React.useState(null);



  React.useEffect(() => {
    const toBase64 = async (url, setter) => {
      if (!url) return;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => setter(reader.result);
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Signature fetch failed", e);
      }
    };

    toBase64(doctor?.doctorData?.signature, setDoctorSig);
    toBase64(doctor?.psychologistData?.signature, setPsychSig);
  }, [doctor]);

  const renderImage = (src) => {
    if (!src) return null;
    return <Image src={src} style={styles?.image} />;
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
        {doctorSig && (
          <View
            style={{
              width: "100%",
              ...styles.row,
              justifyContent: "center",
            }}
            wrap={false}
          >
           {renderImage(doctorSig)}
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
        {psychSig && (
          <View
            style={{
              width: "100%",
              ...styles.row,
              justifyContent: "center",
            }}
            wrap={false}
          >
            {renderImage(psychSig)}
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
