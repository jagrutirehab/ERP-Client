import { Link, useLocation } from 'react-router-dom';
import PerfectScrollbar from "react-perfect-scrollbar";
import { HR } from '../../../Components/constants/pages';
import { usePermissions } from '../../../Components/Hooks/useRoles';

const Sidebar = () => {

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission } = usePermissions(token);

    const hasUserPermission1 = hasPermission("HR", "MASTER_EMPLOYEE", "READ");
    const hasUserPermission2 = hasPermission("HR", "NEW_JOININGS", "READ");
    const hasUserPermission3 = hasPermission("HR", "EXIT_EMPLOYEES", "READ");

    const location = useLocation();

    const toggleDataSidebar = () => {
        var windowSize = document.documentElement.clientWidth;
        const dataList = document.querySelector(".chat-message-list");

        if (windowSize < 992) {
            if (dataList.classList.contains("show-chat-message-list")) {
                dataList.classList.remove("show-chat-message-list");
            } else dataList.classList.add("show-chat-message-list");
        }
    };

    const filteredHROptions = (HR || []).filter((page) => {
        if (page.id === "master-employee" && !hasUserPermission1) {
            return false;
        }
        if (page.id === "new-joinings" && !hasUserPermission2) {
            return false;
        }
        if (page.id === "exit-employees" && !hasUserPermission3) {
            return false;
        }
        return true;
    });

    return (
        <div>
            <div className="chat-leftsidebar" style={{ minWidth: "0px" }}>
                <div className="ps-4 pe-3 pt-4 mb-">
                    <div className="d-flex align-items-start">
                        <div className="d-flex justify-content-between w-100 mb-2">
                            <h5 className="pb-0">Human Resources</h5>
                            <button
                                onClick={toggleDataSidebar}
                                type="button"
                                className="btn btn-sm px-3 fs-16 data-sidebar-button topnav-hamburger"
                                id="topnav-hamburger-icon"
                            >
                                <span className="hamburger-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <PerfectScrollbar className="chat-room-list">
                    <div className="chat-message-list">
                        <ul
                            className="list-unstyled chat-list chat-user-list users-list"
                            id="userList"
                        >
                            {(filteredHROptions || []).map((page, idx) => (
                                <li
                                    className={HR.id === location.pathname ? "active" : ""}
                                >
                                    <Link to={page.link}>
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                <div className="avatar-xxs">
                                                    <i className={`${page.icon} fs-4`}></i>
                                                </div>
                                                <span className="user-status"></span>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="text-truncate font-semi-bold fs-15 mb-0">
                                                    {page.label || ""}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </PerfectScrollbar>
            </div>
        </div>
    )
}

export default Sidebar;