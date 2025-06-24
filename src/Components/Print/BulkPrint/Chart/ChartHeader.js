import React from "react";
import { View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import { format } from "date-fns";

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
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    justifyBetween: {
        justifyContent: "space-between",
    },
    col6: {
        width: "50%",
    },
    padding5: {
        paddingTop: 5,
    },
    paddingBottom3: {
        paddingTop: 3,
    },
    paddingTop3: {
        paddingTop: 3,
    },
    padding10: {
        paddingTop: 10,
    },
    paddingRight5: {
        paddingRight: 5,
    },
    fontHeavy: {
        fontFamily: "Roboto",
        fontWeight: "heavy",
        fontSize: "12px",
    },
    textRight: {
        textAlign: "right",
    },
    fontMd: {
        fontSize: "10px",
    },
    paddingBottom5: {
        marginBottom: 5,
    },
});

const border = "2px dashed #000";
const ChartHeader = ({ chart }) => {
    return (
        <View
            style={{
                ...styles.row,
                gap: 10,
                borderBottom: border,
                borderTop: border,
                paddingTop: 5,
                paddingBottom: 5,
            }}
        >
            <Text style={{ textTransform: "capitalize" }}>Created By: {chart.author?.name?.toLowerCase() || ""}</Text>
            <Text>On: {chart.date ? format(new Date(chart.date), "dd MMM yyyy hh:mm a") : ""}</Text>
        </View>
    );
};

export default ChartHeader;
