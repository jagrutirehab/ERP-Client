import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    marginTop: 40,
    borderTop: 1,
    paddingTop: 10,
    fontSize: 10,
    textAlign: "center",
  },
});

const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text>This is system generated Write Off document.</Text>
    </View>
  );
};

export default Footer;