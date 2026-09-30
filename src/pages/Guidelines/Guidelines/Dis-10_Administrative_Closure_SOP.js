import React, { useRef } from "react";
import Dis10AdministrativeClosureSOP from "./Prints/Dis-10_Administrative_Closure_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Dis-10 — Administrative Closure SOP";

const Dis10AdministrativeClosureSOPPage = () => {
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
      <Dis10AdministrativeClosureSOP ref={printRef} classnames={"hidden print:block"} />
      <Dis10AdministrativeClosureSOP heading="hidden" />
    </div>
  );
};

export default Dis10AdministrativeClosureSOPPage;
