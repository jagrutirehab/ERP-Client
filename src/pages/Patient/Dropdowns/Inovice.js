import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Input,
  UncontrolledDropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
  Label,
} from "reactstrap";
import { CAPSULE, CREAM, DROP } from "../../../Components/constants/medicine";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { categoryUnitOptions } from "../../../Components/constants/patient";

const Inovice = ({
  data,
  dataList,
  fieldName,
  addItem,
  categories,
  setCategories,
}) => {
  const [searchItem, setSearchItem] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchItem(value);
  };
  const categoryValues = categories?.map((c) => c.value.toLowerCase());

  return (
    <React.Fragment>
      <div className="d-flex align-items-stretch">
        <div>
          <Label>Invoice Procedures</Label>
          <UncontrolledDropdown
            className="me-2 dropdown-menu-md"
            direction="down"
          >
            <DropdownToggle
              className="p-0 w-100 position-relative"
              color="light"
            >
              <Input
                value={searchItem}
                onChange={handleChange}
                size={"sm"}
                className="w-100"
                style={{ height: "37px" }}
              />
              {/* add custom medicine */}
              {/* <span
              onClick={() => {
                addItem(searchItem, data);
                setSearchItem("");
              }}
              className="link-success ri-send-plane-2-fill dropdown-input-icon"
            ></span> */}
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-md overflow-auto dropdown-height-md">
              <DropdownItem></DropdownItem>
              {(dataList || [])
                .filter((item) => {
                  const matchesSearch = item[fieldName]
                    ?.toLowerCase()
                    .includes(searchItem.toLowerCase());

                  const matchesCategory =
                    categoryValues?.length === 0 || // <- show all if category list is empty
                    categoryValues?.includes(item.category?.toLowerCase());

                  return matchesSearch && matchesCategory;
                })
                .map((item) => (
                  <DropdownItem
                    className={
                      item.quantity === 0
                        ? "d-flex align-items-center fs-6 text-danger"
                        : "d-flex align-items-center link-primary fs-6"
                    }
                    key={item["_id"]}
                    onClick={() => {
                      if (item.quantity === 0) {
                        toast.error("Inovice out of stock", {
                          position: "top-center",
                          autoClose: true,
                        });
                      } else addItem(item, data);
                    }}
                  >
                    {item["type"] === CAPSULE ? (
                      <i className="las la-pills text-info me-2 fs-5"></i>
                    ) : item["type"] === DROP ? (
                      <i className="bx bxs-droplet-half text-info me-2 fs-5"></i>
                    ) : item["type"] === CREAM ? (
                      <i className="las la-prescription-bottle-alt text-info me-2 fs-5"></i>
                    ) : null}
                    <span className="text-capitalize">{item[fieldName]}</span>
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
        <div className="w-25">
          <Label>Categories</Label>
          <Select
            // defaultValue={[{ label: "All", value: "all" }]}
            isMulti
            name="colors"
            onChange={(e) => setCategories(e)}
            options={[
              ...Object.keys(categoryUnitOptions).map((key) => ({
                label: key,
                value: key,
              })),
              // { label: "All", value: "all" },
            ]}
            styles={
              {
                // control: (base) => ({
                //   ...base,
                //   minHeight: "32px !important",
                //   height: "31px !important",
                //   alignItems: "center",
                // }),
                // input: (base) => ({
                //   ...base,
                //   margin: 0,
                //   // marginBottom: "px",
                //   minHeight: "20px",
                //   height: "20px",
                //   padding: 0,
                // }),
              }
            }
            className="basic-multi-select text-capitalize"
            classNamePrefix="select"
          />
        </div>
      </div>
    </React.Fragment>
  );
};

Inovice.propTypes = {
  data: PropTypes.array,
  setMedicines: PropTypes.func,
  dataList: PropTypes.array,
};

const mapStateToProps = (state) => ({
  //dataList: state.Inovice.data,
});

export default connect(mapStateToProps)(Inovice);
