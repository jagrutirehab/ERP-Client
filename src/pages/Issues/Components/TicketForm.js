import React, { useRef } from "react";
import { Form, Input, Label, Row, Col, Spinner, UncontrolledTooltip } from "reactstrap";
import Select from "react-select";

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
}) => {
    const isFormValid = () => {

        if (!selectedCenter) return false;

        if (!form.requestedFrom) return false;

        if (issueType === "TECH" && !form.description) return false;

        if (issueType === "PURCHASE") {
            if (!form.itemName) return false;
            if (!form.itemQty) return false;
        }

        if (issueType === "REVIEW_SUBMISSION") {
            if (!form.responsibleReviewer) return false;
            if (!form.reviewTakenFrom) return false;
        }
        if (!form.files || form.files.length === 0) return false;

        return true;
    };

    const issueTypeOptions = [
        { value: "TECH", label: "TECH" },
        { value: "PURCHASE", label: "PURCHASE" },
        { value: "REVIEW_SUBMISSION", label: "REVIEW SUBMISSION" },
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
                <Col md={12}>
                    <Label className="fw-semibold">Requested For<span className="text-danger">*</span></Label>
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

                {/* FILE UPLOAD */}
                <Col md={12}>
                    <Label className="fw-semibold">Upload Files<span className="text-danger">*</span></Label>
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

                </Col>
            </Row>


        </Form>
    );
};

export default TicketForm;


