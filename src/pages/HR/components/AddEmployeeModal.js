import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Row,
    Col,
    Label,
    Input,
    FormFeedback,
    Spinner,
} from "reactstrap";
import Select from "react-select";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { editEmployee, getEmployeeId, postEmployee } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import PhoneInputWithCountrySelect, { isValidPhoneNumber } from "react-phone-number-input";
import PreviewFile from "../../../Components/Common/PreviewFile";

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
    panFile: Yup.mixed().test(
        "required-pan-file",
        "PAN file is required",
        function (value) {
            const { panOld } = this.parent;
            if (!isEdit) return value instanceof File;
            if (!panOld && !value) return false;
            return true;
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

const AddEmployeeModal = ({ isOpen, toggle, initialData, onUpdate, mode }) => {

    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const handleAuthError = useAuthError();
    const isEdit = !!initialData?._id;

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

    const payrollOptions = [
        { value: "ON_ROLL", label: "On Roll" },
        { value: "OFF_ROLL", label: "Off Roll" },
    ];

    const statusOptions = [
        { value: "ACTIVE", label: "Active" },
        { value: "FNF_CLOSED", label: "FNF Closed" },
        { value: "RESIGNED", label: "Resigned" },
    ];

    const genderOptions = [
        { value: "MALE", label: "Male" },
        { value: "FEMALE", label: "Female" },
        { value: "OTHER", label: "Other" },
    ]

    const cleanedInitialData = initialData
        ? {
            ...initialData,

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
                    : initialData?.eCode
                        ? `${initialData.eCode.prefix}${initialData.eCode.value}`
                        : "",
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
        initialValues: cleanedInitialData || {
            name: "",
            eCode: "",
            department: "",
            firstLocation: "",
            transferredFrom: "",
            currentLocation: "",
            employmentType: "",
            state: "",
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
            panFile: null,
            adharFile: null,
            offerLetterFile: null,

        },
        validationSchema: validationSchema(mode, isEdit),
        onSubmit: async (values) => {
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
                }

                if (initialData?._id) {
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
                    await editEmployee(initialData._id, formData);
                    toast.success("Employee updated successfully");
                } else {
                    formData.delete("panOld");
                    formData.delete("offerLetterOld");
                    formData.delete("adharOld");
                    await postEmployee(formData);
                    toast.success("Employee added successfully");
                }

                form.resetForm();
                toggle();
                onUpdate();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to save employee");
                }
            }
        }



    });

    const { values, errors, touched, isSubmitting, handleChange, setFieldValue } = form;

    const errorText = (field) =>
        touched[field] && errors[field] ? (
            <div className="text-danger small">{errors[field]}</div>
        ) : null;

    const generateEmployeeId = async () => {
        try {
            const response = await getEmployeeId();
            console.log(response)
            form.setFieldValue("eCode", response.payload.value);
        } catch (error) {
            if (!handleAuthError) {
                toast.error("Failed to generate employee id");
            }
        }
    }

    useEffect(() => {
        if (isOpen && !initialData?._id && mode !== "NEW_JOINING") {
            generateEmployeeId();
        }
    }, [isOpen, initialData, mode]);


    return (
        <>

            <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
                <ModalHeader toggle={toggle}>
                    {initialData ? "Edit Employee" : "Add Employee"}
                </ModalHeader>

                <ModalBody>
                    <Row className="g-3">
                        {/* EMPLOYEE CODE */}
                        {mode !== "NEW_JOINING" && (
                            <Col md={6}>
                                <Label htmlFor="eCode">ECode</Label>
                                <Input
                                    name="eCode"
                                    id="eCode"
                                    disabled
                                    value={values.eCode}
                                    onChange={handleChange}
                                    invalid={touched.eCode && errors.eCode}
                                />
                                <FormFeedback>{errors.eCode}</FormFeedback>
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
                            <FormFeedback>{errors.name}</FormFeedback>
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
                            <FormFeedback>{errors.department}</FormFeedback>
                        </Col>

                        {/* DESIGNATION */}
                        <Col md={6}>
                            <Label htmlFor="designation">
                                Designation <span className="text-danger">*</span>
                            </Label>
                            <Input
                                name="designation"
                                id="designation"
                                value={values.designation}
                                onChange={handleChange}
                                invalid={touched.designation && errors.designation}
                            />
                            <FormFeedback>{errors.designation}</FormFeedback>
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
                            <FormFeedback>{errors.employmentType}</FormFeedback>
                        </Col>


                        {/* FIRST LOCATION */}
                        <Col md={6}>
                            <Label htmlFor="firstLocation">
                                First Location <span className="text-danger">*</span>
                            </Label>
                            <Select
                                id="firstLocation"
                                options={centerOptions}
                                value={centerOptions.find((o) => o.value === values.firstLocation)}
                                onChange={(opt) => setFieldValue("firstLocation", opt.value)}
                            />
                            {errorText("firstLocation")}
                        </Col>

                        {/* TRANSFERRED FROM */}
                        {mode !== "NEW_JOINING" && (
                            <Col md={6}>
                                <Label htmlFor="transferredFrom">Transferred From</Label>
                                <Select
                                    id="transferredFrom"
                                    options={centerOptions}
                                    value={centerOptions.find((o) => o.value === values.transferredFrom)}
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
                                id="currentLocation"
                                options={centerOptions}
                                value={centerOptions.find((o) => o.value === values.currentLocation)}
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
                                id="payroll"
                                options={payrollOptions}
                                value={payrollOptions.find(opt => opt.value === values.payrollType) || null}
                                onChange={(opt) => setFieldValue("payrollType", opt.value)}
                            />
                            {errorText("payrollType")}
                        </Col>

                        {/* DATE OF JOINING */}
                        <Col md={6}>
                            <Label>
                                Date of Joining <span className="text-danger">*</span>
                            </Label>
                            <Input
                                type="date"
                                name="joinningDate"
                                value={values.joinningDate}
                                onChange={handleChange}
                                invalid={touched.joinningDate && errors.joinningDate}
                            />
                            <FormFeedback>{errors.joinningDate}</FormFeedback>
                        </Col>

                        {/* STATUS */}
                        {mode !== "NEW_JOINING" && (
                            <Col md={6}>
                                <Label>Status</Label>
                                <Select
                                    options={statusOptions}
                                    value={statusOptions.find(opt => opt.value === values.status) || null}
                                    onChange={(opt) => setFieldValue("status", opt.value)}
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
                                id="gender"
                                options={genderOptions}
                                value={genderOptions.find(opt => opt.value === values.gender) || null}
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
                            <FormFeedback>{errors.dateOfBirth}</FormFeedback>
                        </Col>
                        {/* BANK NAME */}
                        <Col md={6}>
                            <Label htmlFor="bankName">
                                Bank Name <span className="text-danger">*</span>
                            </Label>
                            <Input
                                name="bankName"
                                value={values.bankName}
                                onChange={handleChange}
                                invalid={touched.bankName && errors.bankName}
                            />
                            <FormFeedback>{errors.bankName}</FormFeedback>
                        </Col>
                        {/* BANK ACCOUNT */}
                        <Col md={6}>
                            <Label>
                                Bank Account No <span className="text-danger">*</span>
                            </Label>
                            <Input
                                name="accountNo"
                                value={values.accountNo}
                                onChange={handleChange}
                                invalid={touched.accountNo && errors.accountNo}
                            />
                            <FormFeedback>{errors.accountNo}</FormFeedback>
                        </Col>

                        {/* IFSC */}
                        <Col md={6}>
                            <Label>
                                IFSC Code <span className="text-danger">*</span>
                            </Label>
                            <Input
                                name="IFSCCode"
                                value={values.IFSCCode}
                                onChange={handleChange}
                                invalid={touched.IFSCCode && errors.IFSCCode}
                            />
                            <FormFeedback>{errors.IFSCCode}</FormFeedback>
                        </Col>

                        {/* PF APPLICABLE */}
                        <Col md={6}>
                            <Label>PF Applicable</Label>
                            <Select
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
                            <Label>UAN No</Label>
                            <Input
                                name="uanNo"
                                value={values.uanNo}
                                onChange={handleChange}
                            />
                        </Col>

                        {/* PF NO */}
                        <Col md={6}>
                            <Label>PF No</Label>
                            <Input
                                name="pfNo"
                                value={values.pfNo}
                                onChange={handleChange}
                            />
                        </Col>

                        {/* ESIC */}
                        <Col md={6}>
                            <Label>ESIC IP Code</Label>
                            <Input
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
                                name="adharNo"
                                id="adharFile"
                                value={values.adharNo}
                                onChange={handleChange}
                                invalid={touched.adharNo && errors.adharNo}
                            />
                            <FormFeedback>{errors.adharNo}</FormFeedback>
                        </Col>

                        {/* AADHAAR FILE */}
                        <Col md={6}>
                            <Label>Aadhaar File <span className="text-danger">*</span></Label>

                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                hidden
                                ref={adharFileRef}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setFieldValue("adharFile", file);
                                        setFieldValue("adharOld", "");
                                        setPreviewFile({
                                            url: URL.createObjectURL(file),
                                            type: file.type,
                                        });
                                    }
                                }}
                            />

                            {values.adharFile && (
                                <div className="d-flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        color="info"
                                        onClick={() => {
                                            setPreviewFile({
                                                url: URL.createObjectURL(values.adharFile),
                                                type: values.adharFile.type,
                                            });
                                            setPreviewOpen(true);
                                        }}
                                    >
                                        Preview New File
                                    </Button>

                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="text-white"
                                        onClick={() => adharFileRef.current.click()}
                                    >
                                        Upload New File
                                    </Button>
                                </div>
                            )}

                            {!values.adharFile && values.adharOld && (
                                <div className="d-flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        color="info"
                                        onClick={() => {
                                            setPreviewFile({
                                                url: values.adharOld,
                                                type: getPreviewType(values.adharOld),
                                            });
                                            setPreviewOpen(true);
                                        }}
                                    >
                                        Preview Old File
                                    </Button>

                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="text-white"
                                        onClick={() => adharFileRef.current.click()}
                                    >
                                        Upload New File
                                    </Button>
                                </div>
                            )}

                            {!isEdit && !values.adharFile && !values.adharOld && (
                                <div className="mt-2">
                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="text-white"
                                        onClick={() => adharFileRef.current.click()}
                                    >
                                        Select File
                                    </Button>
                                </div>
                            )}

                            {touched.adharFile && errors.adharFile && (
                                <div className="text-danger small mt-1">{errors.adharFile}</div>
                            )}
                        </Col>



                        {/* PAN NO*/}
                        <Col md={6}>
                            <Label>
                                PAN No<span className="text-danger">*</span>
                            </Label>

                            <Input
                                name="pan"
                                value={values.pan}
                                onChange={handleChange}
                                invalid={touched.pan && errors.pan}
                            />
                            <FormFeedback>{errors.pan}</FormFeedback>
                        </Col>

                        {/* PAN FILE */}
                        <Col md={6}>
                            <Label>PAN File <span className="text-danger">*</span></Label>

                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                hidden
                                ref={panFileRef}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setFieldValue("panFile", file);
                                        setFieldValue("panOld", "");
                                        setPreviewFile({
                                            url: URL.createObjectURL(file),
                                            type: file.type,
                                        });
                                    }
                                }}
                            />

                            {values.panFile && (
                                <div className="d-flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        color="info"
                                        onClick={() => {
                                            setPreviewFile({
                                                url: URL.createObjectURL(values.panFile),
                                                type: values.panFile.type,
                                            });
                                            setPreviewOpen(true);
                                        }}
                                    >
                                        Preview New File
                                    </Button>

                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="text-white"
                                        onClick={() => panFileRef.current.click()}
                                    >
                                        Upload New File
                                    </Button>
                                </div>
                            )}

                            {!values.panFile && values.panOld && (
                                <div className="d-flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        color="info"
                                        onClick={() => {
                                            setPreviewFile({
                                                url: values.panOld,
                                                type: getPreviewType(values.panOld),
                                            });
                                            setPreviewOpen(true);
                                        }}
                                    >
                                        Preview Old File
                                    </Button>

                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="text-white"
                                        onClick={() => panFileRef.current.click()}
                                    >
                                        Upload New File
                                    </Button>
                                </div>
                            )}

                            {!isEdit && !values.panFile && !values.panOld && (
                                <div className="mt-2">
                                    <Button
                                        size="sm"
                                        color="primary"
                                        onClick={() => panFileRef.current.click()}
                                    >
                                        Select File
                                    </Button>
                                </div>
                            )}

                            {touched.panFile && errors.panFile && (
                                <div className="text-danger small mt-1">{errors.panFile}</div>
                            )}
                        </Col>





                        {/* FATHER NAME */}
                        <Col md={6}>
                            <Label htmlFor="father">Father's Name <span className="text-danger">*</span></Label>
                            <Input
                                name="father"
                                id="father"
                                value={values.father}
                                onChange={handleChange}
                                invalid={touched.father && errors.father}
                            />
                            <FormFeedback>{errors.father}</FormFeedback>
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
                            <Label>Official Email</Label>
                            <Input
                                type="email"
                                name="officialEmail"
                                value={values.officialEmail}
                                onChange={handleChange}
                            />
                        </Col>

                        {/* EMAIL */}
                        <Col md={6}>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                            />
                        </Col>

                        {/* MONTHLY CTC */}
                        <Col md={6}>
                            <Label>Monthly CTC</Label>
                            <Input
                                type="number"
                                name="monthlyCTC"
                                value={values.monthlyCTC}
                                onChange={handleChange}
                            />
                        </Col>

                        {/* OFFER LETTER FILE */}
                        <Col md={6}>
                            <Label>Offer Letter <span className="text-danger">*</span></Label>

                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                hidden
                                ref={offerLetterRef}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setFieldValue("offerLetterFile", file);
                                        setFieldValue("offerLetterOld", "");
                                        setPreviewFile({
                                            url: URL.createObjectURL(file),
                                            type: file.type,
                                        });
                                    }
                                }}
                            />

                            {values.offerLetterFile && (
                                <div className="d-flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        color="info"
                                        onClick={() => {
                                            setPreviewFile({
                                                url: URL.createObjectURL(values.offerLetterFile),
                                                type: values.offerLetterFile.type,
                                            });
                                            setPreviewOpen(true);
                                        }}
                                    >
                                        Preview New File
                                    </Button>

                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="text-white"
                                        onClick={() => offerLetterRef.current.click()}
                                    >
                                        Upload New File
                                    </Button>
                                </div>
                            )}

                            {!values.offerLetterFile && values.offerLetterOld && (
                                <div className="d-flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        color="info"
                                        onClick={() => {
                                            setPreviewFile({
                                                url: values.offerLetterOld,
                                                type: getPreviewType(values.offerLetterOld),
                                            });
                                            setPreviewOpen(true);
                                        }}
                                    >
                                        Preview Old File
                                    </Button>

                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="text-white"
                                        onClick={() => offerLetterRef.current.click()}
                                    >
                                        Upload New File
                                    </Button>
                                </div>
                            )}

                            {!isEdit && !values.offerLetterFile && !values.offerLetterOld && (
                                <div className="mt-2">
                                    <Button
                                        size="sm"
                                        color="primary"
                                        onClick={() => offerLetterRef.current.click()}
                                    >
                                        Select File
                                    </Button>
                                </div>
                            )}

                            {touched.offerLetterFile && errors.offerLetterFile && (
                                <div className="text-danger small mt-1">{errors.offerLetterFile}</div>
                            )}
                        </Col>

                    </Row>
                </ModalBody>

                <ModalFooter>
                    <Button color="secondary" className="text-white" onClick={toggle}>
                        Cancel
                    </Button>
                    <Button color="primary" className="text-white" onClick={form.handleSubmit}>
                        {isSubmitting ? (
                            <Spinner size={"sm"} />
                        ) : (
                            initialData ? "Update Employee" : "Save Employee"
                        )}
                    </Button>
                    {/* <Button onClick={() => console.log(errors)}>
                        test
                    </Button> */}
                </ModalFooter>
            </Modal>
            <PreviewFile
                file={previewFile}
                isOpen={previewOpen}
                toggle={() => setPreviewOpen(false)}
            />
        </>
    );
};

export default AddEmployeeModal;
const getPreviewType = (url) => {
    if (!url) return "";

    const lower = url.toLowerCase();

    if (lower.endsWith(".pdf")) return "application/pdf";

    if (
        lower.endsWith(".png") ||
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".webp")
    ) return "image/jpeg";

    return "image/jpeg"; // fallback
};
