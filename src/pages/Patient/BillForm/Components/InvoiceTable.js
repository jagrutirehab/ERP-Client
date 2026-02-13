import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Input, Button, Row, Col, Label } from "reactstrap";
import { categoryUnitOptions } from "../../../../Components/constants/patient";
import { getProceduresByCenterid } from "../../../../helpers/backend_helper";
import { useRef } from "react";

const InvoiceTable = ({ invoiceList, setInvoiceList, center, isEdit }) => {
  const [cost, setCost] = useState(0);
  const normalizedRef = useRef(false);

  // const handleDiscountChange = (idx, field, value) => {
  //   const list = [...invoiceList];
  //   const item = { ...list[idx] };

  //   let discountValue = Number(value) || 0;
  //   let originalCost = Number(item.originalCost ?? item.cost);

  //   // store original cost once
  //   if (!item.originalCost) {
  //     item.originalCost = originalCost;
  //   }
  //   let discountAmount = 0; // ✅ ADD

  //   // validations
  //   if (item.discountType === "%") {
  //     if (discountValue > 100) discountValue = 100;
  //     discountAmount = originalCost * discountValue;
  //     item.cost = originalCost - discountAmount;
  //   } else {
  //     if (discountValue > originalCost) discountValue = originalCost;
  //     discountAmount = discountValue;
  //     item.cost = originalCost - discountValue;
  //   }

  //   item.discountValue = discountValue;
  //   item.itemDiscount = Math.round(discountAmount); // ✅ ADD (THIS IS KEY)
  //   item.cost = Math.max(0, Math.round(item.cost));

  //   list[idx] = item;
  //   setInvoiceList(list);
  // };

  const handleDiscountChange = (idx, value) => {
    const list = [...invoiceList];
    const item = { ...list[idx] };

    item.discountValue = value;

    const cost = Number(item.cost) || 0;
    const numericValue = Number(value);

    if (value === "" || isNaN(numericValue)) {
      item.itemDiscount = 0;
      item.finalCost = cost;
      item.afterDiscount = cost;
    } else {
      let discountAmount =
        item.discountType === "%" ? (cost * numericValue) / 100 : numericValue;

      discountAmount = Math.min(discountAmount, cost);

      item.itemDiscount = Math.round(discountAmount);
      item.finalCost = Math.max(0, cost - discountAmount);
      item.afterDiscount = item.finalCost;
    }

    list[idx] = item;
    setInvoiceList(list);
  };

  const handleCostChange = (e, idx, item) => {
    const value = e.target.value;
    const numericValue = value === "" ? "" : Number(value);
    let finalCost = numericValue;

    const updatedCenters = (item.centers || []).map((c) =>
      String(c.center._id) === String(center._id)
        ? { ...c, cost: value === "" ? "" : parseInt(value) }
        : c,
    );

    if (item.discountValue) {
      const discount =
        item.discountType === "%"
          ? (numericValue * Number(item.discountValue)) / 100
          : Number(item.discountValue);

      finalCost = Math.max(numericValue - Math.min(discount, numericValue), 0);
    }

    const newInvoiceList = [...invoiceList];
    newInvoiceList[idx] = {
      ...item,
      centers: updatedCenters,
      cost: value === "" ? "" : Number(value),
      originalCost: value,
      finalCost,
      afterDiscount: finalCost,
      // discountValue: "",
      discountValue: item.discountValue || "",
      // itemDiscount: 0,
      itemDiscount: item.itemDiscount || 0,
      isInitialized: true,
    };

    console.log("newInvoiceList", newInvoiceList);
    setInvoiceList(newInvoiceList);
  };

  const getValues = (e) => {
    const prop = e.target.name;
    console.log("prop", prop);
    const value =
      prop === "category" ? e.target.value.toLowerCase() : e.target.value;
    const idx = parseInt(e.target.id);

    const newInvoiceList = [...invoiceList];

    const item = JSON.parse(JSON.stringify(newInvoiceList[idx]));

    if (prop === "unitOfMeasurement") {
      item.unitOfMeasurement = value;
      if (isEdit) {
        newInvoiceList[idx] = item;
        setInvoiceList(newInvoiceList);
        return;
      }

      console.log("item", item);

      const matchingPriceObj = (item.availablePrices || []).find(
        (p) => String(p.unit).toLowerCase() === String(value).toLowerCase(),
      );
      // console.log("Found Price:", matchingPriceObj, "for unit:", value, "in list:", item.availablePrices);

      if (matchingPriceObj) {
        const newPrice = Number(matchingPriceObj.price);
        item.cost = newPrice;

        // new
        if (item.discountValue) {
          const discount =
            item.discountType === "%"
              ? (newPrice * Number(item.discountValue)) / 100
              : Number(item.discountValue);

          const safeDiscount = Math.min(discount, newPrice);

          item.itemDiscount = Math.round(safeDiscount);
          item.finalCost = Math.max(newPrice - safeDiscount, 0);
          item.afterDiscount = item.finalCost;
        } else {
          item.finalCost = newPrice;
          item.afterDiscount = newPrice;
        }

        item.isInitialized = true;
        // new

        if (item.centers) {
          item.centers = item.centers.map((c) =>
            String(c.center?._id || c.center) === String(center._id)
              ? { ...c, cost: newPrice }
              : c,
          );
        }
      }
    } else if (prop === "category") {
      const unitOptions = isEdit
        ? getUnitOptions(item.category)
        : item.availablePrices && item.availablePrices.length > 0
          ? item.availablePrices.map((p) => ({
              label: p.unit,
              value: p.unit,
            }))
          : getUnitOptions(item.category);
    } else {
      item[prop] = value;
    }

    newInvoiceList[idx] = item;
    setInvoiceList(newInvoiceList);
  };

  const deleteForm = (idx) => {
    const list = [...invoiceList];
    list.splice(idx, 1);
    setInvoiceList(list);
  };

  const getUnitOptions = (category) => {
    return (
      categoryUnitOptions[category?.toLowerCase()] ||
      categoryUnitOptions.default
    );
  };

  console.log("DEBUG slot value =>", invoiceList);
  console.log("DEBUG typeof slot =>", typeof invoiceList?.[0]?.slot);

  useEffect(() => {
    if (!invoiceList.length) return;
    if (isEdit) return;

    setInvoiceList((prev) =>
      prev.map((item) => {
        if (
          !Array.isArray(item.availablePrices) ||
          item.availablePrices.length === 0
        ) {
          return item;
        }

        const first = item.availablePrices[0];

        // 🔥 FORCE INITIAL PRICE (ignore old cost & unit)
        if (item.cost !== Number(first.price)) {
          return {
            ...item,
            unitOfMeasurement: first.unit,
            cost: Number(first.price),
            finalCost: Number(first.price),
            afterDiscount: Number(first.price),
          };
        }

        return item;
      }),
    );
  }, [invoiceList.map((i) => i.availablePrices?.length).join(","), isEdit]);

  console.log(invoiceList[0]);

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="pb-3 pt-3 border-bottom d-none d-md-block">
          <Row>
            <Col className="font-semi-bold treatment-head" md={2}>
              Treatments
            </Col>
            <Col className="font-semi-bold unit-head" md={2}>
              Quantity
            </Col>
            <Col className="font-semi-bold cost-head" md={1}>
              Cost
            </Col>
            <Col className="font-semi-bold cost-head" md={2}>
              After Discount
            </Col>
            <Col className="font-semi-bold cost-head" md={2}>
              Unit of Measurement
            </Col>
            <Col className="font-semi-bold total-head" md={2}>
              Discount
            </Col>
            {/* <Col className="font-semi-bold total-head" md={1}>
              Total
            </Col> */}
          </Row>
        </div>
        <div>
          {(invoiceList || []).map((item, idx) => {
            console.log("item", item);
            const perUnitDiscount =
              item.discountType === "%"
                ? (item.cost * item.discountValue) / 100
                : item.discountValue;

            const finalCost = Math.max(item.cost - perUnitDiscount, 0);
            const totalValue = item.unit * finalCost;

            const unitCostTotal = totalValue;
            const unitOptions =
              item.availablePrices && item.availablePrices.length > 0
                ? item.availablePrices.map((p) => ({
                    label: p.unit,
                    value: p.unit,
                  }))
                : getUnitOptions(item.category);
            console.log("unitOptions", unitOptions);

            return (
              <React.Fragment key={item.id + item.slot}>
                {/* Mobile Layout */}
                <div className="d-md-none card shadow-sm mb-3 mt-2">
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-primary text-capitalize fw-bold">
                          {item.slot}
                        </span>
                        <Button
                          onClick={() => deleteForm(idx)}
                          color="danger"
                          size="sm"
                          className="ms-2"
                        >
                          <i className="ri-close-circle-line font-size-16"></i>
                        </Button>
                      </div>
                    </div>

                    <Row className="g-2 mb-3">
                      <Col xs={2}>
                        <div className="mb-2">
                          <Label size="sm" className="fw-bold text-muted">
                            Quantity
                          </Label>
                          <Input
                            bsSize="sm"
                            id={idx}
                            min={1}
                            type="number"
                            name="unit"
                            value={item.unit || ""}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0 || e.target.value === "") {
                                getValues(e);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.which === 38 || e.which === 40) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="mb-2">
                          <Label size="sm" className="fw-bold text-muted">
                            Cost
                          </Label>
                          <Input
                            bsSize="sm"
                            id={idx}
                            type="number"
                            name="cost"
                            min={1}
                            value={item.cost || ""}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0 || e.target.value === "") {
                                handleCostChange(e, idx, item);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.which === 38 || e.which === 40) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row className="g-2 mt-2">
                      <Col xs={5}>
                        <Input
                          bsSize="sm"
                          type="select"
                          value={item.discountType}
                          onChange={(e) => {
                            const list = [...invoiceList];
                            list[idx] = {
                              ...list[idx],
                              discountType: e.target.value,
                              discountValue: 0,
                            };
                            setInvoiceList(list);
                          }}
                        >
                          <option value="₹">₹</option>
                          <option value="%">%</option>
                        </Input>
                      </Col>

                      <Col xs={7}>
                        <Input
                          bsSize="sm"
                          type="number"
                          min={0}
                          max={item.discountType === "%" ? 100 : item.cost}
                          value={
                            item.discountValue === 0 ? "" : item.discountValue
                          }
                          onChange={(e) =>
                            handleDiscountChange(
                              idx,
                              // "discountValue",
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                    </Row>

                    <Row className="g-2 mb-3">
                      <Col xs={7}>
                        <div className="mb-2">
                          <Label size="sm" className="fw-bold text-muted">
                            Unit of Measurement
                          </Label>
                          {unitOptions.length === 1 ? (
                            <div className="d-flex align-items-center border rounded p-1 bg-light">
                              <span className="text-muted small">
                                {unitOptions[0].label}
                              </span>
                            </div>
                          ) : (
                            <Input
                              bsSize="sm"
                              id={idx}
                              required
                              type="select"
                              name="unitOfMeasurement"
                              value={item.unitOfMeasurement || ""}
                              onChange={getValues}
                            >
                              {/* <option value="">Select Unit</option> */}
                              {unitOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Input>
                          )}
                        </div>
                      </Col>
                      {/* <Col xs={5}>
                        <div className="mb-2">
                          <Label size="sm" className="fw-bold text-muted">
                            Total
                          </Label>
                          <div className="border rounded px-2 py-1 bg-primary text-white text-center">
                            <span className="fw-bold">
                              {totalValue?.toFixed(2) || 0}
                            </span>
                          </div>
                        </div>
                      </Col> */}
                    </Row>

                    <div className="mb-2">
                      <Label size="sm" className="fw-bold text-muted">
                        Remarks
                      </Label>
                      <Input
                        id={idx}
                        type="textarea"
                        name="comments"
                        rows="2"
                        placeholder="Add remarks..."
                        value={item.comments || ""}
                        onChange={getValues}
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <Row className="mt-3 mb-3 d-none d-md-flex">
                  <Col className="text-primary text-capitalize" lg={2}>
                    <span>{item.slot}</span>
                  </Col>
                  <Col xs={2} md={2}>
                    <Input
                      bsSize="sm"
                      id={idx}
                      min={1}
                      style={{ height: "9px" }}
                      type="number"
                      name="unit"
                      value={item.unit || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 || e.target.value === "") {
                          getValues(e);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.which === 38 || e.which === 40) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Col>
                  <Col xs={1} md={1}>
                    <Input
                      bsSize="sm"
                      style={{ height: "9px" }}
                      id={idx}
                      type="number"
                      name="cost"
                      value={item.cost !== undefined ? item.cost : ""}
                      onChange={(e) => handleCostChange(e, idx, item)}
                      onKeyDown={(e) => {
                        if (e.which === 38 || e.which === 40) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {/* <div className="d-flex align-items-center">
                      <span className="text-muted">₹</span>
                      <p className="mb-0 ms-2 text-muted unit-cost-total">
                        {unitCostTotal || 0}
                      </p>
                    </div> */}
                  </Col>
                  {/* <Label size="sm" className="text-muted">
                    After Discount
                  </Label> */}
                  <Col xs={2} md={2}>
                    <Input
                      bsSize="sm"
                      type="number"
                      value={item.finalCost ?? item.cost}
                      disabled
                    />
                  </Col>
                  <Col xs={2} md={2}>
                    {unitOptions.length === 1 ? (
                      <div
                        className="d-flex align-items-center"
                        style={{ height: "27px" }}
                      >
                        <span className="text-muted">
                          {unitOptions[0].label}
                        </span>
                      </div>
                    ) : (
                      <Input
                        bsSize="sm"
                        id={idx}
                        required
                        type="select"
                        name="unitOfMeasurement"
                        value={item.unitOfMeasurement || ""}
                        onChange={getValues}
                      >
                        {/* <option value="">Select Unit</option> */}
                        {unitOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Input>
                    )}
                  </Col>

                  <Col md={2}>
                    <Row className="g-2">
                      <Col xs={6}>
                        <Input
                          bsSize="sm"
                          type="select"
                          value={item.discountType}
                          onChange={(e) =>
                            setInvoiceList((prev) => {
                              const list = [...prev];
                              list[idx] = {
                                ...list[idx],
                                discountType: e.target.value,
                                discountValue: 0,
                                itemDiscount: 0,
                                finalCost: list[idx].cost,
                                // afterDiscount: exactCost,
                              };
                              return list;
                            })
                          }
                        >
                          <option value="₹">₹</option>
                          <option value="%">%</option>
                        </Input>
                      </Col>

                      <Col xs={6}>
                        <Input
                          bsSize="sm"
                          type="number"
                          min={0}
                          max={item.discountType === "%" ? 100 : item.cost}
                          value={
                            item.discountValue === 0 ? "" : item.discountValue
                          }
                          onChange={(e) =>
                            handleDiscountChange(
                              idx,
                              // "discountValue",
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                    </Row>
                  </Col>
                  {/* 
                  <Col xs={3} md={1}>
                    <p className="total-cost me-5 text-center font-size-14 text-primary">
                      {totalValue?.toFixed(2) || 0}
                    </p>
                  </Col> */}
                  <Col xs={1}>
                    <Button
                      onClick={() => deleteForm(idx)}
                      color="danger"
                      size="sm"
                    >
                      <i className="ri-close-circle-line font-size-20"></i>
                    </Button>
                  </Col>
                  <Col xs={12}>
                    <Input
                      id={idx}
                      type="textarea"
                      name="comments"
                      rows="2"
                      placeholder="Remarks"
                      value={item.comments || ""}
                      onChange={getValues}
                    />
                  </Col>
                </Row>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

InvoiceTable.propTypes = {
  invoiceList: PropTypes.array,
  setInvoiceList: PropTypes.func,
  center: PropTypes.object,
};

export default InvoiceTable;
