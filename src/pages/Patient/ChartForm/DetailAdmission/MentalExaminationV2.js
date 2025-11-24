import React from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import NextButton from "./NextButton";

const fields = [
    { label: "Appearance & Behavior", name: "", type: "header" },
    {
        label: "Grooming",
        name: "grooming",
        type: "radio",
        options: ["good", "fair", "poor"],
    },
    {
        label: "Eye Contact",
        name: "eyeContact",
        type: "radio",
        options: ["normal", "avoidant", "excessive"],
    },
    {
        label: "Psychomotor Activity",
        name: "psychomotorActivity",
        type: "radio",
        options: ["normal", "retarded", "agitated"],
    },

    { label: "Speech", type: "header" },
    {
        label: "Rate",
        name: "rate",
        type: "radio",
        options: ["normal", "slow", "pressured"],
    },
    {
        label: "Volume",
        name: "volume",
        type: "radio",
        options: ["normal", "low", "loud"],
    },

    { label: "Mood", type: "header" },
    {
        label: "Affect",
        name: "affect",
        type: "radio",
        options: ["euthymic", "depressed", "irritable", "elated"],
    },
    {
        label: "Affect Notes",
        name: "affectNotes",
        type: "text",
    },
    {
        label: "Mood",
        name: "subjective",
        type: "text",
    },
    { label: "Thought", type: "header" },
    {
        label: "Delusions",
        name: "delusions",
        type: "radio",
        options: ["none", "present"],
    },
    {
        label: "Content",
        name: "content",
        type: "text",
    },
    {
        label: "If Delusion Present, Specify",
        name: "delusionNotes",
        type: "text",
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

    { label: "Cognition", type: "header" },
    {
        label: "Orientation",
        name: "orientation",
        type: "radio",
        options: ["time", "place", "person"],
    },

    {
        label: "Memory",
        name: "memory",
        type: "radio",
        options: ["intact", "impaired"],
    },

    { label: "Insight", type: "header" },
    {
        label: "Grade",
        name: "grade",
        type: "select",
        options: ["I", "II", "III", "IV", "V", "VI"],
    },

    { label: "Judgment", type: "header" },
    {
        label: "Judgment",
        name: "judgment",
        type: "radio",
        options: ["intact", "impaired"],
        labelHidden: true

    },

    { label: "Remarks / Impression", type: "header" },
    {
        label: "Remarks",
        name: "remarks",
        type: "text",
        labelHidden: true
    },
];


const MentalExaminationV2 = ({ validation, setFormStep, step }) => {
    return (
        <React.Fragment>
            <div>
                <RenderFields fields={fields} validation={validation} />
            </div>
            <NextButton setFormStep={setFormStep} step={step} />
        </React.Fragment>
    );
};

MentalExaminationV2.propTypes = {};

export default MentalExaminationV2;
