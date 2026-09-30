// import React from "react";
// import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
// import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

// //logo
// import Logo from "../../../../assets/images/jagruti-logo.png";
// import { format } from "date-fns";
// import { INVOICE } from "../../../constants/patient";

// Font.register({
//   family: "Roboto",
//   fonts: [
//     {
//       src: Roboto,
//       fontWeight: "heavy",
//     },
//   ],
// });

// const styles = StyleSheet.create({
//   tableHeader: {
//     width: "100%",
//   },
//   row: {
//     flexDirection: "row",
//   },
//   justifyContent: {
//     justifyContent: "space-between",
//   },
//   logo: {
//     width: 150,
//   },
//   logoSection: {
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   mainSection: {
//     textAlign: "center",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   heading: {
//     fontFamily: "Roboto",
//     fontWeight: "heavy",
//   },
//   patientSection: {
//     marginTop: 20,
//     textAlign: "center",
//   },
// });

// const PrintHeader = ({ patient, center, bill }) => {
//   console.log("patient", patient);
//   console.log("center", center);
//   console.log("bill", bill);

//   const renderImage = () => (
//     <Image src={center?.logo ? center?.logo?.url : Logo} style={styles?.logo} />
//   );
//   const dateOfAdmission = () => {
//     return patient.addmission.addmissionDate
//       ? format(new Date(patient.addmission.addmissionDate), "d MMM y")
//       : "";
//   };

//   return (
//     <React.Fragment>
//       <View>
//         <View>
//           <View style={styles.logoSection}>
//             <Text>
//               Invoice Number:&#160;&#160;
//               <Text
//                 style={styles.heading}
//               >{`${bill?.id?.prefix}${bill?.id?.patientId}-${bill?.id?.value}`}</Text>
//             </Text>
//             <Text>
//               Dated:&#160;&#160;{format(new Date(bill.date), "d MMM y")}
//             </Text>
//           </View>
//           <View style={styles.logoSection}>
//             <Text>
//               {/* Ref No:&#160;&#160;
//               <Text style={styles.heading}>DOA&#160;{bill.refDate}</Text> */}
//             </Text>
//             {patient?.addmission?.addmissionDate && (
//               <Text>
//                 Date Of Admission:&#160;&#160;
//                 {dateOfAdmission()}
//               </Text>
//             )}
//           </View>
//         </View>
//         <View style={{ ...styles.mainSection, margin: "20px 0" }}>
//           <View style={{ width: "50%" }}>{renderImage()}</View>
//           <View
//             style={{ display: "flex", justifyContent: "center", width: "50%" }}
//           >
//             <Text style={styles.heading}>
//               {center?.name || "JAGRUTI REHABILITATION CENTRE"}
//             </Text>
//             {/* <Text>SIDDHIVINAYAK PLOT NO-37, SEC-5, TALOJA PHASE 1,</Text>
//             <Text>NAVI MUMBAI-410208</Text>
//             <Text>E-Mail : jagrutirehabmumbai@gmail.com</Text> */}
//             <Text style={{ whiteSpace: "pre-line" }}>
//               {center?.address || "center address goes here."}
//             </Text>
//           </View>
//         </View>
//         <View style={{ ...styles.row, ...styles.justifyContent }}>
//           <Text>Created By: {bill.author?.name || ""}</Text>
//           <Text>
//             On:{" "}
//             {bill.date
//               ? format(new Date(bill.date), "dd MMM yyyy")
//               : ""}
//           </Text>
//         </View>
//         <View style={styles.patientSection}>
//           <Text style={{ ...styles.heading, fontSize: "15px" }}>
//             {bill.bill === INVOICE ? "BILL" : "REFUND RECEIPT"}
//           </Text>
//           <Text>
//             Party:&#160;&#160;
//             <Text
//               style={{
//                 ...styles.heading,
//                 fontSize: "15px",
//                 textTransform: "capitalize",
//               }}
//             >
//               {`${patient?.name} - ${patient?.id?.prefix}${patient?.id?.value}` ||
//                 ""}
//             </Text>
//           </Text>
//         </View>
//       </View>
//     </React.Fragment>
//   );
// };

// export default PrintHeader;



import React from "react";
import { StyleSheet, View, Image, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

//logo
import Logo from "../../../../assets/images/jagruti-logo.png";
import { format } from "date-fns";
import { INVOICE } from "../../../constants/patient";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

const styles = StyleSheet.create({
  tableHeader: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
  },
  justifyContent: {
    justifyContent: "space-between",
  },
  logo: {
    width: 150,
  },
  logoSection: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainSection: {
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  patientSection: {
    marginTop: 20,
    textAlign: "center",
  },
  patientBox: {
    border: "1pt solid black",
    padding: 8,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
    width: "48%",
  },
});

const PrintHeader = ({ patient, center, bill }) => {

  console.log("patient", patient);
  console.log("center", center);
  console.log("bill", bill);

  // Safe date formatter
  const formatDateSafe = (dateStr, formatStr = "d MMM y") => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "--" : format(d, formatStr);
  };

  const renderImage = () => (
    <Image src={center?.logo ? center?.logo?.url : Logo} style={styles?.logo} />
  );

  // ORIGINAL FUNCTION (kept intact)
  const dateOfAdmission = () => {
    return patient?.addmission?.addmissionDate
      ? format(new Date(patient.addmission.addmissionDate), "d MMM y")
      : "";
  };

  return (
    <React.Fragment>
      <View>

        {/* ORIGINAL HEADER */}
        <View>
          <View style={styles.logoSection}>
            <Text>
              Invoice Number:&nbsp;&nbsp;
              <Text style={styles.heading}>
                {`${bill?.id?.prefix}${bill?.id?.patientId}-${bill?.id?.value}`}
              </Text>
            </Text>

            <Text>
              Dated:&nbsp;&nbsp;{formatDateSafe(bill?.date)}
            </Text>
          </View>

          <View style={styles.logoSection}>
            <Text></Text>

            {patient?.addmission?.addmissionDate && (
              <Text>
                Date Of Admission:&nbsp;&nbsp;
                {dateOfAdmission()}
              </Text>
            )}
          </View>
        </View>

        {/* CENTER HEADER */}
        <View style={{ ...styles.mainSection, margin: "20px 0" }}>
          <View style={{ width: "50%" }}>
            {renderImage()}
          </View>

          <View style={{ display: "flex", justifyContent: "center", width: "50%" }}>
            <Text style={styles.heading}>
              {center?.name || "JAGRUTI REHABILITATION CENTRE"}
            </Text>

            <Text style={{ whiteSpace: "pre-line" }}>
              {center?.address || "center address goes here."}
            </Text>
          </View>
        </View>

        {/* ORIGINAL CREATED BY ROW */}
        <View style={{ ...styles.row, ...styles.justifyContent }}>
          <Text>Created By: {bill?.author?.name || ""}</Text>

          <Text>
            On: {formatDateSafe(bill?.date)}
          </Text>
        </View>

        {/* ORIGINAL PARTY SECTION */}
        <View style={styles.patientSection}>
          <Text style={{ ...styles.heading, fontSize: "15px" }}>
            {bill?.bill === INVOICE ? "BILL" : "REFUND RECEIPT"}
          </Text>

          <Text>
            Party:&nbsp;&nbsp;
            <Text
              style={{
                ...styles.heading,
                fontSize: "15px",
                textTransform: "capitalize",
              }}
            >
              {patient?.name && patient?.id?.value
                ? `${patient.name} - ${patient.id.prefix}${patient.id.value}`
                : ""}
            </Text>
          </Text>
        </View>

        {/* NEW PATIENT BOX (ADDED WITHOUT REMOVING OLD CODE) */}
        <View style={styles.patientBox}>

          <View style={styles.column}>
            <Text>
              <Text style={styles.heading}>UHID No.:</Text>{" "}
              {`${patient?.id?.prefix || ""}${patient?.id?.value || ""}`}
            </Text>

            <Text>
              <Text style={styles.heading}>Patient Name:</Text>{" "}
              {patient?.name || ""}
            </Text>

            <Text>
              <Text style={styles.heading}>Age:</Text>{" "}
              {patient?.age || ""}
            </Text>

            <Text>
              <Text style={styles.heading}>Sex:</Text>{" "}
              {patient?.gender || ""}
            </Text>

            <Text>
              <Text style={styles.heading}>Psychologist Name:</Text>{" "}
              {patient?.psychologists?.[0]?.name || "--"}
            </Text>
          </View>

          <View style={styles.column}>
            <Text>
              <Text style={styles.heading}>Invoice Date:</Text>{" "}
              {formatDateSafe(bill?.date)}
            </Text>

            <Text>
              <Text style={styles.heading}>Invoice No.:</Text>{" "}
              {`${bill?.id?.prefix || ""}${bill?.id?.patientId || ""}-${bill?.id?.value || ""}`}
            </Text>

            <Text>
              <Text style={styles.heading}>Date Of Admission:</Text>{" "}
              {formatDateSafe(patient?.addmission?.addmissionDate)}
            </Text>

            <Text>
              <Text style={styles.heading}>Date Of Discharge:</Text>{" "}
              {formatDateSafe(patient?.dischargeDate)}
            </Text>

            <Text>
              <Text style={styles.heading}>Diagnosed With:</Text>{" "}
              {patient?.diagnosis || ""}
            </Text>
          </View>

        </View>

      </View>
    </React.Fragment>
  );
};

export default PrintHeader;