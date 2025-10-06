import React, { useRef } from "react";
import BedsideNotesPrint from "./Prints/BedsideNotesPrint";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const BedsideNotesGuidelines = () => {
  const printRef = useRef();

  return (
    <div className="w-100 p-4">
      <div className="bg-white shadow-sm p-2 d-flex align-items-center justify-content-between mb-5">
        <h2 className="mb-0">Bedside Notes Guidelines</h2>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() => handlePrint(printRef)}
          title={`Print Bedside Notes Guidelines`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      <BedsideNotesPrint ref={printRef} classnames={"hidden print:block"} />
      <BedsideNotesPrint heading="hidden" />
    </div>
  );
};

export default BedsideNotesGuidelines;
