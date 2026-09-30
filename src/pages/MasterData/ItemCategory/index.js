import React, { useState } from "react";
import ItemCategoryList from "./ItemCategoryList";
import ItemCategoryForm from "./ItemCategoryForm";

const ItemCategory = () => {
  const [view, setView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);

  const goToList = () => {
    setView("list");
    setEditingItem(null);
  };

  if (view === "form") {
    return (
      <ItemCategoryForm
        editingItem={editingItem}
        onSaved={goToList}
        onCancel={goToList}
      />
    );
  }

  return (
    <ItemCategoryList
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

export default ItemCategory;