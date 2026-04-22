import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  contentContainer: {
    // ← Remove flex: 1 entirely. Let content height grow naturally.
  },
  nameText: {
    textTransform: "capitalize",
    textAlign: "center",
    paddingBottom: 10,
  },
  descriptionText: {
    fontSize: 10,
    textAlign: "left",
    marginBottom: 10,
    flexShrink: 1, // ← allows text to shrink/wrap properly within the layout
  },
  borderPurple: { border: "1px solid purple", marginBottom: 20 },
  image: { width: "100%" },
});

const Body = ({ report, idx }) => {
  if (!report) return null;

  return (
    <View style={styles.contentContainer}>
      <Text style={[styles.nameText, { marginTop: idx === 0 ? 4 : 0 }]}>
        {report?.name || ""}
      </Text>
      {report?.description && (
        <Text style={styles.descriptionText}>
          Description - {report.description}
        </Text>
      )}
      <View style={styles.borderPurple}>
        <Image
          src={report?.file?.url}
          style={{
            ...styles.image,
            height: idx === 0 ? "60%" : "100%",
          }}
        />
      </View>
    </View>
  );
};

export default Body;