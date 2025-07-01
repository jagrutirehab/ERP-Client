import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { format } from "date-fns";
import * as Yup from "yup";
import { useFormik } from "formik";
import { addInternFields } from "../../../Components/constants/intern";
import CustomModal from "../../../Components/Common/Modal";
import { connect, useDispatch } from "react-redux";
import {
  toggleInternForm,
  editInternForm,
  postInternData,
} from "../../../store/actions";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Compressor from "compressorjs";
import UserDummyImage from "../../../assets/images/users/user-dummy-img.jpg";
import convertToFormData from "../../../utils/convertToFormData";
import UploadedFiles from "../../../Components/Common/UploadedFiles";
import InternId from "./InternId";
import FormField from "../../../Components/Common/FormField";

const AddIntern = ({ intern, user, centers }) => {
  const dispatch = useDispatch();
  const cropperRef = useRef(null);

  const [fields] = useState(addInternFields);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const editData = intern.data;
  console.log(editData, "this is edit data")
  const dateOfBirth = editData?.dateOfBirth
    ? format(new Date(editData.dateOfBirth), "yyyy-MM-dd")
    : "";

  useEffect(() => {
    if (editData?.profilePicture?.url) {
      setPreviewImage(editData.profilePicture.url);
    }
  }, [editData]);

  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      InternId: editData?.InternId || "",
      author: user?._id,
      editor: user?._id,
      center: editData?.center?.$oid || editData?.center?._id || editData?.center || "",
      profilePicture: editData?.profilePicture || "",
      name: editData?.name || "",
      contactNumber: editData?.contactNumber || "",
      dateOfBirth,
      gender: editData?.gender || "",
      emailAddress: editData?.emailAddress || "",
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
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Intern Name is required"),
      contactNumber: Yup.string()
        .required("Please Enter Phone Number")
        .test("is-valid-phone", "Invalid phone number", (value) =>
          isValidPhoneNumber(value || "")
        ),
      dateOfBirth: Yup.date().required("Date of Birth is required"),
      gender: Yup.string().required("Gender is required"),
      emailAddress: Yup.string()
        .email("Invalid Email")
        .required("Email Address is required"),
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
        .test("is-valid-phone", "Invalid phone number", (value) =>
          isValidPhoneNumber(value || "")
        ),
      emergencyContactEmail: Yup.string().email("Invalid Email"),
    }),
    onSubmit: async (values) => {
      const formData = convertToFormData(values);

      if (values.aadhaarCard?.file) {
        formData.append("aadhaarCard", values.aadhaarCard.file);
      }

      if (croppedImage) {
        const blob = dataURLtoBlob(croppedImage);
        formData.set("profilePicture", blob, "profile.jpg");
      } else if (
        !croppedImage &&
        editData?.profilePicture?.url &&
        !editData?.profilePicture?.fileAppended
      ) {
        const existingBlob = await fetch(editData.profilePicture.url).then(
          (res) => res.blob()
        );
        formData.set("profilePicture", existingBlob, "profile.jpg");
      }

      if (editData) {
        formData.set("editId", editData._id);
        formData.set("editor", user?._id);
        formData.set("editedAt", new Date().toISOString());
        dispatch(editInternForm({ id: editData._id, formData }));
      } else {
        dispatch(postInternData(formData));
      }
    },
  });

  const cancelForm = () => {
    validation.resetForm();
    dispatch(toggleInternForm({ data: null, leadData: null, isOpen: false }));
  };

  const handleFiles = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    new Compressor(file, {
      quality: 0.6,
      success(result) {
        setImageToCrop(URL.createObjectURL(result));
        setIsCropModalOpen(true);
      },
      error(err) {
        console.error(err.message);
      },
    });
  };

  const cropImage = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
      if (canvas) {
        const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCroppedImage(croppedDataUrl);
        setPreviewImage(croppedDataUrl);
        setIsCropModalOpen(false);
      }
    }
  };

  return (
    <CustomModal
      isOpen={intern.isOpen}
      title={editData ? "Edit Intern" : "Add Intern"}
      centered
      size="xl"
    >
      <Form onSubmit={validation.handleSubmit} className="needs-validation">
        <Row>
          <Col xs={12}>
            {editData?.aadhaarCard?.url && (
              <UploadedFiles
                title="Intern Files"
                files={[editData.aadhaarCard]}
              />
            )}
          </Col>

          <Col xs={12}>
            <InternId validation={validation} editData={editData} />
          </Col>

          <Col md={12} className="text-center">
            <div className="profile-wrapper">
              <div className="image-wrapper text-center position-relative">
                <img
                  src={previewImage || UserDummyImage}
                  className="user-image"
                  alt="intern Profile"
                />
                <Input
                  type="file"
                  id="profile-img-file-input"
                  className="d-none"
                  accept="image/*"
                  onChange={handleFiles}
                />
                <Label
                  htmlFor="profile-img-file-input"
                  className="camera-icon-label"
                >
                  <i className="ri-camera-fill"></i>
                </Label>
              </div>
            </div>
          </Col>

          <CustomModal
            isOpen={isCropModalOpen}
            title="Crop Image"
            centered
            size="lg"
            toggle={() => setIsCropModalOpen(false)}
          >
            <div className="text-center">
              {imageToCrop ? (
                <>
                  <Cropper
                    ref={cropperRef}
                    src={imageToCrop}
                    style={{ width: "100%", maxHeight: "400px" }}
                    aspectRatio={1}
                    viewMode={1}
                    guides={false}
                    background={false}
                  />
                  <Button color="success" onClick={cropImage} className="mt-3">
                    Crop & Save
                  </Button>
                </>
              ) : (
                <p>No image selected</p>
              )}
            </div>
          </CustomModal>

          <Col md={6}>
            <div className="mb-3">
              <Label htmlFor="center">
                Center<span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                name="center"
                id="center"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.center}
                invalid={
                  validation.touched.center && !!validation.errors.center
                }
              >
                <option value="" disabled>
                  Choose here
                </option>
                {(centers || []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
              <FormFeedback>{validation.errors.center}</FormFeedback>
            </div>
          </Col>

          <FormField
            fields={fields}
            validation={validation}
            handleChange={(e, fieldType) => {
              if (fieldType === "file") {
                const file = e.target.files[0];
                validation.setFieldValue(e.target.name, {
                  file,
                  path: e.target.value,
                });
              } else {
                validation.handleChange(e);
              }
            }}
          />

          <Col xs={12} className="d-flex justify-content-end gap-3 mt-4">
            <Button type="button" color="danger" onClick={cancelForm}>
              Cancel
            </Button>
            <Button type="submit" color="primary" outline>
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    </CustomModal>
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
