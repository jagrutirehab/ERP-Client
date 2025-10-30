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
    { type: 6, name: "CIWA-AR: Clinical Institute Withdrawal Assessment for Alcohol, Revised", totalScore: 67 },
    { type: 7, name: "C-SSRS: Columbia–Suicide Severity Rating Scale", totalScore: 7 },
    { type: 8, name: "YMRS: Young Mania Rating Scale" },
    {
        type: 9, name: "MPQ-9: Multidimensional Personality Questionnaire", totalScore: 24, subScores: [
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
        type: 10, name: "MMSE: Mini-Mental State Examination", totalScore: 30, subScores: [
            { label: "Orientation", key: "orientation" },
            { label: "Registration", key: "registration" },
            { label: "Attention", key: "attention" },
            { label: "Recall", key: "recall" },
            { label: "Language", key: "language" },
            { label: "Drawing", key: "drawing" },
        ]
    },
    { type: 11, name: "Y-BOCS: Yale–Brown Obsessive–Compulsive Scale", totalScore: 40 },
    { type: 12, name: "ACDS: Adult ADHD Clinical Diagnostic Scale", totalScore: 54 },
    { type: 13, name: "HAM-A: Hamilton Anxiety Rating Scale", totalScore: 56 },
    { type: 14, name: "HAM-D: Hamilton Depression Rating Scale", totalScore: 52 },
    {
        type: 15, name: "PANSS: Positive and Negative Syndrome Scale", totalScore: 210, subScores: [
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
    recommendationText: {
        flex: 1,
        textAlign: 'justify',
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    bullet: {
        marginRight: 8,
        fontSize: 16,
    },
});


const formatRecommendationsPDF = (text, testType) => {
    if (!text) return [<Text key="none">No Recommendation</Text>];

    const placeholderMap = {
        "e.g.": "___eg___",
        "i.e.": "___ie___",
        "etc.": "___etc___",
        "vs.": "___vs___",
    };

    let safeText = text;
    for (const [abbr, placeholder] of Object.entries(placeholderMap)) {
        safeText = safeText.replaceAll(abbr, placeholder);
    }

    // Try numbered bullets first
    let parts = safeText.split(/(?=\d+\.\s)/);

    // If no numbered bullets, split by sentence
    if (parts.length === 1) {
        parts = safeText.match(/[^.!?]+[.!?]+(\s|$)/g) || [safeText];
    }

    return parts.map((line, idx) => {
        let restored = line.trim();
        for (const [abbr, placeholder] of Object.entries(placeholderMap)) {
            restored = restored.replaceAll(placeholder, abbr);
        }

        const lineText = restored.replace(/^\d+\.\s*/, "").trim();

        let content;
        //  Hightlight Impairment & moderate in MMSE
        if (testType === 10) {
            content = lineText.split(/(impairment|moderate)/gi).map((part, i) => {
                const cap = capitalizeWords(part);
                return part.toLowerCase() === "impairment" || part.toLowerCase() === "moderate"
                    ? <Text key={i} style={{ fontWeight: 'bold', fontFamily: "Roboto" }}>{cap}</Text>
                    : cap;
            });
        } else {
            content = capitalizeWords(lineText);
        }

        return (
            <View style={styles.bulletItem} key={idx}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.recommendationText}>{content}</Text>
            </View>
        );
    });
};





const Body = ({ clinicalTest, charts }) => {
    const getTestInfo = (testType) => testInfo.find(t => t.type === testType);

    const chiefComplaints = charts?.find((chart) => chart.chart === "DETAIL_ADMISSION")?.detailAdmission?.ChiefComplaints;
    const filteredChiefComplaints = chiefComplaints
        ? Object.values(chiefComplaints).filter(line => line && line.trim() !== "")
        : [];


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
                                    <View key={index} style={styles.bulletItem}>
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


                        {filteredChiefComplaints.length > 0 && (
                            <>
                                <Text style={styles.label}>CHIEF COMPLAINTS:</Text>
                                <View style={{ marginBottom: 8 }}>
                                    {filteredChiefComplaints.map((line, idx) => (
                                        <View style={styles.bulletItem} key={idx}>
                                            <Text style={styles.bullet}>•</Text>
                                            <Text style={styles.value}>{capitalizeWords(line)}</Text>
                                        </View>
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
                            (clinicalTest?.systemInterpretation || clinicalTest?.interpretation) && (
                                <>
                                    <View wrap={false}>
                                        <Text style={styles.label}>INTERPRETATION:</Text>
                                        <Text style={styles.paragraph}>
                                            {/* Hightlight Impairment & moderate in MMSE */}
                                            {clinicalTest?.testType === 10 ? (
                                                clinicalTest.interpretation
                                                    .split(/(impairment|moderate)/gi)
                                                    .map((part, index) => {
                                                        const text = capitalizeWords(part);
                                                        const isHighlight =
                                                            part.toLowerCase() === 'impairment' || part.toLowerCase() === 'moderate';
                                                        return (
                                                            <Text
                                                                key={index}
                                                                style={isHighlight ? { fontWeight: 'bold', fontFamily: "Roboto" } : {}}
                                                            >
                                                                {text}
                                                            </Text>
                                                        );
                                                    })
                                            ) : (
                                                <Text>{capitalizeWords(clinicalTest.systemInterpretation || clinicalTest?.interpretation)}</Text>
                                            )}
                                        </Text>

                                    </View>
                                    <View style={styles.divider} />
                                </>
                            )
                        }
                        {
                            (clinicalTest?.systemRecommendation || clinicalTest?.recommendation) && (
                                <View wrap={false}>
                                    <Text style={styles.label}>RECOMMENDATION:</Text>
                                    <View style={styles.recommendationContainer}>
                                        {formatRecommendationsPDF(clinicalTest.systemRecommendation || clinicalTest?.recommendation, clinicalTest?.testType)}
                                    </View>
                                </View>
                            )
                        }
                        <View style={{ marginTop: 16 }}>
                            <View style={styles.divider} />
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: "#555",
                                    textAlign: "justify",
                                    marginTop: 4,
                                    fontStyle: "italic",
                                }}
                            >
                                Note: This Report Is To Be Used For Professional And Clinical Use Only. It Is Not To Be Used For Legal Purposes.
                                The Results Shall Be Discussed And Interpreted By Professionals Only. Results Are Subject To The Individual’s
                                Performance On The Given Day. Kindly Correlate Clinically.
                            </Text>
                        </View>
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