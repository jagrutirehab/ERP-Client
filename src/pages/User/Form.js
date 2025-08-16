import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import UploadedFiles from "../../Components/Common/UploadedFiles";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

//cropper
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

//select
import CreatableSelect from "react-select/creatable";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { connect, useDispatch, useSelector } from "react-redux";
import { registerUser, updateUser } from "../../store/actions";

//constants
import authRoles from "../../Components/constants/authRoles";
import pages from "../../Components/constants/pages";
import CustomModal from "../../Components/Common/Modal";
import PropTypes from "prop-types";
import PhoneInputWithCountrySelect from "react-phone-number-input";

const UserForm = ({ isOpen, toggleForm, userData, setUserData }) => {
  const dispatch = useDispatch();

  const cropperRef = useRef(null);
  const profilePicRef = useRef(null);
  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
  };

  const dummmyImage =
    "data:image/png;base64,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";

  const author = useSelector((state) => state.User.user);
  const centers = useSelector((state) => state.Center.allCenters);
  const [faqs, setFaqs] = useState(userData?.faqs?.length ? userData.faqs : []);
  const [signature, setSignature] = useState();
  const [cropSignature, setCropSignature] = useState();
  const [profilePic, setProfilePic] = useState("");
  const [cropProfilePic, setCropProfilePic] = useState("");

  const [options, setOptions] = useState([]);
  const handleChange = (selectedOptions) => {
    setOptions(selectedOptions || []);
    validation.setFieldValue("patientsConcern", selectedOptions);
  };
  const handleCreate = (inputValue) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setOptions((prev) => [...prev, newOption]); // Add to available options
    validation.setFieldValue("patientsConcern", [
      ...(validation.values.patientsConcern || []),
      newOption,
    ]);
  };

  const [expertise, setExpertise] = useState([]);
  const handleExpertiseChange = (selectedOptions) => {
    setExpertise(selectedOptions || []);
    validation.setFieldValue("expertise", selectedOptions);
  };
  const handleExpertiseCreate = (inputValue) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setExpertise((prev) => [...prev, newOption]); // Add to available options
    validation.setFieldValue("expertise", [
      ...(validation.values.expertise || []),
      newOption,
    ]);
  };

  const [languages, setLanguages] = useState([]);
  const handleLanChange = (selectedOptions) => {
    setLanguages(selectedOptions || []);
    validation.setFieldValue("langauges", selectedOptions);
  };
  const handleLanCreate = (inputValue) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setLanguages((prev) => [...prev, newOption]); // Add to available options
    validation.setFieldValue("languages", [
      ...(validation.values.languages || []),
      newOption,
    ]);
  };

  useEffect(() => {
    setFaqs(userData?.faqs || []);
    setOptions(
      userData?.patientsConcern?.map((p) => ({ label: p, value: p })) || []
    );
    setExpertise(
      userData?.expertise?.map((e) => ({ label: e, value: e })) || []
    );
    setLanguages(
      userData?.languages?.map((e) => ({ label: e, value: e })) || []
    );
  }, [userData]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      authorId: author?._id || "",
      name: userData ? userData.name : "",
      email: userData ? userData.email : "",
      role: userData ? userData.role : "",
      phoneNumber: userData ? userData.phoneNumber : "",
      signature: "",
      degrees: userData?.education ? userData.education?.degrees : "",
      speciality: userData?.education ? userData.education?.speciality : "",
      registrationNo: userData?.education
        ? userData.education?.registrationNo
        : "",
      centerAccess: userData?.centerAccess
        ? userData.centerAccess.map((cn) => cn._id)
        : [],
      pageAccess: userData ? userData.pageAccess?.pages : [],
      confirm_password: "",
      password: "",
      patientsConcern: userData
        ? userData?.patientsConcern?.map((p) => ({ label: p, value: p }))
        : [],
      languages: userData
        ? userData?.languages?.map((p) => ({ label: p, value: p }))
        : [],
      bio: userData ? userData?.bio : "",
      experience: userData ? userData?.experience : "",
      expertise: userData
        ? userData?.expertise?.map((e) => ({ label: e, value: e }))
        : [],
      availabilityMode: userData ? userData?.availabilityMode : [],
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
      name: Yup.string().required("Please Enter Your Username"),
      ...(!userData && {
        password: Yup.string().required("Please Enter Your Password"),
      }),
      ...(!userData && {
        confirm_password: Yup.string().oneOf(
          [Yup.ref("password")],
          "Confirm Password Doesn't Match"
        ),
      }),
      phoneNumber: Yup.string()
        .required("Please Enter Phone Number")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          return isValidPhoneNumber(value || "");
        }),
      centerAccess: Yup.array().test(
        "notEmpty",
        "Center Access is required",
        (value) => {
          if (!value || value.length === 0) {
            return false;
          }
          return true;
        }
      ),
      pageAccess: Yup.array().test(
        "notEmpty",
        "Pages Access is required",
        (value) => {
          if (!value || value.length === 0) {
            return false;
          }
          return true;
        }
      ),
      role: Yup.string().required("Please Select User Role"),
    }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("authorId", values.authorId);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("role", values.role);
      formData.append("phoneNumber", values.phoneNumber);
      formData.append("degrees", values.degrees);
      formData.append("speciality", values.speciality);
      formData.append("registrationNo", values.registrationNo);
      formData.append("centerAccess", JSON.stringify(values.centerAccess));
      formData.append("pageAccess", JSON.stringify(values.pageAccess));
      formData.append("password", values.password);
      formData.append("bio", values.bio);
      if (expertise?.length)
        formData.append(
          "expertise",
          JSON.stringify(expertise?.map((o) => o.value))
        );
      formData.append("availabilityMode", values.availabilityMode);
      formData.append("experience", values.experience);
      if (options?.length)
        formData.append(
          "patientsConcern",
          JSON.stringify(options?.map((o) => o.value))
        );
      if (languages?.length)
        formData.append(
          "languages",
          JSON.stringify(languages?.map((o) => o.value))
        );
      if (faqs?.length) formData.append("faqs", JSON.stringify(faqs));
      if (cropSignature?.file) formData.append("signature", cropSignature.file);
      if (cropProfilePic?.file)
        formData.append("profilePicture", cropProfilePic.file);
      if (userData) {
        formData.append("pageAccessId", userData.pageAccess?._id);
        if (userData.education?._id)
          formData.append("educationId", userData.education?._id);
        formData.append("id", userData._id);
        dispatch(updateUser(formData));
        setUserData(null);
      } else dispatch(registerUser(formData));
      // validation.resetForm();
      // toggleForm();
    },
  });

  useEffect(() => {
    validation.resetForm();
  }, []);

  const fieldsArray = [
    {
      label: "Name",
      name: "name",
      type: "text",
      handleChange: (e) => validation.handleChange(e),
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      handleChange: (e) => validation.handleChange(e),
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      options: authRoles,
      handleChange: (e) => validation.handleChange(e),
    },
    {
      label: "Phone number",
      name: "phoneNumber",
      type: "phoneNumber",
      handleChange: (e) => validation.handleChange(e),
    },
    {
      label: "Center Access",
      name: "centerAccess",
      type: "checkbox",
      value: "_id",
      options: centers || [],
      check: (field, item) => {
        return validation.values[field.name]?.includes(item?._id);
      },
      handleChange: (e) => {
        validation.handleChange(e);
      },
    },
    !userData && {
      label: "Password",
      name: "password",
      type: "password",
      handleChange: (e) => validation.handleChange(e),
    },
    !userData && {
      label: "Confirm Password",
      name: "confirm_password",
      type: "password",
      handleChange: (e) => validation.handleChange(e),
    },
    {
      label: "Pages Access",
      name: "pageAccess",
      type: "checkbox",
      value: "label",
      options: pages,
      check: (field, item) => {
        return validation.values[field.name]?.find((tm) => {
          return tm.name === item.name;
        })
          ? true
          : false;
      },
      subCheck: (field, item, val) => {
        const result = validation.values[field]?.find((tm) => {
          if (tm.name === item) {
            return tm.subAccess.some((sub) => sub.name === val);
          } else return undefined;
        });
        return result ? true : false;
      },
      checkPermission: (a, b, c) => {
        const result = validation.values.pageAccess?.find((tm) => {
          if (c) {
            if (tm.name === a) {
              return tm.subAccess.find((sub) => {
                return sub.name === c ? sub.permissions[b] : false;
              });
            } else return undefined;
          } else {
            if (tm.name === a) return tm.permissions[b];
            else return undefined;
          }
        });
        return result ? true : false;
      },
      handleChange: (e, field, item, val) => handleAccess(e, field, item, val),
    },
    {
      label: "Availability Mode",
      name: "availabilityMode",
      type: "checkbox",
      value: "_id",
      options: [
        {
          _id: "in-person",
          title: "In-Person",
        },
        {
          _id: "virtual",
          title: "Video",
        },
      ],
      check: (field, item) => {
        return validation.values[field.name]?.includes(item?._id);
      },
      handleChange: (e) => {
        validation.handleChange(e);
      },
    },
  ];

  const cancelForm = () => {
    toggleForm();
    setUserData(null);
    setCropSignature();
    setSignature();
    setCropProfilePic("");
    validation.resetForm();
  };

  const handleAccess = (e, field, item, val) => {
    const value = val
      ? field.subCheck(field.name, item.name, val.name)
      : field.check(field, item); // checked state of the checkbox

    // Get the current state of pageAccess array
    const currentPageAccess = validation.values.pageAccess || [];
    let updatedPageAccess = [];

    if (value) {
      // 1: add page + add sub pages
      // 2: remove page
      // 3: remove sub pages + remove page
      if (val) {
        const checkSubAccessIndex = currentPageAccess.find((pg) => {
          return (
            pg.name === item.name &&
            pg.subAccess?.findIndex((_) => _.name === val.name)
          );
        });
        updatedPageAccess = currentPageAccess.map((pg) => {
          if (item.name === pg.name) {
            const page = pg.subAccess.filter((sb) => sb.name !== val.name);
            return { ...pg, subAccess: page };
          } else return pg;
        });
      } else {
        updatedPageAccess = currentPageAccess.filter(
          (pg) => pg.name !== item.name
        );
      }
    } else {
      if (val) {
        updatedPageAccess = currentPageAccess.map((pg) => {
          if (item.name === pg.name) {
            return { ...pg, subAccess: [...pg.subAccess, val] };
          } else return pg;
        });
      } else {
        updatedPageAccess = [
          ...currentPageAccess,
          { ...item, name: item.name, subAccess: item.children },
        ];
      }
    }

    validation.setFieldValue("pageAccess", updatedPageAccess);
  };

  const handlePermission = (a, b, c) => {
    let currentPageAccess = [...validation.values.pageAccess];
    // let updatedPageAccess = [];

    if (c) {
      currentPageAccess = currentPageAccess.map((pg) => {
        if (a.name === pg.name) {
          const page = pg.subAccess.map((sb) => {
            if (sb.name === c.name) {
              return {
                ...sb,
                permissions: { ...sb.permissions, [b]: !sb.permissions[b] },
              };
            } else return sb;
          });
          return { ...pg, subAccess: page };
        } else return pg;
      });
      // let subAccess = [...validation.values.pageAccess[a.idx].subAccess];
      // subAccess[c.idx].permissions[b] = !subAccess[c.idx].permissions[b];

      // currentPageAccess[a.idx] = {
      //   ...currentPageAccess[a.idx],
      //   subAccess,
      // };
    } else {
      currentPageAccess = currentPageAccess.map((pg) => {
        if (a.name === pg.name) {
          return {
            ...pg,
            permissions: { ...pg.permissions, [b]: !pg.permissions[b] },
          };
        } else return pg;
      });

      // currentPageAccess[a.idx] = {
      //   ...currentPageAccess[a.idx],
      //   permissions: {
      //     ...currentPageAccess[a.idx].permissions,
      //     [b]: !a.permissions[b],
      //   },
      // };
    }

    validation.setFieldValue("pageAccess", currentPageAccess);
  };

  const onProfileChange = (e) => {
    e.preventDefault();
    let files = e.target.files;

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

  const onChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSignature(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

  // const getCropData = async () => {
  //   if (typeof cropperRef.current?.cropper !== "undefined") {
  //     const dataURI = cropperRef.current?.cropper
  //       .getCroppedCanvas()
  //       .toDataURL();
  //     const blob = await fetch(dataURI).then((it) => it.blob());
  //     const file = new File([blob], "signature.jpg", {
  //       type: "image/jpeg",
  //       lastModified: new Date(),
  //     });
  //     setCropSignature({ file, dataURI });
  //   }
  //   setSignature();
  // };

  const getCropData = async (type) => {
    const ref = type === "profile" ? profilePicRef : cropperRef;
    if (ref.current?.cropper) {
      const dataURI = ref.current.cropper.getCroppedCanvas().toDataURL();
      const blob = await fetch(dataURI).then((res) => res.blob());
      const file = new File([blob], `${type}.jpg`, {
        type: "image/jpeg",
        lastModified: new Date(),
      });
      if (type === "profile") {
        setCropProfilePic({ file, dataURI }); // Store both file and dataURI
        setProfilePic(null);
      } else {
        setCropSignature({ file, dataURI });
        setSignature(null);
      }
    }
  };

  const getCropProfilePic = async () => {
    if (typeof profilePicRef.current?.cropper !== "undefined") {
      const dataURI = profilePicRef.current?.cropper
        .getCroppedCanvas()
        .toDataURL();
      const blob = await fetch(dataURI).then((it) => it.blob());
      const file = new File([blob], "profilePic.jpg", {
        type: "image/jpeg",
        lastModified: new Date(),
      });
      setCropProfilePic({ file, dataURI });
    }
    setProfilePic();
  };

  const handleFaqChange = (index, event) => {
    const { name, value } = event.target;
    const updatedFaqs = [...faqs];
    updatedFaqs[index][name] = value;
    setFaqs(updatedFaqs);
  };

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} centered size="xl">
        <ModalHeader toggle={cancelForm}>Add new User</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
            action="#"
          >
            {/* {signature && } */}
            <CustomModal
              title={"Corp Signature"}
              size={"md"}
              centered
              isOpen={Boolean(signature)}
              toggle={() => setSignature()}
            >
              <div className="d-flex justify-content-center">
                <Cropper
                  ref={cropperRef}
                  style={{ height: "100%", width: 400 }}
                  crop
                  zoomTo={0}
                  disabled
                  initialAspectRatio={1}
                  // preview=".img-preview"
                  src={signature}
                  viewMode={1}
                  minCropBoxHeight={100}
                  minCropBoxWidth={100}
                  dragMode="move"
                  cropBoxMovable={false}
                  cropBoxResizable={false}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                  guides={true}
                />
              </div>
              <div className="mt-3 text-center">
                <Button
                  type="button"
                  color="success"
                  outline
                  size="sm"
                  onClick={getCropData}
                >
                  Crop
                </Button>
              </div>
            </CustomModal>

            {/* To Crop The profile Pic */}
            <CustomModal
              title={"Crop Profile Pic"}
              size={"md"}
              centered
              isOpen={Boolean(profilePic)}
              toggle={() => setProfilePic()}
            >
              <div className="d-flex justify-content-center">
                <Cropper
                  ref={profilePicRef}
                  style={{ height: "100%", width: 400 }}
                  crop
                  zoomTo={0}
                  disabled
                  initialAspectRatio={1}
                  // preview=".img-preview"
                  src={profilePic}
                  viewMode={1}
                  minCropBoxHeight={100}
                  minCropBoxWidth={100}
                  dragMode="move"
                  cropBoxMovable={false}
                  cropBoxResizable={false}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                  guides={true}
                />
              </div>
              <div className="mt-3 text-center">
                <Button
                  type="button"
                  color="success"
                  outline
                  size="sm"
                  onClick={getCropProfilePic}
                >
                  Crop
                </Button>
              </div>
            </CustomModal>

            <div className="profile-wrapper">
              <div className="image-wrapper text-center position-relative">
                {cropProfilePic?.dataURI ? (
                  <img
                    className="user-image"
                    src={cropProfilePic?.dataURI}
                    alt=""
                  />
                ) : (
                  <img className="user-image" src={dummmyImage} />
                )}
                {/* Camera icon that triggers the file input */}
                <label htmlFor="profilePicInput" className="camera-icon-label">
                  <i className="ri-camera-fill"></i>
                </label>
              </div>
            </div>

            <Col md="6">
              <Input
                name={"profilePic"}
                className="d-none"
                // className="form-control"
                id="profilePicInput"
                type={"file"}
                accept="image/*"
                onChange={onProfileChange}
                onBlur={validation.handleBlur}
                innerRef={profilePicRef}
                invalid={
                  validation.touched.signature && validation.errors.signature
                    ? true
                    : false
                }
              />
            </Col>
            <Row>
              {(fieldsArray.filter((fl) => fl) || []).map((field, i) => {
                return (
                  <Col key={i + field} xs={12} lg={6}>
                    <div className="mb-3">
                      <Label htmlFor={field.name} className="form-label">
                        {field.label}
                      </Label>

                      {field.name === "phoneNumber" ? (
                        <>
                          <PhoneInputWithCountrySelect
                            placeholder="Enter phone number"
                            name={field.name}
                            value={validation.values[field.name]}
                            onBlur={validation.handleBlur}
                            onChange={(value) =>
                              field.handleChange({
                                target: {
                                  name: field.name,
                                  value: value,
                                },
                              })
                            }
                            limitMaxLength={true}
                            defaultCountry="IN"
                            className="w-100"
                            style={{
                              width: "100%",
                              height: "42px",
                              padding: "0.5rem 0.75rem",
                              border: "1px solid #d1d5db",
                              borderRadius: "0.375rem",
                              fontSize: "1rem",
                            }}
                          />
                          {validation.touched[field.name] &&
                            validation.errors[field.name] && (
                              <FormFeedback type="invalid" className="d-block">
                                {validation.errors[field.name]}
                              </FormFeedback>
                            )}
                        </>
                      ) : field.type === "select" ? (
                        <>
                          <Input
                            name={field.name}
                            className="form-control"
                            placeholder={`Enter ${field.label}`}
                            type={field.type}
                            onChange={field.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values[field.name] || ""}
                            invalid={
                              validation.touched[field.name] &&
                              validation.errors[field.name]
                                ? true
                                : false
                            }
                          >
                            <option value="" selected disabled hidden>
                              Choose here
                            </option>
                            {(field.options || []).map((option, idx) => (
                              <option key={idx} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Input>
                        </>
                      ) : field.type === "checkbox" ? (
                        <>
                          <div className="d-flex flex-wrap">
                            {(field.options || []).map((item, idx) => {
                              return (
                                <React.Fragment key={idx}>
                                  <div className="">
                                    <div
                                      // key={item[field.value]}
                                      className="d-flex me-5 mb-2 align-items-center"
                                    >
                                      <Input
                                        className="me-2 mt-0"
                                        type={field.type}
                                        name={field.name}
                                        value={item[field.value]}
                                        onChange={(e) =>
                                          field.handleChange(e, field, item)
                                        }
                                        checked={field.check(field, item)}
                                      />
                                      <Label className="form-label fs-9 mb-0">
                                        {item.title || item.label}
                                      </Label>
                                    </div>
                                    {field.check(field, item) &&
                                      (
                                        Object.entries(
                                          item.permissions || {}
                                        ) || []
                                      ).map((p) => (
                                        <div
                                          key={p[0]}
                                          className="d-flex ps-3 mb-2 align-items-center"
                                        >
                                          <Input
                                            className="me-2 mt-0"
                                            type={field.type}
                                            name={field.name}
                                            value={p[1]}
                                            onChange={(e) =>
                                              handlePermission(
                                                { ...item, idx },
                                                p[0]
                                              )
                                            }
                                            checked={
                                              field.checkPermission(
                                                item.name,
                                                p[0]
                                              )
                                              // validation.values.pageAccess[idx]
                                              //   ?.permissions[p[0]]
                                            }
                                          />
                                          <Label className="form-label fs-9 mb-0">
                                            {p[0]}
                                          </Label>
                                        </div>
                                      ))}
                                    {field.check(field, item) &&
                                      (item.children || []).map((val, id) => {
                                        return (
                                          <>
                                            <div
                                              key={val.name}
                                              className="d-flex ps-4 ms-1 mb-2 align-items-center"
                                            >
                                              <Input
                                                className="me-2 mt-0"
                                                type={field.type}
                                                name={field.name}
                                                value={val.name}
                                                onChange={(e) =>
                                                  field.handleChange(
                                                    e,
                                                    field,
                                                    item,
                                                    val
                                                  )
                                                }
                                                checked={field.subCheck(
                                                  field.name,
                                                  item.name,
                                                  val.name
                                                )}
                                              />
                                              <Label className="form-label fs-9 mb-0">
                                                {val.name || val.label}
                                              </Label>
                                            </div>
                                            {field.subCheck(
                                              field.name,
                                              item.name,
                                              val.name
                                            ) &&
                                              (
                                                Object.entries(
                                                  val.permissions || {}
                                                ) || []
                                              ).map((p, index) => (
                                                <div
                                                  key={index}
                                                  className="d-flex ps-5 s-1 mb-2 align-items-center"
                                                >
                                                  <Input
                                                    className="me-2 mt-0"
                                                    type={field.type}
                                                    name={field.name}
                                                    value={p[1]}
                                                    onChange={(e) =>
                                                      handlePermission(
                                                        { ...item, idx },
                                                        p[0],
                                                        { ...val, idx: id }
                                                      )
                                                    }
                                                    checked={
                                                      field.checkPermission(
                                                        item.name,
                                                        p[0],
                                                        val.name
                                                      )
                                                      // validation.values
                                                      //   .pageAccess[idx]
                                                      //   ?.subAccess[id]
                                                      //   ?.permissions[p[0]]
                                                    }
                                                  />
                                                  <Label className="form-label fs-9 mb-0">
                                                    {p[0]}
                                                  </Label>
                                                </div>
                                              ))}
                                          </>
                                        );
                                      })}
                                  </div>
                                </React.Fragment>
                              );
                            })}
                            {validation.touched[field.name] &&
                            validation.errors[field.name] ? (
                              <FormFeedback type="invalid" className="d-block">
                                {validation.errors[field.name]}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <Input
                          name={field.name}
                          className="form-control"
                          placeholder={`Enter ${field.label}`}
                          style={
                            field.name === "name"
                              ? { textTransform: "capitalize" }
                              : {}
                          }
                          type={field.type}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values[field.name] || ""}
                          invalid={
                            validation.touched[field.name] &&
                            validation.errors[field.name]
                              ? true
                              : false
                          }
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
                );
              })}
              {(validation.values.role === "DOCTOR" ||
                validation.values.role === "COUNSELLOR") && (
                <>
                  {userData?.signature && (
                    <UploadedFiles
                      title={"User Signature"}
                      showDeleteButton={false}
                      files={[userData.signature]}
                      // deleteFilePermanently={() =>
                      //   dispatch(removeAadhaarCard({ id: editData._id }))
                      // }
                    />
                  )}
                  <div className="mb-2">
                    <Label>Signature</Label>
                    <Input
                      name={"signature"}
                      className="form-control"
                      type={"file"}
                      accept="image/*"
                      onChange={(e) => {
                        onChange(e);
                        // const file = e.target.files[0];
                        // if (!file) return;
                        // setSignature(file);
                      }}
                      onBlur={validation.handleBlur}
                      // value={validation.values.signature || ""}
                      invalid={
                        validation.touched.signature &&
                        validation.errors.signature
                          ? true
                          : false
                      }
                    />

                    {validation.touched.signature &&
                    validation.errors.signature ? (
                      <FormFeedback type="invalid">
                        {validation.errors.signature}
                      </FormFeedback>
                    ) : null}
                  </div>

                  {cropSignature && (
                    <div className="">
                      <img
                        className="img-fluid"
                        src={cropSignature.dataURI}
                        alt=""
                      />
                      <div>
                        <Button
                          type="button"
                          color="danger"
                          outline
                          size="sm"
                          onClick={() => setCropSignature()}
                        >
                          Clear Signature
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="mb-2">
                    <Label>Concerns my patients have</Label>
                    <CreatableSelect
                      isMulti
                      name="patientsConcern"
                      options={options}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onBlur={validation.handleBlur}
                      onChange={handleChange}
                      onCreateOption={handleCreate} // Handle user-created options
                      value={validation.values.patientsConcern || []} // Maintain selected values
                    />

                    {validation.touched.patientsConcern &&
                    validation.errors.patientsConcern ? (
                      <FormFeedback type="invalid">
                        {validation.errors.patientsConcern}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {/* <div className="mb-2">
                      <Label>Concerns my patients have</Label>
                      <Select
                        // defaultValue={}
                        isMulti
                        name="colors"
                        options={colourOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onBlur={validation.handleBlur}
                      />

                      {validation.touched.patientsConcern &&
                      validation.errors.patientsConcern ? (
                        <FormFeedback type="invalid">
                          {validation.errors.patientsConcern}
                        </FormFeedback>
                      ) : null}
                    </div> */}
                  <div className="mb-2">
                    <Label>Degrees</Label>
                    <Input
                      name={"degrees"}
                      className="form-control"
                      placeholder={`Enter degrees`}
                      type={"text"}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.degrees || ""}
                      invalid={
                        validation.touched.degrees && validation.errors.degrees
                          ? true
                          : false
                      }
                    />

                    {validation.touched.degrees && validation.errors.degrees ? (
                      <FormFeedback type="invalid">
                        {validation.errors.degrees}
                      </FormFeedback>
                    ) : null}
                  </div>

                  <div className="mb-2">
                    <Label>Languages Speak</Label>
                    <CreatableSelect
                      isMulti
                      name="languages"
                      options={options}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onBlur={validation.handleBlur}
                      onChange={handleLanChange}
                      onCreateOption={handleLanCreate} // Handle user-created options
                      value={validation.values.languages || []} // Maintain selected values
                    />

                    {validation.touched.languages &&
                    validation.errors.languages ? (
                      <FormFeedback type="invalid">
                        {validation.errors.languages}
                      </FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-2">
                    <Label>Speciality</Label>
                    <Input
                      name={"speciality"}
                      className="form-control"
                      placeholder={`Enter speciality`}
                      type={"text"}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.speciality || ""}
                      invalid={
                        validation.touched.speciality &&
                        validation.errors.speciality
                          ? true
                          : false
                      }
                    />

                    {validation.touched.speciality &&
                    validation.errors.speciality ? (
                      <FormFeedback type="invalid">
                        {validation.errors.speciality}
                      </FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-2">
                    <Label>Registration Number</Label>
                    <Input
                      name={"registrationNo"}
                      className="form-control"
                      placeholder={`Enter Registration Number`}
                      type={"text"}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.registrationNo || ""}
                      invalid={
                        validation.touched.registrationNo &&
                        validation.errors.registrationNo
                          ? true
                          : false
                      }
                    />

                    {validation.touched.registrationNo &&
                    validation.errors.registrationNo ? (
                      <FormFeedback type="invalid">
                        {validation.errors.registrationNo}
                      </FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-2">
                    <Label>Bio</Label>
                    <Input
                      name={"bio"}
                      className="form-control"
                      placeholder={`Enter Bio`}
                      type={"text"}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.bio || ""}
                    />
                  </div>
                  <div className="mb-2">
                    <Label>Expertise</Label>
                    <CreatableSelect
                      isMulti
                      name="expertise"
                      options={expertise}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onBlur={validation.handleBlur}
                      onChange={handleExpertiseChange}
                      onCreateOption={handleExpertiseCreate} // Handle user-created options
                      value={validation.values.expertise || []} // Maintain selected values
                    />

                    {validation.touched.expertise &&
                    validation.errors.expertise ? (
                      <FormFeedback type="invalid">
                        {validation.errors.expertise}
                      </FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-2">
                    <Label>Year Of Experience</Label>
                    <Input
                      name={"experience"}
                      className="form-control"
                      placeholder={`Enter Your Experience`}
                      type={"number"}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.experience || ""}
                    />
                  </div>
                  <div className="mb-2">
                    <Label>FAQS</Label>
                    {(faqs || []).map((f, i) => (
                      <React.Fragment key={i}>
                        <Row className="align-items-center">
                          <Col xs={12} md={5}>
                            <Label>Question</Label>
                            <Input
                              name={"question"}
                              className="form-control"
                              required
                              placeholder={`Enter Question`}
                              type={"text"}
                              onChange={(e) => handleFaqChange(i, e)}
                              onBlur={validation.handleBlur}
                              value={f.question || ""}
                            />
                          </Col>{" "}
                          <Col xs={12} md={5}>
                            <Label>Answer</Label>
                            <Input
                              name={"answer"}
                              className="form-control"
                              required
                              placeholder={`Enter Answer`}
                              type={"textarea"}
                              onChange={(e) => handleFaqChange(i, e)}
                              onBlur={validation.handleBlur}
                              value={f.answer || ""}
                            />
                          </Col>
                          <Col xs={12} md={2}>
                            <i
                              onClick={() => {
                                setFaqs(faqs.filter((_, index) => index !== i));
                              }}
                              className="btn text-white btn-sm btn-danger ri-delete-bin-6-line"
                            ></i>
                          </Col>
                        </Row>
                      </React.Fragment>
                    ))}

                    <div>
                      <Button
                        onClick={() => {
                          setFaqs([...faqs, { question: "", answer: "" }]);
                        }}
                        type="button"
                        size="sm"
                        color="primary"
                        outline
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </>
              )}
              <Col xs={12}>
                <div className="d-flex align-items-center justify-content-end gap-3">
                  <Button type="submit" size="sm" color="primary" outline>
                    Save
                  </Button>
                  <Button onClick={cancelForm} size="sm" color="danger">
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

UserForm.propTypes = {
  appointments: PropTypes.array,
  user: PropTypes.object.isRequired,
  currentEvent: PropTypes.object,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  form: state.User.form,
});

export default connect(mapStateToProps)(UserForm);
