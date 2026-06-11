import React, { useRef } from "react";
import Cl05CAlcoholCounsellingProgramme from "./Prints/CL-05-C_Alcohol_Counselling_Programme";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-05-C — Counselling & Psychosocial Programme: Alcohol De-Addiction (12-Day Detox | 45-Day Programme)";

const Cl05CAlcoholCounsellingProgrammePage = () => {
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
      <Cl05CAlcoholCounsellingProgramme ref={printRef} classnames={"hidden print:block"} />
      <Cl05CAlcoholCounsellingProgramme heading="hidden" />
    </div>
  );
};

export default Cl05CAlcoholCounsellingProgrammePage;
