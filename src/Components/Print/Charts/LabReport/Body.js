import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  contentContainer: { flex: 1, justifyContent: "center" },
  paddingBottom10: { paddingBottom: 10 },
  textCenter: { textAlign: "center" },
  borderPurple: { border: "1px solid purple", marginBottom: 20 },
  image: { width: "100%", height: "auto" },
});

const Body = ({ report, idx }) => {
  if (!report) return null;

  return (
    <View style={styles.contentContainer}>
      <Text
        style={{
          textTransform: "capitalize",
          marginTop: idx === 0 && "4px",
          ...styles.paddingBottom10,
          ...styles.textCenter,
        }}
      >
        {report?.name || ""}
      </Text>
      <View style={styles.borderPurple}>
        <Image
          src={report?.file?.url}
          style={{ height: idx === 0 ? "80%" : "100%", ...styles.image }}
        />
      </View>
    </View>
  );
};

export default Body;
