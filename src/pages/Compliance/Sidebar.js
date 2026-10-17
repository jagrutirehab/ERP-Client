import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Compliance } from "../../Components/constants/pages";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { getComplianceSubmissions } from "../../helpers/backend_helper";

const Sidebar = () => {
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { roles, hasPermission } = usePermissions(token);

  // Same pattern as the Pharmacy/HR sidebars: one hasPermission() check per
  // page, filtered against the COMPLIANCE module's sub-permissions.
  const hasOverviewPermission = hasPermission("COMPLIANCE", "OVERVIEW", "READ");
  const hasCentresPermission = hasPermission("COMPLIANCE", "CENTRES", "READ");
  const hasRegisterPermission = hasPermission("COMPLIANCE", "REGISTER", "READ");
  const hasTypesPermission = hasPermission("COMPLIANCE", "COMPLIANCE_TYPES", "READ");
  const hasCategoriesPermission = hasPermission("COMPLIANCE", "CATEGORIES", "READ");
  const hasApprovalsPermission = hasPermission("COMPLIANCE", "APPROVALS", "READ");

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // When Approvals approves/rejects, the store's count changes -> re-check here too
  const storePending = useSelector((state) => state.Compliance?.submissionCounts?.PENDING);

  // Real pending count from the API. Re-checks on every page change inside
  // Compliance, so it updates after sending a submission or approving one.
  useEffect(() => {
    let cancelled = false;
    getComplianceSubmissions({ status: "PENDING", limit: 1 })
      .then((res) => {
        if (!cancelled) setPendingCount(res?.counts?.PENDING || 0);
      })
      .catch(() => {
        if (!cancelled) setPendingCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname, storePending]);

  // The backend doesn't have a COMPLIANCE module in anyone's role yet, so
  // hasPermission() would return false for everyone and hide the whole menu.
  // Until that's added, fall back to showing every page; the moment a role
  // actually carries COMPLIANCE permissions, the checks above take over
  // exactly like they do for Pharmacy/HR — no further change needed here.
  const permissionsConfigured = roles?.permissions?.some((p) => p.module === "COMPLIANCE");

  const filteredPages = Compliance.filter((page) => {
    if (!permissionsConfigured) return true;
    if (page.id === "compliance-overview") return hasOverviewPermission;
    if (page.id === "compliance-centres") return hasCentresPermission;
    if (page.id === "compliance-register") return hasRegisterPermission;
    if (page.id === "compliance-types") return hasTypesPermission;
    if (page.id === "compliance-categories") return hasCategoriesPermission;
    if (page.id === "compliance-approvals") return hasApprovalsPermission;
    return true;
  });

  const isActive = (page) => {
    if (page.id === "compliance-overview") return location.pathname === "/compliance";
    // "/compliance/centres/:id" should stay highlighted for any centre.
    const base = page.link.split("/").slice(0, 3).join("/");
    return location.pathname.startsWith(base);
  };

  return (
    <>
      <style>
        {`
          @media (min-width: 992px) {
            .compliance-sidebar {
              min-width: 240px;
              max-width: 240px;
              transition: min-width 0.2s ease, max-width 0.2s ease;
            }
            .compliance-sidebar.collapsed {
              min-width: 68px;
              max-width: 68px;
            }
            .compliance-sidebar.collapsed .compliance-nav-label,
            .compliance-sidebar.collapsed .compliance-sidebar-title {
              display: none !important;
            }
            .compliance-sidebar.collapsed .compliance-nav a {
              justify-content: center;
            }
          }
          @media (max-width: 991.98px) {
            .compliance-sidebar-collapse-btn {
              display: none !important;
            }
            .compliance-sidebar {
              border-right: none !important;
              border-bottom: 1px solid var(--vz-border-color, #e9ebec);
            }
            .compliance-nav {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              padding: 0 0.75rem 0.75rem;
            }
            .compliance-nav li {
              margin: 0 !important;
            }
            .compliance-nav li > a {
              padding: 6px 12px !important;
              border-radius: 999px;
              background: #F5F6F3;
            }
          }
          .compliance-nav li {
            margin-bottom: 2px;
          }
          .compliance-nav li > a {
            color: #495057;
            font-size: 15px;
            font-weight: 500;
            border-radius: 6px;
          }
          .compliance-nav li.active > a {
            background: #EAF2FF;
            color: #1B4D47;
            font-weight: 600;
          }
          .compliance-nav li.active > a i {
            color: #1B4D47;
          }
          .compliance-nav li > a:hover {
            background: #F5F6F3;
            color: #1B4D47;
          }
        `}
      </style>
      <div
        className={`compliance-sidebar bg-white border-end flex-shrink-0 p-2 ${collapsed ? "collapsed" : ""}`}
      >
        <div className="d-flex align-items-center justify-content-between px-3 py-3">
          <h5 className="mb-0 compliance-sidebar-title fw-semibold">Compliance</h5>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-sm border-0 bg-transparent p-1 compliance-sidebar-collapse-btn"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <i className={`bx ${collapsed ? "bx-chevron-right" : "bx-chevron-left"} fs-4 text-muted`} />
          </button>
        </div>
        <ul className="list-unstyled compliance-nav mb-0">
          {filteredPages.map((page) => (
            <li key={page.id} className={isActive(page) ? "active" : ""}>
              <Link
                to={page.link}
                className="d-flex align-items-center gap-2 py-2 px-3 text-decoration-none"
                title={collapsed ? page.label : undefined}
              >
                <i className={`${page.icon} fs-5 flex-shrink-0`} />
                <span className="compliance-nav-label text-truncate flex-grow-1">{page.label}</span>
                {page.id === "compliance-approvals" && pendingCount > 0 && (
                  <span
                    className="compliance-nav-label badge rounded-pill bg-danger"
                    style={{ fontSize: 11 }}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;