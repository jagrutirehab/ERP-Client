import React from "react";
import { StyleSheet, View, Text } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    marginTop: 16,
    textAlign: "center",
  },
  note: {
    fontSize: 8,
    color: "#666",
  },
});

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.note}>This is a computer generated statement.</Text>
  </View>
);

export default Footer;
