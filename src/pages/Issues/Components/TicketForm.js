import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Label, Row, Col, Spinner, UncontrolledTooltip } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { getMyManager } from "../../../helpers/backend_helper";

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "38px",
        height: "38px",
    }),
};

const TicketForm = ({
    issueType,
    setIssueType,
    centers,
    selectedCenter,
    setSelectedCenter,
    employees,
    loadingEmployees,
    debouncedFetchEmployees,
    form,
    setForm,
    handleChange,
    handleFileChange,
    handleSubmit,
    loader,
    fileInputRef,
    canSubmit,

}) => {
    const [manager, setManager] = useState();
    const [managerId, setManagerId] = useState();
    const [loading, setLoading] = useState(false);
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const loadManager = async () => {
        setLoading(true);
        try {
            const res = await getMyManager(token);
            console.log("Manager", res);
            setManager(res?.data?.manager?.name)
            const managerId = res?.data?.manager?._id;
            setForm((prev) => ({
                ...prev,
                manager: managerId,
            }));

        } catch (error) {
            console.log(error);
            toast.error("Error fetching manager");
        } finally {
            setLoading(false);
        }
    }

    const isFormValid = () => {

        if (!selectedCenter) return false;

        if (!form.requestedFrom) return false;
        if (!form.contact) return false;

        if (issueType === "TECH" && !form.description) return false;

        if (issueType === "PURCHASE") {
            if (!form.itemName) return false;
            if (!form.itemQty) return false;
        }

        if (issueType === "REVIEW_SUBMISSION") {
            if (!form.responsibleReviewer) return false;
            if (!form.reviewTakenFrom) return false;
        }

        if (issueType === "HR") {
            if (!form.requestType) return false;
            if (!form.hrDescription) return false;
        }

        if (issueType === "FINANCE") {
            if (!form.financeDescription) return false;
            if (!form.financeIssueType) return false;
        }
        // if (!form.files || form.files.length === 0) return false;

        return true;
    };

    useEffect(() => {
        if (issueType === "HR") {
            loadManager();
        }
    }, [issueType]);

    const issueTypeOptions = [
        { value: "TECH", label: "TECH" },
        { value: "HR", label: "HR" },
        { value: "FINANCE", label: "FINANCE" }
        // { value: "PURCHASE", label: "PURCHASE" },
        // { value: "REVIEW_SUBMISSION", label: "REVIEW SUBMISSION" },
    ];

    return (
        <Form onSubmit={handleSubmit}>
            <Row className="g-4">

                {/* ISSUE TYPE */}
                <Col md={6}>
                    <Label className="fw-semibold">
                        Ticket Type <span className="text-danger">*</span>
                    </Label>

                    <Select
                        options={issueTypeOptions}
                        value={issueTypeOptions.find(opt => opt.value === issueType)}
                        onChange={(selected) => setIssueType(selected.value)}
                    // isDisabled={true}
                    />
                </Col>
                {/* CENTER */}
                <Col md={6}>
                    <Label className="fw-semibold">Center<span className="text-danger">*</span></Label>
                    <Select
                        placeholder="Select Center"
                        options={centers}
                        value={selectedCenter}
                        styles={selectStyles}
                        onChange={(option) => {
                            setSelectedCenter(option);
                            setForm({ ...form, center: option?.value });
                        }}
                    />
                </Col>

                {/* REQUESTED FROM */}
                <Col md={6}>
                    <Label className="fw-semibold">
                        Requested For<span className="text-danger">*</span>
                    </Label>
                    <Select
                        placeholder="Search employee..."
                        options={employees}
                        value={form.requestedFrom}
                        isLoading={loadingEmployees}
                        styles={selectStyles}
                        onInputChange={(value, { action }) => {
                            if (action === "input-change") {
                                debouncedFetchEmployees(value);
                            }
                        }}
                        onChange={(option) =>
                            setForm({ ...form, requestedFrom: option })
                        }
                    />
                </Col>

                <Col md={6}>
                    <Label className="fw-semibold">
                        Contact<span className="text-danger">*</span>
                    </Label>
                    <Input
                        type="tel"
                        name="contact"
                        rows="1"
                        maxLength={10}
                        value={form.contact || ""}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setForm({ ...form, contact: value });
                        }}
                    />
                </Col>




                {/* TECH */}
                {issueType === "TECH" && (
                    <Col md={12}>
                        <Label className="fw-semibold">Description<span className="text-danger">*</span></Label>
                        <Input
                            type="textarea"
                            rows="4"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </Col>
                )}

                {/* PURCHASE */}
                {issueType === "PURCHASE" && (
                    <>
                        <Col md={6}>
                            <Label className="fw-semibold">Item Name<span className="text-danger">*</span></Label>
                            <Input
                                name="itemName"
                                value={form.itemName}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Label className="fw-semibold">Item Quantity<span className="text-danger">*</span></Label>
                            <Input
                                type="number"
                                name="itemQty"
                                value={form.itemQty}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={12}>
                            <Label className="fw-semibold">Comment<span className="text-danger">*</span></Label>
                            <Input
                                type="textarea"
                                rows="3"
                                name="comment"
                                value={form.comment}
                                onChange={handleChange}
                            />
                        </Col>
                    </>
                )}

                {/* REVIEW */}
                {issueType === "REVIEW_SUBMISSION" && (
                    <>
                        <Col md={6}>
                            <Label className="fw-semibold">Responsible Reviewer<span className="text-danger">*</span></Label>
                            <Select
                                options={employees}
                                isLoading={loadingEmployees}
                                styles={selectStyles}
                                onInputChange={(value, { action }) => {
                                    if (action === "input-change") {
                                        debouncedFetchEmployees(value);
                                    }
                                }}
                                onChange={(option) =>
                                    setForm({ ...form, responsibleReviewer: option })
                                }
                            />
                        </Col>

                        <Col md={6}>
                            <Label className="fw-semibold">Review Taken From<span className="text-danger">*</span></Label>
                            <Select
                                options={employees}
                                isLoading={loadingEmployees}
                                styles={selectStyles}
                                onInputChange={(value, { action }) => {
                                    if (action === "input-change") {
                                        debouncedFetchEmployees(value);
                                    }
                                }}
                                onChange={(option) =>
                                    setForm({ ...form, reviewTakenFrom: option })
                                }
                            />
                        </Col>
                    </>
                )}

                {issueType === "HR" && (
                    <>
                        {/* REQUEST TYPE */}
                        <Col md={6}>
                            <Label className="fw-semibold">
                                Request Type<span className="text-danger">*</span>
                            </Label>
                            <Select
                                placeholder="Select Request Type"
                                options={[
                                    { value: "EMPLOYEE_LETTERS", label: "Employee letters" },
                                    { value: "PAYROLL_QUERIES", label: "Payroll queries" },
                                    { value: "ATTENDANCE_AND_LEAVE_MANAGEMENT", label: "Attendance and leave management" },
                                    { value: "POLICY_RELATED_QUERIES", label: "Policy-related queries" },
                                    { value: "EMPLOYEE_DATA_UPDATES", label: "Employee data updates" },
                                    { value: "ANNUAL_PERFORMANCE_REVIEW_REQUEST", label: "Annual Performance Review request" },
                                    { value: "GRIEVANCES_AND_DISCIPLINARY_CONCERNS", label: "Grievances and disciplinary concerns" },
                                ]}
                                value={form.requestType}
                                onChange={(option) =>
                                    setForm({ ...form, requestType: option })
                                }
                            />
                        </Col>

                        {/* Manager */}
                        <Col md={6}>
                            <Label className="fw-semibold">
                                Manager<span className="text-danger">*</span>
                            </Label>

                            <div style={{ position: "relative" }}>
                                <Input
                                    type="text"
                                    name="manager"
                                    value={manager || "No Manager"}
                                    className={`pe-5 ${!manager ? "text-danger" : ""}`}
                                    disabled
                                />

                                {loading && (
                                    <Spinner
                                        size="sm"
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            right: "10px",
                                            transform: "translateY(-50%)",
                                        }}
                                    />
                                )}
                            </div>
                        </Col>

                        {/* DESCRIPTION FULL WIDTH */}
                        <Col md={12}>
                            <Label className="fw-semibold">
                                Description<span className="text-danger">*</span>
                            </Label>
                            <Input
                                type="textarea"
                                name="hrDescription"
                                rows="3"
                                value={form.hrDescription || ""}
                                onChange={handleChange}
                            />
                        </Col>
                    </>
                )}


                {issueType === "FINANCE" && (
                    <>
                        {/* REQUEST TYPE */}
                        <Col md={6}>
                            <Label className="fw-semibold">
                                Request Type<span className="text-danger">*</span>
                            </Label>
                            <Select
                                placeholder="Select Request Type"
                                options={[
                                    { value: "SALARY_SLIPS", label: "Salary Slips" },
                                    { value: "SALARY/COMPLIANCE", label: "Salary/Compliance" },
                                    { value: "TAX", label: "Tax" },
                                ]}
                                value={form.financeIssueType}
                                onChange={(option) =>
                                    setForm({ ...form, financeIssueType: option })
                                }
                            />
                        </Col>


                        {/* DESCRIPTION FULL WIDTH */}
                        <Col md={12}>
                            <Label className="fw-semibold">
                                Description<span className="text-danger">*</span>
                            </Label>
                            <Input
                                type="textarea"
                                name="financeDescription"
                                rows="3"
                                value={form.financeDescription || ""}
                                onChange={handleChange}
                            />
                        </Col>
                    </>
                )}
                {/* FILE UPLOAD */}
                <Col md={12}>
                    <Label className="fw-semibold">Upload Files</Label>
                    <Input
                        type="file"
                        innerRef={fileInputRef}
                        multiple
                        onChange={handleFileChange}
                    />
                    {form.files?.length > 0 && (
                        <div className="mt-2">
                            {form.files.map((file, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginBottom: "5px"
                                    }}
                                >
                                    <span>{file.name}</span>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            const updatedFiles = form.files.filter((_, i) => i !== index);
                                            setForm({ ...form, files: updatedFiles });

                                            if (fileInputRef.current) {
                                                if (updatedFiles.length === 0) {
                                                    fileInputRef.current.value = "";
                                                } else {
                                                    const dataTransfer = new DataTransfer();
                                                    updatedFiles.forEach((file) => dataTransfer.items.add(file));
                                                    fileInputRef.current.files = dataTransfer.files;
                                                }
                                            }
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Col>


                {
                    canSubmit && (
                        <Col md={12} className="text-start">

                            <div id="submitTicketWrapper" style={{ display: "inline-block" }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4"
                                    disabled={loader || !isFormValid()}
                                >
                                    {loader ? (
                                        <Spinner size="sm" color="light" />
                                    ) : (
                                        "Submit Ticket"
                                    )}
                                </button>
                            </div>

                            {!isFormValid() && (
                                <UncontrolledTooltip placement="top" target="submitTicketWrapper">
                                    Please fill required fields
                                </UncontrolledTooltip>
                            )}

                        </Col>)
                }
            </Row>


        </Form>
    );
};

export default TicketForm;


