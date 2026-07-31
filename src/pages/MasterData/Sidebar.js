import React, { useState } from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { Link, useLocation } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import { MASTER_DATA } from "../../Components/constants/pages";

const Sidebar = () => {
  const location = useLocation();
  const [openSection, setOpenSection] = useState("");

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? "" : id));
  };

  const toggleDataSidebar = () => {
    const windowSize = document.documentElement.clientWidth;
    const dataList = document.querySelector(".chat-message-list");

    if (windowSize < 992 && dataList) {
      dataList.classList.toggle("show-chat-message-list");
    }
  };

  return (
    <div className="chat-leftsidebar" style={{ minWidth: "0px" }}>
      <div className="ps-3 pe-3 pt-3 mb-2">
        <div className="d-flex align-items-start">
          <div className="d-flex justify-content-between w-100 mb-2">
            <button
              onClick={toggleDataSidebar}
              type="button"
              className="btn btn-sm px-3 fs-16 data-sidebar-button topnav-hamburger"
              id="vendor-sidebar-hamburger"
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
            id="vendor-sidebar-user-list"
          >
            {(MASTER_DATA || []).map((page) => {
              const children = page.children || [];
              const hasChildren = page.isAccordion && children.length > 0;

              // ---- Flat item (no children) ----
              if (!hasChildren) {
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
                            <i className={page.icon + " fs-4"}></i>
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

              // ---- Accordion item (has children) ----
              const isOpen = openSection === page.id;
              const hasActiveChild = children.some(
                (child) => child.link && location.pathname.startsWith(child.link),
              );

              return (
                <li key={page.id} className="mb-1">
                  <div
                    role="button"
                    tabIndex={0}
                    className={
                      "d-flex align-items-center py-2" +
                      (hasActiveChild ? " active" : "")
                    }
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleSection(page.id)}
                    onKeyDown={(e) => e.key === "Enter" && toggleSection(page.id)}
                  >
                    <div className="d-flex align-items-center w-100">
                      <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                        <div className="avatar-xxs">
                          <i className={page.icon + " fs-4"}></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className="text-truncate font-semi-bold fs-15 mb-0">
                          {page.label || ""}
                        </p>
                      </div>
                      <i
                        className={`bx bx-chevron-${isOpen ? "up" : "down"} ms-1 flex-shrink-0`}
                      ></i>
                    </div>
                  </div>

                  {isOpen && (
                    <ul className="list-unstyled ps-4">
                      {children.map((child) => (
                        <li
                          key={child.id || child.link}
                          className={
                            child.link && location.pathname.startsWith(child.link)
                              ? "active mb-1"
                              : "mb-1"
                          }
                        >
                          <Link className="d-flex align-items-center py-2" to={child.link}>
                            <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                              <div className="avatar-xxs">
                                <i className={(child.icon || page.icon) + " fs-5"}></i>
                              </div>
                            </div>
                            <p className="text-truncate font-semi-bold fs-14 mb-0">
                              {child.label || ""}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </PerfectScrollbar>
    </div>
  );
};

export default Sidebar;