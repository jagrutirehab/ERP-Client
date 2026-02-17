import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import addComma from "../../../../utils/addComma";
import { OPD } from "../../../constants/patient";

Font.register({
  family: "Roboto",
  fonts: [{ src: Roboto, fontWeight: "bold" }],
});

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: "column",
    marginTop: 10,
    // paddingHorizontal: 10,
  },
  rowHeader: {
    flexDirection: "row",
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 10,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    fontSize: 9,
    paddingVertical: 2,
  },
  cell: {
    paddingHorizontal: 2,
  },
  sn: { width: "8%", textAlign: "center" },
  desc: { width: "40%" },
  qty: { width: "10%", textAlign: "center" },
  uom: { width: "10%", textAlign: "center" },
  rate: { width: "15%", textAlign: "center" },
  amt: { width: "17%", textAlign: "right" },
  categoryTitle: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 10,
    marginTop: 8,
    paddingBottom: 2,
    // borderBottomWidth: 1,
    // borderColor: "#000",
    alignSelf: "flex-start",
    textTransform: "capitalize",
  },

  subTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    fontFamily: "Roboto",
    fontSize: 9,
    marginTop: 2,
  },
  subTotalLabel: { marginRight: 6 },
  subTotalValue: { width: "17%", textAlign: "right" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    fontFamily: "Roboto",
    fontSize: 9,
    marginTop: 3,
  },
  summaryRowWithBorder: {
    borderBottomWidth: 1,
    fontFamily: "Roboto",
    borderColor: "#000",
    paddingBottom: 2,
    marginBottom: 2,
  },
  summaryLabel: { marginRight: 6 },
  summaryValue: { width: "17%", textAlign: "right" },

  balanceBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 2,
    marginTop: 4,
  },
});

const transformInvoiceList = (invoiceList = []) => {
  const grouped = {};

  invoiceList.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push({
      ...item,
      category: item.category, // Ensure category exists inside each item too
    });
  });

  const data = Object.keys(grouped).map((category) => ({
    category,
    items: grouped[category],
  }));

  return data;
};

const Table = ({ bill }) => {
  console.log("bill from Main", bill);
  const totalItemDiscount =
    bill?.invoice?.invoiceList?.reduce(
      (sum, item) => sum + (Number(item?.discount) || 0),
      0,
    ) || 0;

  const totalAdditonalDiscount =
    (Number(bill?.invoice?.totalDiscount) || 0) - totalItemDiscount;
  let serial = 1;

  const data = transformInvoiceList(bill?.invoice?.invoiceList || []);
  const payable =
    bill.type === OPD
      ? addComma(bill.invoice?.payable ?? 0)
      : addComma(parseFloat(bill.invoice?.calculatedPayable ?? 0).toFixed(2));

  // const data = [
  //   {
  //     category: "Room Charges",
  //     items: [
  //       {
  //         description: "LUXURY ROOM W/O AC - 2 SHARING",
  //         qty: 45,
  //         uom: "Days",
  //         rate: 2000,
  //       },
  //     ],
  //   },
  //   {
  //     category: "Injectables",
  //     items: [
  //       { description: "INJ. OROFER 50 MG", qty: 3, uom: "Nos", rate: 2510 },
  //       { description: "INJ. PALIRIS 100 MG", qty: 4, uom: "Nos", rate: 3890 },
  //       { description: "INJ. PALIRIS 150 MG", qty: 5, uom: "Nos", rate: 54520 },
  //       { description: "INJ. PALIRIS 75 MG", qty: 2, uom: "Nos", rate: 4251 },
  //       { description: "INJ. PAN IV 40 MG", qty: 4, uom: "Nos", rate: 3200 },
  //     ],
  //   },
  //   {
  //     category: "Medical Consumables",
  //     items: [
  //       {
  //         description: "RYLES TUBE AND PROCEDURE CHARGE",
  //         qty: 4,
  //         uom: "Nos",
  //         rate: 652,
  //       },
  //       { description: "SCALP", qty: 5, uom: "Nos", rate: 4523 },
  //       { description: "SURGICAL GLOVES", qty: 6, uom: "Nos", rate: 6523 },
  //       { description: "SYRINGE - 5 ML", qty: 2, uom: "Nos", rate: 7412 },
  //       { description: "UPD KIT", qty: 1, uom: "Nos", rate: 321 },
  //       { description: "UPT KIT", qty: 2, uom: "Nos", rate: 341 },
  //       { description: "URINE BAG", qty: 8, uom: "Nos", rate: 7645 },
  //     ],
  //   },
  // ];

  const renderRows = () => {
    const rows = [];
    let grandTotal = 0;

    data.forEach((section) => {
      rows.push(
        <Text key={section.category} style={styles.categoryTitle}>
          {section.category}
        </Text>,
      );

      let subTotal = 0;
      section.items.forEach((item, idx) => {
        const amt = item.unit * item.cost;
        const discount = Number(item?.discount) || 0;
        subTotal += amt - discount;
        rows.push(
          <View style={{ paddingBottom: 5 }} key={item.slot}>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.sn]}>{idx + 1}</Text>
              <Text style={[styles.cell, styles.desc]}>
                {item.slot?.toUpperCase() || ""}
              </Text>
              <Text style={[styles.cell, styles.qty]}>{item.unit || 0}</Text>
              <Text style={[styles.cell, styles.uom]}>
                {item.unitOfMeasurement?.toUpperCase() || ""}
              </Text>
              <Text style={[styles.cell, styles.rate]}>
                {addComma(item.cost || 0)}
              </Text>
              <Text style={[styles.cell, styles.amt]}>{addComma(amt)}</Text>
              <Text style={[styles.cell, styles.amt]}>
                {addComma(Number(item?.discount) || 0)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.sn]}></Text>
              <Text style={[styles.cell, { width: "92%" }]}>
                {item.comments || ""}
              </Text>
            </View>
          </View>,
        );
      });

      rows.push(
        <View style={styles.subTotalRow} key={`${section.category}-subtotal`}>
          <Text style={styles.subTotalLabel}>Sub Total:</Text>
          <Text style={styles.subTotalValue}>{addComma(subTotal)}</Text>
        </View>,
      );

      grandTotal += subTotal;
    });

    return { rows, grandTotal };
  };

  const { rows, grandTotal } = renderRows();

  const discount = 10000;
  const advance = 50000;
  const deposit = 0;
  const balance = grandTotal - discount - advance - deposit;

  return (
    <View style={styles.tableContainer}>
      {/* Column Header */}
      <View
        style={{
          ...styles.rowHeader,
          borderBottom: 1,
          borderTop: 1,
          borderColor: "#000",
        }}
      >
        <Text style={[styles.cell, styles.sn]}>Sl No.</Text>
        <Text style={[styles.cell, styles.desc]}>Description</Text>
        <Text style={[styles.cell, styles.qty]}>Qty</Text>
        <Text style={[styles.cell, styles.uom]}>UOM</Text>
        <Text style={[styles.cell, styles.rate]}>Rate</Text>
        <Text style={[styles.cell, styles.amt]}>Amount</Text>
        <Text style={[styles.cell, styles.amt]}>Discount</Text>
      </View>

      {/* Line Items */}
      {rows}
      {/* Summary */}

      <View style={[styles.summaryRow, styles.summaryRowWithBorder]}>
        <Text style={styles.summaryLabel}>Total Amount:</Text>
        <Text style={styles.summaryValue}>
          ₹{addComma(bill.invoice?.grandTotal || 0)}
        </Text>
      </View>

      <View style={[styles.summaryRow]}>
        <Text style={styles.summaryLabel}>Addtional Discount:</Text>
        <Text style={styles.summaryValue}>
          ₹{addComma(totalAdditonalDiscount || 0)}
        </Text>
      </View>
      <View style={[styles.summaryRow]}>
        <Text style={styles.summaryLabel}>Bill Amount:</Text>
        <Text style={styles.summaryValue}>
          ₹{addComma(bill.invoice?.payable || 0)}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Less Discount:</Text>
        <Text style={styles.summaryValue}>
          ₹{addComma(bill.invoice?.totalDiscount || 0)}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Arrears:</Text>
        <Text style={styles.summaryValue}>
          ₹{addComma(bill.invoice?.previousPayable || 0)}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Less Advance:</Text>
        <Text style={styles.summaryValue}>
          ₹{addComma(bill.invoice?.currentAdvance || 0)}
        </Text>
      </View>

      {bill?.bill === "REFUND" && bill.invoice.refund >= 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Refund:</Text>
          <Text style={styles.summaryValue}>
            ₹{addComma(bill.invoice?.refund || 0)}
          </Text>
        </View>
      )}

      {/* <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Less Deposit:</Text>
        <Text style={styles.summaryValue}>₹{addComma(deposit)}</Text>
      </View> */}

      {/* Bordered Balance Section */}
      {/* Border under just the label & value */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <View
        // style={{
        //   borderBottomWidth: 1,
        //   borderColor: "#000",
        //   width: "80%",
        //   marginTop: 4,
        //   marginBottom: 4,
        // }}
        />
      </View>

      {/* Balance Amount row */}
      <View style={styles.balanceBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Balance Amount:</Text>
          <Text style={styles.summaryValue}>₹{addComma(payable || 0)}</Text>
        </View>
      </View>
    </View>
  );
};

export default Table;

// import React from "react";
// import { StyleSheet, View, Text, Font } from "@react-pdf/renderer";
// import toWords from "../../../../utils/toWords";

// import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";

// Font.register({
//   family: "Roboto",
//   fonts: [{ src: Roboto, fontWeight: "heavy" }],
// });

// const styles = StyleSheet.create({
//   footer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   amountContainer: {
//     width: "50%",
//     paddingRight: 10,
//   },
//   bankContainer: {
//     width: "50%",
//     paddingLeft: 10,
//   },
//   textUpper: {
//     textTransform: "uppercase",
//   },
//   textBold: {
//     fontFamily: "Roboto",
//     fontWeight: "heavy",
//   },
//   label: {
//     marginBottom: 3,
//   },
//   section: {
//     marginBottom: 10,
//   },
//   note: {
//     textAlign: "center",
//     fontSize: 10,
//     marginTop: 20,
//   },
//   signature: {
//     marginTop: 20,
//   },
// });

// const Table = ({ center, bill }) => {
//   let invoice = bill?.invoice;
//   let amountChargable = invoice?.calculatedPayable ?? 0.0;

//   if (invoice?.refund > 0) amountChargable = invoice.refund;
//   else if (invoice?.calculatedPayable > 0) amountChargable = invoice.calculatedPayable;
//   else amountChargable = 0;

//   return (
//     <>
//       <View style={styles.footer} wrap={false}>
//         {/* Amount Chargeable + Remarks */}
//         <View style={styles.amountContainer}>
//           <View style={styles.section}>
//             <Text style={styles.label}>Amount Chargeable (in words)</Text>
//             <Text style={[styles.textUpper, styles.textBold]}>
//               INR {parseInt(amountChargable) === 0 ? "Zero" : toWords(amountChargable)} ONLY
//             </Text>
//           </View>
//           <View style={styles.section}>
//             <Text style={styles.label}>Remarks:</Text>
//             <Text>
//               BEING BILL BOOKED FIXED CHARGES FOR NEW MONTH AND CONSUMABLE CHARGES FOR PAST MONTH
//             </Text>
//           </View>
//         </View>

//         {/* Bank Details */}
//         <View style={styles.bankContainer}>
//           <View style={styles.section}>
//             <Text style={styles.label}>Company's Bank Details:</Text>
//             <Text style={styles.label}>
//               A/c Holder's Name : <Text style={styles.textBold}>{center?.accountHolderName || "account holder name"}</Text>
//             </Text>
//             <Text style={styles.label}>
//               Bank Name : <Text style={styles.textBold}>{center?.bankName || "bank name"}</Text>
//             </Text>
//             <Text style={styles.label}>
//               A/c No. : <Text style={styles.textBold}>{center?.accountNumber || "account number"}</Text>
//             </Text>
//             <Text style={styles.label}>
//               Branch & IFS Code : <Text style={styles.textBold}>{center?.branchName || "branch & IFSC code"}</Text>
//             </Text>
//           </View>
//           <Text style={styles.textBold}>for JAGRUTI REHABILITATION CENTRE</Text>
//           <Text style={styles.signature}>Authorised Signatory</Text>
//         </View>
//       </View>

//       {/* Footer Note */}
//       <Text style={styles.note}>This is a Computer Generated Invoice</Text>
//     </>
//   );
// };

// export default Table;
