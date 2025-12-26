import React, { useState } from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { Link, useLocation } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Collapse } from "reactstrap";
import { usePermissions } from "../../../Components/Hooks/useRoles";
// import { HubspotReporting } from "../../../Components/constants/pages";

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
  const hasHubspotCenterLeadsPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CENTER_LEADS_COUNT",
    "READ"
  );
  const hasHubspotOwnerLeadsPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_LEADS_COUNT",
    "READ"
  );
  const hasHubspotCityQualityPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CITY_QUALITY_BREAKDOWN",
    "READ"
  );
  const hasHubspotOwnerQualityPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_QUALITY_BREAKDOWN",
    "READ"
  );
  const hasHubspotCityVisitPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CITY_VISIT_DATE",
    "READ"
  );
  const hasHubspotOwnerVisitPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_VISIT_DATE",
    "READ"
  );
  const hasHubspotCityVisitedPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CITY_VISITED_DATE",
    "READ"
  );
  const hasHubspotOwnerVisitedPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_VISITED_DATE",
    "READ"
  );
  const hasHubspotCityLeadStatusPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_CITY_LEAD_STATUS",
    "READ"
  );
  const hasHubspotOwnerLeadStatusPermission = hasPermission(
    "HUBSPOT_REPORTING",
    "HUBSPOT_OWNER_LEAD_STATUS",
    "READ"
  );

  const HubspotReporting = [
    hasHubspotCenterLeadsPermission
      ? {
          id: "center-leads-mom",
          label: "Center Leads (MoM)",
          link: "/mi-reporting/center-leads-mom",
          icon: "bx bx-bar-chart-alt-2",
        }
      : null,
    hasHubspotCenterLeadsPermission
      ? {
          id: "center-leads-mtd",
          label: "Center Leads (MTD)",
          link: "/mi-reporting/center-leads-mtd",
          icon: "bx bx-line-chart",
        }
      : null,
    hasHubspotOwnerLeadsPermission
      ? {
          id: "owner-leads-mom",
          label: "Owner Leads (MoM)",
          link: "/mi-reporting/owner-leads-mom",
          icon: "bx bx-bar-chart-square",
        }
      : null,
    hasHubspotOwnerLeadsPermission
      ? {
          id: "owner-leads-mtd",
          label: "Owner Leads (MTD)",
          link: "/mi-reporting/owner-leads-mtd",
          icon: "bx bx-trending-up",
        }
      : null,
    hasHubspotCityQualityPermission
      ? {
          id: "city-quality",
          label: "City Quality Breakdown",
          link: "/mi-reporting/city-quality",
          icon: "bx bx-map",
        }
      : null,
    hasHubspotOwnerQualityPermission
      ? {
          id: "owner-quality",
          label: "Owner Quality Breakdown",
          link: "/mi-reporting/owner-quality",
          icon: "bx bx-user-check",
        }
      : null,
    hasHubspotCityVisitPermission
      ? {
          id: "city-visit-date",
          label: "City Visit Date",
          link: "/mi-reporting/city-visit-date",
          icon: "bx bx-calendar",
        }
      : null,
    hasHubspotOwnerVisitPermission
      ? {
          id: "owner-visit-date",
          label: "Owner Visit Date",
          link: "/mi-reporting/owner-visit-date",
          icon: "bx bx-calendar-check",
        }
      : null,
    hasHubspotCityVisitedPermission
      ? {
          id: "city-visited-date",
          label: "City Visited Date",
          link: "/mi-reporting/city-visited-date",
          icon: "bx bx-calendar-event",
        }
      : null,
    hasHubspotOwnerVisitedPermission
      ? {
          id: "owner-visited-date",
          label: "Owner Visited Date",
          link: "/mi-reporting/owner-visited-date",
          icon: "bx bx-calendar-star",
        }
      : null,
    hasHubspotCityLeadStatusPermission
      ? {
          id: "city-lead-status",
          label: "City Lead Status",
          link: "/mi-reporting/city-lead-status",
          icon: "bx bx-bar-chart",
        }
      : null,
    hasHubspotOwnerLeadStatusPermission
      ? {
          id: "owner-lead-status",
          label: "Owner Lead Status",
          link: "/mi-reporting/owner-lead-status",
          icon: "bx bx-bar-chart-square",
        }
      : null,
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
                <h5 className="pb-0 mb-0">Hubspot Reporting</h5>
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
                {(HubspotReporting || [])
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
