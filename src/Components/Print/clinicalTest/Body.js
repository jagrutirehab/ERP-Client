import { Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import React from 'react';
import { capitalizeWords } from '../../../utils/toCapitalize';
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";

Font.register({
    family: "Roboto",
    fonts: [
        {
            src: Roboto,
            fontWeight: "heavy",
        },
    ],
});

const testInfo = [
    { type: 6, name: "CIWA-AR", totalScore: 67 },
    { type: 7, name: "C-SSRS", totalScore: 7 },
    { type: 8, name: "YMRS" },
    {
        type: 9, name: "MPQ-9", totalScore: 24, subScores: [
            {
                label: "Psychoticism",
                key: "Psychoticism"
            },
            {
                label: "Neuroticism",
                key: "Neuroticism"
            },
            {
                label: "Obsessive Compulsive",
                key: "ObsessiveCompulsive"
            },
            {
                label: "Somatization Anxiety",
                key: "SomatizationAnxiety"
            },
            {
                label: "Hysteria",
                key: "Hysteria"
            },
            {
                label: "Depression",
                key: "Depression"
            },

        ]
    },
    {
        type: 10, name: "MMSE", totalScore: 30, subScores: [
            { label: "Orientation", key: "orientation" },
            { label: "Registration", key: "registration" },
            { label: "Attention", key: "attention" },
            { label: "Recall", key: "recall" },
            { label: "Language", key: "language" },
            { label: "Drawing", key: "drawing" },
        ]
    },
    { type: 11, name: "Y-BOCS", totalScore: 40 },
    { type: 12, name: "ACDS", totalScore: 54 },
    { type: 13, name: "HAM-A", totalScore: 56 },
    { type: 14, name: "HAM-D", totalScore: 52 },
    {
        type: 15, name: "PANSS", totalScore: 210, subScores: [
            {
                label: "Positive",
                key: "Positive"
            },
            {
                label: "Negative",
                key: "Negative"
            },
            {
                label: "General",
                key: "General"
            },
            {
                label: "Composite",
                key: "Composite"
            },

        ]
    },
];

const styles = StyleSheet.create({
    pageTitle: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
        textDecoration: 'underline',
    },
    section: {
        marginBottom: 20,
        padding: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    value: {
        marginBottom: 8,
        lineHeight: 1.4,
    },
    score: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    paragraph: {
        marginBottom: 6,
        lineHeight: 1.6,
        textAlign: 'justify',
    },
    divider: {
        height: 1,
        marginVertical: 8,
        backgroundColor: '#000',
    },
    recommendationContainer: {
        marginLeft: 10,
    },
    recommendationItem: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    bullet: {
        marginRight: 8,
        fontSize: 16,
    },
    recommendationText: {
        flex: 1,
        textAlign: 'justify',
    },
});


const Body = ({ clinicalTest, charts }) => {
    const getTestInfo = (testType) => testInfo.find(t => t.type === testType);

    const detailAdmissionChart = charts?.find((chart) => chart.chart === "DETAIL_ADMISSION");

    return (
        <React.Fragment>
            <View>
                <Text style={styles.pageTitle}>CLINICAL TEST REPORT</Text>

                {clinicalTest && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {getTestInfo(clinicalTest.testType)?.name || 'Clinical Test'} Results
                        </Text>

                        <Text style={styles.container}>
                            <Text style={styles.label}>TOTAL SCORE: </Text>
                            <Text style={{ ...styles.score, fontFamily: "Roboto", fontSize: "15px" }}>
                                {`${clinicalTest?.testType === 10 ? clinicalTest?.scores?.total : clinicalTest?.systemTotalScore}${getTestInfo(clinicalTest?.testType).totalScore ? ` / ${getTestInfo(clinicalTest.testType)?.totalScore}` : ''}`}
                            </Text>
                        </Text>
                        {getTestInfo(clinicalTest?.testType)?.subScores && (
                            <View>
                                <Text style={styles.label}>SUB SCORES:</Text>
                                {getTestInfo(clinicalTest?.testType).subScores.map((sub, index) => (
                                    <View key={index} style={styles.recommendationItem}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.value}>
                                            {clinicalTest?.testType === 10
                                                ? `${sub.label}: ${clinicalTest?.scores?.[sub.key] ?? 'N/A'}`
                                                : `${sub.label}: ${clinicalTest?.[sub.key] ?? 'N/A'}`
                                            }
                                        </Text>
                                    </View>
                                ))}
                            </View>
                )}
                <View style={styles.divider} />

                {
                    (clinicalTest?.severity || clinicalTest?.systemSeverity) && (
                        <>
                            <Text style={styles.label}>SEVERITY:</Text>
                            <Text style={styles.value}>
                                {clinicalTest?.severity || clinicalTest?.systemSeverity}
                            </Text>
                            <View style={styles.divider} />
                        </>
                    )
                }


                {detailAdmissionChart?.detailAdmission?.ChiefComplaints && (
                    <>
                        <Text style={styles.label}>CHIEF COMPLAINTS:</Text>
                        <View style={{ marginBottom: 8 }}>
                            {Object.values(detailAdmissionChart.detailAdmission.ChiefComplaints)
                                .filter(line => line && line.trim() !== "")
                                .map((line, idx) => (
                                    <Text key={idx} style={styles.value}>• {capitalizeWords(line)}</Text>
                                ))}
                        </View>
                        <View style={styles.divider} />
                    </>
                )}

                {
                    clinicalTest?.observation && (
                        <>
                            <View>
                                <Text style={styles.label}>OBSERVATIONS:</Text>
                                <Text style={styles.paragraph}>
                                    {capitalizeWords(clinicalTest.observation)}
                                </Text>
                            </View>

                            <View style={styles.divider} />
                        </>
                    )
                }

                {
                    clinicalTest?.systemInterpretation && (
                        <>
                            <View wrap={false}>
                                <Text style={styles.label}>INTERPRETATION:</Text>
                                <Text style={styles.paragraph}>
                                    {capitalizeWords(clinicalTest.systemInterpretation)}
                                </Text>
                            </View>
                            <View style={styles.divider} />
                        </>
                    )
                }
                {
                    clinicalTest?.systemRecommendation && (
                        <View wrap={false}>
                            <Text style={styles.label}>RECOMMENDATION:</Text>
                            <View style={styles.recommendationContainer}>
                                {capitalizeWords(clinicalTest.systemRecommendation).split(/(?<=\.)\s+/).map((sentence, index) => (
                                    <View key={index} style={styles.recommendationItem}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.recommendationText}>
                                            {sentence}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )
                }
            </View>
                )}
        </View>
        </React.Fragment >
    );
};

Body.prototype = {
    clinicalTest: PropTypes.object,
    charts: PropTypes.array,
};

export default Body;