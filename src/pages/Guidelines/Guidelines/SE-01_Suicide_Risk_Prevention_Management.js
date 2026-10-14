import React, { useRef } from "react";
import Se01SuicideRiskPrevention from "./Prints/SE-01_Suicide_Risk_Prevention_Management";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "SE-01 — Suicide Risk Prevention & Management SOP";

const Se01SuicideRiskPreventionPage = () => {
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
      <Se01SuicideRiskPrevention ref={printRef} classnames={"hidden print:block"} />
      <Se01SuicideRiskPrevention heading="hidden" />
    </div>
  );
};

export default Se01SuicideRiskPreventionPage;
