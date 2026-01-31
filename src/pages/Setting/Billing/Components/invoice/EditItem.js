// import React from "react";
// import { Col, Button, Input, FormFeedback, Form, Row } from "reactstrap";
// import PropTypes from "prop-types";

// //redux
// import { useDispatch } from "react-redux";
// // import { updateItem as updMedicine } from "../../../store/actions";

// // Formik Validation
// import * as Yup from "yup";
// import { useFormik } from "formik";
// import { updateBillItem } from "../../../../../store/actions";
// // import {
// //   medicineTypes,
// //   medicineUnits,
// // } from "../../../Components/constants/medicine";

// const EditBillItem = ({ updateItem, setUpdateItem }) => {
//   const dispatch = useDispatch();
//   const data = updateItem?.formData;

//   const validation = useFormik({
//     // enableReinitialize : use this flag when initial values needs to be changed
//     enableReinitialize: true,

//     initialValues: {
//       id: data?._id || "",
//       name: data.name || "",
//       unit: data.unit || "",
//       cost: data.cost || "",
//     },
//     validationSchema: Yup.object({
//       name: Yup.string().required("Please Enter Item Name"),
//     }),
//     onSubmit: (values) => {
//       dispatch(updateBillItem(values));
//       setUpdateItem({
//         isForm: false,
//         formIndex: undefined,
//         formData: undefined,
//       });
//       validation.resetForm();
//     },
//   });

//   return (
//     <React.Fragment>
//       <Form
//         onSubmit={(e) => {
//           e.preventDefault();
//           validation.handleSubmit();
//           return false;
//         }}
//         className="needs-validation"
//         action="#"
//       >
//         <Row className="align-items-center">
//           <Col className="mb-3 pb-2 border-bottom" xs={2} md={4}>
//             <Input
//               onChange={validation.handleChange}
//               name="name"
//               onBlur={validation.handleBlur}
//               value={validation.values.name || ""}
//               bsSize={"sm"}
//             />
//             {validation.touched.name && validation.errors.name ? (
//               <FormFeedback type="invalid">
//                 <div className="font-size-14">{validation.errors.name}</div>
//               </FormFeedback>
//             ) : null}
//           </Col>
//           <Col className="mb-3 pb-2 border-bottom" xs={2} md={4}>
//             <Input
//               onChange={validation.handleChange}
//               name="unit"
//               onBlur={validation.handleBlur}
//               value={validation.values.unit || ""}
//               bsSize={"sm"}
//             />
//           </Col>
//           <Col className="mb-3 pb-2 border-bottom" xs={2} md={3}>
//             <Input
//               onChange={validation.handleChange}
//               name="cost"
//               onBlur={validation.handleBlur}
//               value={validation.values.cost || ""}
//               bsSize={"sm"}
//             />
//           </Col>
//           <Col
//             className="mb-3 pb-2 border-bottom align-items-end d-flex"
//             xs={4}
//             md={1}
//           >
//             <Button
//               type="button"
//               onClick={() => {
//                 setUpdateItem({
//                   isForm: false,
//                   formIndex: undefined,
//                   formData: undefined,
//                 });
//               }}
//               className="me-3"
//               size="sm"
//               color="danger"
//               outline
//             >
//               <i className="ri-close-circle-line fs-5"></i>
//             </Button>
//             <Button type="submit" size="sm" color="success">
//               <i className="ri-check-line fs-5"></i>
//             </Button>
//           </Col>
//         </Row>
//       </Form>
//     </React.Fragment>
//   );
// };

// EditBillItem.propTypes = {
//   updateItem: PropTypes.object,
//   setItem: PropTypes.func,
// };

// export default EditBillItem;

import React from "react";
import {
  Col,
  Button,
  Input,
  FormFeedback,
  Form,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
} from "reactstrap";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { useFormik } from "formik";
import { updateBillItem } from "../../../../../store/actions";

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

const EditBillItemModal = ({ isOpen, toggle, updateItem }) => {
  const dispatch = useDispatch();
  const centers = useSelector((state) => state.Center.data);
  const userCenters = useSelector((state) => state.User?.centerAccess);

  const data = updateItem?.formData;
  console.log("data", data);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: data?._id || "",
      name: data?.name || "",
      unit: data?.unit || "",
      cost: data?.cost || "",
      category: data?.category || "",
      centers: data?.center || [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Item name is required"),
      centers: Yup.array().min(1, "At least one center is required"),
      cost: Yup.string()
        // .required("Cost is required")
        .matches(/^\d+$/, "Only numbers allowed, commas not allowed"),
      unit: Yup.string().matches(/^\d*$/, "Unit must contain only numbers"),
    }),
    onSubmit: (values) => {
      dispatch(
        updateBillItem({
          ...values,
          centerIds: userCenters,
        }),
      );
      toggle();
    },
  });

  const allCenterIds = (centers || []).map((c) => c._id);
  const isAllSelected =
    validation.values.centers.length === allCenterIds.length &&
    allCenterIds.length > 0;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>Edit Item</ModalHeader>
      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
          }}
        >
          <Row>
            {/* Centers */}
            <Col xs={12} className="mb-3">
              <Label>Centers</Label>
              <div className="d-flex flex-wrap gap-3">
                <Button
                  size="sm"
                  color={isAllSelected ? "danger" : "primary"}
                  outline
                  onClick={() => {
                    validation.setFieldValue(
                      "centers",
                      isAllSelected ? [] : allCenterIds,
                    );
                  }}
                >
                  {isAllSelected ? "Unselect All" : "Select All"}
                </Button>

                {(centers || []).map((cen) => (
                  <div key={cen._id}>
                    <Input
                      type="checkbox"
                      value={cen._id}
                      name="centers"
                      checked={validation.values.centers.includes(cen._id)}
                      onChange={validation.handleChange}
                    />
                    <Label className="ms-1">{cen.title}</Label>
                  </div>
                ))}
              </div>
              {validation.errors.centers && (
                <FormFeedback className="d-block">
                  {validation.errors.centers}
                </FormFeedback>
              )}
            </Col>

            {/* Name */}
            <Col md={3} className="mb-3">
              <Input
                name="name"
                placeholder="Name"
                value={validation.values.name}
                onChange={validation.handleChange}
                invalid={!!validation.errors.name}
              />
              <FormFeedback>{validation.errors.name}</FormFeedback>
            </Col>

            {/* Unit */}
            <Col md={2} className="mb-3">
              <Input
                name="unit"
                placeholder="Unit"
                value={validation.values.unit}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  validation.setFieldValue("unit", value);
                }}
              />
            </Col>

            {/* Cost */}
            <Col md={2} className="mb-3">
              <Input
                name="cost"
                placeholder="Cost"
                value={validation.values.cost}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  validation.setFieldValue("cost", value);
                }}
                invalid={!!validation.errors.cost}
              />
              <FormFeedback>{validation.errors.cost}</FormFeedback>
            </Col>

            {/* Category */}
            <Col md={3} className="mb-3">
              <Input
                type="select"
                name="category"
                value={validation.values.category}
                onChange={validation.handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Input>
            </Col>

            {/* Actions */}
            <Col md={12} className="d-flex justify-content-end gap-2">
              <Button outline color="secondary" onClick={toggle}>
                Cancel
              </Button>
              <Button color="success" type="submit">
                Update
              </Button>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

EditBillItemModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  updateItem: PropTypes.object,
};

export default EditBillItemModal;
