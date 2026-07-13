import React, { useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink as RSNavLink, Spinner } from "reactstrap";
import AddVisitLog from "./AddVisitLog";
import VisitLogList from "./VisitLogList";
import Basic404 from "../AuthenticationInner/Errors/Basic404";
import { usePermissions } from "../../Components/Hooks/useRoles.js";

const Marketing = () => {
  const location = useLocation();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission, loading } = usePermissions(token);

  useEffect(() => {
    document.title = "Marketing | Jagruti Rehab";
  }, []);

  // Wait for permissions to finish loading before deciding access —
  // otherwise the first render (before data arrives) wrongly shows 404
  if (loading) {
    return (
      <div
        className="page-content d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  const canViewAdd = hasPermission("MARKETING", "ADD_VISIT_LOG", "READ");
  const canViewList = hasPermission("MARKETING", "VIEW_VISIT_LOGS", "READ");

  if (!canViewAdd && !canViewList) {
    return <Basic404 />;
  }

  const MARKETING_SUBNAV = [
    canViewAdd && { label: "Add Visit Log", link: "/marketing/visit-log/add" },
    canViewList && { label: "All Visit Logs", link: "/marketing/visit-log/list" },
  ].filter(Boolean);

  return (
    <div className="page-content marketing-shell">
      <style>{`
        .marketing-shell {
          --mkt-primary: #3577f1;
          --mkt-border: #e5e7eb;
          --mkt-muted: #8a92a6;
          --mkt-ink: #2a2f3c;
        }
        .marketing-shell .marketing-tabs {
          border-bottom: 1px solid var(--mkt-border);
          gap: 4px;
          flex-wrap: nowrap;
          overflow-x: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .marketing-shell .marketing-tabs::-webkit-scrollbar { display: none; }
        .marketing-shell .marketing-tabs .nav-item { flex-shrink: 0; }
        .marketing-shell .marketing-tab {
          font-size: 14px;
          font-weight: 500;
          color: var(--mkt-muted) !important;
          background: transparent !important;
          border: none !important;
          border-bottom: 2px solid transparent !important;
          border-radius: 0 !important;
          padding: 10px 4px !important;
          margin-right: 24px;
          white-space: nowrap;
          transition: color .15s ease, border-color .15s ease;
        }
        .marketing-shell .marketing-tab:hover {
          color: var(--mkt-ink) !important;
        }
        .marketing-shell .marketing-tab.active {
          color: var(--mkt-primary) !important;
          border-bottom-color: var(--mkt-primary) !important;
          font-weight: 600;
        }
      `}</style>

      {MARKETING_SUBNAV.length > 1 && (
        <Row className="mb-4">
          <Col xs={12}>
            <Nav pills className="marketing-tabs">
              {MARKETING_SUBNAV.map((item) => (
                <NavItem key={item.link}>
                  <RSNavLink
                    tag={Link}
                    to={item.link}
                    active={location.pathname === item.link}
                    className={"marketing-tab" + (location.pathname === item.link ? " active" : "")}
                  >
                    {item.label}
                  </RSNavLink>
                </NavItem>
              ))}
            </Nav>
          </Col>
        </Row>
      )}

      <Routes>
        {canViewAdd && <Route path="visit-log/add" element={<AddVisitLog />} />}
        {canViewList && <Route path="visit-log/list" element={<VisitLogList />} />}
        <Route
          index
          element={<Navigate to={canViewAdd ? "visit-log/add" : "visit-log/list"} replace />}
        />
        <Route path="*" element={<Basic404 />} />
      </Routes>
    </div>
  );
};

export default Marketing;