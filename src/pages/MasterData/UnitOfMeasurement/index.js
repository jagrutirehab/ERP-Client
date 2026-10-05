import React, { useState } from "react";
import UOMList from "./UOMList";
import UOMForm from "./UOMForm";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import Basic404 from "../../AuthenticationInner/Errors/Basic404";

const UnitOfMeasurement = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "UOM", "READ");
  const [view, setView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);

  if (!canView) {
    return <Basic404 />;
  }

  const goToList = () => {
    setView("list");
    setEditingItem(null);
  };

  if (view === "form") {
    return (
      <UOMForm
        editingItem={editingItem}
        onSaved={goToList}
        onCancel={goToList}
      />
    );
  }

  return (
    <UOMList
      onAdd={() => {
        setEditingItem(null);
        setView("form");
      }}
      onEdit={(item) => {
        setEditingItem(item);
        setView("form");
      }}
    />
  );
};

export default UnitOfMeasurement;