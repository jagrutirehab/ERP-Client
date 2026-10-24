import React, { useState } from "react";
import ContractList from "./ContractList";
import ContractForm from "./ContractForm";
import ContractOverview from "./ContractOverview";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import Basic404 from "../../AuthenticationInner/Errors/Basic404";
import "../UnitOfMeasurement/uom.scss";

const Contract = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "CONTRACT", "READ");

  const [view, setView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);

  if (!canView) {
    return <Basic404 />;
  }

  const goToList = () => {
    setView("list");
    setEditingItem(null);
    setSelectedContractId(null);
  };

  if (view === "form") {
    return (
      <ContractForm editingItem={editingItem} onSaved={goToList} onCancel={goToList} />
    );
  }

  if (view === "overview" && selectedContractId) {
    return <ContractOverview contractId={selectedContractId} onBack={goToList} />;
  }

  return (
    <ContractList
      onAdd={() => {
        setEditingItem(null);
        setView("form");
      }}
      onEdit={(item) => {
        setEditingItem(item);
        setView("form");
      }}
      onView={(item) => {
        setSelectedContractId(item._id);
        setView("overview");
      }}
    />
  );
};

export default Contract;