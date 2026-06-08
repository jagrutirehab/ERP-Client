import React, { useRef } from "react";
import Se03RestraintSeclusionGovernance from "./Prints/SE-03_Restraint_Seclusion_Governance";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "SE-03 — Restraint & Seclusion Governance SOP";

const Se03RestraintSeclusionGovernancePage = () => {
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
      <Se03RestraintSeclusionGovernance ref={printRef} classnames={"hidden print:block"} />
      <Se03RestraintSeclusionGovernance heading="hidden" />
    </div>
  );
};

export default Se03RestraintSeclusionGovernancePage;
