import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "../../Components/Hooks/useRoles";

const SIDEBAR_WIDTH = 260;

const Sidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 992,
  );
  const [offsetTop, setOffsetTop] = useState(0);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const anchorRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Measure exactly where this component sits on first paint, so we can pin it
  // there with position:fixed — this bypasses any parent's overflow/sticky quirks entirely.
  useEffect(() => {
    const measure = () => {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setOffsetTop(rect.top);
        setOffsetLeft(rect.left);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isMobile]);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission } = usePermissions(token);

  const canViewAdd = hasPermission("MARKETING", "ADD_VISIT_LOG", "READ");
  const canViewList = hasPermission("MARKETING", "VIEW_VISIT_LOGS", "READ");
  const canViewReport = hasPermission("MARKETING", "VIEW_AGENT_REPORT", "READ");

  const MarketingPages = [
    canViewAdd
      ? { id: "visit-log-add", label: "Add Visit Log", link: "/marketing/visit-log/add", icon: "bx bx-plus-circle" }
      : null,
    canViewList
      ? { id: "visit-log-list", label: "All Visit Logs", link: "/marketing/visit-log/list", icon: "bx bx-list-ul" }
      : null,
    canViewReport
      ? { id: "agent-report", label: "Agent Report", link: "/marketing/reports/agent", icon: "bx bx-bar-chart-alt-2" }
      : null,
  ].filter(Boolean);

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
        overflowY: "auto",
        overflowX: "hidden",
        background: "#fff",
        boxShadow: isMobileOpen ? "4px 0 16px rgba(0,0,0,0.18)" : "none",
      }
    : {
        position: "fixed",
        top: offsetTop,
        left: offsetLeft,
        height: `calc(100vh - ${offsetTop}px)`,
        width: `${SIDEBAR_WIDTH}px`,
        minWidth: `${SIDEBAR_WIDTH}px`,
        overflowY: "auto",
        overflowX: "hidden",
        background: "#fff",
        borderRight: "1px solid #eef0f2",
        zIndex: 100,
      };

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1040 }}
        />
      )}

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
            background: "#3577f1",
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

      {!isMobile && (
        <div ref={anchorRef} style={{ width: `${SIDEBAR_WIDTH}px`, minWidth: `${SIDEBAR_WIDTH}px`, flexShrink: 0 }} />
      )}
      {isMobile && <div ref={anchorRef} style={{ width: 0, height: 0 }} />}

      <div style={sidebarStyle}>
        <div className="px-3 pt-4 pb-3">
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="fw-bold mb-0 text-dark">Marketing</h4>
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="btn btn-sm px-2"
              >
                <i className="bx bx-x fs-4"></i>
              </button>
            )}
          </div>
        </div>

        <div className="px-2 pb-4">
          {MarketingPages.map((page) => {
            const active = location.pathname === page.link;
            return (
              <Link
                key={page.id}
                to={page.link}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className="text-decoration-none d-block"
              >
                <div
                  className="d-flex align-items-center gap-2 px-3 py-2 mb-1 rounded-2"
                  style={{
                    background: active ? "rgba(53,119,241,0.1)" : "transparent",
                    color: active ? "#3577f1" : "#4b5563",
                  }}
                >
                  <i className={page.icon} style={{ fontSize: "20px" }}></i>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {page.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;