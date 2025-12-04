import React from "react";
import { View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";
import separateCamelCase from "../../../utils/separateCamelCase";
import { DETAIL_ADMISSION, MENTAL_EXAMINATION, mentalExaminationV2Fields } from "../../constants/patient";
import { convertSnakeToTitle } from "../../../utils/convertSnakeToTitle";

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
    w70: {
        width: "70%",
    },
    mrgnBottom5: {
        marginBottom: 5,
    },
    mrgnBottom3: {
        marginBottom: 3,
    },
});

const groupOrder = [
    "chiefComplaints",
    "appearanceAndBehavior",
    "speech",
    "mood",
    "affect",
    "thought",
    "perception",
    "cognition",
    "insight",
    "judgment",
    "remarks",
    "observation"
];


const MentalExaminationBody = ({ data, chart, from = MENTAL_EXAMINATION }) => {
    const source = data || chart || {};

    const singleFieldSections = ["judgment", "remarks", "observation", "chiefComplaints"];

    const fieldsMap = {};
    mentalExaminationV2Fields.forEach(f => {
        if (f.name) fieldsMap[f.name] = f.label;
    });

    const mergedAffect = {
        affect: source.mood?.affect || "",
        affectNotes: source.mood?.affectNotes || "",
        ...(source.affectV2 || {}),
    };

    const cleanedAffect = Object.fromEntries(
        Object.entries(mergedAffect).filter(([_, v]) => v && String(v).trim() !== "")
    );

    const filteredMood = source.mood ? { ...source.mood } : {};
    delete filteredMood.affect;
    delete filteredMood.affectNotes;

    const cleanedMood = Object.fromEntries(
        Object.entries(filteredMood).filter(([_, v]) => v && String(v).trim() !== "")
    );

    const RenderGroup = ({ title, obj }) => (
        <View style={{ ...styles.column, ...styles.mrgnBottom5 }}>
            <Text
                style={{
                    ...styles.textCapitalize,
                    fontSize: 13,
                    fontWeight: "heavy",
                    ...styles.mrgnBottom3,
                    marginTop: 4,
                }}
            >
                {separateCamelCase(title)}:
            </Text>

            {Object.entries(obj).map(([k, v], i) => (
                <View key={i} style={{ ...styles.row, ...styles.itemsCenter }}>
                    <View style={{ ...styles.w30 }}>
                        <Text>{fieldsMap[k] || separateCamelCase(k)}:</Text>
                    </View>

                    <Text style={{ ...styles.w70 }}>
                        {Array.isArray(v)
                            ? v.map(convertSnakeToTitle).join(", ")
                            : convertSnakeToTitle(v)}
                    </Text>
                </View>
            ))}
        </View>
    );

    return (
        <View style={{ ...styles.column, ...styles.mrgnTop10, ...styles.mrgnBottom20 }}>
            <Text
                style={{
                    ...styles.textCapitalize,
                    ...styles.mrgnBottom20,
                    ...styles.fontSize13,
                }}
            >
                {from === DETAIL_ADMISSION ? "Mental Status Examination" : "Clinical Notes"}:
            </Text>

            {groupOrder.map((groupKey, i) => {
                const groupValue = source[groupKey];

                if (!groupValue) return null;
                const isObject = typeof groupValue === "object" && groupValue !== null;

                if (groupKey === "affect" || groupKey === "affectV2") return null;

                if (groupKey === "perceptionNotes") return null;

                //  MOOD + AFFECT
                if (groupKey === "mood") {
                    return (
                        <View key={i}>
                            {Object.keys(cleanedMood).length > 0 && (
                                <RenderGroup title="Mood" obj={cleanedMood} />
                            )}

                            {Object.keys(cleanedAffect).length > 0 && (
                                <View style={{ marginTop: 10 }}>
                                    <RenderGroup title="Affect" obj={cleanedAffect} />
                                </View>
                            )}
                        </View>
                    );
                }

                // PERCEPTION
                if (groupKey === "perception") {
                    const perceptionObj = {};

                    if (source.perception && String(source.perception).trim() !== "")
                        perceptionObj.perception = source.perception;

                    if (source.perceptionNotes && String(source.perceptionNotes).trim() !== "")
                        perceptionObj.perceptionNotes = source.perceptionNotes;

                    if (Object.keys(perceptionObj).length === 0) return null;

                    return <RenderGroup key={i} title="Perception" obj={perceptionObj} />;
                }

                // Single simple fields
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

                            <View style={{ ...styles.row, ...styles.itemsCenter }}>
                                <Text style={{ ...styles.w70 }}>
                                    {convertSnakeToTitle(groupValue)}
                                </Text>
                            </View>
                        </View>
                    );
                }

                //  Normal object group 
                if (isObject) {
                    const cleaned = Object.fromEntries(
                        Object.entries(groupValue).filter(
                            ([_, v]) => v && String(v).trim() !== ""
                        )
                    );

                    if (Object.keys(cleaned).length === 0) return null;

                    return <RenderGroup key={i} title={groupKey} obj={cleaned} />;
                }

                // Simple fallback field
                if (!groupValue || String(groupValue).trim() === "") return null;

                return (
                    <RenderGroup
                        key={i}
                        title={groupKey}
                        obj={{ [groupKey]: groupValue }}
                    />
                );
            })}

        </View>
    );
};

export default MentalExaminationBody;
