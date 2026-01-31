import React, { useEffect, useState } from "react";
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
import { connect, useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { categoryUnitOptions } from "../../../Components/constants/patient";
import { fetchBillItems } from "../../../store/actions";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";

const Inovice = ({
  data,
  dataList,
  fieldName,
  addItem,
  categories,
  setCategories,
  center,
}) => {
  const dispatch = useDispatch();
  const centers = useSelector((state) => state.User?.centerAccess);
  const [searchItem, setSearchItem] = useState("");
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    dispatch(fetchBillItems({ centerIds: centers, page: 1, limit: 2000 }));
  }, [dispatch, centers]);
  console.log("Invoice procedures (raw from API):", dataList);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchItem(value);
  };
  const categoryValues = categories?.map((c) => c.value.toLowerCase());

  console.log("center from dropdown", dataList);

  const patientCenterId = String(center?._id);

  return (
    <React.Fragment>
      <div className="d-flex align-items-stretch gap-3 flex-wrap">
        <div style={{ minWidth: isMobile ? "100%" : "250px" }}>
          <Label>Invoice Procedures</Label>
          <UncontrolledDropdown
            className="me-2 dropdown-menu-md w-100"
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
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-md overflow-auto dropdown-height-md w-100">
              <DropdownItem></DropdownItem>
              {(dataList || [])
                .filter((item) => {
                  const matchesSearch = item[fieldName]
                    ?.toLowerCase()
                    .includes(searchItem.toLowerCase());

                  const matchesCategory =
                    categoryValues?.length === 0 ||
                    categoryValues?.includes(item.category?.toLowerCase());

                  const matchesCenter =
                    Array.isArray(item.center) &&
                    item.center.some((c) => String(c) === patientCenterId);

                  return matchesSearch && matchesCategory && matchesCenter;
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
        <div
          style={{
            minWidth: isMobile ? "100%" : "280px",
            maxWidth: isMobile ? "" : "75%",
          }}
        >
          <Label>Categories</Label>
          <Select
            isMulti
            name="colors"
            onChange={(e) => setCategories(e)}
            options={[
              ...Object.keys(categoryUnitOptions).map((key) => ({
                label: key,
                value: key,
              })),
            ]}
            className="basic-multi-select text-capitalize w-100"
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

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(Inovice);
