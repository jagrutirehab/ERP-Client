import React from "react";
import PropTypes from "prop-types";
import { Input, Button, Row, Col } from "reactstrap";
import { categoryUnitOptions } from "../../../../Components/constants/patient";

const InvoiceTable = ({ invoiceList, setInvoiceList }) => {
  const getValues = (e) => {
    const prop = e.target.name;
    const value =
      prop === "category" ? e.target.value.toLowerCase() : e.target.value;
    const idx = e.target.id;

    const newInvoiceList = [...invoiceList];
    const item = newInvoiceList[idx];

    if (
      prop === "unitOfMeasurement" ||
      prop === "discountUnit" ||
      prop === "discount" ||
      prop === "comments" ||
      prop === "category"
    ) {
      if (prop === "category") {
        const unitOptions = getUnitOptions(value);
        newInvoiceList[idx] = {
          ...item,
          [prop]: value,
          unitOfMeasurement:
            unitOptions.length === 1 ? unitOptions[0].value : "",
        };
      } else {
        newInvoiceList[idx] = {
          ...item,
          [prop]: value,
        };
      }
    } else if (prop === "unit" || prop === "cost") {
      newInvoiceList[idx] = {
        ...item,
        [prop]: parseInt(value),
      };
    }

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

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="pb-3 pt-3 border-bottom">
          <Row>
            <Col className="font-semi-bold treatment-head" xs={3} md={2}>
              Treatments
            </Col>
            <Col className="font-semi-bold unit-head" xs={2} md={2}>
              Quantity
            </Col>
            <Col className="font-semi-bold cost-head" xs={2} md={2}>
              Cost
            </Col>
            <Col className="font-semi-bold cost-head" xs={2} md={2}>
              Unit of Measurement
            </Col>
            <Col className="font-semi-bold total-head" xs={3} md={3}>
              Total
            </Col>
          </Row>
        </div>
        <div>
          {(invoiceList || []).map((item, idx) => {
            const totalValue =
              item.unit && item.cost
                ? parseInt(item.unit) * parseInt(item.cost)
                : 0;
            const unitCostTotal = totalValue;
            const unitOptions = getUnitOptions(item.category);
            if (
              item.category &&
              unitOptions.length === 1 &&
              !item.unitOfMeasurement
            ) {
              const newList = [...invoiceList];
              newList[idx] = {
                ...item,
                unitOfMeasurement: unitOptions[0].value,
              };
              setInvoiceList(newList);
            }

            return (
              <React.Fragment key={item.id + item.slot}>
                <Row className="mt-3 mb-3">
                  <Col
                    className="text-primary text-capitalize mb-3 mb-lg-0"
                    xs={12}
                    md={12}
                    lg={2}
                  >
                    <span>{item.slot}</span>
                  </Col>
                  <Col xs={2} md={2}>
                    <Input
                      bsSize="sm"
                      id={idx}
                      slot={item}
                      style={{ height: "9px" }}
                      type="number"
                      name="unit"
                      size={"1"}
                      value={item.unit || ""}
                      onChange={getValues}
                      onKeyDown={(e) => {
                        if (e.which === 38 || e.which === 40) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Col>
                  <Col xs={2} md={2}>
                    <Input
                      bsSize="sm"
                      style={{ height: "9px" }}
                      id={idx}
                      slot={item}
                      type="number"
                      name="cost"
                      size={"1"}
                      value={item.cost || ""}
                      onChange={getValues}
                      onKeyDown={(e) => {
                        if (e.which === 38 || e.which === 40) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <div className="d-flex align-items-center">
                      <span className="text-muted">₹</span>
                      <p className="mb-0 ms-2 text-muted unit-cost-total">
                        {unitCostTotal || 0}
                      </p>
                    </div>
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
                        size={"1"}
                        type="select"
                        name="unitOfMeasurement"
                        value={item.unitOfMeasurement || ""}
                        onChange={getValues}
                      >
                        <option value="">Select Unit</option>
                        {unitOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Input>
                    )}
                  </Col>
                  <Col xs={3} md={1}>
                    <p className="total-cost me-5 text-center font-size-14 text-primary">
                      {totalValue?.toFixed(2) || 0}
                    </p>
                  </Col>
                  <Col xs={1}>
                    <Button
                      onClick={() => deleteForm(idx)}
                      color="danger"
                      size="sm"
                    >
                      <i
                        className="ri-close-circle-line font-size-20"
                        style={{ cursor: "pointer" }}
                      ></i>
                    </Button>
                  </Col>
                  <Col xs={12}>
                    <Input
                      id={idx}
                      type="textarea"
                      name="comments"
                      aria-rowspan={6}
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
};

export default InvoiceTable;
