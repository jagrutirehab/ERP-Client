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
import RenderWhen from "../../../../Components/Common/RenderWhen";

import { connect, useDispatch } from "react-redux";
import { searchPatient } from "../../../../store/actions";

const SearchPatient = ({
  patients,
  searchLoading,
  centerAccess,
  patient,
  setPatient,
}) => {
  const dispatch = useDispatch();

  const [value, setValue] = useState("");
  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
  };

  useEffect(() => {
    dispatch(searchPatient({ name: value, centerAccess }));
  }, [dispatch, centerAccess, value]);

  return (
    <React.Fragment>
      <div className="h-100">
        {" "}
        <UncontrolledDropdown direction="down" className="">
          <DropdownToggle
            className="p-0 w-100 h-100 position-relative"
            color="light"
          >
            <Input
              value={value}
              onChange={handleChange}
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
            {(patients || []).map((item) => (
              <DropdownItem
                className="d-flex align-items-center link-primary text-primary fs-6"
                key={item["_id"]}
                onClick={() => {
                  setValue(item.name);
                  setPatient(item);
                }}
              >
                <span>{item.name}</span>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    </React.Fragment>
  );
};

SearchPatient.propTypes = {
  patients: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  patients: state.Patient.searchedPatients,
  searchLoading: state.Patient.searchLoading,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(SearchPatient);
