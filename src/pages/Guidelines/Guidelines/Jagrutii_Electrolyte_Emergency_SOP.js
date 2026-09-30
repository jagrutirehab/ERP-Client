import React, { useRef } from "react";
import JagrutiiElectrolyteEmergencySOP from "./Prints/Jagrutii_Electrolyte_Emergency_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Jagrutii SOP — Electrolyte Emergency Management";

const JagrutiiElectrolyteEmergencySOPPage = () => {
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
      <JagrutiiElectrolyteEmergencySOP ref={printRef} classnames={"hidden print:block"} />
      <JagrutiiElectrolyteEmergencySOP heading="hidden" />
    </div>
  );
};

export default JagrutiiElectrolyteEmergencySOPPage;
