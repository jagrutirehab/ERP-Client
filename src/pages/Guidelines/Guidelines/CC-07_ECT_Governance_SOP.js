import React, { useRef } from "react";
import Cc07EctGovernanceSOP from "./Prints/CC-07_ECT_Governance_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CC-07 — Electroconvulsive Therapy (ECT) Governance SOP";

const Cc07EctGovernanceSOPPage = () => {
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
      <Cc07EctGovernanceSOP ref={printRef} classnames={"hidden print:block"} />
      <Cc07EctGovernanceSOP heading="hidden" />
    </div>
  );
};

export default Cc07EctGovernanceSOPPage;
