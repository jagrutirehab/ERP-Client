import React, { useEffect, useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import CreatableSelect from "react-select/creatable";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, updateUser } from "../../store/actions";
import authRoles from "../../Components/constants/authRoles";
import pages from "../../Components/constants/pages";
import PropTypes from "prop-types";

const UserForm = ({ isOpen, toggleForm, userData, setUserData }) => {
  const dispatch = useDispatch();
  const cropperRef = useRef(null);
  const profilePicRef = useRef(null);
  const dummyImage =
    "https://skala.or.id/wp-content/uploads/2024/01/dummy-post-square-1-1.jpg";
  const author = useSelector((state) => state.User.user);
  const centers = useSelector((state) => state.Center.allCenters);
  const [faqs, setFaqs] = useState(userData?.faqs?.length ? userData.faqs : []);
  const [signature, setSignature] = useState(null);
  const [cropSignature, setCropSignature] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [cropProfilePic, setCropProfilePic] = useState(
    userData?.profilePicture ? { dataURI: userData.profilePicture } : null
  );
  const [options, setOptions] = useState([]);
  const [expertise, setExpertise] = useState([]);
  const [languages, setLanguages] = useState([]);

  const handleChange = (selectedOptions) => {
    setOptions(selectedOptions || []);
    validation.setFieldValue("patientsConcern", selectedOptions);
  };

  const handleCreate = (inputValue) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setOptions((prev) => [...prev, newOption]);
    validation.setFieldValue("patientsConcern", [
      ...(validation.values.patientsConcern || []),
      newOption,
    ]);
  };

  const handleExpertiseChange = (selectedOptions) => {
    setExpertise(selectedOptions || []);
    validation.setFieldValue("expertise", selectedOptions);
  };

  const handleExpertiseCreate = (inputValue) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setExpertise((prev) => [...prev, newOption]);
    validation.setFieldValue("expertise", [
      ...(validation.values.expertise || []),
      newOption,
    ]);
  };

  const handleLanChange = (selectedOptions) => {
    setLanguages(selectedOptions || []);
    validation.setFieldValue("languages", selectedOptions);
  };

  const handleLanCreate = (inputValue) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setLanguages((prev) => [...prev, newOption]);
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
    setCropProfilePic(
      userData?.profilePicture ? { dataURI: userData.profilePicture } : null
    );
    setCropSignature(null);
    setSignature(null);
    setProfilePic(null);
  }, [userData]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      authorId: author?._id || "",
      name: userData?.name || "",
      email: userData?.email || "",
      role: userData?.role || "",
      signature: "",
      degrees: userData?.education?.degrees || "",
      speciality: userData?.education?.speciality || "",
      registrationNo: userData?.education?.registrationNo || "",
      centerAccess: userData?.centerAccess?.map((cn) => cn._id) || [],
      pageAccess: userData?.pageAccess?.pages || [],
      confirm_password: "",
      password: "",
      patientsConcern:
        userData?.patientsConcern?.map((p) => ({ label: p, value: p })) || [],
      languages:
        userData?.languages?.map((p) => ({ label: p, value: p })) || [],
      bio: userData?.bio || "",
      experience: userData?.experience || "",
      expertise:
        userData?.expertise?.map((e) => ({ label: e, value: e })) || [],
      availabilityMode: userData?.availabilityMode || [],
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      name: Yup.string().required("Name is required"),
      ...(!userData && {
        password: Yup.string().required("Password is required"),
        confirm_password: Yup.string()
          .oneOf([Yup.ref("password")], "Passwords must match")
          .required("Confirm Password is required"),
      }),
      centerAccess: Yup.array().min(1, "At least one center is required"),
      role: Yup.string().required("Role is required"),
    }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("authorId", values.authorId);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("role", values.role);
      formData.append("degrees", values.degrees);
      formData.append("speciality", values.speciality);
      formData.append("registrationNo", values.registrationNo);
      formData.append("centerAccess", JSON.stringify(values.centerAccess));
      formData.append("password", values.password);
      formData.append("bio", values.bio);
      if (expertise?.length)
        formData.append(
          "expertise",
          JSON.stringify(expertise.map((o) => o.value))
        );
      formData.append("availabilityMode", values.availabilityMode);
      formData.append("experience", values.experience);
      if (options?.length)
        formData.append(
          "patientsConcern",
          JSON.stringify(options.map((o) => o.value))
        );
      if (languages?.length)
        formData.append(
          "languages",
          JSON.stringify(languages.map((o) => o.value))
        );
      if (faqs?.length) formData.append("faqs", JSON.stringify(faqs));
      if (cropSignature?.file) formData.append("signature", cropSignature.file);
      if (cropProfilePic?.file)
        formData.append("profilePicture", cropProfilePic.file);
      if (userData) {
        formData.append("pageAccessId", userData.pageAccess?._id);
        if (userData.education?._id)
          formData.append("educationId", userData.education._id);
        formData.append("id", userData._id);
        dispatch(updateUser(formData));
        setUserData(null);
      } else {
        dispatch(registerUser(formData));
      }
      setCropProfilePic(null);
      setCropSignature(null);
      setSignature(null);
      setProfilePic(null);
      validation.resetForm();
      toggleForm();
    },
  });

  const fieldsArray = [
    {
      label: "Name",
      name: "name",
      type: "text",
      placeholder: "Enter full name",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "Enter email address",
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      options: authRoles,
      placeholder: "Select role",
    },
    !userData && {
      label: "Password",
      name: "password",
      type: "password",
      placeholder: "Enter password",
    },
    !userData && {
      label: "Confirm Password",
      name: "confirm_password",
      type: "password",
      placeholder: "Confirm password",
    },
    {
      label: "Availability Mode",
      name: "availabilityMode",
      type: "checkbox",
      value: "_id",
      options: [
        { _id: "in-person", title: "In-Person" },
        { _id: "virtual", title: "Video" },
      ],
      check: (field, item) =>
        validation.values[field.name]?.includes(item?._id),
    },
    // {
    //   label: "Page Access",
    //   name: "pageAccess",
    //   type: "checkbox",
    //   value: "label",
    //   options: pages,
    //   check: (field, item) =>
    //     validation.values[field.name]?.find((tm) => tm.name === item.name),
    //   subCheck: (field, item, val) => {
    //     const result = validation.values[field.name]
    //       ?.find((tm) => tm.name === item.name)
    //       ?.subAccess?.some((sub) => sub.name === val);
    //     return !!result;
    //   },
    //   checkPermission: (a, b, c) => {
    //     const result = validation.values.pageAccess?.find((tm) => {
    //       if (c) {
    //         if (tm.name === a)
    //           return tm.subAccess?.find((sub) => sub.name === c)?.permissions[
    //             b
    //           ];
    //         return false;
    //       }
    //       if (tm.name === a) return tm.permissions[b];
    //       return false;
    //     });
    //     return !!result;
    //   },
    //   handleChange: (e, field, item, val) => handleAccess(e, field, item, val),
    // },
  ];

  const cancelForm = () => {
    toggleForm();
    setUserData(null);
    setCropSignature(null);
    setSignature(null);
    setCropProfilePic(null);
    setProfilePic(null);
    validation.resetForm();
  };

  const handleAccess = (e, field, item, val) => {
    const value = val
      ? field.subCheck(field.name, item.name, val.name)
      : field.check(field, item);
    const currentPageAccess = validation.values.pageAccess || [];
    let updatedPageAccess = [];
    if (value) {
      if (val) {
        updatedPageAccess = currentPageAccess.map((pg) => {
          if (item.name === pg.name) {
            const page = pg.subAccess.filter((sb) => sb.name !== val.name);
            return { ...pg, subAccess: page };
          }
          return pg;
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
          }
          return pg;
        });
      } else {
        updatedPageAccess = [
          ...currentPageAccess,
          { ...item, name: item.name, subAccess: item.children || [] },
        ];
      }
    }
    validation.setFieldValue("pageAccess", updatedPageAccess);
  };

  const handlePermission = (a, b, c) => {
    let currentPageAccess = [...validation.values.pageAccess];
    if (c) {
      currentPageAccess = currentPageAccess.map((pg) => {
        if (a.name === pg.name) {
          const page = pg.subAccess.map((sb) => {
            if (sb.name === c.name) {
              return {
                ...sb,
                permissions: { ...sb.permissions, [b]: !sb.permissions[b] },
              };
            }
            return sb;
          });
          return { ...pg, subAccess: page };
        }
        return pg;
      });
    } else {
      currentPageAccess = currentPageAccess.map((pg) => {
        if (a.name === pg.name) {
          return {
            ...pg,
            permissions: { ...pg.permissions, [b]: !pg.permissions[b] },
          };
        }
        return pg;
      });
    }
    validation.setFieldValue("pageAccess", currentPageAccess);
  };

  const onProfileChange = (e) => {
    const files = e.target.files;
    const reader = new FileReader();
    reader.onload = () => setProfilePic(reader.result);
    reader.readAsDataURL(files[0]);
  };

  const onSignatureChange = (e) => {
    const files = e.target.files || e.dataTransfer.files;
    const reader = new FileReader();
    reader.onload = () => setSignature(reader.result);
    reader.readAsDataURL(files[0]);
  };

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
        setCropProfilePic({ file, dataURI });
        setProfilePic(null);
      } else {
        setCropSignature({ file, dataURI });
        setSignature(null);
      }
    }
  };

  const handleFaqChange = (index, event) => {
    const { name, value } = event.target;
    const updatedFaqs = [...faqs];
    updatedFaqs[index][name] = value;
    setFaqs(updatedFaqs);
  };

  return (
    <div
      style={{
        display: isOpen ? "flex" : "none",
        position: "fixed",
        top: 50,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        transition: "opacity 0.3s ease",
        opacity: isOpen ? 1 : 0,
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1f2937",
            }}
          >
            {userData ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={cancelForm}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <svg
              style={{ width: "28px", height: "28px", color: "#6b7280" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={validation.handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "32px" }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <img
                src={
                  userData?.profilePicture?.url ||
                  cropProfilePic?.dataURI ||
                  dummyImage
                }
                alt="Profile"
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #e5e7eb",
                }}
              />
              <label
                htmlFor="profilePicInput"
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  borderRadius: "50%",
                  padding: "10px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563eb")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3b82f6")
                }
              >
                <svg
                  style={{ width: "22px", height: "22px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onProfileChange}
              />
            </div>
          </div>

          {(signature || profilePic) && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  padding: "32px",
                  maxWidth: "600px",
                  width: "100%",
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "20px",
                    color: "#1f2937",
                  }}
                >
                  {signature ? "Crop Signature" : "Crop Profile Picture"}
                </h3>
                <Cropper
                  ref={signature ? cropperRef : profilePicRef}
                  src={signature || profilePic}
                  style={{ height: "350px", width: "100%" }}
                  initialAspectRatio={1}
                  viewMode={1}
                  minCropBoxHeight={100}
                  minCropBoxWidth={100}
                  dragMode="move"
                  cropBoxMovable={false}
                  cropBoxResizable={false}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  checkOrientation={false}
                  guides={true}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "16px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#d1d5db")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e5e7eb")
                    }
                    onClick={() =>
                      signature ? setSignature(null) : setProfilePic(null)
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#3b82f6",
                      color: "#ffffff",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2563eb")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#3b82f6")
                    }
                    onClick={() =>
                      getCropData(signature ? "signature" : "profile")
                    }
                  >
                    Crop
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "20px",
            }}
          >
            {fieldsArray.filter(Boolean).map((field, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    style={{
                      padding: "10px",
                      border: `1px solid ${
                        validation.touched[field.name] &&
                        validation.errors[field.name]
                          ? "#ef4444"
                          : "#d1d5db"
                      }`,
                      borderRadius: "6px",
                      fontSize: "15px",
                      outline: "none",
                      width: "100%",
                      backgroundColor: "#ffffff",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border = "1px solid #3b82f6")
                    }
                    onBlur={(e) => {
                      e.target.style.border = `1px solid ${
                        validation.touched[field.name] &&
                        validation.errors[field.name]
                          ? "#ef4444"
                          : "#d1d5db"
                      }`;
                      validation.handleBlur(e);
                    }}
                    onChange={validation.handleChange}
                    value={validation.values[field.name] || ""}
                  >
                    <option value="" disabled>
                      {field.placeholder}
                    </option>
                    {field.options.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" &&
                  field.name !== "centerAccess" ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {field.options.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="checkbox"
                            name={field.name}
                            value={item[field.value]}
                            checked={field.check(field, item)}
                            onChange={(e) =>
                              field.handleChange
                                ? field.handleChange(e, field, item)
                                : validation.handleChange(e)
                            }
                            style={{
                              marginRight: "10px",
                              width: "18px",
                              height: "18px",
                            }}
                          />
                          <label
                            style={{
                              fontSize: "15px",
                              color: "#374151",
                            }}
                          >
                            {item.title || item.label}
                          </label>
                        </div>
                        {field.check(field, item) && item.permissions && (
                          <div
                            style={{
                              marginLeft: "30px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                            }}
                          >
                            {Object.entries(item.permissions).map(
                              ([perm, value]) => (
                                <div
                                  key={perm}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    name={field.name}
                                    value={perm}
                                    checked={field.checkPermission(
                                      item.name,
                                      perm
                                    )}
                                    onChange={() =>
                                      handlePermission(item, perm)
                                    }
                                    style={{
                                      marginRight: "10px",
                                      width: "18px",
                                      height: "18px",
                                    }}
                                  />
                                  <label
                                    style={{
                                      fontSize: "15px",
                                      color: "#374151",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {perm}
                                  </label>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {field.check(field, item) &&
                          item.children?.map((val, id) => (
                            <div
                              key={id}
                              style={{
                                marginLeft: "30px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  name={field.name}
                                  value={val.name}
                                  checked={field.subCheck(
                                    field.name,
                                    item.name,
                                    val.name
                                  )}
                                  onChange={(e) =>
                                    field.handleChange(e, field, item, val)
                                  }
                                  style={{
                                    marginRight: "10px",
                                    width: "18px",
                                    height: "18px",
                                  }}
                                />
                                <label
                                  style={{
                                    fontSize: "15px",
                                    color: "#374151",
                                  }}
                                >
                                  {val.name}
                                </label>
                              </div>
                              {field.subCheck(
                                field.name,
                                item.name,
                                val.name
                              ) &&
                                val.permissions && (
                                  <div
                                    style={{
                                      marginLeft: "30px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "12px",
                                    }}
                                  >
                                    {Object.entries(val.permissions).map(
                                      ([perm, value]) => (
                                        <div
                                          key={perm}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            name={field.name}
                                            value={perm}
                                            checked={field.checkPermission(
                                              item.name,
                                              perm,
                                              val.name
                                            )}
                                            onChange={() =>
                                              handlePermission(item, perm, val)
                                            }
                                            style={{
                                              marginRight: "10px",
                                              width: "18px",
                                              height: "18px",
                                            }}
                                          />
                                          <label
                                            style={{
                                              fontSize: "15px",
                                              color: "#374151",
                                              textTransform: "capitalize",
                                            }}
                                          >
                                            {perm}
                                          </label>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                      </div>
                    ))}
                    {validation.touched[field.name] &&
                      validation.errors[field.name] && (
                        <p
                          style={{
                            color: "#ef4444",
                            fontSize: "13px",
                            marginTop: "6px",
                            gridColumn: "1 / -1",
                          }}
                        >
                          {validation.errors[field.name]}
                        </p>
                      )}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    style={{
                      padding: "10px",
                      border: `1px solid ${
                        validation.touched[field.name] &&
                        validation.errors[field.name]
                          ? "#ef4444"
                          : "#d1d5db"
                      }`,
                      borderRadius: "6px",
                      fontSize: "15px",
                      outline: "none",
                      width: "100%",
                      textTransform:
                        field.name === "name" ? "capitalize" : "none",
                      transition: "border-color 0.2s",
                      backgroundColor: "#ffffff",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border = "1px solid #3b82f6")
                    }
                    onBlur={(e) => {
                      e.target.style.border = `1px solid ${
                        validation.touched[field.name] &&
                        validation.errors[field.name]
                          ? "#ef4444"
                          : "#d1d5db"
                      }`;
                      validation.handleBlur(e);
                    }}
                    onChange={validation.handleChange}
                    value={validation.values[field.name] || ""}
                  />
                )}
                {validation.touched[field.name] &&
                  validation.errors[field.name] && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {validation.errors[field.name]}
                    </p>
                  )}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "20px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
            }}
          >
            <label
              style={{
                fontSize: "15px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Center Access
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              {centers?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    name="centerAccess"
                    value={item._id}
                    checked={validation.values.centerAccess?.includes(item._id)}
                    onChange={validation.handleChange}
                    style={{
                      marginRight: "10px",
                      width: "18px",
                      height: "18px",
                    }}
                  />
                  <label
                    style={{
                      fontSize: "15px",
                      color: "#374151",
                    }}
                  >
                    {item.title}
                  </label>
                </div>
              ))}
              {validation.touched.centerAccess &&
                validation.errors.centerAccess && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "13px",
                      marginTop: "6px",
                      gridColumn: "1 / -1",
                    }}
                  >
                    {validation.errors.centerAccess}
                  </p>
                )}
            </div>
          </div>

          {(validation.values.role === "DOCTOR" ||
            validation.values.role === "COUNSELLOR") && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Signature
                </label>
                {cropSignature ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <img
                      src={cropSignature.dataURI}
                      alt="Signature"
                      style={{ maxWidth: "250px", height: "auto" }}
                    />
                    <button
                      type="button"
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#dc2626")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ef4444")
                      }
                      onClick={() => setCropSignature(null)}
                    >
                      Clear Signature
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    style={{
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "15px",
                      outline: "none",
                      width: "100%",
                      backgroundColor: "#ffffff",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border = "1px solid #3b82f6")
                    }
                    onBlur={(e) =>
                      (e.target.style.border = "1px solid #d1d5db")
                    }
                    onChange={onSignatureChange}
                  />
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Patient Concerns
                </label>
                <CreatableSelect
                  isMulti
                  name="patientsConcern"
                  options={options}
                  classNamePrefix="react-select"
                  onChange={handleChange}
                  onCreateOption={handleCreate}
                  value={validation.values.patientsConcern || []}
                />
                {validation.touched.patientsConcern &&
                  validation.errors.patientsConcern && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {validation.errors.patientsConcern}
                    </p>
                  )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Degrees
                </label>
                <input
                  type="text"
                  name="degrees"
                  placeholder="Enter degrees"
                  style={{
                    padding: "10px",
                    border: `1px solid ${
                      validation.touched.degrees && validation.errors.degrees
                        ? "#ef4444"
                        : "#d1d5db"
                    }`,
                    borderRadius: "6px",
                    fontSize: "15px",
                    outline: "none",
                    width: "100%",
                    backgroundColor: "#ffffff",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
                  onBlur={(e) => {
                    e.target.style.border = `1px solid ${
                      validation.touched.degrees && validation.errors.degrees
                        ? "#ef4444"
                        : "#d1d5db"
                    }`;
                    validation.handleBlur(e);
                  }}
                  onChange={validation.handleChange}
                  value={validation.values.degrees || ""}
                />
                {validation.touched.degrees && validation.errors.degrees && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "13px",
                      marginTop: "6px",
                    }}
                  >
                    {validation.errors.degrees}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Languages Spoken
                </label>
                <CreatableSelect
                  isMulti
                  name="languages"
                  options={languages}
                  classNamePrefix="react-select"
                  onChange={handleLanChange}
                  onCreateOption={handleLanCreate}
                  value={validation.values.languages || []}
                />
                {validation.touched.languages &&
                  validation.errors.languages && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {validation.errors.languages}
                    </p>
                  )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Speciality
                </label>
                <input
                  type="text"
                  name="speciality"
                  placeholder="Enter speciality"
                  style={{
                    padding: "10px",
                    border: `1px solid ${
                      validation.touched.speciality &&
                      validation.errors.speciality
                        ? "#ef4444"
                        : "#d1d5db"
                    }`,
                    borderRadius: "6px",
                    fontSize: "15px",
                    outline: "none",
                    width: "100%",
                    backgroundColor: "#ffffff",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
                  onBlur={(e) => {
                    e.target.style.border = `1px solid ${
                      validation.touched.speciality &&
                      validation.errors.speciality
                        ? "#ef4444"
                        : "#d1d5db"
                    }`;
                    validation.handleBlur(e);
                  }}
                  onChange={validation.handleChange}
                  value={validation.values.speciality || ""}
                />
                {validation.touched.speciality &&
                  validation.errors.speciality && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {validation.errors.speciality}
                    </p>
                  )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNo"
                  placeholder="Enter registration number"
                  style={{
                    padding: "10px",
                    border: `1px solid ${
                      validation.touched.registrationNo &&
                      validation.errors.registrationNo
                        ? "#ef4444"
                        : "#d1d5db"
                    }`,
                    borderRadius: "6px",
                    fontSize: "15px",
                    outline: "none",
                    width: "100%",
                    backgroundColor: "#ffffff",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
                  onBlur={(e) => {
                    e.target.style.border = `1px solid ${
                      validation.touched.registrationNo &&
                      validation.errors.registrationNo
                        ? "#ef4444"
                        : "#d1d5db"
                    }`;
                    validation.handleBlur(e);
                  }}
                  onChange={validation.handleChange}
                  value={validation.values.registrationNo || ""}
                />
                {validation.touched.registrationNo &&
                  validation.errors.registrationNo && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {validation.errors.registrationNo}
                    </p>
                  )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  placeholder="Enter bio"
                  style={{
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "15px",
                    outline: "none",
                    width: "100%",
                    minHeight: "120px",
                    backgroundColor: "#ffffff",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid #d1d5db";
                    validation.handleBlur(e);
                  }}
                  onChange={validation.handleChange}
                  value={validation.values.bio || ""}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Expertise
                </label>
                <CreatableSelect
                  isMulti
                  name="expertise"
                  options={expertise}
                  classNamePrefix="react-select"
                  onChange={handleExpertiseChange}
                  onCreateOption={handleExpertiseCreate}
                  value={validation.values.expertise || []}
                />
                {validation.touched.expertise &&
                  validation.errors.expertise && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {validation.errors.expertise}
                    </p>
                  )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Years of Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  placeholder="Enter years of experience"
                  style={{
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "15px",
                    outline: "none",
                    width: "100%",
                    backgroundColor: "#ffffff",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid #d1d5db";
                    validation.handleBlur(e);
                  }}
                  onChange={validation.handleChange}
                  value={validation.values.experience || ""}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <label
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  FAQs
                </label>
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      padding: "20px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "15px",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Question
                      </label>
                      <input
                        type="text"
                        name="question"
                        placeholder="Enter question"
                        style={{
                          padding: "10px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "15px",
                          outline: "none",
                          width: "100%",
                          backgroundColor: "#ffffff",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) =>
                          (e.target.style.border = "1px solid #3b82f6")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "1px solid #d1d5db")
                        }
                        onChange={(e) => handleFaqChange(i, e)}
                        value={faq.question || ""}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "15px",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Answer
                      </label>
                      <textarea
                        name="answer"
                        placeholder="Enter answer"
                        style={{
                          padding: "10px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "15px",
                          outline: "none",
                          width: "100%",
                          minHeight: "100px",
                          backgroundColor: "#ffffff",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) =>
                          (e.target.style.border = "1px solid #3b82f6")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "1px solid #d1d5db")
                        }
                        onChange={(e) => handleFaqChange(i, e)}
                        value={faq.answer || ""}
                      />
                    </div>
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#dc2626")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#ef4444")
                        }
                        onClick={() =>
                          setFaqs(faqs.filter((_, index) => index !== i))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    alignSelf: "flex-start",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2563eb")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#3b82f6")
                  }
                  onClick={() =>
                    setFaqs([...faqs, { question: "", answer: "" }])
                  }
                >
                  Add FAQ
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "16px",
            }}
          >
            <button
              type="button"
              style={{
                padding: "10px 20px",
                backgroundColor: "#e5e7eb",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#d1d5db")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#e5e7eb")
              }
              onClick={cancelForm}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#3b82f6")
              }
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UserForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleForm: PropTypes.func.isRequired,
  userData: PropTypes.object,
  setUserData: PropTypes.func.isRequired,
};

export default UserForm;
