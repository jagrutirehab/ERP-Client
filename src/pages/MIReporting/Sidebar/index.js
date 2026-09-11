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
  const [isMISOpen, setIsMISOpen] = useState(true);
  const toggleMISCollapse = () => setIsMISOpen(!isMISOpen);

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



  const MISReports = [
    {
<<<<<<< Updated upstream
      id: "refund-amount",
      label: "Refund Amount",
      link: "/mi-reporting/refund-amount",
      icon: "bx bx-money",
    }
=======
      id: "dashboards",
      title: "Dashboards",
      items: [
        { id: "daily-dashboard", label: "Daily Dashboard", link: "/mi-reporting/daily-dashboard", icon: "bx bx-tachometer" },
        { id: "metrics-report", label: "Metrics Report", link: "/mi-reporting/metrics-report", icon: "bx bx-line-chart" },
      ],
    },
    {
      id: "finance-revenue",
      title: "💰 Finance & Revenue",
      items: [
        { id: "daily-invoices", label: "Daily Invoices", link: "/mi-reporting/daily-invoices", icon: "bx bx-receipt" },
        { id: "due-amount", label: "Due Amount", link: "/mi-reporting/due-amount", icon: "bx bx-wallet-alt" },
        { id: "opd-charges", label: "OPD Charges", link: "/mi-reporting/opd-charges", icon: "bx bx-money" },
        { id: "cash-per-center", label: "Cash Per Center", link: "/mi-reporting/cash-per-center", icon: "bx bx-wallet" },
        { id: "refund-amount", label: "Refund Amount", link: "/mi-reporting/refund-amount", icon: "bx bx-revision" },
        { id: "write-off-amount", label: "Write Off Amount", link: "/mi-reporting/write-off-amount", icon: "bx bx-money" },
        { id: "central-expenses", label: "Central Expenses", link: "/mi-reporting/central-expenses", icon: "bx bx-receipt" },
      ],
    },
    {
      id: "occupancy-patient-management",
      title: "🏥 Occupancy & Patient Management",
      items: [
        { id: "occupancy", label: "Occupancy", link: "/mi-reporting/occupancy", icon: "bx bx-bed" },
        { id: "readmission", label: "Readmission", link: "/mi-reporting/readmission", icon: "bx bx-repost" },
      ],
    },
    {
      id: "clinical-operations",
      title: "📋 Clinical Operations",
      items: [
        { id: "vital-signs", label: "Vital Signs", link: "/mi-reporting/vital-signs", icon: "bx bx-heart-circle" },
        { id: "round-notes", label: "Round Notes", link: "/mi-reporting/round-notes", icon: "bx bx-notepad" },
        { id: "clinical-notes", label: "Clinical Notes", link: "/mi-reporting/clinical-notes", icon: "bx bx-clipboard" },
      ],
    },
    {
      id: "doctor-counselling",
      title: "👨‍⚕️ Doctor & Counselling",
      items: [
        { id: "doctor-psychologist-stay-range", label: "Doctor/Psychologist Stay Range", link: "/mi-reporting/doctor-psychologist-stay-range", icon: "bx bx-time-five" },
        { id: "counselling-sessions-patients", label: "Counselling Patients", link: "/mi-reporting/counselling-sessions-patients", icon: "bx bx-conversation" },
        { id: "counselling-sessions", label: "Counselling Sessions", link: "/mi-reporting/counselling-sessions", icon: "bx bx-conversation" },
        { id: "counselling-recording", label: "Counselling Recording", link: "/mi-reporting/counselling-recording", icon: "bx bx-microphone" },
      ],
    },
    {
      id: "nursing-operations",
      title: "👩‍⚕️ Nursing Operations",
      items: [
        { id: "nurses-dod", label: "Nurses DOD", link: "/mi-reporting/nurses-dod", icon: "bx bx-capsule" },
        { id: "nurses-dashboard-dod", label: "Nurses Dashboard DOD", link: "/mi-reporting/nurses-dashboard-dod", icon: "bx bx-capsule" },
      ],
    },
    {
      id: "documentation-compliance",
      title: "📄 Documentation & Compliance",
      items: [
        { id: "patient-docs", label: "IPD Patient Docs", link: "/mi-reporting/patient-docs", icon: "bx bx-bed" },
        { id: "opd-patient-docs", label: "OPD Patient Docs", link: "/mi-reporting/opd-patient-docs", icon: "bx bx-walk" },
        { id: "docs-compliance", label: "Docs Compliance", link: "/mi-reporting/docs-compliance", icon: "bx bx-task" },
        { id: "forms-data", label: "Forms Data", link: "/mi-reporting/forms-data", icon: "bx bx-clipboard" },
      ],
    },
    {
      id: "quality-incidents",
      title: "⚠️ Quality & Incidents",
      items: [
        { id: "incident", label: "Incident", link: "/mi-reporting/incident", icon: "bx bx-error-circle" },
      ],
    },
    {
      id: "hr-attendance",
      title: "👥 HR & Attendance",
      items: [
        { id: "attendance", label: "Attendance", link: "/mi-reporting/attendance", icon: "bx bx-calendar-check" },
        { id: "attrition-data", label: "Attrition Data", link: "/mi-reporting/attrition-data", icon: "bx bx-user-minus" },
      ],
    },
>>>>>>> Stashed changes
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
          <div className="ps-4 pe-3 pt-2">
            <div className="d-flex align-items-start">
              <div className="d-flex justify-content-between w-100 mb-2">
                <div
                  onClick={toggleMISCollapse}
                  className="d-flex align-items-center justify-content-between w-100 cursor-pointer"
                  style={{ cursor: "pointer" }}
                >
                  <h5 className="pb-0 mb-0">MIS Reports</h5>
                  <i
                    className={`mdi mdi-chevron-${isMISOpen ? "up" : "down"} fs-4`}
                  ></i>
                </div>
              </div>
            </div>
          </div>

          <Collapse isOpen={isMISOpen}>
            <ul className="list-unstyled chat-list chat-user-list users-list">
              {(MISReports || []).map((page, idx) => (
                <li
                  key={idx}
                  className={location.pathname === page.link ? "active" : ""}
                >
                  <Link to={page.link}>
                    <div className="d-flex align-items-center">
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
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Collapse>
        </PerfectScrollbar>
      </div>
    </div>
  );
};

export default Sidebar;
