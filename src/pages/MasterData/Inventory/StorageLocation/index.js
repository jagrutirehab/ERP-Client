import React, { useState } from "react";
import StorageLocationList from "./StorageLocationList";
import StorageLocationForm from "./StorageLocationForm";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const StorageLocation = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "STORAGE_LOCATION", "READ");

  const [view, setView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);

  if (!canView) return <Basic404 />;

  const goToList = () => {
    setView("list");
    setEditingItem(null);
  };

  if (view === "form") {
    return (
      <StorageLocationForm editingItem={editingItem} onSaved={goToList} onCancel={goToList} />
    );
  }

  return (
    <StorageLocationList
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

export default StorageLocation;