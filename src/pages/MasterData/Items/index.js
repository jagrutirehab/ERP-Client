import React, { useState } from "react";
import ItemType from "../ItemType";
import ItemCategory from "../ItemCategory";
import ItemMaster from "../ItemMaster";
import "../shared/itemMasterForms.scss";

const TABS = [
  { key: "items", label: "Items" },
  { key: "types", label: "Item Types" },
  { key: "categories", label: "Categories" },
];

const Items = () => {
  const [activeTab, setActiveTab] = useState("items");

  return (
    <div className="p-3">
      <div className="im-page-header">
        <div className="d-flex gap-3">
          <div className="im-icon-badge">
            <i className="bx bx-box"></i>
          </div>
          <div className="im-page-title">
            <h4>Item Master</h4>
            <p>Manage items, item types, and categories used across the catalog</p>
          </div>
        </div>
      </div>

      <div className="im-pill-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "items" && <ItemMaster />}
      {activeTab === "types" && <ItemType />}
      {activeTab === "categories" && <ItemCategory />}
    </div>
  );
};

export default Items;