import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Row, Col, Label, Input, Spinner } from "reactstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import PhoneInputWithCountrySelect, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import PropTypes from "prop-types";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import {
  createDepartment,
  editEmployee,
  getAllUsers,
  getDepartments,
  getEmployeeId,
  postEmployee,
  updateEmployeeByKey,
  uploadFile,
} from "../../../../helpers/backend_helper";
import PreviewFile from "../../../../Components/Common/PreviewFile";
import {
  addDesignation,
  fetchDesignations,
} from "../../../../store/features/HR/hrSlice";
import {
  accountOptions,
  employeeGenderOptions,
  employeeGroupOptions,
  employmentOptions,
  payrollOptions,
  statusOptions,
} from "../../../../Components/constants/HR";
import { calculatePayroll } from "../../../../utils/calculatePayroll";
import { normalizeDateForInput } from "../../../../utils/time";
import { downloadFile } from "../../../../Components/Common/downloadFile";
import { format } from "date-fns";
import { getFilePreviewMeta } from "../../../../utils/isPreviewable";
import { FILE_PREVIEW_CUTOFF } from "../../../../Components/constants/HR";

const validationSchema = (mode, isEdit) =>
  Yup.object({
    name: Yup.string().required("Employee name is required"),
    eCode: isEdit
      ? Yup.string().notRequired()
      : mode === "NEW_JOINING"
        ? Yup.string().notRequired()
        : Yup.string().required("Employee code is required"),
    department: Yup.string().required("Department is required"),
    employmentType: Yup.string().required("Employemnt is required"),
    firstLocation: Yup.string().required("First location is required"),
    currentLocation: Yup.string().required("Current location is required"),
    designation: Yup.string().required("Designation is required"),
    payrollType: Yup.string().required("Payroll type is required"),
    joinningDate: Yup.string()
      .required("Date of joining is required")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .test(
        "not-in-future",
        "Joining date cannot be in the future",
        (value) => {
          if (!value) return false;
          const today = format(new Date(), "yyyy-MM-dd");
          return value <= today;
        }
      ),
    gender: Yup.string().required("Gender is required"),
    pfApplicable: Yup.boolean().required("Pf Applicable is required"),
    father: Yup.string().required("Father's name is required"),
    dateOfBirth: Yup.string()
      .required("Date of birth is required")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
      .test(
        "dob-in-past",
        "Date of birth must be in the past",
        (value) => value && new Date(value) < new Date(),
      ),
    exitDate: Yup.string()
      .nullable()
      .test(
        "exit-after-joining",
        "Exit date must be after joining date",
        function (value) {
          const { joinningDate } = this.parent;
          if (!value || !joinningDate) return true;
          return new Date(value) >= new Date(joinningDate);
        },
      ),
    mobile: Yup.string()
      .required("Mobile number is required")
      .test("is-valid-phone", "Invalid phone number", function (value) {
        return isValidPhoneNumber(value || "");
      }),
    email: Yup.string().email("Invalid email").notRequired(),
    status:
      mode === "NEW_JOINING"
        ? Yup.string().oneOf(["NEW_JOINING"])
        : Yup.string()
          .oneOf(["ACTIVE", "FNF_CLOSED", "RESIGNED"])
          .required("Status is required"),
    state: Yup.string().required("State is required"),
    bankName: Yup.string().required("Bank name is required"),
    accountNo: Yup.string().required("Bank account number is required"),
    IFSCCode: Yup.string().required("IFSC code is required"),
    accountName: Yup.string().required("Account holder's name is required"),
    adharNo: Yup.string().required("Aadhaar number is required"),
    pan: Yup.string().required("PAN number is required"),
    biometricId: Yup.string().trim(),
    panOld: Yup.string()
      .nullable()
      .test("pan-uploaded", "PAN file is required", value => !!value),
    adharOld: Yup.string().required("Aadhaar file is required"),
    offerLetterOld: Yup.string().required("Offer letter is required"),
    employeeGroups: Yup.string().notRequired(),
    account: Yup.string().notRequired(),
    minimumWages: Yup.number().min(0).notRequired(),
    grossSalary: Yup.number()
      .min(0)
      .required("Gross Salary is required")
      .test(
        "gross-breakup-exact-match",
        "Basic + HRA + SPL + Conveyance + Statutory Bonus must be equal to Gross Salary",
        function (gross) {
          const {
            basicAmount = 0,
            HRAAmount = 0,
            SPLAllowance = 0,
            conveyanceAllowance = 0,
            statutoryBonus = 0,
          } = this.parent;

          const breakupTotal =
            Number(basicAmount) +
            Number(HRAAmount) +
            Number(SPLAllowance) +
            Number(conveyanceAllowance) +
            Number(statutoryBonus);

          if (gross === undefined || gross === null) return true;

          return Number(gross) === breakupTotal;
        }
      ),
    basicAmount: Yup.number().min(0).notRequired(),
    basicPercentage: Yup.number().min(0).max(100).notRequired(),
    HRAAmount: Yup.number().min(0).notRequired(),
    HRAPercentage: Yup.number().min(0).max(100).notRequired(),
    statutoryBonus: Yup.number().min(0).notRequired(),
    insurance: Yup.number().min(0).notRequired(),
    TDSRate: Yup.number().min(0).max(100).notRequired(),
    pfAmount: Yup.number().min(0).notRequired(),
    SPLAllowance: Yup.number().min(0).notRequired(),
    conveyanceAllowance: Yup.number().min(0).notRequired(),
    debitStatementNarration: Yup.string().notRequired(),
    ESICSalary: Yup.number().min(0).notRequired(),
    LWFSalary: Yup.number().min(0).notRequired(),
    LWFEmployee: Yup.number().min(0).notRequired(),
    LWFEmployer: Yup.number().min(0).notRequired(),
  });

const getInitialValues = (initialData, mode) => ({
  name: initialData?.name || "",
  eCode: mode === "NEW_JOINING" ? "" : initialData?.eCode || "",

  department: initialData?.department?._id || "",
  designation: initialData?.designation?._id || "",

  firstLocation: initialData?.firstLocation?._id || "",
  transferredFrom: initialData?.transferredFrom?._id || "",
  currentLocation: initialData?.currentLocation?._id || "",

  employmentType: initialData?.employmentType || "",
  payrollType: initialData?.payrollType || "",
  state: initialData?.state || "",

  joinningDate: normalizeDateForInput(initialData?.joinningDate) || format(new Date(), "yyyy-MM-dd"),
  exitDate: normalizeDateForInput(initialData?.exitDate) || "",
  dateOfBirth: normalizeDateForInput(initialData?.dateOfBirth) || "",

  status:
    initialData?.status ??
    (mode === "NEW_JOINING" ? "NEW_JOINING" : ""),

  gender: initialData?.gender || "",

  bankName: initialData?.bankDetails?.bankName || "",
  accountNo: initialData?.bankDetails?.accountNo || "",
  IFSCCode: initialData?.bankDetails?.IFSCCode || "",
  accountName: initialData?.bankDetails?.accountName || "",

  pfApplicable: initialData?.pfApplicable ?? null,
  pfNo: initialData?.pfNo || "",
  uanNo: initialData?.uanNo || "",
  esicIpCode: initialData?.esicIpCode || "",

  adharNo: initialData?.adhar?.number || "",
  pan: initialData?.pan?.number || "",

  panOld: initialData?.pan?.url || "",
  adharOld: initialData?.adhar?.url || "",
  offerLetterOld: initialData?.offerLetter || "",

  father: initialData?.father || "",
  mobile: initialData?.mobile || "",
  officialEmail: initialData?.officialEmail || "",
  email: initialData?.email || "",

  monthlyCTC: initialData?.monthlyCTC || 0,
  biometricId: initialData?.biometricId || "",

  panFile: null,
  adharFile: null,
  offerLetterFile: null,

  employeeGroups: initialData?.financeDetails?.employeeGroups || "",
  account: initialData?.financeDetails?.account || "",

  minimumWages: initialData?.financeDetails?.minimumWages || 0,
  shortWages: initialData?.financeDetails?.shortWages || 0,
  grossSalary:
    initialData?.financeDetails?.grossSalary || 0,

  basicPercentage: initialData?.financeDetails?.basicPercentage || 0,
  basicAmount: initialData?.financeDetails?.basicAmount || 0,
  HRAAmount: initialData?.financeDetails?.HRAAmount || 0,
  HRAPercentage: initialData?.financeDetails?.HRAPercentage || 0,
  SPLAllowance: initialData?.financeDetails?.SPLAllowance || 0,
  conveyanceAllowance: initialData?.financeDetails?.conveyanceAllowance || 0,
  statutoryBonus: initialData?.financeDetails?.statutoryBonus || 0,

  insurance: initialData?.financeDetails?.insurance || 0,
  ESICSalary: initialData?.financeDetails?.ESICSalary || 0,
  ESICEmployee: initialData?.financeDetails?.ESICEmployee || 0,
  ESICEmployer: initialData?.financeDetails?.ESICEmployer || 0,
  LWFSalary: initialData?.financeDetails?.ESICSalary || 0,
  LWFEmployee: initialData?.financeDetails?.LWFEmployee || 0,
  LWFEmployer: initialData?.financeDetails?.LWFEmployer || 0,

  PFEmployee: initialData?.financeDetails?.PFEmployee || 0,
  PFEmployer: initialData?.financeDetails?.PFEmployer || 0,
  PFAmount: initialData?.financeDetails?.PFAmount || 0,

  PT: initialData?.financeDetails?.PT || 0,
  TDSRate: initialData?.financeDetails?.TDSRate || 0,

  inHandSalary: initialData?.financeDetails?.inHandSalary || 0,

  debitStatementNarration:
    initialData?.financeDetails?.debitStatementNarration || "",

  users: initialData?.users
    ? initialData.users.map((u) => ({
      value: u._id,
      label: `${u.name} (${u.email})`,
    }))
    : [],
});

const EmployeeForm = ({
  initialData,
  onSuccess,
  view,
  onCancel,
  mode,
  hasCreatePermission,
}) => {
  const dispatch = useDispatch();
  const { centerAccess, userCenters } = useSelector((state) => state.User);
  const { designations: designationOptions, designationLoading } = useSelector(
    (state) => state.HR,
  );
  const handleAuthError = useAuthError();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const isEdit = !!initialData?._id;
  const [eCodeLoader, setECodeLoader] = useState(false);
  const [linking, setLinking] = useState(false);
  const [creatingDesignation, setCreatingDesignation] = useState(false);

  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [department, setDepartment] = useState("");
  const [manual, setManual] = useState({
    SPLAllowance: false,
  });
  const [uploading, setUploading] = useState({
    panFile: false,
    adharFile: false,
    offerLetterFile: false,
  });

  const [uploadedAt, setUploadedAt] = useState({
    panOld: null,
    adharOld: null,
    offerLetterOld: null,
  });
  const panFileRef = useRef(null);
  const adharFileRef = useRef(null);
  const offerLetterRef = useRef(null);

  const centerOptions = userCenters
    ?.filter((c) => centerAccess.includes(c._id))
    .map((c) => ({
      value: c._id,
      label: c.title,
    }));

  useEffect(() => {
    const loadDesignations = async () => {
      try {
        dispatch(fetchDesignations({ status: ["PENDING", "APPROVED"] })).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error("Something went wrong while getting the designations");
        }
      }
    };

    loadDesignations();
  }, []);

  const form = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: getInitialValues(initialData, mode),
    validationSchema: validationSchema(mode, isEdit),
    onSubmit: async (values) => {
      touchFileFields();
      const errors = await form.validateForm();

      if (errors.panOld || errors.adharOld || errors.offerLetterOld) {
        toast.error("Please upload all required documents");
        return;
      }

      try {
        if (mode === "NEW_JOINING") {
          values.status = "NEW_JOINING";
        } else {
          values.status = values.status?.trim();
        }

        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
          if (key === "eCode" && mode === "NEW_JOINING") return;
          if (key === "users") return;
          if (value === undefined || value === null) return;

          formData.append(key, value);
        });
        let panUrl = values.panOld;
        let adharUrl = values.adharOld;
        let offerLetterUrl = values.offerLetterOld;

        if (panUrl) formData.append("panUrl", panUrl);
        if (adharUrl) formData.append("adharUrl", adharUrl);
        if (offerLetterUrl) formData.append("offerLetterUrl", offerLetterUrl);

        formData.delete("PFEmployee");
        formData.delete("PFEmployer");
        formData.delete("PFAmount");
        formData.delete("PT");
        formData.delete("shortWages");
        formData.delete("PFSalary");
        formData.delete("PFAmount");
        formData.delete("TDSAmount");
        formData.delete("deductions");
        formData.delete("ESICEmployee");
        formData.delete("ESICEmployer");
        formData.delete("inHandSalary");
        formData.delete("panOld");
        formData.delete("offerLetterOld");
        formData.delete("adharOld");
        formData.delete("basicPercentage");
        formData.delete("HRAPercentage");

        if (initialData?._id) {
          formData.delete("eCode");
          await editEmployee(initialData._id, formData);
          toast.success("Employee updated successfully");
        } else {
          await postEmployee(formData);
          toast.success("Employee added successfully");
        }

        if (view === "PAGE") {
          form.resetForm({
            values: {
              ...form.initialValues,
              firstLocation: "",
              transferredFrom: "",
              currentLocation: "",
            },
          });
        } else {
          onSuccess?.();
        }
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to save employee");
        }
      }
    },
  });

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    setFieldValue,
    setTouched,
    setFieldTouched,
    touched,
    isValid,
  } = form;

  const touchFileFields = () => {
    setTouched(
      {
        ...form.touched,
        panOld: true,
        adharOld: true,
        offerLetterOld: true,
      },
      false
    );
  };

  const handleFileUpload = async ({
    file,
    path,
    urlField,
    fileField,
  }) => {
    if (!file) return;

    try {
      setUploading(prev => ({ ...prev, [fileField]: true }));

      const fd = new FormData();
      fd.append("file", file);
      fd.append("uploadPath", path);

      const res = await uploadFile(fd);

      setFieldValue(urlField, res.url, false);

      setFieldTouched(urlField, true, false);

      setUploadedAt(prev => ({ ...prev, [urlField]: new Date().toISOString() }));

      form.setErrors(prev => ({
        ...prev,
        [urlField]: undefined,
      }));

      toast.success("File uploaded successfully");
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error("File upload failed");
      }
    } finally {
      setUploading(prev => ({ ...prev, [fileField]: false }));
    }
  };

  const getDocumentDate = (urlField) =>
    uploadedAt[urlField] || initialData?.updatedAt;

  const handleFilePreview = (file, urlField) => {
    if (!file?.url) return;

    const meta = getFilePreviewMeta(
      file,
      getDocumentDate(urlField),
      FILE_PREVIEW_CUTOFF,
    );

    if (meta.action === "preview") {
      setPreviewFile(file);
      setPreviewOpen(true);
    } else {
      downloadFile(file);
    }
  };

  const getFileActionLabel = (file, urlField) => {
    if (!file?.url) return "Download";

    const meta = getFilePreviewMeta(
      file,
      getDocumentDate(urlField),
      FILE_PREVIEW_CUTOFF,
    );

    return meta.action === "preview" ? "Preview" : "Download";
  };


  const errorText = (field) => {
    if (isEdit) {
      return errors[field] ? (
        <div className="text-danger small">{errors[field]}</div>
      ) : null;
    }

    return touched[field] && errors[field] ? (
      <div className="text-danger small">{errors[field]}</div>
    ) : null;
  };

  const handleCreateDesignation = async (inputValue) => {
    if (mode === "NEW_JOINING" && !hasCreatePermission) {
      toast.error("You don't have permission to create designation");
      return;
    }

    try {
      setCreatingDesignation(true);
      const response = await dispatch(
        addDesignation({
          name: inputValue,
          status: mode === "NEW_JOINING" ? "PENDING" : "APPROVED",
        }),
      ).unwrap();
      form.setFieldValue("designation", response.data.value);
      form.setFieldTouched("designation", true, false);
      toast.success("designation created successfully");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("something went wrong while creating new designation");
      }
    } finally {
      setCreatingDesignation(false);
    }
  };

  const generateEmployeeId = async () => {
    setECodeLoader(true);
    try {
      const response = await getEmployeeId();
      form.setFieldValue("eCode", response.payload.value);
    } catch (error) {
      if (!handleAuthError) {
        toast.error("Failed to generate employee id");
      }
    } finally {
      setECodeLoader(false);
    }
  };

  useEffect(() => {
    if (!initialData?._id && mode !== "NEW_JOINING") {
      generateEmployeeId();
    }
  }, [initialData, mode]);

  useEffect(() => {
    if (isEdit) {
      setTouched(
        {
          panOld: true,
          adharOld: true,
          offerLetterOld: true,
        },
        false
      );
    }
  }, [isEdit, setTouched]);

  const fetchDepartment = async () => {
    try {
      const response = await getDepartments();
      setDepartmentOptions(
        (response?.data || []).map((dept) => ({
          label: dept.department,
          value: dept._id,
        })),
      );
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("Failed to fetch department");
      }
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, []);

  useEffect(() => {
    if (isEdit && initialData?.department && departmentOptions.length) {
      const matched = departmentOptions.find(
        (opt) => opt.label === initialData.department,
      );

      if (matched) {
        form.setFieldValue("department", matched.value);
      }
    }
  }, [departmentOptions, isEdit, initialData]);

  const handleLinkUsers = async () => {
    if (!initialData?._id) return;
    setLinking(true);
    try {
      const payload = {
        id: initialData._id,
        updates: {
          users: values.users ? values.users.map((u) => u.value) : [],
        }
      };
      await updateEmployeeByKey(payload);
      toast.success("Users linked successfully");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to link users");
      }
    } finally {
      setLinking(false);
    }
  };

  const handleCreateDepartment = async (dept) => {
    try {
      const data = { department: dept };
      const response = await createDepartment(data);
      const createdDept = response.data;

      const newOption = {
        label: createdDept.department,
        value: createdDept._id,
      };

      setDepartmentOptions((prev) => [...prev, newOption]);

      form.setFieldValue("department", createdDept._id);

      toast.success("Department created successfully");
    } catch (error) {
      toast.error("Failed to create department");
    } finally {
      fetchDepartment();
    }
  };

  const debouncedFetchUsers = useMemo(
    () =>
      debounce((inputValue, resolve) => {
        if (!inputValue || !token) {
          resolve([]);
          return;
        }
        getAllUsers({
          search: inputValue,
          limit: 10,
          token,
          centerAccess,
        })
          .then((response) => {
            resolve(
              (response?.data?.data || []).map((user) => ({
                value: user._id,
                label: `${user.name} (${user.email})`,
              }))
            );
          })
          .catch((error) => {
            console.error("Failed to search users", error);
            resolve([]);
          });
      }, 500),
    [token, centerAccess]
  );

  const loadUserOptions = (inputValue) => {
    return new Promise((resolve) => {
      debouncedFetchUsers(inputValue, resolve);
    });
  };

  useEffect(() => {
    const payroll = calculatePayroll(values);

    Object.entries(payroll).forEach(([key, value]) => {
      if (values[key] !== value) {
        setFieldValue(key, value, false);
      }
    });
  }, [
    values.grossSalary,
    values.basicAmount,
    values.HRAAmount,
    values.pfApplicable,
    values.gender,
    values.joinningDate,
    values.ESICSalary,
    values.ESICEmployee,
    values.LWFEmployee,
    values.TDSRate,
    values.insurance,
    values.minimumWages
  ]);

  const selectedEmploymentOption =
    employmentOptions.find(
      (opt) => opt.value === values.employmentType?.trim().toUpperCase(),
    ) ||
    (values.employmentType
      ? {
        label: values.employmentType,
        value: values.employmentType?.trim().toUpperCase(),
      }
      : null);

  return (
    <>
      <div>
        <Row className="g-3 mx-2">
          {/* EMPLOYEE CODE */}
          {mode !== "NEW_JOINING" && (
            <Col md={6}>
              <Label htmlFor="eCode">ECode</Label>

              <div className="position-relative">
                <Input
                  name="eCode"
                  id="eCode"
                  disabled
                  value={values.eCode}
                  onChange={handleChange}
                  invalid={touched.eCode && errors.eCode}
                  style={{ paddingRight: eCodeLoader ? "2.5rem" : undefined }}
                />

                {eCodeLoader && (
                  <Spinner
                    size="sm"
                    color="primary"
                    className="position-absolute"
                    style={{
                      right: "10px",
                      top: "35%",
                    }}
                  />
                )}
              </div>

              {errorText("eCode")}
            </Col>
          )}

          <Col md={6}>
            <Label htmlFor="name">
              Employee Name <span className="text-danger">*</span>
            </Label>
            <Input
              name="name"
              id="name"
              value={values.name}
              onChange={handleChange}
              invalid={touched.name && errors.name}
              onBlur={() => setFieldTouched("name", true)}
            />
            {errorText("name")}
          </Col>

          {/* DEPARTMENT */}
          <Col md={6}>
            <Label htmlFor="department">
              Department <span className="text-danger">*</span>
            </Label>

            <CreatableSelect
              inputId="department"
              placeholder="Search or create department"
              isClearable
              isSearchable
              options={departmentOptions}
              value={
                departmentOptions.find(
                  (opt) => opt.value === values.department,
                ) || null
              }
              onChange={(option) => {
                form.setFieldValue("department", option ? option.value : "");
              }}
              onBlur={() => setFieldTouched("department", true)}
              onCreateOption={(inputValue) => {
                setDepartment(inputValue);
                handleCreateDepartment(inputValue);
              }}
            />

            {errorText("department")}
          </Col>

          {/* DESIGNATION */}
          <Col md={6}>
            <Label htmlFor="designation">
              Designation <span className="text-danger">*</span>
            </Label>
            <CreatableSelect
              inputId="designation"
              placeholder="Select or create designation if not listed"
              isClearable
              isDisabled={
                designationLoading ||
                (mode === "NEW_JOINING" && !hasCreatePermission)
              }
              isLoading={designationLoading || creatingDesignation}
              options={designationOptions}
              value={
                designationOptions.find(
                  (opt) => opt.value === values.designation,
                ) || null
              }
              onChange={(option) =>
                form.setFieldValue("designation", option ? option.value : "")
              }
              onBlur={() => setFieldTouched("designation", true)}
              onCreateOption={handleCreateDesignation}
            />

            {errorText("designation")}
          </Col>

          {/* EMPLOYMENT */}
          <Col md={6}>
            <Label htmlFor="employmentType">
              Employment <span className="text-danger">*</span>
            </Label>

            <Select
              inputId="employmentType"
              placeholder="Select Employment Type"
              options={employmentOptions}
              value={selectedEmploymentOption}
              onChange={(opt) =>
                form.setFieldValue("employmentType", opt ? opt.value : "")
              }
              onBlur={() => setFieldTouched("employmentType", true)}
              isDisabled={
                isEdit &&
                initialData?.employmentType?.trim().toUpperCase() === "VENDOR"
              }
            />

            {errorText("employmentType")}
          </Col>

          {/* FIRST LOCATION */}
          <Col md={6}>
            <Label htmlFor="firstLocation">
              First Location <span className="text-danger">*</span>
            </Label>
            <Select
              inputId="firstLocation"
              options={centerOptions}
              value={
                values.firstLocation
                  ? centerOptions.find((o) => o.value === values.firstLocation)
                  : null
              }
              onChange={(opt) => setFieldValue("firstLocation", opt.value)}
              onBlur={() => setFieldTouched("firstLocation", true)}
            />
            {errorText("firstLocation")}
          </Col>

          {/* TRANSFERRED FROM */}
          {mode !== "NEW_JOINING" && (
            <Col md={6}>
              <Label htmlFor="transferredFrom">Transferred From</Label>
              <Select
                inputId="transferredFrom"
                options={centerOptions}
                value={
                  values.transferredFrom
                    ? centerOptions.find(
                      (o) => o.value === values.transferredFrom,
                    )
                    : null
                }
                onChange={(opt) => setFieldValue("transferredFrom", opt.value)}
              />
            </Col>
          )}

          {/* CURRENT LOCATION */}
          <Col md={6}>
            <Label htmlFor="currentLocation">
              Current Location <span className="text-danger">*</span>
            </Label>
            <Select
              inputId="currentLocation"
              options={centerOptions}
              value={
                values.currentLocation
                  ? centerOptions.find(
                    (o) => o.value === values.currentLocation,
                  )
                  : null
              }
              onChange={(opt) => setFieldValue("currentLocation", opt.value)}
              onBlur={() => setFieldTouched("currentLocation", true)}
            />
            {errorText("currentLocation")}
          </Col>

          {/* STATE */}
          <Col md={6}>
            <Label htmlFor="state">
              State <span className="text-danger">*</span>
            </Label>

            <Input
              name="state"
              id="state"
              value={values.state}
              onChange={handleChange}
              invalid={touched.state && errors.state}
              onBlur={() => setFieldTouched("state", true)}
            />

            {errorText("state")}
          </Col>

          {/* PAYROLL */}
          <Col md={6}>
            <Label htmlFor="payroll">
              Payroll <span className="text-danger">*</span>
            </Label>
            <Select
              inputId="payroll"
              options={payrollOptions}
              value={
                payrollOptions.find(
                  (opt) => opt.value === values.payrollType,
                ) || null
              }
              onChange={(opt) => setFieldValue("payrollType", opt.value)}
              onBlur={() => setFieldTouched("payrollType", true)}
            />
            {errorText("payrollType")}
          </Col>

          {/* DATE OF JOINING */}
          <Col md={6}>
            <Label htmlFor="joinningDate">
              Date of Joining <span className="text-danger">*</span>
            </Label>
            <Input
              id="joinningDate"
              type="date"
              name="joinningDate"
              value={values.joinningDate}
              onChange={handleChange}
              invalid={touched.joinningDate && errors.joinningDate}
              onBlur={() => setFieldTouched("joinningDate", true)}
            />
            {errorText("joinningDate")}
          </Col>

          {/* EXIT DATE */}
          <Col md={6}>
            <Label htmlFor="exitDate">Last Working Day</Label>
            <Input
              id="exitDate"
              type="date"
              name="exitDate"
              value={values.exitDate}
              onChange={handleChange}
            />
          </Col>

          {/* STATUS */}
          {mode !== "NEW_JOINING" && (
            <Col md={6}>
              <Label htmlFor="status">
                Status <span className="text-danger">*</span>
              </Label>
              <Select
                inputId="status"
                options={statusOptions}
                value={
                  statusOptions.find((opt) => opt.value === values.status) ||
                  null
                }
                onChange={(opt) => setFieldValue("status", opt.value)}
                isDisabled={isEdit && initialData?.status === "FNF_CLOSED"}
                onBlur={() => setFieldTouched("status", true)}
              />
              {errorText("status")}
            </Col>
          )}

          {/* GENDER */}
          <Col md={6}>
            <Label htmlFor="gender">
              Gender <span className="text-danger">*</span>
            </Label>
            <Select
              inputId="gender"
              options={employeeGenderOptions}
              value={
                employeeGenderOptions.find(
                  (opt) => opt.value === values.gender,
                ) || null
              }
              onChange={(opt) => setFieldValue("gender", opt.value)}
              onBlur={() => setFieldTouched("gender", true)}
            />
            {errorText("gender")}
          </Col>

          {/* DOB */}
          <Col md={6}>
            <Label htmlFor="dob">
              Date of Birth <span className="text-danger">*</span>
            </Label>
            <Input
              type="date"
              name="dateOfBirth"
              id="dob"
              value={values.dateOfBirth}
              onChange={handleChange}
              invalid={touched.dateOfBirth && errors.dateOfBirth}
              onBlur={() => setFieldTouched("dateOfBirth", true)}
            />
            {errorText("dateOfBirth")}
          </Col>
          {/* BANK NAME */}
          <Col md={6}>
            <Label htmlFor="bankName">
              Bank Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="bankName"
              name="bankName"
              value={values.bankName}
              onChange={handleChange}
              invalid={touched.bankName && errors.bankName}
              onBlur={() => setFieldTouched("bankName", true)}
            />
            {errorText("bankName")}
          </Col>
          {/* BANK ACCOUNT */}
          <Col md={6}>
            <Label htmlFor="accountNo">
              Bank Account No <span className="text-danger">*</span>
            </Label>
            <Input
              id="accountNo"
              name="accountNo"
              value={values.accountNo}
              onChange={handleChange}
              invalid={touched.accountNo && errors.accountNo}
              onBlur={() => setFieldTouched("accountNo", true)}
            />
            {errorText("accountNo")}
          </Col>

          {/* BENIFICIARY NAME */}
          <Col md={6}>
            <Label htmlFor="accountHolderName">
              Account Holder's Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="accountHolderName"
              name="accountName"
              value={values.accountName}
              onChange={handleChange}
              invalid={touched.accountName && errors.accountName}
              onBlur={() => setFieldTouched("accountName", true)}
            />
            {errorText("accountName")}
          </Col>

          {/* IFSC */}
          <Col md={6}>
            <Label htmlFor="IFSCCode">
              IFSC Code <span className="text-danger">*</span>
            </Label>
            <Input
              id="IFSCCode"
              name="IFSCCode"
              value={values.IFSCCode}
              onChange={handleChange}
              invalid={touched.IFSCCode && errors.IFSCCode}
              onBlur={() => setFieldTouched("IFSCCode", true)}
            />
            {errorText("IFSCCode")}
          </Col>

          {/* PF APPLICABLE */}
          <Col md={6}>
            <Label htmlFor="pfApplicable">
              PF Applicable <span className="text-danger">*</span>
            </Label>
            <Select
              inputId="pfApplicable"
              options={[
                { value: true, label: "YES" },
                { value: false, label: "NO" },
              ]}
              value={
                values.pfApplicable === true
                  ? { value: true, label: "YES" }
                  : values.pfApplicable === false
                    ? { value: false, label: "NO" }
                    : null
              }
              onChange={(opt) => setFieldValue("pfApplicable", opt.value)}
              onBlur={() => setFieldTouched("pfApplicable", true)}
            />
            {errorText("pfApplicable")}
          </Col>

          {/* UAN NO */}
          <Col md={6}>
            <Label htmlFor="uanNo">UAN No</Label>
            <Input
              id="uanNo"
              name="uanNo"
              value={values.uanNo}
              onChange={handleChange}
            />
          </Col>

          {/* PF NO */}
          <Col md={6}>
            <Label htmlFor="pfNo">PF No</Label>
            <Input
              id="pfNo"
              name="pfNo"
              value={values.pfNo}
              onChange={handleChange}
            />
          </Col>

          {/* ESIC */}
          <Col md={6}>
            <Label htmlFor="esicIpCode">ESIC IP Code</Label>
            <Input
              id="esicIpCode"
              name="esicIpCode"
              value={values.esicIpCode}
              onChange={handleChange}
            />
          </Col>

          {/* AADHAAR NO*/}
          <Col md={6}>
            <Label htmlFor="adharNo">
              Aadhaar No <span className="text-danger">*</span>
            </Label>
            <Input
              id="adharNo"
              name="adharNo"
              value={values.adharNo}
              onChange={handleChange}
              invalid={touched.adharNo && errors.adharNo}
              onBlur={() => setFieldTouched("adharNo", true)}
            />
            {errorText("adharNo")}
          </Col>

          {/* ADHAAR FILE */}
          <Col md={6}>
            <Label>
              Aadhaar File <span className="text-danger">*</span>
            </Label>

            <input
              type="file"
              hidden
              ref={adharFileRef}
              accept="image/*,application/pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;

                await handleFileUpload({
                  file,
                  path: "EMPLOYEE_ADHAR",
                  urlField: "adharOld",
                  fileField: "adharFile",
                });
              }}
            />

            {values.adharOld ? (
              <div className="d-flex gap-2 mt-2">
                <Button
                  size="sm"
                  color="info"
                  onClick={() =>
                    handleFilePreview({
                      url: values.adharOld,
                      originalName: "Aadhaar",
                    }, "adharOld")
                  }
                  disabled={uploading.adharFile}
                >
                  {getFileActionLabel({
                    url: values.adharOld,
                    originalName: "Aadhaar",
                  }, "adharOld")}
                </Button>

                <Button
                  size="sm"
                  onClick={() => adharFileRef.current.click()}
                  disabled={uploading.adharFile}>
                  {uploading.adharFile ? (
                    <>
                      <Spinner size="sm" className="me-1" /> Uploading
                    </>
                  ) : (
                    "Upload new file"
                  )}
                </Button>
              </div>
            ) : (
              <div className="d-block">
                <Button
                  size="sm"
                  onClick={() => adharFileRef.current.click()}
                  disabled={uploading.adharFile}
                >
                  {uploading.adharFile ? (
                    <>
                      <Spinner size="sm" className="me-1" /> Uploading
                    </>
                  ) : (
                    "Upload file"
                  )}
                </Button>
              </div>
            )}

            {errorText("adharOld")}
          </Col>

          {/* PAN NO*/}
          <Col md={6}>
            <Label htmlFor="pan">
              PAN No<span className="text-danger">*</span>
            </Label>

            <Input
              id="pan"
              name="pan"
              value={values.pan}
              onChange={(e) => {
                setFieldValue("pan", e.target.value.toUpperCase());
              }}
              invalid={touched.pan && errors.pan}
              onBlur={() => setFieldTouched("pan", true)}
            />
            {errorText("pan")}
          </Col>

          {/* PAN FILE */}
          <Col md={6}>
            <Label>
              PAN File <span className="text-danger">*</span>
            </Label>

            <input
              type="file"
              hidden
              ref={panFileRef}
              accept="image/*,application/pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";

                await handleFileUpload({
                  file,
                  path: "EMPLOYEE_PAN",
                  urlField: "panOld",
                  fileField: "panFile"
                });
              }}
            />

            {values.panOld ? (
              <div className="d-flex gap-2 mt-2">
                <Button
                  size="sm"
                  color="info"
                  onClick={() =>
                    handleFilePreview({
                      url: values.panOld,
                      originalName: "Pan",
                    }, "panOld")
                  }
                  disabled={uploading.panFile}
                >
                  {getFileActionLabel({
                    url: values.panOld,
                    originalName: "Pan",
                  }, "panOld")}
                </Button>

                <Button
                  size="sm"
                  onClick={() => panFileRef.current.click()}
                  disabled={uploading.panFile}
                >
                  {uploading.panFile ? (
                    <>
                      <Spinner size="sm" className="me-1" /> Uploading
                    </>
                  ) : (
                    "Upload New file"
                  )}
                </Button>
              </div>
            ) : (
              <div className="d-block">
                <Button
                  size="sm"
                  onClick={() => panFileRef.current.click()}
                  disabled={uploading.panFile}
                >
                  {uploading.panFile ? (
                    <>
                      <Spinner size="sm" className="me-1" /> Uploading
                    </>
                  ) : (
                    "Upload file"
                  )}
                </Button>
              </div>
            )}

            {errorText("panOld")}
          </Col>

          {/* OFFER LETTER FILE */}
          <Col md={6}>
            <Label>
              Offer Letter <span className="text-danger">*</span>
            </Label>

            <input
              type="file"
              hidden
              ref={offerLetterRef}
              accept="image/*,application/pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;

                await handleFileUpload({
                  file,
                  path: "EMPLOYEE_OFFER_LETTER",
                  urlField: "offerLetterOld",
                  fileField: "offerLetterFile",
                });
              }}
            />

            {values.offerLetterOld ? (
              <div className="d-flex gap-2 mt-2">
                <Button
                  size="sm"
                  color="info"
                  onClick={() =>
                    handleFilePreview({
                      url: values.offerLetterOld,
                      originalName: "Offerletter",
                    }, "offerLetterOld")
                  }
                  disabled={uploading.offerLetterFile}
                >
                  {getFileActionLabel({
                    url: values.offerLetterOld,
                    originalName: "Offerletter",
                  }, "offerLetterOld")}
                </Button>

                <Button
                  size="sm"
                  onClick={() => offerLetterRef.current.click()}
                  disabled={uploading.offerLetterFile}
                >
                  {uploading.offerLetterFile ? (
                    <>
                      <Spinner size="sm" className="me-1" /> Uploading
                    </>
                  ) : (
                    "Upload New file"
                  )}
                </Button>
              </div>
            ) : (
              <div className="d-block">
                <Button
                  size="sm"
                  onClick={() => offerLetterRef.current.click()}
                  disabled={uploading.offerLetterFile}
                >
                  {uploading.offerLetterFile ? (
                    <>
                      <Spinner size="sm" className="me-1" /> Uploading
                    </>
                  ) : (
                    "Upload file"
                  )}
                </Button>
              </div>
            )}

            {errorText("offerLetterOld")}
          </Col>

          {/* FATHER NAME */}
          <Col md={6}>
            <Label htmlFor="father">
              Father's Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="father"
              name="father"
              value={values.father}
              onChange={handleChange}
              invalid={touched.father && errors.father}
              onBlur={() => setFieldTouched("father", true)}
            />
            {errorText("father")}
          </Col>

          {/* MOBILE */}
          <Col md={6}>
            <Label htmlFor="mobile">
              Mobile No <span className="text-danger">*</span>
            </Label>

            <PhoneInputWithCountrySelect
              name="mobile"
              id="mobile"
              min="10"
              value={values.mobile}
              onChange={(value) =>
                handleChange({
                  target: {
                    name: "mobile",
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
              onBlur={() => setFieldTouched("mobile", true)}
            />

            {errorText("mobile")}
          </Col>

          {/* OFFICIAL EMAIL */}
          <Col md={6}>
            <Label htmlFor="officialEmail">Official Email</Label>
            <Input
              id="officialEmail"
              type="email"
              name="officialEmail"
              value={values.officialEmail}
              onChange={handleChange}
            />
          </Col>

          {/* EMAIL */}
          <Col md={6}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
            />
          </Col>

          {/* MONTHLY CTC */}
          <Col md={6}>
            <Label htmlFor="monthlyCTC">Monthly CTC</Label>
            <Input
              id="monthlyCTC"
              type="number"
              name="monthlyCTC"
              value={values.monthlyCTC}
              onChange={handleChange}
            />
          </Col>

          {/* BIOMETRIC ID */}
          <Col md={6}>
            <Label htmlFor="biometricId">Biometric ID</Label>
            <Input
              id="biometricId"
              type="number"
              name="biometricId"
              value={values.biometricId}
              onChange={handleChange}
            />
          </Col>

          {/* LINK USERS */}
          {mode !== "NEW_JOINING" && (
            <Col md={12}>
              <Label htmlFor="users">Link With Associated Users</Label>
              <div className="d-flex gap-2">
                <div className="flex-grow-1">
                  <AsyncSelect
                    inputId="users"
                    isMulti
                    defaultOptions
                    loadOptions={loadUserOptions}
                    placeholder="Search and select users..."
                    value={values.users}
                    onChange={(selectedOptions) =>
                      setFieldValue("users", selectedOptions || [])
                    }
                  />
                </div>
                <Button
                  color="primary"
                  className="text-white"
                  onClick={handleLinkUsers}
                  disabled={linking}
                >
                  {linking ? <Spinner size="sm" /> : "Link"}
                </Button>
              </div>
            </Col>
          )}
        </Row>

        <Col xs={12} className="mt-4">
          <h5 className="fw-semibold mb-1">Finance Details</h5>
          <hr className="mt-0" />
        </Col>

        <Row className="g-3 mx-2">

          {/* EMPLOYEE GROUPS */}
          <Col md={6}>
            <Label htmlFor="employeeGroups">Employee Group</Label>
            <Select
              inputId="employeeGroups"
              options={employeeGroupOptions}
              value={
                employeeGroupOptions.find(
                  (opt) => opt.value === values.employeeGroups,
                ) || null
              }
              onChange={(opt) => setFieldValue("employeeGroups", opt.value)}
            />
          </Col>

          {/* ACCOUNT */}
          <Col md={6}>
            <Label htmlFor="account">Account</Label>
            <Select
              inputId="account"
              options={accountOptions}
              value={
                accountOptions.find(
                  (opt) => opt.value === values.account,
                ) || null
              }
              onChange={(opt) => setFieldValue("account", opt.value)}
            />
          </Col>

          {/* MINIMUM WAGES */}
          <Col md={6}>
            <Label htmlFor="minimumWages">Minimum Wages</Label>
            <Input
              id="minimumWages"
              type="number"
              name="minimumWages"
              value={values.minimumWages}
              onChange={handleChange}
            />
          </Col>

          {/* Short WAGES */}
          <Col md={6}>
            <Label htmlFor="shortWages">Short Wages</Label>
            <Input
              disabled
              id="shortWages"
              type="number"
              name="shortWages"
              value={values.shortWages}
              onChange={handleChange}
            />
          </Col>

          {/* GROSS SALARY */}
          <Col md={6}>
            <Label htmlFor="grossSalary">Gross Salary</Label>
            <Input
              id="grossSalary"
              type="number"
              name="grossSalary"
              value={values.grossSalary}
              onChange={handleChange}
              onBlur={() => setFieldTouched("grossSalary", true)}

            />
            {errorText("grossSalary")}
          </Col>

          {/* BASIC AMOUNT */}
          <Col md={6}>
            <Label htmlFor="basicAmount">Basic Amount</Label>
            <Input
              id="basicAmount"
              type="number"
              name="basicAmount"
              value={values.basicAmount}
              onChange={handleChange}
            />
            {errorText("basicAmount")}
          </Col>

          {/* BASIC PERCENTAGE */}
          <Col md={6}>
            <Label htmlFor="basicPercentage">Basic Percentage</Label>
            <Input
              disabled
              id="basicPercentage"
              type="number"
              name="basicPercentage"
              value={values.basicPercentage}
              onChange={handleChange}
            />
            {errorText("basicPercentage")}
          </Col>

          {/* HRA */}
          <Col md={6}>
            <Label htmlFor="HRA">HRA</Label>
            <Input
              id="HRA"
              type="number"
              name="HRAAmount"
              value={values.HRAAmount}
              onChange={handleChange}
            />
          </Col>

          {/* HRA PERCENTAGE */}
          <Col md={6}>
            <Label htmlFor="HRAPercentage">HRA Percentage</Label>
            <Input
              disabled
              id="HRAPercentage"
              type="number"
              name="HRAPercentage"
              value={values.HRAPercentage}
              onChange={handleChange}
            />
            {errorText("HRAPercentage")}
          </Col>

          {/* SPECIAL ALLOWANCE */}
          <Col md={6}>
            <Label htmlFor="SPLAllowance">SPL Allowance</Label>
            <Input
              name="SPLAllowance"
              type="number"
              value={values.SPLAllowance}
              onChange={(e) => {
                setManual(prev => ({
                  ...prev,
                  SPLAllowance: true
                }));
                handleChange(e);
              }}
            />
          </Col>

          {/* CONVEYANCE ALLOWANCE */}
          <Col md={6}>
            <Label htmlFor="conveyanceAllowance">Conveyance Allowance</Label>
            <Input
              id="conveyanceAllowance"
              type="number"
              name="conveyanceAllowance"
              value={values.conveyanceAllowance}
              onChange={handleChange}
            />
          </Col>


          {/* STATUTORY BONUS */}
          <Col md={6}>
            <Label htmlFor="statutoryBonus">Statutory Bonus</Label>
            <Input
              id="statutoryBonus"
              type="number"
              name="statutoryBonus"
              value={values.statutoryBonus}
              onChange={handleChange}
            />
          </Col>

          {/* INSURANCE */}
          <Col md={6}>
            <Label htmlFor="insurance">Insurance</Label>
            <Input
              id="insurance"
              type="number"
              name="insurance"
              value={values.insurance}
              onChange={handleChange}
            />
          </Col>

          {/* LWF SALARY */}
          <Col md={6}>
            <Label htmlFor="LWFSalary">LWF Salary</Label>
            <Input
              id="LWFSalary"
              type="number"
              name="LWFSalary"
              value={values.LWFSalary}
              onChange={handleChange}
            />
          </Col>

          {/* LWF EMPLOYEE */}
          <Col md={6}>
            <Label htmlFor="LWFEmployee">LWF Employee</Label>
            <Input
              id="LWFEmployee"
              type="number"
              name="LWFEmployee"
              value={values.LWFEmployee}
              onChange={handleChange}
            />
          </Col>

          {/* LWF EMPLOYER */}
          <Col md={6}>
            <Label htmlFor="LWFEmployer">LWF Employer</Label>
            <Input
              id="LWFEmployer"
              type="number"
              name="LWFEmployer"
              value={values.LWFEmployer}
              onChange={handleChange}
            />
          </Col>

          {/* ESIC SALARY */}
          <Col md={6}>
            <Label htmlFor="ESICSalary">ESIC Salary</Label>
            <Input
              id="ESICSalary"
              type="number"
              name="ESICSalary"
              value={values.ESICSalary}
              onChange={handleChange}
            />
          </Col>

          {/* ESIC EMPLOYEE */}
          <Col md={6}>
            <Label htmlFor="ESICEmployee">ESIC Employee</Label>
            <Input
              disabled
              id="ESICEmployee"
              type="number"
              name="ESICEmployee"
              value={values.ESICEmployee}
              onChange={handleChange}
            />
          </Col>

          {/* ESIC EMPLOYER */}
          <Col md={6}>
            <Label htmlFor="ESICEmployer">ESIC Employer</Label>
            <Input
              disabled
              id="ESICEmployer"
              type="number"
              name="ESICEmployer"
              value={values.ESICEmployer}
              onChange={handleChange}
            />
          </Col>

          {/* TDS RATE */}
          <Col md={6}>
            <Label htmlFor="TDSRate">TDS Rate</Label>
            <Input
              id="TDSRate"
              type="number"
              name="TDSRate"
              value={values.TDSRate}
              onChange={handleChange}
            />
          </Col>

          {/* PT */}
          <Col md={6}>
            <Label htmlFor="PT">PT</Label>
            <Input
              disabled
              id="PT"
              type="number"
              name="PT"
              value={values.PT}
              onChange={handleChange}
            />
          </Col>

          {/* PF AMOUNT */}
          <Col md={6}>
            <Label htmlFor="PFAmount">PF Amount</Label>
            <Input
              disabled
              id="PFAmount"
              type="number"
              name="PFAmount"
              value={values.PFAmount}
              onChange={handleChange}
            />
          </Col>

          {/* PF EMPLOYEE */}
          <Col md={6}>
            <Label htmlFor="PFEmployee">PF Employee Contribution</Label>
            <Input
              disabled
              id="PFEmployee"
              type="number"
              name="PFEmployee"
              value={values.PFEmployee}
              onChange={handleChange}
            />
          </Col>

          {/* PF EMPLOYER */}
          <Col md={6}>
            <Label htmlFor="PFEmployer">PF Employer Contribution</Label>
            <Input
              disabled
              id="PFEmployer"
              type="number"
              name="PFEmployer"
              value={values.PFEmployer}
              onChange={handleChange}
            />
          </Col>

          {/* IN HAND SALARY */}
          <Col md={6}>
            <Label htmlFor="inHandSalary">In Hand Salary</Label>
            <Input
              disabled
              id="inHandSalary"
              type="number"
              name="inHandSalary"
              value={values.inHandSalary}
              onChange={handleChange}
            />
          </Col>

          {/* DEBIT STATEMENT NARRATION */}
          <Col md={6}>
            <Label htmlFor="debitStatementNarration">
              Debit Statement Narration
            </Label>

            <Input
              id="debitStatementNarration"
              name="debitStatementNarration"
              value={values.debitStatementNarration}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "debitStatementNarration",
                    value: e.target.value.toUpperCase(),
                  },
                })
              }
            />
          </Col>
        </Row>

        <div className="d-flex gap-2 justify-content-end my-4 mx-3">
          {view === "MODAL" && (
            <Button
              color="secondary"
              className="text-white"
              onClick={onCancel}
              disabled={form.isSubmitting}
            >
              Cancel
            </Button>
          )}
          {(mode !== "NEW_JOINING" ||
            view !== "PAGE" ||
            hasCreatePermission) && (
              <Button
                color="primary"
                className="text-white"
                onClick={form.handleSubmit}
                disabled={
                  isSubmitting || !isValid || (isEdit && !initialData?._id)
                }
              >
                {isSubmitting ? (
                  <Spinner size="sm" />
                ) : initialData ? (
                  "Update Employee"
                ) : (
                  "Save Employee"
                )}
              </Button>
            )}

          {/* <Button onClick={() => console.log(errors)}>
            test
          </Button> */}
        </div>
      </div >
      <PreviewFile
        file={previewFile}
        isOpen={previewOpen}
        toggle={() => setPreviewOpen(false)}
      />
    </>
  );
};

EmployeeForm.propTypes = {
  initialData: PropTypes.object,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  view: PropTypes.oneOf(["MODAL", "PAGE"]),
  mode: PropTypes.string,
  hasCreatePermission: PropTypes.bool,
};

export default EmployeeForm;
