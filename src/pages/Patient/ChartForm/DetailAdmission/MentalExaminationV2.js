import React, { useState } from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import NextButton from "./NextButton";

const fields = [
  { label: "Appearance & Behavior", type: "header" },
  {
    label: "Grooming",
    name: "grooming",
    type: "radio",
    options: ["good", "fair", "poor"],
    required: true,
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
      { label: "Poor", value: "poor" },
    ],
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
      { label: "Hallucinatory Behaviour", value: "hallucinatory_behaviour" },
      { label: "Aggressive", value: "aggressive" },
    ],
    required: true,
  },
  {
    label: "Eye Contact",
    name: "eyeContact",
    type: "radio",
    options: ["normal", "avoidant", "excessive"],
    required: true,
  },
  {
    label: "Rapport",
    name: "rapport",
    type: "radio",
    options: [
      { label: "Established with ease", value: "established_with_ease" },
      {
        label: "Established with difficulty",
        value: "established_with_difficulty",
      },
      { label: "Not established", value: "not_established" },
    ],
    required: true,
  },

  { label: "Speech", type: "header" },
  {
    label: "Rate",
    name: "rate",
    type: "radio",
    options: ["normal", "slow", "pressured"],
    required: true,
  },
  {
    label: "Tone",
    name: "tone",
    type: "radio",
    options: ["normal", "increased", "decreased"],
  },
  {
    label: "Volume",
    name: "volume",
    type: "radio",
    options: ["normal/audible", "low/soft", "loud"],
    required: true,
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
    label: "Relevance",
    name: "relevance",
    type: "radio",
    options: ["relevant", "irrelevant"],
    required: true,
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
    label: "Coherence",
    name: "coherence",
    type: "radio",
    options: ["coherent", "incoherent"],
    required: true,
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
    label: "Subjective Mood (In client's own words / Verbatim)",
    name: "subjective",
    type: "textarea",
  },

  { label: "Affect", type: "header" },
  {
    label: "Quality",
    name: "quality",
    type: "radio",
    options: [
      "dysphoric",
      "anxious",
      "irritable",
      "perplexed",
      "elevated",
      "euphoric",
      "elated",
      "exalted",
      "ecstatic",
      "euthymic",
    ],
    required: true,
  },
  {
    label: "Intensity of Affect",
    name: "intensity",
    type: "radio",
    options: ["shallow", "blunted", "flat"],
  },
  {
    label: "Mobility of Affect",
    name: "mobility",
    type: "radio",
    options: ["intact", "constricted", "fixed", "labile"],
    required: true,
  },
  {
    label: "Range",
    name: "range",
    type: "radio",
    options: ["full", "constricted"],
  },
  {
    label: "Reactivity",
    name: "reactivity",
    type: "radio",
    options: ["present", "absent"],
    required: true,
  },
  {
    label: "Appropriateness",
    name: "appropriateness2",
    type: "radio",
    options: [
      {
        label: "Appropriate to the setting",
        value: "appropriate_to_the_setting",
      },
      {
        label: "Inappropriate to the setting",
        value: "inappropriate_to_the_setting",
      },
    ],
  },
  {
    label: "Congruence",
    name: "congruence",
    type: "radio",
    options: [
      { label: "Congruent to mood", value: "congruent_to_mood" },
      { label: "Incongruent to mood", value: "incongruent_to_mood" },
    ],
    required: true,
  },
  {
    label: "Affect Notes",
    name: "affectNotes",
    type: "textarea",
  },

  { label: "Thought", type: "header" },
  {
    label: "Form of Thought",
    name: "formOfThought",
    type: "radio",
    options: [
      { label: "Normal / Goal directed", value: "normal" },
      {
        label: "Loosening of associations",
        value: "loosening_of_associations",
      },
      { label: "Flight of ideas", value: "flight_of_ideas" },
      { label: "Thought blocking", value: "thought_blocking" },
      { label: "Perseveration", value: "perseveration" },
      { label: "Circumstantial", value: "circumstantial" },
      { label: "Tangential", value: "tangential" },
    ],
    required: true,
  },
  {
    label: "Thought Process",
    name: "process",
    type: "textarea",
  },
  {
    label: "Delusions",
    name: "delusions",
    type: "radio",
    options: ["none", "present"],
    required: true,
  },
  {
    label: "Thought Content",
    name: "content",
    type: "textarea",
  },
  {
    label: "If Delusion Present, Specify",
    name: "delusionNotes",
    type: "textarea",
    showIf: {
      field: "delusions",
      value: "present",
    },
  },

  { label: "Perception", type: "header" },
  {
    label: "Perception",
    name: "perception",
    type: "radio",
    options: ["normal", "hallucination", "illusion"],
    // labelHidden: true,
    required: true,
  },
  {
    label: "Perception Notes",
    name: "perceptionNotes",
    type: "textarea",
  },
  { label: "Cognition", type: "header" },
  {
    type: "group",
    left: [
      {
        label: "Time",
        name: "orientationTime",
        type: "radio",
        options: ["Intact", "Impaired"],
        required: true,
      },
      {
        label: "Place",
        name: "orientationPlace",
        type: "radio",
        options: ["Intact", "Impaired"],
        required: true,
      },
      {
        label: "Person",
        name: "orientationPerson",
        type: "radio",
        options: ["Intact", "Impaired"],
        required: true,
      },
      {
        label: "Immediate Memory",
        name: "immediateMemory",
        type: "radio",
        options: ["Intact", "Impaired"],
        required: true,
      },
      {
        label: "Recent Memory",
        name: "recentMemory",
        type: "radio",
        options: ["Intact", "Impaired"],
        required: true,
      },
      {
        label: "Remote Memory",
        name: "remoteMemory",
        type: "radio",
        options: ["Intact", "Impaired"],
        required: true,
      },
    ],
    right: [
      {
        label: "Attention",
        name: "attention",
        type: "radio",
        options: [
          { label: "Easily Distractible", value: "easily_distractible" },
          { label: "Attention Maintained", value: "attention_maintained" },
          {
            label: "Disturbance in Attention",
            value: "disturbance_in_attention",
          },
        ],
      },
      {
        label: "Concentration",
        name: "concentration",
        type: "radio",
        options: [
          {
            label: "Able to Concentrate and Focus",
            value: "able_to_concentrate_and_focus",
          },
          {
            label: "Unable to Concentrate and Focus",
            value: "unable_to_concentrate_and_focus",
          },
        ],
      },
    ],
  },
  { label: "Insight", type: "header" },
  {
    label: "Grade",
    name: "grade",
    type: "select2",
    options: [
      {
        label: "Grade 1 - Complete Denial of Illness",
        value: "grade_1-_complete_denial_of_illness",
      },
      {
        label: "Grade 2 - Slight Awareness But Still Denying",
        value: "grade_2-_slight_awareness_byt_still_denying",
      },
      {
        label:
          "Grade 3 - Awareness of Being Sick, But Blaming External Factors",
        value: "grade_3-_awareness_of_being_sick_but_blaming_external_factors",
      },
      {
        label:
          "Grade 4 - Aware Something Is Wrong And Self Is Involved, But Feels Helpless And Attributes It To Unknown/Organic Factors.",
        value:
          "grade_4-_aware_something_is_wrong_and_self_is_involved,_but_feels_helpless_and_attributes_it_to_unknown/organic_factors",
      },
      {
        label:
          "Grade 5 - Understands They're Contributing To the Issue But Has No Clue How To Fix It.",
        value:
          "grade_5-_understands_they're_contributing_to_the_issue_but_has_no_clue_how_to_fix_it",
      },
      {
        label:
          "Grade 6 - Fully Aware Of The Problem, Accepts Responsibility, And Is Willing To Take Help And Make Changes.",
        value:
          "grade_6-_fully_aware_of_the_problem,_accepts_responsibility,_and_willing_to_help_and_make_changes",
      },
    ],
    // labelHidden: true,
    required: true,
  },

  { label: "Judgment", type: "header" },
  {
    label: "Judgment",
    name: "judgment",
    type: "radio",
    options: ["intact", "partial", "impaired"],
    // labelHidden: true,
    required: true,
  },

  { label: "Remarks / Impression", type: "header" },
  {
    label: "Remarks",
    name: "remarks",
    type: "textarea",
    labelHidden: true,
  },
];

const MentalExaminationV3 = ({ validation, setFormStep, step }) => {
  const [attempted, setAttempted] = useState(false);

  const requiredFields = [
    "grooming",
    "psychomotorActivity",
    "eyeContact",
    "rapport",
    "rate",
    "volume",
    "relevance",
    "coherence",
    "quality",
    "reactivity",
    "mobility",
    "congruence",
    "delusions",
    "formOfThought",
    "perception",
    "orientationTime",
    "orientationPlace",
    "orientationPerson",
    "immediateMemory",
    "recentMemory",
    "remoteMemory",
    "grade",
    "judgment",
  ];

  const validate = () => {
    setAttempted(true);
    const missingFields = requiredFields.filter((f) => !validation.values[f]);
    console.log("Missing MSE fields:", missingFields);
    console.log("Current values:", validation.values);
    return missingFields.length === 0;
  };

  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />
        {attempted && (
          <p className="text-danger small">
            Please fill in all required fields before continuing.
          </p>
        )}
      </div>
      <NextButton
        setFormStep={setFormStep}
        step={step}
        onBeforeNext={validate}
      />
    </React.Fragment>
  );
};

MentalExaminationV3.propTypes = {};

export default MentalExaminationV3;
