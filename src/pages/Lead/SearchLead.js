import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  DropdownToggle,
  Input,
  Label,
  Spinner,
  UncontrolledDropdown,
} from "reactstrap";
import RenderWhen from "../../Components/Common/RenderWhen";

import { connect, useDispatch } from "react-redux";
import { searchLead } from "../../store/actions";

const SearchLead = ({
  leads,
  searchLoading,
  setMergeWith,
  centerAccess,
  date,
}) => {
  const dispatch = useDispatch();
  const [leadQuery, setLeadQuery] = useState("");

  useEffect(() => {
    if (leadQuery?.length > 1)
      dispatch(
        searchLead({
          leadQuery,
          centerAccess: JSON.stringify(centerAccess),
          grouped: false,
          // ...date,
        })
      );
  }, [dispatch, leadQuery, centerAccess, date]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLeadQuery(val);
  };

  return (
    <React.Fragment>
      <div>
        {" "}
        <UncontrolledDropdown direction="down">
          <Label className="d-block text-dark fw-heavy">Search Lead</Label>
          <DropdownToggle className="p-0 position-relative w-200" color="light">
            <Input
              value={leadQuery}
              onChange={handleChange}
              size={"sm"}
              className="w-100"
            />
            {/* add custom medicine */}
            <RenderWhen isTrue={searchLoading}>
              <span
                className="link-success dropdown-input-icon"
                style={{ right: "50px" }}
              >
                <Spinner size={"sm"} color="success" />
              </span>
            </RenderWhen>
          </DropdownToggle>
          {/* <DropdownMenu className="dropdown-menu-md overflow-auto dropdown-height-md">
            <DropdownItem></DropdownItem>
            {(leads || []).map((item) => (
              <DropdownItem
                className="d-flex align-items-center link-primary text-primary fs-6"
                key={item["_id"]}
                onClick={() => {
                  setMergeWith(item);
                }}
              >
                <span>{item.patient?.name}</span>
              </DropdownItem>
            ))}
          </DropdownMenu> */}
        </UncontrolledDropdown>
      </div>
    </React.Fragment>
  );
};

SearchLead.propTypes = {
  leads: PropTypes.array,
};

const mapStateToProps = (state) => ({
  leads: state.Lead.unGroupLeads,
  searchLoading: state.Lead.searchLoading,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(SearchLead);
