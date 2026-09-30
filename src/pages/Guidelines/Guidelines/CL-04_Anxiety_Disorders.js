import React, { useRef } from "react";
import Cl04AnxietyDisorders from "./Prints/CL-04_Anxiety_Disorders";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-04 — Anxiety Disorders Clinical Management Protocol";

const Cl04AnxietyDisordersPage = () => {
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
      <Cl04AnxietyDisorders ref={printRef} classnames={"hidden print:block"} />
      <Cl04AnxietyDisorders heading="hidden" />
    </div>
  );
};

export default Cl04AnxietyDisordersPage;
