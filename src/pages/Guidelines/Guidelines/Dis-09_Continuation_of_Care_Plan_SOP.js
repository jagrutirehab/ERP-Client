import React, { useRef } from "react";
import Dis09ContinuationOfCarePlanSOP from "./Prints/Dis-09_Continuation_of_Care_Plan_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Dis-09 — Continuation of Care Plan SOP";

const Dis09ContinuationOfCarePlanSOPPage = () => {
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
      <Dis09ContinuationOfCarePlanSOP ref={printRef} classnames={"hidden print:block"} />
      <Dis09ContinuationOfCarePlanSOP heading="hidden" />
    </div>
  );
};

export default Dis09ContinuationOfCarePlanSOPPage;
