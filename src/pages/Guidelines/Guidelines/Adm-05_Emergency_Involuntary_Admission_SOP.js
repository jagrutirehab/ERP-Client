import React, { useRef } from "react";
import Adm05EmergencyInvoluntarySOP from "./Prints/Adm-05_Emergency_Involuntary_Admission_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Adm-05 — Emergency & Involuntary Admission SOP";

const Adm05EmergencyInvoluntarySOPPage = () => {
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
      <Adm05EmergencyInvoluntarySOP ref={printRef} classnames={"hidden print:block"} />
      <Adm05EmergencyInvoluntarySOP heading="hidden" />
    </div>
  );
};

export default Adm05EmergencyInvoluntarySOPPage;
