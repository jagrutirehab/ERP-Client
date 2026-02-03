import React, { useState } from "react";
import { Col, Button, Input, FormFeedback, Form, Row } from "reactstrap";
import PropTypes from "prop-types";

import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { useFormik } from "formik";
import { updateBillItem } from "../../../../../store/actions";
import Select from "react-select";
import { UncontrolledTooltip } from "reactstrap";
import ViewAndEditCenterCost from "./ViewAndEditCenterCost";

const categories = [
  "2d echo charges",
  "ac charges",
  "airbed charges",
  "ambulance charges",
  "attendant/care taker charges",
  "bio medical waste charges",
  "bsl charges",
  "ct scan",
  "diaper charges",
  "medical consumables",
  "discharge medicines",
  "doctor consultation charges",
  "doppler charges",
  "dressing charges",
  "drug test",
  "ecg charges",
  "ect charges",
  "emergency charges",
  "emergency hospital charges",
  "enema",
  "extra food charges",
  "hospital charges",
  "injectables",
  "mrd charges",
  "mri charges",
  "nebulisation charges",
  "nursing charges",
  "opd consultation charges",
  "other charges",
  "medicines",
  "physiotherapy charges",
  "procedure charges",
  "psychological counselling",
  "psychological test",
  "refund",
  "registration charges",
  "room charges",
  "sleep study charges",
  "travel expenses",
  "upt charges",
  "usg charges",
  "x-ray charges",
];

const EditBillItem = ({ item, onCancel }) => {
  const dispatch = useDispatch();
  const [isEditCenterOpen, setIsEditCenterOpen] = useState(false);

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      proId: item?._id || "",
      name: item?.name || "",
      unit: item?.unit || "",
      category: item?.category || "",
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Item Name"),
      category: Yup.string().required("Category is required"),
    }),

    onSubmit: (values) => {
      dispatch(updateBillItem(values));
      onCancel();
    },
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
      }}
    >
      <Row className="align-items-center g-2">
        {/* NAME */}
        <Col md={2}>
          <Input
            name="name"
            bsSize="sm"
            value={validation.values.name}
            onChange={validation.handleChange}
            invalid={validation.touched.name && !!validation.errors.name}
          />
          <FormFeedback>{validation.errors.name}</FormFeedback>
        </Col>

        {/* UNIT */}
        <Col md={2}>
          <Input
            name="unit"
            bsSize="sm"
            value={validation.values.unit}
            onChange={validation.handleChange}
          />
        </Col>

        {/* CATEGORY */}
        <Col md={3}>
          <Select
            options={categories.map((cat) => ({
              label: cat,
              value: cat,
            }))}
            value={
              validation.values.category
                ? {
                    label: validation.values.category,
                    value: validation.values.category,
                  }
                : null
            }
            onChange={(selected) =>
              validation.setFieldValue("category", selected?.value || "")
            }
            onBlur={() => validation.setFieldTouched("category", true)} // ✅ important
            placeholder="Select Category"
            isClearable
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "32px",
                fontSize: "13px",
                borderColor:
                  validation.touched.category && validation.errors.category
                    ? "#dc3545"
                    : base.borderColor,
              }),
            }}
          />

          {/* Error message */}
          {validation.touched.category && validation.errors.category && (
            <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
              {validation.errors.category}
            </div>
          )}
        </Col>

        {/* ACTIONS */}
        <Col md={3} className="d-flex justify-content-center gap-2">
          {/* SAVE */}
          <Button id="saveBtn" type="submit" size="sm" color="success">
            <i className="ri-check-line"></i>
          </Button>
          <UncontrolledTooltip placement="top" target="saveBtn">
            Save Changes
          </UncontrolledTooltip>

          {/* EDIT */}
          <Button
            id="editCentersBtn"
            type="button"
            size="sm"
            color="primary"
            outline
            onClick={() => setIsEditCenterOpen(true)}
          >
            <i className="ri-edit-line"></i>
          </Button>

          <UncontrolledTooltip placement="top" target="editCentersBtn">
            Edit Centers
          </UncontrolledTooltip>

          <ViewAndEditCenterCost
            isOpen={isEditCenterOpen}
            toggle={() => setIsEditCenterOpen(false)}
            data={item}
          />

          {/* CANCEL */}
          <Button
            id="cancelBtn"
            type="button"
            size="sm"
            color="danger"
            outline
            onClick={onCancel}
          >
            <i className="ri-close-circle-line"></i>
          </Button>
          <UncontrolledTooltip placement="top" target="cancelBtn">
            Cancel
          </UncontrolledTooltip>
        </Col>
      </Row>
    </Form>
  );
};

export default EditBillItem;

// import React from "react";
// import {
//   Col,
//   Button,
//   Input,
//   FormFeedback,
//   Form,
//   Row,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Label,
// } from "reactstrap";
// import PropTypes from "prop-types";
// import { useDispatch, useSelector } from "react-redux";
// import * as Yup from "yup";
// import { useFormik } from "formik";
// import { updateBillItem } from "../../../../../store/actions";

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

// const EditBillItemModal = ({ isOpen, toggle, updateItem }) => {
//   const dispatch = useDispatch();
//   const centers = useSelector((state) => state.Center.data);
//   const userCenters = useSelector((state) => state.User?.centerAccess);

//   const data = updateItem?.formData;
//   console.log("data", data);

//   const validation = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       id: data?._id || "",
//       name: data?.name || "",
//       unit: data?.unit || "",
//       cost: data?.cost || "",
//       category: data?.category || "",
//       centers: data?.center || [],
//     },
//     validationSchema: Yup.object({
//       name: Yup.string().required("Item name is required"),
//       centers: Yup.array().min(1, "At least one center is required"),
//       cost: Yup.string()
//         // .required("Cost is required")
//         .matches(/^\d+$/, "Only numbers allowed, commas not allowed"),
//       unit: Yup.string().matches(/^\d*$/, "Unit must contain only numbers"),
//     }),
//     onSubmit: (values) => {
//       dispatch(
//         updateBillItem({
//           ...values,
//           centerIds: userCenters,
//         }),
//       );
//       toggle();
//     },
//   });

//   const allCenterIds = (centers || []).map((c) => c._id);
//   const isAllSelected =
//     validation.values.centers.length === allCenterIds.length &&
//     allCenterIds.length > 0;

//   return (
//     <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
//       <ModalHeader toggle={toggle}>Edit Item</ModalHeader>
//       <ModalBody>
//         <Form
//           onSubmit={(e) => {
//             e.preventDefault();
//             validation.handleSubmit();
//           }}
//         >
//           <Row>
//             {/* Centers */}
//             <Col xs={12} className="mb-3">
//               <Label>Centers</Label>
//               <div className="d-flex flex-wrap gap-3">
//                 <Button
//                   size="sm"
//                   color={isAllSelected ? "danger" : "primary"}
//                   outline
//                   onClick={() => {
//                     validation.setFieldValue(
//                       "centers",
//                       isAllSelected ? [] : allCenterIds,
//                     );
//                   }}
//                 >
//                   {isAllSelected ? "Unselect All" : "Select All"}
//                 </Button>

//                 {(centers || []).map((cen) => (
//                   <div key={cen._id}>
//                     <Input
//                       type="checkbox"
//                       value={cen._id}
//                       name="centers"
//                       checked={validation.values.centers.includes(cen._id)}
//                       onChange={validation.handleChange}
//                     />
//                     <Label className="ms-1">{cen.title}</Label>
//                   </div>
//                 ))}
//               </div>
//               {validation.errors.centers && (
//                 <FormFeedback className="d-block">
//                   {validation.errors.centers}
//                 </FormFeedback>
//               )}
//             </Col>

//             {/* Name */}
//             <Col md={3} className="mb-3">
//               <Input
//                 name="name"
//                 placeholder="Name"
//                 value={validation.values.name}
//                 onChange={validation.handleChange}
//                 invalid={!!validation.errors.name}
//               />
//               <FormFeedback>{validation.errors.name}</FormFeedback>
//             </Col>

//             {/* Unit */}
//             <Col md={2} className="mb-3">
//               <Input
//                 name="unit"
//                 placeholder="Unit"
//                 value={validation.values.unit}
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/[^0-9]/g, "");
//                   validation.setFieldValue("unit", value);
//                 }}
//               />
//             </Col>

//             {/* Cost */}
//             <Col md={2} className="mb-3">
//               <Input
//                 name="cost"
//                 placeholder="Cost"
//                 value={validation.values.cost}
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/[^0-9]/g, "");
//                   validation.setFieldValue("cost", value);
//                 }}
//                 invalid={!!validation.errors.cost}
//               />
//               <FormFeedback>{validation.errors.cost}</FormFeedback>
//             </Col>

//             {/* Category */}
//             <Col md={3} className="mb-3">
//               <Input
//                 type="select"
//                 name="category"
//                 value={validation.values.category}
//                 onChange={validation.handleChange}
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </Input>
//             </Col>

//             {/* Actions */}
//             <Col md={12} className="d-flex justify-content-end gap-2">
//               <Button outline color="secondary" onClick={toggle}>
//                 Cancel
//               </Button>
//               <Button color="success" type="submit">
//                 Update
//               </Button>
//             </Col>
//           </Row>
//         </Form>
//       </ModalBody>
//     </Modal>
//   );
// };

// EditBillItemModal.propTypes = {
//   isOpen: PropTypes.bool,
//   toggle: PropTypes.func,
//   updateItem: PropTypes.object,
// };

// export default EditBillItemModal;
