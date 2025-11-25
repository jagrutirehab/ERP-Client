import React from "react";
import { View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

//table
// import PrescriptionTable from "./Table";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const ProvisionalDiagnosis = ({ data, styles }) => {
  return (
    <React.Fragment>
      <View
        style={{
          ...styles.column,
          ...styles.mrgnTop10,
          ...styles.mrgnBottom10,
        }}
      >
        {data?.diagnosis1 && (
          <View style={styles.mrgnBottom10} wrap={false}>
            <Text style={styles.fontSize13}>Provisional Diagnosis:</Text>
            <Text style={{ ...styles.preText, ...styles.textCapitalize }}>
              {data?.diagnosis1 || ""}
            </Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default ProvisionalDiagnosis;
