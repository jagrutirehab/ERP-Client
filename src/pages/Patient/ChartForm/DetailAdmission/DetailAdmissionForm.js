import React from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import NextButton from "./NextButton";

const fields = [
  {
    label: "Patient Age",
    name: "age",
    type: "number",
  },
  {
    label: "Doctor Consultant",
    name: "doctorConsultant",
    type: "text",
  },
  {
    label: "Religion",
    name: "religion",
    type: "text",
  },
  {
    label: "Marital Status",
    name: "maritalStatus",
    type: "select",
    options: [
      "Single",
      "Married",
      "Widowed",
      "Separated",
      "Divorced",
      "Desetered",
    ],
  },
  {
    label: "Blood Group",
    name: "bloodGroup",
    type: "text",
  },
  {
    label: "Occupation",
    name: "occupation",
    type: "select",
    options: [
      "Not applicable",
      "Not Occupied",
      "Professional",
      "Service",
      "Business",
      "H.W",
      "Vendor",
      "Farmer",
      "Student",
      "Unemployed",
      "Retired",
      "Disability",
      "Pension",
      "Housemaid",
      "Bara Balutedar",
      "Others",
    ],
  },
  {
    label: "Education",
    name: "education",
    type: "select",
    options: [
      "No formal Education",
      "Primary",
      "Secondary",
      "S.S.C",
      "College",
      "Graduate",
      "P.G",
      "Professional",
      "Technical",
      "Others",
    ],
  },
  {
    label: "Address",
    name: "address",
    type: "select",
    options: ["Urban", "Semi-urban", "Rural"],
  },
  {
    label: "Source of referral",
    name: "referral",
    type: "select",
    options: [
      "Self",
      "Family Member",
      "Friend",
      "Neighbour",
      "Villager",
      "G.P. (ALO)",
      "G.P (Ayur, Homeo)",
      "Specialist",
      "Psychiatrist",
      "Employer",
      "Institution",
      "Court",
      "Other Hospital",
      "Para Medicals",
      "Others",
    ],
  },
  {
    label: "Provisional Diagnosis",
    name: "provisionalDiagnosis",
    type: "text",
  },
  {
    label: "Revised Diagnosis",
    name: "revisedDiagnosis",
    type: "text",
  },
];

const DetailAdmissionForm = ({ validation, setFormStep, step }) => {
  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />
      </div>
      <NextButton setFormStep={setFormStep} step={step} />
    </React.Fragment>
  );
};

DetailAdmissionForm.propTypes = {};

export default DetailAdmissionForm;
