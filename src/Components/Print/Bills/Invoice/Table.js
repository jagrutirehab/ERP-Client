import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import addComma from "../../../../utils/addComma";
import { OPD } from "../../../constants/patient";

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
  tableContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 24,
  },
  row: {
    flexDirection: "row",
    borderColor: "gray",
    borderWidth: 1,
    alignItems: "center",
  },
  SNo: {
    width: "10%",
    textAlign: "left",
    borderColor: "gray",
    paddingLeft: 8,
  },
  slot: {
    width: "60%",
    display: "block",
    borderColor: "gray",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    textAlign: "left",
    paddingRight: 5,
    paddingLeft: 5,
    textTransform: "capitalize",
    // paddingTop: 1,
    // paddingBottom: 1,
  },
  amount: {
    width: "20%",
    borderColor: "gray",
    textAlign: "right",
    paddingRight: 10,
  },
  footerItem: {
    height: "100%",
    width: "70%",
    display: "block",
    borderColor: "gray",
    textAlign: "right",
    paddingRight: 5,
    paddingLeft: 5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  fontRoboto: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  footerAmount: {
    width: "20%",
  },
});

const Table = ({ bill }) => {
  const invoice = bill.invoice;

  // let payable = invoice.payable;

  // if (invoice?.prevPayable >= 0 && invoice?.currentAdvance >= 0) {
  //   payable =
  //     parseInt(invoice?.payable) +
  //     parseInt(invoice?.prevPayable) -
  //     parseInt(invoice?.currentAdvance);
  // }
  // if (
  //   parseInt(invoice?.currentAdvance) >
  //   parseInt(invoice?.payable) + parseInt(invoice.prevPayable)
  // ) {
  //   payable = 0;
  // }

  // //find whole discount using grandTotal -------------------------
  // let wholeDiscount = 0;
  // if (invoice.wholeUnit === "%" && invoice.wholeDiscount) {
  //   wholeDiscount =
  //     (parseFloat(invoice.wholeDiscount) / 100) *
  //     parseFloat(invoice.grandTotal);
  // } else wholeDiscount = parseFloat(invoice.wholeDiscount);
  // //--------------------------------------------------------------

  // const grand = parseFloat(invoice.grandTotal);
  // const advance = parseFloat(invoice.currentAdvance);
  // const prevPayable = parseFloat(invoice.prevPayable);

  // //--------------------------------------------------------------
  // const totalRefund = invoice?.currentAdvance - invoice?.payable;
  // //--------------------------------------------------------------

  const payable =
    bill.type === OPD
      ? addComma(invoice.payable ?? 0)
      : addComma(parseFloat(invoice.calculatedPayable ?? 0).toFixed(2));

  const [height, setHeight] = useState();
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, []);

  return (
    <React.Fragment>
      <View style={styles.tableContainer}>
        <View
          style={{
            ...styles.row,
            borderBottom: 0,
          }}
        >
          <Text style={styles.SNo}>SI No.</Text>
          <Text style={styles.slot}>Particulars</Text>
          <Text
            style={{
              borderRight: 1,
              ...styles.SNo,
              paddingLeft: 0,
              textAlign: "center",
            }}
          >
            QTY
          </Text>
          <Text style={styles.amount}>Amount</Text>
        </View>
        {(invoice.invoiceList || []).map((item, idx) => {
          const totalValue = (item.unit ?? 0) * (item.cost ?? 0);
          return (
            <View
              style={{
                ...styles.row,
                borderBottom: 0,
              }}
              key={item._id}
              wrap={false}
            >
              <Text style={styles.SNo}>{idx + 1}</Text>
              <View ref={ref} style={styles.slot}>
                <Text style={styles.fontRoboto}>{item.slot}</Text>
                <Text style={{ whiteSpace: "pre-line" }}>{item.comments}</Text>
              </View>
              <View
                style={{
                  borderRight: 1,
                  ...styles.SNo,
                  alignItems: "center",
                  display: "flex",
                  alignSelf: "stretch",
                  paddingLeft: 0,
                }}
              >
                <Text style={{ margin: "auto" }}>{item.unit}</Text>
              </View>
              <Text
                style={{
                  ...styles.amount,
                  ...styles.fontRoboto,
                  objectPosition: "top",
                  display: "flex",
                  height: "100%",
                }}
              >
                {addComma(parseFloat(totalValue).toFixed(2)) || "0.00"}
              </Text>
            </View>
          );
        })}
        <View wrap={false}>
          <View
            style={{
              ...styles.row,
              borderBottom: 0,
            }}
          >
            <Text style={styles.SNo}></Text>
            <Text style={styles.footerItem}>Total</Text>
            <Text
              style={{
                ...styles.amount,
                ...styles.fontRoboto,
                ...styles.footerAmount,
              }}
            >
              ₹{addComma((invoice.grandTotal ?? 0).toFixed(2)) || "0.00"}
            </Text>
          </View>
          {invoice?.totalDiscount && (
            <View
              style={{
                ...styles.row,
                borderBottom: 0,
              }}
            >
              <Text style={styles.SNo}></Text>
              <Text style={styles.footerItem}>Discount</Text>
              <Text
                style={{
                  ...styles.amount,
                  ...styles.fontRoboto,
                  ...styles.footerAmount,
                }}
              >
                ₹{addComma((invoice.totalDiscount ?? 0).toFixed(2)) || "0.00"}
              </Text>
            </View>
          )}
          {parseFloat(invoice.previousPayable) > 0 && (
            <View
              style={{
                ...styles.row,
                borderBottom: 0,
              }}
            >
              <Text style={styles.SNo}></Text>
              <Text style={styles.footerItem}>Arrears</Text>
              <Text
                style={{
                  ...styles.amount,
                  ...styles.fontRoboto,
                  ...styles.footerAmount,
                }}
              >
                ₹{addComma((invoice.previousPayable ?? 0).toFixed(2)) || "0.00"}
              </Text>
            </View>
          )}
          {parseFloat(invoice.currentAdvance) > 0 && (
            <View
              style={{
                ...styles.row,
                borderBottom: 0,
              }}
            >
              <Text style={styles.SNo}></Text>
              <Text style={styles.footerItem}>From Advance</Text>
              <Text
                style={{
                  ...styles.amount,
                  ...styles.fontRoboto,
                  ...styles.footerAmount,
                }}
              >
                ₹{addComma((invoice.currentAdvance ?? 0).toFixed(2)) || "0.00"}
              </Text>
            </View>
          )}
          {parseFloat(invoice?.wholeDiscount) > 0 && (
            <View
              style={{
                ...styles.row,
                borderBottom: 0,
              }}
            >
              <Text style={styles.SNo}></Text>
              <Text style={styles.footerItem}>Discount</Text>
              <Text
                style={{
                  ...styles.amount,
                  ...styles.fontRoboto,
                  ...styles.footerAmount,
                }}
              >
                ₹{addComma(invoice.wholeDiscount.toFixed(2)) || "0.00"}
              </Text>
            </View>
          )}

          {bill?.bill === "REFUND" && invoice.refund >= 0 && (
            <View
              style={{
                ...styles.row,
                borderBottom: 0,
              }}
            >
              <Text style={styles.SNo}></Text>
              <Text style={styles.footerItem}>Refund</Text>
              <Text
                style={{
                  ...styles.amount,
                  ...styles.fontRoboto,
                  ...styles.footerAmount,
                }}
              >
                ₹{invoice.refund?.toFixed(2) || "0.00"}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.SNo}></Text>
            <Text style={styles.footerItem}>Payable</Text>
            <Text
              style={{
                ...styles.amount,
                ...styles.fontRoboto,
                ...styles.footerAmount,
              }}
            >
              ₹{payable || "0.00"}
            </Text>
          </View>
          {/* {invoice?.invoiceType === "REFUND (₹)" &&
            parseFloat(invoice?.currentAdvance) >
              parseFloat(invoice?.payable) && (
              <View style={styles.row}>
                <Text style={styles.SNo}></Text>
                <Text style={styles.footerItem}>Total Refund</Text>
                <Text
                  style={{
                    ...styles.amount,
                    ...styles.fontRoboto,
                    ...styles.footerAmount,
                  }}
                >
                  ₹{totalRefund.toFixed(2) || "0.00"}
                </Text>
              </View>
            )} */}
        </View>
      </View>
    </React.Fragment>
  );
};

export default Table;

// let totalValue = 0;
//           if (item.unit && item.cost)
//             totalValue = parseFloat((item.unit * item.cost).toFixed(2));
//           let itemDiscount;
//           let tax;
//           if (totalValue) {
//             //find dicount in % & ₹
//             if (item.discount) {
//               itemDiscount =
//                 item.discountUnit === "%"
//                   ? (parseFloat(item.discount) / 100) * totalValue
//                   : parseFloat(item.discount);
//             }
//             //check that discount is less than total cost
//             if (itemDiscount && itemDiscount <= totalValue) {
//               // itemDiscount = parseFloat(itemDiscount);
//               totalValue = totalValue - itemDiscount;
//               // totalValue = totalValue.toFixed(2);
//             }
//             //find tax in %
//             if (item.tax) {
//               tax = (parseFloat(item.tax) / 100) * totalValue;
//             }
//             // add tax to total value
//             if (tax) {
//               totalValue = totalValue + tax;
//               // totalValue = totalValue.toFixed(2);
//             }
//           }
