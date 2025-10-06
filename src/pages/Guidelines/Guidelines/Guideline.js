import React, { useRef } from "react";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const Guideline = ({ guideline }) => {
  const printRef = useRef();

  return (
    <div
      className="list-group-item d-flex justify-content-between align-items-center"
      key={guideline.id}
    >
      <div className="flex-grow-1">
        <h5 className="mb-1">{guideline.name}</h5>
        <p className="mb-1 text-muted">{guideline.description}</p>
      </div>
      <div className="d-flex align-items-center gap-2">
        {/* <span className="badge bg-primary">{guideline.status}</span> */}
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() => handlePrint(printRef)}
          title={`Print ${guideline.name}`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      {guideline.print && (
        <guideline.print ref={printRef} classnames={"hidden print:block"} />
      )}
    </div>
  );
};

export default Guideline;
