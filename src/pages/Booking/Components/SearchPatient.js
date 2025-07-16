import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Spinner,
  Dropdown,
} from "reactstrap";
import RenderWhen from "../../../Components/Common/RenderWhen";
import debounce from "lodash.debounce";
import { connect } from "react-redux";
import { io } from "socket.io-client";
import config from "../../../config";
const socket = io(config.api.BASE_URL, {
  path: "/socket/search",
});

const SearchPatient = ({ validation, disabled, editEvent, centerAccess }) => {
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const handleChange = (e) => {
    const val = e.target.value;
    setIsSearching(true);
    socket.emit("search", val);
  };

  const debouncedOnChange = debounce(handleChange, 500);

  useEffect(() => {
    socket.on("searchResults", (data) => {
      setIsSearching(false);
      setFilteredPatients(data);
    });
    return () => {
      socket.off("searchResults");
    };
  }, []);

  useEffect(() => {
    if (filteredPatients?.length > 0 && !dropdown) setDropdown(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPatients]);

  const isNewPatient = !validation.values.patient;
  const isClearAvai = validation.values.patient;

  return (
    <React.Fragment>
      <div>
        {" "}
        <Dropdown
          isOpen={dropdown}
          toggle={() => setDropdown(false)}
          direction="down"
        >
          <DropdownToggle className="p-0 w-100 position-relative" color="light">
            <Input
              disabled={disabled}
              value={validation.values.patientName}
              onChange={(e) => {
                validation.setFieldValue("patientName", e.target.value);
                debouncedOnChange(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              size={"sm"}
              className="w-100"
            />
            {/* add custom medicine */}
            <RenderWhen isTrue={isSearching}>
              <span
                className="link-success dropdown-input-icon"
                style={{ right: "50px" }}
              >
                <Spinner size={"sm"} color="success" />
              </span>
            </RenderWhen>
            <RenderWhen isTrue={isClearAvai && !editEvent}>
              <span className="link-success dropdown-input-icon">
                <Button
                  onClick={() => {
                    validation.setFieldValue("patient", "");
                    validation.setFieldValue("patientName", "");
                    validation.setFieldValue("phoneNumber", "");
                    validation.setFieldValue("gender", "");
                    validation.setFieldValue("center", "");
                  }}
                  className="fs-9 p-1"
                  size="sm"
                  outline
                  color="info"
                >
                  Clear
                </Button>
              </span>
            </RenderWhen>
            <RenderWhen isTrue={isNewPatient}>
              <span className="link-success dropdown-input-icon">
                <span
                  id="patient-center"
                  className="badge fs-9 badge-soft-dark bg-soft-success text-success rounded p-1"
                >
                  {" "}
                  New
                </span>
              </span>
            </RenderWhen>
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-md overflow-auto dropdown-height-md">
            <DropdownItem></DropdownItem>
            {(filteredPatients || []).map((item) => (
              <DropdownItem
                className="d-flex align-items-center link-primary text-primary fs-6"
                key={item["_id"]}
                onClick={() => {
                  setDropdown(false);
                  validation.setFieldValue("uid", `${item.id?.value}`);
                  validation.setFieldValue("patientName", item.name);
                  validation.setFieldValue("patient", item._id);
                  validation.setFieldValue(
                    "phoneNumber",
                    item.phoneNumber.includes("+91")
                      ? item.phoneNumber
                      : "+91" + item.phoneNumber
                  );
                  validation.setFieldValue("gender", item.gender);
                  if (centerAccess.includes(item.center?._id))
                    validation.setFieldValue("center", item.center?._id);
                }}
              >
                <span>{item?.name}</span>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </React.Fragment>
  );
};

SearchPatient.propTypes = {
  patients: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  patients: state.Patient.allPatients,
  searchLoading: state.Patient.searchLoading,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(SearchPatient);
