import React, { useState } from "react";
import PropTypes from "prop-types";
import { Nav, NavItem, NavLink, UncontrolledTooltip } from "reactstrap";
import classnames from "classnames";
import {
  ADMIT_PATIENTS,
  ALL_PATIENTS,
  DISCHARGE_PATIENTS,
  MY_PATIENTS,
  OPD_PATIENTS,
} from "../../../Components/constants/patient";

const Tabs = ({ customActiveTab, toggleCustom }) => {
  return (
    <React.Fragment>
      <div>
        <Nav
          tabs
          className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
        >
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({
                active: customActiveTab === ALL_PATIENTS,
              })}
              onClick={() => {
                toggleCustom(ALL_PATIENTS);
              }}
              id="all-patients"
            >
              <i className="ri-team-fill fs-6"></i>
            </NavLink>
            <UncontrolledTooltip placement="bottom" target="all-patients">
              All Patients
            </UncontrolledTooltip>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({
                active: customActiveTab === ADMIT_PATIENTS,
              })}
              onClick={() => {
                toggleCustom(ADMIT_PATIENTS);
              }}
              id="admit-patients"
            >
              <i className="ri-user-location-fill fs-6"></i>
            </NavLink>
            <UncontrolledTooltip placement="bottom" target="admit-patients">
              Admit Patients
            </UncontrolledTooltip>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({
                active: customActiveTab === DISCHARGE_PATIENTS,
              })}
              onClick={() => {
                toggleCustom(DISCHARGE_PATIENTS);
              }}
              id="discharge-patients"
            >
              <i className="ri-user-follow-fill fs-6"></i>
            </NavLink>
            <UncontrolledTooltip placement="bottom" target="discharge-patients">
              Discharged Patients
            </UncontrolledTooltip>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({
                active: customActiveTab === OPD_PATIENTS,
              })}
              onClick={() => {
                toggleCustom(OPD_PATIENTS);
              }}
              id="opd-patients"
            >
              <span id="opd-patients" className="fs-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M8 3v2H6v4a4 4 0 0 0 8 0V5h-2V3h3a1 1 0 0 1 1 1v5a6.002 6.002 0 0 1-5 5.917V16.5a3.5 3.5 0 0 0 6.775 1.238a3 3 0 1 1 2.05.148A5.502 5.502 0 0 1 8.999 16.5v-1.583A6.002 6.002 0 0 1 4 9V4a1 1 0 0 1 1-1h3Zm11 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2Z"
                  />
                </svg>
              </span>
            </NavLink>
            <UncontrolledTooltip placement="bottom" target="opd-patients">
              OPD Patients
            </UncontrolledTooltip>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({
                active: customActiveTab === MY_PATIENTS,
              })}
              onClick={() => {
                toggleCustom(MY_PATIENTS);
              }}
              id="my-patients"
            >
              <i className="ri-home-line fs-6"></i>
            </NavLink>
            <UncontrolledTooltip placement="bottom" target="my-patients">
              My Patients
            </UncontrolledTooltip>
          </NavItem>
        </Nav>
      </div>
    </React.Fragment>
  );
};

Tabs.propTypes = {
  customActiveTab: PropTypes.string,
  toggleCustom: PropTypes.func,
};

export default Tabs;
