import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Spinner,
  Dropdown,
  // UncontrolledDropdown,
} from "reactstrap";
import RenderWhen from "../../../Components/Common/RenderWhen";
// import { socket } from "../../../socket";
import debounce from "lodash.debounce"; // Use debounce utility

import { connect, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import config from "../../../config";

// Initialize the socket connection
const socket = io(config.api.BASE_URL, {
  path: "/socket/search",
});

const SearchPatient = ({
  patients,
  validation,
  disabled,
  searchLoading,
  editEvent,
  centerAccess,
}) => {
  // const dispatch = useDispatch();

  // const [value, setValue] = useState("");
  // const handleChange = (e) => {
  //   const val = e.target.value;
  //   setValue(val);
  //   // validation.setFieldValue("patientName", val);
  // };

  const [worker, setWorker] = useState(null);
  const [value, setValue] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  // const fuse = useMemo(() => {
  //   const fuseOptions = {
  //     isCaseSensitive: false,
  //     // includeScore: false,
  //     // shouldSort: true,
  //     // includeMatches: false,
  //     // findAllMatches: false,
  //     minMatchCharLength: 3,
  //     // location: 0,
  //     threshold: 0.2,
  //     distance: 10,
  //     // useExtendedSearch: false,
  //     // ignoreLocation: false,
  //     ignoreFieldNorm: true,
  //     // fieldNormWeight: 1,
  //     keys: ["name", "phoneNumber"],
  //   };
  //   return new Fuse([...patients], fuseOptions);
  // }, [patients]);

  const handleChange = (e) => {
    const val = e.target.value;
    setIsSearching(true);
    socket.emit("search", val);
    // setIsSearching(true);
    // const debounceQuery = debounce(() => {
    //   socket.emit("search", val);
    //   console.log(worker, "worker");
    // }, 2000);
    // debounceQuery();

    // if (worker.onmessage) {
    //   console.log("post message");

    //   worker.postMessage({ type: "search", query: val });
    // }
  };

  const debouncedOnChange = debounce(handleChange, 500);

  useEffect(() => {
    // const newWorker = new Worker(
    //   new URL("../../../workers/search.js", import.meta.url)
    // );
    // console.log(newWorker, "worker");

    // const nData = [
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   // ...patients,
    //   ...patients,
    //   ...patients,
    // ];
    // newWorker.postMessage({ type: "initialize", data: nData });
    // newWorker.onmessage = (event) => {
    //   setFilteredPatients(event.data);
    //   setIsSearching(false);
    // };
    // setWorker(newWorker);
    // if (socket) {
    socket.on("searchResults", (data) => {
      setIsSearching(false);
      setFilteredPatients(data);
    });
    // }

    // Cleanup on component unmount
    return () => {
      socket.off("searchResults");
    };

    // return () => newWorker.terminate();
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
