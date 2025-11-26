import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "reactstrap";
import PropTypes from "prop-types";
import Highlighter from "react-highlight-words";

//SimpleBar
import SimpleBar from "simplebar-react";
import RenderWhen from "../../Components/Common/RenderWhen";

import { connect, useDispatch } from "react-redux";
import {
  searchPatient,
  setTotalAmount,
  viewPatient,
} from "../../store/actions";
import PatientPlaceholder from "./PatientPlaceholder";

const SearchOption = ({ loading, patients, centerAccess }) => {
  
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const onChangeData = (value) => {
    setValue(value);
  };

  useEffect(() => {
    var searchOptions = document.getElementById("search-close-options");
    var dropdown = document.getElementById("search-dropdown");
    var searchInput = document.getElementById("search-options");

    searchInput.addEventListener("focus", function () {
      var inputLength = searchInput.value.length;
      if (inputLength > 0) {
        dropdown.classList.add("show");
        searchOptions.classList.remove("d-none");
      } else {
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
      }
    });

    searchInput.addEventListener("keyup", function () {
      var inputLength = searchInput.value.length;
      if (inputLength > 0) {
        dropdown.classList.add("show");
        searchOptions.classList.remove("d-none");
      } else {
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
      }
    });

    searchOptions.addEventListener("click", function () {
      searchInput.value = "";
      dropdown.classList.remove("show");
      searchOptions.classList.add("d-none");
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.getAttribute("id") !== "search-options") {
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
      }
    });
  }, []);

  useEffect(() => {
    if (value) dispatch(searchPatient({ name: value, centerAccess }));
  }, [value, dispatch, centerAccess]);

  return (
    <React.Fragment>
      <form className="app-search d-none d-md-block">
        <div className="position-relative">
          <Input
            type="text"
            className="form-control"
            placeholder="Search..."
            id="search-options"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              onChangeData(e.target.value);
            }}
          />
          <span className="mdi mdi-magnify search-widget-icon"></span>
          <span
            className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
            id="search-close-options"
          ></span>
        </div>
        <div className="dropdown-menu dropdown-menu-lg" id="search-dropdown">
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
                    dispatch(viewPatient(pt));
                    dispatch(
                      setTotalAmount({
                        totalPayable: 0,
                        totalAdvance: 0,
                      })
                    );
                  }}
                  className="dropdown-item fs-13 notify-item"
                >
                  <i className="ri-bubble-chart-line align-middle fs-18 text-muted me-2"></i>
                  <Highlighter
                    searchWords={[value]}
                    autoEscape={true}
                    textToHighlight={`${pt?.name} (${pt?.center?.title})`}
                  />
                </Link>
              ))}
            </RenderWhen>
          </SimpleBar>
        </div>
      </form>
    </React.Fragment>
  );
};

SearchOption.prototype = {
  loading: PropTypes.bool,
  patients: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  loading: state.Patient.searchLoading,
  patients: state.Patient.searchedPatients,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(SearchOption);
