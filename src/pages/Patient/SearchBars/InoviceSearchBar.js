import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Input } from "reactstrap";

//SimpleBar
import SimpleBar from "simplebar-react";
import { connect } from "react-redux";

//redux
// import { useDispatch } from "react-redux";

const InvoiceSearchBar = ({ setInvoiceList, invoiceList, items }) => {
  // const dispatch = useDispatch();

  let checkDuplicate = true;
  const makeForm = (item) => {
    const checkItem = invoiceList.find((_) => _.name === item.name);
    if (!checkItem) {
      setInvoiceList((prevValue) => {
        return [
          ...prevValue,
          {
            slot: item._id ? item._id : "",
            name: item.name ? item.name : item,
            unit: parseInt(item.unit) || 0,
            cost: parseInt(item.cost) || 0,
            comments: "",
          },
        ];
      });
    }
  };

  // const { settings } = useSelector((state) => state.invoiceSettings);
  const [toggleBar, setToggleBar] = useState(false);
  const [slot, setSlot] = useState(false);
  const [addCustom, setAddCustom] = useState(false);
  const [searchSetting, setSearchSetting] = useState("");

  // useEffect(() => {
  //   dispatch(getInvoiceSettings());
  // }, [dispatch]);

  useEffect(() => {
    var searchOptions = document.getElementById("bill-close-options");
    var dropdown = document.getElementById("bill-dropdown");
    var searchInput = document.getElementById("bill-options");

    searchInput.addEventListener("focus", function () {
      var inputLength = searchInput.value.length;
      if (inputLength >= 0) {
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

    document.body.addEventListener("click", function (e) {
      if (
        e.target.getAttribute("id") !== "bill-options" &&
        e.target.getAttribute("id") !== "bill-dropdown" &&
        e.target.getAttribute("id") !== "custom-slot" &&
        e.target.getAttribute("id") !== "add-custom"
      ) {
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
        setToggleBar(false);
      }
    });
  }, []);

  const handleClick = (item) => {
    if (slot) {
      makeForm(slot);
      setSlot("");
    }
    if (item.name) makeForm(item);
    setToggleBar(false);
  };

  const handleChange = (e) => {
    setSlot(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchSetting(e.target.value);
  };

  return (
    <React.Fragment>
      <div className="app-search d-block">
        <div className="position-relative" style={{ width: "300px" }}>
          <Input
            type="text"
            className="form-control border"
            style={{ width: "300px" }}
            placeholder="Search..."
            id="bill-options"
            autoComplete="off"
            value={searchSetting || ""}
            onClick={() => setToggleBar(true)}
            onChange={handleSearch}
          />
          <span
            style={{ left: "10px" }}
            className="mdi mdi-magnify search-widget-icon"
          ></span>
          <span
            onClick={() => setToggleBar(false)}
            className="mdi mdi-close-circle text-danger search-widget-icon search-widget-icon-close"
            // style={{ left: '100% !important' }}
            id="bill-close-options"
          ></span>
        </div>
        <div
          className="dropdown-menu dropdown-menu-lg"
          id="bill-dropdown"
          style={{
            // height: '200px',
            display: toggleBar ? "block" : "none",
          }}
        >
          <SimpleBar
            style={{ height: "200px", overflowY: "auto", width: "auto" }}
            className="position-relative fancy-bar"
          >
            <div className="dropdown-header">
              <h6 className="text-overflow text-muted mb-0 text-uppercase">
                Procedures
              </h6>
            </div>
            <div className="dropdown-item bg-transparent text-wrap">
              <div className="pb-3">
                {(items || [])
                  .filter((item) =>
                    item.name
                      ?.toLowerCase()
                      .includes(searchSetting.toLowerCase())
                  )
                  .map((item) => {
                    return (
                      <div key={item._id}>
                        <Link
                          to="#"
                          className="dropdown-item notify-item p-0 pt-2 pb-2 text-capitalize"
                          style={{ whiteSpace: "pre-wrap" }}
                          onClick={() => handleClick(item)}
                          value={item._id}
                        >
                          <i className="ri-lifebuoy-line align-middle fs-18 text-muted me-2"></i>
                          <span>{item.name}</span>
                        </Link>
                      </div>
                    );
                  })}
              </div>
            </div>
          </SimpleBar>
          <div
            to="#"
            className="notify-item ps-3 pe-3 w-100 d-flex justify-content-center align-items-end"
            style={{ bottom: "0", left: "0" }}
          >
            <i
              style={{ cursor: "pointer" }}
              onClick={() => {
                setAddCustom(!addCustom);
                setToggleBar(true);
              }}
              className="ri-add-circle-line font-size-25"
              id="add-custom"
            ></i>
            {addCustom && (
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Input
                    type="text"
                    name="customSlot"
                    // required
                    onClick={() => setToggleBar(true)}
                    onChange={handleChange}
                    value={slot || ""}
                    style={{ marginLeft: "-0.7rem" }}
                    className="form-control bg-light h-50 ms-0"
                    placeholder="Custom Slot"
                    id="custom-slot"
                  />
                </div>
                <div className="text-end">
                  <button
                    type="submit"
                    className="btn btn-light btn-sm p-0"
                    style={{ background: "transparent", border: "none" }}
                  >
                    <Link to="#">
                      <i
                        onClick={handleClick}
                        style={{ cursor: "pointer" }}
                        className="ri-telegram-line align-middle font-size-25 text-muted"
                      ></i>
                    </Link>
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* </Form> */}
        </div>
      </div>
    </React.Fragment>
  );
};

InvoiceSearchBar.propTypes = {
  invoiceList: PropTypes.array,
  setInvoiceList: PropTypes.func,
  items: PropTypes.array,
};

const mapStateToProps = (state) => ({
  items: state.Setting.bill,
});

export default connect(mapStateToProps)(InvoiceSearchBar);
