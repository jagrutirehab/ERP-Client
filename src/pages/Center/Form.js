import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  FormGroup,
} from "reactstrap";
import RenderWhen from "../../Components/Common/RenderWhen";
import Dropzone from "react-dropzone";
import Select from "react-select";
import { cities } from "../../Components/constants/cities";

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";
// Import FilePond styles
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

import PreviewFile from "../../Components/Common/PreviewFile";
import DeleteModal from "../../Components/Common/DeleteModal";
import FileCard from "../../Components/Common/FileCard";
import Divider from "../../Components/Common/Divider";

//redux
import { connect, useDispatch } from "react-redux";
import {
  addCenter,
  createEditCenter,
  removeCenterLogo,
  updateCenter,
} from "../../store/actions";
import MyEditor from "./Editor";
import dataURLtoBlob from "../../utils/convertToBlob";

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

const HandleLogo = ({ id, logoId, files }) => {
  const dispatch = useDispatch();

  //get file
  const [file, setFile] = useState({
    img: null,
    isOpen: false,
  });

  //delete file
  const [deleteFile, setDeleteFile] = useState({
    img: null,
    isOpen: false,
  });

  //delete file modal functions
  const deleteLogoPermanently = () => {
    dispatch(removeCenterLogo({ id, logoId, fileId: deleteFile.img._id }));
    setDeleteFile({ img: null, isOpen: false });
  };
  const onClose = () => {
    setDeleteFile({ img: null, isOpen: false });
  };

  //file card functions
  const getDeleteFile = (img) => {
    setDeleteFile({
      img: img,
      isOpen: true,
    });
  };
  const onPreview = (img) => {
    setFile({
      img,
      isOpen: true,
    });
  };

  return (
    <Row className="row-gap-3">
      <Col xs={12}>
        <div className="d-flex align-items-center gap-3">
          <h6 className="display-6 fs-5 text-nowrap">Uploaded Logo</h6>
          <Divider />
        </div>
      </Col>
      {(files || []).map((file) => (
        <Col xs={12} md={4}>
          <FileCard
            file={file}
            showDeleteButton
            onDelete={getDeleteFile}
            onPreview={onPreview}
          />
        </Col>
      ))}
      <PreviewFile
        file={file.img}
        isOpen={file.isOpen}
        toggle={() => setFile({ img: null, isOpen: false })}
      />
      <DeleteModal
        onDeleteClick={deleteLogoPermanently}
        onCloseClick={onClose}
        show={deleteFile.isOpen}
      />
    </Row>
  );
};

const CenterForm = ({ author, isOpen, centerData }) => {
  const dispatch = useDispatch();

  const [logo, setLogo] = useState();
  const [cropLogo, setCrop] = useState();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      title: centerData ? centerData.title : "",
      name: centerData ? centerData.name : "",
      address: centerData ? centerData.address : "",
      bankName: centerData ? centerData.bankName : "",
      accountHolderName: centerData ? centerData.accountHolderName : "",
      accountNumber: centerData ? centerData.accountNumber : "",
      branchName: centerData ? centerData.branchName : "",
      numbers: centerData ? centerData.numbers : "",
      centerName: centerData ? centerData.centerName : "",
      city: centerData ? centerData.city?.city : "",
      state: centerData ? centerData.city?.state : "",
      localArea: centerData ? centerData.localArea : "",
      numberOfBeds: centerData ? centerData.numberOfBeds : "",
      websiteListing: centerData ? !!centerData.websiteListing : false,
      globalAccess: centerData ? !!centerData.globalAccess : false,
      apiKey: centerData ? centerData.apiKey : "",
      // Pine Labs POS for this centre. Merchant and store identify the centre;
      // each physical machine is a row in pineLabsTerminals, told apart by its
      // Client ID. The security token is never sent back by the API, so it
      // starts blank on edit and is only written when the user types a new one.
      pineLabsEnabled: centerData ? !!centerData.pineLabs?.enabled : false,
      pineLabsMerchantId: centerData ? centerData.pineLabs?.merchantId || "" : "",
      pineLabsSecurityToken: "",
      pineLabsStoreId: centerData ? centerData.pineLabs?.storeId || "" : "",
      pineLabsTerminals: centerData?.pineLabs?.terminals?.length
        ? centerData.pineLabs.terminals.map((t) => ({
            _id: t._id,
            label: t.label || "",
            clientId: t.clientId || "",
            isDefault: !!t.isDefault,
            active: t.active !== false,
            autoCancelDurationInMinutes: t.autoCancelDurationInMinutes ?? 5,
          }))
        : [],
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required("Center title is required")
        .matches(/^\S*$/, "Should not contain spaces"),
      name: Yup.string().required("Center name is required"),
      address: Yup.string().required("Center address is required"),
      bankName: Yup.string().required("Center bank name is required"),
      accountHolderName: Yup.string().required(
        "Center account holder nam is required"
      ),
      accountNumber: Yup.string().required("Center account number is required"),
      branchName: Yup.string().required("Center branch name is required"),
      numbers: Yup.string().required("Center contact number(s) are required"),
      numberOfBeds: Yup.number().required("Number of beds are required"),
    }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("name", values.name);
      formData.append("address", values.address);
      formData.append("bankName", values.bankName);
      formData.append("accountHolderName", values.accountHolderName);
      formData.append("accountNumber", values.accountNumber);
      formData.append("branchName", values.branchName);
      formData.append("numbers", values.numbers);
      formData.append("city", values.city);
      formData.append("state", values.state);
      formData.append("localArea", values.localArea);
      formData.append("numberOfBeds", values.numberOfBeds);
      formData.append(
        "websiteListing",
        values.websiteListing ? "true" : "false"
      );
      formData.append(
        "globalAccess",
        values.globalAccess ? "true" : "false"
      );
      formData.append("apiKey", values.apiKey);
      // Sent as JSON; the centre controller writes each key individually so a
      // blank security token leaves the stored one alone.
      formData.append(
        "pineLabs",
        JSON.stringify({
          enabled: values.pineLabsEnabled,
          merchantId: values.pineLabsMerchantId,
          securityToken: values.pineLabsSecurityToken,
          storeId: values.pineLabsStoreId,
          terminals: values.pineLabsTerminals,
        })
      );
      // if (cropLogo) formData.append("logo", dataURLtoBlob(cropLogo));
      if (cropLogo) formData.append("logo", cropLogo);

      if (centerData) {
        formData.append("id", centerData._id);
        dispatch(updateCenter(formData));
      } else {
        formData.append("author", author._id);
        dispatch(addCenter(formData));
      }
      closeForm();
    },
  });

  // console.log({ validation });

  // Pine Labs fields get their own labelled block below rather than the
  // auto-generated grid.
  const fieldsArray = Object.keys(validation.values).filter(
    (key) =>
      !["state", "websiteListing", "globalAccess"].includes(key) &&
      !key.startsWith("pineLabs")
  );

  // --- Pine Labs POS machines ---
  const terminalsValue = validation.values.pineLabsTerminals || [];

  const setTerminals = (next) =>
    validation.setFieldValue("pineLabsTerminals", next);

  const updateTerminal = (idx, patch) => {
    const next = [...terminalsValue];
    next[idx] = { ...next[idx], ...patch };
    setTerminals(next);
  };

  const addTerminal = () =>
    setTerminals([
      ...terminalsValue,
      {
        label: "",
        clientId: "",
        // The first machine added is the default; later ones are not.
        isDefault: terminalsValue.length === 0,
        active: true,
        autoCancelDurationInMinutes: 5,
      },
    ]);

  const removeTerminal = (idx) => {
    const next = terminalsValue.filter((_, i) => i !== idx);
    // Never leave the centre without a default to fall back on.
    const needsDefault = next.length && !next.some((t) => t.isDefault);
    setTerminals(
      needsDefault
        ? next.map((t, i) => (i === 0 ? { ...t, isDefault: true } : t))
        : next
    );
  };

  const setDefaultTerminal = (idx) =>
    setTerminals(
      terminalsValue.map((t, i) => ({ ...t, isDefault: i === idx }))
    );
  function getFieldLabel(field) {
    const words = field.replace(/([A-Z])/g, " $1").trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  // console.log({ fieldsArray });

  const closeForm = () => {
    validation.resetForm();
    dispatch(createEditCenter({ data: null, isOpen: false }));
    setLogo("");
    setCrop("");
  };

  // useEffect(() => {
  //   const newCities = cities.map((city) => {
  //     return {
  //       city: city.city,
  //       state: city.state,
  //       value: `${city.city.toLowerCase()} - ${city.state.toLowerCase()}`,
  //       label: `${city.city} - ${city.state}`,
  //     };
  //   });

  //   const blob = new Blob([JSON.stringify(newCities, null, 2)], {
  //     type: "application/json",
  //   });

  //   // Create a download link
  //   const a = document.createElement("a");
  //   a.href = URL.createObjectURL(blob);
  //   a.download = "cities.json"; // File name
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // }, []);

  function handleAcceptedFiles(files) {
    const file = files[0];
    if (!file) return;
    if (!file.type.includes("image")) {
      // alert("Only image files are allowed!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);

    // const reader = new FileReader();
    // reader.addEventListener("load", () => {
    //   const imageElement = new Image();
    //   const imageUrl = reader.result?.toString() || "";
    //   imageElement.src = imageUrl;

    //   imageElement.addEventListener("load", (e) => {
    //     const { naturalWidth, naturalHeight } = e.currentTarget;
    //     if (naturalWidth < 200 || naturalHeight < 200) {
    //       // setError("Image must be at least 150 x 150 pixels.");
    //       return setLogo("");
    //     }
    //   });
    //   setLogo(imageUrl);
    // });
    // reader.readAsDataURL(file);
  }

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} centered size="xl">
        <ModalHeader toggle={closeForm}>Add new center</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
            action="#"
          >
            <Row>
              <Col xs={12}>
                {centerData?.logo && (
                  <HandleLogo
                    id={centerData?._id}
                    logoId={centerData?.logo?._id}
                    files={[centerData?.logo]}
                  />
                )}
              </Col>
              <Col xs={12}>
                {/* <RenderWhen isTrue={Boolean(logo) && !Boolean(cropLogo)}> */}
                <MyEditor
                  file={logo}
                  setLogo={setLogo}
                  setCropLogo={setCrop}

                // maxHeight={150}
                // maxWidth={150}
                // minHeight={150}
                // minWidth={150}
                />
                {/* </RenderWhen> */}
              </Col>
              <Col xs={12}>
                <RenderWhen isTrue={Boolean(cropLogo)}>
                  <div className="text-center mb-3">
                    <h6 className="display-6 fs-14">Logo</h6>
                    <img
                      src={cropLogo}
                      alt="Center Logo"
                      className="img-fluid border"
                      style={{ height: "200px" }}
                    />
                  </div>
                  <div className="text-center">
                    <Button onClick={() => setCrop("")} color="light">
                      Clear Logo
                    </Button>
                  </div>
                </RenderWhen>
              </Col>
              <Col xs={12}>
                {!centerData?.logo && !Boolean(cropLogo) && (
                  <Dropzone
                    onDrop={(acceptedFiles) => {
                      handleAcceptedFiles(acceptedFiles);
                    }}
                    multiple={false}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <div className="dropzone dz-clickable text-center">
                        <div
                          className="dz-message needsclick btn border-dashed border-secondary"
                          {...getRootProps()}
                        >
                          <input {...getInputProps()} />
                          {logo ? (
                            <img
                              src={logo}
                              alt="Preview"
                              style={{
                                width: "100%",
                                height: "150px",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div>
                              <div className="mb-3">
                                <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                              </div>
                              <h4>Drop Logo here or click to upload.</h4>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Dropzone>
                )}
                {/* {!centerData?.logo && (
                  <Card>
                    <CardHeader>
                      <h4 className="card-title mb-0">Upload Logo</h4>
                    </CardHeader>
                    <CardBody>
                      <FilePond
                        files={logo}
                        onupdatefiles={setLogo}
                        allowMultiple={false}
                        maxFiles={1}
                        name="files"
                        acceptedFileTypes={["image/*"]}
                        className="filepond filepond-input-multiple"
                      />
                    </CardBody>
                  </Card>
                )} */}
              </Col>
              {(fieldsArray || []).map((field, i) =>
                field === "numberOfBeds" ? (
                  <Col key={i + field} xs={12} lg={6}>
                    <div className="mb-3">
                      <Label htmlFor={field} className="form-label">
                        {getFieldLabel(field)}
                      </Label>
                      <Input
                        name={field}
                        // disabled={field === "title" && centerData}
                        className="form-control"
                        placeholder={`Enter ${getFieldLabel(field)}`}
                        type="number"
                        min={0}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values[field] || ""}
                        invalid={
                          validation.touched[field] && validation.errors[field]
                            ? true
                            : false
                        }
                      />
                      {validation.touched[field] && validation.errors[field] ? (
                        <FormFeedback type="invalid">
                          {validation.errors[field]}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                ) : field === "city" ? (
                  <Col xs={12} lg={6}>
                    <div className="mb-3">
                      <Label htmlFor="city" className="form-label">
                        City
                      </Label>
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isClearable
                        isSearchable
                        id="city"
                        name="city"
                        value={
                          cities.find(
                            (c) =>
                              c.city === validation.values.city &&
                              c.state === validation.values.state
                          ) || null
                        }
                        options={cities}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={(selectedOption) => {
                          if (selectedOption) {
                            validation.setFieldValue(
                              "city",
                              selectedOption.city
                            );
                            validation.setFieldValue(
                              "state",
                              selectedOption.state
                            );
                          } else {
                            validation.setFieldValue("city", "");
                            validation.setFieldValue("state", "");
                          }
                        }}
                      />
                      {validation.touched.city && validation.errors.city ? (
                        <FormFeedback type="invalid">
                          {validation.errors.city}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                ) : (
                  <Col key={i + field} xs={12} lg={6}>
                    <div className="mb-3">
                      <Label htmlFor={field} className="form-label">
                        {getFieldLabel(field)}
                      </Label>
                      <Input
                        name={field}
                        disabled={field === "title" && centerData}
                        className="form-control"
                        placeholder={`Enter ${getFieldLabel(field)}`}
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values[field] || ""}
                        invalid={
                          validation.touched[field] && validation.errors[field]
                            ? true
                            : false
                        }
                      />
                      {validation.touched[field] && validation.errors[field] ? (
                        <FormFeedback type="invalid">
                          {validation.errors[field]}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </Col>
                )
              )}
              <Col xs={12} className="mb-3">
                <FormGroup switch>
                  <Input
                    type="switch"
                    role="switch"
                    id="websiteListing"
                    name="websiteListing"
                    checked={validation.values.websiteListing}
                    onChange={(event) =>
                      validation.setFieldValue(
                        "websiteListing",
                        event.target.checked
                      )
                    }
                  />
                  <Label
                    check
                    className="form-check-label ms-2"
                    htmlFor="websiteListing"
                  >
                    Website Listing
                  </Label>
                </FormGroup>
              </Col>
              <Col xs={12} className="mb-3">
                <FormGroup switch>
                  <Input
                    type="switch"
                    role="switch"
                    id="globalAccess"
                    name="globalAccess"
                    checked={validation.values.globalAccess}
                    onChange={(event) =>
                      validation.setFieldValue(
                        "globalAccess",
                        event.target.checked
                      )
                    }
                  />
                  <Label
                    check
                    className="form-check-label ms-2"
                    htmlFor="globalAccess"
                  >
                    Global Access
                  </Label>
                </FormGroup>
              </Col>

              <Col xs={12}>
                <hr className="mt-1" />
                <h6 className="mb-1">Pine Labs POS Terminal</h6>
                <p className="text-muted fs-12">
                  Lets this centre charge card and UPI payments straight to its
                  POS machine. Credentials come from your Pine Labs onboarding
                  pack.
                </p>
              </Col>

              <Col xs={12} className="mb-3">
                <FormGroup switch>
                  <Input
                    type="switch"
                    role="switch"
                    id="pineLabsEnabled"
                    name="pineLabsEnabled"
                    checked={validation.values.pineLabsEnabled}
                    onChange={(event) =>
                      validation.setFieldValue(
                        "pineLabsEnabled",
                        event.target.checked
                      )
                    }
                  />
                  <Label
                    check
                    className="form-check-label ms-2"
                    htmlFor="pineLabsEnabled"
                  >
                    Enable POS payments for this centre
                  </Label>
                </FormGroup>
              </Col>

              {validation.values.pineLabsEnabled && (
                <>
                  <Col xs={12} lg={6}>
                    <div className="mb-3">
                      <Label htmlFor="pineLabsMerchantId" className="form-label">
                        Merchant ID
                      </Label>
                      <Input
                        id="pineLabsMerchantId"
                        name="pineLabsMerchantId"
                        className="form-control"
                        placeholder="From your Pine Labs onboarding pack"
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.pineLabsMerchantId || ""}
                      />
                    </div>
                  </Col>

                  <Col xs={12} lg={6}>
                    <div className="mb-3">
                      <Label
                        htmlFor="pineLabsSecurityToken"
                        className="form-label"
                      >
                        Security Token
                      </Label>
                      <Input
                        id="pineLabsSecurityToken"
                        name="pineLabsSecurityToken"
                        className="form-control"
                        placeholder={
                          centerData
                            ? "Leave blank to keep the saved token"
                            : "UUID from Pine Labs"
                        }
                        type="password"
                        autoComplete="new-password"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.pineLabsSecurityToken || ""}
                      />
                    </div>
                  </Col>

                  <Col xs={12} lg={6}>
                    <div className="mb-3">
                      <Label htmlFor="pineLabsStoreId" className="form-label">
                        Store ID
                      </Label>
                      <Input
                        id="pineLabsStoreId"
                        name="pineLabsStoreId"
                        className="form-control"
                        placeholder="Enter Store ID"
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.pineLabsStoreId || ""}
                      />
                    </div>
                  </Col>

                  <Col xs={12}>
                    <Label className="form-label mb-1">POS Machines</Label>
                    <p className="text-muted fs-12">
                      One row per physical machine at this centre. The Client ID
                      is the terminal serial — it is what sends a charge to one
                      counter rather than another. The default is pre-selected
                      for cashiers.
                    </p>

                    {(validation.values.pineLabsTerminals || []).map(
                      (terminal, idx) => (
                        <Row
                          key={terminal._id || idx}
                          className="align-items-end g-2 mb-2"
                        >
                          <Col xs={12} md={4}>
                            <Label className="form-label fs-12">
                              Machine Name
                            </Label>
                            <Input
                              bsSize="sm"
                              type="text"
                              placeholder="e.g. Reception counter"
                              value={terminal.label}
                              onChange={(e) =>
                                updateTerminal(idx, { label: e.target.value })
                              }
                            />
                          </Col>

                          <Col xs={12} md={4}>
                            <Label className="form-label fs-12">Client ID</Label>
                            <Input
                              bsSize="sm"
                              type="text"
                              placeholder="Terminal serial"
                              value={terminal.clientId}
                              onChange={(e) =>
                                updateTerminal(idx, { clientId: e.target.value })
                              }
                            />
                          </Col>

                          <Col xs={6} md={2}>
                            <Label className="form-label fs-12">
                              Auto-cancel
                            </Label>
                            <Input
                              bsSize="sm"
                              type="number"
                              min={1}
                              placeholder="min"
                              title="Minutes before Pine Labs cancels an unattended charge"
                              value={terminal.autoCancelDurationInMinutes ?? 5}
                              onChange={(e) =>
                                updateTerminal(idx, {
                                  autoCancelDurationInMinutes: e.target.value,
                                })
                              }
                            />
                          </Col>

                          <Col xs="auto">
                            <FormGroup check className="mb-2">
                              <Input
                                type="radio"
                                name="pineLabsDefaultTerminal"
                                id={`pineLabsDefault-${idx}`}
                                checked={!!terminal.isDefault}
                                onChange={() => setDefaultTerminal(idx)}
                              />
                              <Label
                                check
                                className="fs-12"
                                htmlFor={`pineLabsDefault-${idx}`}
                              >
                                Default
                              </Label>
                            </FormGroup>
                          </Col>

                          <Col xs="auto">
                            <FormGroup switch className="mb-2">
                              <Input
                                type="switch"
                                role="switch"
                                id={`pineLabsActive-${idx}`}
                                checked={terminal.active !== false}
                                onChange={(e) =>
                                  updateTerminal(idx, {
                                    active: e.target.checked,
                                  })
                                }
                              />
                              <Label
                                check
                                className="fs-12 ms-1"
                                htmlFor={`pineLabsActive-${idx}`}
                              >
                                In use
                              </Label>
                            </FormGroup>
                          </Col>

                          <Col xs="auto">
                            <Button
                              size="sm"
                              outline
                              color="danger"
                              type="button"
                              className="mb-2"
                              onClick={() => removeTerminal(idx)}
                              title="Remove this machine"
                            >
                              <i className="ri-close-circle-line"></i>
                            </Button>
                          </Col>
                        </Row>
                      )
                    )}

                    <Button
                      size="sm"
                      outline
                      color="primary"
                      type="button"
                      className="mt-1 mb-3"
                      onClick={addTerminal}
                    >
                      <i className="ri-add-line me-1"></i>
                      Add machine
                    </Button>
                  </Col>
                </>
              )}
              {/* 
              <Col xs={12} lg={6}>
                <div className="mb-3">
                  <Label htmlFor={"local-area"} className="form-label">
                    Local Area
                  </Label>
                  <Input
                    name={"localArea"}
                    className="form-control"
                    placeholder={`Enter Local area`}
                    type="text"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.localArea || ""}
                    invalid={
                      validation.touched.localArea &&
                      validation.errors.localArea
                        ? true
                        : false
                    }
                    id="local-area"
                  />
                  {validation.touched.localArea &&
                  validation.errors.localArea ? (
                    <FormFeedback type="invalid">
                      {validation.errors.localArea}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col> */}
              <Col xs={12}>
                <div className="d-flex align-items-center justify-content-end gap-3">
                  <Button type="submit" size="sm" color="primary" outline>
                    Save
                  </Button>
                  <Button onClick={closeForm} size="sm" color="danger">
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

const mapStateToProps = (state) => ({
  author: state.User.user,
  centerData: state.Center.createEditCenter?.data,
  isOpen: state.Center.createEditCenter?.isOpen,
});

CenterForm.prototype = {
  author: PropTypes.object.isRequired,
  centerData: PropTypes.object,
  isOpen: PropTypes.bool,
};

export default connect(mapStateToProps)(CenterForm);
