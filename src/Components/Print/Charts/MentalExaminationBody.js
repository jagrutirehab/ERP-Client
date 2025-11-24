import React from "react";
import { View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";
import separateCamelCase from "../../../utils/separateCamelCase";
import { DETAIL_ADMISSION, MENTAL_EXAMINATION } from "../../constants/patient";

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
    },
    itemsCenter: {
        alignItems: "center",
    },
    column: {
        flexDirection: "column",
        gap: 10,
    },
    mrgnTop10: {
        marginTop: 10,
    },
    mrgnBottom20: {
        marginBottom: 20,
    },
    textCapitalize: {
        textTransform: "capitalize",
    },
    fontSize13: {
        fontSize: "13px",
        fontFamily: "Roboto",
        fontWeight: "heavy",
        paddingBottom: 7,
    },
    w30: {
        width: "30%",
    },
    mrgnBottom5: {
        marginBottom: 5,
    },
    mrgnBottom3: {
        marginBottom: 3
    },
})

const MentalExaminationBody = ({ data, chart, from = MENTAL_EXAMINATION }) => {
    const source = data || chart || {};
    const singleFieldSections = ["judgment", "remarks", "perception"];

    return (
        <React.Fragment>
            <View
                style={{
                    ...styles.column,
                    ...styles.mrgnTop10,
                    ...styles.mrgnBottom20,
                }}
            >
                <Text
                    style={{
                        ...styles.textCapitalize,
                        ...styles.mrgnBottom20,
                        ...styles.fontSize13,
                    }}
                >
                    {from === DETAIL_ADMISSION ? "Mental Status Examination" : "Clinical Notes"}:
                </Text>

                {Object.entries(source).map(([groupKey, groupValue], i) => {
                    const blockedKeys = ["_id", "__v"];
                    if (blockedKeys.includes(groupKey)) return null;
                    const isObject =
                        typeof groupValue === "object" && groupValue !== null;

                    // --- GROUP SECTIONS (appearance, mood, thought, cognition, insight)
                    if (isObject) {
                        const allEmpty = Object.values(groupValue).every(
                            v => !v || String(v).trim() === ""
                        );
                        if (allEmpty) return null;
                        return (
                            <View key={i} style={{ ...styles.column, ...styles.mrgnBottom5 }}>
                                <Text
                                    style={{
                                        ...styles.textCapitalize,
                                        fontSize: 13,
                                        fontWeight: "heavy",
                                        ...styles.mrgnBottom3,
                                        marginTop: 4,
                                    }}
                                >
                                    {separateCamelCase(groupKey)}:
                                </Text>

                                {Object.entries(groupValue)
                                    .filter(([_, v]) => v && String(v).trim() !== "")
                                    .map(([subKey, subValue], j) => (
                                        <View
                                            key={j}
                                            style={{
                                                ...styles.row,
                                                ...styles.itemsCenter,
                                                ...styles.checkBlock,
                                                ...styles.paddingLeft5,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    ...styles.w30,
                                                    ...styles.row,
                                                    ...styles.textCapitalize,
                                                }}
                                            >
                                                <Text>{separateCamelCase(subKey)}:</Text>
                                            </View>

                                            <Text
                                                style={{
                                                    ...styles.w70,
                                                    ...styles.textCapitalize,
                                                }}
                                            >
                                                {subValue || ""}
                                            </Text>
                                        </View>
                                    ))}
                            </View>
                        );
                    }

                    // --- SINGLE FIELD SECTIONS (judgment, remarks)
                    if (singleFieldSections.includes(groupKey)) {
                        if (!groupValue || String(groupValue).trim() === "") return null;
                        return (
                            <View key={i} style={{ ...styles.column, ...styles.mrgnBottom5 }}>
                                <Text
                                    style={{
                                        ...styles.textCapitalize,
                                        fontSize: 13,
                                        fontWeight: "heavy",
                                        ...styles.mrgnBottom3,
                                        marginTop: 4,
                                    }}
                                >
                                    {separateCamelCase(groupKey)}:
                                </Text>

                                <View
                                    style={{
                                        ...styles.row,
                                        ...styles.itemsCenter,
                                        ...styles.checkBlock,
                                        ...styles.paddingLeft5,
                                    }}
                                >
                                    <Text style={{ ...styles.w70, ...styles.textCapitalize }}>
                                        {groupValue || ""}
                                    </Text>
                                </View>
                            </View>
                        );
                    }

                    if (!groupValue || String(groupValue).trim() === "") return null;

                    return (
                        <View
                            key={i}
                            style={{
                                ...styles.row,
                                ...styles.itemsCenter,
                                ...styles.checkBlock,
                                ...styles.paddingLeft5,
                            }}
                        >
                            <View
                                style={{
                                    ...styles.w30,
                                    ...styles.row,
                                    ...styles.textCapitalize,
                                }}
                            >
                                <Text>{separateCamelCase(groupKey)}:</Text>
                            </View>

                            <Text
                                style={{
                                    ...styles.w70,
                                    ...styles.textCapitalize,
                                }}
                            >
                                {groupValue || ""}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </React.Fragment>
    );
};

export default MentalExaminationBody;
