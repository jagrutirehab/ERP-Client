import React, { useRef } from "react";
import Cl11AgitationManagement from "./Prints/CL-11_Agitation_Management";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-11 — Agitation Management in Rehabilitation Settings";

const Cl11AgitationManagementPage = () => {
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
      <Cl11AgitationManagement ref={printRef} classnames={"hidden print:block"} />
      <Cl11AgitationManagement heading="hidden" />
    </div>
  );
};

export default Cl11AgitationManagementPage;
