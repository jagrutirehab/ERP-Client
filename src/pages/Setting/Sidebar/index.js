import { Link, useLocation } from "react-router-dom";
// import { Button, UncontrolledTooltip } from "reactstrap";

//Import Scrollbar
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

//setting pages
import { setting } from "../../../Components/constants/pages";

//redux
import { connect, useSelector } from "react-redux";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const Sidebar = () => {
  const token = useSelector((state) => state.User?.microLogin?.token);

const {  hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("SETTING", "ROLESSETTING", "READ");

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

   const filteredSettings = (setting || []).filter((page) => {
    if (page.id === "roles" && !hasUserPermission) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="chat-leftsidebar">
        <div className="ps-4 pe-3 pt-4 mb-">
          <div className="d-flex align-items-start">
            <div className="d-flex justify-content-between w-100 mb-2">
              <h5 className="pb-0">Setting</h5>
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
              {(filteredSettings || []).map((page, idx) => (
                <li
                  className={setting.id === location.pathname ? "active" : ""}
                >
                  <Link
                    // onClick={() => dispatch(viewPatient(pt))}
                    to={page.link}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                        <div className="avatar-xxs">
                          {/* {chat.image ? (
          <img
            src={""}
            className="rounded-circle img-fluid userprofile"
            alt=""
          />
        ) : ( */}
                          <i className={`${page.icon} fs-4`}></i>
                          {/* //   )} */}
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
  );
};

Sidebar.propTypes = {
  //   patients: PropTypes.array,
  //   patient: PropTypes.object,
};

const mapStateToProps = (state) => ({
  //   patients: state.Patient.data,
  //   patient: state.Patient.patient,
});

export default connect(mapStateToProps)(Sidebar);
