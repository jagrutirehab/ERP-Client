import React from "react";
import { View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";
import { differenceInYears, format } from "date-fns";
import { capitalizeWords } from "../../../utils/toCapitalize";

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
    textCaps: {
        textTransform: "capitalize",
    },
});

const border = "1px solid #000";
const Header = ({ date, patient, doctor }) => {


    const age = () =>
        differenceInYears(new Date(), new Date(patient?.dateOfBirth));
    return (
        <React.Fragment>
            <View>
                <View
                    style={{
                        ...styles.row,
                        ...styles.justifyBetween,
                        alignItems: "center",
                    }}
                >
                    <View style={styles.col6}>
                        <Text style={{ fontFamily: "Roboto", fontSize: "15px" }}>
                            JAGRUTI REHABILITATION CENTRE
                        </Text>
                    </View>
                    <View style={styles.col6}>
                        <Text style={styles.paddingTop3}>
                            +91 77458 80088 / 98222 07761
                        </Text>
                        <Text style={styles.paddingTop3}>www.jagrutirehab.org</Text>
                    </View>
                </View>
                <View
                    style={{
                        ...styles.row,
                        ...styles.justifyBetween,
                        borderTop: border,
                        marginTop: 20,
                        paddingTop: 5,
                    }}
                >
                    <Text style={styles.textCaps}>
                        Created By: {capitalizeWords(doctor?.name) || ""}
                    </Text>
                    <Text>
                        On:{" "}
                        {date
                            ? format(new Date(date), "dd MMM yyyy hh:mm a")
                            : ""}
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        marginTop: 5,
                        paddingBottom: 10,
                        borderBottom: border,
                        borderTop: border,
                        paddingTop: 5,
                        marginBottom: 10,
                    }}
                >
                    <View
                        style={
                            { width: "50%" }
                        }
                    >
                        <Text style={{ ...styles.fontMd, ...styles.textCaps }}>
                            Patient:{" "}
                            {`${patient?.name.toUpperCase()} - ${patient?.id?.prefix}${patient?.id?.value
                                }` || ""}
                        </Text>
                        <Text
                            style={{
                                ...styles.fontMd,
                                ...styles.padding5,
                                ...styles.textCaps,
                            }}
                        >
                            {patient?.phoneNumber && <>Ph: {patient?.phoneNumber}</>}
                            {patient?.email && <>, Email: {patient?.email}</>}
                        </Text>
                        {patient?.address && (
                            <Text
                                style={{
                                    ...styles.fontMd,
                                    ...styles.paddingTop3,
                                    ...styles.textCaps,
                                }}
                            >
                                {/* Address: {capitalizeWords(patient?.address) || ""} */}
                                Address: {patient?.address.toUpperCase() || ""}
                            </Text>
                        )}
                        {patient.gender && (
                            <Text style={styles.paddingTop3}>{patient.gender},</Text>
                        )}
                        {patient.dateOfBirth && (
                            <Text style={{ ...styles.paddingTop3 }}>{age()}</Text>
                        )}
                    </View>
                </View>

            </View>
        </React.Fragment>
    );
};

export default Header;
