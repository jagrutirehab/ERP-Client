import React, { useRef } from "react";
import Cl09InsomniaDementiaElderly from "./Prints/CL-09_Insomnia_Dementia_Elderly";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-09 — Insomnia & Behavioural Symptoms in Elderly / Dementia Protocol";

const Cl09InsomniaDementiaElderlyPage = () => {
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
      <Cl09InsomniaDementiaElderly ref={printRef} classnames={"hidden print:block"} />
      <Cl09InsomniaDementiaElderly heading="hidden" />
    </div>
  );
};

export default Cl09InsomniaDementiaElderlyPage;
