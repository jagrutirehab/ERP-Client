import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Compliance } from "../../Components/constants/pages";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { getComplianceSubmissions } from "../../helpers/backend_helper";
import { useAuthError } from "../../Components/Hooks/useAuthError";

let _sidebarOpenCache = null;

const getSidebarInitialState = () => {
  if (_sidebarOpenCache !== null) return _sidebarOpenCache;

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

  try {
    const stored = sessionStorage.getItem("complianceSidebarOpen");
    if (stored !== null) {
      _sidebarOpenCache = stored === "true";
      return _sidebarOpenCache;
    }
  } catch (_) {
  }

  _sidebarOpenCache = isDesktop;
  return _sidebarOpenCache;
};

const Sidebar = () => {
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { roles, hasPermission } = usePermissions(token);
  const handleAuthError = useAuthError();

  const hasOverviewPermission = hasPermission("COMPLIANCE", "OVERVIEW", "READ");
  const hasCentresPermission = hasPermission("COMPLIANCE", "CENTRES", "READ");
  const hasRegisterPermission = hasPermission("COMPLIANCE", "REGISTER", "READ");
  const hasTypesPermission = hasPermission("COMPLIANCE", "COMPLIANCE_TYPES", "READ");
  const hasCategoriesPermission = hasPermission("COMPLIANCE", "CATEGORIES", "READ");
  const hasApprovalsPermission = hasPermission("COMPLIANCE", "APPROVALS", "READ");
  const hasMyDraftsPermission = hasPermission("COMPLIANCE", "MY_DRAFTS", "READ");
  const hasAllDraftsPermission = hasPermission("COMPLIANCE", "ALL_DRAFTS", "READ");

  const location = useLocation();
  const currentUrl = location.pathname + location.search;

  const [openSection, setOpenSection] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(getSidebarInitialState);
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const accordionRefs = useRef({});
  const triggerRefs = useRef({});
  const flyoutRef = useRef(null);

  const storePending = useSelector((state) => state.Compliance?.submissionCounts?.PENDING);

  useEffect(() => {
    let cancelled = false;
    const loadPendingCount = async () => {
      try {
        const res = await getComplianceSubmissions({ status: "PENDING", limit: 1 });
        if (!cancelled) setPendingCount(res?.counts?.PENDING || 0);
      } catch (error) {
        handleAuthError(error);
        if (!cancelled) setPendingCount(0);
      }
    };
    loadPendingCount();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, storePending]);

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? "" : id));
  };

  useEffect(() => {
    if (!collapsed || !openSection) return;

    const handleClickOutside = (e) => {
      const trigger = triggerRefs.current[openSection];
      if (flyoutRef.current?.contains(e.target)) return;
      if (trigger?.contains(e.target)) return;
      setOpenSection("");
    };
    const closeOnScroll = () => setOpenSection("");

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [collapsed, openSection]);

  useEffect(() => {
    _sidebarOpenCache = isSidebarOpen;
    try {
      sessionStorage.setItem("complianceSidebarOpen", String(isSidebarOpen));
    } catch (_) {
    }
  }, [isSidebarOpen]);

  const permissionsConfigured = roles?.permissions?.some((p) => p.module === "COMPLIANCE");

  const childPermission = (childId) => {
    if (childId === "compliance-my-drafts") return hasMyDraftsPermission;
    if (childId === "compliance-all-drafts") return hasAllDraftsPermission;
    return true;
  };

  const filteredPages = useMemo(() => {
    return Compliance.map((page) => ({
      ...page,
      children: page.children
        ? page.children.filter((child) => !permissionsConfigured || childPermission(child.id))
        : undefined,
    })).filter((page) => {
      if (page.children) return page.children.length > 0;
      if (!permissionsConfigured) return true;
      if (page.id === "compliance-overview") return hasOverviewPermission;
      if (page.id === "compliance-centres") return hasCentresPermission;
      if (page.id === "compliance-register") return hasRegisterPermission;
      if (page.id === "compliance-types") return hasTypesPermission;
      if (page.id === "compliance-categories") return hasCategoriesPermission;
      if (page.id === "compliance-approvals") return hasApprovalsPermission;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    permissionsConfigured,
    hasOverviewPermission,
    hasCentresPermission,
    hasRegisterPermission,
    hasTypesPermission,
    hasCategoriesPermission,
    hasApprovalsPermission,
    hasMyDraftsPermission,
    hasAllDraftsPermission,
  ]);

  const isLinkActive = (link) => {
    if (link === "/compliance") return location.pathname === "/compliance";
    const base = link.split("/").slice(0, 3).join("/");
    return location.pathname.startsWith(base);
  };

  useEffect(() => {
    filteredPages.forEach((page) => {
      if (page.children?.some((child) => isLinkActive(child.link))) {
        setOpenSection(page.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPages, currentUrl, location.pathname]);

  return (
    <>
      <style>{`
        .accordion-wrap {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.25s ease, opacity 0.2s ease;
        }
        .accordion-wrap.open { opacity: 1; }

        li.active > a,
        li.active > div {
          background: rgba(0, 123, 255, 0.15) !important;
          color: #0d6efd !important;
        }
        li.parent-active > div {
          background: rgba(0, 123, 255, 0.08) !important;
          color: #0d6efd !important;
        }
        li.parent-active ul li { background: transparent !important; }

        .chat-leftsidebar {
          transition: min-width 0.25s ease, max-width 0.25s ease;
        }
        .chat-leftsidebar.sidebar-collapsed {
          min-width: 80px !important;
          max-width: 80px !important;
        }
        .chat-leftsidebar.sidebar-collapsed .sidebar-label,
        .chat-leftsidebar.sidebar-collapsed .sidebar-title,
        .chat-leftsidebar.sidebar-collapsed .accordion-chevron,
        .chat-leftsidebar.sidebar-collapsed .accordion-wrap {
          display: none !important;
        }
        .chat-leftsidebar.sidebar-collapsed li > a,
        .chat-leftsidebar.sidebar-collapsed li > div {
          justify-content: center;
          padding-left: 24px !important;
          padding-right: 24px !important;
        }
        .chat-leftsidebar.sidebar-collapsed li i {
          margin-right: 0 !important;
        }

        /* Accordion children render as a flyout beside the icon (via a
           portal, so it escapes PerfectScrollbar's clipping) instead of
           expanding the whole sidebar, so parent items with children stay
           icon-only while collapsed. */
        .sidebar-flyout {
          position: fixed;
          min-width: 220px;
          max-width: 260px;
          max-height: 70vh;
          overflow-y: auto;
          background: var(--vz-card-bg, #fff);
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
          padding: 6px 0;
          z-index: 1060;
        }
        .sidebar-flyout ul {
          margin-left: 0 !important;
        }
        .sidebar-collapse-toggle {
          border: none;
          background: transparent;
          cursor: pointer;
          color: inherit;
        }

        .chat-user-list li > a,
        .chat-user-list li > div {
          min-width: 0;
        }
        .chat-user-list .sidebar-label {
          min-width: 0;
        }
      `}</style>

      <div className={`chat-leftsidebar${collapsed ? " sidebar-collapsed" : ""}`}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h5 className="mb-0 sidebar-title">Compliance</h5>

          <div className="d-flex align-items-center gap-1">
            <button
              className="d-none d-md-inline-flex align-items-center sidebar-collapse-toggle"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <button
              className="btn btn-outline-secondary d-md-none"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div className={`${isSidebarOpen ? "d-block" : "d-none"} d-md-block`}>
          <PerfectScrollbar className="chat-room-list">
            <ul className="list-unstyled chat-list chat-user-list users-list px-3">
              {filteredPages.map((page) => {
                if (!page.children) {
                  return (
                    <li
                      key={page.id}
                      className={isLinkActive(page.link) ? "active mb-1" : "mb-1"}
                    >
                      <Link
                        className="d-flex align-items-center py-1"
                        to={page.link}
                        title={collapsed ? page.label : undefined}
                      >
                        <i className={`${page.icon} fs-5 me-2 flex-shrink-0`} />
                        <span className="fs-14 sidebar-label flex-grow-1 text-truncate text-nowrap">
                          {page.label}
                        </span>
                        {page.id === "compliance-approvals" && pendingCount > 0 && (
                          <span
                            className="badge rounded-pill bg-danger sidebar-label flex-shrink-0"
                            style={{ fontSize: 11 }}
                          >
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                }

                if (!accordionRefs.current[page.id]) {
                  accordionRefs.current[page.id] = React.createRef();
                }
                const contentRef = accordionRefs.current[page.id];

                const isParentActive = page.children.some((child) => isLinkActive(child.link));

                const isFlyoutOpen = collapsed && openSection === page.id;
                const triggerEl = triggerRefs.current[page.id];
                const triggerRect = isFlyoutOpen ? triggerEl?.getBoundingClientRect() : null;

                return (
                  <li key={page.id} className={`mb-1 ${isParentActive ? "parent-active" : ""}`}>
                    <div
                      ref={(el) => (triggerRefs.current[page.id] = el)}
                      onClick={() => toggleSection(page.id)}
                      className="d-flex align-items-center py-1 ps-4"
                      style={{ cursor: "pointer" }}
                      title={collapsed ? page.label : undefined}
                    >
                      <i className={`${page.icon} fs-5 me-2 flex-shrink-0`} />
                      <span className="fs-14 sidebar-label flex-grow-1 text-truncate text-nowrap">
                        {page.label}
                      </span>
                      <span
                        className="ms-auto fs-12 accordion-chevron flex-shrink-0"
                        style={{
                          transform: openSection === page.id ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        ▼
                      </span>
                    </div>

                    {triggerRect &&
                      createPortal(
                        <div
                          ref={flyoutRef}
                          className="sidebar-flyout"
                          style={{
                            top: triggerRect.top,
                            left: triggerRect.right + 6,
                          }}
                        >
                          <ul className="list-unstyled mt-0">
                            {page.children.map((child) => (
                              <li key={child.id} className={isLinkActive(child.link) ? "active" : ""}>
                                <Link
                                  className="d-flex align-items-center py-1 px-3"
                                  to={child.link}
                                  onClick={() => setOpenSection("")}
                                >
                                  <i className={`${child.icon} fs-5 me-2 flex-shrink-0`} />
                                  <span className="fs-13 text-truncate text-nowrap">{child.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>,
                        document.body,
                      )}

                    <div
                      ref={contentRef}
                      className={`accordion-wrap ${openSection === page.id ? "open" : ""}`}
                      style={{
                        maxHeight: openSection === page.id ? (contentRef.current?.scrollHeight ?? 0) : 0,
                      }}
                    >
                      <ul className="list-unstyled ms-4 mt-1">
                        {page.children.map((child) => (
                          <li key={child.id} className={isLinkActive(child.link) ? "active" : ""}>
                            <Link className="d-flex align-items-center py-1" to={child.link}>
                              <i className={`${child.icon} fs-5 me-2 flex-shrink-0`} />
                              <span className="fs-13 text-truncate text-nowrap">{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </PerfectScrollbar>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
