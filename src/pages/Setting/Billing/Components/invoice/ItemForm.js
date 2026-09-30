import React, { useEffect, useState } from "react";
import { Form, Row, Col, Input, Button, FormFeedback, Label } from "reactstrap";
import PropTypes from "prop-types";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { connect, useDispatch } from "react-redux";
import { addBillItem } from "../../../../../store/actions";
import { getCategoriesOfProcedures } from "../../../../../helpers/backend_helper";
import Select from "react-select";
import { toast } from "react-toastify";

// const categories = [
//   "2d echo charges",
//   "ac charges",
//   "airbed charges",
//   "ambulance charges",
//   "attendant/care taker charges",
//   "bio medical waste charges",
//   "bsl charges",
//   "ct scan",
//   "diaper charges",
//   "medical consumables",
//   "discharge medicines",
//   "doctor consultation charges",
//   "doppler charges",
//   "dressing charges",
//   "drug test",
//   "ecg charges",
//   "ect charges",
//   "emergency charges",
//   "emergency hospital charges",
//   "enema",
//   "extra food charges",
//   "hospital charges",
//   "injectables",
//   "mrd charges",
//   "mri charges",
//   "nebulisation charges",
//   "nursing charges",
//   "opd consultation charges",
//   "other charges",
//   "medicines",
//   "physiotherapy charges",
//   "procedure charges",
//   "psychological counselling",
//   "psychological test",
//   "refund",
//   "registration charges",
//   "room charges",
//   "sleep study charges",
//   "travel expenses",
//   "upt charges",
//   "usg charges",
//   "x-ray charges",
// ];

const MedicinesForm = ({ toggle, centers, userCenters }) => {
  const dispatch = useDispatch();
  const [items, setBillItems] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState(
    centers.map((cen) => cen._id),
  );
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState([]);

  const handleChange = (e) => {
    const itemList = [...items];
    const prop = e.target.name;
    let value = e.target.value;
    const idx = e.target.id;
    if (prop === "cost" || prop === "unit") {
      value = value.replace(/[^0-9]/g, "");
    }

    if (!itemList[idx]) return;

    itemList[idx][prop] = value;
    setBillItems(itemList);
  };

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      items: items,
      centers: selectedCenters,
    },
    validationSchema: Yup.object({
      items: Yup.array().test(
        "notEmpty",
        "Atleas one medicine is required",
        (value) => {
          if (!value || value.length === 0) {
            return false;
          }
          return true;
        },
      ),
      centers: Yup.array().test(
        "notEmpty",
        "At least one center is required",
        (value) => !(!value || value.length === 0),
      ),
    }),
    onSubmit: (values) => {
      const formattedItems = items.map((item) => ({
        name: item.name,
        category: item.category,
        unit: item.unit,
        prices: item.itemPrices
          .filter((p) => p.unit && p.price)
          .map((p) => ({
            unit: p.unit,
            price: Number(p.price),
          })),
      }));

      dispatch(
        addBillItem({
          items: formattedItems,
          centers: values.centers,
          centerIds: userCenters,
        }),
      );

      setBillItems([]);
      toggle();
      validation.resetForm();
    },
  });

  const addItems = () => {
    const newItem = {
      name: "",
      category: "",
      valueUnit: "",
      itemPrices: [],
      availableUnits: [],
    };
    setBillItems([...items, newItem]);
  };

  const removeMedicine = (idx) => {
    const itemList = [...items];
    itemList.splice(idx, 1);
    setBillItems(itemList);
  };

  const allCenterIds = (centers || []).map((c) => c._id);

  const isAllSelected =
    validation.values.centers?.length === allCenterIds.length &&
    allCenterIds.length > 0;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoriesOfProcedures();
      console.log("response", response);
      setCategories(response?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
  }));

  return (
    <React.Fragment>
      <div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
          }}
          className="needs-validation"
        >
          <Row className="ps-3 pe-3">
           
            <Col xs={12} className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Label className="mb-0">Centers</Label>
                <Button
                  size="sm"
                  outline
                  color={isAllSelected ? "danger" : "primary"}
                  onClick={() => {
                    const updated = isAllSelected ? [] : allCenterIds;
                    validation.setFieldValue("centers", updated);
                    setSelectedCenters(updated);
                  }}
                >
                  {isAllSelected ? "Unselect All" : "Select All"}
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-3">
                {(centers || []).map((cen) => (
                  <div key={cen._id}>
                    <Input
                      type="checkbox"
                      value={cen._id}
                      checked={validation.values.centers.includes(cen._id)}
                      onChange={(e) => {
                        const value = e.target.value;
                        const updated = validation.values.centers.includes(
                          value,
                        )
                          ? validation.values.centers.filter(
                              (id) => id !== value,
                            )
                          : [...validation.values.centers, value];
                        validation.setFieldValue("centers", updated);
                        setSelectedCenters(updated);
                      }}
                    />
                    <Label className="ms-1">{cen.title}</Label>
                  </div>
                ))}
              </div>
              {validation.touched.centers && validation.errors.centers && (
                <FormFeedback type="invalid" className="d-block">
                  {validation.errors.centers}
                </FormFeedback>
              )}
            </Col>

            
            {(items || []).map((medicine, idx) => (
              <div
                key={idx}
                className="border p-3 rounded mb-4 bg-light-subtle"
              >
                <Row className="mb-3">
                  <Col md={4}>
                    <Label className="form-label fw-bold small">
                      Item Name*
                    </Label>
                    <Input
                      required
                      bsSize="sm"
                      name="name"
                      value={medicine?.name || ""}
                      onChange={handleChange}
                      id={idx}
                      placeholder="e.g. ICU Room"
                    />
                  </Col>
                  <Col md={2}>
                    <Label className="form-label fw-bold small">
                      Qty (Unit)
                    </Label>
                    <Input
                      bsSize="sm"
                      name="unit"
                      value={medicine.unit}
                      onChange={handleChange}
                      id={idx}
                    />
                  </Col>
                  <Col md={5}>
                    <Label className="form-label fw-bold small">Category</Label>
                    <Select
                      classNamePrefix="react-select"
                      placeholder="Select Category"
                      options={categoryOptions}
                      value={categoryOptions.find(
                        (opt) => opt.value === medicine.category,
                      )}
                      onChange={(selected) => {
                        const updated = [...items];
                        const selectedCategory = categories.find(
                          (cat) => cat._id === selected.value,
                        );
                        const availableUnits = selectedCategory?.units || [];

                        updated[idx].category = selected.value;
                        updated[idx].availableUnits = availableUnits;

                        updated[idx].itemPrices = availableUnits.map((u) => ({
                          unit: u.value,
                          price: "",
                        }));
                        setBillItems(updated);
                      }}
                    />
                  </Col>
                  <Col
                    md={1}
                    className="d-flex align-items-end justify-content-end"
                  >
                    <Button
                      size="sm"
                      color="danger"
                      onClick={() => removeMedicine(idx)}
                    >
                      <i className="ri-delete-bin-6-line"></i>
                    </Button>
                  </Col>
                </Row>

                {/* Dynamic Price Rows */}
                {medicine.itemPrices && medicine.itemPrices.length > 0 && (
                  <Row className="g-3 border-top pt-2 mt-2">
                    {medicine.itemPrices.map((pRow, pIdx) => (
                      <React.Fragment key={pIdx}>
                        <Col md={3}>
                          <Label className="form-label text-muted extra-small mb-1">
                            Select Unit {pIdx + 1}
                          </Label>
                          <Input
                            type="select"
                            bsSize="sm"
                            value={pRow.unit}
                            onChange={(e) => {
                              const selectedVal = e.target.value;
                              const updated = [...items];

                            
                              const isDuplicate = medicine.itemPrices.some(
                                (p, i) => p.unit === selectedVal && i !== pIdx,
                              );

                              if (isDuplicate && selectedVal !== "") {
                                toast.error(
                                  `Unit "${selectedVal}" is already selected for this item.`,
                                );
                                updated[idx].itemPrices[pIdx].unit = "";
                              } else {
                                updated[idx].itemPrices[pIdx].unit =
                                  selectedVal;
                              }
                              setBillItems(updated);
                            }}
                          >
                            <option value="">Select Unit</option>
                            {medicine.availableUnits.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </Input>
                        </Col>
                        <Col md={3}>
                          <Label className="form-label text-muted extra-small mb-1">
                            {pRow.unit
                              ? `${pRow.unit.toUpperCase()} Cost`
                              : "Cost"}
                          </Label>
                          <Input
                            bsSize="sm"
                            placeholder="0.00"
                            value={pRow.price}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].itemPrices[pIdx].price =
                                e.target.value.replace(/[^0-9]/g, "");
                              setBillItems(updated);
                            }}
                          />
                        </Col>
                      </React.Fragment>
                    ))}
                  </Row>
                )}
              </div>
            ))}

            {/* Footer Actions */}
            <Col xs={12} className="mt-2">
              <div className="d-flex justify-content-between">
                <Button
                  size="sm"
                  type="button"
                  color="secondary"
                  outline
                  onClick={addItems}
                >
                  + Add Item
                </Button>
                <Button size="sm" type="submit" color="primary">
                  Save All Items
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

MedicinesForm.propTypes = {
  toggle: PropTypes.func.isRequired,
  centers: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  userCenters: state.User?.centerAccess,
});

export default connect(mapStateToProps)(MedicinesForm);
