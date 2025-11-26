import React, { useRef } from "react";
import AccountingChecklistPrint from "./Prints/AccountingPrint";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const AccountingGuidelines = () => {
  const printRef = useRef();

  return (
    <div className="w-100 p-4">
      <div className="bg-white shadow-sm p-2 d-flex align-items-center justify-content-between mb-5">
        <h2 className="mb-0">Accounting Guidelines</h2>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() => handlePrint(printRef, "Accounting Guidelines")}
          title={`Print Accounting Guidelines`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      <AccountingChecklistPrint
        ref={printRef}
        classnames={"hidden print:block"}
      />
      <AccountingChecklistPrint heading="hidden" />
    </div>
  );
};

export default AccountingGuidelines;
