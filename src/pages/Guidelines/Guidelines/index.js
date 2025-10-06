import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AccountingChecklistPrint from "./Prints/AccountingPrint";
import AdmissionDischargePrint from "./Prints/AdmissionDischargePrint";
import EnquiryTakingPrint from "./Prints/EnquiryPrint";
import Guideline from "./Guideline";
import HygieneMaintenancePrint from "./Prints/HygienePrint";
import RehabilitationGuidelinesPrint from "./Prints/RehabPrint";
import BedsideNotesPrint from "./Prints/BedsideNotesPrint";

const guidelines = [
  {
    id: 1,
    name: "Accounting Guidelines",
    description:
      "Accounting Guidelines are a set of rules and procedures that guide the accounting process in a business. They ensure that the financial records are accurate and compliant with the relevant laws and regulations.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Accounting",
    print: AccountingChecklistPrint,
  },
  {
    id: 2,
    name: "Admission Discharge Guidelines",
    description:
      "Admission Discharge Guidelines are a set of rules and procedures that guide the admission and discharge process in a business. They ensure that the patient is admitted and discharged in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Admission Discharge",
    print: AdmissionDischargePrint,
  },
  {
    id: 3,
    name: "Enquiry Taking Guidelines",
    description:
      "Enquiry Taking Guidelines are a set of rules and procedures that guide the enquiry taking process in a business. They ensure that the enquiry is taken in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Enquiry",
    print: EnquiryTakingPrint,
  },
  {
    id: 4,
    name: "Hygiene Maintenance Guidelines",
    description:
      "Hygiene Maintenance Guidelines are a set of rules and procedures that guide the hygiene maintenance process in a business. They ensure that the hygiene is maintained in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Hygiene Maintenance",
    print: HygieneMaintenancePrint,
  },
  {
    id: 5,
    name: "Rehabilitation Guidelines",
    description:
      "Rehabilitation Guidelines are a set of rules and procedures that guide the rehabilitation process in a business. They ensure that the rehabilitation is done in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Rehabilitation",
    print: RehabilitationGuidelinesPrint,
  },
  {
    id: 6,
    name: "Bedside Notes Guidelines",
    description:
      "Bedside Notes Guidelines are a set of rules and procedures that guide the bedside notes process in a business. They ensure that the bedside notes are taken in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Bedside Notes",
    print: BedsideNotesPrint,
  },
];

const GuidelinesDashboard = () => {
  const [query, setQuery] = useState("");

  const filteredGuidelines = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guidelines;
    return guidelines.filter((g) => {
      const haystack = `${g.name} ${g.description} ${g.type}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <div className="w-100 d-flex flex-column w-100 bg-white p-4 gap-2 mb-4">
      <h1 className="display-6 font-weight-bold text-primary">Guidelines</h1>
      <p className="text-muted lead">
        Manage your guidelines with ease and efficiency
      </p>
      <div className="">
        <div className="w-100 w-md-auto" style={{ maxWidth: "300px" }}>
          <div className="position-relative w-100">
            <Search
              className="position-absolute"
              style={{
                left: "8px", // left end alignment
                top: "50%", // vertical center
                transform: "translateY(-50%)",
                height: "18px",
                width: "18px",
                color: "#6c757d",
                pointerEvents: "none", // icon won't capture clicks
              }}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search guidelines..."
              className={`form-control`}
              style={{
                paddingLeft: "36px", // leave room for the icon
                paddingRight: "12px",
                height: "40px",
              }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-3">
          <h3 className="h4 mb-0">Guidelines List</h3>
        </div>

        <div className="list-group">
          {filteredGuidelines.length === 0 ? (
            <div className="text-muted p-3">
              No guidelines match your search.
            </div>
          ) : (
            filteredGuidelines.map((guideline) => (
              <Guideline key={guideline.id} guideline={guideline} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidelinesDashboard;
