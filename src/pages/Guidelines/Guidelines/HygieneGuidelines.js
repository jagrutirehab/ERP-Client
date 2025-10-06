import React, { useRef } from "react";
import HygieneMaintenancePrint from "./Prints/HygienePrint";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const HygieneGuidelines = () => {
  const printRef = useRef();

  return (
    <div className="w-100 p-4">
      <div className="bg-white shadow-sm p-2 d-flex align-items-center justify-content-between mb-5">
        <h2 className="mb-0">Hygiene Guidelines</h2>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() => handlePrint(printRef, "Hygiene Guidelines")}
          title={`Print Hygiene Guidelines`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      <HygieneMaintenancePrint
        ref={printRef}
        classnames={"hidden print:block"}
      />
      <HygieneMaintenancePrint heading="hidden" />
    </div>
  );
};

export default HygieneGuidelines;
