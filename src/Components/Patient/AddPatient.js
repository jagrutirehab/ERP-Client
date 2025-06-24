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
import { addPatientFields, patientGuradianFields } from "../constants/patient";
import Divider from "../Common/Divider";
import CustomModal from "../Common/Modal";
import { connect, useDispatch } from "react-redux";
import {
  addLeadPatient,
  addPatient,
  fetchDoctors,
  fetchPatientId,
  removeAadhaarCard,
  togglePatientForm,
  updatePatient,
} from "../../store/actions";

//cropper
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
//compress image
import Compressor from "compressorjs";

//user dummy image
import UserDummyImage from "../../assets/images/users/user-dummy-img.jpg";
// import convertToFormData from "../../utils/convertToFormData";
import UploadedFiles from "../Common/UploadedFiles";
import PatientId from "./PatientId";
import RenderWhen from "../Common/RenderWhen";
import FormField from "../Common/FormField";
import convertToFormDataPatient from "../../utils/convertToFormDataPatient";

const AddPatient = ({
  patient,
  user,
  centers,
  doctors,
  counsellors,
  doctorLoading,
  generatedPatientId,
}) => {
  const dispatch = useDispatch();
  const [fields, setFields] = useState(addPatientFields);
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null); // To hold the cropped image
  const [imageToCrop, setImageToCrop] = useState(null); // To hold the selected image
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const cropperRef = useRef(null); // Cropper reference

  const editData = patient.data;
  const leadData = patient.leadData;
  const name = editData ? editData.name : leadData ? leadData.patient.name : "";
  const phoneNumber = editData
    ? editData.phoneNumber
    : leadData
    ? leadData.patient.phoneNumber
    : "";
  const dateOfBirth = editData?.dateOfBirth
    ? format(new Date(editData.dateOfBirth), "yyyy-MM-dd")
    : "";

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: user?._id, //user might be the create of patient
      editor: user?._id, //user might be the editor of patient
      id: editData?.id ? editData.id.value : generatedPatientId?.value,
      center: editData ? editData.center?._id : "",
      profilePicture: editData ? editData?.profilePicture : "",
      aadhaarCard: "",
      aadhaarCardNumber: editData ? editData.aadhaarCardNumber : "",
      name,
      phoneNumber,
      dateOfBirth,
      email: editData ? editData.email : "",
      address: editData ? editData.address : "",
      doctor: editData ? editData.doctor?._id : "",
      psychologist: editData ? editData.psychologist?._id : "",
      provisionalDiagnosis: editData ? editData.provisionalDiagnosis : "",
      gender: editData ? editData.gender : "",
      guardianName: editData ? editData.guardianName : "",
      guardianRelation: editData ? editData.guardianRelation : "",
      guardianPhoneNumber: editData ? editData.guardianPhoneNumber : "",
      dateOfAddmission: editData?.dateOfAddmission //&& editData.dateOfAddmission instanceof Date
        ? format(new Date(editData.dateOfAddmission), "yyyy-MM-dd")
        : "",
      referredBy: editData ? editData.referredBy : "",
      ipdFileNumber: editData ? editData.ipdFileNumber : "",
    },
    validationSchema: Yup.object({
      id: Yup.string()
        .required("Id is required")
        .matches(/^[A-Z0-9]+$/, "Id must contain only alphabets and digits"),
      center: Yup.string().required("Please Select Patient Center"),
      name: Yup.string().required("Please Enter Patient Name"),
      aadhaarCardNumber: Yup.string()
        .nullable()
        .notRequired()
        .matches(
          /^$|^[0-9]{12}$/,
          "Aadhaar Card Number must be exactly 12 digits"
        ),
      phoneNumber: Yup.string()
        .required("Please Enter Phone Number")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          return isValidPhoneNumber(value || "");
        }),
      dateOfBirth: Yup.string().required("Please Select Date of Birth"),
      address: Yup.string().required("Please Enter Patient Address"),
      gender: Yup.string().required("Please Select Gender"),
      guardianName: Yup.string().required("Please Enter Guardian Name"),
      guardianRelation: Yup.string().required("Please Enter Guardian Relation"),
      guardianPhoneNumber: Yup.string().required(
        "Please Enter Guardian Phone Number"
      ),
    }),
    onSubmit: (values) => {
      const formData = convertToFormDataPatient(values);

      // ✅ Append only if a file exists
      if (values.aadhaarCard?.file instanceof Blob) {
        formData.append("aadhaarCard", values.aadhaarCard.file);
      }

      if (values.profilePicture instanceof Blob) {
        formData.append("profilePicture", values.profilePicture);
      }

      if (editData) {
        formData.append("editId", editData?._id);

        // ✅ Skip appending again, but remove if not changed
        const checkProfilePicture = values.profilePicture instanceof Blob;
        const checkAadhaarCard = values.aadhaarCard?.file instanceof Blob;
        if (!checkProfilePicture) formData.delete("profilePicture");
        if (!checkAadhaarCard) formData.delete("aadhaarCard");

        dispatch(updatePatient(formData));
      } else if (leadData) {
        formData.append("lead", leadData._id);
        dispatch(addLeadPatient(formData));
      } else {
        dispatch(addPatient(formData)); // ✅ now clean
      }
    },

    // onSubmit: (values) => {
    //   const formData = convertToFormData(values);
    //   formData.append("aadhaarCard", values.aadhaarCard?.file);

    //   if (values.profilePicture instanceof Blob) {
    //     formData.append("profilePicture", values.profilePicture);
    //   }

    //   if (editData) {
    //     formData.append("editId", editData?._id);
    //     const checkProfilePicture = values.profilePicture instanceof Blob;
    //     const checkAadhaarCard = values.aadhaarCard.file instanceof Blob;
    //     if (!checkProfilePicture) formData.delete("profilePicture");
    //     if (!checkAadhaarCard) formData.delete("aadhaarCard");
    //     dispatch(updatePatient(formData));
    //   } else if (leadData) {
    //     formData.append("lead", leadData._id);
    //     dispatch(addLeadPatient(formData));
    //   } else {
    //     dispatch(addPatient(formData));
    //   }
    //   // cancelForm();
    // },
  });

  const cancelForm = () => {
    validation.resetForm();
    dispatch(togglePatientForm({ data: null, leadData: null, isOpen: false }));
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
        console.error(err.message);
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

  useEffect(() => {
    if (patient?.isOpen) {
      dispatch(fetchPatientId());
    }
  }, [dispatch, patient]);

  useEffect(() => {
    if (validation.values.center)
      dispatch(fetchDoctors({ center: validation.values.center }));
  }, [dispatch, validation.values.center]);

  useEffect(() => {
    if (doctors?.length) {
      let flds = [...fields].map((l) =>
        l.name === "doctor"
          ? { ...l, options: doctors }
          : l.name === "psychologist"
          ? { ...l, options: counsellors || [] }
          : l
      );
      setFields(flds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  useEffect(() => {
    if (editData) {
      const fls = [...fields].map((l) =>
        l.name === "name" ? { ...l, disabled: true } : l
      );
      setFields(fls);
    } else {
      const fls = [...fields].map((l) =>
        l.name === "name" ? { ...l, disabled: false } : l
      );
      setFields(fls);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  return (
    <React.Fragment>
      <CustomModal
        isOpen={patient.isOpen}
        title={"Add Patient"}
        centered={true}
        size={"xl"}
      >
        <div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              // toggle();
              return false;
            }}
            className="needs-validation"
            action="#"
          >
            <Row>
              <Col xs={12}>
                {editData?.aadhaarCard?.url && (
                  <UploadedFiles
                    title={"Patient Files"}
                    files={[editData.aadhaarCard]}
                    deleteFilePermanently={() =>
                      dispatch(removeAadhaarCard({ id: editData._id }))
                    }
                  />
                )}
              </Col>
              <Col xs={12}>
                <PatientId validation={validation} editData={editData} />
              </Col>

              <Col md={12}>
                <div className="profile-wrapper">
                  {/* <Label>Profile Picture</Label> */}
                  <div className="image-wrapper text-center position-relative">
                    {/* <img
                      src={
                        validation.values.profilePicture?.url
                          ? validation.values.profilePicture.url
                          : validation.values.profilePicture instanceof Blob
                          ? // validation.values.profilePicture instanceof File
                            URL.createObjectURL(
                              validation.values.profilePicture
                            )
                          : UserDummyImage
                      }
                      className="rounded-circle avatar-lg img-thumbnail user-profile-image"
                      alt="Patient Profile"
                    /> */}
                    <img
                      src={croppedImage || UserDummyImage}
                      className="user-image"
                      alt="Patient Profile"
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
                      disabled={editData ? true : false}
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
                doctorLoading={doctorLoading}
                handleChange={handleChange}
              />
              {/* {(fields || []).map((field, i) => (
                <Col key={i + field} xs={12} lg={6}>
                  <div className="mb-3">
                    <Label htmlFor={field.name} className="form-label">
                      {field.label}
                    </Label>
                    {field.type === "radio" ? (
                      <>
                        <div className="d-flex flex-wrap">
                          {(field.options || []).map((item, idx) => (
                            <React.Fragment key={item + idx}>
                              <div
                                key={item + idx}
                                className="d-flex me-5 align-items-center"
                              >
                                <Input
                                  className="me-2 mt-0"
                                  type={field.type}
                                  name={field.name}
                                  value={item}
                                  onChange={validation.handleChange}
                                  checked={validation.values.gender === item}
                                />
                                <Label className="form-label fs-14 mb-0">
                                  {item}
                                </Label>
                              </div>
                            </React.Fragment>
                          ))}
                          {validation.touched[field.name] &&
                          validation.errors[field.name] ? (
                            <FormFeedback type="invalid" className="d-block">
                              {validation.errors[field.name]}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </>
                    ) : field.type === "select" ? (
                      <>
                        <div
                          // key={item + idx}
                          className="d-flex align-items-center position-relative"
                        >
                          <Input
                            className="me-2 fs-13 mt-0"
                            type={field.type}
                            name={field.name}
                            value={validation.values[field.name]}
                            onChange={validation.handleChange}
                          >
                            <option value="" selected disabled hidden>
                              Choose here
                            </option>
                            {(field.options || []).map((option, idx) => (
                              <option key={idx} value={option._id}>
                                {option.name}
                              </option>
                            ))}
                          </Input>
                          <RenderWhen isTrue={doctorLoading}>
                            <span
                              className="link-success dropdown-input-icon"
                              style={{ right: "50px" }}
                            >
                              <Spinner size={"sm"} color="success" />
                            </span>
                          </RenderWhen>
                        </div>
                        {validation.touched[field.name] &&
                        validation.errors[field.name] ? (
                          <FormFeedback type="invalid" className="d-block">
                            {validation.errors[field.name]}
                          </FormFeedback>
                        ) : null}
                      </>
                    ) : (
                      <Input
                        name={field.name}
                        className="form-control"
                        placeholder={`Enter ${field.label}`}
                        type={field.type}
                        onChange={(e) => handleChange(e, field.type)}
                        onBlur={validation.handleBlur}
                        value={
                          field.type !== "file"
                            ? validation.values[field.name] || ""
                            : validation.values[field.name]?.path || ""
                        }
                        invalid={
                          validation.touched[field.name] &&
                          validation.errors[field.name]
                            ? true
                            : false
                        }
                        accept={field.accept}
                      />
                    )}
                    {validation.touched[field.name] &&
                    validation.errors[field.name] ? (
                      <FormFeedback type="invalid">
                        {validation.errors[field.name]}
                      </FormFeedback>
                    ) : null}
                  </div>
                </Col>
              ))} */}
              <Col xs={12}>
                <div className="d-flex gap-3 align-items-center">
                  <h6 className="display-6 fs-4">Guardian</h6>
                  <Divider />
                </div>
              </Col>
              {(patientGuradianFields || []).map((f, idx) => (
                <Col key={f.name + idx} xs={12} lg={4}>
                  <div className="mb-3">
                    <Label htmlFor="aadhaar-card" className="form-label">
                      {f.label}
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type={f.type}
                      name={f.name}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values[f.name] || ""}
                      invalid={
                        validation.touched[f.name] && validation.errors[f.name]
                          ? true
                          : false
                      }
                      disabled={f.name === "dateOfAddmission" && editData}
                      className="form-control"
                      placeholder=""
                      id="aadhaar-card"
                    />
                    {validation.touched[f.name] && validation.errors[f.name] ? (
                      <FormFeedback type="invalid">
                        <div>{validation.errors[f.name]}</div>
                      </FormFeedback>
                    ) : null}
                  </div>
                </Col>
              ))}
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
  patient: state.Patient.patientForm,
  user: state.User.user,
  centers: state.Center.data,
  doctorLoading: state.User.doctorLoading,
  doctors: state.User.doctor,
  counsellors: state.User.counsellors,
  generatedPatientId: state.Patient.generatedPatientId,
});

AddPatient.propTypes = {
  patient: PropTypes.object,
  user: PropTypes.object,
  centers: PropTypes.array,
  generatedPatientId: PropTypes.object,
};

export default connect(mapStateToProps)(AddPatient);
