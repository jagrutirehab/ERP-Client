import React from "react";
import { View, Text, Font } from "@react-pdf/renderer";
import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import separateCamelCase from "../../../../utils/separateCamelCase";

Font.register({
    family: "Roboto",
    fonts: [
        {
            src: Roboto,
            fontWeight: "heavy",
        },
    ],
});

const MentalExaminationV2 = ({ data, styles }) => {
    const singleFieldSections = ["judgment", "remarks"];

    return (
        <React.Fragment>
            <View
                style={{
                    ...styles.column,
                    ...styles.mrgnTop10,
                    ...styles.mrgnBottom10,
                }}
            >
                <Text
                    style={{
                        ...styles.textCapitalize,
                        ...styles.mrgnBottom10,
                        ...styles.fontSize13,
                    }}
                >
                    Mental Status Examination:
                </Text>

                {Object.entries(data).map(([groupKey, groupValue], i) => {
                    const isObject =
                        typeof groupValue === "object" && groupValue !== null;

                    // --- GROUP SECTIONS (appearance, mood, thought, cognition, insight)
                    if (isObject) {
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

                                {Object.entries(groupValue).map(([subKey, subValue], j) => (
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

export default MentalExaminationV2;
