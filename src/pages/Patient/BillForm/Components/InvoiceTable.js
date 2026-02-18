// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { Input, Button, Row, Col, Label } from "reactstrap";
// import { categoryUnitOptions } from "../../../../Components/constants/patient";

// const InvoiceTable = ({ invoiceList, setInvoiceList, center }) => {
//   // console.log("invoiceList", invoiceList);
//   const [cost, setCost] = useState(0);
//   const handleCostChange = (e, idx, item) => {
//     const value = e.target.value;

//     const updatedCenters = (item.centers || []).map((c) =>
//       String(c.center._id) === String(center._id)
//         ? { ...c, cost: value === "" ? "" : parseInt(value) }
//         : c,
//     );

//     const newInvoiceList = [...invoiceList];
//     newInvoiceList[idx] = {
//       ...item,
//       centers: updatedCenters,
//       cost: value === "" ? "" : Number(value),
//     };

//     setInvoiceList(newInvoiceList);
//   };

//   const getValues = (e) => {
//     const prop = e.target.name;
//     const value =
//       prop === "category" ? e.target.value.toLowerCase() : e.target.value;
//     const idx = e.target.id;

//     const newInvoiceList = [...invoiceList];
//     const item = newInvoiceList[idx];

//     if (
//       prop === "unitOfMeasurement" ||
//       prop === "discountUnit" ||
//       prop === "discount" ||
//       prop === "comments" ||
//       prop === "category"
//     ) {
//       if (prop === "category") {
//         const unitOptions = getUnitOptions(value);
//         newInvoiceList[idx] = {
//           ...item,
//           [prop]: value,
//           unitOfMeasurement:
//             unitOptions.length === 1 ? unitOptions[0].value : "",
//         };
//       }

//       else if (prop === "unitOfMeasurement") {
//         const matchingPriceObj = item.availablePrices?.find(
//           (p) => String(p.unit).toLowerCase() === String(value).toLowerCase(),
//         );

//         newInvoiceList[idx] = {
//           ...item,
//           [prop]: value,
//           cost: matchingPriceObj ? matchingPriceObj.price : item.cost,
//         };
//       }

//       else {
//         newInvoiceList[idx] = {
//           ...item,
//           [prop]: value,
//         };
//       }
//     } else if (prop === "unit") {
//       newInvoiceList[idx] = {
//         ...item,
//         [prop]: parseInt(value),
//       };
//     }

//     setInvoiceList(newInvoiceList);
//   };

//   const deleteForm = (idx) => {
//     const list = [...invoiceList];
//     list.splice(idx, 1);
//     setInvoiceList(list);
//   };

//   const getUnitOptions = (category) => {
//     return (
//       categoryUnitOptions[category?.toLowerCase()] ||
//       categoryUnitOptions.default
//     );
//   };

//   // console.log("center", center);
//   // console.log("invoiceList", invoiceList);

//   return (
//     <React.Fragment>
//       <div className="w-100">
//         <div className="pb-3 pt-3 border-bottom d-none d-md-block">
//           <Row>
//             <Col className="font-semi-bold treatment-head" md={2}>
//               Treatments
//             </Col>
//             <Col className="font-semi-bold unit-head" md={2}>
//               Quantity
//             </Col>
//             <Col className="font-semi-bold cost-head" md={2}>
//               Cost
//             </Col>
//             <Col className="font-semi-bold cost-head" md={2}>
//               Unit of Measurement
//             </Col>
//             <Col className="font-semi-bold total-head" md={3}>
//               Total
//             </Col>
//           </Row>
//         </div>
//         <div>
//           {(invoiceList || []).map((item, idx) => {
//             // const exactCost = item?.centers?.find(
//             //   (c) => String(c?.center?._id) === String(center?._id),
//             // );

//             // const cost = exactCost?.cost || 0;

//             const totalValue =
//               item.unit && item.cost
//                 ? parseInt(item.unit) * parseInt(item.cost)
//                 : 0;
//             const unitCostTotal = totalValue;
//             const unitOptions = getUnitOptions(item.category);
//             if (
//               item.category &&
//               unitOptions.length === 1 &&
//               !item.unitOfMeasurement
//             ) {
//               const newList = [...invoiceList];
//               newList[idx] = {
//                 ...item,
//                 unitOfMeasurement: unitOptions[0].value,
//               };
//               setInvoiceList(newList);
//             }

//             return (
//               <React.Fragment key={item.id + item.slot}>
//                 <div className="d-md-none card shadow-sm mb-3 mt-2">
//                   <div className="card-body">
//                     <div className="mb-3">
//                       <div className="d-flex justify-content-between align-items-center">
//                         <span className="text-primary text-capitalize fw-bold">
//                           {item.slot}
//                         </span>
//                         <Button
//                           onClick={() => deleteForm(idx)}
//                           color="danger"
//                           size="sm"
//                           className="ms-2"
//                         >
//                           <i className="ri-close-circle-line font-size-16"></i>
//                         </Button>
//                       </div>
//                     </div>

//                     <Row className="g-2 mb-3">
//                       <Col xs={6}>
//                         <div className="mb-2">
//                           <Label size="sm" className="fw-bold text-muted">
//                             Quantity
//                           </Label>
//                           <Input
//                             bsSize="sm"
//                             id={idx}
//                             slot={item}
//                             min={1}
//                             type="number"
//                             name="unit"
//                             value={item.unit || ""}
//                             onChange={(e) => {
//                               const value = Number(e.target.value);
//                               if (value >= 0 || e.target.value === "") {
//                                 getValues(e);
//                               }
//                             }}
//                             onKeyDown={(e) => {
//                               if (e.which === 38 || e.which === 40) {
//                                 e.preventDefault();
//                               }
//                             }}
//                           />
//                         </div>
//                       </Col>
//                       <Col xs={6}>
//                         <div className="mb-2">
//                           <Label size="sm" className="fw-bold text-muted">
//                             Cost
//                           </Label>
//                           <Input
//                             bsSize="sm"
//                             id={idx}
//                             type="number"
//                             name="cost"
//                             min={1}
//                             value={item.cost || ""}
//                             onChange={(e) => {
//                               const value = Number(e.target.value);
//                               if (value >= 0 || e.target.value === "") {
//                                 handleCostChange(e, idx, item);
//                               }
//                             }}
//                             onKeyDown={(e) => {
//                               if (e.which === 38 || e.which === 40) {
//                                 e.preventDefault();
//                               }
//                             }}
//                           />
//                         </div>
//                       </Col>
//                     </Row>

//                     <Row className="g-2 mb-3">
//                       <Col xs={7}>
//                         <div className="mb-2">
//                           <Label size="sm" className="fw-bold text-muted">
//                             Unit of Measurement
//                           </Label>
//                           {unitOptions.length === 1 ? (
//                             <div className="d-flex align-items-center border rounded p-1 bg-light">
//                               <span className="text-muted small">
//                                 {unitOptions[0].label}
//                               </span>
//                             </div>
//                           ) : (
//                             <Input
//                               bsSize="sm"
//                               id={idx}
//                               required
//                               type="select"
//                               name="unitOfMeasurement"
//                               value={item.unitOfMeasurement || ""}
//                               onChange={getValues}
//                             >
//                               <option value="">Select Unit</option>
//                               {unitOptions.map((option) => (
//                                 <option key={option.value} value={option.value}>
//                                   {option.label}
//                                 </option>
//                               ))}
//                             </Input>
//                           )}
//                         </div>
//                       </Col>
//                       <Col xs={5}>
//                         <div className="mb-2">
//                           <Label size="sm" className="fw-bold text-muted">
//                             Total
//                           </Label>
//                           <div className="border rounded px-2 py-1 bg-primary text-white text-center">
//                             <span className="fw-bold">
//                               {totalValue?.toFixed(2) || 0}
//                             </span>
//                           </div>
//                         </div>
//                       </Col>
//                     </Row>

//                     <div className="mb-2">
//                       <Label size="sm" className="fw-bold text-muted">
//                         Remarks
//                       </Label>
//                       <Input
//                         id={idx}
//                         type="textarea"
//                         name="comments"
//                         rows="2"
//                         placeholder="Add remarks..."
//                         value={item.comments || ""}
//                         onChange={getValues}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Desktop Layout */}
//                 <Row className="mt-3 mb-3 d-none d-md-flex">
//                   <Col className="text-primary text-capitalize" lg={2}>
//                     <span>{item.slot}</span>
//                   </Col>
//                   <Col xs={2} md={2}>
//                     <Input
//                       bsSize="sm"
//                       id={idx}
//                       slot={item}
//                       min={1}
//                       style={{ height: "9px" }}
//                       type="number"
//                       name="unit"
//                       size={"1"}
//                       value={item.unit || ""}
//                       onChange={(e) => {
//                         const value = Number(e.target.value);
//                         if (value >= 0 || e.target.value === "") {
//                           getValues(e);
//                         }
//                       }}
//                       onKeyDown={(e) => {
//                         if (e.which === 38 || e.which === 40) {
//                           e.preventDefault();
//                         }
//                       }}
//                     />
//                   </Col>
//                   <Col xs={2} md={2}>
//                     <Input
//                       bsSize="sm"
//                       style={{ height: "9px" }}
//                       id={idx}
//                       slot={item}
//                       type="number"
//                       name="cost"
//                       min={1}
//                       size={"1"}
//                       value={item.cost || ""}
//                       onChange={(e) => {
//                         const value = Number(e.target.value);
//                         if (value >= 0 || e.target.value === "") {
//                           handleCostChange(e, idx, item);
//                         }
//                       }}
//                       onKeyDown={(e) => {
//                         if (e.which === 38 || e.which === 40) {
//                           e.preventDefault();
//                         }
//                       }}
//                     />
//                     <div className="d-flex align-items-center">
//                       <span className="text-muted">₹</span>
//                       <p className="mb-0 ms-2 text-muted unit-cost-total">
//                         {unitCostTotal || 0}
//                       </p>
//                     </div>
//                   </Col>
//                   <Col xs={2} md={2}>
//                     {unitOptions.length === 1 ? (
//                       <div
//                         className="d-flex align-items-center"
//                         style={{ height: "27px" }}
//                       >
//                         <span className="text-muted">
//                           {unitOptions[0].label}
//                         </span>
//                       </div>
//                     ) : (
//                       <Input
//                         bsSize="sm"
//                         id={idx}
//                         required
//                         size={"1"}
//                         type="select"
//                         name="unitOfMeasurement"
//                         value={item.unitOfMeasurement || ""}
//                         onChange={getValues}
//                       >
//                         <option value="">Select Unit</option>
//                         {unitOptions.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </Input>
//                     )}
//                   </Col>
//                   <Col xs={3} md={1}>
//                     <p className="total-cost me-5 text-center font-size-14 text-primary">
//                       {totalValue?.toFixed(2) || 0}
//                     </p>
//                   </Col>
//                   <Col xs={1}>
//                     <Button
//                       onClick={() => deleteForm(idx)}
//                       color="danger"
//                       size="sm"
//                     >
//                       <i
//                         className="ri-close-circle-line font-size-20"
//                         style={{ cursor: "pointer" }}
//                       ></i>
//                     </Button>
//                   </Col>
//                   <Col xs={12}>
//                     <Input
//                       id={idx}
//                       type="textarea"
//                       name="comments"
//                       aria-rowspan={6}
//                       rows="2"
//                       placeholder="Remarks"
//                       value={item.comments || ""}
//                       onChange={getValues}
//                     />
//                   </Col>
//                 </Row>
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>
//     </React.Fragment>
//   );
// };

// InvoiceTable.propTypes = {
//   invoiceList: PropTypes.array,
//   setInvoiceList: PropTypes.func,
// };

// export default InvoiceTable;

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Input, Button, Row, Col, Label } from "reactstrap";
import { categoryUnitOptions } from "../../../../Components/constants/patient";
import { clearFilters } from "../../../../store/features/report/dbLogSlice";

const isRowEmpty = (item) => {
  return (
    !item.category &&
    !item.slot &&
    (!item.cost || Number(item.cost) === 0) &&
    !item.unitOfMeasurement
  );
};

const InvoiceTable = ({
  invoiceList,
  setInvoiceList,
  center,
  isEdit,
  type,
}) => {
  const [cost, setCost] = useState(0);
  // const [discount, setDiscount] = useState("");
  // const [type, setType] = useState("₹");

  const isDraft = type === "draft";
  console.log("isEdit", isEdit);
  console.log("isDraft", isDraft);

  const calculateFinalTotal = (unit, cost, discount) => {
    const total = Number(unit || 0) * Number(cost || 0);

    if (!total) return 0;
    if (!discount) return total;

    const final = total - Number(discount);

    return final < 0 ? 0 : final;
  };

  const handleCostChange = (e, idx, item) => {
    const value = e.target.value;
    const newCost = value === "" ? "" : Number(value);

    const newInvoiceList = [...invoiceList];
    const updatedItem = { ...item };

    const updatedCenters = (item.centers || []).map((c) =>
      String(c.center._id) === String(center._id) ? { ...c, cost: newCost } : c,
    );

    updatedItem.cost = newCost;
    updatedItem.centers = updatedCenters;

    updatedItem.discount = "";
    updatedItem.discountValue = "";

    const newTotal = Number(updatedItem.unit || 0) * Number(newCost || 0);

    // if (updatedItem.discountType === "%" && updatedItem.discountValue) {
    //   const total = Number(updatedItem.unit || 0) * Number(newCost || 0);
    //   updatedItem.discount = (total * Number(updatedItem.discountValue)) / 100;
    // }

    updatedItem.afterDiscount = calculateFinalTotal(
      updatedItem.unit,
      updatedItem.cost,
      updatedItem.discount,
    );

    newInvoiceList[idx] = updatedItem;
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

      console.log("item", item);

      const matchingPriceObj = (item.availablePrices || []).find(
        (p) => String(p.unit).toLowerCase() === String(value).toLowerCase(),
      );

      if (matchingPriceObj && !isEdit) {
        const newPrice = Number(matchingPriceObj.price);
        item.cost = newPrice;

        if (item.centers) {
          item.centers = item.centers.map((c) =>
            String(c.center?._id || c.center) === String(center._id)
              ? { ...c, cost: newPrice }
              : c,
          );
        }
        item.discount = "";
        item.discountValue = "";
      }
    } else if (prop === "category") {
      const unitOptions = getUnitOptions(value);
      item.category = value;
      item.unitOfMeasurement =
        unitOptions.length === 1 ? unitOptions[0].value : "";
    } else if (prop === "unit") {
      item.unit = value;
      item.discount = "";
      item.discountValue = "";
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

  // console.log("getUnitOptions", getUnitOptions());
  console.log("invoiceList", invoiceList);

  // useEffect(() => {
  //   if (isEdit) return;

  //   if (!invoiceList || invoiceList.length === 0) return;

  //   let hasChanged = false;

  //   const updatedList = invoiceList.map((item) => {
  //     if (!item.availablePrices || item.availablePrices.length === 0)
  //       return item;

  //     const matchingPriceObj = item.availablePrices.find(
  //       (p) =>
  //         String(p.unit).toLowerCase() ===
  //         String(item.unitOfMeasurement).toLowerCase(),
  //     );

  //     if (
  //       matchingPriceObj &&
  //       Number(item.cost) !== Number(matchingPriceObj.price)
  //     ) {
  //       hasChanged = true;
  //       return {
  //         ...item,
  //         cost: Number(matchingPriceObj.price),
  //       };
  //     }

  //     return item;
  //   });

  //   if (hasChanged) {
  //     setInvoiceList(updatedList);
  //   }
  // }, [invoiceList, isEdit]);

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="pb-3 pt-3 border-bottom d-none d-md-block">
          <Row>
            <Col className="font-semi-bold treatment-head" md={2}>
              Treatments
            </Col>
            <Col className="font-semi-bold unit-head" md={1}>
              Quantity
            </Col>
            <Col className="font-semi-bold cost-head" md={2}>
              Cost
            </Col>
            <Col className="font-semi-bold cost-head" md={2}>
              Unit of Measurement
            </Col>
            <Col className="font-semi-bold cost-head" md={2}>
              Discount
            </Col>
            <Col className="font-semi-bold total-head" md={2}>
              Net Total
            </Col>
            {/* <Col className="font-semi-bold total-head" md={2}>
              Total
            </Col> */}
          </Row>
        </div>
        <div>
          {(invoiceList || [])
            .filter((item) => !isRowEmpty(item))
            .map((item, idx) => {
              const totalValue =
                item.unit && item.cost
                  ? parseInt(item.unit) * parseInt(item.cost)
                  : 0;

              // let finalTotal = totalValue;

              // if (discount) {
              //   if (type === "₹") {
              //     finalTotal = totalValue - Number(discount);
              //   } else {
              //     finalTotal = totalValue - (totalValue * Number(discount)) / 100;
              //   }
              // }

              const unitCostTotal = totalValue;

              const unitOptions =
                item?.availablePrices?.length > 0
                  ? item?.availablePrices.map((u) => ({
                      label: u?.unit,
                      value: u.unit,
                      price: u.price,
                    }))
                  : getUnitOptions(item.category);
              // const unitOptions = getUnitOptions(item.category);
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
                        <Col xs={6}>
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
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </Input>
                            )}
                          </div>
                        </Col>

                        <Col xs={12}>
                          <div className="mb-2">
                            <Label size="sm" className="fw-bold text-muted">
                              Discount
                            </Label>

                            <Row className="g-0">
                              <Col xs="8">
                                <Input
                                  bsSize="sm"
                                  type="number"
                                  value={
                                    item.discountType === "%"
                                      ? item.discount && item.unit && item.cost
                                        ? Math.round(
                                            (Number(item.discount) /
                                              (Number(item.unit) *
                                                Number(item.cost))) *
                                              100,
                                          )
                                        : ""
                                      : item.discount || ""
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const newInvoiceList = [...invoiceList];
                                    const updatedItem = { ...item };
                                    const total =
                                      Number(updatedItem.unit || 0) *
                                      Number(updatedItem.cost || 0);

                                    updatedItem.discount = val;
                                    updatedItem.discountValue = val;

                                    if (updatedItem.discountType === "%") {
                                      updatedItem.discount =
                                        (total * Number(val || 0)) / 100;
                                    } else {
                                      updatedItem.discount = val;
                                    }

                                    updatedItem.afterDiscount =
                                      calculateFinalTotal(
                                        updatedItem.unit,
                                        updatedItem.cost,
                                        updatedItem.discount,
                                        updatedItem.discountType,
                                      );

                                    newInvoiceList[idx] = updatedItem;
                                    setInvoiceList(newInvoiceList);
                                  }}
                                />
                              </Col>

                              <Col xs="4">
                                <Input
                                  bsSize="sm"
                                  type="select"
                                  value={item.discountType || "₹"}
                                  onChange={(e) => {
                                    const newInvoiceList = [...invoiceList];
                                    const updatedItem = { ...item };

                                    updatedItem.discountType = e.target.value;

                                    updatedItem.discount = "";

                                    updatedItem.afterDiscount =
                                      calculateFinalTotal(
                                        updatedItem.unit,
                                        updatedItem.cost,
                                        updatedItem.discount,
                                        updatedItem.discountType,
                                      );

                                    newInvoiceList[idx] = updatedItem;
                                    setInvoiceList(newInvoiceList);
                                  }}
                                >
                                  <option value="₹">₹</option>
                                  <option value="%">%</option>
                                </Input>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                        {/* 
                      <Col xs={5}>
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
                        <Col xs={2} md={2}>
                          <p className="total-cost text-success font-size-14 text-center">
                            {/* {item.afterDiscount?.toFixed(2) ||
                              (item.unit && item.cost
                                ? (item.unit * item.cost).toFixed(2)
                                : "0.00")} */}
                            {(() => {
                              const total =
                                Number(item.unit || 0) * Number(item.cost || 0);

                              return calculateFinalTotal(
                                item.unit,
                                item.cost,
                                item.discount,
                                item.discountType,
                              ).toFixed(2);

                              // return item.afterDiscount
                              //   ? Number(item.afterDiscount).toFixed(2)
                              //   : total.toFixed(2);
                            })()}
                          </p>
                        </Col>
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
                    <Col className="text-primary text-capitalize" lg={2} md={2}>
                      <span>{item.slot}</span>
                    </Col>
                    <Col xs={2} md={1}>
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
                    <Col xs={2} md={2}>
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

                    <Col xs={2} md={2}>
                      <div className="d-flex align-items-stretch">
                        <Input
                          bsSize="sm"
                          type="number"
                          value={
                            item.discountType === "%"
                              ? item.discount && item.unit && item.cost
                                ? Math.round(
                                    (Number(item.discount) /
                                      (Number(item.unit) * Number(item.cost))) *
                                      100,
                                  )
                                : ""
                              : item.discount || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const newInvoiceList = [...invoiceList];
                            const updatedItem = { ...item };

                            const total =
                              Number(updatedItem.unit || 0) *
                              Number(updatedItem.cost || 0);

                            if (!total) {
                              updatedItem.discount = "";
                            } else if (updatedItem.discountType === "%") {
                              updatedItem.discount =
                                val === "" ? "" : (total * Number(val)) / 100;
                            } else {
                              updatedItem.discount =
                                val === "" ? "" : Number(val);
                            }

                            updatedItem.discountValue = val;

                            if (updatedItem.discountType === "%") {
                              updatedItem.discount =
                                (total * Number(val || 0)) / 100;
                            } else {
                              updatedItem.discount = val;
                            }

                            updatedItem.afterDiscount = calculateFinalTotal(
                              updatedItem.unit,
                              updatedItem.cost,
                              updatedItem.discount,
                            );

                            newInvoiceList[idx] = updatedItem;
                            setInvoiceList(newInvoiceList);
                          }}
                        />

                        <Input
                          bsSize="sm"
                          type="select"
                          value={item.discountType || "₹"}
                          onChange={(e) => {
                            const newInvoiceList = [...invoiceList];
                            const updatedItem = { ...item };

                            updatedItem.discountType = e.target.value;

                            updatedItem.discount = "";

                            updatedItem.afterDiscount = calculateFinalTotal(
                              updatedItem.unit,
                              updatedItem.cost,
                              updatedItem.discount,
                              updatedItem.discountType,
                            );

                            newInvoiceList[idx] = updatedItem;
                            setInvoiceList(newInvoiceList);
                          }}
                        >
                          <option value="₹">₹</option>
                          <option value="%">%</option>
                        </Input>
                      </div>
                    </Col>

                    {/* <Col xs={3} md={1}>
                    <p className="total-cost me-5 text-center font-size-14 text-primary">
                      {totalValue?.toFixed(2) || 0}
                    </p>
                  </Col> */}

                    <Col xs={2} md={2}>
                      <p className="total-cost text-success font-size-14 text-left">
                        {/* {item.afterDiscount?.toFixed(2) ||
                          (item.unit && item.cost
                            ? (item.unit * item.cost).toFixed(2)
                            : "0.00")} */}
                        {(() => {
                          const total =
                            Number(item.unit || 0) * Number(item.cost || 0);

                          return calculateFinalTotal(
                            item.unit,
                            item.cost,
                            item.discount,
                            item.discountType,
                          ).toFixed(2);

                          // return item.afterDiscount
                          //   ? Number(item.afterDiscount).toFixed(2)
                          //   : total.toFixed(2);
                        })()}
                      </p>
                    </Col>

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
