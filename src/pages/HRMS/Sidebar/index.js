import { usePermissions } from '../../../Components/Hooks/useRoles';
import { Link, useLocation } from 'react-router-dom';
import { HRMS } from '../../../Components/constants/pages';
import PerfectScrollbar from "react-perfect-scrollbar";

const Sidebar = () => {
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission } = usePermissions(token);
    const hasAttendancePermission = hasPermission("HRMS", "HRMS_ATTENDANCE", "READ");

    const location = useLocation();

    const filteredHRMSOptions = HRMS.filter((page) => {
        if (page.id === "attendance" && !hasAttendancePermission) return false;

        return true;
    })
    return (
        <div className="chat-leftsidebar" >

            <div className="ps-4 pe-3 pt-4">
                <h5>HRMS</h5>
            </div>

            <PerfectScrollbar className="chat-room-list">
                <ul className="list-unstyled chat-list chat-user-list users-list px-3">
                    {filteredHRMSOptions.map((page) => {
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
                        )
                    })}
                </ul>
            </PerfectScrollbar>
        </div>
    )
}

export default Sidebar;