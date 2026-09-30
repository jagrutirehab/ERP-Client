import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Label,
  Input,
  FormFeedback,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  getItemTypes,
  getItemCategories,
  getItemMasters,
  getUoms,
  getVendors,
  createItemMaster,
  updateItemMaster,
  uploadItemImage,
  deleteItemImage,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import FormSectionLabel from "../shared/FormSectionLabel";
import COUNTRIES from "../shared/countries";
import "../shared/itemMasterForms.scss";

const CATEGORY_LEVELS = [
  { key: "l1Category", level: 1, label: "L1 Category", required: true },
  { key: "l2Category", level: 2, label: "L2 Category", required: false },
  { key: "l3Category", level: 3, label: "L3 Category", required: false },
  { key: "l4Category", level: 4, label: "L4 Category", required: false },
];

const FORM_TABS = [
  { key: "general", label: "General Data", icon: "bx-layer" },
  { key: "inventory", label: "Inventory & Planning", icon: "bx-box" },
  { key: "traceability", label: "Traceability & Control", icon: "bx-pulse" },
  { key: "attributes", label: "Attributes & Media", icon: "bx-cog" },
];

const numOrBlank = (n) => (n === 0 || n === undefined || n === null ? "" : n);
const parseNum = (raw) => (raw === "" ? 0 : Number(raw));

const ItemMasterForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [activeTab, setActiveTab] = useState("general");

  const [itemTypes, setItemTypes] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [catOptions, setCatOptions] = useState({
    l1: [],
    l2: [],
    l3: [],
    l4: [],
  });

  const [codeStatus, setCodeStatus] = useState("idle");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [images, setImages] = useState(editingItem?.productImages || []);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAutoCode, setIsAutoCode] = useState(!editingItem);
  const [hierarchyType, setHierarchyType] = useState(
    editingItem?.parentItemId ? "child" : "parent",
  );
  const [parentItemOptions, setParentItemOptions] = useState([]);

  const validation = useFormik({
    initialValues: {
      itemName: editingItem?.itemName || "",
      itemCode: editingItem?.itemCode || "",
      itemTypeId: editingItem?.itemTypeId || "",
      subTypeId: editingItem?.subTypeId || "",
      subType: editingItem?.subType || "",
      l1Category: editingItem?.l1Category || "",
      l2Category: editingItem?.l2Category || "",
      l3Category: editingItem?.l3Category || "",
      l4Category: editingItem?.l4Category || "",
      longDescription: editingItem?.longDescription || "",
      uomId: editingItem?.uomId || "",
      brand: editingItem?.brand || "",
      basePrice: editingItem?.basePrice ?? 0,
      parentItemId: editingItem?.parentItemId || "",

      stockThresholds: {
        minLevel: editingItem?.stockThresholds?.minLevel ?? 0,
        maxLevel: editingItem?.stockThresholds?.maxLevel ?? 0,
        safetyStock: editingItem?.stockThresholds?.safetyStock ?? 0,
      },
      planning: {
        reorderQty: editingItem?.planning?.reorderQty ?? 0,
        leadTimeDays: editingItem?.planning?.leadTimeDays ?? 0,
        inventoryClass: editingItem?.planning?.inventoryClass || "",
        allowInvoiceWithoutStock:
          editingItem?.planning?.allowInvoiceWithoutStock || false,
      },
      usageMetrics: {
        avgDailyUsage: editingItem?.usageMetrics?.avgDailyUsage ?? 0,
      },

      procurementInfo: {
        defaultVendorId: editingItem?.procurementInfo?.defaultVendorId || "",
        manufacturerName: editingItem?.procurementInfo?.manufacturerName || "",
        mpn: editingItem?.procurementInfo?.mpn || "",
        countryOfOrigin: editingItem?.procurementInfo?.countryOfOrigin || "",
      },
      controls: {
        taggableAsset: editingItem?.controls?.taggableAsset || false,
        serializable: editingItem?.controls?.serializable || false,
        batchTracked: editingItem?.controls?.batchTracked || false,
        hazardousMaterial: editingItem?.controls?.hazardousMaterial || false,
        maintainable: editingItem?.controls?.maintainable || false,
        inspectionRequired: editingItem?.controls?.inspectionRequired || false,
      },
      hsnSacCode: editingItem?.hsnSacCode || "",
      glAccounts: {
        costGlAccount: editingItem?.glAccounts?.costGlAccount || "",
        depreciationGlAccount:
          editingItem?.glAccounts?.depreciationGlAccount || "",
        accumulatedDepreciationGlAccount:
          editingItem?.glAccounts?.accumulatedDepreciationGlAccount || "",
      },

      customAttributes:
        editingItem?.customAttributes?.map((a) => ({
          key: a.key,
          dataType: a.dataType || "text",
          value: a.value || "",
          options: a.options || [],
        })) || [],
      productImages: editingItem?.productImages || [],
    },
    validationSchema: Yup.object({
      itemName: Yup.string().trim().required("Item name is required"),
      basePrice: Yup.number().typeError("Base price must be a number").min(0),
    }),
    onSubmit: async (values) => {
      if (!editingItem && codeStatus === "taken") {
        toast.error("This item code is already in use. Please choose another.");
        return;
      }
      try {
        const idFields = [
          "itemTypeId",
          "subTypeId",
          "l1Category",
          "l2Category",
          "l3Category",
          "l4Category",
          "uomId",
          "parentItemId",
        ];
        const payload = { ...values };
        idFields.forEach((f) => {
          if (!payload[f]) delete payload[f];
        });
        if (!payload.itemCode) delete payload.itemCode;
        if (
          payload.procurementInfo &&
          !payload.procurementInfo.defaultVendorId
        ) {
          delete payload.procurementInfo.defaultVendorId;
        }
        if (payload.planning && !payload.planning.inventoryClass) {
          delete payload.planning.inventoryClass;
        }
        // delete payload.uomId; // plain text for now — not a real ObjectId until UOM picker exists
        delete payload.productImages;

        if (editingItem) {
          await updateItemMaster(editingItem._id, payload);
          toast.success("Item updated successfully");
        } else {
          const res = await createItemMaster(payload);
          const newItemId = res?.data?._id;

          if (newItemId && stagedFiles.length > 0) {
            for (const staged of stagedFiles) {
              try {
                const formData = new FormData();
                formData.append("file", staged.file);
                await uploadItemImage(newItemId, formData);
              } catch {}
            }
          }
          toast.success("Item created successfully");
        }
        onSaved();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong",
          );
        }
      }
    },
  });

  const v = validation.values;

  const fetchNextCode = async () => {
    const res = await getItemMasters({ page: 1, limit: 1 });
    const total = res?.pagination?.total || 0;
    return `JRC-${String(total + 1).padStart(3, "0")}`;
  };

  useEffect(() => {
    if (editingItem) return;
    (async () => {
      try {
        const code = await fetchNextCode();
        validation.setFieldValue("itemCode", code);
        setIsAutoCode(true);
      } catch {
        // ignore — user can type manually
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getItemTypes({})
      .then((res) => setItemTypes(res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getItemMasters({ limit: 1000 })
      .then((res) => {
        const list = (res?.data || []).filter(
          (it) => it._id !== editingItem?._id,
        );
        setParentItemOptions(list);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getUoms({})
      .then((res) => setUoms(res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getVendors({})
      .then((res) => setVendors(res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getItemCategories({ level: 1 })
      .then((res) => setCatOptions((p) => ({ ...p, l1: res?.data || [] })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!v.l1Category) {
      setCatOptions((p) => ({ ...p, l2: [] }));
      return;
    }
    getItemCategories({ level: 2, parentCategoryId: v.l1Category })
      .then((res) => setCatOptions((p) => ({ ...p, l2: res?.data || [] })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.l1Category]);

  useEffect(() => {
    if (!v.l2Category) {
      setCatOptions((p) => ({ ...p, l3: [] }));
      return;
    }
    getItemCategories({ level: 3, parentCategoryId: v.l2Category })
      .then((res) => setCatOptions((p) => ({ ...p, l3: res?.data || [] })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.l2Category]);

  useEffect(() => {
    if (!v.l3Category) {
      setCatOptions((p) => ({ ...p, l4: [] }));
      return;
    }
    getItemCategories({ level: 4, parentCategoryId: v.l3Category })
      .then((res) => setCatOptions((p) => ({ ...p, l4: res?.data || [] })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.l3Category]);

  useEffect(() => {
    if (editingItem) return;
    const code = v.itemCode.trim();
    if (!code) {
      setCodeStatus("idle");
      return;
    }
    setCodeStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await getItemMasters({ search: code, limit: 50 });
        const taken = (res?.data || []).some(
          (item) => (item.itemCode || "").toLowerCase() === code.toLowerCase(),
        );
        setCodeStatus(taken ? "taken" : "available");
      } catch {
        setCodeStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.itemCode]);

  const handleCategoryChange = (levelKey, value) => {
    const order = ["l1Category", "l2Category", "l3Category", "l4Category"];
    const idx = order.indexOf(levelKey);
    const resetFields = {};
    order.slice(idx + 1).forEach((k) => (resetFields[k] = ""));
    validation.setValues({
      ...validation.values,
      [levelKey]: value,
      ...resetFields,
    });
  };

  const selectedType = itemTypes.find((t) => t._id === v.itemTypeId);
  const subTypeOptions = selectedType?.subTypes || [];

  const handleItemTypeChange = (id) => {
    validation.setValues({
      ...validation.values,
      itemTypeId: id,
      subTypeId: "",
      subType: "",
    });
  };
  const handleSubTypeChange = (id) => {
    const st = subTypeOptions.find((s) => s._id === id);
    validation.setValues({
      ...validation.values,
      subTypeId: id,
      subType: st?.name || "",
    });
  };

  const setNested = (path, value) => {
    const keys = path.split(".");
    const updated = { ...validation.values };
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    validation.setValues(updated);
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create mode: no item id exists yet, so just stage it locally with a preview.
    // Actual upload happens right after the item is created (see onSubmit).
    if (!editingItem) {
      const previewUrl = URL.createObjectURL(file);
      setStagedFiles((prev) => [...prev, { file, previewUrl }]);
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadItemImage(editingItem._id, formData);
      setImages(res?.data?.productImages || []);
      toast.success("Image uploaded successfully");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message || error?.message || "Upload failed",
        );
      }
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeStagedFile = (idx) => {
    setStagedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const handleImageDelete = async (imageId) => {
    try {
      const res = await deleteItemImage(editingItem._id, imageId);
      setImages(res?.data?.productImages || []);
      toast.success("Image deleted");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message || error?.message || "Delete failed",
        );
      }
    }
  };
  const addCustomAttribute = () => {
    validation.setFieldValue("customAttributes", [
      ...v.customAttributes,
      { key: "", dataType: "text", value: "", options: [] },
    ]);
  };
  const removeCustomAttribute = (idx) => {
    validation.setFieldValue(
      "customAttributes",
      v.customAttributes.filter((_, i) => i !== idx),
    );
  };
  const updateCustomAttribute = (idx, field, value) => {
    validation.setFieldValue(
      "customAttributes",
      v.customAttributes.map((a, i) =>
        i === idx ? { ...a, [field]: value } : a,
      ),
    );
  };
  const changeAttributeDataType = (idx, dataType) => {
    // reset value/options when switching type, so stale data doesn't linger
    validation.setFieldValue(
      "customAttributes",
      v.customAttributes.map((a, i) =>
        i === idx
          ? {
              ...a,
              dataType,
              value: dataType === "checkbox" ? "false" : "",
              options: [],
            }
          : a,
      ),
    );
  };
  const addAttributeOption = (idx, optionText) => {
    const trimmed = optionText.trim();
    if (!trimmed) return;
    validation.setFieldValue(
      "customAttributes",
      v.customAttributes.map((a, i) =>
        i === idx && !(a.options || []).includes(trimmed)
          ? { ...a, options: [...(a.options || []), trimmed] }
          : a,
      ),
    );
  };
  const removeAttributeOption = (idx, opt) => {
    validation.setFieldValue(
      "customAttributes",
      v.customAttributes.map((a, i) =>
        i === idx
          ? { ...a, options: (a.options || []).filter((o) => o !== opt) }
          : a,
      ),
    );
  };

  const renderAttributeValueInput = (a, idx) => {
    switch (a.dataType) {
      case "number":
        return (
          <Input
            type="number"
            bsSize="sm"
            placeholder="Enter value"
            value={a.value}
            onChange={(e) =>
              updateCustomAttribute(idx, "value", e.target.value)
            }
          />
        );
      case "select":
        return (
          <Input
            type="select"
            bsSize="sm"
            value={a.value}
            onChange={(e) =>
              updateCustomAttribute(idx, "value", e.target.value)
            }
          >
            <option value="">Select...</option>
            {(a.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Input>
        );
      case "checkbox":
        return (
          <label
            className="im-checkbox-row"
            style={{ display: "inline-flex", width: "auto" }}
          >
            <input
              type="checkbox"
              checked={a.value === "true"}
              onChange={(e) =>
                updateCustomAttribute(
                  idx,
                  "value",
                  e.target.checked ? "true" : "false",
                )
              }
            />
            <span className="small mb-0">Yes</span>
          </label>
        );
      case "radio":
        return (
          <div className="d-flex gap-3 flex-wrap">
            {(a.options || []).length === 0 && (
              <span className="text-muted small">Add options below first</span>
            )}
            {(a.options || []).map((opt) => (
              <label
                key={opt}
                className="d-flex align-items-center gap-1 small mb-0"
              >
                <input
                  type="radio"
                  name={`attr-radio-${idx}`}
                  checked={a.value === opt}
                  onChange={() => updateCustomAttribute(idx, "value", opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        );
      default:
        return (
          <Input
            bsSize="sm"
            placeholder="Enter value"
            value={a.value}
            onChange={(e) =>
              updateCustomAttribute(idx, "value", e.target.value)
            }
          />
        );
    }
  };

  const handleItemCodeChange = (e) => {
    setIsAutoCode(false);
    validation.setFieldValue("itemCode", e.target.value);
  };

  const handleRegenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const code = await fetchNextCode();
      validation.setFieldValue("itemCode", code);
      setIsAutoCode(true);
    } catch {
      toast.error("Could not generate a code. Please enter one manually.");
    } finally {
      setGeneratingCode(false);
    }
  };

  return (
    <div className="im-surface">
      <div className="im-page-header">
        <div className="d-flex gap-3">
          {/* <div className="im-icon-badge">
            <i className="bx bx-box"></i>
          </div> */}
          <div className="im-page-title">
            <h4>{editingItem ? "Edit Item" : "Create Item"}</h4>
            <p>Add new item with details and attributes</p>
          </div>
        </div>
        <Button color="light" outline onClick={onCancel}>
          <i className="bx bx-arrow-back me-1"></i> Back
        </Button>
      </div>

      <div className="im-panel">
        <p className="im-required-note mb-4">
          Fields marked with <span className="text-danger">*</span> are
          required.
        </p>

        <form onSubmit={validation.handleSubmit}>
          <Row className="mb-4">
            <Col md={3}>
              <div className="im-label-row">
                <Label>
                  Item Code / ID <span className="text-danger">*</span>
                </Label>
              </div>
              <div className="im-code-input-group">
                <div className="im-code-input-wrap">
                  <i className="bx bx-hash"></i>
                  <Input
                    name="itemCode"
                    value={v.itemCode}
                    placeholder="Enter or generate a code"
                    disabled={!!editingItem}
                    onChange={handleItemCodeChange}
                  />
                </div>
                {!editingItem && (
                  <button
                    type="button"
                    className="im-magic-btn"
                    onClick={handleRegenerateCode}
                    disabled={generatingCode}
                    title="Generate next available code"
                  >
                    <i
                      className={`bx ${generatingCode ? "bx-loader-alt bx-spin" : "bx-refresh"}`}
                    ></i>
                  </button>
                )}
              </div>

              {!editingItem && codeStatus === "checking" && (
                <div className="im-code-hint manual">
                  <i className="bx bx-loader-alt bx-spin"></i> Checking...
                </div>
              )}
              {!editingItem && codeStatus === "available" && (
                <div className="im-code-hint auto">
                  <i className="bx bx-check-circle"></i>
                  {isAutoCode ? "Available (auto-generated)" : "Available"}
                </div>
              )}
              {!editingItem && codeStatus === "taken" && (
                <div className="im-code-hint error">
                  <i className="bx bx-x-circle"></i> Already in use
                </div>
              )}
            </Col>

            <Col md={6}>
              <Label>
                Item Name / Short Description{" "}
                <span className="text-danger">*</span>
              </Label>
              <Input
                name="itemName"
                placeholder="e.g. Dell Latitude 5420 Laptop"
                value={v.itemName}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.itemName && !!validation.errors.itemName
                }
              />
              <FormFeedback>{validation.errors.itemName}</FormFeedback>
            </Col>

            <Col md={3}>
              <Label>
                Item Type <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={v.itemTypeId}
                onChange={(e) => handleItemTypeChange(e.target.value)}
              >
                <option value="">Select Type</option>
                {itemTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Nav tabs className="im-form-tabs">
            {FORM_TABS.map((tab) => (
              <NavItem key={tab.key}>
                <NavLink
                  className={classnames({ active: activeTab === tab.key })}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bx ${tab.icon}`}></i> {tab.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>

          <TabContent activeTab={activeTab}>
            {/* ---------------- GENERAL DATA ---------------- */}
            <TabPane tabId="general">
              <div className="im-tab-panel">
                <FormSectionLabel icon="bx-sitemap" text="Categorization" />
                <Row className="mb-4">
                  {CATEGORY_LEVELS.map((lvl, idx) => {
                    const optionsKey = ["l1", "l2", "l3", "l4"][idx];
                    const parentValue =
                      idx === 0 ? true : v[CATEGORY_LEVELS[idx - 1].key];
                    return (
                      <Col md={3} key={lvl.key}>
                        <Label>
                          {lvl.label}{" "}
                          {lvl.required && (
                            <span className="text-danger">*</span>
                          )}
                        </Label>
                        <Input
                          type="select"
                          value={v[lvl.key]}
                          disabled={!parentValue}
                          onChange={(e) =>
                            handleCategoryChange(lvl.key, e.target.value)
                          }
                        >
                          <option value="">
                            {parentValue
                              ? "Select..."
                              : "Select previous level first"}
                          </option>
                          {catOptions[optionsKey].map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </Input>
                      </Col>
                    );
                  })}
                </Row>

                <div className="im-two-col-panel">
                  <div>
                    <FormSectionLabel
                      icon="bx-note"
                      text="Description & Unit"
                    />
                    <div className="mb-4">
                      <Label>Long Description</Label>
                      <Input
                        type="textarea"
                        rows={5}
                        name="longDescription"
                        placeholder="Detailed specification (optional)..."
                        value={v.longDescription}
                        onChange={validation.handleChange}
                      />
                    </div>
                    <Row>
                      <Col md={6} className="mb-4">
                        <Label>
                          Unit of Measure (UOM){" "}
                          <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="select"
                          name="uomId"
                          value={v.uomId}
                          onChange={validation.handleChange}
                        >
                          <option value="">Select UOM</option>
                          {uoms.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.symbol})
                            </option>
                          ))}
                        </Input>
                      </Col>
                      <Col md={6} className="mb-4">
                        <Label>Brand</Label>
                        <Input
                          name="brand"
                          placeholder="e.g. Dell, HP, Samsung"
                          value={v.brand}
                          onChange={validation.handleChange}
                        />
                      </Col>
                    </Row>
                  </div>

                  <div>
                    <FormSectionLabel
                      icon="bx-purchase-tag"
                      text="Classification & Pricing"
                    />
                    <Row>
                      <Col md={6} className="mb-4">
                        <Label>Sub Type</Label>
                        <Input
                          type="select"
                          value={v.subTypeId}
                          onChange={(e) => handleSubTypeChange(e.target.value)}
                          disabled={!v.itemTypeId}
                        >
                          <option value="">
                            {v.itemTypeId
                              ? "Select Sub Type"
                              : "Select item type first"}
                          </option>
                          {subTypeOptions.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </Input>
                      </Col>
                      <Col md={6} className="mb-4">
                        <Label>Base Price</Label>
                        <div className="im-code-input-wrap">
                          <i className="bx bx-rupee"></i>
                          <Input
                            type="number"
                            name="basePrice"
                            min={0}
                            step="0.01"
                            value={numOrBlank(v.basePrice)}
                            onChange={(e) =>
                              validation.setFieldValue(
                                "basePrice",
                                parseNum(e.target.value),
                              )
                            }
                            invalid={!!validation.errors.basePrice}
                          />
                        </div>
                        <FormFeedback>
                          {validation.errors.basePrice}
                        </FormFeedback>
                      </Col>
                    </Row>

                    <FormSectionLabel icon="bx-git-branch" text="Hierarchy" />
                    <Row>
                      <Col md={6} className="mb-4">
                        <Label>Hierarchy</Label>
                        <Input
                          type="select"
                          value={hierarchyType}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHierarchyType(val);
                            if (val === "parent") {
                              validation.setFieldValue("parentItemId", "");
                            }
                          }}
                        >
                          <option value="parent">Parent Item</option>
                          <option value="child">Child Item</option>
                        </Input>
                      </Col>
                      {hierarchyType === "child" && (
                        <Col md={6} className="mb-4">
                          <Label>
                            Select Parent <span className="text-danger">*</span>
                          </Label>
                          <Input
                            type="select"
                            value={v.parentItemId}
                            onChange={(e) =>
                              validation.setFieldValue(
                                "parentItemId",
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Select Parent</option>
                            {parentItemOptions.map((it) => (
                              <option key={it._id} value={it._id}>
                                {it.itemCode} - {it.itemName}
                              </option>
                            ))}
                          </Input>
                        </Col>
                      )}
                    </Row>
                  </div>
                </div>
              </div>
            </TabPane>

            {/* ---------------- INVENTORY & PLANNING ---------------- */}
            <TabPane tabId="inventory">
              <div className="im-tab-panel">
                <FormSectionLabel icon="bx-layer" text="Stock Thresholds" />
                <Row>
                  <Col md={4} className="mb-4">
                    <Label>Min Level</Label>
                    <Input
                      type="number"
                      min={0}
                      value={numOrBlank(v.stockThresholds.minLevel)}
                      onChange={(e) =>
                        setNested(
                          "stockThresholds.minLevel",
                          parseNum(e.target.value),
                        )
                      }
                    />
                  </Col>
                  <Col md={4} className="mb-4">
                    <Label>Max Level</Label>
                    <Input
                      type="number"
                      min={0}
                      value={numOrBlank(v.stockThresholds.maxLevel)}
                      onChange={(e) =>
                        setNested(
                          "stockThresholds.maxLevel",
                          parseNum(e.target.value),
                        )
                      }
                    />
                  </Col>
                  <Col md={4} className="mb-4">
                    <Label>Safety Stock</Label>
                    <Input
                      type="number"
                      min={0}
                      value={numOrBlank(v.stockThresholds.safetyStock)}
                      onChange={(e) =>
                        setNested(
                          "stockThresholds.safetyStock",
                          parseNum(e.target.value),
                        )
                      }
                    />
                  </Col>
                </Row>

                <FormSectionLabel icon="bx-calendar-check" text="Planning" />
                <Row>
                  <Col md={4} className="mb-4">
                    <Label>Reorder Qty</Label>
                    <Input
                      type="number"
                      min={0}
                      value={numOrBlank(v.planning.reorderQty)}
                      onChange={(e) =>
                        setNested(
                          "planning.reorderQty",
                          parseNum(e.target.value),
                        )
                      }
                    />
                  </Col>
                  <Col md={4} className="mb-4">
                    <Label>Lead Time (Days)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={numOrBlank(v.planning.leadTimeDays)}
                      onChange={(e) =>
                        setNested(
                          "planning.leadTimeDays",
                          parseNum(e.target.value),
                        )
                      }
                    />
                  </Col>
                  <Col md={4} className="mb-4">
                    <Label>Inventory Class</Label>
                    <Input
                      type="select"
                      value={v.planning.inventoryClass}
                      onChange={(e) =>
                        setNested("planning.inventoryClass", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="sales_inventory">Sales Inventory</option>
                      <option value="procurement_inventory">
                        Procurement Inventory
                      </option>
                    </Input>
                  </Col>
                </Row>

                <label
                  className="im-checkbox-row mb-4"
                  style={{ maxWidth: 340 }}
                >
                  <input
                    type="checkbox"
                    checked={v.planning.allowInvoiceWithoutStock}
                    onChange={(e) =>
                      setNested(
                        "planning.allowInvoiceWithoutStock",
                        e.target.checked,
                      )
                    }
                  />
                  <span className="small mb-0">
                    Allow invoice without stock
                  </span>
                </label>

                <FormSectionLabel icon="bx-trending-up" text="Usage Metrics" />
                <Row>
                  <Col md={4} className="mb-4">
                    <Label>Avg Daily Usage</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={numOrBlank(v.usageMetrics.avgDailyUsage)}
                      onChange={(e) =>
                        setNested(
                          "usageMetrics.avgDailyUsage",
                          parseNum(e.target.value),
                        )
                      }
                    />
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* ---------------- TRACEABILITY & CONTROL ---------------- */}
            <TabPane tabId="traceability">
              <div className="im-tab-panel">
                <FormSectionLabel icon="bx-truck" text="Procurement Info" />
                <Row>
                  <Col md={6} className="mb-4">
                    <Label>Default Vendor</Label>
                    <Input
                      type="select"
                      value={v.procurementInfo.defaultVendorId}
                      onChange={(e) =>
                        setNested(
                          "procurementInfo.defaultVendorId",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.tradeName} ({vendor.vendorCode})
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col md={6} className="mb-4">
                    <Label>Manufacturer Name</Label>
                    <Input
                      // placeholder="Optional"
                      value={v.procurementInfo.manufacturerName}
                      onChange={(e) =>
                        setNested(
                          "procurementInfo.manufacturerName",
                          e.target.value,
                        )
                      }
                    />
                  </Col>
                  <Col md={6} className="mb-4">
                    <Label>MPN</Label>
                    <Input
                      // placeholder="Optional"
                      value={v.procurementInfo.mpn}
                      onChange={(e) =>
                        setNested("procurementInfo.mpn", e.target.value)
                      }
                    />
                  </Col>
                  <Col md={6} className="mb-4">
                    <Label>Country of Origin</Label>
                    <Input
                      type="select"
                      value={v.procurementInfo.countryOfOrigin}
                      onChange={(e) =>
                        setNested(
                          "procurementInfo.countryOfOrigin",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Input>
                  </Col>
                </Row>

                <FormSectionLabel icon="bx-shield-quarter" text="Controls" />
                <div className="im-checkbox-grid mb-4">
                  {[
                    ["taggableAsset", "Taggable Asset"],
                    ["serializable", "Serializable"],
                    ["batchTracked", "Batch Tracked"],
                    ["hazardousMaterial", "Hazardous Material"],
                    ["maintainable", "Maintainable"],
                    ["inspectionRequired", "Inspection Required"],
                  ].map(([key, label]) => (
                    <label className="im-checkbox-row" key={key}>
                      <input
                        type="checkbox"
                        checked={v.controls[key]}
                        onChange={(e) =>
                          setNested(`controls.${key}`, e.target.checked)
                        }
                      />
                      <span className="small mb-0">{label}</span>
                    </label>
                  ))}
                </div>

                <FormSectionLabel
                  icon="bx-purchase-tag"
                  text="Tax & GL Accounts"
                />
                <Row>
                  <Col md={4} className="mb-4">
                    <Label>HSN / SAC Code</Label>
                    <Input
                      name="hsnSacCode"
                      value={v.hsnSacCode}
                      onChange={validation.handleChange}
                    />
                  </Col>
                  <Col md={4} className="mb-4">
                    <Label>Cost GL Account</Label>
                    <Input
                      value={v.glAccounts.costGlAccount}
                      onChange={(e) =>
                        setNested("glAccounts.costGlAccount", e.target.value)
                      }
                    />
                  </Col>
                  <Col md={4} className="mb-4">
                    <Label>Depreciation GL Account</Label>
                    <Input
                      value={v.glAccounts.depreciationGlAccount}
                      onChange={(e) =>
                        setNested(
                          "glAccounts.depreciationGlAccount",
                          e.target.value,
                        )
                      }
                    />
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* ---------------- ATTRIBUTES & MEDIA ---------------- */}
            <TabPane tabId="attributes">
              <div className="im-tab-panel">
                <FormSectionLabel
                  icon="bx-customize"
                  text="Custom Attributes"
                />

                {v.customAttributes.length === 0 && (
                  <div
                    className="text-muted small border rounded-3 p-4 text-center mb-3"
                    style={{ background: "#fbfbfd" }}
                  >
                    No custom attributes yet.
                  </div>
                )}

                <div className="d-flex flex-column gap-2 mb-3">
                  {v.customAttributes.map((a, idx) => {
                    const needsOptions =
                      a.dataType === "select" || a.dataType === "radio";
                    return (
                      <div key={idx} className="im-subtype-row">
                        <Row className="align-items-center g-2 mx-0">
                          <Col md={3}>
                            <Input
                              bsSize="sm"
                              placeholder="Attribute Name"
                              value={a.key}
                              onChange={(e) =>
                                updateCustomAttribute(
                                  idx,
                                  "key",
                                  e.target.value,
                                )
                              }
                            />
                          </Col>
                          <Col md={3}>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={a.dataType || "text"}
                              onChange={(e) =>
                                changeAttributeDataType(idx, e.target.value)
                              }
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="select">Select Dropdown</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="radio">Radio Button</option>
                            </Input>
                          </Col>
                          <Col md={5}>{renderAttributeValueInput(a, idx)}</Col>
                          <Col md={1} className="text-end">
                            <button
                              type="button"
                              className="im-close-btn"
                              style={{
                                width: 32,
                                height: 32,
                                color: "var(--im-danger)",
                                borderColor: "var(--im-danger-border)",
                              }}
                              onClick={() => removeCustomAttribute(idx)}
                            >
                              <i
                                className="bx bx-trash"
                                style={{ fontSize: 15 }}
                              ></i>
                            </button>
                          </Col>
                        </Row>

                        {needsOptions && (
                          <Row className="align-items-center g-2 mx-0 mt-2">
                            <Col md={12}>
                              {(a.options || []).length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                  {(a.options || []).map((opt) => (
                                    <span
                                      key={opt}
                                      className="badge bg-light text-dark border d-flex align-items-center gap-1"
                                    >
                                      {opt}
                                      <i
                                        className="bx bx-x"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          removeAttributeOption(idx, opt)
                                        }
                                      ></i>
                                    </span>
                                  ))}
                                </div>
                              )}
                              <AttributeOptionInput
                                onAdd={(text) => addAttributeOption(idx, text)}
                              />
                            </Col>
                          </Row>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button
                  size="sm"
                  outline
                  type="button"
                  className="im-add-dashed mb-4"
                  onClick={addCustomAttribute}
                >
                  <i className="bx bx-plus me-1"></i> Add Attribute
                </Button>

                <FormSectionLabel icon="bx-image" text="Product Images" />

                <div className="mb-3">
                  <label
                    htmlFor="item-image-upload"
                    className="im-add-dashed btn btn-sm btn-outline-primary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <i
                      className={`bx ${uploadingImage ? "bx-loader-alt bx-spin" : "bx-upload"} me-1`}
                    ></i>
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </label>
                  <input
                    id="item-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {!editingItem && (
                    <div className="text-muted small mt-1">
                      Images will be uploaded once you save the item.
                    </div>
                  )}
                </div>

                {images.length === 0 && stagedFiles.length === 0 ? (
                  <div className="text-muted small">
                    No images uploaded yet.
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {images.map((img) => (
                      <div key={img._id} style={{ position: "relative" }}>
                        <img src={img.url} alt="" className="im-image-thumb" />
                        <button
                          type="button"
                          className="im-close-btn"
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            width: 24,
                            height: 24,
                            color: "#e04f4f",
                            borderColor: "#fbdada",
                            background: "#fff",
                          }}
                          onClick={() => handleImageDelete(img._id)}
                        >
                          <i className="bx bx-x" style={{ fontSize: 13 }}></i>
                        </button>
                      </div>
                    ))}

                    {stagedFiles.map((staged, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <img
                          src={staged.previewUrl}
                          alt=""
                          className="im-image-thumb"
                        />
                        <span
                          className="badge bg-warning text-dark"
                          style={{
                            position: "absolute",
                            bottom: 2,
                            left: 2,
                            fontSize: 9,
                          }}
                        >
                          Pending
                        </span>
                        <button
                          type="button"
                          className="im-close-btn"
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            width: 24,
                            height: 24,
                            color: "#e04f4f",
                            borderColor: "#fbdada",
                            background: "#fff",
                          }}
                          onClick={() => removeStagedFile(idx)}
                        >
                          <i className="bx bx-x" style={{ fontSize: 13 }}></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabPane>
          </TabContent>

          <div className="im-footer-bar d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={validation.isSubmitting}
            >
              {validation.isSubmitting
                ? "Saving..."
                : editingItem
                  ? "Save changes"
                  : "Create Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
const AttributeOptionInput = ({ onAdd }) => {
  const [text, setText] = useState("");
  return (
    <div className="d-flex gap-2">
      <Input
        bsSize="sm"
        placeholder="Type an option and press Add"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(text);
            setText("");
          }
        }}
      />
      <Button
        size="sm"
        outline
        type="button"
        className="im-add-dashed"
        onClick={() => {
          onAdd(text);
          setText("");
        }}
      >
        Add
      </Button>
    </div>
  );
};
export default ItemMasterForm;
