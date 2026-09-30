import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { handlePrint } from "../../../utils/print";
import { Printer, ExternalLink } from "lucide-react";

const Guideline = ({ guideline }) => {
  const printRef = useRef();

  return (
    <div
      className="list-group-item d-flex justify-content-between align-items-center"
      key={guideline.id}
    >
      <div className="flex-grow-1">
        {guideline.link ? (
          <Link to={guideline.link} className="text-decoration-none">
            <h5 className="mb-1">{guideline.name}</h5>
          </Link>
        ) : (
          <h5 className="mb-1">{guideline.name}</h5>
        )}
        <p className="mb-1 text-muted">{guideline.description}</p>
      </div>
      <div className="d-flex align-items-center gap-2">
        {/* <span className="badge bg-primary">{guideline.status}</span> */}
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() => handlePrint(printRef, guideline.name)}
          title={`Print ${guideline.name}`}
        >
          <Printer size={14} />
          Print
        </button>
        {guideline.link && (
          <Link
            to={guideline.link}
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
            title={`Open ${guideline.name}`}
          >
            <ExternalLink size={14} />
            Open
          </Link>
        )}
      </div>
      {guideline.print && (
        <guideline.print ref={printRef} classnames={"hidden print:block"} />
      )}
    </div>
  );
};

export default Guideline;
