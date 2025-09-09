import React, { useEffect, useState } from "react";
import {
  Col,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import PropTypes from "prop-types";

//import images
import Hospital from "../../assets/images/hospital.svg";
import { Link } from "react-router-dom";
import { connect, useDispatch } from "react-redux";
import { changeUserAccess } from "../../store/actions";

const WebAppsDropdown = ({ centers, centerAccess, onApply }) => {
  const dispatch = useDispatch();
  const [access, setAccess] = useState(centerAccess || []);
  const [isWebAppDropdown, setIsWebAppDropdown] = useState(false);
  const [ctrlCmdPressed, setCtrlCmdPressed] = useState(false);
  const toggleWebAppDropdown = () => {
    setIsWebAppDropdown(!isWebAppDropdown);
  };

  const changeAccess = (centerId) => {
    setAccess((prev) => {
      const newAccess = prev.includes(centerId)
        ? prev.filter((id) => id !== centerId)
        : [centerId, ...prev];

      if (!onApply) {
        dispatch(changeUserAccess(newAccess));
      }

      return newAccess;
    });
  };

  // Event handler function for key down event
  const handleKeyDown = (event) => {
    // Check if Ctrl or Cmd key is pressed
    if (event.key === "Control" || event.key === "Meta") {
      setCtrlCmdPressed(true);
    }
  };
  // Event handler function for key up event
  const handleKeyUp = (event) => {
    // Check if Ctrl or Cmd key is released
    if (event.key === "Control" || event.key === "Meta") {
      setCtrlCmdPressed(false);
    }
  };

  // Effect hook to add event listeners when the component mounts
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // useEffect(() => {
  //   if (!ctrlCmdPressed) dispatch(changeUserAccess(access));
  // }, [dispatch, access, ctrlCmdPressed]);

  useEffect(() => {
    if (!onApply) {
      setAccess(centerAccess || []);
    }
  }, [centerAccess, onApply]);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isWebAppDropdown}
        toggle={toggleWebAppDropdown}
        className="topbar-head-dropdown ms-1 header-item"
      >
        <DropdownToggle
          tag="button"
          type="button"
          className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
        >
          <i className="bx bx-category-alt text-white fs-22"></i>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-lg p-0 dropdown-menu-end">
          <div className="p-2 border-top-0 border-start-0 border-end-0 border-dashed border">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 fw-semibold fs-15"> Centers </h6>
              </Col>
              <div className="col-auto">
                <Link to="/centers" className="btn btn-sm btn-soft-info">
                  {" "}
                  View All Center
                  <i className="ri-arrow-right-s-line align-middle"></i>
                </Link>
              </div>
            </Row>
            <Row className="align-items-center justify-content-center mt-2">
              <Col className="text-center">
                {/* {access?.length === centerAccess?.length ? ( */}
                <button
                  onClick={() => {
                    const cns = centers.map((cn) => cn._id);
                    setAccess(cns);
                    if (!onApply) dispatch(changeUserAccess(cns));
                  }}
                  id="select-all"
                  className="btn btn-light btn-sm m-0 fw-semibold fs-15"
                >
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    fill="#000000"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <g
                        id="🔍-Product-Icons"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        {" "}
                        <g
                          id="ic_fluent_select_all_24_filled"
                          fill="#212121"
                          fillRule="nonzero"
                        >
                          {" "}
                          <path
                            d="M20.4961766,5.62668182 C21.3720675,5.93447702 22,6.76890777 22,7.75 L22,17.75 C22,20.0972102 20.0972102,22 17.75,22 L7.75,22 C6.76890777,22 5.93447702,21.3720675 5.62668182,20.4961766 L7.72396188,20.4995565 L17.75,20.5 C19.2687831,20.5 20.5,19.2687831 20.5,17.75 L20.5,7.75 L20.4960194,7.69901943 L20.4961766,5.62668182 Z M17.246813,2 C18.4894537,2 19.496813,3.00735931 19.496813,4.25 L19.496813,17.246813 C19.496813,18.4894537 18.4894537,19.496813 17.246813,19.496813 L4.25,19.496813 C3.00735931,19.496813 2,18.4894537 2,17.246813 L2,4.25 C2,3.00735931 3.00735931,2 4.25,2 L17.246813,2 Z M13.4696699,7.46966991 L9.58114564,11.3581942 L8.6,10.05 C8.35147186,9.71862915 7.88137085,9.65147186 7.55,9.9 C7.21862915,10.1485281 7.15147186,10.6186292 7.4,10.95 L8.9,12.95 C9.17384721,13.3151296 9.70759806,13.3530621 10.0303301,13.0303301 L14.5303301,8.53033009 C14.8232233,8.23743687 14.8232233,7.76256313 14.5303301,7.46966991 C14.2374369,7.1767767 13.7625631,7.1767767 13.4696699,7.46966991 Z"
                            id="🎨-Color"
                          >
                            {" "}
                          </path>{" "}
                        </g>{" "}
                      </g>{" "}
                    </g>
                  </svg>
                </button>
                <UncontrolledTooltip target={"select-all"}>
                  Select All
                </UncontrolledTooltip>
              </Col>
              <Col className="text-center">
                <button
                  onClick={() => {
                    setAccess([]);
                    if (!onApply) {
                      dispatch(changeUserAccess([]));
                    }
                  }}
                  id="un-select-all"
                  className="btn btn-light btn-sm m-0 fw-semibold fs-15"
                >
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    fill="#000000"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <g
                        id="🔍-Product-Icons"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        {" "}
                        <g
                          id="ic_fluent_select_all_24_regular"
                          fill="#212121"
                          fillRule="nonzero"
                        >
                          {" "}
                          <path
                            d="M20.4961766,5.62668182 C21.3720675,5.93447702 22,6.76890777 22,7.75 L22,17.75 C22,20.0972102 20.0972102,22 17.75,22 L7.75,22 C6.76890777,22 5.93447702,21.3720675 5.62668182,20.4961766 L7.72396188,20.4995565 L17.75,20.5 C19.2687831,20.5 20.5,19.2687831 20.5,17.75 L20.5,7.75 L20.4960194,7.69901943 L20.4961766,5.62668182 Z M17.246813,2 C18.4894537,2 19.496813,3.00735931 19.496813,4.25 L19.496813,17.246813 C19.496813,18.4894537 18.4894537,19.496813 17.246813,19.496813 L4.25,19.496813 C3.00735931,19.496813 2,18.4894537 2,17.246813 L2,4.25 C2,3.00735931 3.00735931,2 4.25,2 L17.246813,2 Z M17.246813,3.5 L4.25,3.5 C3.83578644,3.5 3.5,3.83578644 3.5,4.25 L3.5,17.246813 C3.5,17.6610266 3.83578644,17.996813 4.25,17.996813 L17.246813,17.996813 C17.6610266,17.996813 17.996813,17.6610266 17.996813,17.246813 L17.996813,4.25 C17.996813,3.83578644 17.6610266,3.5 17.246813,3.5 Z M9.58114564,11.3581942 L13.4696699,7.46966991 C13.7625631,7.1767767 14.2374369,7.1767767 14.5303301,7.46966991 C14.7965966,7.73593648 14.8208027,8.15260016 14.6029482,8.44621165 L14.5303301,8.53033009 L10.0303301,13.0303301 C9.73449239,13.3261678 9.26134027,13.3189471 8.97360394,13.0344464 L8.9,12.95 L7.4,10.95 C7.15147186,10.6186292 7.21862915,10.1485281 7.55,9.9 C7.85124623,9.67406533 8.26714548,9.7090277 8.52699676,9.96621555 L8.6,10.05 L9.58114564,11.3581942 L13.4696699,7.46966991 L9.58114564,11.3581942 Z"
                            id="🎨-Color"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </svg>
                </button>
                <UncontrolledTooltip target={"un-select-all"}>
                  Un Select All
                </UncontrolledTooltip>
              </Col>
              <Col className="text-center">
                <button
                  id="apply"
                  onClick={() => {
                    if (onApply) {
                      onApply(access);
                    } else {
                      dispatch(changeUserAccess(access));
                    }
                    toggleWebAppDropdown();
                  }}
                  className="btn btn-light btn-sm m-0 fw-semibold fs-15"
                >
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M8.00009 13L12.2278 16.3821C12.6557 16.7245 13.2794 16.6586 13.6264 16.2345L22.0001 6"
                        stroke="#222222"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      ></path>{" "}
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.5653 12.3677L15.4644 6.37999C15.6742 6.12352 15.6364 5.7455 15.3799 5.53567C15.1235 5.32583 14.7455 5.36363 14.5356 5.6201L9.6434 11.5995L10.5653 12.3677ZM8.03225 15.4637L7.11035 14.6954L6.14267 15.8782C6.00694 16.044 5.76456 16.0735 5.59309 15.9449L2.36 13.52C2.0949 13.3212 1.71882 13.3749 1.52 13.64C1.32118 13.9051 1.3749 14.2812 1.64 14.48L4.87309 16.9049C5.559 17.4193 6.52849 17.3016 7.07142 16.638L8.03225 15.4637Z"
                        fill="#2A4157"
                        fillOpacity="0.24"
                      ></path>{" "}
                    </g>
                  </svg>
                </button>
                <UncontrolledTooltip target={"apply"}>
                  Apply
                </UncontrolledTooltip>
              </Col>
            </Row>
          </div>

          <div className="p-2 overflow-auto" style={{ height: "180px" }}>
            <Row className="row-gap-3">
              {(centers || []).map((center) => (
                <Col key={center._id} xs={4}>
                  <div
                    className="form-check card-radio"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      id={center.title + center._id}
                      name="data-layout"
                      type="checkbox"
                      value={center["_id"]}
                      checked={access.includes(center["_id"].toString())}
                      onChange={() => changeAccess(center["_id"].toString())}
                      className="form-check-input"
                    />
                    <label
                      className="form-check-label me-0 d-flex flex-column align-items-center justify-content-center text-center p-0 avatar-md"
                      htmlFor={center.title + center._id}
                    >
                      <img className="avatar-sm" src={Hospital} alt="Rehab" />
                      <span className="fs-10">{center["title"] || ""}</span>
                    </label>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

WebAppsDropdown.prototype = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
};

export default WebAppsDropdown;
