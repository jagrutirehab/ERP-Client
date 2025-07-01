import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, UncontrolledTooltip, Card, CardBody } from "reactstrap";
// import { useInView } from "react-hook-inview";

//Import Scrollbar
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import Tabs from "./Tabs";

//redux
import { connect, useDispatch } from "react-redux";
import {
  fetchMoreInterns,
  fetchInterns,
  toggleInternForm,
  viewIntern,
} from "../../../store/actions";
import RenderWhen from "../../../Components/Common/RenderWhen";
import { useInView } from "react-hook-inview";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const Sidebar = ({
  interns = [],
  intern,
  customActiveTab,
  toggleCustom,
  centerAccess,
}) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadMoreRef, isVisible] = useInView({
    defaultInView: false,
  });

  useEffect(() => {
    dispatch(fetchInterns());
    if (isVisible) {
    }
  }, [dispatch, centerAccess, customActiveTab, isVisible, searchQuery]);

  const toggleDataSidebar = () => {
    const windowSize = document.documentElement.clientWidth;
    const dataList = document.querySelector(".chat-message-list");
    if (windowSize < 992) {
      if (dataList.classList.contains("show-chat-message-list")) {
        dataList.classList.remove("show-chat-message-list");
      } else {
        dataList.classList.add("show-chat-message-list");
      }
    }
  };

  const filteredInterns = (interns || []).filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="chat-leftsidebar" style={{ marginTop: 80 }}>
      <div className="px-4 pt-4 mb-4">
        <div className="d-flex align-items-start">
          <div className="flex-grow-1">
            <h5 className="mb-4">Interns</h5>
          </div>
          <div className="flex-shrink-0">
            <CheckPermission permission={"create"}>
              <UncontrolledTooltip placement="bottom" target="addcontact">
                Add Intern
              </UncontrolledTooltip>
              <Button
                onClick={() =>
                  dispatch(toggleInternForm({ data: null, isOpen: true }))
                }
                color=""
                id="addcontact"
                className="btn btn-soft-success btn-sm"
              >
                <i className="ri-add-line align-bottom"></i>
              </Button>
            </CheckPermission>
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
        <div className="search-box">
          <Tabs customActiveTab={customActiveTab} toggleCustom={toggleCustom} />
          <input
            type="text"
            className="form-control bg-light border-light"
            placeholder="Search interns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i
            className="ri-search-2-line search-icon "
            style={{ height: "162%" }}
          ></i>
        </div>
      </div>

      <PerfectScrollbar className="chat-room-list">
        <div className="chat-message-list">
          <ul
            className="list-unstyled chat-list chat-user-list users-list"
            id="userList"
          >
            {filteredInterns.map((int) => (
             
              <li
                key={int._id}
                className={intern?._id === int._id ? "active" : ""}
              >
                <Link to={`/intern/${int?._id}`}>
                  <div className="d-flex align-items-center">
                    <div
                      className={
                        intern?._id === int._id
                          ? "flex-shrink-0 chat-user-img online align-self-center me-2 ms-0"
                          : "flex-shrink-0 chat-user-img align-self-center me-2 ms-0"
                      }
                    >
                      <div className="avatar-xxs">
                        {int?.profilePicture ? (
                          <img
                            src={int?.profilePicture.url}
                            className="rounded-circle img-fluid avatar-xxs userprofile"
                            alt=""
                          />
                        ) : (
                          <div className="avatar-title rounded-circle bg-success userprofile">
                            {int.name?.slice(0, 1)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-truncate text-capitalize font-semi-bold fs-13 mb-0">
                        {int.name || ""}
                      </p>
                      {/* <p className="text-truncate text-muted fs-12 mb-0">
                        {int.educationalInstitution}
                      </p> */}
                    </div>
                    <div className="flex-shrink-0 d-flex align-items-center">
                      <span className="badge badge-soft-dark rounded p-1">
                        {int.center?.title || ""}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            <RenderWhen isTrue={interns?.length >= 20}>
              <li ref={loadMoreRef} className="p-2 bg-dar"></li>
            </RenderWhen>
          </ul>
        </div>
      </PerfectScrollbar>
    </div>
  );
};

Sidebar.propTypes = {
  interns: PropTypes.array,
  intern: PropTypes.object,
  customActiveTab: PropTypes.string,
  toggleCustom: PropTypes.func,
  centerAccess: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  interns: state.Intern.data,
  intern: state.Intern.intern,

  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Sidebar);
