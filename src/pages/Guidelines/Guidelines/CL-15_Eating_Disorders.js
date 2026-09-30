import React, { useRef } from "react";
import Cl15EatingDisorders from "./Prints/CL-15_Eating_Disorders";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-15 — Eating Disorders Clinical Management Protocol";

const Cl15EatingDisordersPage = () => {
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
      <Cl15EatingDisorders ref={printRef} classnames={"hidden print:block"} />
      <Cl15EatingDisorders heading="hidden" />
    </div>
  );
};

export default Cl15EatingDisordersPage;
