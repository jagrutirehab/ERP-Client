import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import { ISSUES } from "../../../Components/constants/pages";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const IssuesSidebar = () => {
  const location = useLocation();
  const [openSection, setOpenSection] = useState("");
  const accordionRefs = useRef({});

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? "" : id);
  };

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const hasIssuesPermission = hasPermission("ISSUES", "ISSUES", "READ")
  const hasMyIssuesPermission = hasPermission("ISSUES", "MY_ISSUES", "READ");
  const hasRaiseTicketPermission = hasPermission("ISSUES", "RAISE_TICKET", "READ");
  // const hasTicketDashboardPermission = hasPermission("ISSUES", "TICKET_DASHBOARD", "READ");
  const hasTechnicalIssuesPermission = hasPermission("ISSUES", "TECHNICAL_ISSUES", "READ");
  const hasHRIssuesPermission = hasPermission("ISSUES", "HR_ISSUES", "READ");
  const hasHRIssuesRequestsPermission = hasPermission("ISSUES", "HR_ISSUES_REQUESTS", "READ");


  const navigate = useNavigate();


  const filteredIssuesOptions = ISSUES.filter((page) => {
    if (page.id === "raise-ticket") return hasRaiseTicketPermission;
    if (page.id === "my-issues") return hasMyIssuesPermission;
    if (page.id === "tech-issues") return hasTechnicalIssuesPermission;

    if (page.id === "hr-issues") return hasHRIssuesPermission;

    if (page.id === "hr-issues-requests") return hasHRIssuesRequestsPermission;
    // if (page.id === "purchase-issues") return hasPermission("ISSUES", "PURCHASE_ISSUES", "READ");
    // if (page.id === "review-submissions") return hasPermission("ISSUES", "REVIEW_SUBMISSIONS", "READ");
    if (page.id === "my-raised-tickets") return hasPermission("ISSUES", "MY_RAISED_TICKETS", "READ");
    if (page.id === "finance-tickets") return hasPermission("ISSUES", "FINANCE_ISSUES", "READ")
    if (page.id === "finance-tickets-approval") return hasPermission("ISSUES", "FINANCE_ISSUES_APPROVAL", "READ")



    return false;
  });

  useEffect(() => {
    filteredIssuesOptions.forEach((page) => {
      if (
        page.isAccordion &&
        page.children?.some((child) =>
          location.pathname.startsWith(child.link)
        )
      ) {
        setOpenSection(page.id);
      }
    });
  }, [location.pathname]);

  return (
    <>
      <style>
        {`
        .accordion-wrap {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.25s ease, opacity 0.2s ease;
        }

        .accordion-wrap.open {
          opacity: 1;
        }

        li.active > a {
          background: rgba(0, 123, 255, 0.15) !important;
          color: #0d6efd !important;
        }

        li.parent-active > div {
          background: rgba(0, 123, 255, 0.08) !important;
          color: #0d6efd !important;
        }
      `}
      </style>

      <div className="chat-leftsidebar" style={{ minWidth: "300px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h5 className="mb-0">Issues</h5>
        </div>

        <PerfectScrollbar className="chat-room-list">
          <ul className="list-unstyled chat-list chat-user-list users-list ps-4 pe-3 pt-2">
            {filteredIssuesOptions.map((page) => {
              const hasChildren = page.children && page.children.length > 0;

              if (!accordionRefs.current[page.id]) {
                accordionRefs.current[page.id] = React.createRef();
              }

              const contentRef = accordionRefs.current[page.id];

              return (
                <li key={page.id} className="mb-1">

                  {hasChildren ? (
                    <>
                      {/* Parent */}
                      <div
                        onClick={() => toggleSection(page.id)}
                        className="d-flex align-items-center py-2"
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`${page.icon} fs-4 me-2`} />
                        <span className="fs-15">{page.label}</span>

                        <span
                          className="ms-auto fs-12"
                          style={{
                            transform:
                              openSection === page.id
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          ▼
                        </span>
                      </div>

                      {/* Children */}
                      <div
                        ref={contentRef}
                        className={`accordion-wrap ${openSection === page.id ? "open" : ""
                          }`}
                        style={{
                          maxHeight:
                            openSection === page.id
                              ? contentRef.current?.scrollHeight ?? 0
                              : 0,
                        }}
                      >
                        <ul className="list-unstyled ms-4 mt-1">
                          {page.children?.map((child) => (
                            <li
                              key={child.id}
                              className={
                                location.pathname.startsWith(child.link)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link className="d-flex py-1" to={child.link}>
                                <i className={`${child.icon} fs-5 me-2`} />
                                <span className="fs-14">{child.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => navigate(page.link)}
                      className={`d-flex align-items-center py-2 ${location.pathname.startsWith(page.link) ? "active" : ""
                        }`}
                      style={{ paddingLeft: "0px", cursor: "pointer" }}
                    >
                      <i className={`${page.icon} fs-4 me-2`} />
                      <span className="fs-14">{page.label}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </PerfectScrollbar>
      </div>
    </>
  );
};

export default IssuesSidebar;