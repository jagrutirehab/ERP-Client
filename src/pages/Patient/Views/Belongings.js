import { useState, useRef, useEffect, useCallback } from "react";
import { Row, Button, UncontrolledTooltip, Accordion, AccordionItem, AccordionBody, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Badge } from "reactstrap"
import AddmissionCard from "./Components/AddmissionCard"
import { connect } from "react-redux";
import PropTypes from "prop-types";
import BelongingsDate from "../Modals/BelongingsDate";
import BelongingsFormModal from "../Modals/BelongingsForm.modal";
import { uploadSignedBelonging, getPatientBelongings } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import PreviewFile from "../../../Components/Common/PreviewFile";

import { format, isValid } from "date-fns";

const formatDateTime = (isoStr) => {
    if (!isoStr) return "";
    const dt = new Date(isoStr);
    return isValid(dt) ? format(dt, "dd MMM yyyy, hh:mm a") : "";
};

const Belongings = ({ patient, admissions, addmissionsCharts }) => {
    const handleAuthError = useAuthError();
    const [dateModal, setDateModal] = useState(false);
    const [dateModal2, setDateModal2] = useState(false);
    const [formModal, setFormModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [editBelongingId, setEditBelongingId] = useState(null);
    const [printBelongingId, setPrintBelongingId] = useState(null);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const toggleModal = () => setDateModal(!dateModal);
    const toggleModal2 = () => setDateModal2(!dateModal2);
    const toggleFormModal = () => setFormModal(!formModal);

    const handleStartForm = (date) => {
        setSelectedDate(date);
        toggleFormModal();
    };

    const handleEditBelonging = (belongingId) => {
        setEditBelongingId(belongingId);
        setPrintBelongingId(null);
        setDateModal2(true);
    };

    const handlePrintBelonging = (belongingId) => {
        setPrintBelongingId(belongingId);
        setEditBelongingId(belongingId); // still pass the ID to fetch data
        setFormModal(true);
    };

    const [chartType, setChartType] = useState("");
    const [open, setOpen] = useState(addmissionsCharts?.length > 0 ? "0" : null);
    const [addmissionId, setAddmissionId] = useState(null);

    // Belongings data from API
    const [belongingsMap, setBelongingsMap] = useState({});
    const [loadingBelongings, setLoadingBelongings] = useState(false);

    // Signed copy upload state
    const [signedFile, setSignedFile] = useState(null);
    const [signedPreviewUrl, setSignedPreviewUrl] = useState(null);
    const [signedPreviewModal, setSignedPreviewModal] = useState(false);
    const [signedBelongingId, setSignedBelongingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const toggleAccordian = (id) => {
        if (open === id) {
            setOpen();
        } else {
            setOpen(id);
        }
    };

    // Fetch belongings list
    const fetchBelongings = useCallback(async () => {
        if (!patient?._id) return;
        setLoadingBelongings(true);
        try {
            const res = await getPatientBelongings(patient._id);
            const data = res?.data || [];
            // Build a map: admissionId -> belongings[]
            const map = {};
            data.forEach((group) => {
                map[group.addmission] = group.belongings || [];
            });
            setBelongingsMap(map);
        } catch (err) {
            if (!handleAuthError(err)) {
                toast.error("Failed to fetch belongings");
            }
        } finally {
            setLoadingBelongings(false);
        }
    }, [patient?._id]);

    useEffect(() => {
        fetchBelongings();
    }, [fetchBelongings]);

    const handleSignedFileSelect = (file, belongingId) => {
        if (!file) return;
        setSignedFile(file);
        setSignedBelongingId(belongingId);
        const previewUrl = URL.createObjectURL(file);
        setSignedPreviewUrl(previewUrl);
        setSignedPreviewModal(true);
    };

    const handleSignedUpload = async () => {
        if (!signedFile || !signedBelongingId) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("signedFile", signedFile);

            await uploadSignedBelonging(signedBelongingId, fd);
            toast.success("Signed copy uploaded successfully");
            setSignedPreviewModal(false);
            resetSignedState();
            // Refresh the list to show updated signedFileUrl
            fetchBelongings();
        } catch (err) {
            if (!handleAuthError(err)) {
                toast.error(err?.message || "Failed to upload signed copy");
            }
        } finally {
            setUploading(false);
        }
    };

    const resetSignedState = () => {
        if (signedPreviewUrl) URL.revokeObjectURL(signedPreviewUrl);
        setSignedFile(null);
        setSignedPreviewUrl(null);
        setSignedBelongingId(null);
    };

    return (
        <div style={{ marginTop: "4rem" }}>
            <Row className="timeline-right row-gap-5">
                {(addmissionsCharts || []).map((test, idx) => {
                    const admissionBelongings = belongingsMap[test?._id] || [];

                    return (
                        <AddmissionCard
                            key={idx}
                            id={idx}
                            data={test}
                            toggleModal={toggleModal}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    alignItems: "center",
                                }}
                            >
                                {/* Empty spacer for left side */}
                                <div style={{ flex: 1 }}></div>

                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <Button
                                        onClick={() => {
                                            setEditBelongingId(null);
                                            toggleModal2();
                                            setChartType("BELONGINGS");
                                        }}
                                        size="sm"
                                    >
                                        Create New Form
                                    </Button>
                                </div>

                                <div
                                    className="d-flex align-items-center"
                                    style={{ flex: 1, justifyContent: "flex-end" }}
                                >
                                    <UncontrolledTooltip
                                        placement="bottom"
                                        target={`expand-test-${idx}`}
                                    >
                                        Expand/Collapse
                                    </UncontrolledTooltip>
                                    <Button
                                        id={`expand-test-${idx}`}
                                        onClick={() => {
                                            toggleAccordian(idx.toString());
                                            setAddmissionId(test?._id);
                                        }}
                                        size="sm"
                                        outline
                                    >
                                        <i
                                            className={`${open === idx.toString()
                                                ? "ri-arrow-up-s-line"
                                                : "ri-arrow-down-s-line"
                                                } fs-6`}
                                        ></i>
                                    </Button>
                                </div>
                            </div>
                            <Accordion
                                className="timeline-date w-100"
                                open={open}
                                toggle={toggleAccordian}
                            >
                                <AccordionItem className="patient-accordion-item">
                                    <AccordionBody className="patient-accordion border-0"
                                        accordionId={idx.toString()}>
                                        {loadingBelongings ? (
                                            <div className="text-center py-3">
                                                <Spinner size="sm" color="primary" className="me-2" />
                                                <span className="text-muted">Loading belongings...</span>
                                            </div>
                                        ) : admissionBelongings.length === 0 ? (
                                            <div className="text-center py-3 text-muted">
                                                No existing belongings forms found for this admission
                                            </div>
                                        ) : (
                                            <div className="py-2">
                                                {admissionBelongings.map((belonging, bIdx) => (
                                                    <div
                                                        key={belonging._id}
                                                        className="d-flex flex-wrap justify-content-between align-items-center border rounded px-3 py-2 mb-2 bg-white gap-3"
                                                    >
                                                        <div className="flex-grow-1">
                                                            <strong className="me-2">
                                                                Belongings Form #{admissionBelongings.length - bIdx}
                                                            </strong>
                                                            <small className="text-muted">
                                                                {formatDateTime(belonging.date)}
                                                            </small>
                                                            {(() => {
                                                                const signedFiles = belonging.signedFiles || (belonging.signedFileUrl ? [belonging.signedFileUrl] : []);
                                                                const isSigned = signedFiles.length > 0;
                                                                return (
                                                                    <>
                                                                        {isSigned && (
                                                                            <Badge color="success" className="ms-2" pill>
                                                                                <i className="ri-check-line me-1"></i>Signed {signedFiles.length > 1 ? `(${signedFiles.length})` : ""}
                                                                            </Badge>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-2 align-items-center">
                                                            {(() => {
                                                                const signedFiles = belonging.signedFiles || (belonging.signedFileUrl ? [belonging.signedFileUrl] : []);
                                                                const isSigned = signedFiles.length > 0;
                                                                return (
                                                                    <>
                                                                <Button
                                                                    color="light"
                                                                    size="sm"
                                                                    className="btn-icon p-1"
                                                                    title="Edit"
                                                                    onClick={() => handleEditBelonging(belonging._id)}
                                                                >
                                                                    <i className="ri-edit-line fs-5 text-primary"></i>
                                                                </Button>
                                                                        <Button
                                                                            color="info"
                                                                            className="text-white"
                                                                            size="sm"
                                                                            onClick={() => handlePrintBelonging(belonging._id)}
                                                                        >
                                                                            <i className="ri-file-search-line me-1"></i>
                                                                            View Unsigned Copy
                                                                        </Button>

                                                                        {signedFiles.map((url, idx) => (
                                                                            <Button
                                                                                key={idx}
                                                                                color="success"
                                                                                size="sm"
                                                                                className="text-white"
                                                                                onClick={() => {
                                                                                    setPreviewFile({
                                                                                        url,
                                                                                        originalName: `Signed Belongings Copy ${idx + 1}`
                                                                                    });
                                                                                    setPreviewOpen(true);
                                                                                }}
                                                                            >
                                                                                <i className="ri-eye-line me-1"></i>
                                                                                View Signed Copy {signedFiles.length > 1 ? idx + 1 : ""}
                                                                            </Button>
                                                                        ))}
                                                                        <Button
                                                                            color="primary"
                                                                            className="text-white"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setSignedBelongingId(belonging._id);
                                                                                fileInputRef.current?.click();
                                                                            }}
                                                                        >
                                                                            <i className="ri-upload-2-line me-1"></i>
                                                                            {isSigned ? "Upload Another Copy" : "Upload Signed Copy"}
                                                                        </Button>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </AccordionBody>
                                </AccordionItem>
                            </Accordion>
                        </AddmissionCard>
                    );
                })}
            </Row>

            {/* Hidden file input for signed copy */}
            <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*,.pdf"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && signedBelongingId) {
                        handleSignedFileSelect(file, signedBelongingId);
                    }
                    e.target.value = "";
                }}
            />

            <BelongingsDate onStartForm={handleStartForm} chartType={chartType} isOpen={dateModal2} toggle={toggleModal2} />
            <BelongingsFormModal
                isOpen={formModal}
                toggle={() => {
                    toggleFormModal();
                    setEditBelongingId(null);
                    setPrintBelongingId(null);
                }}
                date={selectedDate}
                patient={patient}
                addmissionId={addmissionId}
                editBelongingId={editBelongingId}
                printMode={!!printBelongingId}
                onSaved={fetchBelongings}
            />

            {/* Signed Copy Preview Modal */}
            <Modal isOpen={signedPreviewModal} toggle={() => { setSignedPreviewModal(false); resetSignedState(); }} centered size="lg">
                <ModalHeader toggle={() => { setSignedPreviewModal(false); resetSignedState(); }}>
                    Preview Signed Copy
                </ModalHeader>
                <ModalBody className="text-center">
                    {signedPreviewUrl && signedFile?.type?.startsWith("image/") ? (
                        <img
                            src={signedPreviewUrl}
                            alt="Signed Copy Preview"
                            style={{ maxWidth: "100%", maxHeight: 500, objectFit: "contain", borderRadius: 8 }}
                        />
                    ) : signedPreviewUrl && signedFile?.type === "application/pdf" ? (
                        <iframe
                            src={signedPreviewUrl}
                            title="Signed Copy Preview"
                            style={{ width: "100%", height: 500, border: "none", borderRadius: 8 }}
                        />
                    ) : (
                        <div className="py-4 text-muted">
                            <i className="ri-file-line fs-1 d-block mb-2"></i>
                            <strong>{signedFile?.name}</strong>
                            <br />
                            <small>({(signedFile?.size / 1024).toFixed(1)} KB)</small>
                        </div>
                    )}
                    {signedFile && (
                        <p className="mt-3 mb-0 text-muted">
                            <small><strong>File:</strong> {signedFile.name} ({(signedFile.size / 1024).toFixed(1)} KB)</small>
                        </p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" outline onClick={() => { setSignedPreviewModal(false); resetSignedState(); }}>
                        Cancel
                    </Button>
                    <Button color="success" className="text-white" disabled={uploading} onClick={handleSignedUpload}>
                        {uploading ? (
                            <><Spinner size="sm" className="me-1" /> Uploading...</>
                        ) : (
                            <><i className="ri-upload-2-line me-1"></i> Upload</>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>

            <PreviewFile
                title={"Signed Copy Preview"}
                file={previewFile}
                isOpen={previewOpen}
                toggle={() => {
                    setPreviewOpen(false);
                    setPreviewFile(null);
                }}
            />
        </div>
    )
};

Belongings.propTypes = {
    patient: PropTypes.object,
    addmissionsCharts: PropTypes.array,
};

const mapStateToProps = (state) => ({
    chartDate: state.Chart.chartDate,
    patient: state.Patient.patient,
    addmissionsCharts: state.Chart.data,
    doctors: state.User?.doctor,
    psychologists: state.User?.counsellors,
    admissions: state.Chart.data,
    charts: state.Chart.charts,
})

export default connect(mapStateToProps)(Belongings);