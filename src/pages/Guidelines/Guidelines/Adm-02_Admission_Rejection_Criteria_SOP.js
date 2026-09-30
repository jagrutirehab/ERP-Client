import React, { useRef } from "react";
import Adm02RejectionCriteriaSOP from "./Prints/Adm-02_Admission_Rejection_Criteria_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Adm-02 — Admission Rejection & Referral Criteria SOP";

const Adm02RejectionCriteriaSOPPage = () => {
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
      <Adm02RejectionCriteriaSOP ref={printRef} classnames={"hidden print:block"} />
      <Adm02RejectionCriteriaSOP heading="hidden" />
    </div>
  );
};

export default Adm02RejectionCriteriaSOPPage;
