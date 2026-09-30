import React, { useRef } from "react";
import Adm03LabInvestigationsSOP from "./Prints/Adm-03_Admission_Lab_Investigations_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Adm-03 — Admission Laboratory Investigations SOP";

const Adm03LabInvestigationsSOPPage = () => {
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
      <Adm03LabInvestigationsSOP ref={printRef} classnames={"hidden print:block"} />
      <Adm03LabInvestigationsSOP heading="hidden" />
    </div>
  );
};

export default Adm03LabInvestigationsSOPPage;
