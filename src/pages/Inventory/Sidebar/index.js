import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "react-perfect-scrollbar/dist/css/styles.css";
import { Link, useLocation } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Pharmacy } from "../../../Components/constants/pages";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const Sidebar = () => {
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("PHARMACY", "DASHBOARD", "READ");
  const hasUserPermission2 = hasPermission("PHARMACY", "PHARMACYMANAGEMENT", "READ");
  const hasUserPermission3 = hasPermission("PHARMACY", "GIVENMEDICINES", "READ");
  const hasUserPermission4 = hasPermission("PHARMACY", "MEDICINEAPPROVAL", "READ");
  const hasUserPermission13 = hasPermission("PHARMACY", "MEDICINE_RETURN", "READ");
  const hasUserPermission14 = hasPermission("PHARMACY", "RAISE_MEDICINE_REQUISITION", "READ");
  const hasUserPermission5 = hasPermission("PHARMACY", "AUDIT", "READ");
  const hasUserPermission6 = hasPermission("PHARMACY", "NURSEGIVENMEDICINES", "READ");
  const hasUserPermission7 = hasPermission("PHARMACY", "REQUISITION_INTERNAL_TRANSFER", "READ");
  const hasUserPermission8 = hasPermission("PHARMACY", "REQUISITION_SAREYAAN_ORDERS", "READ");
  const hasUserPermission9 = hasPermission("PHARMACY", "INVENTORY_STOCK_SUMMARY", "READ");
  const hasUserPermission10 = hasPermission("PHARMACY", "REQUISITION_MEDICINE_REQUISITION", "READ");
  const hasUserPermission11 = hasPermission("PHARMACY", "BILL_UPLOAD_DASHBOARD", "READ");
  const hasUserPermission12 = hasPermission("PHARMACY", "SAREYAAN_INVENTORY", "READ");
  const hasUserPermission15 = hasPermission("PHARMACY", "EXPIRED_MEDICINE_REMOVAL", "READ");
  const hasUserPermission16 = hasPermission("PHARMACY", "INVENTORY_HEALTH_REPORT", "READ");
  const hasUserPermission17 = hasPermission("PHARMACY", "PHARMACY_ACTIVITY", "READ");

  const location = useLocation();
  const [openSection, setOpenSection] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const accordionRefs = useRef({});
  const triggerRefs = useRef({});
  const flyoutRef = useRef(null);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? "" : id);
  };

  // Collapsed-sidebar flyout: close it when clicking outside, or on scroll
  // (its fixed position would otherwise go stale as the list scrolls).
  useEffect(() => {
    if (!collapsed || !openSection) return;

    const handleClickOutside = (e) => {
      const trigger = triggerRefs.current[openSection];
      if (flyoutRef.current?.contains(e.target)) return;
      if (trigger?.contains(e.target)) return;
      setOpenSection("");
    };
    const closeOnScroll = () => setOpenSection("");

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [collapsed, openSection]);

  const toggleDataSidebar = () => {
    var windowSize = document.documentElement.clientWidth;
    const dataList = document.querySelector(".chat-message-list");

    if (windowSize < 992) {
      if (dataList.classList.contains("show-chat-message-list")) {
        dataList.classList.remove("show-chat-message-list");
      } else dataList.classList.add("show-chat-message-list");
    }
  };

  const filteredSettings = (Pharmacy || []).map((page) => {
    if (page.id === "requisition") {
      return {
        ...page,
        children: (page.children || []).filter((child) => {
          if (child.id === "internal-transfer" && !hasUserPermission7) return false;
          if (child.id === "sareyaan-orders" && !hasUserPermission8) return false;
          if (child.id === "medicine-requisition" && !hasUserPermission10) return false;
          if (child.id === "raise-medicine-requisition" && !hasUserPermission14) return false;
          return true;
        }),
      };
    }
    return page;
  }).filter((page) => {
    if (page.id === "pharmacy-dashboard" && !hasUserPermission) {
      return false;
    }
    if (page.id === "pharmacymanagement" && !hasUserPermission2) {
      return false;
    }
    if (page.id === "givenmedicines" && !hasUserPermission3) {
      return false;
    }
    if (page.id === "medicineaApproval" && !hasUserPermission4) {
      return false;
    }
    if (page.id === "medicineReturn" && !hasUserPermission13) {
      return false;
    }
    if (page.id === "audit" && !hasUserPermission5) {
      return false;
    }
    if (page.id === "nurseGivenMedicines" && !hasUserPermission6) {
      return false;
    }

    if (page.id === "requisition") {
      return page.children.length > 0;
    }

    if (page.id === "stockSummary" && !hasUserPermission9) {
      return false;
    }

    if (page.id === "billUploadDashboard" && !hasUserPermission11) {
      return false;
    }

    if (page.id === "sareyaanInventory" && !hasUserPermission12) {
      return false;
    }

    if (page.id === "expiredMedicines" && !hasUserPermission15) {
      return false;
    }

    if (page.id === "inventoryHealthReport" && !hasUserPermission16) {
      return false;
    }

    if (page.id === "pharmacyActivity" && !hasUserPermission17) {
      return false;
    }

    return true;
  });

  const hasExactChild = filteredSettings.some(
    (page) => page.isAccordion && page.children.some((child) => child.link === location.pathname)
  );
  const isChildActive = (child) =>
    location.pathname === child.link ||
    (!hasExactChild && location.pathname.startsWith(child.link + "/"));

  useEffect(() => {
    filteredSettings.forEach((page) => {
      if (page.isAccordion && page.children.some(isChildActive)) {
        setOpenSection(page.id);
      }
    });
  }, [location.pathname]);

  return (
    <>
      <style>
        {`
    .accordion-wrap {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: max-height 0.25s ease, opacity 0.2s ease;
    }

    .accordion-wrap.open {
        opacity: 1;
    }

    /* Highlight only the selected child */
    li.active > a,
    li.active > div {
        background: rgba(0, 123, 255, 0.15) !important;
        color: #0d6efd !important;
    }

    /* Highlight only the parent accordion header */
    li.parent-active > div {
        background: rgba(0, 123, 255, 0.08) !important;
        color: #0d6efd !important;
    }

    /* Prevent parent highlight bleeding into child items */
    li.parent-active ul li {
        background: transparent !important;
    }

    .chat-leftsidebar {
        transition: min-width 0.25s ease, max-width 0.25s ease;
    }

    .chat-leftsidebar.sidebar-collapsed {
        min-width: 80px !important;
        max-width: 80px !important;
    }

    .chat-leftsidebar.sidebar-collapsed .sidebar-label,
    .chat-leftsidebar.sidebar-collapsed .sidebar-title,
    .chat-leftsidebar.sidebar-collapsed .accordion-chevron,
    .chat-leftsidebar.sidebar-collapsed .accordion-wrap {
        display: none !important;
    }

    .chat-leftsidebar.sidebar-collapsed .chat-user-img {
        margin-right: 0 !important;
    }

    .chat-leftsidebar.sidebar-collapsed li > a,
    .chat-leftsidebar.sidebar-collapsed li > div {
        justify-content: center;
    }

    /* Accordion children render as a flyout beside the icon (via a portal,
       so it escapes PerfectScrollbar's clipping) instead of expanding the
       whole sidebar, so parent items with children stay icon-only while
       collapsed. */
    .sidebar-flyout {
        position: fixed;
        min-width: 220px;
        max-width: 260px;
        max-height: 70vh;
        overflow-y: auto;
        background: var(--vz-card-bg, #fff);
        border-radius: 6px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
        padding: 6px 0;
        z-index: 1060;
    }

    .sidebar-flyout a {
        padding-left: 14px !important;
    }

    .sidebar-collapse-toggle {
        border: none;
        background: transparent;
        cursor: pointer;
        color: inherit;
    }
`}
      </style>
      <div
        className={`chat-leftsidebar${collapsed ? " sidebar-collapsed" : ""}`}
        style={{ minWidth: "0px" }}
      >
        <div className="ps-4 pe-3 pt-4 mb-">
          <div className="d-flex align-items-start">
            <div className="d-flex justify-content-between w-100 mb-2">
              <h5 className="pb-0 sidebar-title">Pharmacy</h5>
              <div className="d-flex align-items-center">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  type="button"
                  className="btn btn-sm px-2 fs-16 sidebar-collapse-toggle"
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <i className={`bx ${collapsed ? "bx-chevron-right" : "bx-chevron-left"} fs-4`}></i>
                </button>
                <button
                  onClick={toggleDataSidebar}
                  type="button"
                  className="btn btn-sm px-3 fs-16 data-sidebar-button topnav-hamburger"
                  id="topnav-hamburger-icon"
                >
                  <span className="hamburger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <PerfectScrollbar className="chat-room-list">
          <div className="chat-message-list">
            <ul
              className="list-unstyled chat-list chat-user-list users-list"
              id="userList"
            >
              {(filteredSettings || []).map((page, idx) => {
                if (!page.isAccordion) {
                  return (
                    <li
                      key={page.id}
                      className={
                        page.link && location.pathname.startsWith(page.link)
                          ? "active mb-1"
                          : "mb-1"
                      }
                    >
                      <Link
                        className="d-flex align-items-center py-2"
                        to={page.link}
                        title={collapsed ? page.label || "" : undefined}
                      >
                        <div className="d-flex align-items-center w-100">
                          <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                            <div className="avatar-xxs">
                              <i className={`${page.icon} fs-4`}></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 overflow-hidden sidebar-label">
                            <p className="text-truncate font-semi-bold fs-15 mb-0">
                              {page.label || ""}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                }

                if (!accordionRefs.current[page.id]) {
                  accordionRefs.current[page.id] = React.createRef();
                }

                const contentRef = accordionRefs.current[page.id];

                const isFlyoutOpen = collapsed && openSection === page.id;
                const triggerEl = triggerRefs.current[page.id];
                const triggerRect = isFlyoutOpen
                  ? triggerEl?.getBoundingClientRect()
                  : null;

                return (
                  <li key={page.id} className="mb-1">
                    <a
                      ref={(el) => (triggerRefs.current[page.id] = el)}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSection(page.id);
                      }}
                      className="d-flex align-items-center py-2"
                      style={{ cursor: "pointer" }}
                      title={collapsed ? page.label || "" : undefined}
                    >
                      <div className="d-flex align-items-center w-100 pe-3">
                        <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                          <div className="avatar-xxs">
                            <i className={`${page.icon} fs-4`}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 overflow-hidden sidebar-label">
                          <p className="text-truncate font-semi-bold fs-15 mb-0">
                            {page.label}
                          </p>
                        </div>
                        <span
                          className="ms-auto fs-12 accordion-chevron"
                          style={{
                            transform:
                              openSection === page.id
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </a>

                    {triggerRect &&
                      createPortal(
                        <div
                          ref={flyoutRef}
                          className="sidebar-flyout"
                          style={{
                            top: triggerRect.top,
                            left: triggerRect.right + 6,
                          }}
                        >
                          <ul className="list-unstyled mb-0">
                            {page.children.map((child) => (
                              <li
                                key={child.id}
                                className={isChildActive(child) ? "active" : ""}
                              >
                                <Link
                                  className="d-flex py-2 align-items-center"
                                  to={child.link}
                                  onClick={() => setOpenSection("")}
                                >
                                  <i className={`${child.icon} fs-5 me-2`} />
                                  <p className="text-truncate font-semi-bold fs-14 mb-0">
                                    {child.label}
                                  </p>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>,
                        document.body
                      )}

                    <div
                      ref={contentRef}
                      className={`accordion-wrap ${openSection === page.id ? "open" : ""
                        }`}
                      style={{
                        maxHeight:
                          openSection === page.id
                            ? contentRef.current?.scrollHeight ?? 0
                            : 0,
                      }}
                    >
                      <ul className="list-unstyled mb-1">
                        {page.children.map((child) => (
                          <li
                            key={child.id}
                            className={isChildActive(child) ? "active" : ""}
                          >
                            <Link className="d-flex py-2 align-items-center" style={{ paddingLeft: '3.2rem' }} to={child.link}>
                              <i className={`${child.icon} fs-5 me-2`} />
                              <p className="text-truncate font-semi-bold fs-14 mb-0">
                                {child.label}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </PerfectScrollbar>
      </div>
    </>
  );
};

export default Sidebar;
