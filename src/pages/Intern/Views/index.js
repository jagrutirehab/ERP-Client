import React, { useState } from "react";
import { ButtonGroup, Button } from "reactstrap";
import {
  BILLING_VIEW,
  TIMELINE_VIEW,
  FORMS_VIEW,
  CERTIFICATE_VIEW,
} from "../../../Components/constants/intern";
import Billing from "./Billing";
import Timeline from "./Timeline";
import InternAddmissionForms from "./AdmissionForms/AdmissionForm";
import Certificate from "./Certificate";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { parseSubmodule } from "../../../utils/parseSubmodule";

const pageOrder = ["Forms", "Timeline", "Billing", "Certificate"];

const Views = () => {
  const vws = {
    Billing: BILLING_VIEW,
    Timeline: TIMELINE_VIEW,
    Forms: FORMS_VIEW,
    Certificate: CERTIFICATE_VIEW,
  };

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { roles, hasPermission } = usePermissions(token);

  const internModule = roles?.permissions?.find((p) => p.module === "INTERN");

  const allowedSubmodules = internModule?.subModules
    .filter((sub) => hasPermission("INTERN", sub.name, "READ"))
    .sort(
      (a, b) =>
        pageOrder.indexOf(parseSubmodule(a.name, "INTERN")) -
        pageOrder.indexOf(parseSubmodule(b.name, "INTERN"))
    );

  const [view, setView] = useState(() => {
    if (!allowedSubmodules?.length) return "";
    const firstKey = parseSubmodule(allowedSubmodules[0].name, "INTERN");
    return vws[firstKey] || "";
  });

  const handleView = (v) => setView(v);

  return (
    <React.Fragment>
      <div
        style={{ overflow: "auto !important" }}
        color="primary"
        className="h-auto"
      >
        <div className="patient-content postion-relative overflow-auto bg-white mt-1 px-3 py-3">
          <div className="d-flex justify-content-between flex-wrap">
            <ButtonGroup size="sm">
              {allowedSubmodules?.map((sub) => {
                const key = parseSubmodule(sub.name, "INTERN");
                const vw = vws[key];
                return (
                  <Button
                    key={sub.name}
                    outline={view !== vw}
                    onClick={() => handleView(vw)}
                  >
                    {key}
                  </Button>
                );
              })}
            </ButtonGroup>
          </div>
          <div>
            {view === BILLING_VIEW && <Billing view={view} />}
            {view === TIMELINE_VIEW && <Timeline view={view} />}
            {view === FORMS_VIEW && <InternAddmissionForms view={view} />}
            {view === CERTIFICATE_VIEW && <Certificate view={view} />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Views;
