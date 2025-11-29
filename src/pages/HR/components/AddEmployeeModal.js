import { useEffect } from "react";
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
import PhoneInputWithCountrySelect from "react-phone-number-input";

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
    dateOfBirth: Yup.string().required("Date of birth is required"),
    mobile: Yup.string().required("Mobile number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    monthlyCTC: Yup.number().required("Monthly CTC is Required"),
    status: mode === "NEW_JOINING"
        ? Yup.string().oneOf(["NEW_JOINING"])
        : Yup.string()
            .oneOf(["ACTIVE", "FNF_CLOSED", "RESIGNED"])
            .required("Status is required"),
    pfApplicable: Yup.boolean()
        .required("PF Applicable is required")
        .typeError("PF Applicable must be YES or NO"),

});

const AddEmployeeModal = ({ isOpen, toggle, initialData, onUpdate, loading, setLoading, mode }) => {

    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const handleAuthError = useAuthError();

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
            employmentType:"",
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
        },
        validationSchema: validationSchema(mode, !!initialData?._id),
        onSubmit: async (values) => {
            try {
                const payload = { ...values };
                if (mode === "NEW_JOINING") {
                    payload.status = "NEW_JOINING";
                    delete payload.eCode;
                }
                if (mode === "NEW_JOINING" && initialData?._id) {
                    delete payload.eCode;
                    delete payload.status;
                }
                if (initialData?._id) {
                    delete payload.eCode;
                }
                if (initialData?._id) {
                    // Edit Employee
                    await editEmployee(initialData._id, payload);
                    onUpdate();
                    toast.success("Employee updated successfully");
                    form.resetForm();
                    toggle();
                    onUpdate();
                } else {
                    // Add Employee
                    await postEmployee(payload);
                    toast.success("Employee added successfully");
                    form.resetForm();
                    toggle();
                    onUpdate();
                }
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to save employee");
                }
            }
        },

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
                        <Label htmlFor="name">Employee Name</Label>
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
                        <Label htmlFor="department">Department</Label>
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
                        <Label htmlFor="designation">Designation</Label>
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
                        <Label htmlFor="employmentType">Employment</Label>
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
                        <Label htmlFor="firstLocation">First Location</Label>
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
                        <Label htmlFor="currentLocation">Current Location</Label>
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
                        <Label htmlFor="payroll">Payroll</Label>
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
                        <Label>Date of Joining</Label>
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
                        <Label htmlFor="gender">Gender</Label>
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
                        <Label htmlFor="dob">Date of Birth</Label>
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
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                            name="bankName"
                            value={values.bankName}
                            onChange={handleChange}
                        />
                    </Col>
                    {/* BANK ACCOUNT */}
                    <Col md={6}>
                        <Label>Bank Account No</Label>
                        <Input
                            name="accountNo"
                            value={values.accountNo}
                            onChange={handleChange}
                        />
                    </Col>

                    {/* IFSC */}
                    <Col md={6}>
                        <Label>IFSC Code</Label>
                        <Input
                            name="IFSCCode"
                            value={values.IFSCCode}
                            onChange={handleChange}
                        />
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

                    {/* AADHAAR */}
                    <Col md={6}>
                        <Label>Aadhaar No</Label>
                        <Input
                            name="adharNo"
                            value={values.adharNo}
                            onChange={handleChange}
                        />
                    </Col>

                    {/* PAN */}
                    <Col md={6}>
                        <Label>PAN</Label>
                        <Input
                            name="pan"
                            value={values.pan}
                            onChange={handleChange}
                        />
                    </Col>

                    {/* FATHER NAME */}
                    <Col md={6}>
                        <Label>Father's Name</Label>
                        <Input
                            name="father"
                            value={values.father}
                            onChange={handleChange}
                        />
                    </Col>

                    {/* MOBILE */}
                    <Col md={6}>
                        <Label htmlFor="mobile">Mobile No</Label>
                        <PhoneInputWithCountrySelect
                            name="mobile"
                            id="mobile"
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
                            invalid={touched.email && errors.email}
                        />
                        <FormFeedback>{errors.email}</FormFeedback>
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
                        <FormFeedback>{errors.monthlyCTC}</FormFeedback>
                    </Col>

                </Row>
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={form.handleSubmit}>
                    {isSubmitting ? (
                        <Spinner size={"sm"} />
                    ) : (
                        initialData ? "Update Employee" : "Save Employee"
                    )}
                </Button>
                <Button onClick={()=>console.log(errors)}>
                    test
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AddEmployeeModal;
