import React, { useState } from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { Link, useLocation } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Collapse } from "reactstrap";
import { usePermissions } from "../../../Components/Hooks/useRoles";
// import { MIReporting } from "../../../Components/constants/pages";

// MI_CENTER_LEADS_COUNT

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const toggleDataSidebar = () => {
    var windowSize = document.documentElement.clientWidth;
    const dataList = document.querySelector(".chat-message-list");

    if (windowSize < 992) {
      if (dataList.classList.contains("show-chat-message-list")) {
        dataList.classList.remove("show-chat-message-list");
      } else dataList.classList.add("show-chat-message-list");
    }
  };

  const toggleCollapse = () => setIsOpen(!isOpen);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasMiCenterLeadsPermission = hasPermission(
    "MI_REPORTING",
    "MI_CENTER_LEADS_COUNT",
    "READ"
  );
  const hasMiOwnerLeadsPermission = hasPermission(
    "MI_REPORTING",
    "MI_OWNER_LEADS_COUNT",
    "READ"
  );
  const hasMiCityQualityPermission = hasPermission(
    "MI_REPORTING",
    "MI_CITY_QUALITY_BREAKDOWN",
    "READ"
  );
  const hasMiOwnerQualityPermission = hasPermission(
    "MI_REPORTING",
    "MI_OWNER_QUALITY_BREAKDOWN",
    "READ"
  );

  const MIReporting = [
    hasMiCenterLeadsPermission
      ? {
          id: "center-leads-mom",
          label: "Center Leads (MoM)",
          link: "/mi-reporting/center-leads-mom",
          icon: "bx bx-bar-chart-alt-2",
        }
      : null,
    hasMiCenterLeadsPermission
      ? {
          id: "center-leads-mtd",
          label: "Center Leads (MTD)",
          link: "/mi-reporting/center-leads-mtd",
          icon: "bx bx-line-chart",
        }
      : null,
    hasMiOwnerLeadsPermission
      ? {
          id: "owner-leads-mom",
          label: "Owner Leads (MoM)",
          link: "/mi-reporting/owner-leads-mom",
          icon: "bx bx-bar-chart-square",
        }
      : null,
    hasMiOwnerLeadsPermission
      ? {
          id: "owner-leads-mtd",
          label: "Owner Leads (MTD)",
          link: "/mi-reporting/owner-leads-mtd",
          icon: "bx bx-trending-up",
        }
      : null,
    hasMiCityQualityPermission
      ? {
          id: "city-quality",
          label: "City Quality Breakdown",
          link: "/mi-reporting/city-quality",
          icon: "bx bx-map",
        }
      : null,
    hasMiOwnerQualityPermission
      ? {
          id: "owner-quality",
          label: "Owner Quality Breakdown",
          link: "/mi-reporting/owner-quality",
          icon: "bx bx-user-check",
        }
      : null,
    {
      id: "city-visit-date",
      label: "City Visit Date",
      link: "/mi-reporting/city-visit-date",
      icon: "bx bx-calendar",
    },
    {
      id: "owner-visit-date",
      label: "Owner Visit Date",
      link: "/mi-reporting/owner-visit-date",
      icon: "bx bx-calendar-check",
    },
    {
      id: "city-visited-date",
      label: "City Visited Date",
      link: "/mi-reporting/city-visited-date",
      icon: "bx bx-calendar-event",
    },
    {
      id: "owner-visited-date",
      label: "Owner Visited Date",
      link: "/mi-reporting/owner-visited-date",
      icon: "bx bx-calendar-star",
    },
  ];

  return (
    <div>
      <div className="chat-leftsidebar">
        <div className="ps-4 pe-3 pt-4 mb-">
          <div className="d-flex align-items-start">
            <div className="d-flex justify-content-between w-100 mb-2">
              <div
                onClick={toggleCollapse}
                className="d-flex align-items-center justify-content-between w-100 cursor-pointer"
                style={{ cursor: "pointer" }}
              >
                <h5 className="pb-0 mb-0">Mi Reporting</h5>
                <i
                  className={`mdi mdi-chevron-${isOpen ? "up" : "down"} fs-4`}
                ></i>
              </div>
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
            <Collapse isOpen={isOpen}>
              <ul
                className="list-unstyled chat-list chat-user-list users-list"
                id="userList"
              >
                {(MIReporting || [])
                  .filter((m) => m)
                  .map((page, idx) => (
                    <li
                      key={idx}
                      className={
                        location.pathname === page.link ? "active" : ""
                      }
                    >
                      <Link to={page.link}>
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                            <div className="avatar-xxs">
                              <i className={`${page.icon} fs-4`}></i>
                            </div>
                            <span className="user-status"></span>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <p className="text-truncate font-semi-bold fs-15 mb-0">
                              {page.label || ""}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            </Collapse>
          </div>
        </PerfectScrollbar>
      </div>
    </div>
  );
};

export default Sidebar;
