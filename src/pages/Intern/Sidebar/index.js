import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, UncontrolledTooltip } from "reactstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import Tabs from "./Tabs";
import { connect, useDispatch } from "react-redux";
import { fetchInterns, toggleInternForm } from "../../../store/actions";
import RenderWhen from "../../../Components/Common/RenderWhen";
import { useInView } from "react-hook-inview";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const Sidebar = ({
  interns = [],
  intern,
  customActiveTab = "all",
  toggleCustom,
  hasMore,
}) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loadMoreRef, isVisible] = useInView({ defaultInView: false });
  const isFetchingRef = useRef(false);
  const debounceTimeoutRef = useRef(null);
  const LIMIT = 20;

  const getFilterParams = (pageNumber) => {
    const base = {
      page: pageNumber,
      limit: LIMIT,
      name: searchQuery,
    };
    if (customActiveTab === "active") base.internStatus = "active";
    else if (customActiveTab === "completed") base.internStatus = "completed";
    return base;
  };

  useEffect(() => {
    const fetchInitial = async () => {
      setPage(1);
      isFetchingRef.current = true;
      await dispatch(fetchInterns(getFilterParams(1)));
      isFetchingRef.current = false;
    };

    fetchInitial();
  }, [customActiveTab, dispatch]);


  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const fetchWithSearch = async () => {
        setPage(1);
        isFetchingRef.current = true;
        await dispatch(fetchInterns(getFilterParams(1)));
        isFetchingRef.current = false;
      };

      fetchWithSearch();
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchMore = async () => {
      if (isVisible && hasMore && !isFetchingRef.current) {
        const nextPage = page + 1;
        setPage(nextPage);
        isFetchingRef.current = true;
        await dispatch(fetchInterns(getFilterParams(nextPage)));
        isFetchingRef.current = false;
      }
    };

    fetchMore();
  }, [isVisible, hasMore]);

  useEffect(() => {
      toggleDataSidebar();
    }, []);

  const toggleDataSidebar = () => {
    const dataList = document.querySelector(".chat-message-list");
    if (document.documentElement.clientWidth < 992) {
      if (dataList.classList.contains("show-chat-message-list")) {
        dataList.classList.remove("show-chat-message-list");
      } else dataList.classList.add("show-chat-message-list");
    }
  };

  return (
    <div className="chat-leftsidebar" >
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
          <Tabs customActiveTab={customActiveTab || "all"} toggleCustom={toggleCustom} />
          <input
            type="text"
            className="form-control bg-light border-light"
            placeholder="Search interns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i
            className="ri-search-2-line search-icon"
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
            {(interns || []).map((int) => (
              <li
                key={int._id}
                className={intern?._id === int._id ? "active" : ""}
              >
                <Link onClick={toggleDataSidebar} to={`/intern/${int._id}`}>
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
                            {int.name?.[0]}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-truncate text-capitalize font-semi-bold fs-13 mb-0">
                        {int.name || ""}
                      </p>
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
            <RenderWhen isTrue={hasMore}>
              <li ref={loadMoreRef} className="p-2 bg-light text-center">
                <span className="text-muted">Loading more...</span>
              </li>
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
  centerAccess: PropTypes.array,
  hasMore: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  interns: state.Intern.data,
  intern: state.Intern.intern,
  centerAccess: state.User?.centerAccess,
  hasMore: state.Intern.hasMore,
});

export default connect(mapStateToProps)(Sidebar);
