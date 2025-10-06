import "react-perfect-scrollbar/dist/css/styles.css";
import { Link, useLocation } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";

const SecondaryLeftSidebar = ({ title, items }) => {
  //   const microUser = localStorage.getItem("micrologin");
  //   const token = microUser ? JSON.parse(microUser).token : null;

  //   const { hasPermission } = usePermissions(token);
  //   const hasUserPermission = hasPermission("INVENTORY", "DASHBOARD", "DELETE");
  //   const hasUserPermission2 = hasPermission("INVENTORY", "INVENTORYMANAGEMENT", "DELETE");

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

  return (
    <div>
      <div className="chat-leftsidebar">
        <div className="ps-4 pe-3 pt-4 mb-">
          <div className="d-flex align-items-start">
            <div className="d-flex justify-content-between w-100 mb-2">
              <h5 className="pb-0">{title}</h5>
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
              {(items || []).map((item, idx) => (
                <li className={item.id === location.pathname ? "active" : ""}>
                  <Link to={item.link}>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                        <div className="avatar-xxs">
                          <i className={`${item.icon} fs-4`}></i>
                        </div>
                        <span className="user-status"></span>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className="text-truncate font-semi-bold fs-15 mb-0">
                          {item.label || ""}
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
  );
};

export default SecondaryLeftSidebar;
