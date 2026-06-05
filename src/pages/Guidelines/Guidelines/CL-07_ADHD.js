import React, { useRef } from "react";
import Cl07ADHD from "./Prints/CL-07_ADHD";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-07 — ADHD Assessment & Management Protocol";

const Cl07ADHDPage = () => {
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
      <Cl07ADHD ref={printRef} classnames={"hidden print:block"} />
      <Cl07ADHD heading="hidden" />
    </div>
  );
};

export default Cl07ADHDPage;
