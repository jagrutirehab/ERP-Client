import React, { useRef } from "react";
import AdmissionDischargePrint from "./Prints/AdmissionDischargePrint";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const AdmissionDischargeGuidelines = () => {
  const printRef = useRef();

  return (
    <div className="w-100 p-4">
      <div className="bg-white shadow-sm p-2 d-flex align-items-center justify-content-between mb-5">
        <h2 className="mb-0">Admission Discharge Guidelines</h2>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() =>
            handlePrint(printRef, "Admission Discharge Guidelines")
          }
          title={`Print Admission Discharge Guidelines`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      <AdmissionDischargePrint
        ref={printRef}
        classnames={"hidden print:block"}
      />
      <AdmissionDischargePrint heading="hidden" />
    </div>
  );
};

export default AdmissionDischargeGuidelines;
