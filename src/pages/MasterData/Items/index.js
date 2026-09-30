import React, { useState } from "react";
import ItemType from "../ItemType";
import ItemCategory from "../ItemCategory";
import ItemMaster from "../ItemMaster";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import Basic404 from "../../AuthenticationInner/Errors/Basic404";
import "../shared/itemMasterForms.scss";

const TABS = [
  { key: "items", label: "Items" },
  { key: "types", label: "Item Types" },
  { key: "categories", label: "Categories" },
];

const Items = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canViewItems = hasPermission("MASTERDATA", "ITEM_MASTER", "READ");
  const canViewItemTypes = hasPermission("MASTERDATA", "ITEM_TYPE", "READ");
  const canViewCategories = hasPermission(
    "MASTERDATA",
    "ITEM_CATEGORY",
    "READ",
  );

  const visibleTabs = TABS.filter((t) => {
    if (t.key === "items") return canViewItems;
    if (t.key === "types") return canViewItemTypes;
    if (t.key === "categories") return canViewCategories;
    return true;
  });

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.key || "items");

  if (!canViewItems && !canViewItemTypes && !canViewCategories) {
    return <Basic404 />;
  }

  return (
    <div className="p-3">
      <div className="im-page-header">
        <div className="d-flex gap-3">
          {/* <div className="im-icon-badge">
            <i className="bx bx-box"></i>
          </div> */}
          <div className="im-page-title">
            <h4>Item Master</h4>
            {/* <p>Manage items, item types, and categories used across the catalog</p> */}
          </div>
        </div>
      </div>

      <div className="im-pill-tabs">
        {visibleTabs.map((t) => (
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

      {activeTab === "items" && canViewItems && <ItemMaster />}
      {activeTab === "types" && canViewItemTypes && <ItemType />}
      {activeTab === "categories" && canViewCategories && <ItemCategory />}
    </div>
  );
};

export default Items;
