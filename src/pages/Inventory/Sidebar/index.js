import React, { useState, useRef, useEffect } from "react";
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
  const hasUserPermission5 = hasPermission("PHARMACY", "AUDIT", "READ");
  const hasUserPermission6 = hasPermission("PHARMACY", "NURSEGIVENMEDICINES", "READ");
  const hasUserPermission7 = hasPermission("PHARMACY", "REQUISITION_INTERNAL_TRANSFER", "READ");
  const hasUserPermission8 = hasPermission("PHARMACY", "REQUISITION_SAREYAAN_ORDERS", "READ");

  const location = useLocation();
  const [openSection, setOpenSection] = useState("");

  const accordionRefs = useRef({});

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? "" : id);
  };

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
    if (page.id === "audit" && !hasUserPermission5) {
      return false;
    }
    if (page.id === "nurseGivenMedicines" && !hasUserPermission6) {
      return false;
    }

    if (page.id === "requisition") {
      return page.children.length > 0;
    }

    return true;
  });

  useEffect(() => {
    filteredSettings.forEach((page) => {
      if (
        page.isAccordion &&
        page.children.some((child) => location.pathname === child.link || location.pathname.startsWith(child.link + "/"))
      ) {
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
`}
      </style>
      <div className="chat-leftsidebar">
        <div className="ps-4 pe-3 pt-4 mb-">
          <div className="d-flex align-items-start">
            <div className="d-flex justify-content-between w-100 mb-2">
              <h5 className="pb-0">Pharmacy</h5>
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
                      <Link className="d-flex align-items-center py-2" to={page.link}>
                        <div className="d-flex align-items-center w-100">
                          <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                            <div className="avatar-xxs">
                              <i className={`${page.icon} fs-4`}></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
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

                return (
                  <li key={page.id} className="mb-1">
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSection(page.id);
                      }}
                      className="d-flex align-items-center py-2"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center w-100 pe-3">
                        <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                          <div className="avatar-xxs">
                            <i className={`${page.icon} fs-4`}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <p className="text-truncate font-semi-bold fs-15 mb-0">
                            {page.label}
                          </p>
                        </div>
                        <span
                          className="ms-auto fs-12"
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
                            className={
                              location.pathname === child.link || location.pathname.startsWith(child.link + "/")
                                ? "active"
                                : ""
                            }
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
