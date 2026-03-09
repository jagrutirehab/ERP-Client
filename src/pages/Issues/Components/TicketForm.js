import React from "react";
import { Form, Input, Label, Row, Col, Spinner } from "reactstrap";
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
    loader
}) => {
    return (
        <Form onSubmit={handleSubmit}>
            <Row className="g-4">

                {/* ISSUE TYPE */}
                <Col md={6}>
                    <Label className="fw-semibold">Issue Type</Label>
                    <Input
                        type="select"
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                    >
                        <option value="TECH">TECH</option>
                        <option value="PURCHASE">PURCHASE</option>
                        <option value="REVIEW_SUBMISSION">REVIEW SUBMISSION</option>
                    </Input>
                </Col>

                {/* CENTER */}
                <Col md={6}>
                    <Label className="fw-semibold">Center</Label>
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
                    <Label className="fw-semibold">Requested From</Label>
                    <Select
                        placeholder="Search employee..."
                        options={employees}
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
                        <Label className="fw-semibold">Description</Label>
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
                            <Label className="fw-semibold">Item Name</Label>
                            <Input
                                name="itemName"
                                value={form.itemName}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Label className="fw-semibold">Item Quantity</Label>
                            <Input
                                type="number"
                                name="itemQty"
                                value={form.itemQty}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={12}>
                            <Label className="fw-semibold">Comment</Label>
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
                            <Label className="fw-semibold">Responsible Reviewer</Label>
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
                            <Label className="fw-semibold">Review Taken From</Label>
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
                    <Label className="fw-semibold">Upload Files</Label>
                    <Input type="file" multiple onChange={handleFileChange} />
                </Col>

                <Col md={12} className="text-start">
                    <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={loader}
                    >
                        {loader ? (
                            <Spinner size="sm" color="light" />
                        ) : (
                            "Submit Ticket"
                        )}
                    </button>
                </Col>
            </Row>


        </Form>
    );
};

export default TicketForm;