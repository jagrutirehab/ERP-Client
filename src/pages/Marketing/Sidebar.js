import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";

const SIDEBAR_WIDTH = 260;

const Sidebar = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 992,
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [leftOffset, setLeftOffset] = useState(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const measure = () => {
      const header = document.getElementById("page-topbar");
      if (header) {
        setTopOffset(header.getBoundingClientRect().bottom);
      }
      const primaryNav =
        document.querySelector(".navbar-menu") ||
        document.querySelector(".app-menu") ||
        document.getElementById("vertical-menu");
      if (primaryNav) {
        setLeftOffset(primaryNav.getBoundingClientRect().width);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const interval = setInterval(measure, 500); // catches late header/nav mount or resize
    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(interval);
    };
  }, []);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission } = usePermissions(token);

  const canViewAdd = hasPermission("MARKETING", "ADD_VISIT_LOG", "READ");
  const canViewList = hasPermission("MARKETING", "VIEW_VISIT_LOGS", "READ");
  const canViewReport = hasPermission("MARKETING", "VIEW_AGENT_REPORT", "READ");
  const canViewProfile = hasPermission(
    "MARKETING",
    "VIEW_AGENT_PROFILE",
    "READ",
  );

  const MarketingPages = [
    canViewAdd
      ? {
          id: "visit-log-add",
          label: "Add Visit Log",
          link: "/marketing/visit-log/add",
          icon: "bx bx-plus-circle",
        }
      : null,
    canViewList
      ? {
          id: "visit-log-list",
          label: "All Visit Logs",
          link: "/marketing/visit-log/list",
          icon: "bx bx-list-ul",
        }
      : null,
    canViewReport
      ? {
          id: "agent-report",
          label: "Agent Report",
          link: "/marketing/reports/agent",
          icon: "bx bx-bar-chart-alt-2",
        }
      : null,
    canViewProfile
      ? {
          id: "my-profile",
          label: "My Visit History",
          link: "/marketing/my-profile",
          icon: "bx bx-id-card",
        }
      : null,
  ].filter(Boolean);

  const renderList = (showLabels) => (
    <div style={{ padding: "0 8px 16px 8px" }}>
      {MarketingPages.map((page) => {
        const active = location.pathname === page.link;
        return (
          <Link
            key={page.id}
            to={page.link}
            onClick={() => isMobile && setIsMobileOpen(false)}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "4px",
                background: active ? "rgba(53,119,241,0.1)" : "transparent",
                color: active ? "#3577f1" : "#495057",
              }}
            >
              <i
                className={page.icon}
                style={{ fontSize: 20, flexShrink: 0 }}
              ></i>
              {showLabels && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {page.label}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ background: "#fff", borderBottom: "1px solid #eef0f2" }}>
        <div className="px-3 pt-4 pb-3 d-flex align-items-center justify-content-between">
          <h4 className="fw-bold mb-0 ">Marketing</h4>
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="btn btn-sm px-2"
            style={{ background: "transparent", border: "none" }}
          >
            <i
              className={`bx ${isMobileOpen ? "bx-x" : "bx-menu"} fs-4`}
            ></i>{" "}
          </button>
        </div>
        <div
          style={{
            maxHeight: isMobileOpen ? "1000px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}
        >
          {renderList(true)}
        </div>{" "}
      </div>
    );
  }

  return (
    <>
      <div
        style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH, flexShrink: 0 }}
      />
      {createPortal(
        <div
          style={{
            position: "fixed",
            top: topOffset,
            left: leftOffset,
            height: `calc(100vh - ${topOffset}px)`,
            width: SIDEBAR_WIDTH,
            overflowY: "auto",
            overflowX: "hidden",
            background: "#fff",
            borderRight: "1px solid #eef0f2",
            zIndex: 100,
          }}
        >
          <div className="px-3 pt-4 pb-3">
            <h4 className="fw-bold mb-0 text-dark">Marketing</h4>
          </div>
          {renderList(true)}
        </div>,
        document.body,
      )}
    </>
  );
};

export default Sidebar;
