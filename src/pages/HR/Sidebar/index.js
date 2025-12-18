import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import { HR } from "../../../Components/constants/pages";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const Sidebar = () => {
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission } = usePermissions(token);

    // Permissions
    const hasUserPermission1 = hasPermission("HR", "MASTER_EMPLOYEE", "READ");

    const hasNewJoiningAddRequestPermission = hasPermission("HR", "NEW_JOINING_ADD_REQUEST", "READ");
    const hasUserPermission2 = hasPermission("HR", "NEW_JOINING_APPROVAL", "READ");
    const hasUserPermission3 = hasPermission("HR", "NEW_JOINING_IT", "READ");

    const hasExitEmployeeAddRequestPermission = hasPermission("HR", "EXIT_EMPLOYEE_ADD_REQUEST", "READ");
    const hasUserPermission4 = hasPermission("HR", "EXIT_EMPLOYEE_APPROVAL", "READ");
    const hasUserPermission5 = hasPermission("HR", "EXIT_EMPLOYEE_FNF", "READ");
    const hasUserPermission6 = hasPermission("HR", "EXIT_EMPLOYEE_IT", "READ");

    const hasSalaryAdvanceApprovalPermission = hasPermission("HR", "SALARY_ADVANCE_APPROVAL", "READ");
    const hasSalaryAdvanceAddRequestPermission = hasPermission("HR", "SALARY_ADVANCE_ADD_REQUEST", "READ");

    const hasTransferEmployeeAddRequestPermission = hasPermission("HR", "TRANSFER_EMPLOYEE_ADD_REQUEST", "READ");
    const hasUserPermission8 = hasPermission("HR", "TRANSFER_EMPLOYEE_APPROVAL", "READ");
    const hasUserPermission9 = hasPermission("HR", "TRANSFER_EMPLOYEE_CURRENT_LOCATION_APPROVAL", "READ");
    const hasUserPermission10 = hasPermission("HR", "TRANSFER_EMPLOYEE_TRANSFER_LOCATION_APPROVAL", "READ");
    const hasUserPermission11 = hasPermission("HR", "TRANSFER_EMPLOYEE_IT", "READ");

    const location = useLocation();
    const [openSection, setOpenSection] = useState("");

    const accordionRefs = useRef({});

    const toggleSection = (id) => {
        setOpenSection(openSection === id ? "" : id);
    };

    const filteredHROptions = HR.filter((page) => {
        if (page.id === "master-employee" && !hasUserPermission1) return false;

        if (page.id === "new-joinings") {
            page.children = page.children.filter((child) => {
                if (child.id === "add-new-joining" && !hasNewJoiningAddRequestPermission) return false;
                if (child.id === "new-joining-approval" && !hasUserPermission2) return false;
                if (child.id === "new-joining-it" && !hasUserPermission3) return false;
                return true;
            });
            return page.children.length > 0;
        }

        if (page.id === "exit-employees") {
            page.children = page.children.filter((child) => {
                if (child.id === "add-exit-request" && !hasExitEmployeeAddRequestPermission) return false;
                if (child.id === "exit-approval" && !hasUserPermission4) return false;
                if (child.id === "exit-fnf-approval" && !hasUserPermission5) return false;
                if (child.id === "exit-it-approval" && !hasUserPermission6) return false;
                return true;
            });
            return page.children.length > 0;
        }

        if (page.id === "salary-advance") {
            page.children = page.children.filter((child) => {
                if (child.id === "add-salary-advance-request" && !hasSalaryAdvanceAddRequestPermission) return false;
                if (child.id === "salary-advance-approval" && !hasSalaryAdvanceApprovalPermission) return false;
                return true;
            });
            return page.children.length > 0;
        }

        if (page.id === "transfer-employees") {
            page.children = page.children.filter((child) => {
                if (child.id === "add-transfer-request" && !hasTransferEmployeeAddRequestPermission) return false;
                if (child.id === "transfer-approval" && !hasUserPermission8) return false;
                if (child.id === "transfer-current-location-approval" && !hasUserPermission9) return false;
                if (child.id === "transfer-transferred-location-approval" && !hasUserPermission10) return false;
                if (child.id === "transfer-it-approval" && !hasUserPermission11) return false;
                return true;
            });
            return page.children.length > 0
        }

        return true;
    });

    useEffect(() => {
        filteredHROptions.forEach((page) => {
            if (
                page.isAccordion &&
                page.children.some((child) =>
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

    /* Highlight only the selected child */
    li.active > a,
    li.active > div {
        background: rgba(0, 123, 255, 0.15) !important;
        color: #0d6efd !important;
    }

    /* Highlight only the parent accordion header */
    li.parent-active > div {
        background: rgba(0, 123, 255, 0.08) !important;
        color: #0d6efd !important;
    }

    /* Prevent parent highlight bleeding into child items */
    li.parent-active ul li {
        background: transparent !important;
    }
`}
            </style>
            <div className="chat-leftsidebar" style={{ minWidth: "0px" }}>
                <div className="ps-4 pe-3 pt-4">
                    <h5>Human Resources</h5>
                </div>

                <PerfectScrollbar className="chat-room-list">
                    <ul className="list-unstyled chat-list chat-user-list users-list px-3">
                        {filteredHROptions.map((page) => {
                            if (!page.isAccordion) {
                                return (
                                    <li
                                        key={page.id}
                                        className={
                                            location.pathname.startsWith(page.link)
                                                ? "active mb-1"
                                                : "mb-1"
                                        }
                                    >
                                        <Link
                                            className="d-flex align-items-center py-2"
                                            to={page.link}
                                        >
                                            <i className={`${page.icon} fs-4 me-2`} />
                                            <span className="fs-15">{page.label}</span>
                                        </Link>
                                    </li>
                                );
                            }

                            if (!accordionRefs.current[page.id]) {
                                accordionRefs.current[page.id] = React.createRef();
                            }

                            const contentRef = accordionRefs.current[page.id];

                            return (
                                <li key={page.id} className="mb-1">
                                    <div
                                        onClick={() => toggleSection(page.id)}
                                        className="d-flex align-items-center py-2 ps-4"
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
                                            {page.children.map((child) => (
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
                                </li>
                            );
                        })}
                    </ul>
                </PerfectScrollbar>
            </div>
        </>
    );
};

export default Sidebar;
