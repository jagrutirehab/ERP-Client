import React from "react";
import Header from "./Header";
import Body from "./Body";
import Footer from "../Footer";

// ← No useSelector here

const DetailAdmission = ({
  chart,
  center,
  patient,
  admission,
  additionalDiagnosis,
}) => {
  // ← add prop
  return (
    <React.Fragment>
      <Header chart={chart} center={center} patient={patient} />
      <Body
        chart={chart}
        patient={patient}
        admission={admission}
        additionalDiagnosis={additionalDiagnosis} // ← pass down
      />
      <Footer chart={chart} patient={patient} center={center} />
    </React.Fragment>
  );
};

export default DetailAdmission;
