import React, { useState } from "react";
import { Card, CardBody, CardHeader, Row, Col, Spinner, Badge, Modal, ModalBody, ModalHeader } from "reactstrap";

const Field = ({ label, value }) => (
    <Col md={4} className="mb-3">
        <p className="text-muted mb-1 fw-semibold">{label}</p>
        <p className="mb-0">{value || "—"}</p>
    </Col>
);

const getFileType = (url) => {
    if (!url) return null;
    const clean = url.split("?")[0];
    const filename = clean.split("/").pop();
    const ext = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    return "other";
};

const DocPreview = ({ label, url, detail }) => {
    const [modal, setModal] = useState(false);
    const fileType = getFileType(url);

    const renderPreview = () => {
        if (fileType === "image") {
            return (
                <div
                    className="border rounded overflow-hidden position-relative"
                    style={{ height: 140, cursor: "pointer" }}
                    onClick={() => setModal(true)}
                >
                    <img
                        src={url}
                        alt={label}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: "rgba(0,0,0,0.35)", opacity: 0, transition: "opacity 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                        <i className="ri-zoom-in-line text-white fs-2" />
                    </div>
                </div>
            );
        }

        if (fileType === "pdf") {
            return (
                <div
                    className="border rounded overflow-hidden position-relative"
                    style={{ height: 140, cursor: "pointer" }}
                    onClick={() => setModal(true)}
                >
                    <iframe
                        src={url}
                        title={label}
                        width="100%"
                        height="100%"
                        style={{ border: "none", pointerEvents: "none" }}
                    />
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: "rgba(0,0,0,0.2)", opacity: 0, transition: "opacity 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                        <i className="ri-zoom-in-line text-white fs-2" />
                    </div>
                </div>
            );
        }

        return (
            <div
                className="border rounded d-flex flex-column align-items-center justify-content-center bg-light"
                style={{ height: 140 }}
            >
                <i className="ri-file-line text-secondary" style={{ fontSize: 48 }} />
                <span className="text-muted small mt-1">No Preview Available</span>
            </div>
        );
    };

    const renderModal = () => {
        if (fileType === "image") {
            return (
                <ModalBody className="text-center">
                    <img src={url} alt={label} style={{ maxWidth: "100%", maxHeight: "75vh" }} />
                </ModalBody>
            );
        }

        if (fileType === "pdf") {
            return (
                <ModalBody style={{ height: "80vh", padding: 0 }}>
                    <iframe src={url} title={label} width="100%" height="100%" style={{ border: "none" }} />
                </ModalBody>
            );
        }

        return null;
    };

    return (
        <Col md={4} className="mb-3">
            <div style={{ minHeight: 48 }}>
                <p className="text-muted mb-1 fw-semibold">{label}</p>
                {detail && <p className="text-muted small mb-1">{detail}</p>}
            </div>

            {!url ? (
                <div className="border rounded p-3 text-center text-muted bg-light" style={{ height: 140 }}>
                    No Document
                </div>
            ) : (
                <>
                    {renderPreview()}

                    <div className="mt-1 d-flex gap-2">
                        <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary w-100">
                            <i className="ri-external-link-line me-1" /> Open
                        </a>
                        <a href={url} download className="btn btn-sm btn-outline-secondary w-100">
                            <i className="ri-download-line me-1" /> Download
                        </a>
                    </div>

                    {(fileType === "image" || fileType === "pdf") && (
                        <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" centered>
                            <ModalHeader toggle={() => setModal(false)}>{label}</ModalHeader>
                            {renderModal()}
                        </Modal>
                    )}
                </>
            )}
        </Col>
    );
};

const EmployeeProfileTab = ({ data, loading }) => {
    if (loading) return <div className="text-center py-5"><Spinner /></div>;
    if (!data) return <p className="text-muted">No profile data found.</p>;

    return (
        <>
            <Card>
                <CardHeader><h5 className="mb-0">Basic Information</h5></CardHeader>
                <CardBody>
                    <Row>
                        <Field label="Employee Code" value={data.eCode} />
                        <Field label="Full Name" value={data.name} />
                        <Field label="Gender" value={data.gender} />
                        <Field label="Date of Birth" value={data.dateOfBirth} />
                        <Field label="Mobile" value={data.mobile} />
                        <Field label="Email" value={data.email} />
                        <Field label="Father's Name" value={data.father} />
                        <Field label="State" value={data.state} />
                        <Col md={4} className="mb-3">
                            <p className="text-muted mb-1 fw-semibold">Status</p>
                            <Badge color={data.status === "ACTIVE" ? "success" : "danger"}>
                                {data.status}
                            </Badge>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h5 className="mb-0">Employment Details</h5></CardHeader>
                <CardBody>
                    <Row>
                        <Field label="Designation" value={data.designation?.name} />
                        <Field label="Department" value={data.department?.department} />
                        <Field label="Position" value={data.position?.name} />
                        <Field label="Employment Type" value={data.employmentType} />
                        <Field label="Employment Status" value={data.employmentStatus} />
                        <Field label="Payroll Type" value={data.payrollType} />
                        <Field label="Joining Date" value={data.joinningDate ? new Date(data.joinningDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
                        <Field label="Monthly CTC" value={data.monthlyCTC ? `₹${data.monthlyCTC}` : "—"} />
                        <Field label="PF Applicable" value={data.pfApplicable ? "Yes" : "No"} />
                        <Field label="PF No." value={data.pfNo} />
                        <Field label="UAN No." value={data.uanNo} />
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h5 className="mb-0">Location</h5></CardHeader>
                <CardBody>
                    <Row>
                        <Field label="First Location" value={data.firstLocation?.title} />
                        <Field label="Current Location" value={data.currentLocation?.title} />
                        <Field label="Transferred From" value={data.transferredFrom?.title} />
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h5 className="mb-0">Bank Details</h5></CardHeader>
                <CardBody>
                    <Row>
                        <Field label="Bank Name" value={data.bankDetails?.bankName} />
                        <Field label="Account Name" value={data.bankDetails?.accountName} />
                        <Field label="Account No." value={data.bankDetails?.accountNo} />
                        <Field label="IFSC Code" value={data.bankDetails?.IFSCCode} />
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h5 className="mb-0">Documents</h5></CardHeader>
                <CardBody>
                    <Row>
                        <DocPreview
                            label="Aadhaar Card"
                            url={data.adhar?.url}
                            detail={data.adhar?.number ? `No: ${data.adhar.number}` : null}
                        />
                        <DocPreview
                            label="PAN Card"
                            url={data.pan?.url}
                            detail={data.pan?.number ? `No: ${data.pan.number}` : null}
                        />
                        <DocPreview
                            label="Offer Letter"
                            url={data.offerLetter}
                        />
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default EmployeeProfileTab;