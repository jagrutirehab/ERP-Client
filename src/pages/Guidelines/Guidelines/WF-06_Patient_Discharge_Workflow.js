import React, { useRef } from "react";
import Wf06PatientDischargeWorkflow from "./Prints/WF-06_Patient_Discharge_Workflow";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "WF-06 — Patient Discharge Workflow";

const Wf06PatientDischargeWorkflowPage = () => {
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
      <Wf06PatientDischargeWorkflow ref={printRef} classnames={"hidden print:block"} />
      <Wf06PatientDischargeWorkflow heading="hidden" />
    </div>
  );
};

export default Wf06PatientDischargeWorkflowPage;
