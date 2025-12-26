import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Button,
    Row,
    Col,
    Label,
    Input,
    Spinner,
} from "reactstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import PhoneInputWithCountrySelect, { isValidPhoneNumber } from "react-phone-number-input";
import PropTypes from "prop-types";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { editEmployee, getEmployeeId, postEmployee } from "../../../../helpers/backend_helper";
import { downloadFile } from "../../../../Components/Common/downloadFile";
import PreviewFile from "../../../../Components/Common/PreviewFile";
import { addDesignation, fetchDesignations } from "../../../../store/features/HR/hrSlice";
import { employeeGenderOptions, payrollOptions, statusOptions } from "../../../../Components/constants/HR";

const validationSchema = (mode, isEdit) => Yup.object({
    name: Yup.string().required("Employee name is required"),
    eCode:
        isEdit
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
    joinningDate: Yup.string().required("Date of joining is required"),
    gender: Yup.string().required("Gender is required"),
    pfApplicable: Yup.boolean().required("Pf Applicable is required"),
    father: Yup.string().required("Father's name is required"),
    dateOfBirth: Yup.string().required("Date of birth is required"),
    mobile: Yup.string().required("Mobile number is required").test("is-valid-phone", "Invalid phone number", function (value) {
        return isValidPhoneNumber(value || "");
    }),
    email: Yup.string().email("Invalid email").notRequired(),
    status: mode === "NEW_JOINING"
        ? Yup.string().oneOf(["NEW_JOINING"])
        : Yup.string()
            .oneOf(["ACTIVE", "FNF_CLOSED", "RESIGNED"])
            .required("Status is required"),
    bankName: Yup.string().required("Bank name is required"),
    accountNo: Yup.string().required("Bank account number is required"),
    IFSCCode: Yup.string().required("IFSC code is required"),
    adharNo: Yup.string().required("Aadhaar number is required"),
    pan: Yup.string().required("PAN number is required"),
    biometricId: Yup.string().trim(),
    panFile: Yup.mixed().test(
        "required-pan-file",
        "PAN file is required",
        function (value) {
            const { panOld } = this.parent;
            if (!isEdit) return !!value;
            return !!value || !!panOld;
        }
    ),

    adharFile: Yup.mixed().test(
        "required-adhar-file",
        "Aadhaar file is required",
        function (value) {
            const { adharOld } = this.parent;
            if (!isEdit) return value instanceof File;
            if (!adharOld && !value) return false;
            return true;
        }
    ),

    offerLetterFile: Yup.mixed().test(
        "required-offer-letter-file",
        "Offer letter is required",
        function (value) {
            const { offerLetterOld } = this.parent;
            if (!isEdit) return value instanceof File;
            if (!offerLetterOld && !value) return false;
            return true;
        }
    ),
});

const EmployeeForm = ({ initialData, onSuccess, view, onCancel, mode, hasCreatePermission }) => {
    const dispatch = useDispatch();
    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const { designations: designationOptions, designationLoading } = useSelector((state) => state.HR);
    const handleAuthError = useAuthError();
    const isEdit = !!initialData?._id;
    const [eCodeLoader, setECodeLoader] = useState(false);
    const [creatingDesignation, setCreatingDesignation] = useState(false);

    const [previewFile, setPreviewFile] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);

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
                dispatch(fetchDesignations({ status: ["APPROVED"] })).unwrap();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error("Something went wrong while getting the designations");
                }
            }
        };

        loadDesignations();
    }, []);

    const cleanedInitialData = initialData
        ? {
            ...initialData,
            designation: initialData?.designation?._id || "",
            IFSCCode: initialData?.bankDetails?.IFSCCode || "",
            bankName: initialData?.bankDetails?.bankName || "",
            accountNo: initialData?.bankDetails?.accountNo || "",
            firstLocation: initialData.firstLocation?._id || "",
            transferredFrom: initialData.transferredFrom?._id || "",
            currentLocation: initialData.currentLocation?._id || "",
            pan: initialData.pan?.number || "",
            adharNo: initialData?.adhar?.number || "",
            status: initialData?.status
                ? initialData.status
                : mode === "NEW_JOINING"
                    ? "NEW_JOINING"
                    : "",
            eCode:
                mode === "NEW_JOINING"
                    ? ""
                    : initialData?.eCode,
            panOld: initialData?.pan?.url || "",
            adharOld: initialData?.adhar?.url || "",
            offerLetterOld: initialData?.offerLetter || "",

            bankDetails: undefined,
            _id: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            newJoiningWorkflow: undefined
        }
        : null;

    const form = useFormik({
        enableReinitialize: true,
        validateOnMount: true,
        initialValues: cleanedInitialData || {
            name: "",
            eCode: "",
            department: "",
            firstLocation: "",
            transferredFrom: "",
            currentLocation: "",
            employmentType: "",
            state: "",
            exitDate: "",
            payrollType: "",
            joinningDate: "",
            status: mode === "NEW_JOINING" ? "NEW_JOINING" : "",
            gender: "",
            dateOfBirth: "",
            bankName: "",
            accountNo: "",
            IFSCCode: "",
            pfApplicable: null,
            uanNo: "",
            pfNo: "",
            esicIpCode: "",
            adharNo: "",
            designation: "",
            pan: "",
            father: "",
            mobile: "",
            officialEmail: "",
            email: "",
            monthlyCTC: 0,
            biometricId: "",
            panFile: null,
            adharFile: null,
            offerLetterFile: null,
        },
        validationSchema: validationSchema(mode, isEdit),
        onSubmit: async (values) => {

            touchFileFields();
            const errors = await form.validateForm();
            if (errors.panFile || errors.adharFile || errors.offerLetterFile) {
                return;
            }

            try {
                if (mode === "NEW_JOINING") {
                    values.status = "NEW_JOINING";
                } else {
                    values.status = values.status?.trim();
                }

                const formData = new FormData();

                Object.keys(values).forEach((key) => {
                    if (!["panFile", "adharFile", "offerLetterFile"].includes(key)) {
                        if (key === "eCode" && mode === "NEW_JOINING") return;
                        formData.append(key, values[key] ?? "");
                    }
                });

                if (values.panFile) formData.append("panFile", values.panFile);
                if (values.adharFile) formData.append("adharFile", values.adharFile);
                if (values.offerLetterFile) formData.append("offerLetterFile", values.offerLetterFile);

                if (initialData?._id) {
                    formData.delete("eCode");
                    formData.delete("_id");
                    formData.delete("panOld");
                    formData.delete("offerLetterOld");
                    formData.delete("adharOld");
                    formData.delete("bankDetails");
                    formData.delete("adhar");
                    formData.delete("newJoiningWorkflow");
                    formData.delete("createdAt");
                    formData.delete("updatedAt");
                    formData.delete("offerLetter");
                    formData.delete("exitStatus");
                    formData.delete("fnfStatus");
                    formData.delete("author");
                    formData.delete("itStatus");
                    formData.delete("users");
                    formData.delete("transferStatus");

                    await editEmployee(initialData._id, formData);
                    toast.success("Employee updated successfully");
                } else {
                    formData.delete("panOld");
                    formData.delete("offerLetterOld");
                    formData.delete("adharOld");

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
        }

    });

    const { values, errors, isSubmitting, handleChange, setFieldValue, setTouched, touched, isValid } = form;

    const touchFileFields = () => {
        setTouched(
            {
                ...form.touched,
                panFile: true,
                adharFile: true,
                offerLetterFile: true,
            },
            false
        );
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
            const response = await dispatch(addDesignation({ name: inputValue, status: mode === "NEW_JOINING" ? "PENDING" : "APPROVED" })).unwrap();
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
    }

    const handleDecideFilePreviewOrDownload = ({
        file,
        oldUrl,
    }) => {
        // if local file then preview
        if (file instanceof File) {
            setPreviewFile({
                url: URL.createObjectURL(file),
                type: file.type,
            });
            setPreviewOpen(true);
            return;
        }
        // if url then download
        if (oldUrl) {
            downloadFile({
                url: oldUrl,
            });
        }
    };


    useEffect(() => {
        if (!initialData?._id && mode !== "NEW_JOINING") {
            generateEmployeeId();
        }
    }, [initialData, mode]);

    useEffect(() => {
        if (isEdit) {
            form.setTouched({
                ...form.touched,
                panFile: true,
                adharFile: true,
                offerLetterFile: true,
            }, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit]);



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
                        />
                        {errorText("name")}
                    </Col>


                    {/* DEPARTMENT */}
                    <Col md={6}>
                        <Label htmlFor="department">
                            Department <span className="text-danger">*</span>
                        </Label>
                        <Input
                            id="department"
                            name="department"
                            value={values.department}
                            onChange={handleChange}
                            invalid={touched.department && errors.department}
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
                            isDisabled={designationLoading || (mode === "NEW_JOINING" && !hasCreatePermission)}
                            isLoading={designationLoading || creatingDesignation}
                            options={designationOptions}
                            value={
                                designationOptions.find(
                                    opt => opt.value === values.designation
                                ) || null
                            }
                            onChange={(option) =>
                                form.setFieldValue("designation", option ? option.value : "")
                            }
                            onBlur={() => form.setFieldTouched("designation", true)}
                            onCreateOption={handleCreateDesignation}

                        />

                        {errorText("designation")}
                    </Col>


                    {/* EMPLOYMENT */}
                    <Col md={6}>
                        <Label htmlFor="employmentType">
                            Employment <span className="text-danger">*</span>
                        </Label>
                        <Input
                            name="employmentType"
                            id="employmentType"
                            value={values.employmentType}
                            onChange={handleChange}
                            invalid={touched.employmentType && errors.employmentType}
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
                                    ? centerOptions.find(o => o.value === values.firstLocation)
                                    : null
                            }
                            onChange={(opt) => setFieldValue("firstLocation", opt.value)}
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
                                value={values.transferredFrom ? centerOptions.find((o) => o.value === values.transferredFrom) : null}
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
                            value={values.currentLocation ? centerOptions.find((o) => o.value === values.currentLocation) : null}
                            onChange={(opt) => setFieldValue("currentLocation", opt.value)}
                        />
                        {errorText("currentLocation")}
                    </Col>

                    {/* STATE */}
                    <Col md={6}>
                        <Label htmlFor="state">State</Label>
                        <Input
                            name="state"
                            id="state"
                            value={values.state}
                            onChange={handleChange}
                        />
                    </Col>

                    {/* PAYROLL */}
                    <Col md={6}>
                        <Label htmlFor="payroll">
                            Payroll <span className="text-danger">*</span>
                        </Label>
                        <Select
                            inputId="payroll"
                            options={payrollOptions}
                            value={payrollOptions.find(opt => opt.value === values.payrollType) || null}
                            onChange={(opt) => setFieldValue("payrollType", opt.value)}
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
                        />
                        {errorText("joinningDate")}
                    </Col>

                    {/* EXIT DATE */}
                    <Col md={6}>
                        <Label htmlFor="exitDate">
                            Last Working Day
                        </Label>
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
                            <Label htmlFor="status">Status <span className="text-danger">*</span></Label>
                            <Select
                                inputId="status"
                                options={statusOptions}
                                value={statusOptions.find(opt => opt.value === values.status) || null}
                                onChange={(opt) => setFieldValue("status", opt.value)}
                                isDisabled={isEdit && initialData?.status === "FNF_CLOSED"}
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
                            value={employeeGenderOptions.find(opt => opt.value === values.gender) || null}
                            onChange={(opt) => setFieldValue("gender", opt.value)}
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
                        />
                        {errorText("accountNo")}
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
                        />
                        {errorText("adharNo")}
                    </Col>

                    {/* ADHAAR FILE */}
                    <Col md={6}>
                        <Label>Aadhaar File <span className="text-danger">*</span></Label>

                        <input
                            type="file"
                            hidden
                            ref={adharFileRef}
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFieldValue("adharFile", file);
                                    setFieldValue("adharOld", "");

                                    form.setFieldTouched("adharFile", false, false);
                                    form.setFieldError("adharFile", undefined);
                                }
                            }}
                        />

                        {values.adharFile && (
                            <div className="d-flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    color="info"
                                    onClick={() =>
                                        handleDecideFilePreviewOrDownload({
                                            file: values.adharFile,
                                            oldUrl: values.adharOld,
                                        })
                                    }
                                >
                                    Preview
                                </Button>

                                <Button size="sm" onClick={() => adharFileRef.current.click()}>
                                    Change File
                                </Button>
                            </div>
                        )}

                        {!values.adharFile && values.adharOld && (
                            <div className="d-flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    color="info"
                                    onClick={() => {
                                        handleDecideFilePreviewOrDownload({
                                            file: values.adharFile,
                                            oldUrl: values.adharOld,
                                        })
                                    }
                                    }
                                >
                                    Download
                                </Button>

                                <Button size="sm" onClick={() => adharFileRef.current.click()}>
                                    Upload New File
                                </Button>
                            </div>
                        )}

                        {!values.adharFile && !values.adharOld && (
                            <div className="mt-2">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        adharFileRef.current.click();
                                    }}
                                >
                                    Upload File
                                </Button>
                            </div>
                        )}

                        {errorText("adharFile")}
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
                        />
                        {errorText("pan")}
                    </Col>

                    {/* PAN FILE */}
                    <Col md={6}>
                        <Label>PAN File <span className="text-danger">*</span></Label>

                        <input
                            type="file"
                            hidden
                            ref={panFileRef}
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFieldValue("panFile", file);
                                    setFieldValue("panOld", "");

                                    form.setFieldTouched("panFile", false, false);
                                    form.setFieldError("panFile", undefined);
                                }
                            }}
                        />

                        {values.panFile && (
                            <div className="d-flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    color="info"
                                    onClick={() =>
                                        handleDecideFilePreviewOrDownload({
                                            file: values.panFile,
                                            oldUrl: values.panOld,
                                        })
                                    }
                                >
                                    Preview
                                </Button>

                                <Button size="sm" onClick={() => panFileRef.current.click()}>
                                    Change File
                                </Button>
                            </div>
                        )}

                        {!values.panFile && values.panOld && (
                            <div className="d-flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    color="info"
                                    onClick={() =>
                                        handleDecideFilePreviewOrDownload({
                                            file: values.panFile,
                                            oldUrl: values.panOld,
                                        })
                                    }
                                >
                                    Download
                                </Button>

                                <Button size="sm" onClick={() => panFileRef.current.click()}>
                                    Upload New File
                                </Button>
                            </div>
                        )}

                        {!values.panFile && !values.panOld && (
                            <div className="mt-2">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        panFileRef.current.click();
                                    }}
                                >
                                    Upload File
                                </Button>
                            </div>
                        )}

                        {errorText("panFile")}
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
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFieldValue("offerLetterFile", file);
                                    setFieldValue("offerLetterOld", "");

                                    form.setFieldTouched("offerLetterFile", false, false);
                                    form.setFieldError("offerLetterFile", undefined);
                                }
                            }}
                        />

                        {values.offerLetterFile && (
                            <div className="d-flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    color="info"
                                    onClick={() =>
                                        handleDecideFilePreviewOrDownload({
                                            file: values.offerLetterFile,
                                            oldUrl: values.offerLetterOld,
                                        })
                                    }
                                >
                                    Preview
                                </Button>

                                <Button size="sm" onClick={() => offerLetterRef.current.click()}>
                                    Change File
                                </Button>
                            </div>
                        )}

                        {!values.offerLetterFile && values.offerLetterOld && (
                            <div className="d-flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    color="info"
                                    onClick={() =>
                                        handleDecideFilePreviewOrDownload({
                                            file: values.offerLetterFile,
                                            oldUrl: values.offerLetterOld,
                                        })
                                    }
                                >
                                    Download
                                </Button>

                                <Button size="sm" onClick={() => offerLetterRef.current.click()}>
                                    Upload New File
                                </Button>
                            </div>
                        )}

                        {!values.offerLetterFile && !values.offerLetterOld && (
                            <div className="mt-2">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        offerLetterRef.current.click();
                                    }}
                                >
                                    Upload File
                                </Button>
                            </div>
                        )}

                        {errorText("offerLetterFile")}
                    </Col>

                    {/* FATHER NAME */}
                    <Col md={6}>
                        <Label htmlFor="father">Father's Name <span className="text-danger">*</span></Label>
                        <Input
                            id="father"
                            name="father"
                            value={values.father}
                            onChange={handleChange}
                            invalid={touched.father && errors.father}
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

                </Row>
                <div className="d-flex gap-2 justify-content-end my-4 mx-3">
                    {view === "MODAL" && <Button color="secondary" className="text-white" onClick={onCancel} disabled={form.isSubmitting}>
                        Cancel
                    </Button>}
                    {(mode !== "NEW_JOINING" || view !== "PAGE" || hasCreatePermission) && (
                        <Button
                            color="primary"
                            className="text-white"
                            onClick={form.handleSubmit}
                            disabled={
                                isSubmitting ||
                                !isValid ||
                                (isEdit && !initialData?._id)
                            }
                        >
                            {isSubmitting ? (
                                <Spinner size="sm" />
                            ) : (
                                initialData ? "Update Employee" : "Save Employee"
                            )}
                        </Button>
                    )}


                    {/* <Button onClick={() => console.log(errors)}>
                        test
                    </Button> */}
                </div>
            </div>
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
    hasCreatePermission: PropTypes.bool
};

export default EmployeeForm;
