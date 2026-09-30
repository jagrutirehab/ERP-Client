import React, { useRef } from "react";
import Cl13PTSD from "./Prints/CL-13_PTSD";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-13 — PTSD & Complex PTSD Clinical Management Protocol";

const Cl13PTSDPage = () => {
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
      <Cl13PTSD ref={printRef} classnames={"hidden print:block"} />
      <Cl13PTSD heading="hidden" />
    </div>
  );
};

export default Cl13PTSDPage;
