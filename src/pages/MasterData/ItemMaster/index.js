import React, { useState } from "react";
import ItemMasterList from "./ItemMasterList";
import ItemMasterForm from "./ItemMasterForm";

const ItemMaster = () => {
  const [view, setView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);

  const goToList = () => {
    setView("list");
    setEditingItem(null);
  };

  if (view === "form") {
    return (
      <ItemMasterForm
        editingItem={editingItem}
        onSaved={goToList}
        onCancel={goToList}
      />
    );
  }

  return (
    <ItemMasterList
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

export default ItemMaster;