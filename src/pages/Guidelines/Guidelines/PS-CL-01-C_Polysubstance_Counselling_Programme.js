import React, { useRef } from "react";
import PsCl01CPolysubstanceCounsellingProgramme from "./Prints/PS-CL-01-C_Polysubstance_Counselling_Programme";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "PS-CL-01-C — Counselling & Psychosocial Programme: Polysubstance Use Disorder (15-Day Detox | 90-Day Programme)";

const PsCl01CPolysubstanceCounsellingProgrammePage = () => {
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
      <PsCl01CPolysubstanceCounsellingProgramme ref={printRef} classnames={"hidden print:block"} />
      <PsCl01CPolysubstanceCounsellingProgramme heading="hidden" />
    </div>
  );
};

export default PsCl01CPolysubstanceCounsellingProgrammePage;
