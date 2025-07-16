import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { connect, useDispatch } from "react-redux";
import TimelineRight from "./Components/Timeline/TimelineRight";
import TimelineLeft from "./Components/Timeline/TimelineLeft";
import RenderWhen from "../../../Components/Common/RenderWhen";
import TimelineCenter from "./Components/Timeline/TimelineCenter";
import { fetchPatientTimeline } from "../../../store/actions";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { timelineFilters } from "../../../Components/constants/patient";

const PATIENT_CHART = "PATIENT_CHART";
const PATIENT_BILL = "PATIENT_BILL";
const PATIENT_CENTER = "PATIENT_CENTER";

const Timeline = ({ timeline, patient }) => {
  const dispatch = useDispatch();

  const [filter, setFilter] = useState(timelineFilters.map((_) => _.name));
  const [action, setAction] = useState(null);

  useEffect(() => {
    dispatch(fetchPatientTimeline({ patient: patient._id, filter, action }));
  }, [dispatch, patient, filter, action]);
  const [dropdown, setDropdown] = useState(false);
  const toggleFilter = () => setDropdown(!dropdown);

  return (
    <React.Fragment>
      <div>
        <div className="py-3 d-flex justify-content-end align-items-end text-end">
          <FormGroup check inline>
            <Input
              checked={action}
              value={"DELETED"}
              onChange={(e) =>
                action === "DELETED" ? setAction(null) : setAction("DELETED")
              }
              type="checkbox"
            />
            <Label check>Delete Filter</Label>
          </FormGroup>
          <Dropdown isOpen={dropdown} toggle={() => {}}>
            <DropdownToggle onClick={toggleFilter}>
              <svg
                viewBox="0 0 24 24"
                width={20}
                height={20}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z"
                    fill="#0F0F0F"
                  ></path>
                </g>
              </svg>
            </DropdownToggle>
            <DropdownMenu>
              {(timelineFilters || []).map((item, idx) => (
                <DropdownItem key={idx} value={item.name}>
                  <div className="d-flex align-items-center">
                    <Input
                      className="mt-0"
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        const isCurrentlyChecked = filter.includes(value);

                        // Create a new array based on the current state
                        const newFilter = isCurrentlyChecked
                          ? filter.filter((item) => item !== value) // Uncheck, remove the value
                          : [...filter, value]; // Check, add the value

                        if (item.name === "DELETED") setAction(item.name);
                        else setFilter(newFilter);
                      }}
                      checked={filter.includes(item.name)}
                      value={item.name}
                      id={idx + item.name}
                    />
                    <Label
                      className="mb-0 ms-2 w-100"
                      htmlFor={idx + item.name}
                    >
                      {item.label}
                    </Label>
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="timeline">
          {(timeline || []).map((item, idx) => (
            <React.Fragment key={idx}>
              <RenderWhen
                isTrue={item.relation === PATIENT_CHART ? true : false}
              >
                <TimelineLeft data={item} />
              </RenderWhen>
              <RenderWhen
                isTrue={item.relation === PATIENT_BILL ? true : false}
              >
                <TimelineRight data={item} />
              </RenderWhen>
              <RenderWhen
                isTrue={
                  item.relation !== PATIENT_BILL &&
                  item.relation !== PATIENT_CHART
                    ? // item.relation !== PATIENT_CENTER
                      true
                    : false
                }
              >
                <TimelineCenter data={item} />
              </RenderWhen>
            </React.Fragment>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

Timeline.propTypes = {
  timeline: PropTypes.array,
  patient: PropTypes.object,
};

const mapStateToProps = (state) => ({
  timeline: state.Timeline.patient,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(Timeline);
