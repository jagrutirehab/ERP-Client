import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Input,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import axios from "axios";

const Medicine = ({ data, dataList, fieldName, addItem }) => {
  const [dropdown, setDropdown] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  const debouncedHandleChange = debounce(async (val) => {
    try {
      const res = await axios.get("/medicine/", {
        params: {
          search: val,
          page: 1,
          limit: 10,
        },
      });
      const payload = res?.payload || [];
      setFilteredMedicines(payload);
      setDropdown(true);
    } catch (error) {
      console.error("Failed to fetch medicines", error);
    }
  }, 500);

  const onInputChange = (e) => {
    const val = e.target.value;
    setSearchItem(val);
    debouncedHandleChange(val);
  };

  return (
    <div>
      <Dropdown
        isOpen={dropdown}
        toggle={() => setDropdown(!dropdown)}
        className="me-2 dropdown-menu-md"
        direction="down"
      >
        <DropdownToggle className="p-0 w-100 position-relative" color="light">
          <Input
            value={searchItem}
            onChange={onInputChange}
            size="sm"
            className="w-100 text-uppercase"
            onFocus={() => {
              if (filteredMedicines.length > 0) setDropdown(true);
            }}
            onBlur={() => {
              setTimeout(() => setDropdown(false), 300);
            }}
          />
          <span
            onClick={() => {
              addItem(searchItem, data);
              setSearchItem("");
            }}
            className="link-success ri-send-plane-2-fill dropdown-input-icon"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          ></span>
        </DropdownToggle>

        <DropdownMenu
          className="dropdown-menu-md"
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            width: "100%",
          }}
        >
          {filteredMedicines.length === 0 ? (
            <DropdownItem className="text-muted">
              No medicines found
            </DropdownItem>
          ) : (
            filteredMedicines.map((item) => (
              <DropdownItem
                key={item["_id"]}
                // className={
                //   item.quantity === 0
                //     ? "d-flex align-items-center fs-6 text-danger"
                //     : "d-flex align-items-center link-primary fs-6"
                // }
                className="d-flex align-items-center link-primary fs-6"
                onMouseDown={() => {
                  // if (item.quantity === 0) {
                  //   toast.error("Medicine out of stock", {
                  //     position: "top-center",
                  //     autoClose: true,
                  //   });
                  // } else {
                  addItem(item, data);
                  setSearchItem("");
                  setDropdown(false);
                  // }
                }}
              >
                <span>{item.type}</span>
                <span className="ms-2 text-capitalize">{item[fieldName]}</span>
                <span className="ms-2">
                  {item.strength} {item.unit}
                </span>
              </DropdownItem>
            ))
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

Medicine.propTypes = {
  data: PropTypes.array,
  setMedicines: PropTypes.func,
  dataList: PropTypes.array,
  fieldName: PropTypes.string.isRequired,
  addItem: PropTypes.func.isRequired,
};

export default connect(null)(Medicine);
