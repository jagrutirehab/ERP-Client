import React, { useEffect, useRef, useState } from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { Link, useLocation } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Collapse } from "reactstrap";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMISOpen, setIsMISOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 992
  );

  const toggleMISCollapse = () => setIsMISOpen(!isMISOpen);
  const toggleCollapse = () => setIsOpen(!isOpen);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sidebarRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const showLabels = isMobile ? true : isHovered;

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasHubspotCenterLeadsPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_CENTER_LEADS_COUNT", "READ");
  const hasHubspotOwnerLeadsPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_OWNER_LEADS_COUNT", "READ");
  const hasHubspotCityQualityPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_CITY_QUALITY_BREAKDOWN", "READ");
  const hasHubspotOwnerQualityPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_OWNER_QUALITY_BREAKDOWN", "READ");
  const hasHubspotCityVisitPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_CITY_VISIT_DATE", "READ");
  const hasHubspotOwnerVisitPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_OWNER_VISIT_DATE", "READ");
  const hasHubspotCityVisitedPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_CITY_VISITED_DATE", "READ");
  const hasHubspotOwnerVisitedPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_OWNER_VISITED_DATE", "READ");
  const hasHubspotCityLeadStatusPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_CITY_LEAD_STATUS", "READ");
  const hasHubspotOwnerLeadStatusPermission = hasPermission("HUBSPOT_REPORTING", "HUBSPOT_OWNER_LEAD_STATUS", "READ");
  const hasMISPermission = hasPermission("MIS_REPORTS", "MIS_REPORTS_PERMISSION", "READ");

  const HubspotReporting = [
    hasHubspotCenterLeadsPermission ? { id: "center-leads-mom", label: "Center Leads (MoM)", link: "/mi-reporting/center-leads-mom", icon: "bx bx-bar-chart-alt-2" } : null,
    hasHubspotCenterLeadsPermission ? { id: "center-leads-mtd", label: "Center Leads (MTD)", link: "/mi-reporting/center-leads-mtd", icon: "bx bx-line-chart" } : null,
    hasHubspotOwnerLeadsPermission ? { id: "owner-leads-mom", label: "Owner Leads (MoM)", link: "/mi-reporting/owner-leads-mom", icon: "bx bx-bar-chart-square" } : null,
    hasHubspotOwnerLeadsPermission ? { id: "owner-leads-mtd", label: "Owner Leads (MTD)", link: "/mi-reporting/owner-leads-mtd", icon: "bx bx-trending-up" } : null,
    hasHubspotCityQualityPermission ? { id: "city-quality", label: "City Quality Breakdown", link: "/mi-reporting/city-quality", icon: "bx bx-map" } : null,
    hasHubspotOwnerQualityPermission ? { id: "owner-quality", label: "Owner Quality Breakdown", link: "/mi-reporting/owner-quality", icon: "bx bx-user-check" } : null,
    hasHubspotCityVisitPermission ? { id: "city-visit-date", label: "City Visit Date", link: "/mi-reporting/city-visit-date", icon: "bx bx-calendar" } : null,
    hasHubspotOwnerVisitPermission ? { id: "owner-visit-date", label: "Owner Visit Date", link: "/mi-reporting/owner-visit-date", icon: "bx bx-calendar-check" } : null,
    hasHubspotCityVisitedPermission ? { id: "city-visited-date", label: "City Visited Date", link: "/mi-reporting/city-visited-date", icon: "bx bx-calendar-event" } : null,
    hasHubspotOwnerVisitedPermission ? { id: "owner-visited-date", label: "Owner Visited Date", link: "/mi-reporting/owner-visited-date", icon: "bx bx-calendar-star" } : null,
    hasHubspotCityLeadStatusPermission ? { id: "city-lead-status", label: "City Lead Status", link: "/mi-reporting/city-lead-status", icon: "bx bx-bar-chart" } : null,
    hasHubspotOwnerLeadStatusPermission ? { id: "owner-lead-status", label: "Owner Lead Status", link: "/mi-reporting/owner-lead-status", icon: "bx bx-bar-chart-square" } : null,
  ];

  const MISReports = [
    { id: "refund-amount", label: "Refund Amount", link: "/mi-reporting/refund-amount", icon: "bx bx-money" },
    { id: "round-notes", label: "Round Notes", link: "/mi-reporting/round-notes", icon: "bx bx-money" },
    { id: "clinical-notes", label: "Clinical Notes", link: "/mi-reporting/clinical-notes", icon: "bx bx-money" },
    { id: "vital-signs", label: "Vital Signs", link: "/mi-reporting/vital-signs", icon: "bx bx-money" },
    { id: "patient-docs", label: "IPD Patient Docs", link: "/mi-reporting/patient-docs", icon: "bx bx-money" },
    { id: "opd-patient-docs", label: "OPD Patient Docs", link: "/mi-reporting/opd-patient-docs", icon: "bx bx-money" },
    { id: "daily-invoices", label: "Daily Invoices", link: "/mi-reporting/daily-invoices", icon: "bx bx-money" },
    { id: "counselling-sessions", label: "Counselling Sessions", link: "/mi-reporting/counselling-sessions", icon: "bx bx-money" },
    { id: "counselling-recording", label: "Counselling Recording", link: "/mi-reporting/counselling-recording", icon: "bx bx-money" },
  ];

  const sidebarStyle = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: isMobileOpen ? 0 : "-280px",
        height: "100vh",
        width: "260px",
        minWidth: "260px",
        zIndex: 1045,
        transition: "left 0.3s ease",
        overflow: "hidden",
        background: "#fff",
        boxShadow: isMobileOpen ? "4px 0 16px rgba(0,0,0,0.18)" : "none",
      }
    : {
        position: "sticky",
        top: 0,
        height: "100vh",
        alignSelf: "flex-start",
        flexShrink: 0,
        width: isHovered ? "260px" : "70px",
        minWidth: isHovered ? "260px" : "70px",
        transition: "width 0.25s ease, min-width 0.25s ease",
        overflow: "hidden",
      };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1040,
          }}
        />
      )}

      {/* Mobile hamburger FAB */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            left: 16,
            zIndex: 1050,
            borderRadius: "50%",
            width: 48,
            height: 48,
            border: "none",
            background: "green",
            color: "white",
            fontSize: 22,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
          }}
        >
          <i className="bx bx-menu"></i>
        </button>
      )}

      <div
        ref={sidebarRef}
        className="chat-leftsidebar"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        style={sidebarStyle}
      >
        <div className="ps-4 pe-3 pt-4 mb-">
          <div className="d-flex align-items-start">
            <div className="d-flex justify-content-between w-100 mb-2">
              <div
                onClick={toggleCollapse}
                className="d-flex align-items-center justify-content-between w-100 cursor-pointer"
                style={{ cursor: "pointer" }}
              >
                {showLabels && <h5 className="pb-0 mb-0">Hubspot Reporting</h5>}
                <i className={`mdi mdi-chevron-${isOpen ? "up" : "down"} fs-4`}></i>
              </div>
              {isMobile && (
                <button
                  onClick={() => setIsMobileOpen(false)}
                  type="button"
                  className="btn btn-sm px-2"
                >
                  <i className="bx bx-x fs-5"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <PerfectScrollbar className="chat-room-list">
          <div className="chat-message-list">
            <Collapse isOpen={isOpen}>
              <ul className="list-unstyled chat-list chat-user-list users-list" id="userList">
                {(HubspotReporting || []).filter((m) => m).map((page, idx) => (
                  <li key={idx} className={location.pathname === page.link ? "active" : ""}>
                    <Link to={page.link} onClick={() => isMobile && setIsMobileOpen(false)}>
                      <div className={`d-flex align-items-center ${showLabels ? "" : "justify-content-center"}`}>
                        <div
                          className="flex-shrink-0 chat-user-img online align-self-center ms-0"
                          style={{ marginRight: showLabels ? "0.5rem" : "0" }}
                        >
                          <div className="avatar-xxs">
                            <i className={`${page.icon} fs-4`}></i>
                          </div>
                          <span className="user-status"></span>
                        </div>
                        {showLabels && (
                          <div className="flex-grow-1 overflow-hidden">
                            <p className="text-truncate font-semi-bold fs-15 mb-0">{page.label || ""}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Collapse>
          </div>

          {hasMISPermission && (
            <>
              <div className="ps-4 pe-3 pt-2">
                <div className="d-flex align-items-start">
                  <div className="d-flex justify-content-between w-100 mb-2">
                    <div
                      onClick={toggleMISCollapse}
                      className="d-flex align-items-center justify-content-between w-100 cursor-pointer"
                      style={{ cursor: "pointer" }}
                    >
                      {showLabels && <h5 className="pb-0 mb-0">MIS Reports</h5>}
                      <i className={`mdi mdi-chevron-${isMISOpen ? "up" : "down"} fs-4`}></i>
                    </div>
                  </div>
                </div>
              </div>
              <Collapse isOpen={isMISOpen}>
                <ul className="list-unstyled chat-list chat-user-list users-list">
                  {(MISReports || []).map((page, idx) => (
                    <li key={idx} className={location.pathname === page.link ? "active" : ""}>
                      <Link to={page.link} onClick={() => isMobile && setIsMobileOpen(false)}>
                        <div className={`d-flex align-items-center ${showLabels ? "" : "justify-content-center"}`}>
                          <div
                            className="flex-shrink-0 chat-user-img online align-self-center ms-0"
                            style={{ marginRight: showLabels ? "0.5rem" : "0" }}
                          >
                            <div className="avatar-xxs">
                              <i className={`${page.icon} fs-4`}></i>
                            </div>
                          </div>
                          {showLabels && (
                            <div className="flex-grow-1 overflow-hidden">
                              <p className="text-truncate font-semi-bold fs-15 mb-0">{page.label}</p>
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Collapse>
            </>
          )}
        </PerfectScrollbar>
      </div>
    </>
  );
};

export default Sidebar;
