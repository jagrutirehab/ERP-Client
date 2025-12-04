import React from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import NextButton from "./NextButton";

const fields = [
    { label: "Appearance & Behavior", type: "header" },
    {
        label: "Grooming",
        name: "grooming",
        type: "radio",
        options: ["good", "fair", "poor"],
    },
    {
        label: "General Appearance",
        name: "generalAppearance",
        type: "radio",
        options: [
            { label: "Kempt", value: "kempt" },
            { label: "Unkempt and untidy", value: "unkempt_and_untidy" },
            { label: "Overtly made up", value: "overtly_made_up" },
            { label: "Fair", value: "fair" },
            { label: "Poor", value: "poor" }
        ]
    },
    {
        label: "In Touch With Surroundings",
        name: "surroundingTouch",
        type: "radio",
        options: ["present", "partial", "absent"],
    },
    {
        label: "Psychomotor Activity",
        name: "psychomotorActivity",
        type: "radio",
        options: [
            { label: "Normal", value: "normal" },
            { label: "Retarded", value: "retarded" },
            { label: "Hyperactive", value: "hyperactive" },
            { label: "Agitated", value: "agitated" },
            { label: "Mannerisms", value: "mannerisms" },
            { label: "Restless", value: "restless" },
            { label: "Grimace", value: "grimace" },
            { label: "Hallucinatory Behaviour", value: "hallucinatory_behaviour" },
            { label: "Silly Smiling", value: "silly_smiling" },
            { label: "Aggressive", value: "aggressive" }
        ]
    },
    {
        label: "Eye Contact",
        name: "eyeContact",
        type: "radio",
        options: ["normal", "avoidant", "excessive"],
    },

    { label: "Speech", type: "header" },
    {
        label: "Rate",
        name: "rate",
        type: "radio",
        options: ["normal", "slow", "pressured"],
    },
    {
        label: "Tone",
        name: "tone",
        type: "radio",
        options: ["increased", "decreased"],
    },
    {
        label: "Volume",
        name: "volume",
        type: "radio",
        options: ["normal/audible", "low/soft", "loud"],
    },
    {
        label: "Reaction Time",
        name: "reactionTime",
        type: "radio",
        options: [
            { label: "Increased Reaction Time", value: "increased" },
            { label: "Decreased Reaction Time", value: "decreased" },
        ],
    },
    {
        label: "Productivity",
        name: "productivity",
        type: "radio",
        options: [
            { label: "Increased Productivity", value: "increased" },
            { label: "Decreased Productivity", value: "decreased" },
        ],
    },
    {
        label: "Speed",
        name: "speed",
        type: "radio",
        options: [
            { label: "Slow", value: "slow" },
            { label: "Rapid", value: "rapid" },
            { label: "Pressure Of Speech", value: "pressure_of_speech" },
        ],
    },
    {
        label: "Relevance",
        name: "relevance",
        type: "radio",
        options: ["relevant", "irrelevant"],
    },
    {
        label: "Coherence",
        name: "coherence",
        type: "radio",
        options: ["coherent", "incoherent"],
    },
    {
        label: "Goal Direction",
        name: "goalDirection",
        type: "radio",
        options: [
            { label: "Goal Directed", value: "goal_directed" },
            { label: "Non Goal Directed", value: "non_goal_directed" },
        ],
    },

    { label: "Mood", type: "header" },
    {
        label: "Objective Mood",
        name: "objective",
        type: "textarea",
    },
    {
        label: "Subjective Mood",
        name: "subjective",
        type: "textarea",
    },
    {
        label: "Lability",
        name: "lability",
        type: "radio",
        options: ["present", "absent"],
    },
    {
        label: "Appropriateness",
        name: "appropriateness1",
        type: "text",
    },

    { label: "Affect", type: "header" },
    {
        label: "Affect",
        name: "affect",
        type: "radio",
        options: ["euthymic", "depressed", "irritable", "elated"],
    },
    {
        label: "Affect Notes",
        name: "affectNotes",
        type: "textarea",
    },
    {
        label: "Quality",
        name: "quality",
        type: "radio",
        options: [
            "dysphoric",
            "anxious",
            "irritable",
            "depressed",
            "elevated",
            "euphoric",
            "elated",
            "exalted",
            "ecstatic",
            "euthymic"
        ],
    },
    {
        label: "Intensity of Affect",
        name: "intensity",
        type: "radio",
        options: ["shallow", "blunted", "flat"]
    },
    {
        label: "Mobility of Affect",
        name: "mobility",
        type: "radio",
        options: ["constricted", "fixed", "labile "]
    },
    {
        label: "Range",
        name: "range",
        type: "radio",
        options: ["full", "constricted"]
    },
    {
        label: "Reactivity",
        name: "reactivity",
        type: "radio",
        options: ["present", "absent"]
    },
    {
        label: "Communicability",
        name: "communicability",
        type: "radio",
        options: ["present", "absent"]
    },
    {
        label: "Diurnal Variation of Affect",
        name: "diurnalVariation",
        type: "radio",
        options: [
            { label: "Worse in Morning", value: "worse_in_morning" },
            { label: "Worse in Evening", value: "worse_in_evening" },
        ]
    },
    {
        label: "Appropriateness",
        name: "appropriateness2",
        type: "text"
    },


    { label: "Thought", type: "header" },

    {
        label: "Delusions",
        name: "delusions",
        type: "radio",
        options: ["none", "present"],
    },
    {
        label: "Thought Content",
        name: "content",
        type: "textarea",
    },
    {
        label: "Thought Process",
        name: "process",
        type: "textarea",
    },
    {
        label: "If Delusion Present, Specify",
        name: "delusionNotes",
        type: "textarea",
        showIf: {
            field: "delusions",
            value: "present"
        }
    },

    { label: "Perception", type: "header" },
    {
        label: "Perception",
        name: "perception",
        type: "radio",
        options: ["normal", "hallucination", "illusion"],
        labelHidden: true
    },
    {
        label: "Perception Notes",
        name: "perceptionNotes",
        type: "textarea",
    },

    { label: "Cognition", type: "header" },
    {
        label: "Orientation",
        name: "orientation",
        type: "checkbox",
        options: ["time", "place", "person"],
    },
    {
        label: "Attention",
        name: "attention",
        type: "radio",
        options: [
            { label: "Easily Distractible", value: "easily_distractible" },
            { label: "Attention Maintained", value: "attention_maintained" },
            { label: "Disturbance in Attention", value: "disturbance_in_attention" }
        ]
    },
    {
        label: "Concentration",
        name: "concentration",
        type: "radio",
        options: [
            { label: "Able to Concentrate and Focus", value: "able_to_concentrate_and_focus" },
            { label: "Unable to Concentrate and Focus", value: "unable_to_concentrate_and_focus" }
        ]
    },
    {
        label: "Memory",
        name: "memory",
        type: "radio",
        options: ["intact", "partial", "impaired"],
    },

    { label: "Insight", type: "header" },
    {
        label: "Grade",
        name: "grade",
        type: "select",
        options: [
            { label: "Grade 1 - Complete Denial of Illness", value: "grade_1-_complete_denial_of_illness" },
            { label: "Grade 2 - Slight Awareness But Still Denying", value: "grade_2-_slight_awareness_byt_still_denying" },
            { label: "Grade 3 - Awareness of Being Sick, But Blaming External Factors", value: "grade_3-_awareness_of_being_sick_but_blaming_external_factors" },
            { label: "Grade 4 - Intellectual insight", value: "grade_4-_intellectual_insight" },
            { label: "Grade 5 - True emotional insight", value: "grade_5-_true_emotional_insight" }
        ],
        labelHidden: true
    },

    { label: "Judgment", type: "header" },
    {
        label: "Judgment",
        name: "judgment",
        type: "radio",
        options: ["intact", "partial", "impaired",],
        labelHidden: true

    },

    { label: "Remarks / Impression", type: "header" },
    {
        label: "Remarks",
        name: "remarks",
        type: "textarea",
        labelHidden: true
    },
];


const MentalExaminationV3 = ({ validation, setFormStep, step }) => {
    return (
        <React.Fragment>
            <div>
                <RenderFields fields={fields} validation={validation} />
            </div>
            <NextButton setFormStep={setFormStep} step={step} />
        </React.Fragment>
    );
};

MentalExaminationV3.propTypes = {};

export default MentalExaminationV3;
