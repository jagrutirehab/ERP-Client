import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, DropdownMenu, DropdownToggle, Form } from "reactstrap";
import PropTypes from "prop-types";

//import images
import logoSm from "../assets/images/logo-sm.png";
import logoDark from "../assets/images/logo-dark.png";
import logoLight from "../assets/images/logo-light.png";

//import Components
import SearchOption from "../Components/Common/SearchOption";
import WebAppsDropdown from "../Components/Common/WebAppsDropdown";
import FullScreenDropdown from "../Components/Common/FullScreenDropdown";
import NotificationDropdown from "../Components/Common/NotificationDropdown";
import ProfileDropdown from "../Components/Common/ProfileDropdown";
import LightDark from "../Components/Common/LightDark";
import { connect, useDispatch } from "react-redux";
import { searchPatient, viewPatient } from "../store/actions";
import Highlighter from "react-highlight-words";
import RenderWhen from "../Components/Common/RenderWhen";
import PatientPlaceholder from "../Components/Common/PatientPlaceholder";
import SimpleBar from "simplebar-react";

const Header = ({
  onChangeLayoutMode,
  layoutModeType,
  headerClass,
  loading,
  patients,
  centerAccess,
}) => {
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const onChangeData = (e) => {
    var dropdown = document.getElementById("mb-search-dropdown");
    var searchInput = document.getElementById("mb-search-options");
    var inputLength = searchInput.value.length;
    if (inputLength > 0) {
      dropdown.classList.add("show");
      // searchOptions.classList.remove("d-none");
    } else {
      dropdown.classList.remove("show");
      // searchOptions.classList.add("d-none");
    }

    setValue(e.target.value);
  };
  const [search, setSearch] = useState(false);
  const toogleSearch = () => {
    setSearch(!search);
  };

  const searchRef = useRef();

  useEffect(() => {
    // var searchOptions = document.getElementById("mb-search-close-options");
    var dropdown = document.getElementById("mb-search-dropdown");
    var searchInput = document.getElementById("mb-search-options");

    const onFocus = () => {
      var inputLength = searchInput.value.length;
      if (inputLength > 0) {
        dropdown.classList.add("show");
        // searchOptions.classList.remove("d-none");
      } else {
        dropdown.classList.remove("show");
        // searchOptions.classList.add("d-none");
      }
    };

    searchInput.addEventListener("focus", onFocus);
    searchInput.addEventListener("change", onFocus);

    searchInput.addEventListener("keyup", function () {
      var inputLength = searchInput.value.length;
      if (inputLength > 0) {
        dropdown.classList.add("show");
        // searchOptions.classList.remove("d-none");
      } else {
        dropdown.classList.remove("show");
        // searchOptions.classList.add("d-none");
      }
    });

    // searchOptions.addEventListener("click", function () {
    //   searchInput.value = "";
    //   dropdown.classList.remove("show");
    //   searchOptions.classList.add("d-none");
    // });

    document.body.addEventListener("click", function (e) {
      if (e.target.getAttribute("id") !== "mb-search-options") {
        dropdown.classList.remove("show");
        // searchOptions.classList.add("d-none");
      }
    });

    return () => {
      searchInput.removeEventListener("focus", onFocus);
      searchInput.removeEventListener("change", onFocus);
    };
  }, []);

  const toogleMenuBtn = () => {
    var windowSize = document.documentElement.clientWidth;
    if (windowSize > 767)
      document.querySelector(".hamburger-icon").classList.toggle("open");

    //For collapse vertical menu
    if (document.documentElement.getAttribute("data-layout") === "vertical") {
      if (windowSize < 1025 && windowSize > 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document.documentElement.setAttribute(
              "data-sidebar-size",
              "sm-hover"
            )
          : document.documentElement.setAttribute("data-sidebar-size", "lg");
      } else if (windowSize > 1025) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document.documentElement.setAttribute(
              "data-sidebar-size",
              "sm-hover"
            )
          : document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
      if (windowSize <= 1300) {
        document.body.classList.add("vertical-sidebar-enable");
        document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }
  };

  useEffect(() => {
    if (value) dispatch(searchPatient({ name: value, centerAccess }));
  }, [value, dispatch, centerAccess]);

  return (
    <React.Fragment>
      <header id="page-topbar" className={headerClass}>
        <div className="layout-width">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box horizontal-logo">
                <Link to="/" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoDark} alt="" height="17" />
                  </span>
                </Link>

                <Link to="/" className="logo logo-light">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoLight} alt="" height="17" />
                  </span>
                </Link>
              </div>

              <button
                onClick={toogleMenuBtn}
                type="button"
                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                id="topnav-hamburger-icon"
              >
                <span className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              <SearchOption />
            </div>

            <div className="d-flex align-items-center">
              <Dropdown
                isOpen={search}
                toggle={toogleSearch}
                className="d-md-none topbar-head-dropdown header-item"
              >
                <DropdownToggle
                  type="button"
                  tag="button"
                  className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                >
                  <i className="bx bx-search text-white fs-22"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                  <Form className="p-3 position-relative">
                    <div className="form-group m-0">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ..."
                          id="mb-search-options"
                          value={value}
                          onChange={onChangeData}
                          aria-label="Patient's username"
                        />
                        <button className="btn btn-primary" type="button">
                          <i className="mdi mdi-magnify"></i>
                        </button>
                      </div>

                      <div
                        ref={searchRef}
                        className="dropdown-menu dropdown-menu-lg mb-patient-dropdown"
                        id="mb-search-dropdown"
                      >
                        <SimpleBar style={{ height: "200px" }}>
                          <div className="dropdown-header mt-2">
                            <h6 className="text-overflow text-muted mb-1 text-uppercase">
                              Patients
                            </h6>
                          </div>

                          <RenderWhen isTrue={loading}>
                            <PatientPlaceholder />
                          </RenderWhen>

                          <RenderWhen isTrue={!loading}>
                            {(patients || []).map((pt) => (
                              <Link
                                key={pt._id}
                                to={`/patient/${pt._id}`}
                                onClick={() => {
                                  var windowSize =
                                    document.documentElement.clientWidth;
                                  const dataList =
                                    document.querySelector(
                                      ".chat-message-list"
                                    );
                                  var dropdown =
                                    document.getElementById(
                                      "mb-search-dropdown"
                                    );
                                  dropdown.classList.remove("show");

                                  if (windowSize < 992) {
                                    if (
                                      dataList.classList.contains(
                                        "show-chat-message-list"
                                      )
                                    ) {
                                      dataList.classList.remove(
                                        "show-chat-message-list"
                                      );
                                    }
                                  }
                                  dispatch(viewPatient(pt));
                                }}
                                className="dropdown-item notify-item"
                              >
                                <i className="ri-bubble-chart-line align-middle fs-18 text-muted me-2"></i>
                                <Highlighter
                                  // highlightClassName="bg-warning"
                                  searchWords={[value]}
                                  autoEscape={true}
                                  textToHighlight={pt?.name}
                                />
                                {/* <span>{pt.name}</span> */}
                              </Link>
                            ))}
                          </RenderWhen>
                        </SimpleBar>
                      </div>
                    </div>
                  </Form>
                </DropdownMenu>
              </Dropdown>

              {/* WebAppsDropdown */}
              <WebAppsDropdown />

              {/* FullScreenDropdown */}
              <FullScreenDropdown />

              {/* Dark/Light Mode set */}
              {/* <LightDark
                layoutMode={layoutModeType}
                onChangeLayoutMode={onChangeLayoutMode}
              /> */}

              {/* NotificationDropdown */}
              <NotificationDropdown />

              {/* ProfileDropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

Header.prototype = {
  loading: PropTypes.bool,
  patients: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  loading: state.Patient.searchLoading,
  patients: state.Patient.searchedPatients,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Header);
