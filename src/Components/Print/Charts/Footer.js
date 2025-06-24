import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
});

const Footer = () => {
  let date = format(new Date(), "d MMM y");

  return (
    <React.Fragment>
      <View
        style={{ marginTop: "auto", paddingBottom: 20, paddingTop: 20 }}
        fixed
      >
        <View style={{ ...styles.row, ...styles.justifyBetween }}>
          <Text>Generated On: {date}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text>Powered by Jagruti</Text>
        </View>
      </View>
    </React.Fragment>
  );
};

export default Footer;
