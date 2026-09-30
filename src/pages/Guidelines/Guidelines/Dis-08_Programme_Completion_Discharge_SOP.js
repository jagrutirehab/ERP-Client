import React, { useRef } from "react";
import Dis08ProgrammeCompletionDischargeSOP from "./Prints/Dis-08_Programme_Completion_Discharge_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Dis-08 — Programme Completion Discharge SOP";

const Dis08ProgrammeCompletionDischargeSOPPage = () => {
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
      <Dis08ProgrammeCompletionDischargeSOP ref={printRef} classnames={"hidden print:block"} />
      <Dis08ProgrammeCompletionDischargeSOP heading="hidden" />
    </div>
  );
};

export default Dis08ProgrammeCompletionDischargeSOPPage;
