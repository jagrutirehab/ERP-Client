import React, { useState } from "react";
import ItemTypeList from "./ItemTypeList";
import ItemTypeForm from "./ItemTypeForm";

const ItemType = () => {
  const [view, setView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);

  const goToList = () => {
    setView("list");
    setEditingItem(null);
  };

  if (view === "form") {
    return (
      <ItemTypeForm
        editingItem={editingItem}
        onSaved={goToList}
        onCancel={goToList}
      />
    );
  }

  return (
    <ItemTypeList
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

export default ItemType;