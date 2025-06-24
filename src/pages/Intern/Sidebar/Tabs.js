import React from "react";
import PropTypes from "prop-types";
import { Nav, NavItem, NavLink } from "reactstrap";

const Tabs = ({ customActiveTab, toggleCustom }) => {
  return (
    <Nav tabs className="nav-tabs-custom nav-justified">
      <NavItem>
        <NavLink
          style={{ cursor: "pointer" }}
          className={customActiveTab === "all" ? "active" : ""}
          onClick={() => {
            toggleCustom("all");
          }}
        >
          <span className="d-block d-sm-none">
            <i className="fas fa-home"></i>
          </span>
          <span className="d-none d-sm-block">All Interns</span>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink
          style={{ cursor: "pointer" }}
          className={customActiveTab === "active" ? "active" : ""}
          onClick={() => {
            toggleCustom("active");
          }}
        >
          <span className="d-block d-sm-none">
            <i className="fas fa-user"></i>
          </span>
          <span className="d-none d-sm-block">Active</span>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink
          style={{ cursor: "pointer" }}
          className={customActiveTab === "completed" ? "active" : ""}
          onClick={() => {
            toggleCustom("completed");
          }}
        >
          <span className="d-block d-sm-none">
            <i className="fas fa-check"></i>
          </span>
          <span className="d-none d-sm-block">Completed</span>
        </NavLink>
      </NavItem>
    </Nav>
  );
};

Tabs.propTypes = {
  customActiveTab: PropTypes.string,
  toggleCustom: PropTypes.func,
};

export default Tabs;
