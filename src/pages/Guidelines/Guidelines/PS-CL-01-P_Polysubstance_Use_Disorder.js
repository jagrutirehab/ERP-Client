import React, { useRef } from "react";
import PsCl01PPolysubstanceUseDisorder from "./Prints/PS-CL-01-P_Polysubstance_Use_Disorder";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "PS-CL-01-P — Pharmacological Protocol: Polysubstance Use Disorder (15-Day Detox | 90-Day Programme)";

const PsCl01PPolysubstanceUseDisorderPage = () => {
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
      <PsCl01PPolysubstanceUseDisorder ref={printRef} classnames={"hidden print:block"} />
      <PsCl01PPolysubstanceUseDisorder heading="hidden" />
    </div>
  );
};

export default PsCl01PPolysubstanceUseDisorderPage;
