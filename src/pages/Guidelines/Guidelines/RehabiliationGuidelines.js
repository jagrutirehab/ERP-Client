import React, { useRef } from "react";
import RehabilitationGuidelinesPrint from "./Prints/RehabPrint";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const RehabiliationGuidelines = () => {
  const printRef = useRef();

  return (
    <div className="w-100 p-4">
      <div className="bg-white shadow-sm p-2 d-flex align-items-center justify-content-between mb-5">
        <h2 className="mb-0">Rehabilitation Centre Guidelines</h2>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() =>
            handlePrint(printRef, "Rehabilitation Centre Guidelines")
          }
          title={`Print Rehabilitation Centre Guidelines`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      <RehabilitationGuidelinesPrint
        ref={printRef}
        classnames={"hidden print:block"}
      />
      <RehabilitationGuidelinesPrint heading="hidden" />
    </div>
  );
};

export default RehabiliationGuidelines;
