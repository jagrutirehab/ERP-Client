import React, { useRef } from "react";
import Wf03PsychologistOnDutyWorkflow from "./Prints/WF-03_Psychologist_On_Duty_Workflow";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "WF-03 — Clinical Psychologist On-Duty Workflow";

const Wf03PsychologistOnDutyWorkflowPage = () => {
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
      <Wf03PsychologistOnDutyWorkflow ref={printRef} classnames={"hidden print:block"} />
      <Wf03PsychologistOnDutyWorkflow heading="hidden" />
    </div>
  );
};

export default Wf03PsychologistOnDutyWorkflowPage;
