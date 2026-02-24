import React, { useEffect, useState } from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import { Button } from "reactstrap";
import { getICDCodes } from "../../../../helpers/backend_helper";

const DoctorSignature = ({ validation, closeForm }) => {

  const [icdOptions, setIcdOptions] = useState([]);

  useEffect(() => {
    const loadICD = async () => {
      try {
        const res = await getICDCodes();
        console.log("res", res);

        const formatted = res?.map(icd => ({
          value: icd._id,
          label: `${icd.code} - ${icd.text}`,
        }));

        setIcdOptions(formatted);

      } catch (err) {
        console.log(err);
      }
    };

    loadICD();
  }, []);

  const fields = [
    {
      label: "Provisional Diagnosis",
      name: "provisionaldiagnosis",
      type: "select2",
      isMulti: true,
      options: icdOptions,
    },
    {
      label: "Final Diagnosis",
      name: "diagnosis",
      type: "select2",
      isMulti: true,
      options: icdOptions,
    },
    {
      label: "Managment Plan: (INDOOR / Out Patient)",
      name: "managmentPlan",
      type: "text",
    },
    {
      label: "Investigations",
      name: "investigation",
      type: "checkbox",
      options: ["CBC", "BSL", "LFT", "RFT", "HIV", "TFT", "VIT B-12", "VIT D3"],
    },
    {
      label: "Special Test",
      name: "specialTest",
      type: "text",
    },
    {
      label: "Psychological Testing",
      name: "treatment",
      type: "text",
    },
  ];

  return (
    <>
      <RenderFields fields={fields} validation={validation} />
      <div className="mt-3 d-flex gap-3 justify-content-end">
        <Button onClick={closeForm} size="sm" color="danger" type="button">
          Cancel
        </Button>
        <Button size="sm" type="submit">
          Save
        </Button>
      </div>
    </>
  );
};

export default DoctorSignature;