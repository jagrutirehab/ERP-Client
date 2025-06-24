import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Row,
  Col,
  Label,
  Input,
  FormFeedback,
  Button,
  Spinner,
} from "reactstrap";
import PhoneInputWithCountrySelect, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { format } from "date-fns";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { addInternFields } from "../../../Components/constants/intern";

import CustomModal from "../../../Components/Common/Modal";
import { connect, useDispatch, useSelector } from "react-redux";

import {
  toggleInternForm,
  editInternForm,
  postInternData,
} from "../../../store/actions";
//cropper
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
//compress image
import Compressor from "compressorjs";

//user dummy image

import UserDummyImage from "../../../assets/images/users/user-dummy-img.jpg";

import convertToFormData from "../../../utils/convertToFormData";

import UploadedFiles from "../../../Components/Common/UploadedFiles";
import InternId from "./InternId";

import RenderWhen from "../../../Components/Common/RenderWhen";
import FormField from "../../../Components/Common/FormField";

const AddIntern = ({ intern, user, centers }) => {
  const dispatch = useDispatch();

  const [fields, setFields] = useState(addInternFields);
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null); // To hold the cropped image
  const [imageToCrop, setImageToCrop] = useState(null); // To hold the selected image
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const cropperRef = useRef(null); // Cropper reference

  const editData = intern.data;
  const dateOfBirth = editData?.dateOfBirth
    ? format(new Date(editData.dateOfBirth), "yyyy-MM-dd")
    : "";

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      InternId: editData ? editData.InternId || "" : "",
      author: user?._id,

      editor: user?._id,
      center: editData ? editData.center : "",
      profilePicture: editData ? editData?.profilePicture : "",
      name: editData ? editData.name : "",
      contactNumber: editData ? editData.contactNumber : "",
      dateOfBirth,
      gender: editData ? editData.gender : "",
      emailAddress: editData ? editData.emailAddress : "",
      street: editData?.street || "",
      city: editData?.city || "",
      state: editData?.state || "",
      country: editData?.country || "",
      postalCode: editData?.postalCode || "",
      educationalInstitution: editData?.educationalInstitution || "",
      courseProgram: editData?.courseProgram || "",
      yearOfStudy: editData?.yearOfStudy || "",
      internshipDuration: editData?.internshipDuration || "",
      emergencyContactName: editData?.emergencyContactName || "",
      emergencyContactPhoneNumber: editData?.emergencyContactPhoneNumber || "",
      emergencyContactEmail: editData?.emergencyContactEmail || "",
      // InternId: editData ? editData.InternId || "" : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Intern Name is required"),
      contactNumber: Yup.string()
        .required("Please Enter Phone Number")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          return isValidPhoneNumber(value || "");
        }),
      dateOfBirth: Yup.date().required("Date of Birth is required"),
      gender: Yup.string().required("Gender is required"),
      emailAddress: Yup.string()
        .email("Invalid Email")
        .required("Email Address is required"),
      street: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      country: Yup.string(),
      postalCode: Yup.string(),
      educationalInstitution: Yup.string().required(
        "Educational Institution is required"
      ),
      courseProgram: Yup.string().required("Course/Program is required"),
      yearOfStudy: Yup.number().required("Year of Study is required"),
      internshipDuration: Yup.string().required(
        "Internship Duration is required"
      ),
      emergencyContactName: Yup.string().required(
        "Emergency Contact Name is required"
      ),
      emergencyContactPhoneNumber: Yup.string()
        .required("Please Enter Phone Number")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          return isValidPhoneNumber(value || "");
        }),
      emergencyContactEmail: Yup.string().email("Invalid Email"),
      //  InternId: Yup.string().required("Intern Id is required"),
    }),
    onSubmit: (values) => {
      const formData = convertToFormData(values);
      console.log(formData, " data");
      formData.append("aadhaarCard", values.aadhaarCard?.file);
      if (editData) {
        formData.append("editId", editData?._id);
        const checkProfilePicture = values.profilePicture instanceof Blob;
        // const checkAadhaarCard = values.aadhaarCard.file instanceof Blob;
        // if (!checkProfilePicture) formData.delete("profilePicture");
        // if (!checkAadhaarCard) formData.delete("aadhaarCard");
        dispatch(editInternForm({ id: editData?._id, formData }));
      } else dispatch(postInternData(formData));
    },
  });
  console.log(validation);
  const cancelForm = () => {
    validation.resetForm();
    dispatch(toggleInternForm({ data: null, leadData: null, isOpen: false }));
  };

  useEffect(() => {
    if (!editData) {
      validation.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  const toggleCropModal = () => {
    setIsCropModalOpen(!isCropModalOpen);
  };
  const handleFiles = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    if (!file) {
      return;
    }

    new Compressor(file, {
      quality: 0.5,
      success(result) {
        // Set the image to be cropped
        setImageToCrop(URL.createObjectURL(result));
        // Update form value (for the selected file)
        setIsCropModalOpen(true);
        const ev = { target: { name: name, value: result } };
        validation.handleChange(ev);
      },
      error(err) {
        console.err(err.message);
      },
    });
  };
  // Handle cropping of the image
  const cropImage = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        setCroppedImage(canvas.toDataURL()); // Set the cropped image
        toggleCropModal();
      }
    }
  };
  const handleChange = (e, fieldType) => {
    if (fieldType === "file") {
      const name = e.target.name;
      const file = e.target.files[0];
      const event = {
        target: { name, value: { file, path: e.target.value } }, //new Blob([{ file, path: e.target.value }])
      };
      validation.handleChange(event);
    } else {
      validation.handleChange(e);
    }
  };

  const handleNestedChange = (e, parentKey) => {
    const { name, value } = e.target;
    validation.setFieldValue(`${parentKey}.${name}`, value);
  };

  console.log(validation, "editData");

  return (
    <React.Fragment>
      <CustomModal
        isOpen={intern.isOpen}
        title={"Add Intern"}
        centered={true}
        size={"xl"}
      >
        <div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              // toggle();
              // return false;
            }}
            className="needs-validation"
            action="#"
          >
            <Row>
              <Col xs={12}>
                {editData?.aadhaarCard?.url && (
                  <UploadedFiles
                    title={"intern Files"}
                    files={[editData.aadhaarCard]}
                  />
                )}
              </Col>
              <Col xs={12}>
                <InternId validation={validation} editData={editData} />
              </Col>

              <Col md={12}>
                <div className="profile-wrapper">
                  {/* <Label>Profile Picture</Label> */}
                  <div className="image-wrapper text-center position-relative">
                    <img
                      src={croppedImage || UserDummyImage}
                      className="user-image"
                      alt="intern Profile"
                    />
                    {/* <div className="avatar-xs p-0 rounded-circle profile-photo-edit"> */}
                    <div>
                      <Input
                        id="profile-img-file-input"
                        onChange={handleFiles}
                        type="file"
                        // className="profile-img-file-input"
                        className="d-none"
                        accept="image/*"
                        name="profilePicture"
                      />
                      <Label
                        htmlFor="profile-img-file-input"
                        className="camera-icon-label"
                        onClick={() => setIsCropModalOpen(true)}
                      >
                        <span>
                          <i className="ri-camera-fill"></i>
                        </span>
                      </Label>
                    </div>
                  </div>
                </div>
              </Col>
              {/* Conditionally render the Cropper */}

              <Col xs={12}>
                <div>
                  <CustomModal
                    isOpen={isCropModalOpen}
                    title={"Crop Image"}
                    centered={true}
                    size={"lg"}
                    toggle={toggleCropModal} // Allows modal to close via the backdrop or close button
                  >
                    {/* Display Cropper when an image is selected */}
                    {imageToCrop ? (
                      <div className="d-flex justify-content-center align-items-center flex-column">
                        <div className="cropper-wrapper">
                          <Cropper
                            ref={cropperRef}
                            src={imageToCrop}
                            style={{
                              width: 400,
                              // maxWidth: "600px",
                              height: "100%", // Defined height for consistency
                            }}
                            crop
                            zoomTo={0}
                            disabled={false}
                            viewMode={1}
                            minCropBoxHeight={100}
                            minCropBoxWidth={100}
                            initialAspectRatio={1} // For square cropping
                            guides={false}
                            cropBoxResizable={true}
                            cropBoxMovable={true}
                          />
                        </div>

                        {/* Buttons */}
                        <div className="mt-3 text-center">
                          <Button
                            onClick={cropImage}
                            color="success"
                            outline
                            size="sm"
                            className="me-2"
                          >
                            Crop Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <p>No image selected for cropping</p>
                      </div>
                    )}
                  </CustomModal>
                </div>
              </Col>

              <Col xs={12} className="d-flex justify-content-center">
                {/* {centers.length > 1 && ( */}
                <Col xs={12} md={4}>
                  <div className="mb-3">
                    <Label htmlFor="aadhaar-card" className="form-label">
                      Center
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="select"
                      name="center"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.center || ""}
                      invalid={
                        validation.touched.center && validation.errors.center
                          ? true
                          : false
                      }
                      className="form-control"
                      placeholder=""
                      id="aadhaar-card"
                    >
                      <option value="" selected disabled hidden>
                        Choose here
                      </option>
                      {(centers || []).map((option, idx) => (
                        <option key={idx} value={option._id}>
                          {option.title}
                        </option>
                      ))}
                    </Input>
                    {validation.touched.center && validation.errors.center ? (
                      <FormFeedback type="invalid">
                        <div>{validation.errors.center}</div>
                      </FormFeedback>
                    ) : null}
                  </div>
                </Col>
                {/* )} */}
              </Col>

              <FormField
                fields={fields}
                validation={validation}
                handleChange={handleChange}
              />
              {/* {fields.map(({ label, name, type, options, required }, index) => (
                <div
                  key={index}
                  className={type === "radio" ? "col-12 mb-3" : "col-md-6 mb-3"}
                >
                  <label className="form-label">{label}</label>
                  {type === "radio" ? (
                    <div className="d-flex gap-3">
                      {options.map((option) => (
                        <div
                          key={option.value}
                          className="form-check form-check-inline"
                        >
                          <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={validation.values[name] === option.value}
                            onChange={validation.handleChange}
                            className="form-check-input"
                          />
                          <label className="form-check-label">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={validation.values[name] || ""}
                      onChange={validation.handleChange}
                      className="form-control"
                    />
                  )}
                </div>
              ))} */}
              <Col xs={12}>
                <div className="d-flex align-items-center justify-content-end gap-3">
                  <Button onClick={cancelForm} size="sm" color="danger">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" outline>
                    Save
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </CustomModal>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  intern: state.Intern.internForm,
  centers: state.Center.data,
  user: state.User.user,
});

AddIntern.propTypes = {
  intern: PropTypes.object,
  user: PropTypes.object,
  centers: PropTypes.array,
};

export default connect(mapStateToProps)(AddIntern);
