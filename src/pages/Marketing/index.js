import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink as RSNavLink } from "reactstrap";
import AddVisitLog from "./AddVisitLog";
import VisitLogList from "./VisitLogList";

const MARKETING_SUBNAV = [
  { label: "Add Visit Log", link: "/marketing/visit-log/add" },
  { label: "All Visit Logs", link: "/marketing/visit-log/list" },
];

const Marketing = () => {
  const location = useLocation();

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

      <Routes>
        <Route path="visit-log/add" element={<AddVisitLog />} />
        <Route path="visit-log/list" element={<VisitLogList />} />
        <Route index element={<Navigate to="visit-log/add" replace />} />
      </Routes>
    </div>
  );
};

export default Marketing;