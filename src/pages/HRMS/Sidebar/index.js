import React, { useEffect, useRef, useState } from "react";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { Link, useLocation } from "react-router-dom";
import { HRMS } from "../../../Components/constants/pages";
import PerfectScrollbar from "react-perfect-scrollbar";

const Sidebar = () => {
    const location = useLocation();
    const [openSection, setOpenSection] = useState("");

    const accordionRefs = useRef({});

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission } = usePermissions(token);

    // permissions
    const hasAttendanceLogPermission = hasPermission(
        "HRMS",
        "ATTENDANCE_LOG",
        "READ"
    );
    const hasAttendanceMetricsPermission = hasPermission(
        "HRMS",
        "ATTENDANCE_METRICS",
        "READ"
    );

    const toggleSection = (id) => {
        setOpenSection(openSection === id ? "" : id);
    };

    const filteredHRMSOptions = HRMS.filter((page) => {
        if (page.id === "attendance") {
            page.children = page.children.filter((child) => {
                if (child.id === "attendance-log" && !hasAttendanceLogPermission)
                    return false;
                if (child.id === "attendance-metrics" && !hasAttendanceMetricsPermission)
                    return false;

                return true;
            });
            return page.children.length > 0;
        }

        return true;
    });

    useEffect(() => {
        filteredHRMSOptions.forEach((page) => {
            if (
                page.isAccordion &&
                page.children.some((child) => location.pathname.startsWith(child.link))
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
                    <h5>HRMS</h5>
                </div>

                <PerfectScrollbar className="chat-room-list">
                    <ul className="list-unstyled chat-list chat-user-list users-list px-3">
                        {filteredHRMSOptions.map((page) => {
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
