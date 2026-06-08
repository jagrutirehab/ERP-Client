import React, { useRef } from "react";
import Se02ViolenceAggressionManagement from "./Prints/SE-02_Violence_Aggression_Management";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "SE-02 — Violence & Aggression Prevention & Management SOP";

const Se02ViolenceAggressionManagementPage = () => {
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
      <Se02ViolenceAggressionManagement ref={printRef} classnames={"hidden print:block"} />
      <Se02ViolenceAggressionManagement heading="hidden" />
    </div>
  );
};

export default Se02ViolenceAggressionManagementPage;
