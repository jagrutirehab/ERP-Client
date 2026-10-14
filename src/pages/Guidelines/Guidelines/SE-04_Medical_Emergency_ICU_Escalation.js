import React, { useRef } from "react";
import Se04MedicalEmergencyIcuEscalation from "./Prints/SE-04_Medical_Emergency_ICU_Escalation";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "SE-04 — Medical Emergency & ICU Escalation SOP";

const Se04MedicalEmergencyIcuEscalationPage = () => {
  const printRef = useRef();

  return (
    <div className="w-100 p-4">
      <div className="bg-white shadow-sm p-2 d-flex align-items-center justify-content-between mb-5">
        <h2 className="mb-0">{TITLE}</h2>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() => handlePrint(printRef, TITLE)}
          title={`Print ${TITLE}`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      <Se04MedicalEmergencyIcuEscalation ref={printRef} classnames={"hidden print:block"} />
      <Se04MedicalEmergencyIcuEscalation heading="hidden" />
    </div>
  );
};

export default Se04MedicalEmergencyIcuEscalationPage;
