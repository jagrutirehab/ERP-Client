import React, { useState } from "react";
import PutawayList from "./PutawayList";
import PutawayForm from "./PutawayForm";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const Putaway = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "PUTAWAY", "READ");

  const [view, setView] = useState("list");
  const [selectedGRN, setSelectedGRN] = useState(null);

  if (!canView) return <Basic404 />;

  const goToList = () => {
    setView("list");
    setSelectedGRN(null);
  };

  if (view === "form" && selectedGRN) {
    return <PutawayForm grn={selectedGRN} onSaved={goToList} onCancel={goToList} />;
  }

  return (
    <PutawayList
      onAdd={(grn) => {
        setSelectedGRN(grn);
        setView("form");
      }}
    />
  );
};

export default Putaway;