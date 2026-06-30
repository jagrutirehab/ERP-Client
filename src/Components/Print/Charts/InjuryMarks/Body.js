import React from "react";
import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  title: {
    fontSize: "13px",
    marginTop: 10,
    marginBottom: 10,
  },
  markContainer: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 10,
    textAlign: "left",
    marginBottom: 8,
    flexShrink: 1,
  },
  borderPurple: {
    border: "1px solid purple",
  },
  image: {
    width: "100%",
    objectFit: "contain",
  },
});

const InjuryMarksBody = ({ chart }) => {
  const marks = chart?.marks || [];
  return (
    <React.Fragment>
      <Text style={styles.title}>Patient Injury Marks</Text>
      {marks.map((mark, idx) => (
        <View key={mark?._id || idx} style={styles.markContainer} wrap={false}>
          <Text style={styles.descriptionText}>
            {idx + 1}. Description - {mark?.description || ""}
          </Text>
          {mark?.photo?.url && (
            <View style={styles.borderPurple}>
              <Image
                src={mark.photo.url}
                style={{ ...styles.image, height: 280 }}
              />
            </View>
          )}
        </View>
      ))}
    </React.Fragment>
  );
};

export default InjuryMarksBody;
