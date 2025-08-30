import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Spinner,
  UncontrolledDropdown,
} from "reactstrap";
import RenderWhen from "../../../../../Components/Common/RenderWhen";

import { connect, useDispatch } from "react-redux";
import { searchPatientReferral } from "../../../../../store/actions";

const ReferrelPatient = ({
  referrels,
  searchLoading,
  centerAccess,
  patientReferrel,
  setPatientsReferrel,
}) => {
  const dispatch = useDispatch();

  const [value, setValue] = useState("");
  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
  };

  useEffect(() => {
    if (value) dispatch(searchPatientReferral({ value, centerAccess }));
  }, [dispatch, centerAccess, value]);

  return (
    <React.Fragment>
      <div className="h-100">
        {" "}
        <UncontrolledDropdown direction="down" className="h-100">
          <DropdownToggle
            className="p-0 w-100 h-100 position-relative"
            color="light"
          >
            <Input
              value={value}
              onChange={handleChange}
              placeholder="Search by referral..."
              size={"sm"}
              className="w-100 h-100"
            />
            {/* add custom medicine */}
            <RenderWhen isTrue={searchLoading}>
              <span
                className="link-success dropdown-input-icon"
                style={{ right: "10px" }}
              >
                <Spinner size={"sm"} color="success" />
              </span>
            </RenderWhen>
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-md overflow-auto dropdown-height-md">
            {(referrels || []).map((item) => (
              <DropdownItem
                className="d-flex align-items-center link-primary text-primary fs-6"
                key={item["_id"]}
                onClick={() => {
                  setValue(item.referredBy);
                  setPatientsReferrel(item.referredBy);
                }}
              >
                <span className="">{item.referredBy}</span>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    </React.Fragment>
  );
};

ReferrelPatient.propTypes = {
  referrels: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  referrels: state.Patient.patientReferrel,
  searchLoading: state.Patient.patientRefLoading,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(ReferrelPatient);
